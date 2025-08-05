import React, { useState, useEffect, useRef } from "react";
import MessageBubble from "../MessageBubble";
import MessageInput from "../MessageInput";
import { getDateFromObjectId, formatDate } from "../../utils/MessageUtils";
import { HiTrash, HiUser, HiChatAlt } from "react-icons/hi";
import ProfileAvatar from "../../assets/images/profile-avatar.png";


const MessageCard = ({
  conv,
  loggedInUser,
  isLoggedInUser,
  inputValue,
  onInputChange,
  onSend,
  onDelete,
  onDeleteConversation,
  onReply,
  isDarkMode,
}) => {

  const [showConfirm, setShowConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  let lastDateLabel = null;

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [conv.messages]);

  return (
    <>
    <div
      key={conv.user._id}
      className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700"
          : "bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-gray-200"
      } flex flex-col justify-between h-[500px]`}
    >
      {/* Animated Background Effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-gray-900/20' 
          : 'bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-pink-100/30'
      }`}></div>

      {/* Header */}
      <div className={`sticky top-0 z-10 px-6 py-4 border-b ${
        isDarkMode
          ? "bg-gray-800/95 backdrop-blur-sm border-gray-700"
          : "bg-white/95 backdrop-blur-sm border-gray-200"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={conv.user.profilePic || ProfileAvatar}
                alt={conv.user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-400 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {conv.user.name}
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowConfirm(true)}
            title="Delete entire conversation"
            className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
              isDarkMode 
                ? 'text-red-400 hover:bg-red-900/50 hover:text-red-300' 
                : 'text-red-500 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            <HiTrash className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin message-scroll-container relative">
        {/* Scroll indicator gradients */}
        <div className={`absolute top-0 left-0 right-0 h-4 bg-gradient-to-b pointer-events-none z-10 ${
          isDarkMode ? 'from-gray-800 to-transparent' : 'from-white to-transparent'
        }`}></div>
        <div className={`absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t pointer-events-none z-10 ${
          isDarkMode ? 'from-gray-800 to-transparent' : 'from-white to-transparent'
        }`}></div>
        {conv.messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <HiChatAlt className={`mx-auto mb-2 text-3xl ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No messages yet
              </p>
            </div>
          </div>
        ) : (
          conv.messages.map((msg) => {
            const isMe = msg.sender._id === loggedInUser._id;
            const thisDate = formatDate(getDateFromObjectId(msg._id));
            const showDate = thisDate !== lastDateLabel;
            lastDateLabel = thisDate;

            return (
              <React.Fragment key={msg._id}>
                {showDate && (
                  <div className="flex items-center justify-center my-4">
                    <div className={`flex-grow border-t ${
                      isDarkMode ? "border-gray-600" : "border-gray-300"
                    }`}></div>
                    <span className={`mx-4 px-3 py-1 text-xs font-semibold rounded-full ${
                      isDarkMode 
                        ? "bg-gray-700 text-gray-300 border border-gray-600" 
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}>
                      {thisDate}
                    </span>
                    <div className={`flex-grow border-t ${
                      isDarkMode ? "border-gray-600" : "border-gray-300"
                    }`}></div>
                  </div>
                )}
                <MessageBubble
                  msg={msg}
                  isMe={isMe}
                  user={conv.user}
                  loggedInUser={loggedInUser}
                  onDelete={onDelete}
                  onReply={onReply}
                  isLoggedInUser={isLoggedInUser}
                  isDarkMode={isDarkMode}
                />
              </React.Fragment>
            );
          })
        )}
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`sticky bottom-0 px-6 py-4 border-t ${
        isDarkMode
          ? "bg-gray-800/95 backdrop-blur-sm border-gray-700"
          : "bg-white/95 backdrop-blur-sm border-gray-200"
      }`}>
        <MessageInput
          userId={conv.user._id}
          value={inputValue}
          onChange={onInputChange}
          onSend={onSend}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
    
    {/* Enhanced Confirmation Modal */}
    {showConfirm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className={`relative p-8 rounded-2xl shadow-2xl w-11/12 max-w-md transform transition-all ${
          isDarkMode ? "bg-gray-800 text-gray-200 border border-gray-700" : "bg-white text-gray-800 border border-gray-200"
        }`}>
          {/* Icon */}
          <div className="text-center mb-6">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-red-900/50' : 'bg-red-100'
            }`}>
              <HiTrash className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
            </div>
          </div>
          
          {/* Content */}
          <div className="text-center mb-8">
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Delete Conversation
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete your entire conversation with <strong>{conv.user.name}</strong>? This action cannot be undone.
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDeleteConversation(conv.user._id);
                setShowConfirm(false);
              }}
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default MessageCard;
