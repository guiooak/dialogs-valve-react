import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { DialogsController } from "../controller";
import type { DialogMap } from "../types";

// ---------------------------------------------------------------------------
// Test doubles
// ---------------------------------------------------------------------------

const MockDialog = ({
  open,
  onClose,
  ...rest
}: {
  open: boolean;
  onClose: () => void;
  [key: string]: unknown;
}) => (
  <div
    data-testid="dialog"
    data-open={String(open)}
    data-props={JSON.stringify(rest)}
    onClick={onClose}
  />
);

const dialogs: DialogMap = {
  "dialog-a": { Component: MockDialog },
  "dialog-b": { Component: MockDialog },
};

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("DialogsController — rendering", () => {
  it("renders nothing when activeKeys is empty", () => {
    // Arrange / Act
    render(
      <DialogsController
        activeKeys={[]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    // Assert
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("renders a component for each active dialog key", () => {
    // Arrange / Act
    render(
      <DialogsController
        activeKeys={["dialog-a", "dialog-b"]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    // Assert
    expect(screen.getAllByTestId("dialog")).toHaveLength(2);
  });

  it("renders nothing for a key that is not in the dialogs registry", () => {
    // Arrange / Act
    render(
      <DialogsController
        activeKeys={["unknown-dialog"]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    // Assert
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Props forwarding
// ---------------------------------------------------------------------------

describe("DialogsController — props forwarding", () => {
  it("passes open=true to an active dialog", () => {
    // Arrange / Act
    render(
      <DialogsController
        activeKeys={["dialog-a"]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    // Assert
    expect(screen.getByTestId("dialog")).toHaveAttribute("data-open", "true");
  });

  it("calls closeDialog with the dialog key when onClose is invoked", () => {
    // Arrange
    const closeDialog = vi.fn();
    render(
      <DialogsController
        activeKeys={["dialog-a"]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={closeDialog}
      />,
    );
    // Act
    screen.getByTestId("dialog").click();
    // Assert
    expect(closeDialog).toHaveBeenCalledWith("dialog-a");
  });

  it("forwards deserialized dialog props extracted from the search string", () => {
    // Arrange
    const search =
      "?dialog=dialog-a&dialog-a.title=Hello&dialog-a.count=number.3";
    // Act
    render(
      <DialogsController
        activeKeys={["dialog-a"]}
        search={search}
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    // Assert — props are spread onto the component and serialised in data-props
    const propsAttr = screen.getByTestId("dialog").getAttribute("data-props");
    const props = JSON.parse(propsAttr!);
    expect(props.title).toBe("Hello");
    expect(props.count).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Immediate open — state machine
// ---------------------------------------------------------------------------

describe("DialogsController — immediate open", () => {
  it("renders a newly opened dialog without needing timer advances", () => {
    // Arrange
    const { rerender } = render(
      <DialogsController
        activeKeys={[]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    // Act — add a new active key
    rerender(
      <DialogsController
        activeKeys={["dialog-a"]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    // Assert — dialog is visible immediately
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Delayed close — state machine
// ---------------------------------------------------------------------------

describe("DialogsController — delayed close", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the dialog mounted with open=false immediately after closing", () => {
    // Arrange
    const { rerender } = render(
      <DialogsController
        activeKeys={["dialog-a"]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    // Act — remove from active keys
    rerender(
      <DialogsController
        activeKeys={[]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    // Assert — still in DOM, but open=false (for exit animation)
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("dialog")).toHaveAttribute("data-open", "false");
  });

  it("unmounts the dialog after the closeDelay has elapsed", () => {
    // Arrange
    const { rerender } = render(
      <DialogsController
        activeKeys={["dialog-a"]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    rerender(
      <DialogsController
        activeKeys={[]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    // Act — advance timers past the delay
    act(() => {
      vi.advanceTimersByTime(300);
    });
    // Assert
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("preserves dialog props while the close animation is playing", () => {
    // Arrange — open with serialized props in the URL
    const openSearch =
      "?dialog=dialog-a&dialog-a.title=Hello&dialog-a.count=number.3";
    const { rerender } = render(
      <DialogsController
        activeKeys={["dialog-a"]}
        search={openSearch}
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    // Act — close the dialog: activeKeys empty AND search is cleaned, mimicking
    // the real URL behavior. The dialog is still rendered for the exit animation.
    rerender(
      <DialogsController
        activeKeys={[]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    // Assert — props from the open phase are still forwarded during the close
    // window so content does not flicker mid-animation.
    const propsAttr = screen.getByTestId("dialog").getAttribute("data-props");
    const props = JSON.parse(propsAttr!);
    expect(props.title).toBe("Hello");
    expect(props.count).toBe(3);
  });

  it("drops cached props once a dialog finishes closing", () => {
    // Arrange — open with props, then close
    const { rerender } = render(
      <DialogsController
        activeKeys={["dialog-a"]}
        search="?dialog=dialog-a&dialog-a.title=Hello"
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    rerender(
      <DialogsController
        activeKeys={[]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(300);
    });
    // Act — reopen with no props at all
    rerender(
      <DialogsController
        activeKeys={["dialog-a"]}
        search="?dialog=dialog-a"
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    // Assert — the previous cache must not leak into the fresh open
    const propsAttr = screen.getByTestId("dialog").getAttribute("data-props");
    const props = JSON.parse(propsAttr!);
    expect(props.title).toBeUndefined();
  });

  it("keeps the dialog mounted if the dialog is reopened before the timer fires", () => {
    // Arrange
    const { rerender } = render(
      <DialogsController
        activeKeys={["dialog-a"]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    // Act — close, then immediately reopen
    rerender(
      <DialogsController
        activeKeys={[]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    rerender(
      <DialogsController
        activeKeys={["dialog-a"]}
        search=""
        closeDelay={300}
        dialogs={dialogs}
        closeDialog={vi.fn()}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(300);
    });
    // Assert — still mounted because it was reopened
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("dialog")).toHaveAttribute("data-open", "true");
  });
});

// ---------------------------------------------------------------------------
// canShow guard
// ---------------------------------------------------------------------------

describe("DialogsController — canShow guard", () => {
  it("renders the dialog when canShow returns true and permissions are provided", () => {
    // Arrange
    const guardedDialogs: DialogMap = {
      "guarded-dialog": {
        Component: MockDialog,
        canShow: () => true,
      },
    };
    // Act
    render(
      <DialogsController
        activeKeys={["guarded-dialog"]}
        search=""
        closeDelay={300}
        dialogs={guardedDialogs}
        permissions={{}}
        closeDialog={vi.fn()}
      />,
    );
    // Assert
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });

  it("blocks rendering and logs an error when canShow returns false", () => {
    // Arrange
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const guardedDialogs: DialogMap = {
      "guarded-dialog": {
        Component: MockDialog,
        canShow: () => false,
      },
    };
    // Act
    render(
      <DialogsController
        activeKeys={["guarded-dialog"]}
        search=""
        closeDelay={300}
        dialogs={guardedDialogs}
        permissions={{}}
        closeDialog={vi.fn()}
      />,
    );
    // Assert
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("guarded-dialog"),
    );
    errorSpy.mockRestore();
  });

  it("passes permissions to the canShow function", () => {
    // Arrange
    const canShow = vi.fn(() => true);
    const permissions = { role: "admin" };
    const guardedDialogs: DialogMap = {
      "guarded-dialog": { Component: MockDialog, canShow },
    };
    // Act
    render(
      <DialogsController
        activeKeys={["guarded-dialog"]}
        search=""
        closeDelay={300}
        dialogs={guardedDialogs}
        permissions={permissions}
        closeDialog={vi.fn()}
      />,
    );
    // Assert
    expect(canShow).toHaveBeenCalledWith(permissions);
  });

  it("falls back to URL-extracted props when a closing dialog has no cached entry", () => {
    // Arrange — canShow blocks the initial open render, so the props cache is
    // never written for `dialog-a`. The dialog still lands in renderedKeys via
    // the useState(activeKeys) initializer.
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    let allowed = false;
    const guardedDialogs: DialogMap = {
      "dialog-a": {
        Component: MockDialog,
        canShow: () => allowed,
      },
    };
    const { rerender } = render(
      <DialogsController
        activeKeys={["dialog-a"]}
        search="?dialog=dialog-a&dialog-a.title=Hello"
        closeDelay={300}
        dialogs={guardedDialogs}
        permissions={{}}
        closeDialog={vi.fn()}
      />,
    );
    // Act — unblock the guard and close the dialog. It stays mounted for the
    // exit animation, and since the cache is empty, the controller must fall
    // back to extractDialogProps against the current search.
    allowed = true;
    rerender(
      <DialogsController
        activeKeys={[]}
        search="?dialog-a.title=Fallback"
        closeDelay={300}
        dialogs={guardedDialogs}
        permissions={{}}
        closeDialog={vi.fn()}
      />,
    );
    // Assert
    const propsAttr = screen.getByTestId("dialog").getAttribute("data-props");
    const props = JSON.parse(propsAttr!);
    expect(props.title).toBe("Fallback");
    errorSpy.mockRestore();
  });

  it("skips the canShow guard and renders when permissions prop is not provided", () => {
    // Arrange — canShow returns false, but without permissions the guard is skipped
    const guardedDialogs: DialogMap = {
      "guarded-dialog": {
        Component: MockDialog,
        canShow: () => false,
      },
    };
    // Act
    render(
      <DialogsController
        activeKeys={["guarded-dialog"]}
        search=""
        closeDelay={300}
        dialogs={guardedDialogs}
        // no permissions prop
        closeDialog={vi.fn()}
      />,
    );
    // Assert — rendered despite canShow returning false
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });
});
