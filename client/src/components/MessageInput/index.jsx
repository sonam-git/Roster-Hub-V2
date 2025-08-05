import React, {
  useState,
  useEffect,
  useRef,
  useTransition,
  useId,
} from "react";
import { HiPaperAirplane, HiExclamationCircle } from "react-icons/hi";

const MessageInput = ({ userId, value, onChange, onSend, isDarkMode }) => {
  // unique id for the <input> 
  const inputId = useId();

  // for marking the “send” as a non-urgent update
  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState(false);
  const timerRef = useRef(null);

  // Clean up any pending timer if we ever unmount
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleSend = () => {
    const safeValue = value ?? "";
    if (safeValue.trim() === "") {
      setError(true);
      clearTimeout(timerRef.current);
      // hide error after 3s
      timerRef.current = setTimeout(() => setError(false), 3000);
      return;
    }

    // wrap heavy work in a transition
    startTransition(() => {
      onSend(userId);
    });
  };

  const handleChange = (e) => {
    const next = e.target.value;
    // transition the update
    startTransition(() => {
      onChange(userId, next);
    });
    if (error && next.trim() !== "") {
      setError(false);
      clearTimeout(timerRef.current);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative flex items-center gap-2">
        <label htmlFor={inputId} className="sr-only">
          Message
        </label>
        <div className="relative flex-1">
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="Type your message..."
            aria-invalid={error}
            className={`w-full px-4 py-3 pr-12 text-sm rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
              error 
                ? isDarkMode
                  ? "border-red-500 focus:border-red-400 focus:ring-red-400/20 bg-gray-700 text-white placeholder-gray-400"
                  : "border-red-500 focus:border-red-400 focus:ring-red-400/20 bg-white text-gray-900 placeholder-gray-500"
                : isDarkMode
                  ? "border-gray-600 focus:border-blue-400 focus:ring-blue-400/20 bg-gray-700 text-white placeholder-gray-400"
                  : "border-gray-300 focus:border-blue-400 focus:ring-blue-400/20 bg-white text-gray-900 placeholder-gray-500"
            }`}
          />
          {error && (
            <HiExclamationCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
          )}
        </div>
        
        <button
          onClick={handleSend}
          disabled={isPending || !value?.trim()}
          className={`p-3 rounded-2xl font-medium transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center ${
            isPending || !value?.trim()
              ? isDarkMode
                ? 'bg-gray-700 text-gray-500'
                : 'bg-gray-100 text-gray-400'
              : isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/25'
          }`}
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <HiPaperAirplane className="w-5 h-5 transform rotate-90" />
          )}
        </button>
      </div>
      
      {error && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
          isDarkMode ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-200'
        }`}>
          <HiExclamationCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-500">Please write your message first.</p>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
