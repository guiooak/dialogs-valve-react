import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';

const DrawerContent11: React.FC = () => {
  const { openDialog } = useDialogsValve()!;

  return (
    <div className="drawer-demo-content">
      <div className="status-badge info">Infrastructure</div>
      <h3>System Status</h3>
      <div className="stats-grid" style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        <div className="content-card" style={{ margin: 0, borderLeftColor: '#38a169' }}>
          <strong>Server:</strong> Online
        </div>
        <div className="content-card" style={{ margin: 0, borderLeftColor: '#3182ce' }}>
          <strong>Uptime:</strong> 99.9%
        </div>
      </div>

      <button 
        className="action-button-link"
        onClick={() => openDialog('drawer-12', { overlap: true })}
      >
        View Resources (Overlap) →
      </button>
    </div>
  );
};

export default DrawerContent11;
