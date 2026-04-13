import Modal from "../../components/Modal/Modal";

type HelloModalProps = {
  open: boolean;
  onClose: () => void;
};

const HelloModal: React.FC<HelloModalProps> = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} title="Hello, World!">
    <div className="dialog-content">
      <p>
        This is a basic centered modal. It was opened by writing a dialog key
        into the URL query string.
      </p>
      <p>
        Press <kbd>Escape</kbd> or click the backdrop to close it — no props
        needed, just the library defaults.
      </p>
      <div className="dialog-actions">
        <button className="btn btn-primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  </Modal>
);

export default HelloModal;
