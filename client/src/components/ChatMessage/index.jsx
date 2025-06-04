/* *************  Chat Related Component **********/

import React from "react";
import ProfileAvatar from "../../assets/images/profile-avatar.png";

const ChatMessage = ({ chat, userId, currentUser }) => {
  if (!chat || !userId || !currentUser) {
    return null; // If essential props are missing, don't render anything
  }

  const isFromCurrentUser = chat.from._id === userId;
  const messageTime = chat.createdAt
    ? new Date(parseInt(chat.createdAt)).toLocaleString()
    : "Unknown time";

  return (
    <div className={`p-1 my-1 flex ${isFromCurrentUser ? "justify-end" : "justify-start"}`}>
      {!isFromCurrentUser && (
        <img
          src={chat.from.profilePic || ProfileAvatar}
          alt="avatar"
          className="w-8 h-8 rounded-full mr-2"
        />
      )}
      <div className="flex flex-col max-w-xs">
        <div
          className={`inline-block p-2 rounded-lg ${
            isFromCurrentUser ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
          }`}
        >
          {chat.content}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {messageTime}
        </div>
      </div>
      {isFromCurrentUser && (
        <img
          src={currentUser.profilePic || ProfileAvatar}
          alt="avatar"
          className="w-8 h-8 rounded-full ml-2"
        />
      )}
    </div>
  );
};

export default ChatMessage;
