import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { initDialogsValve } from "../factories";
import { DIALOG_MAIN_KEY, DIALOG_DELAY_TO_CLOSE } from "../constants";
import type { DialogMap } from "../types";

vi.mock("../browser", () => ({
  getLocationSearch: vi.fn(() => ""),
  addLocationChangeListener: vi.fn(() => () => {}),
  pushState: vi.fn(),
}));

import { getLocationSearch } from "../browser";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MockDialog = ({ open }: { open: boolean }) => (
  <div data-testid="dialog" data-open={String(open)} />
);

const registry = {
  "user-profile": { Component: MockDialog },
  settings: { Component: MockDialog },
} as const satisfies DialogMap;

// ---------------------------------------------------------------------------
// Return shape
// ---------------------------------------------------------------------------

describe("initDialogsValve — return shape", () => {
  it("returns all expected React and utility exports", () => {
    // Arrange / Act
    const valve = initDialogsValve(registry);
    // Assert — every documented export is present
    expect(typeof valve.DialogsValveProvider).toBe("function");
    expect(typeof valve.useDialogsValve).toBe("function");
    expect(typeof valve.buildDialogUrl).toBe("function");
    expect(typeof valve.buildCloseDialogUrl).toBe("function");
    expect(typeof valve.buildCloseAllDialogsUrl).toBe("function");
    expect(typeof valve.extractDialogProps).toBe("function");
    expect(typeof valve.getActiveDialogKeys).toBe("function");
    expect(typeof valve.cleanUpQueryParams).toBe("function");
    expect(typeof valve.validateDialogKeys).toBe("function");
    expect(typeof valve.parsePropValue).toBe("function");
    expect(valve.DIALOG_MAIN_KEY).toBeDefined();
    expect(valve.DIALOG_DELAY_TO_CLOSE).toBeDefined();
  });

  it("re-exports DIALOG_MAIN_KEY with the value 'dialog'", () => {
    // Arrange / Act
    const { DIALOG_MAIN_KEY: key } = initDialogsValve(registry);
    // Assert
    expect(key).toBe(DIALOG_MAIN_KEY);
    expect(key).toBe("dialog");
  });

  it("re-exports DIALOG_DELAY_TO_CLOSE with the value 300", () => {
    // Arrange / Act
    const { DIALOG_DELAY_TO_CLOSE: delay } = initDialogsValve(registry);
    // Assert
    expect(delay).toBe(DIALOG_DELAY_TO_CLOSE);
    expect(delay).toBe(300);
  });
});

// ---------------------------------------------------------------------------
// Pre-bound provider
// ---------------------------------------------------------------------------

describe("initDialogsValve — DialogsValveProvider", () => {
  it("renders children without requiring a dialogs prop", () => {
    // Arrange
    const { DialogsValveProvider, useDialogsValve } =
      initDialogsValve(registry);
    // Act — provider is used without passing dialogs; it is pre-bound
    const { result } = renderHook(() => useDialogsValve(), {
      wrapper: ({ children }) => (
        <DialogsValveProvider onNavigate={vi.fn()}>
          {children}
        </DialogsValveProvider>
      ),
    });
    // Assert — context is available, which means the provider rendered correctly
    expect(result.current).not.toBeNull();
  });

  it("forwards onNavigate and config to the underlying provider", () => {
    // Arrange
    const onNavigate = vi.fn();
    vi.mocked(getLocationSearch).mockReturnValue("");
    const { DialogsValveProvider, useDialogsValve } =
      initDialogsValve(registry);
    const { result } = renderHook(() => useDialogsValve(), {
      wrapper: ({ children }) => (
        <DialogsValveProvider
          onNavigate={onNavigate}
          config={{ dialogParamKey: "dlg" }}
        >
          {children}
        </DialogsValveProvider>
      ),
    });
    // Act
    act(() => {
      result.current?.openDialog("user-profile");
    });
    // Assert — onNavigate is called and the custom param key is used
    expect(onNavigate).toHaveBeenCalledWith(
      expect.stringContaining("dlg=user-profile"),
    );
  });
});

