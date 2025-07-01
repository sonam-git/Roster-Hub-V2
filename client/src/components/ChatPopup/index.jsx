// src/components/ChatPopup.jsx

import  { useState, useEffect, useRef, useContext } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client';
import { Link } from 'react-router-dom';
import { QUERY_PROFILES, GET_CHAT_BY_USER } from '../../utils/queries';
import { CREATE_CHAT, DELETE_CONVERSATION } from '../../utils/mutations';
import { CHAT_SUBSCRIPTION } from '../../utils/subscription';
import ChatMessage from '../ChatMessage';
import { FaPaperPlane } from 'react-icons/fa';
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import chatBox from "../../assets/images/iconizer-message.png";
import { ThemeContext } from "../ThemeContext";
import Auth from "../../utils/auth";
import { formatDate } from '../../utils/MessageUtils';
import Modal from '../Modal';
import { MARK_CHAT_AS_SEEN } from '../../utils/markAsSeenMutation';
import { CHAT_SEEN_SUBSCRIPTION } from '../../utils/chatSeenSubscription';
import { ONLINE_STATUS_CHANGED_SUBSCRIPTION } from '../../utils/onlineStatusSubscription';

const ChatPopup = ({ currentUser }) => {
  const { isDarkMode } = useContext(ThemeContext);
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
  const { data: profilesData } = useQuery(QUERY_PROFILES, {
    skip: !isLoggedIn,
    onCompleted: data => {
      // Only set profiles if data?.profiles is an array
      if (Array.isArray(data?.profiles)) {
        setProfiles(data.profiles);
      } else {
        setProfiles([]);
      }
    }
  });

  // 2) Load chat for selectedUser (only when we have an ID)
  const { loading: chatLoading, refetch: refetchChat } = useQuery(GET_CHAT_BY_USER, {
    skip: !isLoggedIn || !selectedUserId,
    variables: { to: selectedUserId },
    fetchPolicy: "network-only", // Always fetch latest data from server
    onCompleted: data => {
      setMessages(data.getChatByUser);
      setNotifications(prev => ({ ...prev, [selectedUserId]: 0 }));
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
      }

      // Bump badge for others (only if not from me)
      if (!isFromMe && from._id !== selectedUserId) {
        setNotifications(prev => ({
          ...prev,
          [from._id]: (prev[from._id] || 0) + 1,
        }));
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

  // Subscribe to online status changes for all users in the list
  useEffect(() => {
    if (!profiles.length) return;
    const subscriptions = profiles.map(user =>
      user._id !== userId
        ? client.subscribe({
            query: ONLINE_STATUS_CHANGED_SUBSCRIPTION,
            variables: { profileId: user._id },
          }).subscribe({
            next({ data }) {
              if (data?.onlineStatusChanged) {
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
        : null
    );
    return () => {
      subscriptions.forEach(sub => sub && sub.unsubscribe());
    };
  }, [profiles, userId, client]);

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
    if (isLoggedIn && selectedUserId) {
      markChatAsSeen({ variables: { userId: selectedUserId } }).then(() => {
        refetchChat({ to: selectedUserId, fetchPolicy: 'network-only' }).then(result => {
          setMessages(result.data.getChatByUser || []);
          setNotifications(prev => ({ ...prev, [selectedUserId]: 0 }));
          // Debug: log messages to check seen status after marking as seen
          console.log('Chat messages after markChatAsSeen:', result.data.getChatByUser);
        });
      });
    }
  }, [selectedUserId, isLoggedIn, markChatAsSeen, refetchChat]);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for chat updates every 2 seconds for real-time seen status
  useEffect(() => {
    if (isLoggedIn && selectedUserId) {
      const interval = setInterval(() => {
        refetchChat({ to: selectedUserId, fetchPolicy: 'network-only' }).then(result => {
          setMessages(result.data.getChatByUser || []);
          setNotifications(prev => ({ ...prev, [selectedUserId]: 0 }));
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, selectedUserId, refetchChat]);

  const handleUserSelect = user => setSelectedUser(user);

  const handleSend = async () => {
    if (!text.trim()) {
      setErrorMessage("Please write a message.");
      return setTimeout(() => setErrorMessage(""), 2000);
    }
    if (!selectedUserId) {
      setErrorMessage("Select a user first.");
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
        variables: { from: userId, to: selectedUserId, content: text },
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
    try {
      await deleteConversation({ variables: { userId: selectedUserId } });
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

  return (
    <div className="fixed bottom-0 right-2 w-80">
      {/* Header */}
      <div
        className={`flex items-center justify-between p-2 rounded-t-lg cursor-pointer ${
          isDarkMode ? 'bg-gray-700 text-white' : 'bg-green-800 text-white'
        }`}
        onClick={() => setChatPopupOpen(o => !o)}
      >
        <span className="flex items-center gap-2">
          <img src={chatBox} alt="Chat" className="h-6 w-6 rounded-full" />
          ChatBox
          {!chatPopupOpen && totalNotifications > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2">
              {totalNotifications}
            </span>
          )}
        </span>
        <span>{chatPopupOpen ? '▼' : '▲'}</span>
      </div>

      {/* Body */}
      {chatPopupOpen && (
        <div className={`flex flex-col border-x border-b rounded-b-lg overflow-hidden ${
          isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
        }`}>
          {/* Not logged in */}
          {!isLoggedIn && (
            <div className="p-4 text-center">
              <p>
                Please <Link className="text-blue-500 underline" to="/login">login</Link> to chat.
              </p>
            </div>
          )}

          {/* Players List */}
          {isLoggedIn && !selectedUserId && (
            <div className="p-2 overflow-y-auto flex-1">
              <h3 className="font-semibold mb-2">Players List</h3>
              {profiles
                .filter(u => u._id !== userId) // Exclude logged-in user from player list
                .map(user => (
                  <div
                    key={user._id}
                    role="button"
                    tabIndex={0}
                    onClick={e => { e.stopPropagation(); handleUserSelect(user); }}
                    onKeyPress={e => e.key === 'Enter' && handleUserSelect(user)}
                    className={`flex items-center p-1 mb-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      selectedUserId === user._id ? 'bg-gray-200' : ''
                    }`}
                  >
                    <img
                      src={user.profilePic || ProfileAvatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="flex-1 flex items-center gap-2">
                      {user.name}
                      {user.online ? (
                        <>
                          <span title="Online" className="inline-block w-2 h-2 rounded-full bg-green-500 ml-1"></span>
                          <span className="text-green-600 text-xs font-semibold ml-1">Online</span>
                        </>
                      ) : (
                        <span className="flex items-center gap-1 ml-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-gray-400" title="Offline"></span>
                          <span className="text-gray-500 text-xs font-semibold">Offline</span>
                        </span>
                      )}
                    </span>
                    {notifications[user._id] > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2">
                        {notifications[user._id]}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Chat View */}
          {isLoggedIn && selectedUserId && (
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between p-2 border-b">
                <div className="flex items-center">
                  <img
                    src={selectedUser.profilePic || ProfileAvatar}
                    alt={selectedUser.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="font-semibold flex items-center gap-1">
                    {selectedUser.name}
                    {selectedUser.online && (
                      <span title="Online" className="inline-block w-2 h-2 rounded-full bg-green-500 ml-1"></span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Delete icon */}
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="text-xl text-gray-500 hover:text-red-600 p-1"
                    title="Delete conversation"
                  >
                       <FaTrash />
                  </button>
                  {/* Close icon */}
                  <button onClick={() => setSelectedUser(null)} className="text-2xl text-red-600 hover:text-red-800 p-1">×</button>
                </div>
              </div>
              <div
                className="flex-1 overflow-y-auto p-2 space-y-2"
                style={{ maxHeight: 'calc(100vh - 240px)' }}
              >
                {chatLoading ? (
                  <p>Loading...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No conversation history yet, start your conversation.
                  </p>
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
                        <div className="text-center text-xs text-gray-400 my-2">{date}</div>
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
            </div>
          )}

          {/* Input & Send */}
          <div className="p-2 border-t flex items-center gap-2">
            <textarea
              rows={2}
              value={text}
              onChange={e => { setText(e.target.value); setErrorMessage(""); }}
              className="flex-1 p-2 border rounded-lg resize-none dark:text-black"
              placeholder={
                isLoggedIn
                  ? (selectedUserId ? "Type a message..." : "Select a user to chat")
                  : "Log in to chat"
              }
              disabled={!isLoggedIn || !selectedUserId}
            />
            <button
              onClick={handleSend}
              className={`p-2 rounded-lg ${
                isLoggedIn && selectedUserId
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isLoggedIn || !selectedUserId}
            >
              <FaPaperPlane />
            </button>
          </div>

          {errorMessage && <p className="text-red-500 p-2">{errorMessage}</p>}
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal showModal={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Delete Conversation</h2>
            <p>Are you sure you want to delete conversation history?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-400 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={handleDeleteConversation}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ChatPopup;
