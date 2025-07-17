import "../../assets/css/chatModal.css";

const Modal = ({ showModal, children, onClose }) => {
  return (
    <div className={`modal ${showModal ? "show" : ""}`}>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">{children}</div>
    </div>
  );
};

export default Modal;
