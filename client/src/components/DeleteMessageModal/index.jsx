import React from "react";

const DeleteMessageModal = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900 bg-opacity-60 animate-fade-in">
      <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-2xl p-6 border-4 border-red-300 dark:border-red-800 max-w-sm w-full animate-modal-pop">
        <h3 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-200 text-center">
          Confirm Message Deletion
        </h3>
        <p className="mb-4 text-gray-600 dark:text-gray-300 text-center">
          Are you sure you want to delete this message?
        </p>
        <div className="flex gap-4 justify-center">
          <button
            className="px-6 py-2 rounded-full bg-red-500 text-white font-semibold shadow hover:bg-red-600"
            onClick={onConfirm}
          >
            Yes, Delete
          </button>
          <button
            className="px-6 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold shadow"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMessageModal;
