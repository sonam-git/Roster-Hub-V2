import React from "react";
import Auth from "../../utils/auth";

const UserListModal = ({ show, onClose, profiles, onSelectUser, isDarkMode }) => {
  if (!show) return null;

  const loggedInUserId = Auth.loggedIn() ? Auth.getProfile().data._id : null;
  console.log("Logged in user ID:", loggedInUserId);
  const filteredProfiles = profiles.filter((user) => user._id !== loggedInUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={`max-w-md w-full rounded-xl shadow-2xl p-6 relative border ${
          isDarkMode
            ? "bg-gray-800 text-white border-gray-600"
            : "bg-white text-gray-800 border-gray-300"
        }`}
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

        <ul className="space-y-2 max-h-64 overflow-y-auto pr-1 ">
          {filteredProfiles.map((user) => (
            <li key={user._id}>
              <button
                onClick={() => onSelectUser(user)}
                className={`w-full px-4 py-2 text-left rounded-lg transition duration-200 ${
                  isDarkMode
                    ? "bg-gray-700 text-white hover:bg-gray-500"
                    : "bg-gray-200 hover:bg-indigo-600 hover:text-white"
                }`}
              >
                {user.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserListModal;
