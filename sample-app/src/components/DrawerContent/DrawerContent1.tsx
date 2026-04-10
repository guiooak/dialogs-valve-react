import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';
import Drawer from '../Drawer';

interface DrawerContentProps {
  open: boolean;
  onClose: () => void;
}

const DrawerContent1: React.FC<DrawerContentProps> = ({ open, onClose }) => {
  const { openDialog } = useDialogsValve()!;

  return (
    <Drawer open={open} onClose={onClose} title="Welcome Drawer">
      <div className="drawer-demo-content">
        <div className="status-badge success">Active</div>
        <h3>Welcome back, Explorer!</h3>
        <p>This is the first drawer with some introductory content. It contains a brief description of what this drawer is about.</p>
        
        <div className="content-card">
          <h4>Did you know?</h4>
          <p>You can keep multiple drawers open at once by using the <code>overlap</code> option.</p>
        </div>

        <button 
          className="action-button-link"
          onClick={() => openDialog('drawer-2', { overlap: true })}
        >
          Open Feature List (Overlap) →
        </button>
      </div>
    </Drawer>
  );
};

export default DrawerContent1;
