import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';

const DrawerContent1: React.FC = () => {
  const { openDialog } = useDialogsValve()!;

  return (
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
  );
};

export default DrawerContent1;
