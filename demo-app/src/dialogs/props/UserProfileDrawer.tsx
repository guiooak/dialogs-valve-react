import Drawer from "../../components/Drawer/Drawer";

type UserProfileDrawerProps = {
  open: boolean;
  onClose: () => void;
  name?: string;
  role?: string;
  userId?: string;
  age?: number;
  verified?: boolean;
};

const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  open,
  onClose,
  name = "Anonymous",
  role = "Viewer",
  userId = "?",
  age,
  verified = false,
}) => (
  <Drawer open={open} onClose={onClose} title="User Profile">
    <div className="dialog-content">
      <div className="profile-avatar">{name.charAt(0).toUpperCase()}</div>
      <p className="profile-name">{name}</p>
      <span className="badge badge-info">{role}</span>{" "}
      <span className={`badge ${verified ? "badge-success" : "badge-muted"}`}>
        {verified ? "✓ Verified" : "Unverified"}
      </span>
      <dl className="profile-details">
        <dt>User ID</dt>
        <dd>#{userId}</dd>
        <dt>Age</dt>
        <dd>
          {age ?? "—"} <span className="hint-text">(typeof: {typeof age})</span>
        </dd>
        <dt>Verified</dt>
        <dd>
          {String(verified)}{" "}
          <span className="hint-text">(typeof: {typeof verified})</span>
        </dd>
        <dt>Source</dt>
        <dd>URL query params</dd>
      </dl>
      <p className="hint-text">
        These values came directly from the URL — check the URL Inspector above
        to see them serialized (note the <code>number.</code> and{" "}
        <code>bool.</code> prefixes). The library deserializes them back to real
        numbers and booleans before they reach this component.
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
