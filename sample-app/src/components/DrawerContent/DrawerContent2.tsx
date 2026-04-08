import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';

const DrawerContent2: React.FC = () => {
  const { openDialog } = useDialogsValve()!;

  return (
    <div className="drawer-demo-content">
      <div className="status-badge info">Features</div>
      <h3>Core Capabilities</h3>
      <ul className="feature-list">
        <li><span>✨</span> Responsive design</li>
        <li><span>🌐</span> Accessible navigation</li>
        <li><span>🎬</span> Smooth animations</li>
        <li><span>⌨️</span> Keyboard support</li>
        <li><span>🛠</span> Clean code structure</li>
      </ul>
      
      <button 
        className="action-button-link secondary"
        onClick={() => openDialog('drawer-3', { overlap: true })}
      >
        View Statistics (Overlap) →
      </button>
    </div>
  );
};

export default DrawerContent2;
