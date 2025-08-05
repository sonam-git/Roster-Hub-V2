import React from "react";
import { HiTrash, HiExclamationCircle } from "react-icons/hi";

const DeleteMessageModal = ({ show, onConfirm, onCancel, isDarkMode }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className={`relative p-8 rounded-2xl shadow-2xl w-11/12 max-w-md transform transition-all animate-modal-pop ${
        isDarkMode ? "bg-gray-800 text-gray-200 border border-gray-700" : "bg-white text-gray-800 border border-gray-200"
      }`}>
        {/* Icon */}
        <div className="text-center mb-6">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-red-900/50' : 'bg-red-100'
          }`}>
            <HiExclamationCircle className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
          </div>
        </div>
        
        {/* Content */}
        <div className="text-center mb-8">
          <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Delete Message
          </h3>
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Are you sure you want to delete this message? This action cannot be undone and the message will be permanently removed.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
          >
            <HiTrash className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMessageModal;
