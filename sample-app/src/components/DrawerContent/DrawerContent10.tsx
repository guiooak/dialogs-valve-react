import { useDialogsValve } from '../../dialogs-valve-registry';
import './DrawerContent.css';
import Drawer from '../Drawer';

type DrawerContentProps = {
  open: boolean;
  onClose: () => void;
};

const DrawerContent10: React.FC<DrawerContentProps> = ({ open, onClose }) => {
  const { openDialog } = useDialogsValve()!;

  return (
    <Drawer open={open} onClose={onClose} title="Final Message">
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
    </Drawer>
  );
};

export default DrawerContent10;
