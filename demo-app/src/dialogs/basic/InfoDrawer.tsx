import Drawer from "../../components/Drawer/Drawer";

type InfoDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const InfoDrawer: React.FC<InfoDrawerProps> = ({ open, onClose }) => (
  <Drawer open={open} onClose={onClose} title="Info Drawer">
    <div className="dialog-content">
      <p>
        This is a side drawer — the same URL-driven mechanism, different
        presentation. The library is completely agnostic about how your dialog
        component looks.
      </p>
      <p>
        Notice the URL changed when you opened this. Close it and the URL
        returns to its previous state — browser history works out of the box.
      </p>
      <div className="dialog-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  </Drawer>
);

export default InfoDrawer;
