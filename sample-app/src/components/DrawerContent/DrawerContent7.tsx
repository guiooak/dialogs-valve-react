import { useDialogsValve } from '@dialogs-valve/react';
import './DrawerContent.css';
import Drawer from '../Drawer';

type DrawerContentProps = {
  open: boolean;
  onClose: () => void;
};

const DrawerContent7: React.FC<DrawerContentProps> = ({ open, onClose }) => {
  const { openDialog } = useDialogsValve()!;

  return (
    <Drawer open={open} onClose={onClose} title="Quick Tips">
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
    </Drawer>
  );
};

export default DrawerContent7;
