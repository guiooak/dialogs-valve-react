import React from 'react';
import './Drawer.css';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

const Drawer: React.FC<DrawerProps> = ({ open, onClose, title, children }) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      
      // Store original overflow to restore it correctly
      const originalOverflow = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        
        // Only restore overflow if there are no other open drawers
        // We look for overlays that don't have the 'closing' class
        const otherOpenDrawers = document.querySelectorAll('.drawer-overlay:not(.closing)');
        if (otherOpenDrawers.length <= 1) {
          document.body.style.overflow = originalOverflow === 'hidden' ? 'unset' : originalOverflow;
        }
      };
    }
  }, [open, onClose]);

  return (
    <div className={`drawer-overlay ${!open ? 'closing' : ''}`} onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer-header">
          <h2 id="drawer-title" className="drawer-title">{title}</h2>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            &times;
          </button>
        </div>
        <div className="drawer-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
