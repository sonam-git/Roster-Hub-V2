import React from "react";
import WavingHand from "../../assets/images/waving.png";
import Auth from "../../utils/auth";

const FarewellModal = () => {
  // Handler for close button: log out and go home
  const handleClose = () => {
    // Remove token and force navigation to home
    localStorage.removeItem('id_token');
    window.location.replace('/');
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-2 pb-8 text-center sm:block sm:p-0">
        {/* Overlay with blur and color for both themes */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500/60 dark:bg-gray-900/80 backdrop-blur-sm"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full max-w-xs sm:max-w-md md:max-w-lg border-2 border-red-100 dark:border-red-700">
          <div className="bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4 pt-6 pb-4 sm:p-8 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start items-center gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 border-2 border-red-200 dark:border-red-700 shadow-lg">
                <img
                  src={WavingHand}
                  alt="Wave goodbye"
                  className="h-12 w-12 object-contain drop-shadow-xl"
                />
              </div>
              <div className="mt-2 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-red-200 mb-1 tracking-tight">
                  Sorry to see you leave. Make sure you logout of the page now.
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-300 font-medium">
                  We wish you all the best!
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-4 sm:px-8 flex flex-col sm:flex-row-reverse gap-3 sm:gap-4">
            <button
              onClick={handleClose}
              type="button"
              className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2 bg-gradient-to-r from-red-500 to-red-700 text-base font-bold text-white hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarewellModal;
