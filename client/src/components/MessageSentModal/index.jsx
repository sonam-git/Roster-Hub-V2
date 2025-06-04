import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../../assets/css/modal.css"; 

const MessageSentModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose(); // Close the modal
    navigate('/message'); // Navigate to the home page
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Message Sent!</h2>
        <p className="text-gray-700 text-center mb-4">Your message has been successfully sent.</p>
        <button
          onClick={handleClose}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
  
};

export default MessageSentModal;
