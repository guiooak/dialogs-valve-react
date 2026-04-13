import Drawer from '../../components/Drawer/Drawer';

type AdminPanelDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const AdminPanelDrawer: React.FC<AdminPanelDrawerProps> = ({ open, onClose }) => (
  <Drawer open={open} onClose={onClose} title="Admin Panel">
    <div className="dialog-content">
      <span className="badge badge-danger">Admin only</span>
      <p>
        This dialog is protected by a <code>canShow</code> guard. It only
        renders because <code>isAdmin === true</code> was passed to the
        provider.
      </p>
      <div className="admin-features-list">
        <div className="admin-feature-row">Manage users</div>
        <div className="admin-feature-row">View audit logs</div>
        <div className="admin-feature-row">System settings</div>
        <div className="admin-feature-row">Feature flags</div>
      </div>
      <div className="dialog-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  </Drawer>
);

export default AdminPanelDrawer;
