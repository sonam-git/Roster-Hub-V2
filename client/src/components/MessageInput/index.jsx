import React, {
  useState,
  useEffect,
  useRef,
  useTransition,
  useId,
} from "react";

const MessageInput = ({ userId, value, onChange, onSend }) => {
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
    <div className="mt-4">
      <div className="flex">
        <label htmlFor={inputId} className="sr-only">
          Message
        </label>
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Type your message..."
          aria-invalid={error}
          className={`flex-grow px-3 py-2 text-sm rounded-l border focus:outline-none ${
            error ? "border-red-500" : "border-gray-300"
          } dark:bg-gray-700 dark:text-white`}
        />
        <button
          onClick={handleSend}
          disabled={isPending}
          className="ml-1 rounded-r bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {isPending ? "Sending…" : "Send"}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">Write your message first.</p>
      )}
    </div>
  );
};

export default MessageInput;