// ---------------------------------------------------------------------------
// useDialogsValve hook
// ---------------------------------------------------------------------------

describe("initDialogsValve — useDialogsValve", () => {
  it("returns null and logs console.error when used outside the provider", () => {
    // Arrange
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { useDialogsValve } = initDialogsValve(registry);
    // Act
    const { result } = renderHook(() => useDialogsValve());
    // Assert
    expect(result.current).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("DialogsValveProvider"),
    );
    errorSpy.mockRestore();
  });

  it("returns the context value when used inside the pre-bound provider", () => {
    // Arrange
    const { DialogsValveProvider, useDialogsValve } =
      initDialogsValve(registry);
    // Act
    const { result } = renderHook(() => useDialogsValve(), {
      wrapper: ({ children }) => (
        <DialogsValveProvider onNavigate={vi.fn()}>
          {children}
        </DialogsValveProvider>
      ),
    });
    // Assert
    expect(result.current).not.toBeNull();
    expect(typeof result.current?.openDialog).toBe("function");
    expect(typeof result.current?.closeDialog).toBe("function");
    expect(typeof result.current?.isOpen).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// Utility pass-throughs
// ---------------------------------------------------------------------------

describe("initDialogsValve — utility functions", () => {
  beforeEach(() => {
    vi.mocked(getLocationSearch).mockReturnValue("");
  });

  it("buildDialogUrl produces a URL containing the dialog key", () => {
    // Arrange
    const { buildDialogUrl } = initDialogsValve(registry);
    // Act
    const result = buildDialogUrl("user-profile");
    // Assert
    expect(result).toContain("dialog=user-profile");
  });

  it("buildCloseDialogUrl produces a URL without the dialog key", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue("?dialog=user-profile");
    const { buildCloseDialogUrl } = initDialogsValve(registry);
    // Act
    const result = buildCloseDialogUrl("user-profile");
    // Assert
    expect(result).not.toContain("user-profile");
  });

  it("buildCloseAllDialogsUrl returns an empty string", () => {
    // Arrange
    vi.mocked(getLocationSearch).mockReturnValue(
      "?dialog=user-profile&dialog=settings",
    );
    const { buildCloseAllDialogsUrl } = initDialogsValve(registry);
    // Act
    const result = buildCloseAllDialogsUrl();
    // Assert
    expect(result).toBe("");
  });

  it("extractDialogProps returns props for the given dialog key", () => {
    // Arrange
    const { extractDialogProps } = initDialogsValve(registry);
    // Act
    const result = extractDialogProps(
      "?dialog=user-profile&user-profile.userId=42",
      "user-profile",
    );
    // Assert
    expect(result).toEqual({ userId: "42" });
  });

  it("getActiveDialogKeys returns keys present in the search string", () => {
    // Arrange
    const { getActiveDialogKeys } = initDialogsValve(registry);
    // Act
    const result = getActiveDialogKeys("?dialog=settings", "dialog");
    // Assert
    expect(result).toEqual(["settings"]);
  });

  it("cleanUpQueryParams removes the specified dialog key and its props", () => {
    // Arrange
    const { cleanUpQueryParams } = initDialogsValve(registry);
    // Act
    const result = cleanUpQueryParams(
      "?dialog=user-profile&user-profile.tab=info",
      "dialog",
      "user-profile",
    );
    // Assert
    expect(result).toBe("");
  });

  it("validateDialogKeys filters out keys not in the valid set", () => {
    // Arrange
    const { validateDialogKeys } = initDialogsValve(registry);
    // Act
    const result = validateDialogKeys(
      ["user-profile", "unknown"],
      ["user-profile"],
    );
    // Assert
    expect(result).toEqual(["user-profile"]);
  });

  it("parsePropValue correctly decodes a boolean sentinel", () => {
    // Arrange
    const { parsePropValue } = initDialogsValve(registry);
    // Act / Assert
    expect(parsePropValue("bool.true")).toBe(true);
    expect(parsePropValue("bool.false")).toBe(false);
  });
});
