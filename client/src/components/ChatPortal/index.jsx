import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * ChatPortal component - Renders children in a portal for mobile modal overlay
 * @param {boolean} isOpen - Whether the portal should be rendered
 * @param {ReactNode} children - Content to render in the portal
 */
const ChatPortal = ({ isOpen, children }) => {
  // Prevent body scroll when portal is open
  useEffect(() => {
    if (isOpen) {
      // Store original overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow;
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore original overflow style
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const portalRoot = document.getElementById('chat-portal-root');
  
  if (!portalRoot) {
    console.error('Portal root element not found');
    return null;
  }

  return createPortal(children, portalRoot);
};

export default ChatPortal;
