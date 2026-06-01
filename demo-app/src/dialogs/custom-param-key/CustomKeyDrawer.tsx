import Drawer from "../../components/Drawer/Drawer";

type CustomKeyDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const CustomKeyDrawer: React.FC<CustomKeyDrawerProps> = ({ open, onClose }) => (
  <Drawer open={open} onClose={onClose} title="Feature Drawer">
    <div className="dialog-content">
      <span className="badge badge-primary">drawer=feature-drawer</span>
      <p>
        This drawer is controlled by <code>?drawer=feature-drawer</code> instead
        of the default <code>?dialog=…</code>. The provider was configured with{" "}
        <code>config=&#123;&#123; dialogParamKey: "drawer" &#125;&#125;</code>.
      </p>
      <p>
        Check the URL Inspector above — only the <code>drawer</code> key
        appears. Any outer <code>dialog</code> params are left untouched.
      </p>
      <div className="dialog-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  </Drawer>
);

export default CustomKeyDrawer;
