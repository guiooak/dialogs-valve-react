import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';
import Drawer from '../Drawer';

interface DrawerContentProps {
  open: boolean;
  onClose: () => void;
}

const DrawerContent6: React.FC<DrawerContentProps> = ({ open, onClose }) => {
  const { openDialog } = useDialogsValve()!;

  return (
    <Drawer open={open} onClose={onClose} title="Contact">
      <div className="drawer-demo-content">
        <div className="status-badge info">Reach Out</div>
        <h3>Contact Information</h3>
        <ul className="feature-list">
          <li><span>📧</span> Email: hello@valve.io</li>
          <li><span>📱</span> Phone: (555) 000-1111</li>
          <li><span>📍</span> JS City, React Lane</li>
        </ul>

        <button 
          className="action-button-link secondary"
          onClick={() => openDialog('drawer-7', { overlap: true })}
        >
          Quick Tips (Overlap) →
        </button>
      </div>
    </Drawer>
  );
};

export default DrawerContent6;
