import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';

const DrawerContent7: React.FC = () => {
  const { openDialog } = useDialogsValve()!;

  return (
    <div className="drawer-demo-content">
      <div className="status-badge warning">Helpful</div>
      <h3>Quick Tips</h3>
      <div className="content-card">
        <ol style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>Deep link to any drawer state</li>
          <li>Press Escape to close the top most</li>
          <li>SSR compatible out of the box</li>
          <li>Generic router adapter</li>
        </ol>
      </div>

      <button 
        className="action-button-link"
        onClick={() => openDialog('drawer-8', { overlap: true })}
      >
        Recent Activity (Overlap) →
      </button>
    </div>
  );
};

export default DrawerContent7;
