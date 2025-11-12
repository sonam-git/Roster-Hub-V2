import React, { useEffect } from "react";
import WavingHand from "../../assets/images/waving.png";
import { FaCheckCircle, FaHeart } from "react-icons/fa";

const FarewellModal = () => {
  // Auto logout after component mounts
  useEffect(() => {
    // Clear all user data
    localStorage.removeItem('id_token');
  }, []);

  // Handler for close button: navigate to home
  const handleClose = () => {
    window.location.href = '/';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto backdrop-blur-sm bg-black/70 dark:bg-black/85 p-2 sm:p-4">
      <div className="relative w-full max-w-2xl my-4 sm:my-8">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all">
          {/* Decorative top gradient */}
          <div className="h-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
          
          <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-3 py-5 sm:px-6 sm:py-8 md:px-8 md:py-10 text-center">
            
            {/* Main Message with Icons */}
            <div className="flex flex-col items-center justify-center mb-3 sm:mb-4">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                {/* Green Check Icon - smaller */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-green-400 dark:bg-green-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                  <div className="relative flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600 shadow-lg">
                    <FaCheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                
                {/* Heading */}
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Account Deleted Successfully
                </h1>
                
                {/* Waving Hand Icon */}
                <img
                  src={WavingHand}
                  alt="Wave goodbye"
                  className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain drop-shadow-lg animate-bounce"
                />
              </div>
            </div>
            
            <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 font-medium mb-1 sm:mb-2 px-2">
              We're sorry to see you go! 😢
            </p>
            
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 md:mb-6 max-w-lg mx-auto px-3 sm:px-4">
              Your account and all associated data have been permanently removed from our system.
            </p>

            {/* Farewell Message with Heart */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6 border border-pink-100 dark:border-gray-600 max-w-lg mx-auto">
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <FaHeart className="text-pink-500 dark:text-pink-400 text-base sm:text-lg md:text-xl animate-pulse" />
                <span className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white">Thank You!</span>
                <FaHeart className="text-pink-500 dark:text-pink-400 text-base sm:text-lg md:text-xl animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 px-1 sm:px-2">
                We wish you all the best in your future endeavors. You're always welcome back!
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              type="button"
              className="w-full max-w-sm mx-auto inline-flex justify-center items-center gap-2 sm:gap-3 rounded-xl border border-transparent shadow-lg px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-sm sm:text-base md:text-lg font-bold text-white focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
            >
              <span>Return to Home</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </button>

            {/* Small note */}
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3 sm:mt-4 px-2">
              You have been logged out and can now close this page
            </p>
          </div>
        </div>

        {/* Footer message */}
        <p className="text-center text-white/90 dark:text-gray-200 mt-4 sm:mt-6 text-xs sm:text-sm px-4">
          Thank you for being part of our community ✨
        </p>
      </div>
    </div>
  );
};

export default FarewellModal;
