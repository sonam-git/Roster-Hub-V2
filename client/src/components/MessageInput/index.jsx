import React, { useState } from "react";

const MessageInput = ({ userId, value, onChange, onSend }) => {
  const [error, setError] = useState(false);

  const handleSend = () => {
    if (value.trim() === "") {
      setError(true);
      return;
    }
    onSend(userId);
    setError(false);
  };

  const handleChange = (e) => {
    onChange(userId, e.target.value);
    if (error && e.target.value.trim() !== "") {
      setError(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Type your message..."
          className={`flex-grow px-3 py-2 text-sm rounded-l border focus:outline-none ${
            error ? "border-red-500" : "border-gray-300"
          } dark:bg-gray-700 dark:text-white`}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 text-sm ml-1"
        >
          Send
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">
          Write your message first.
        </p>
      )}
    </div>
  );
};

export default MessageInput;
