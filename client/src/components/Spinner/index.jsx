import React from 'react';

/**
 * Reusable Spinner Component
 * @param {string} size - 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {string} text - Optional text to display below spinner
 * @param {boolean} fullScreen - Whether to take full screen height (default: false)
 */
const Spinner = ({ size = 'md', text = '', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-2',
    lg: 'h-12 w-12 border-2',
    xl: 'h-16 w-16 border-3'
  };

  const containerClasses = fullScreen 
    ? 'flex items-center justify-center min-h-screen' 
    : 'flex items-center justify-center py-8 sm:py-12';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div
          className={`${sizeClasses[size] || sizeClasses.md} animate-spin rounded-full border-blue-500 border-t-transparent mx-auto mb-4`}
          role="status"
          aria-label="Loading"
        ></div>
        {text && (
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Spinner;
