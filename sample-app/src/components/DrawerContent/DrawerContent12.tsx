import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';

const DrawerContent12: React.FC = () => {
  const { openDialog, closeAllDialogs } = useDialogsValve()!;

  return (
    <div className="drawer-demo-content">
      <div className="status-badge success">Guides</div>
      <h3>Resources</h3>
      <ul className="feature-list">
        <li><span>📖</span> <a href="#">Documentation</a></li>
        <li><span>🛠</span> <a href="#">API Reference</a></li>
        <li><span>📦</span> <a href="#">NPM Package</a></li>
      </ul>

      <button 
        className="action-button-link"
        onClick={() => openDialog('drawer-1')}
      >
        Back to Start (Swap)
      </button>

      <button 
        className="action-button-link secondary"
        onClick={() => closeAllDialogs()}
      >
        Close Everything
      </button>
    </div>
  );
};

export default DrawerContent12;
