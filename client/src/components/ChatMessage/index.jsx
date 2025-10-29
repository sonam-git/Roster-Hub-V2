/* *************  Chat Related Component **********/
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import { relativeTime } from "../../utils/MessageUtils";

const ChatMessage = ({ chat, userId, currentUser, isLastFromCurrentUser, isDarkMode }) => {
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
    <div className={`mb-3 flex ${isFromCurrentUser ? "justify-end" : "justify-start"} group animate-message-slide`}>
      {!isFromCurrentUser && (
        <div className="flex-shrink-0 mr-3">
          <img
            src={chat.from.profilePic || ProfileAvatar}
            alt="avatar"
            className="w-9 h-9 rounded-full border-2 border-white shadow-md"
          />
        </div>
      )}
      
      <div className={`flex flex-col max-w-[75%] ${isFromCurrentUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:shadow-xl ${
            isFromCurrentUser 
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md" 
              : isDarkMode
                ? "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-100 border border-gray-600 rounded-bl-md"
                : "bg-gradient-to-br from-white to-gray-50 text-gray-800 border border-gray-200 rounded-bl-md"
          }`}
        >
          <p className="text-sm leading-relaxed break-words">{chat.content}</p>
          
          {/* Message tail */}
          <div className={`absolute bottom-0 w-3 h-3 ${
            isFromCurrentUser 
              ? "-right-1 bg-blue-600" 
              : isDarkMode
                ? "-left-1 bg-gray-700"
                : "-left-1 bg-white border-l border-b border-gray-200"
          } transform rotate-45`} />
        </div>
        
        <div className={`flex items-center gap-2 mt-1 px-1 text-xs transition-opacity duration-200 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        } group-hover:opacity-100 opacity-70`}>
          <span className="font-medium">{messageTime}</span>
          {isFromCurrentUser && isLastFromCurrentUser && (
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-current opacity-50"></span>
              <span className={`text-xs font-medium ${
                chat.seen 
                  ? isDarkMode ? 'text-green-400' : 'text-green-600'
                  : isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {chat.seen ? "Seen" : "Delivered"}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {isFromCurrentUser && (
        <div className="flex-shrink-0 ml-3">
          <img
            src={currentUser.profilePic || ProfileAvatar}
            alt="avatar"
            className="w-9 h-9 rounded-full border-2 border-white shadow-md"
          />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
