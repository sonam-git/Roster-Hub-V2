// src/components/ChatPopup.jsx

import React, { useState, useEffect, useRef, useContext } from 'react';
import { FaTrash, FaPaperPlane, FaComments, FaChevronDown, FaChevronUp, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client';
import { Link } from 'react-router-dom';
import { QUERY_PROFILES, GET_CHAT_BY_USER } from '../../utils/queries';
import { CREATE_CHAT, DELETE_CONVERSATION } from '../../utils/mutations';
import { CHAT_SUBSCRIPTION } from '../../utils/subscription';
import ChatMessage from '../ChatMessage';
import ChatPortal from '../ChatPortal';
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import { ThemeContext } from "../ThemeContext";
import { useOrganization } from "../../contexts/OrganizationContext";
import Auth from "../../utils/auth";
import { formatDate } from '../../utils/MessageUtils';
import Modal from '../Modal';
import { MARK_CHAT_AS_SEEN } from '../../utils/markAsSeenMutation';
import { CHAT_SEEN_SUBSCRIPTION } from '../../utils/chatSeenSubscription';
import { ONLINE_STATUS_CHANGED_SUBSCRIPTION } from '../../utils/onlineStatusSubscription';

const ChatPopup = ({ currentUser }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { currentOrganization } = useOrganization();
  const isLoggedIn = Auth.loggedIn();
  const userId = currentUser?._id || null;

  const [chatPopupOpen, setChatPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser]   = useState(null);
  const [text, setText]                   = useState("");
  const [messages, setMessages]           = useState([]);
  const [notifications, setNotifications] = useState({});
  const [errorMessage, setErrorMessage]   = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const chatEndRef = useRef(null);
  const client = useApolloClient();

  // Safe user ID
  const selectedUserId = selectedUser?._id || null;

  const [profiles, setProfiles] = useState([]);

  // 1) Load player list if logged in
  useQuery(QUERY_PROFILES, {
    skip: !isLoggedIn || !currentOrganization,
    variables: { organizationId: currentOrganization?._id },
    onCompleted: data => {
      if (Array.isArray(data?.profiles)) {
        setProfiles(data.profiles);
      } else {
        setProfiles([]);
      }
    }
  });

  // Periodically refetch profiles to keep online status fresh
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      client.refetchQueries({ include: [QUERY_PROFILES] });
    }, 15000); // every 15 seconds
    return () => clearInterval(interval);
  }, [isLoggedIn, client]);

  // Subscribe to online status for all users, including logged-in user
  useEffect(() => {
    if (!profiles.length) return;
    const subscriptions = profiles.map(user =>
      client.subscribe({
        query: ONLINE_STATUS_CHANGED_SUBSCRIPTION,
        variables: { profileId: user._id },
      }).subscribe({
        next({ data }) {
          if (data?.onlineStatusChanged) {
            // Removed console.log to prevent infinite rendering messages
            setProfiles(prev =>
              prev.map(p =>
                p._id === data.onlineStatusChanged._id
                  ? { ...p, online: data.onlineStatusChanged.online }
                  : p
              )
            );
          }
        },
      })
    );
    return () => {
      subscriptions.forEach(sub => sub && sub.unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles.length, client]); // Only re-subscribe when profile count changes, not on every profile update

  // 2) Load chat for selectedUser (only when we have an ID)
  const { loading: chatLoading, refetch: refetchChat } = useQuery(GET_CHAT_BY_USER, {
    skip: !isLoggedIn || !selectedUserId,
    variables: { to: selectedUserId },
    fetchPolicy: "network-only", // Always fetch latest data from server
    onCompleted: data => {
      setMessages(data.getChatByUser);
      // Don't auto-clear notifications here, let user interaction control it
      console.log('💬 Chat loaded for user:', selectedUser?.name);
    },
  });

  const [createChat] = useMutation(CREATE_CHAT);
  const [deleteConversation] = useMutation(DELETE_CONVERSATION);
  const [markChatAsSeen] = useMutation(MARK_CHAT_AS_SEEN);

  // 3) Subscribe to new messages
  useSubscription(CHAT_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (!isLoggedIn) return;
      const chatData = data.data.chatCreated;
      if (!chatData) return;
      const { from, to } = chatData;
      const isFromMe = from._id === userId;

      console.log('🔔 New message received:', {
        from: from.name,
        to: to.name,
        isFromMe,
        selectedUserId,
        chatPopupOpen
      });

      // Only remove optimistic messages if the real message is from the current user
      if (isFromMe) {
        setMessages(prev => prev.filter(m => !m.id?.startsWith('optimistic-')));
      }

      // Append to open conversation
      if (
        selectedUserId &&
        ((from._id === selectedUserId && to._id === userId) ||
         (to._id === selectedUserId && from._id === userId))
      ) {
        setMessages(prev => [...prev, chatData]);
        // Only clear notification if user is actively viewing the chat and it's open
        if (!isFromMe && chatPopupOpen) {
          console.log('🔕 Clearing notification for active chat:', from.name);
          setNotifications(prev => ({ ...prev, [from._id]: 0 }));
        }
      }

      // Bump badge for others (if not from me and either no chat selected or different user)
      if (!isFromMe && from._id !== selectedUserId) {
        console.log('📈 Adding notification for user:', from.name);
        setNotifications(prev => {
          const newNotifications = {
            ...prev,
            [from._id]: (prev[from._id] || 0) + 1,
          };
          console.log('📱 Updated notifications:', newNotifications);
          // Force immediate localStorage update for real-time sync
          localStorage.setItem('chat_notifications', JSON.stringify(newNotifications));
          return newNotifications;
        });
      }

      // Also bump badge if chat is closed (even for current selected user)
      if (!isFromMe && from._id === selectedUserId && !chatPopupOpen) {
        console.log('📈 Adding notification for selected user (chat closed):', from.name);
        setNotifications(prev => {
          const newNotifications = {
            ...prev,
            [from._id]: (prev[from._id] || 0) + 1,
          };
          console.log('📱 Updated notifications:', newNotifications);
          // Force immediate localStorage update for real-time sync
          localStorage.setItem('chat_notifications', JSON.stringify(newNotifications));
          return newNotifications;
        });
      }

      // Scroll
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    },
  });

  // 4) Subscribe to seen status updates for real-time UI
  useSubscription(CHAT_SEEN_SUBSCRIPTION, {
    variables: { chatId: messages.length > 0 ? messages[messages.length - 1].id : '', to: userId },
    skip: !isLoggedIn || !selectedUserId || messages.length === 0,
    onData: ({ data }) => {
      const seenChat = data.data.chatSeen;
      if (!seenChat) return;
      // Update the seen status for the relevant message
      setMessages(prevMsgs => prevMsgs.map(m =>
        m.id === seenChat.id ? { ...m, seen: seenChat.seen } : m
      ));
    },
  });

  // Refetch chat when selectedUserId changes
  useEffect(() => {
    if (isLoggedIn && selectedUserId) {
      refetchChat({ to: selectedUserId }).then(result => {
        // Remove any optimistic messages after refetch
        setMessages(result.data.getChatByUser || []);
        // Debug: log messages to check seen status
        console.log('Chat messages after refetch:', result.data.getChatByUser);
      });
    }
  }, [selectedUserId, refetchChat, isLoggedIn]);

  // Mark as seen when chat is opened
  useEffect(() => {
    if (isLoggedIn && selectedUserId && currentOrganization) {
      markChatAsSeen({ 
        variables: { 
          userId: selectedUserId,
          organizationId: currentOrganization._id
        } 
      }).then(() => {
        refetchChat({ to: selectedUserId, fetchPolicy: 'network-only' }).then(result => {
          setMessages(result.data.getChatByUser || []);
          // Only clear notification if chat is actually open
          if (chatPopupOpen) {
            console.log('🔕 Marked as seen, clearing notifications for:', selectedUser?.name);
            setNotifications(prev => ({ ...prev, [selectedUserId]: 0 }));
          }
          // Debug: log messages to check seen status after marking as seen
          // console.log('Chat messages after markChatAsSeen:', result.data.getChatByUser);
        });
      });
    }
  }, [selectedUserId, isLoggedIn, currentOrganization, markChatAsSeen, refetchChat, chatPopupOpen, selectedUser?.name]);

  // Refined: Mark as seen only when chat popup is open and user is viewing the conversation
  useEffect(() => {
    if (
      isLoggedIn &&
      selectedUserId &&
      chatPopupOpen &&
      messages.length > 0 &&
      currentOrganization
    ) {
      const lastMsg = messages[messages.length - 1];
      // Only mark as seen if the last message is from the other user and not already seen
      if (lastMsg.from._id === selectedUserId && !lastMsg.seen) {
        const timer = setTimeout(() => {
          markChatAsSeen({ 
            variables: { 
              userId: selectedUserId,
              organizationId: currentOrganization._id
            } 
          }).then(() => {
            refetchChat({ to: selectedUserId, fetchPolicy: 'network-only' });
          });
        }, 1500); // 1.5 seconds delay
        return () => clearTimeout(timer);
      }
    }
  }, [messages, isLoggedIn, selectedUserId, chatPopupOpen, currentOrganization, markChatAsSeen, refetchChat]);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chat_notifications');
    if (saved) {
      try {
        const parsedNotifications = JSON.parse(saved);
        setNotifications(parsedNotifications);
        console.log('📱 Loaded notifications from localStorage:', parsedNotifications);
      } catch (error) {
        console.error('❌ Error parsing notifications from localStorage:', error);
        // Reset to empty object if parsing fails
        setNotifications({});
        localStorage.removeItem('chat_notifications');
      }
    } else {
      console.log('📱 No saved notifications found, starting fresh');
      setNotifications({});
    }
  }, []);

  // Persist notifications in localStorage
  useEffect(() => {
    if (Object.keys(notifications).length >= 0) { // Changed from > 0 to >= 0 to handle clearing
      localStorage.setItem('chat_notifications', JSON.stringify(notifications));
      console.log('💾 Saved notifications to localStorage:', notifications);
    }
  }, [notifications]);

  // Clear notifications when chat popup is opened and user is selected
  useEffect(() => {
    if (chatPopupOpen && selectedUserId) {
      console.log('🔕 Chat opened, clearing notifications for selected user:', selectedUser?.name);
      setNotifications(prev => ({ ...prev, [selectedUserId]: 0 }));
    }
  }, [chatPopupOpen, selectedUserId, selectedUser?.name]);

  const handleUserSelect = user => {
    console.log('👤 User selected:', user.name);
    setSelectedUser(user);
    // Only clear notifications when actually opening the chat
    if (chatPopupOpen) {
      console.log('🔕 Clearing notifications for:', user.name);
      setNotifications(prev => {
        const updated = { ...prev, [user._id]: 0 };
        localStorage.setItem('chat_notifications', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleSend = async () => {
    if (!text.trim()) {
      setErrorMessage("Please write a message.");
      return setTimeout(() => setErrorMessage(""), 2000);
    }
    if (!selectedUserId) {
      setErrorMessage("Select a user first.");
      return setTimeout(() => setErrorMessage(""), 2000);
    }
    
    if (!currentOrganization) {
      setErrorMessage("No organization selected.");
      return setTimeout(() => setErrorMessage(""), 2000);
    }
    
    try {
      // Optimistically add the message
      const optimisticMsg = {
        id: `optimistic-${Date.now()}`,
        from: { _id: userId, profilePic: currentUser.profilePic },
        to: { _id: selectedUserId },
        content: text,
        createdAt: Date.now(),
      };
      setMessages(prev => [...prev, optimisticMsg]);
      await createChat({
        variables: { 
          from: userId, 
          to: selectedUserId, 
          content: text,
          organizationId: currentOrganization._id
        },
      });
      setText("");
      refetchChat({ to: selectedUserId });
    } catch (err) {
      console.error(err);
      setErrorMessage("Send failed.");
    }
  };

  // Add this function to handle conversation deletion
  const handleDeleteConversation = async () => {
    if (!selectedUserId) return;
    
    if (!currentOrganization) {
      setErrorMessage('No organization selected.');
      setShowDeleteModal(false);
      return;
    }
    
    try {
      await deleteConversation({ 
        variables: { 
          userId: selectedUserId,
          organizationId: currentOrganization._id
        } 
      });
      setMessages([]);
      setShowDeleteModal(false);
    } catch {
      setErrorMessage('Failed to delete conversation.');
      setShowDeleteModal(false);
    }
  };

  const totalNotifications = Object.values(notifications).reduce((a, b) => a + b, 0);
  
  // Find the last message sent by the current user
  const lastFromCurrentUserId = (() => {
    let lastId = null;
    messages.forEach(m => {
      if (m.from._id === userId) lastId = m.id;
    });
    return lastId;
  })();

  // Render chat content (used by both desktop and mobile views)
  const renderChatContent = () => (
    <>
      {/* Not logged in */}
      {!isLoggedIn && (
        <div className="flex flex-col items-center justify-center h-full p-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isDarkMode ? 'bg-gray-700' : 'bg-blue-100'
          }`}>
            <FaComments className={`text-2xl ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`} />
          </div>
          <h3 className="font-semibold mb-2">Welcome to ChatBox</h3>
          <p className="text-center text-sm opacity-75 mb-4">
            Connect with your teammates and share your thoughts
          </p>
          <Link 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200 shadow-lg"
            to="/login"
          >
            Login to Chat
          </Link>
        </div>
      )}

      {/* Players List */}
      {isLoggedIn && !selectedUserId && (
        <div className="flex flex-col h-full">
          <div className={`p-4 border-b hidden lg:block ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FaComments className="text-blue-500" />
              Team Members
            </h3>
            <p className="text-sm opacity-75 mt-1">Choose someone to start chatting</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {profiles
              .filter(u => u._id !== userId)
              .map(user => (
                <div
                  key={user._id}
                  role="button"
                  tabIndex={0}
                  onClick={e => { e.stopPropagation(); handleUserSelect(user); }}
                  onKeyPress={e => e.key === 'Enter' && handleUserSelect(user)}
                  className={`group flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode 
                      ? 'hover:bg-gray-700/50 border border-gray-200 hover:border-gray-600' 
                      : 'hover:bg-blue-50 border border-gray-400 hover:border-blue-300 hover:shadow-md'
                  } ${selectedUserId === user._id ? 'bg-blue-100 border-blue-300' : ''}`}
                >
                  <div className="relative ">
                    <img
                      src={user.profilePic || ProfileAvatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      user.online ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 ml-3 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm truncate">{user.name}</h4>
                      {notifications[user._id] > 0 && (
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center shadow-lg animate-pulse border border-white">
                          {notifications[user._id] > 9 ? '9+' : notifications[user._id]}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium ${
                        user.online 
                          ? 'text-green-600 dark:text-green-400' 
                          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {user.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            
            {profiles.filter(u => u._id !== userId).length === 0 && (
              <div className="text-center py-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <FaComments className={`text-2xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <p className="text-sm opacity-75">No team members online</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modern Chat View */}
      {isLoggedIn && selectedUserId && (
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className={`flex items-center justify-between p-4 border-b backdrop-blur-sm ${
            isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
          }`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
                }`}
                title="Back to contacts"
              >
                <FaArrowLeft className="text-sm" />
              </button>
              
              <div className="relative">
                <img
                  src={selectedUser.profilePic || ProfileAvatar}
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  selectedUser.online ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
              
              <div>
                <h4 className="font-bold text-sm">{selectedUser.name}</h4>
                <p className={`text-xs ${
                  selectedUser.online 
                    ? 'text-green-600 dark:text-green-400' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {selectedUser.online ? 'Online now' : 'Offline'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isDarkMode 
                  ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400' 
                  : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
              }`}
              title="Delete conversation"
            >
              <FaTrash className="text-sm" />
            </button>
          </div>
          
          {/* Messages Area */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${
              isDarkMode ? 'bg-gray-900/30' : 'bg-gray-50/30'
            }`}
            style={{ maxHeight: '600px' }}
          >
            {chatLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm opacity-75">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-blue-100'
                  }`}>
                    <FaComments className={`text-2xl ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`} />
                  </div>
                  <h4 className="font-semibold mb-2">Start the conversation</h4>
                  <p className="text-sm opacity-75">
                    Say hello to {selectedUser.name}
                  </p>
                </div>
              </div>
            ) : (
              // Group messages by date
              (() => {
                const groups = {};
                messages.forEach(c => {
                  let dateKey;
                  if (c.createdAt) {
                    const d = new Date(typeof c.createdAt === 'number' ? c.createdAt : Number(c.createdAt) || c.createdAt);
                    dateKey = formatDate(d);
                  } else {
                    dateKey = 'Unknown date';
                  }
                  if (!groups[dateKey]) groups[dateKey] = [];
                  groups[dateKey].push(c);
                });
                return Object.entries(groups).map(([date, msgs]) => (
                  <div key={date}>
                    <div className={`text-center text-xs font-medium py-2 my-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span className={`px-3 py-1 rounded-full ${
                        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
                      }`}>
                        {date}
                      </span>
                    </div>
                    {msgs.map((c) => (
                      <ChatMessage
                        key={c.id}
                        chat={c}
                        userId={userId}
                        currentUser={currentUser}
                        isDarkMode={isDarkMode}
                        isLastFromCurrentUser={c.id === lastFromCurrentUserId}
                      />
                    ))}
                  </div>
                ));
              })()
            )}
            <div ref={chatEndRef} />
          </div>
          
          {/* Modern Input Area */}
          <div className={`p-4 border-t backdrop-blur-sm ${
            isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
          }`}>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  rows={1}
                  value={text}
                  onChange={e => { setText(e.target.value); setErrorMessage(""); }}
                  onKeyPress={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-2xl border resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500'
                  }`}
                  placeholder="Type your message..."
                  disabled={!isLoggedIn || !selectedUserId}
                  style={{ maxHeight: '120px', minHeight: '48px' }}
                />
              </div>
              <button
                onClick={handleSend}
                className={`p-5 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                  isLoggedIn && selectedUserId && text.trim()
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105"
                    : isDarkMode 
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!isLoggedIn || !selectedUserId || !text.trim()}
                title="Send message"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
            
            {errorMessage && (
              <div className="mt-3 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Chat Icon and Popup Container - Responsive positioning */}
      <div 
        className="fixed chat-popup-container"
        style={{ 
          right: '0.5rem',
          zIndex: 9999 
        }}
      >
        {/* Use CSS to handle responsive bottom positioning */}
        <style>{`
          @media (max-width: 975px) {
            .chat-popup-container {
              bottom: 4.5rem !important; /* Above mobile bottom nav */
            }
          }
          @media (min-width: 976px) {
            .chat-popup-container {
              bottom: 1rem !important; /* Normal desktop positioning */
            }
          }
        `}</style>
        
        {/* Mobile: Compact Icon Button (visible below lg, positioned above bottom nav) */}
        <div className="block lg:hidden mb-10">
          <button
            onClick={() => setChatPopupOpen(o => !o)}
            className={`w-14 h-14 rounded-full flex items-center justify-center relative shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
            }`}
            aria-label={`Chat${totalNotifications > 0 ? ` - ${totalNotifications} new messages` : ''}`}
          >
            <FaComments className="text-2xl" />
            {/* Notification badge for mobile */}
            {totalNotifications > 0 && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[24px] h-[24px] flex items-center justify-center shadow-lg animate-pulse border-2 border-white">
                {totalNotifications > 99 ? '99+' : totalNotifications}
              </div>
            )}
          </button>
        </div>

        {/* Desktop: Full Header (visible on lg and above) */}
        <div className="hidden lg:block w-80">
          <div
            className={`flex items-center justify-between p-2 rounded-t-2xl cursor-pointer shadow-2xl backdrop-blur-sm border-t border-x transition-all duration-300 hover:shadow-lg chat-popup-header ${
              isDarkMode 
                ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700 text-white' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 text-white'
            }`}
            onClick={() => setChatPopupOpen(o => !o)}
            onKeyPress={e => e.key === 'Enter' && setChatPopupOpen(o => !o)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center relative ${
                isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
              } shadow-lg`}>
                <FaComments className="text-lg text-white" />
                {/* Primary notification badge */}
                {totalNotifications > 0 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center shadow-lg animate-pulse border-2 border-white">
                    {totalNotifications > 99 ? '99+' : totalNotifications}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">ChatBox</span>
                {totalNotifications > 0 && (
                  <span className="text-xs opacity-75">
                    {totalNotifications} new message{totalNotifications > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {/* Secondary notification badge (for emphasis) */}
              {totalNotifications > 0 && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center shadow-lg animate-pulse border border-white ml-auto">
                  {totalNotifications > 99 ? '99+' : totalNotifications}
                </div>
              )}
            </div>
            <div className="transition-transform duration-200">
              {chatPopupOpen ? <FaChevronDown className="text-sm" /> : <FaChevronUp className="text-sm" />}
            </div>
          </div>
        </div>

        {/* Chat Body - Desktop View (non-portal) */}
        {chatPopupOpen && (
          <div className="hidden lg:block">
            <div className={`flex flex-col overflow-hidden shadow-2xl backdrop-blur-sm animate-chat-popup ${
              isDarkMode 
                ? 'bg-gradient-to-b from-gray-900/95 to-gray-800/95 text-white border-gray-700' 
                : 'bg-gradient-to-b from-white/95 to-gray-50/95 text-gray-800 border-gray-200'
            } 
            border-x border-b rounded-b-2xl h-[500px] w-80
            `}
            style={{ zIndex: 10000 }}
            >
              {renderChatContent()}
            </div>
          </div>
        )}
      </div>

      {/* Chat Body - Mobile View (Portal Modal) */}
      <ChatPortal isOpen={chatPopupOpen}>
        <div 
          className="lg:hidden fixed inset-0 z-[99999] flex items-stretch animate-modal-fade-in"
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 backdrop-blur-sm"
            onClick={() => setChatPopupOpen(false)}
          />
          
          {/* Modal Content */}
          <div 
            className={`relative w-full h-full flex flex-col shadow-2xl animate-modal-slide-up ${
              isDarkMode 
                ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-white' 
                : 'bg-gradient-to-b from-white to-gray-50 text-gray-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 z-10 backdrop-blur-md" style={{
              backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: isDarkMode ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)'
            }}>
              <div className="flex-1">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FaComments className="text-blue-500" />
                  ChatBox
                </h3>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedUserId ? `Chatting with ${selectedUser?.name}` : 'Choose any team member to start chatting'}
                </p>
              </div>
              <button
                onClick={() => setChatPopupOpen(false)}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
                }`}
                aria-label="Close chat"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              {renderChatContent()}
            </div>
          </div>
        </div>
      </ChatPortal>
      
      {/* Modern Delete Confirmation Modal - Outside chat container */}
      {showDeleteModal && (
        <Modal showModal={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <div className={`p-4 rounded-2xl shadow-2xl border chat-modal-overlay  ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FaTrash className="text-red-600 text-lg" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Delete Conversation
                </h2>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete your conversation with <strong>{selectedUser?.name}</strong>? 
              All messages will be permanently removed.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:scale-105 shadow-lg"
                onClick={handleDeleteConversation}
              >
                Delete 
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ChatPopup;
