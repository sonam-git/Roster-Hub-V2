import React ,{useState} from "react";
import MessageBubble from "../MessageBubble";
import MessageInput from "../MessageInput";
import { getDateFromObjectId, formatDate } from "../../utils/MessageUtils";
import { TrashIcon } from "@heroicons/react/solid";


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
  let lastDateLabel = null;

  return (
    <>
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
    <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold truncate">
              Conversation with {conv.user.name}
            </h2>
            <button
              onClick={() => setShowConfirm(true)}
              title="Delete entire conversation"
              className="p-1 text-red-500 hover:text-red-700"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
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
         {/* Confirmation Modal */}
         {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-50">
          <div
            className={`p-6 rounded-lg shadow-lg w-11/12 max-w-sm ${
              isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
            }`}
          >
            <p className="mb-4">
              Are you sure you want to delete the entire conversation?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                 onDeleteConversation(conv.user._id);
                  setShowConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
