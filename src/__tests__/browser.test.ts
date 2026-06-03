import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getLocationSearch,
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

  it("coalesces rapid MutationObserver mutations into a single callback per frame", () => {
    // Arrange — capture the observer's callback and the scheduled frame callback
    let observerCallback: (() => void) | undefined;
    const MockObserver = vi.fn((cb: () => void) => {
      observerCallback = cb;
      return { observe: vi.fn(), disconnect: vi.fn() };
    });
    vi.stubGlobal("MutationObserver", MockObserver);
    let frameCallback: (() => void) | undefined;
    const rafSpy = vi.fn((cb: () => void) => {
      frameCallback = cb;
      return 1;
    });
    vi.stubGlobal("requestAnimationFrame", rafSpy);
    const callback = vi.fn();
    addLocationChangeListener(callback);

    // Act — three mutations in the same frame
    observerCallback?.();
    observerCallback?.();
    observerCallback?.();

    // Assert — only one frame scheduled, user callback not yet run
    expect(rafSpy).toHaveBeenCalledOnce();
    expect(callback).not.toHaveBeenCalled();

    // When the frame fires, the user callback runs exactly once
    frameCallback?.();
    expect(callback).toHaveBeenCalledOnce();

    // A later mutation schedules a fresh frame
    observerCallback?.();
    expect(rafSpy).toHaveBeenCalledTimes(2);
  });

  it("cancels a pending animation frame on cleanup", () => {
    // Arrange
    let observerCallback: (() => void) | undefined;
    const MockObserver = vi.fn((cb: () => void) => {
      observerCallback = cb;
      return { observe: vi.fn(), disconnect: vi.fn() };
    });
    vi.stubGlobal("MutationObserver", MockObserver);
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 42),
    );
    const cancelSpy = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", cancelSpy);
    const cleanup = addLocationChangeListener(vi.fn());

    // Act — schedule a frame, then clean up before it fires
    observerCallback?.();
    cleanup();

    // Assert — the pending frame is cancelled
    expect(cancelSpy).toHaveBeenCalledWith(42);
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
    expect(pushStateSpy).toHaveBeenCalledWith(
      null,
      "",
      "/new-path?dialog=test",
    );
    pushStateSpy.mockRestore();
  });

  it('normalizes a query-clearing "?" so no bare "?" lingers in the URL', () => {
    // Arrange — a dialog is open on a sub-route
    window.history.pushState(null, "", "/sub-route?dialog=x");
    // Act — close builders return "?" when no dialog params remain
    pushState("?");
    // Assert — query cleared, path kept, no trailing "?"
    expect(window.location.pathname).toBe("/sub-route");
    expect(window.location.search).toBe("");
    expect(window.location.href.endsWith("?")).toBe(false);
  });

  it("resolves a relative search-only URL against the current path", () => {
    // Arrange
    window.history.pushState(null, "", "/sub-route?dialog=x");
    // Act
    pushState("?ref=newsletter&dialog=y");
    // Assert — stays on the current path, query updated
    expect(window.location.pathname).toBe("/sub-route");
    expect(window.location.search).toBe("?ref=newsletter&dialog=y");
  });

  it("is a no-op when window is undefined (SSR)", () => {
    // Arrange
    vi.stubGlobal("window", undefined);
    // Act / Assert — must not throw
    expect(() => pushState("/any")).not.toThrow();
  });
});
