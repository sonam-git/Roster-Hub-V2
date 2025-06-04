/* *************  Chat Related Component **********/

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { QUERY_PROFILES, GET_CHAT_BY_USER } from '../../utils/queries';
import { CREATE_CHAT } from '../../utils/mutations';
import { CHAT_SUBSCRIPTION } from '../../utils/subscription';
import ChatMessage from '../ChatMessage';
import { FaPaperPlane } from 'react-icons/fa';
import ProfileAvatar from "../../assets/images/profile-avatar.png";

const ChatPopup = ({ currentUser, isDarkMode }) => {
  const [chatPopupOpen, setChatPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const chatEndRef = useRef(null);

  const userId = currentUser._id;
  const selectedUserId = selectedUser?._id;

  const { data: profilesData } = useQuery(QUERY_PROFILES);

  const { loading, refetch } = useQuery(GET_CHAT_BY_USER, {
    variables: { to: selectedUserId },
    skip: !selectedUserId,
    onCompleted: (data) => {
      setMessages(data.getChatByUser);
      // Clear notifications when user is selected and messages are loaded
      if (selectedUserId) {
        setNotifications((prevNotifications) => ({
          ...prevNotifications,
          [selectedUserId]: 0,
        }));
      }
    },
  });

  const [createChat] = useMutation(CREATE_CHAT);

  useSubscription(CHAT_SUBSCRIPTION, {
    onData: ({ data }) => {
      const chatData = data?.data?.chatCreated;
      if (chatData && (chatData.to._id === userId || chatData.from._id === userId)) {
        setMessages((prevMessages) => [...prevMessages, chatData]);
        if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        if (chatData.from._id !== userId) {
          setNotifications((prevNotifications) => ({
            ...prevNotifications,
            [chatData.from._id]: (prevNotifications[chatData.from._id] || 0) + 1,
          }));
        }
      }
    },
  });

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedUserId) {
      refetch();
    }
  }, [selectedUserId, refetch]);

  const handleSendMessage = async () => {
    if (!text.trim()) {
      setErrorMessage('Please write a message first to send.');
      setTimeout(() => {
        setErrorMessage('');
      }, 2000);
      return;
    }

    try {
      await createChat({
        variables: {
          from: userId,
          to: selectedUser._id,
          content: text,
        },
      });
      setText('');
      setErrorMessage('');
      refetch();
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setNotifications((prevNotifications) => ({
      ...prevNotifications,
      [user._id]: 0,
    }));
    // Immediately fetch the chat messages for the selected user
    refetch({ to: user._id });
  };

  // calculate chat count
  const totalNotifications = Object.values(notifications).reduce(
    (acc, count) => acc + count,
    0
  );
  

  return (
    <div className={`fixed bottom-0 right-2 w-80 bg-white border border-gray-300 rounded-t-lg shadow-lg`}>
      <div
        className={`font-semibold ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-600 text-white'} p-2 cursor-pointer rounded-t-lg flex justify-between items-center`}
        onClick={() => setChatPopupOpen(!chatPopupOpen)}
      >
       <span className="flex items-center gap-2">
  Chat Box
  {totalNotifications > 0 && (
    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
      {totalNotifications}
    </span>
  )}
</span>

        <span>{chatPopupOpen ? '▼' : '▲'}</span>
      </div>
      {chatPopupOpen && (
        <div className={`flex flex-col h-86 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
          {!selectedUser ? (
            <div className="flex-1 border-b border-gray-300 p-2 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-2">Players List</h3>
              {profilesData?.profiles
                .filter((user) => user._id !== userId)
                .map((user) => (
                  <div
                    key={user._id}
                    className={`p-1 cursor-pointer hover:bg-gray-100 dark:hover:text-black flex items-center ${
                      selectedUser?._id === user._id ? 'bg-gray-200' : ''
                    }`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <img
                      src={user.profilePic || ProfileAvatar}
                      alt="avatar"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span>{user.name}</span>
                    {notifications[user._id] > 0 && (
                      <span className="ml-2 bg-red-500 text-white rounded-full px-2 text-xs">
                        {notifications[user._id]}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between font-semibold items-center p-2 border-b border-gray-300">
                <img
                  src={selectedUser.profilePic || ProfileAvatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>{selectedUser.name}</span>
                <button className="text-red-500" onClick={() => setSelectedUser(null)}>
                  Close
                </button>
              </div>
              <ul className="flex-1 overflow-y-auto p-2" style={{ maxHeight: '300px' }}>
                {loading ? (
                  <p>Loading chat...</p>
                ) : (
                  messages.map((chat) => (
                    <ChatMessage
                      key={chat.id}
                      chat={chat}
                      userId={userId}
                      selectedUserId={selectedUserId}
                      currentUser={currentUser}
                      isDarkMode={isDarkMode}
                    />
                  ))
                )}
                <div ref={chatEndRef} />
              </ul>
              {errorMessage && <div className="text-red-500 p-2">{errorMessage}</div>}
              <div className="border-t border-gray-300 p-2 flex">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 dark:bg-gray-800 rounded-lg mr-2 resize-none dark:text-white"
                  placeholder="Type your message..."
                  rows="3"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPopup;
