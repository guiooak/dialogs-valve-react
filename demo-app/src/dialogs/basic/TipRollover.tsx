import Rollover from "../../components/Rollover/Rollover";

type TipRolloverProps = {
  open: boolean;
  onClose: () => void;
};

const TipRollover: React.FC<TipRolloverProps> = ({ open, onClose }) => (
  <Rollover open={open} onClose={onClose} title="Quick Tip">
    <div className="dialog-content">
      <p>
        A rollover is a non-blocking floating panel — it anchors to a corner
        without a backdrop, so the page underneath stays interactive.
      </p>
      <p>
        Same URL-driven mechanism as the modal and drawer — only the
        presentation differs.
      </p>
      <div className="dialog-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Dismiss
        </button>
      </div>
    </div>
  </Rollover>
);

export default TipRollover;
