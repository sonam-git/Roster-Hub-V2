/* *************  Chat Related Component **********/

import React from "react";
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import { relativeTime } from "../../utils/MessageUtils";

const ChatMessage = ({ chat, userId, currentUser, isLastFromCurrentUser }) => {
  if (!chat || !userId || !currentUser) {
    return null; // If essential props are missing, don't render anything
  }

  const isFromCurrentUser = chat.from._id === userId;

  // Normalize createdAt to a valid date
  let createdAtDate = null;
  if (chat.createdAt) {
    if (typeof chat.createdAt === 'number') {
      createdAtDate = new Date(chat.createdAt);
    } else if (!isNaN(Number(chat.createdAt))) {
      // Numeric string
      createdAtDate = new Date(Number(chat.createdAt));
    } else {
      // Try parsing as ISO string
      createdAtDate = new Date(chat.createdAt);
    }
  }
  const messageTime = createdAtDate && !isNaN(createdAtDate)
    ? relativeTime(createdAtDate)
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
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
          {messageTime}
          {isFromCurrentUser && isLastFromCurrentUser && (
            <span className="ml-2">
              {chat.seen ? "Seen" : "Delivered"}
            </span>
          )}
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
