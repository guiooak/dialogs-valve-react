import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';

const DrawerContent10: React.FC = () => {
  const { openDialog } = useDialogsValve()!;

  return (
    <div className="drawer-demo-content">
      <div className="status-badge success">Finish</div>
      <h3>Thank You!</h3>
      <p>This concludes the demonstration of 10 stacking drawer contents.</p>
      
      <button 
        className="action-button-link secondary"
        onClick={() => openDialog('drawer-11', { overlap: true })}
      >
        System Status (Overlap) →
      </button>
    </div>
  );
};

export default DrawerContent10;
