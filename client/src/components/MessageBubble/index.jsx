import React from "react";
import { relativeTime, getDateFromObjectId } from "../../utils/MessageUtils";
import { HiTrash } from "react-icons/hi";
import ProfileAvatar from "../../assets/images/profile-avatar.png";

const MessageBubble = ({
  msg,
  isMe,
  user,
  loggedInUser,
  onDelete,
  isLoggedInUser,
  isDarkMode,
}) => {
  // Debug log to verify isLoggedInUser is being passed correctly
  // console.log("MessageBubble render - isLoggedInUser:", isLoggedInUser, "msg._id:", msg._id);
  
  const avatar = (isMe ? loggedInUser : user).profilePic || ProfileAvatar;
  const time = relativeTime(getDateFromObjectId(msg._id));

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-3 group`}>
      {!isMe && (
        <div className="flex-shrink-0">
          <img
            src={avatar}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 shadow-sm"
          />
        </div>
      )}

      <div className={`flex flex-col max-w-xs lg:max-w-sm ${isMe ? 'items-end' : 'items-start'}`}>
        <div className={`relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 group-hover:shadow-md ${
          isMe
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
            : isDarkMode
              ? "bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-bl-md"
              : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 rounded-bl-md"
        }`}>
          <p className="text-sm leading-relaxed break-words">{msg.text}</p>
          
          {/* Message tail */}
          <div className={`absolute bottom-0 w-3 h-3 ${
            isMe 
              ? "-right-1 bg-blue-600 transform rotate-45" 
              : "-left-1 transform rotate-45 " + (isDarkMode ? "bg-gray-800" : "bg-gray-200")
          }`}></div>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            {time}
          </span>
          
          {isLoggedInUser && (
            <button
              title="Delete message"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Delete button clicked for message:", msg._id, "isLoggedInUser:", isLoggedInUser);
                onDelete(msg._id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(msg._id);
                }
              }}
              className={`opacity-70 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 p-1.5 rounded-full transition-all duration-200 hover:scale-110 focus:scale-110 touch-manipulation focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                isDarkMode 
                  ? 'text-red-400 hover:bg-red-900/50 hover:text-red-300 active:bg-red-900/70 focus:bg-red-900/50' 
                  : 'text-red-500 hover:bg-red-50 hover:text-red-600 active:bg-red-100 focus:bg-red-50'
              }`}
            > 
              <HiTrash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {isMe && (
        <div className="flex-shrink-0">
          <img
            src={avatar}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover border-2 border-blue-300 shadow-sm"
          />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
