import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';
import Drawer from '../Drawer';

interface DrawerContentProps {
  open: boolean;
  onClose: () => void;
}

const DrawerContent5: React.FC<DrawerContentProps> = ({ open, onClose }) => {
  const { openDialog } = useDialogsValve()!;

  return (
    <Drawer open={open} onClose={onClose} title="About">
      <div className="drawer-demo-content">
        <div className="status-badge success">Project info</div>
        <h3>About This Project</h3>
        <div className="content-card">
          <p>This React application demonstrates the power of <strong>Dialogs Valve</strong>.</p>
          <p style={{ marginTop: '0.5rem' }}><strong>Version:</strong> 0.1.0</p>
          <p><strong>Stack:</strong> React, TS, Vite</p>
        </div>

        <button 
          className="action-button-link"
          onClick={() => openDialog('drawer-6', { overlap: true })}
        >
          Contact Support (Overlap) →
        </button>
      </div>
    </Drawer>
  );
};

export default DrawerContent5;
