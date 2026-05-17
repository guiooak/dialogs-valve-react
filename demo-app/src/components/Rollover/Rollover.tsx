import React from "react";
import "./Rollover.css";

type RolloverProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

const Rollover: React.FC<RolloverProps> = ({
  open,
  onClose,
  title,
  children,
}) => {
  React.useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      const otherOpen = document.querySelectorAll(
        ".rollover:not(.closing), .modal-overlay:not(.closing), .drawer-overlay:not(.closing)",
      );
      if (otherOpen.length <= 1) {
        document.body.style.overflow =
          originalOverflow === "hidden" ? "unset" : originalOverflow;
      }
    };
  }, [open, onClose]);

  return (
    <div
      className={`rollover ${!open ? "closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rollover-title"
    >
      <div className="rollover-header">
        <h2 id="rollover-title" className="rollover-title">
          {title}
        </h2>
        <button
          className="rollover-close"
          onClick={onClose}
          aria-label="Close rollover"
        >
          &times;
        </button>
      </div>
      <div className="rollover-content">{children}</div>
    </div>
  );
};

export default Rollover;
