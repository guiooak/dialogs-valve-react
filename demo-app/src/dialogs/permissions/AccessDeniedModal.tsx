import Modal from "../../components/Modal/Modal";

type AccessDeniedModalProps = {
  open: boolean;
  onClose: () => void;
};

const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  open,
  onClose,
}) => (
  <Modal open={open} onClose={onClose} title="Access Denied" size="sm">
    <div className="dialog-content">
      <span className="badge badge-danger">Unauthorized</span>
      <p>
        You don't have permission to view that panel. Enable{" "}
        <strong>Admin Mode</strong> in the demo and try again.
      </p>
      <p className="access-denied-hint">
        This modal was triggered by the <code>onUnauthorized</code> callback —
        fired whenever a <code>canShow</code> guard blocks a dialog.
      </p>
      <div className="dialog-actions">
        <button className="btn btn-primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  </Modal>
);

export default AccessDeniedModal;
