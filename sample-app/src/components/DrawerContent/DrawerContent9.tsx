import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';

const DrawerContent9: React.FC = () => {
  const { openDialog } = useDialogsValve()!;

  return (
    <div className="drawer-demo-content">
      <div className="status-badge info">Knowledge</div>
      <h3>FAQ</h3>
      <div className="content-card">
        <p><strong>Q: Multiple drawers open?</strong></p>
        <p>A: Yes! Use <code>overlap: true</code> to stack them.</p>
        <br />
        <p><strong>Q: Is this accessible?</strong></p>
        <p>A: Yes, includes ARIA and focus management.</p>
      </div>

      <button 
        className="action-button-link"
        onClick={() => openDialog('drawer-10', { overlap: true })}
      >
        Complete Demo (Overlap) →
      </button>
    </div>
  );
};

export default DrawerContent9;
