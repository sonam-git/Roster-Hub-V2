import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import "../../assets/css/chatModal.css";

const Modal = ({ showModal, children, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [showModal]);

  if (!showModal) return null;

  // Get or create a modal root element
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  }

  return createPortal(
    <div className={`modal ${showModal ? "show" : ""}`}>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">{children}</div>
    </div>,
    modalRoot
  );
};

export default Modal;
