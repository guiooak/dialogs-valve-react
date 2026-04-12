import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getLocationSearch,
  getLocationPathname,
  addLocationChangeListener,
  pushState,
} from "../browser";

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// getLocationSearch
// ---------------------------------------------------------------------------

describe("getLocationSearch", () => {
  it("returns window.location.search in a browser environment", () => {
    // Arrange — jsdom initialises with an empty search; navigate to a known URL
    window.history.pushState({}, "", "/page?dialog=my-dialog");
    // Act
    const result = getLocationSearch();
    // Assert
    expect(result).toBe("?dialog=my-dialog");
  });

  it("returns an empty string when window is undefined (SSR)", () => {
    // Arrange
    vi.stubGlobal("window", undefined);
    // Act
    const result = getLocationSearch();
    // Assert
    expect(result).toBe("");
  });
});

// ---------------------------------------------------------------------------
// getLocationPathname
// ---------------------------------------------------------------------------

describe("getLocationPathname", () => {
  it("returns window.location.pathname in a browser environment", () => {
    // Arrange
    window.history.pushState({}, "", "/my/path");
    // Act
    const result = getLocationPathname();
    // Assert
    expect(result).toBe("/my/path");
  });

  it("returns '/' when window is undefined (SSR)", () => {
    // Arrange
    vi.stubGlobal("window", undefined);
    // Act
    const result = getLocationPathname();
    // Assert
    expect(result).toBe("/");
  });
});

// ---------------------------------------------------------------------------
// addLocationChangeListener
// ---------------------------------------------------------------------------

describe("addLocationChangeListener", () => {
  it("returns a no-op cleanup function when window is undefined (SSR)", () => {
    // Arrange
    vi.stubGlobal("window", undefined);
    // Act
    const cleanup = addLocationChangeListener(() => {});
    // Assert — cleanup must exist and be callable without throwing
    expect(typeof cleanup).toBe("function");
    expect(() => cleanup()).not.toThrow();
  });

  it("returns a no-op cleanup function when document is undefined (SSR)", () => {
    // Arrange — window exists but document does not
    vi.stubGlobal("document", undefined);
    // Act
    const cleanup = addLocationChangeListener(() => {});
    // Assert
    expect(typeof cleanup).toBe("function");
    expect(() => cleanup()).not.toThrow();
  });

  it("invokes the callback when a popstate event is dispatched", () => {
    // Arrange
    const callback = vi.fn();
    addLocationChangeListener(callback);
    // Act
    window.dispatchEvent(new PopStateEvent("popstate"));
    // Assert
    expect(callback).toHaveBeenCalledOnce();
  });

  it("stops invoking the callback after the cleanup function is called", () => {
    // Arrange
    const callback = vi.fn();
    const cleanup = addLocationChangeListener(callback);
    // Act
    cleanup();
    window.dispatchEvent(new PopStateEvent("popstate"));
    // Assert
    expect(callback).not.toHaveBeenCalled();
  });

  it("creates a MutationObserver that observes the document with subtree and childList", () => {
    // Arrange
    const observeSpy = vi.fn();
    const disconnectSpy = vi.fn();
    const MockObserver = vi.fn(() => ({
      observe: observeSpy,
      disconnect: disconnectSpy,
    }));
    vi.stubGlobal("MutationObserver", MockObserver);
    // Act
    addLocationChangeListener(() => {});
    // Assert
    expect(MockObserver).toHaveBeenCalledOnce();
    expect(observeSpy).toHaveBeenCalledWith(document, {
      subtree: true,
      childList: true,
    });
  });

  it("disconnects the MutationObserver when the cleanup function is called", () => {
    // Arrange
    const disconnectSpy = vi.fn();
    const MockObserver = vi.fn(() => ({
      observe: vi.fn(),
      disconnect: disconnectSpy,
    }));
    vi.stubGlobal("MutationObserver", MockObserver);
    const cleanup = addLocationChangeListener(() => {});
    // Act
    cleanup();
    // Assert
    expect(disconnectSpy).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// pushState
// ---------------------------------------------------------------------------

describe("pushState", () => {
  it("calls window.history.pushState with the provided URL", () => {
    // Arrange
    const pushStateSpy = vi.spyOn(window.history, "pushState");
    // Act
    pushState("/new-path?dialog=test");
    // Assert
    expect(pushStateSpy).toHaveBeenCalledWith({}, "", "/new-path?dialog=test");
    pushStateSpy.mockRestore();
  });

  it("is a no-op when window is undefined (SSR)", () => {
    // Arrange
    vi.stubGlobal("window", undefined);
    // Act / Assert — must not throw
    expect(() => pushState("/any")).not.toThrow();
  });
});
