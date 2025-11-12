import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { DELETE_PROFILE } from '../../utils/mutations';
import FarewellModal from '../FareWellModal';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const RemoveAccount = ({ profileId, isDarkMode }) => {
  const [showModal, setShowModal] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);
  const [deleteProfile] = useMutation(DELETE_PROFILE);

  // Track if deletion is in progress
  const [deleting, setDeleting] = useState(false);

  // Delete user, then show farewell modal
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProfile({ variables: { profileId } });
      setShowModal(false);
      setShowFarewell(true);
    } catch (e) {
      setDeleting(false);
      // Optionally handle error
      alert('Failed to delete user.');
      console.error('Failed to delete user:', e);
    }
  };

  // Handler for FarewellModal close: log out and go home
  const handleFarewellClose = () => {
    localStorage.removeItem('id_token');
    window.location.replace('/');
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className={`w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-white 
              shadow-lg transition-all duration-300 transform hover:scale-[1.02]
              ${isDarkMode 
                ? 'bg-gradient-to-r from-red-600 via-pink-600 to-red-700 hover:from-red-500 hover:via-pink-500 hover:to-red-600'
                : 'bg-gradient-to-r from-red-600 via-pink-600 to-red-700 hover:from-red-500 hover:via-pink-500 hover:to-red-600'
              }
              hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-300/50
              relative overflow-hidden group min-w-[120px]`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <span className="flex items-center justify-center gap-2 relative z-10">
          <FaTrash className="text-sm" />
          Delete Account
        </span>
      </button>
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto backdrop-blur-sm flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 transition-opacity" onClick={() => setShowModal(false)}></div>
          <div className={`relative bg-gradient-to-br rounded-3xl overflow-hidden shadow-2xl transform transition-all w-full max-w-md border
            ${isDarkMode 
              ? 'from-gray-800 to-gray-900 border-gray-600/50' 
              : 'from-white to-gray-50 border-gray-200/50'
            }`}>
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-full">
                <FaExclamationTriangle className="text-white text-xl" />
              </div>
              <h3 className={`text-base sm:text-lg font-bold text-center mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Delete Account?
              </h3>
              <p className={`text-xs sm:text-sm text-center mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className={`flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02]
                    ${isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }
                    shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-300/50`}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-white 
                    bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500
                    shadow-lg transition-all duration-300 transform hover:scale-[1.02]
                    hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-300/50
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={deleting}
                >
                  {deleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FaTrash className="text-sm" />
                      Yes, Delete
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showFarewell && <FarewellModal onClose={handleFarewellClose} />}
    </div>
  );
};

export default RemoveAccount;
