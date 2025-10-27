import React, { useState, useEffect } from 'react';
import { HiRefresh, HiX } from 'react-icons/hi';

const PWAUpdatePrompt = ({ isDarkMode }) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available
                setUpdateAvailable(true);
              }
            });
          }
        });
      });

      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Tell the waiting service worker to skip waiting and become active
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Listen for the controlling service worker to change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload the page to get the new content
        window.location.reload();
      });
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className={`fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 ${
      isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
    } border rounded-2xl shadow-2xl p-4 transform transition-all duration-300 animate-slide-up`}>
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-xl ${
          isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
        } flex-shrink-0`}>
          <HiRefresh className={`w-6 h-6 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm mb-1 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Update Available
          </h3>
          <p className={`text-xs mb-3 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            A new version of RosterHub is available with improvements and bug fixes.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Update Now
            </button>
            <button
              onClick={handleDismiss}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              Later
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className={`p-1 rounded-lg transition-colors flex-shrink-0 ${
            isDarkMode
              ? 'hover:bg-gray-700 text-gray-400'
              : 'hover:bg-gray-100 text-gray-500'
          }`}
        >
          <HiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
