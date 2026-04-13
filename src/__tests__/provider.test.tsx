import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { DialogsValveProvider } from "../provider";
import { useDialogsValve } from "../hooks";
import type { DialogMap } from "../types";

vi.mock("../browser", () => ({
  getLocationSearch: vi.fn(() => ""),
  addLocationChangeListener: vi.fn(() => () => {}),
  pushState: vi.fn(),
}));

import {
  getLocationSearch,
  addLocationChangeListener,
  pushState,
} from "../browser";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const MockDialog = ({ open }: { open: boolean }) => (
  <div data-testid="dialog" data-open={String(open)} />
);

const dialogs: DialogMap = {
  "dialog-a": { Component: MockDialog },
  "dialog-b": { Component: MockDialog },
};

type WrapperProps = {
  onNavigate?: (url: string) => void;
  config?: { dialogParamKey?: string; closeDelay?: number };
};

function makeWrapper({ onNavigate, config }: WrapperProps = {}) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <DialogsValveProvider
        dialogs={dialogs}
        onNavigate={onNavigate}
        config={config}
      >
        {children}
      </DialogsValveProvider>
    );
  };
}

// ---------------------------------------------------------------------------
// Initial URL state
// ---------------------------------------------------------------------------

describe("DialogsValveProvider — initial URL state", () => {
  it("isOpen returns true for a dialog key present in the initial URL", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=dialog-a");
    // Act
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper(),
    });
    // Assert
    expect(result.current.isOpen("dialog-a")).toBe(true);
  });

  it("isOpen returns false for a dialog key absent from the initial URL", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue("");
    // Act
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper(),
    });
    // Assert
    expect(result.current.isOpen("dialog-a")).toBe(false);
  });

  it("getDialogProps returns parsed props from the initial URL", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue(
      "?dialog=dialog-a&dialog-a.title=Hello&dialog-a.count=number.5",
    );
    // Act
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper(),
    });
    // Assert
    expect(result.current.getDialogProps("dialog-a")).toEqual({
      title: "Hello",
      count: 5,
    });
  });

  it("exposes the default dialogParamKey 'dialog' on the context", () => {
    // Arrange / Act
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper(),
    });
    // Assert
    expect(result.current.dialogParamKey).toBe("dialog");
  });

  it("exposes a custom dialogParamKey from config", () => {
    // Arrange / Act
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper({ config: { dialogParamKey: "dlg" } }),
    });
    // Assert
    expect(result.current.dialogParamKey).toBe("dlg");
  });
});

// ---------------------------------------------------------------------------
// openDialog
// ---------------------------------------------------------------------------

describe("DialogsValveProvider — openDialog", () => {
  beforeEach(() => {
    vi.mocked(getLocationSearch).mockReturnValue("");
  });

  it("calls onNavigate with a URL containing the dialog key", () => {
    // Arrange
    const onNavigate = vi.fn();
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper({ onNavigate }),
    });
    // Act
    act(() => {
      result.current.openDialog("dialog-a");
    });
    // Assert
    expect(onNavigate).toHaveBeenCalledWith(
      expect.stringContaining("dialog=dialog-a"),
    );
  });

  it("includes serialized props in the navigation URL", () => {
    // Arrange
    const onNavigate = vi.fn();
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper({ onNavigate }),
    });
    // Act
    act(() => {
      result.current.openDialog("dialog-a", { props: { userId: "42" } });
    });
    // Assert
    const calledUrl: string = onNavigate.mock.calls[0][0];
    const url = new URL(calledUrl, "http://x");
    expect(url.searchParams.get("dialog-a.userId")).toBe("42");
  });

  it("uses the custom dialogParamKey in the navigation URL", () => {
    // Arrange
    const onNavigate = vi.fn();
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper({
        onNavigate,
        config: { dialogParamKey: "dlg" },
      }),
    });
    // Act
    act(() => {
      result.current.openDialog("dialog-a");
    });
    // Assert
    const calledUrl: string = onNavigate.mock.calls[0][0];
    expect(calledUrl).toContain("dlg=dialog-a");
    expect(calledUrl).not.toContain("dialog=");
  });

  it("updates isOpen after navigation when the mock URL reflects the new state", () => {
    // Arrange — onNavigate updates the mocked search so setSearch reads the new state
    const onNavigate = vi.fn((url: string) => {
      const search = url.includes("?") ? `?${url.split("?")[1]}` : "";
      vi.mocked(getLocationSearch).mockReturnValue(search);
    });
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper({ onNavigate }),
    });
    // Act
    act(() => {
      result.current.openDialog("dialog-a");
    });
    // Assert
    expect(result.current.isOpen("dialog-a")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// closeDialog
// ---------------------------------------------------------------------------

describe("DialogsValveProvider — closeDialog", () => {
  it("calls onNavigate with a URL that no longer contains the dialog key", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=dialog-a");
    const onNavigate = vi.fn();
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper({ onNavigate }),
    });
    // Act
    act(() => {
      result.current.closeDialog("dialog-a");
    });
    // Assert
    const calledUrl: string = onNavigate.mock.calls[0][0];
    const url = new URL(calledUrl, "http://x");
    expect(url.searchParams.getAll("dialog")).not.toContain("dialog-a");
  });

  it("leaves other open dialogs in the navigation URL", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue(
      "?dialog=dialog-a&dialog=dialog-b",
    );
    const onNavigate = vi.fn();
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper({ onNavigate }),
    });
    // Act
    act(() => {
      result.current.closeDialog("dialog-a");
    });
    // Assert
    const calledUrl: string = onNavigate.mock.calls[0][0];
    const url = new URL(calledUrl, "http://x");
    expect(url.searchParams.getAll("dialog")).toContain("dialog-b");
  });
});

