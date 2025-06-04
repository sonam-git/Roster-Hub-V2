import React from "react";

const MessageInput = ({ userId, value, onChange, onSend }) => (
  <div className="mt-4 flex">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(userId, e.target.value)}
      placeholder="Type your message..."
      className="flex-grow border rounded-l px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
    />
    <button
      onClick={() => onSend(userId)}
      className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 text-sm ml-1"
    >
      Send
    </button>
  </div>
);

export default MessageInput;
