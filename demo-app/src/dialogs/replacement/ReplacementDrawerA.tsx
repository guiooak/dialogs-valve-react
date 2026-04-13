import { useDialogsValve } from "../../dialogs-valve-registry";
import Drawer from "../../components/Drawer/Drawer";

type ReplacementDrawerAProps = {
  open: boolean;
  onClose: () => void;
};

const ReplacementDrawerA: React.FC<ReplacementDrawerAProps> = ({
  open,
  onClose,
}) => {
  const { openDialog } = useDialogsValve()!;

  return (
    <Drawer open={open} onClose={onClose} title="Replacement A">
      <div className="dialog-content">
        <span className="badge badge-info">Active</span>
        <p>
          Click below to open Drawer B with <code>overlap: false</code>. This
          drawer will be <em>replaced</em> — not stacked.
        </p>
        <p>
          Watch the URL: the key for this drawer disappears and the new key
          takes its place in a single navigation.
        </p>
        <div className="dialog-actions">
          <button
            className="btn btn-primary"
            onClick={() => openDialog("replacement-b", { overlap: false })}
          >
            Replace with Drawer B
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export default ReplacementDrawerA;