// ---------------------------------------------------------------------------
// closeAllDialogs
// ---------------------------------------------------------------------------

describe("DialogsValveProvider — closeAllDialogs", () => {
  it("calls onNavigate with a URL stripped of all dialog params", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue(
      "?dialog=dialog-a&dialog=dialog-b",
    );
    const onNavigate = vi.fn();
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper({ onNavigate }),
    });
    // Act
    act(() => {
      result.current.closeAllDialogs();
    });
    // Assert
    const calledUrl: string = onNavigate.mock.calls[0][0];
    expect(calledUrl).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Navigation fallback
// ---------------------------------------------------------------------------

describe("DialogsValveProvider — navigation fallback", () => {
  beforeEach(() => {
    vi.mocked(getLocationSearch).mockReturnValue("");
    vi.mocked(pushState).mockClear();
  });

  it("falls back to pushState when no onNavigate prop is provided", () => {
    // Arrange — no onNavigate in the wrapper
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper(),
    });
    // Act
    act(() => {
      result.current.openDialog("dialog-a");
    });
    // Assert
    expect(vi.mocked(pushState)).toHaveBeenCalledWith(
      expect.stringContaining("dialog=dialog-a"),
    );
  });

  it("does not call pushState when onNavigate is provided", () => {
    // Arrange
    const onNavigate = vi.fn();
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper({ onNavigate }),
    });
    // Act
    act(() => {
      result.current.openDialog("dialog-a");
    });
    // Assert
    expect(vi.mocked(pushState)).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Location change listener
// ---------------------------------------------------------------------------

describe("DialogsValveProvider — location change listener", () => {
  it("updates dialog state when the URL changes via the location listener (e.g. back button)", () => {
    // Arrange — capture the listener callback registered by the provider
    let locationChangeCallback: (() => void) | null = null;
    vi.mocked(addLocationChangeListener).mockImplementation((cb) => {
      locationChangeCallback = cb;
      return () => {};
    });
    vi.mocked(getLocationSearch).mockReturnValue("");
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper(),
    });
    // Act — simulate a browser-level URL change (e.g. history.back())
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=dialog-a");
    act(() => {
      locationChangeCallback?.();
    });
    // Assert
    expect(result.current.isOpen("dialog-a")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Invalid keys in URL
// ---------------------------------------------------------------------------

describe("DialogsValveProvider — invalid dialog keys in URL", () => {
  it("ignores unregistered dialog keys and emits a console.warn", () => {
    // Arrange
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=not-registered");
    // Act
    const { result } = renderHook(() => useDialogsValve()!, {
      wrapper: makeWrapper(),
    });
    // Assert — unregistered key is not considered open
    expect(result.current.isOpen("not-registered")).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// closeDelay config
// ---------------------------------------------------------------------------

describe("DialogsValveProvider — closeDelay config", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("unmounts a closed dialog immediately when closeDelay is 0", async () => {
    // Arrange
    vi.useFakeTimers();
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=dialog-a");
    const onNavigate = vi.fn((url: string) => {
      const search = url.includes("?") ? `?${url.split("?")[1]}` : "";
      vi.mocked(getLocationSearch).mockReturnValue(search);
    });

    const { result, rerender } = renderHook(() => useDialogsValve()!, {
      wrapper: function Wrapper({ children }: { children: React.ReactNode }) {
        return (
          <DialogsValveProvider
            dialogs={dialogs}
            onNavigate={onNavigate}
            config={{ closeDelay: 0 }}
          >
            {children}
          </DialogsValveProvider>
        );
      },
    });

    // Act
    act(() => {
      result.current.closeDialog("dialog-a");
    });
    act(() => {
      vi.advanceTimersByTime(0);
    });
    rerender();

    // Assert
    expect(result.current.isOpen("dialog-a")).toBe(false);
  });
});
