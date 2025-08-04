// src/components/GameSearchModal/index.jsx
import React, { useContext, useEffect } from "react";
import { ThemeContext } from "../ThemeContext";
import GameSearch from "../GameSearch";

const GameSearchModal = ({ isOpen, onClose, onSearch, onReset, searchFilters }) => {
  const { isDarkMode } = useContext(ThemeContext);

  console.log('GameSearchModal props:', { isOpen, searchFilters });

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transform transition-all duration-300 ${
        isDarkMode 
          ? "bg-gray-900 border border-gray-700" 
          : "bg-white border border-gray-200"
      }`}>
        {/* Modal Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
          isDarkMode 
            ? "bg-gray-900 border-gray-700" 
            : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-sm text-white">🔍</span>
            </div>
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Search Games
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-200 hover:bg-opacity-80 ${
              isDarkMode 
                ? "bg-gray-700 hover:bg-gray-600 text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            aria-label="Close search modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <GameSearch 
            onSearch={(filters) => {
              onSearch(filters);
              onClose(); // Close modal after search
            }}
            onReset={(filters) => {
              onReset(filters);
              onClose(); // Close modal after reset
            }}
            initialFilters={searchFilters}
          />
        </div>

        {/* Modal Footer */}
        <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t ${
          isDarkMode 
            ? "bg-gray-900 border-gray-700" 
            : "bg-white border-gray-200"
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            Cancel
          </button>
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameSearchModal;
