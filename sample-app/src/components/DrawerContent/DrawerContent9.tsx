import { useDialogsValve } from '../../dialogs-valve-registry';
import './DrawerContent.css';
import Drawer from '../Drawer';

type DrawerContentProps = {
  open: boolean;
  onClose: () => void;
};

const DrawerContent9: React.FC<DrawerContentProps> = ({ open, onClose }) => {
  const { openDialog } = useDialogsValve()!;

  return (
    <Drawer open={open} onClose={onClose} title="FAQ">
      <div className="drawer-demo-content">
        <div className="status-badge info">Knowledge</div>
        <h3>FAQ</h3>
        <div className="content-card">
          <p><strong>Q: Multiple drawers open?</strong></p>
          <p>A: Yes! Use <code>overlap: true</code> to stack them.</p>
          <br />
          <p><strong>Q: Is this accessible?</strong></p>
          <p>A: Yes, includes ARIA and focus management.</p>
        </div>

        <button 
          className="action-button-link"
          onClick={() => openDialog('drawer-10', { overlap: true })}
        >
          Complete Demo (Overlap) →
        </button>
      </div>
    </Drawer>
  );
};

export default DrawerContent9;
