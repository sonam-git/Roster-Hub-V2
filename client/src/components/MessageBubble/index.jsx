import React from "react";
import { relativeTime, getDateFromObjectId } from "../../utils/MessageUtils";
import { AiOutlineDelete } from "react-icons/ai";
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
  const avatar = (isMe ? loggedInUser : user).profilePic || ProfileAvatar;
  const time = relativeTime(getDateFromObjectId(msg._id));

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} items-start gap-2`}>
      {!isMe && (
        <img
          src={avatar}
          alt="avatar"
          className="w-8 h-8 rounded-full"
        />
      )}

      <div className="inline-flex flex-col items-start max-w-xs space-y-1">
        <div
          className={`p-1 rounded-lg text-sm ${
            isMe
              ? "bg-blue-500 text-white self-end"
              : isDarkMode
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          <p>{msg.text}</p>
        </div>
        <span
          className={`text-[11px] ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {time}
        </span>
      </div>

      {isLoggedInUser && (
        <button
          title="Delete"
          onClick={() => onDelete(msg._id)}
          className={`mt-2 ${
            isMe ? "text-red-500 hover:text-red-300" : "text-red-500 hover:text-red-700"
          }`}
        >
          <AiOutlineDelete size={20} />
        </button>
      )}

      {isMe && (
        <img
          src={avatar}
          alt="avatar"
          className="w-8 h-8 rounded-full"
        />
      )}
    </div>
  );
};

export default MessageBubble;
