import Drawer from "../../components/Drawer/Drawer";

type UserProfileDrawerProps = {
  open: boolean;
  onClose: () => void;
  name?: string;
  role?: string;
  userId?: string;
};

const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  open,
  onClose,
  name = "Anonymous",
  role = "Viewer",
  userId = "?",
}) => (
  <Drawer open={open} onClose={onClose} title="User Profile">
    <div className="dialog-content">
      <div className="profile-avatar">{name.charAt(0).toUpperCase()}</div>
      <p className="profile-name">{name}</p>
      <span className="badge badge-info">{role}</span>
      <dl className="profile-details">
        <dt>User ID</dt>
        <dd>#{userId}</dd>
        <dt>Status</dt>
        <dd>Active</dd>
        <dt>Source</dt>
        <dd>URL query params</dd>
      </dl>
      <p className="hint-text">
        These values came directly from the URL — check the URL Inspector above
        to see them serialized in the query string.
      </p>
      <div className="dialog-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  </Drawer>
);

export default UserProfileDrawer;
