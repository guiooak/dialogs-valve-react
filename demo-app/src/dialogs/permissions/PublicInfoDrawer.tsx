import Drawer from "../../components/Drawer/Drawer";

type PublicInfoDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const PublicInfoDrawer: React.FC<PublicInfoDrawerProps> = ({
  open,
  onClose,
}) => (
  <Drawer open={open} onClose={onClose} title="Public Info">
    <div className="dialog-content">
      <span className="badge badge-success">No guard</span>
      <p>
        This dialog has no <code>canShow</code> guard in the registry — it
        renders for anyone, regardless of permissions.
      </p>
      <p>
        It's the baseline: every dialog in the registry is public unless you
        explicitly add a guard.
      </p>
      <div className="dialog-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  </Drawer>
);

export default PublicInfoDrawer;
