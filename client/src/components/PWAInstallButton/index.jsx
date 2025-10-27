import React, { useState, useEffect } from 'react';
import { HiDownload, HiX } from 'react-icons/hi';

const PWAInstallButton = ({ isDarkMode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt
      setShowInstallPrompt(true);
    };

    // Listen for the app being installed
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt so it can only be used once
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Hide for 24 hours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Check if user dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - dismissedTime < twentyFourHours) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  // Don't show if already installed or no prompt available
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 ${
      isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
    } border rounded-2xl shadow-2xl p-4 transform transition-all duration-300 animate-slide-up`}>
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-xl ${
          isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
        } flex-shrink-0`}>
          <HiDownload className={`w-6 h-6 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm mb-1 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Install RosterHub App
          </h3>
          <p className={`text-xs mb-3 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Add to your home screen for quick access and offline functionality!
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Install
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

export default PWAInstallButton;
