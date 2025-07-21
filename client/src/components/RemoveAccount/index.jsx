import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { DELETE_PROFILE } from '../../utils/mutations';
import Auth from '../../utils/auth';
import FarewellModal from '../FareWellModal';

const RemoveAccount = ({ profileId }) => {
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
        className="w-full sm:w-auto text-sm sm:text-base bg-red-400 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md mt-4 sm:mt-0"
      >
        Delete Account Permanently ?
      </button>
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="bg-gray-100 dark:bg-gray-800  p-4">
                <p className="text-lg text-gray-700 dark:text-white">
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md mr-2"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-400 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md"
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
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
