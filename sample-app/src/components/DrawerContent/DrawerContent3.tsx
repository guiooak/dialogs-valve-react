import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';
import Drawer from '../Drawer';

interface DrawerContentProps {
  open: boolean;
  onClose: () => void;
}

const DrawerContent3: React.FC<DrawerContentProps> = ({ open, onClose }) => {
  const { openDialog } = useDialogsValve()!;

  return (
    <Drawer open={open} onClose={onClose} title="Statistics">
      <div className="drawer-demo-content">
        <div className="status-badge success">Growth</div>
        <h3>Real-time Statistics</h3>
        <div className="stats-grid" style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <div className="content-card" style={{ margin: 0, borderLeftColor: '#3182ce' }}>
            <strong>Total Users:</strong> 1,234
          </div>
          <div className="content-card" style={{ margin: 0, borderLeftColor: '#e53e3e' }}>
            <strong>Active Sessions:</strong> 567
          </div>
          <div className="content-card" style={{ margin: 0, borderLeftColor: '#38a169' }}>
            <strong>Completion Rate:</strong> 89%
          </div>
        </div>
        
        <button 
          className="action-button-link"
          onClick={() => openDialog('drawer-4', { overlap: true })}
        >
          Adjust Settings (Overlap) →
        </button>
      </div>
    </Drawer>
  );
};

export default DrawerContent3;
