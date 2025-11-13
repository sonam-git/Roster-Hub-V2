import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiCheckCircle, HiMail } from 'react-icons/hi';

const MessageSentModal = ({ onClose, recipientName, isDarkMode, skipNavigation = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log('🟣 MessageSentModal RENDERED - skipNavigation:', skipNavigation, 'recipientName:', recipientName);
  
  // Check if we're already on the message page
  const isOnMessagePage = location.pathname === '/message';

  // Auto-close and redirect after 1.5 seconds
  useEffect(() => {
    console.log('🟣 MessageSentModal: Setting timer for auto-close');
    const timer = setTimeout(() => {
      console.log('🟣 MessageSentModal: Timer fired, calling onClose');
      onClose();
      // Only navigate if we're not already on the message page and skipNavigation is false
      if (!isOnMessagePage && !skipNavigation) {
        navigate('/message');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [onClose, navigate, isOnMessagePage, skipNavigation]);

  const handleClose = () => {
    onClose();
    // Only navigate if we're not already on the message page and skipNavigation is false
    if (!isOnMessagePage && !skipNavigation) {
      navigate('/message');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999] px-4 animate-in fade-in duration-200">
      <div className={`rounded-2xl shadow-2xl p-8 max-w-md w-full transform animate-in zoom-in-95 duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
          : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
      }`}>
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <HiCheckCircle className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <HiMail className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <h2 className={`text-2xl font-bold text-center mb-3 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Message Sent!
        </h2>
        
        <p className={`text-center mb-6 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Your message has been successfully sent{recipientName ? ` to ${recipientName}` : ''}.
        </p>

        {/* Progress Bar */}
        <div className={`w-full h-1 rounded-full mb-6 overflow-hidden ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 animate-pulse"></div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleClose}
          className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
            isDarkMode
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg'
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
          }`}
        >
          <HiMail className="w-5 h-5" />
          <span>{skipNavigation ? 'Close' : (isOnMessagePage ? 'Continue' : 'View Messages')}</span>
        </button>

        <p className={`text-center text-xs mt-3 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {skipNavigation ? 'Closing automatically...' : (isOnMessagePage ? 'Closing automatically...' : 'Redirecting automatically...')}
        </p>
      </div>
    </div>
  );
};

export default MessageSentModal;
