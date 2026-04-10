import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';
import Drawer from '../Drawer';

interface DrawerContentProps {
  open: boolean;
  onClose: () => void;
}

const DrawerContent8: React.FC<DrawerContentProps> = ({ open, onClose }) => {
  const { openDialog } = useDialogsValve()!;

  return (
    <Drawer open={open} onClose={onClose} title="Recent Activity">
      <div className="drawer-demo-content">
        <div className="status-badge info">Log</div>
        <h3>Recent Activity</h3>
        <ul className="feature-list">
          <li><strong>10:30 AM</strong> - Opened Drawer 8</li>
          <li><strong>10:15 AM</strong> - Updated settings</li>
          <li><strong>9:45 AM</strong> - Viewed stats</li>
        </ul>

        <button 
          className="action-button-link secondary"
          onClick={() => openDialog('drawer-9', { overlap: true })}
        >
          View FAQ (Overlap) →
        </button>
      </div>
    </Drawer>
  );
};

export default DrawerContent8;
