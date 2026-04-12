import { useDialogsValve } from '../../dialogs-valve-registry';
import Drawer from '../../components/Drawer/Drawer';

type OverlapDrawerBProps = {
  open: boolean;
  onClose: () => void;
};

const OverlapDrawerB: React.FC<OverlapDrawerBProps> = ({ open, onClose }) => {
  const { closeAllDialogs } = useDialogsValve()!;

  return (
    <Drawer open={open} onClose={onClose} title="Drawer B (Stacked)">
      <div className="dialog-content">
        <span className="badge badge-success">Step 2 of 2</span>
        <p>
          Drawer B is stacked on top of Drawer A. Both are open — check the
          URL Inspector to see both keys in the query string.
        </p>
        <p>
          Closing this drawer (✕ or <kbd>Escape</kbd>) removes only Drawer B
          from the URL. Drawer A stays open underneath.
        </p>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close Drawer B
          </button>
          <button className="btn btn-ghost" onClick={closeAllDialogs}>
            Close all
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export default OverlapDrawerB;
