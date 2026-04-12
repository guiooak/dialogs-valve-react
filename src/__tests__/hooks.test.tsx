import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDialogsValve } from "../hooks";
import { DialogsValveContext } from "../context";
import type { DialogsValveContextValue } from "../types";

// ---------------------------------------------------------------------------
// useDialogsValve
// ---------------------------------------------------------------------------

describe("useDialogsValve", () => {
  it("returns the context value when used inside a DialogsValveContext provider", () => {
    // Arrange
    const mockContextValue: DialogsValveContextValue = {
      openDialog: vi.fn(),
      closeDialog: vi.fn(),
      closeAllDialogs: vi.fn(),
      isOpen: vi.fn(() => false),
      getDialogProps: vi.fn(() => ({})),
      dialogParamKey: "dialog",
    };
    // Act
    const { result } = renderHook(() => useDialogsValve(), {
      wrapper: ({ children }) => (
        <DialogsValveContext.Provider value={mockContextValue}>
          {children}
        </DialogsValveContext.Provider>
      ),
    });
    // Assert
    expect(result.current).toBe(mockContextValue);
  });

  it("returns null when used outside any provider", () => {
    // Arrange
    vi.spyOn(console, "error").mockImplementation(() => {});
    // Act
    const { result } = renderHook(() => useDialogsValve());
    // Assert
    expect(result.current).toBeNull();
    vi.mocked(console.error).mockRestore();
  });

  it("logs a console.error when used outside any provider", () => {
    // Arrange
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    // Act
    renderHook(() => useDialogsValve());
    // Assert
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("DialogsValveProvider"),
    );
    errorSpy.mockRestore();
  });

  it("does not log a console.error when used inside a provider", () => {
    // Arrange
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockContextValue: DialogsValveContextValue = {
      openDialog: vi.fn(),
      closeDialog: vi.fn(),
      closeAllDialogs: vi.fn(),
      isOpen: vi.fn(() => false),
      getDialogProps: vi.fn(() => ({})),
      dialogParamKey: "dialog",
    };
    // Act
    renderHook(() => useDialogsValve(), {
      wrapper: ({ children }) => (
        <DialogsValveContext.Provider value={mockContextValue}>
          {children}
        </DialogsValveContext.Provider>
      ),
    });
    // Assert
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
