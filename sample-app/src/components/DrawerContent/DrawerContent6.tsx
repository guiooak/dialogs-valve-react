import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';

const DrawerContent6: React.FC = () => {
  const { openDialog } = useDialogsValve()!;

  return (
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
  );
};

export default DrawerContent6;
