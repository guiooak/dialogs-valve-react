import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';

const DrawerContent4: React.FC = () => {
  const { openDialog } = useDialogsValve()!;

  return (
    <div className="drawer-demo-content">
      <div className="status-badge info">Configuration</div>
      <h3>Application Settings</h3>
      <div className="content-card">
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked /> Enable notifications
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', cursor: 'pointer' }}>
          <input type="checkbox" /> Dark mode
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked /> Auto-save
        </label>
      </div>

      <button 
        className="action-button-link secondary"
        onClick={() => openDialog('drawer-5', { overlap: true })}
      >
        Learn About Us (Overlap) →
      </button>
    </div>
  );
};

export default DrawerContent4;
