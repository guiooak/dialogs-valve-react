import { useDialogsValve } from "@dialogs-valve/react";
import Drawer from "../../components/Drawer/Drawer";

type OverlapDrawerAProps = {
  open: boolean;
  onClose: () => void;
};

const OverlapDrawerA: React.FC<OverlapDrawerAProps> = ({ open, onClose }) => {
  const { openDialog } = useDialogsValve()!;

  return (
    <Drawer open={open} onClose={onClose} title="Drawer A">
      <div className="dialog-content">
        <span className="badge badge-primary">Step 1 of 2</span>
        <p>
          This is the first drawer. Click below to open Drawer B <em>on top</em>{" "}
          — both will be active in the URL simultaneously.
        </p>
        <p>
          Watch the URL Inspector: after clicking, you'll see two{" "}
          <code>dialog</code> params appear.
        </p>
        <div className="dialog-actions">
          <button
            className="btn btn-primary"
            onClick={() => openDialog("overlap-drawer-b", { overlap: true })}
          >
            Open Drawer B on top →
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export default OverlapDrawerA;
