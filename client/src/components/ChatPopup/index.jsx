// src/components/ChatPopup.jsx

import React, { useState, useEffect, useRef, useContext } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { Link } from 'react-router-dom';
import { QUERY_PROFILES, GET_CHAT_BY_USER } from '../../utils/queries';
import { CREATE_CHAT } from '../../utils/mutations';
import { CHAT_SUBSCRIPTION } from '../../utils/subscription';
import ChatMessage from '../ChatMessage';
import { FaPaperPlane } from 'react-icons/fa';
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import chatBox from "../../assets/images/iconizer-message.png";
import { ThemeContext } from "../ThemeContext";
import Auth from "../../utils/auth";

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
  const chatEndRef = useRef(null);

  // Safe user ID
  const selectedUserId = selectedUser?._id || null;

  // 1) Load player list if logged in
  const { data: profilesData } = useQuery(QUERY_PROFILES, {
    skip: !isLoggedIn,
  });

  // 2) Load chat for selectedUser (only when we have an ID)
  const { loading: chatLoading, refetch: refetchChat } = useQuery(GET_CHAT_BY_USER, {
    skip: !isLoggedIn || !selectedUserId,
    variables: { to: selectedUserId },
    onCompleted: data => {
      setMessages(data.getChatByUser);
      setNotifications(prev => ({ ...prev, [selectedUserId]: 0 }));
    },
  });

  const [createChat] = useMutation(CREATE_CHAT);

  // 3) Subscribe to new messages
  useSubscription(CHAT_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (!isLoggedIn) return;
      const chatData = data.data.chatCreated;
      if (!chatData) return;
      const { from, to } = chatData;

      // Append to open conversation
      if (
        selectedUserId &&
        ((from._id === selectedUserId && to._id === userId) ||
         (to._id === selectedUserId && from._id === userId))
      ) {
        setMessages(prev => [...prev, chatData]);
      }

      // Bump badge for others
      if (from._id !== userId && from._id !== selectedUserId) {
        setNotifications(prev => ({
          ...prev,
          [from._id]: (prev[from._id] || 0) + 1,
        }));
      }

      // Scroll
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    },
  });

  // Refetch chat when selectedUserId changes
  useEffect(() => {
    if (isLoggedIn && selectedUserId) {
      refetchChat({ to: selectedUserId });
    }
  }, [selectedUserId, refetchChat, isLoggedIn]);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const totalNotifications = Object.values(notifications).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed bottom-0 right-2 w-80">
      {/* Header */}
      <div
        className={`flex items-center justify-between p-2 rounded-t-lg cursor-pointer ${
          isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-600 text-white'
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
              {profilesData?.profiles
                .filter(u => u._id !== userId)
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
                    <span className="flex-1">{user.name}</span>
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
                  <span className="font-semibold">{selectedUser.name}</span>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-2xl text-red-600 hover:text-red-800 p-1">×</button>
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
                  messages.map(c => (
                    <ChatMessage
                      key={c.id}
                      chat={c}
                      userId={userId}
                      currentUser={currentUser}
                      isDarkMode={isDarkMode}
                    />
                  ))
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
              className="flex-1 p-2 border rounded-lg resize-none"
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
    </div>
  );
};

export default ChatPopup;













// /* *************  Chat Related Component **********/

// import React, { useState, useEffect, useRef } from 'react';
// import { useQuery, useMutation, useSubscription } from '@apollo/client';
// import { QUERY_PROFILES, GET_CHAT_BY_USER } from '../../utils/queries';
// import { CREATE_CHAT } from '../../utils/mutations';
// import { CHAT_SUBSCRIPTION } from '../../utils/subscription';
// import ChatMessage from '../ChatMessage';
// import { FaPaperPlane } from 'react-icons/fa';
// import ProfileAvatar from "../../assets/images/profile-avatar.png";
// import chatBox from "../../assets/images/iconizer-message.png"; // Assuming you have a chat box icon

// const ChatPopup = ({ currentUser, isDarkMode }) => {
//   const [chatPopupOpen, setChatPopupOpen] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [text, setText] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [notifications, setNotifications] = useState({});
//   const [errorMessage, setErrorMessage] = useState('');
//   const chatEndRef = useRef(null);

//   const userId = currentUser._id;
//   const selectedUserId = selectedUser?._id;

//   const { data: profilesData } = useQuery(QUERY_PROFILES);

//   const { loading, refetch } = useQuery(GET_CHAT_BY_USER, {
//     variables: { to: selectedUserId },
//     skip: !selectedUserId,
//     onCompleted: (data) => {
//       setMessages(data.getChatByUser);
//       // Clear notifications when user is selected and messages are loaded
//       if (selectedUserId) {
//         setNotifications((prevNotifications) => ({
//           ...prevNotifications,
//           [selectedUserId]: 0,
//         }));
//       }
//     },
//   });

//   const [createChat] = useMutation(CREATE_CHAT);

//   useSubscription(CHAT_SUBSCRIPTION, {
//     onData: ({ data }) => {
//       const chatData = data?.data?.chatCreated;
//       if (chatData && (chatData.to._id === userId || chatData.from._id === userId)) {
//         setMessages((prevMessages) => [...prevMessages, chatData]);
//         if (chatEndRef.current) {
//           chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
//         }
//         if (chatData.from._id !== userId) {
//           setNotifications((prevNotifications) => ({
//             ...prevNotifications,
//             [chatData.from._id]: (prevNotifications[chatData.from._id] || 0) + 1,
//           }));
//         }
//       }
//     },
//   });

//   useEffect(() => {
//     if (chatEndRef.current) {
//       chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [messages]);

//   useEffect(() => {
//     if (selectedUserId) {
//       refetch();
//     }
//   }, [selectedUserId, refetch]);

//   const handleSendMessage = async () => {
//     if (!text.trim()) {
//       setErrorMessage('Please write a message first to send.');
//       setTimeout(() => {
//         setErrorMessage('');
//       }, 2000);
//       return;
//     }

//     try {
//       await createChat({
//         variables: {
//           from: userId,
//           to: selectedUser._id,
//           content: text,
//         },
//       });
//       setText('');
//       setErrorMessage('');
//       refetch();
//     } catch (error) {
//       console.error('Error sending message:', error.message);
//     }
//   };

//   const handleUserSelect = (user) => {
//     setSelectedUser(user);
//     setNotifications((prevNotifications) => ({
//       ...prevNotifications,
//       [user._id]: 0,
//     }));
//     // Immediately fetch the chat messages for the selected user
//     refetch({ to: user._id });
//   };

//   // calculate chat count
//   const totalNotifications = Object.values(notifications).reduce(
//     (acc, count) => acc + count,
//     0
//   );
  

//   return (
//     <div className={`fixed bottom-0 right-2 w-80 bg-white border border-gray-300 rounded-t-lg shadow-lg`}>
//       <div
//         className={`font-semibold ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-600 text-white'} p-2 cursor-pointer rounded-t-lg flex justify-between items-center`}
//         onClick={() => setChatPopupOpen(!chatPopupOpen)}
//       >
//        <span className="flex items-center gap-2">
//        <img
//             src={chatBox}
//             alt="profile"
//             className="h-6 w-6 rounded-full object-cover mr-2 "
//           /> ChatBox
//   {totalNotifications > 0 && (
//     <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
//       {totalNotifications}
//     </span>
//   )}
// </span>

//         <span>{chatPopupOpen ? '▼' : '▲'}</span>
//       </div>
//       {chatPopupOpen && (
//         <div className={`flex flex-col h-86 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
//           {!selectedUser ? (
//             <div className="flex-1 border-b border-gray-300 p-2 overflow-y-auto">
//               <h3 className="text-lg font-semibold mb-2">Players List</h3>
//               {profilesData?.profiles
//                 .filter((user) => user._id !== userId)
//                 .map((user) => (
//                   <div
//                     key={user._id}
//                     className={`p-1 cursor-pointer hover:bg-gray-100 dark:hover:text-black flex items-center ${
//                       selectedUser?._id === user._id ? 'bg-gray-200' : ''
//                     }`}
//                     onClick={() => handleUserSelect(user)}
//                   >
//                     <img
//                       src={user.profilePic || ProfileAvatar}
//                       alt="avatar"
//                       className="w-8 h-8 rounded-full mr-2"
//                     />
//                     <span>{user.name}</span>
//                     {notifications[user._id] > 0 && (
//                       <span className="ml-2 bg-red-500 text-white rounded-full px-2 text-xs">
//                         {notifications[user._id]}
//                       </span>
//                     )}
//                   </div>
//                 ))}
//             </div>
//           ) : (
//             <div className="flex-1 flex flex-col">
//               <div className="flex justify-between font-semibold items-center p-2 border-b border-gray-300">
//                 <img
//                   src={selectedUser.profilePic || ProfileAvatar}
//                   alt="avatar"
//                   className="w-8 h-8 rounded-full mr-2"
//                 />
//                 <span>{selectedUser.name}</span>
//                 <button className="text-red-500" onClick={() => setSelectedUser(null)}>
//                   Close
//                 </button>
//               </div>
//               <ul className="flex-1 overflow-y-auto p-2" style={{ maxHeight: '300px' }}>
//                 {loading ? (
//                   <p>Loading chat...</p>
//                 ) : (
//                   messages.map((chat) => (
//                     <ChatMessage
//                       key={chat.id}
//                       chat={chat}
//                       userId={userId}
//                       selectedUserId={selectedUserId}
//                       currentUser={currentUser}
//                       isDarkMode={isDarkMode}
//                     />
//                   ))
//                 )}
//                 <div ref={chatEndRef} />
//               </ul>
//               {errorMessage && <div className="text-red-500 p-2">{errorMessage}</div>}
//               <div className="border-t border-gray-300 p-2 flex">
//                 <textarea
//                   value={text}
//                   onChange={(e) => setText(e.target.value)}
//                   className="flex-1 p-2 border border-gray-300 dark:bg-gray-800 rounded-lg mr-2 resize-none dark:text-white"
//                   placeholder="Type your message..."
//                   rows="3"
//                 />
//                 <button
//                   onClick={handleSendMessage}
//                   className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center"
//                 >
//                   <FaPaperPlane />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatPopup;
