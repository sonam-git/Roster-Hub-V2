import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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

export default function SkillReaction({ onReact, isDarkMode }) {
  const [showEmojiModal, setShowEmojiModal] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showEmojiModal) {
        setShowEmojiModal(false);
      }
    };

    if (showEmojiModal) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showEmojiModal]);

  const handleReact = async (emoji) => {
    setIsReacting(true);
    setShowEmojiModal(false);
    
    try {
      if (onReact) await onReact(emoji);
    } catch (error) {
      console.error('Error reacting to skill:', error);
    } finally {
      setIsReacting(false);
    }
  };

  const closeEmojiModal = () => {
    setShowEmojiModal(false);
  };

  return (
    <div className="relative">
      <button
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 shadow-sm flex items-center gap-1 ${
          isDarkMode 
            ? 'bg-blue-800/50 hover:bg-blue-700/70 text-blue-300 hover:text-blue-100 border border-blue-700/30' 
            : 'bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 border border-blue-200'
        } ${isReacting ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={() => setShowEmojiModal(true)}
        type="button"
        disabled={isReacting}
      >
        {isReacting && (
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
        )}
        React
      </button>
      
      {showEmojiModal && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center p-4" 
          style={{ zIndex: 99999 }}
          data-modal="skill-reaction"
          role="dialog"
          aria-labelledby="reaction-modal-title"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={closeEmojiModal}
            aria-hidden="true"
          />
          <div className={`relative flex flex-col items-center justify-center p-6 rounded-3xl shadow-2xl border-2 max-w-md w-full mx-auto animate-modal-pop ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600' 
              : 'bg-gradient-to-br from-white to-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
              }`}>
                <span className="text-xl text-white">😊</span>
              </div>
              <h3 
                id="reaction-modal-title"
                className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                React to Skill
              </h3>
            </div>
            
            <div className="grid grid-cols-5 gap-3 mb-6 max-h-40 overflow-y-auto">
              {EMOJIS.map(({ emoji, label }) => (
                <button
                  key={label}
                  className={`p-3 text-2xl rounded-2xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600' 
                      : 'bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleReact(emoji)}
                  title={label}
                  aria-label={`React with ${label}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            <button
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={closeEmojiModal}
            >
              Cancel
            </button>
            
            {/* Close button */}
            <button
              className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={closeEmojiModal}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
