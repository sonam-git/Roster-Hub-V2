import React from "react";
import { createPortal } from "react-dom";
import Auth from "../../utils/auth";

const UserListModal = ({ show, onClose, profiles, onSelectUser, isDarkMode }) => {
  if (!show) {
    return null;
  }

  const loggedInUserId = Auth.loggedIn() ? Auth.getProfile().data._id : null;
  const filteredProfiles = profiles.filter((user) => user._id !== loggedInUserId);

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`max-w-md w-full rounded-2xl shadow-2xl p-6 relative transform transition-all duration-300 scale-100 ${
          isDarkMode
            ? "bg-gray-800 text-white border border-gray-600"
            : "bg-white text-gray-800 border border-gray-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={`absolute top-3 right-3 text-xl font-bold focus:outline-none ${
            isDarkMode ? "text-white hover:text-red-400" : "text-black hover:text-red-600"
          }`}
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">
          Select a user to message
        </h2>

        {filteredProfiles.length === 0 ? (
          <div className="text-center py-4">
            <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
              No users available to message
            </p>
          </div>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredProfiles.map((user) => (
              <li key={user._id}>
                <button
                  onClick={() => onSelectUser(user)}
                  className={`w-full px-4 py-3 text-left rounded-lg transition duration-200 flex items-center gap-3 ${
                    isDarkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-100 hover:bg-blue-500 hover:text-white"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    {user.position && (
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user.position}
                      </div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UserListModal;
