import React from "react";
import MessageBubble from "../MessageBubble";
import MessageInput from "../MessageInput";
import { getDateFromObjectId, formatDate } from "../messageUtils";

const MessageCard = ({
  conv,
  loggedInUser,
  isLoggedInUser,
  inputValue,
  onInputChange,
  onSend,
  onDelete,
  onReply,
  isDarkMode,
}) => {
  let lastDateLabel = null;

  return (
    <div
      key={conv.user._id}
      className={`rounded-xl shadow-md border ${
        isDarkMode
          ? "bg-gray-900 border-gray-700 text-white"
          : "bg-white border-gray-200 text-black"
      } flex flex-col justify-between max-h-[420px] overflow-hidden transition-all hover:shadow-lg`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-10 px-4 py-2 border-b ${
          isDarkMode
            ? "bg-gray-900 border-gray-700 text-white"
            : "bg-white border-gray-200 text-gray-800"
        }`}
      >
        <h2 className="text-sm font-bold truncate">
          Conversation with {conv.user.name}
        </h2>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {conv.messages.map((msg) => {
          const isMe = msg.sender._id === loggedInUser._id;
          const thisDate = formatDate(getDateFromObjectId(msg._id));
          const showDate = thisDate !== lastDateLabel;
          lastDateLabel = thisDate;

          return (
            <React.Fragment key={msg._id}>
              {showDate && (
                <div className="flex items-center justify-center my-2">
                  <div
                    className={`flex-grow border-t ${
                      isDarkMode ? "border-gray-600" : "border-gray-300"
                    }`}
                  ></div>
                  <span
                    className={`mx-2 text-xs font-semibold ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    | {thisDate} |
                  </span>
                  <div
                    className={`flex-grow border-t ${
                      isDarkMode ? "border-gray-600" : "border-gray-300"
                    }`}
                  ></div>
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
                isDarkMode={isDarkMode} // pass down
              />
            </React.Fragment>
          );
        })}
      </div>

      {/* Input */}
      <div
        className={`px-4 py-2 border-t ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <MessageInput
          userId={conv.user._id}
          value={inputValue}
          onChange={onInputChange}
          onSend={onSend}
          isDarkMode={isDarkMode} // pass down
        />
      </div>
    </div>
  );
};

export default MessageCard;
