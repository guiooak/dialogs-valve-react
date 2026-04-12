import Drawer from '../../components/Drawer/Drawer';

type ReplacementDrawerBProps = {
  open: boolean;
  onClose: () => void;
};

const ReplacementDrawerB: React.FC<ReplacementDrawerBProps> = ({ open, onClose }) => (
  <Drawer open={open} onClose={onClose} title="Replacement B">
    <div className="dialog-content">
      <span className="badge badge-warning">Replaced</span>
      <p>
        You're now seeing Drawer B. Drawer A is gone from the URL — it was
        replaced, not stacked.
      </p>
      <p>
        The URL now contains only <code>replacement-b</code>. The previous
        entry was cleanly removed in a single navigation step.
      </p>
      <div className="dialog-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  </Drawer>
);

export default ReplacementDrawerB;
