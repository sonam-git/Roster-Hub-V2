import React, { useState, useEffect } from 'react';
import { HiWifi, HiExclamation } from 'react-icons/hi';

const OfflineIndicator = ({ isDarkMode }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show offline message if already offline
    if (!navigator.onLine) {
      setShowOfflineMessage(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto hide the offline message after 5 seconds
  useEffect(() => {
    if (showOfflineMessage && !isOnline) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showOfflineMessage, isOnline]);

  if (!showOfflineMessage && isOnline) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${
      isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
    } border rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 transition-all duration-300 animate-slide-up max-w-sm mx-4`}>
      <div className={`p-2 rounded-lg ${
        isOnline 
          ? isDarkMode ? 'bg-green-900/50' : 'bg-green-100'
          : isDarkMode ? 'bg-red-900/50' : 'bg-red-100'
      }`}>
        {isOnline ? (
          <HiWifi className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
        ) : (
          <HiExclamation className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${
          isOnline 
            ? isDarkMode ? 'text-green-300' : 'text-green-700'
            : isDarkMode ? 'text-red-300' : 'text-red-700'
        }`}>
          {isOnline ? 'Back Online!' : 'You\'re Offline'}
        </p>
        <p className={`text-xs ${
          isOnline 
            ? isDarkMode ? 'text-green-400' : 'text-green-600'
            : isDarkMode ? 'text-red-400' : 'text-red-600'
        }`}>
          {isOnline 
            ? 'All features are now available' 
            : 'Some features may be limited'
          }
        </p>
      </div>
    </div>
  );
};

export default OfflineIndicator;
