import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';

const DrawerContent5: React.FC = () => {
  const { openDialog } = useDialogsValve()!;

  return (
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
  );
};

export default DrawerContent5;
