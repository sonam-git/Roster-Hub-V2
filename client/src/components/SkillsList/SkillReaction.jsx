import React, { useState } from "react";

const EMOJIS = [
  { emoji: "👍", label: "Thumbs Up" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "👏", label: "Clap" },
  { emoji: "😍", label: "Love" },
  { emoji: "💯", label: "100" },
  { emoji: "🎉", label: "Party Popper" },
  { emoji: "😄", label: "Smile" },
  { emoji: "😢", label: "Sad" },
  { emoji: "🤔", label: "Thinking" },
  { emoji: "🙌", label: "Hands Up" },
  { emoji: "💪", label: "Flexed Biceps" },
  { emoji: "😎", label: "Cool" },
  { emoji: "🤩", label: "Star-Struck" },
  { emoji: "🤗", label: "Hugging Face" },
  { emoji: "😇", label: "Smiling Face with Halo" },
];

export default function SkillReaction({ onReact }) {
  const [showEmojiModal, setShowEmojiModal] = useState(false);

  const handleReact = (emoji) => {
    setShowEmojiModal(false);
    if (onReact) onReact(emoji);
  };

  const closeEmojiModal = () => {
    setShowEmojiModal(false);
  };

  return (
    <div className="relative flex flex-col items-center">
      <button
        className={`px-2 py-1 rounded-full border text-xs font-semibold shadow bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition mb-1 dark:text-white`}
        onClick={() => setShowEmojiModal((v) => !v)}
        type="button"
      >
        React
      </button>
      {showEmojiModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-100 via-yellow-100 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 opacity-70 backdrop-blur-sm"
            onClick={closeEmojiModal}
          />
          <div className="relative flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 rounded-3xl shadow-2xl border-4 border-blue-300 dark:border-blue-800 max-w-md w-full animate-fade-in mx-4">
            <h3 className="text-lg font-bold mb-4 text-blue-700 dark:text-gray-200">
              React to Skill
            </h3>
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              {EMOJIS.map(({ emoji, label }) => (
                <button
                  key={label}
                  className="text-2xl p-2 rounded-full bg-blue-200 dark:bg-blue-900  hover:bg-gray-400 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-700 text-blue-900 dark:text-blue-200 shadow"
                  onClick={() => handleReact(emoji)}
                  aria-label={`React with ${label}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button
              className="px-6 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold shadow"
              onClick={closeEmojiModal}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
