import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const RosterModal = ({ children, isOpen, onClose, isMobile }) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] transition-all duration-300"
        onClick={onClose}
        aria-label="Close roster modal"
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      />

      {/* Modal Content */}
      <div
        className={`fixed z-[999999] shadow-2xl border-2 border-gray-700 rounded-2xl overflow-hidden backdrop-blur-md bg-gray-900 ${
          isMobile
            ? 'w-[90vw] max-w-sm'
            : 'w-[90vw] sm:w-[85vw] max-w-md'
        }`}
        style={
          isMobile
            ? {
                animation: 'slideUpFromBottom 0.3s ease-out forwards',
                bottom: '5.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                maxHeight: '60vh',
              }
            : {
                animation: 'modalSlideIn 0.3s ease-out forwards',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxHeight: '80vh',
              }
        }
      >
        {children}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUpFromBottom {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );

  // Use portal to render at the end of body
  return ReactDOM.createPortal(modalContent, document.body);
};

export default RosterModal;
