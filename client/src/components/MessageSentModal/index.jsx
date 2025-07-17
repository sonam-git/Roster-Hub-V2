import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../../assets/css/modal.css"; 
import "../../assets/css/message-sent-modal-animations.css";

const MessageSentModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose(); // Close the modal
    navigate('/message'); // Navigate to the home page
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 transition-opacity duration-300 animate-fade-in">
      <div className="bg-white rounded-lg shadow-md p-6 transform transition-transform duration-300 scale-95 animate-modal-pop">
        <h2 className="text-2xl font-bold mb-4 text-center">Message Sent!</h2>
        <p className="text-gray-700 text-center mb-4">Your message has been successfully sent.</p>
        <button
          onClick={handleClose}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
  
};

export default MessageSentModal;

/* Add these to your global CSS if not present:
.animate-fade-in { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-modal-pop { animation: modalPop 0.3s cubic-bezier(.17,.67,.83,.67); }
@keyframes modalPop { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
*/
