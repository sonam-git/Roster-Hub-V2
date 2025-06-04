import React, { useState } from 'react';

const RemoveAccount = ({ onRemove,profileId  }) => {
  const [showModal, setShowModal] = useState(false);

  const handleDelete = () => {
    onRemove(profileId); // Call the onRemove function with the profileId
    setShowModal(false);
  };
  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="w-full sm:w-auto text-sm sm:text-base bg-red-400 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md mt-4 sm:mt-0"
      >
        Delete Account
      </button>
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="bg-white p-4">
                <p className="text-lg text-gray-700">
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-400 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoveAccount;
