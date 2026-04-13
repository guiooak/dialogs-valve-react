/**
 * Thin abstraction over browser-specific APIs (window, document, location).
 *
 * This module centralizes all direct access to global browser objects.
 * By abstracting these reads and event listener setups, we ensure:
 * 1. SSR safety - the rest of the codebase doesn't need to check for `window`.
 * 2. Testability - these functions can be mocked easily in a Node.js environment.
 * 3. Maintainability - browser-specific workarounds (like the MutationObserver swap)
 *    are isolated to a single file.
 */

/**
 * Retrieves the current URL search string (e.g., `"?dlg=my-dialog&foo=bar"`).
 *
 * @returns {string} The current search params or an empty string if `window`
 *                   is not available (e.g., during Server-Side Rendering).
 */
export function getLocationSearch(): string {
  if (typeof window === "undefined") return "";
  return window.location.search;
}

/**
 * Subscribes to location changes (both `popstate` and indicative DOM changes).
 *
 * Since many SPA routers use `pushState` and `replaceState` which do not
 * trigger the `popstate` event, we also use a MutationObserver on the document.
 * This acts as a heuristic proxy to detect when navigation might have occurred.
 *
 * @param {() => void} callback - Function to execute when a location change is detected.
 * @returns {() => void} An unsubscribe function to clean up listeners and observers.
 */
export function addLocationChangeListener(callback: () => void): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  window.addEventListener("popstate", callback);

  /**
   * FALLBACK: pushState/replaceState changes do not trigger the native 'popstate' event.
   * To detect these changes without monkey-patching the history API, we observe
   * DOM mutations which typically happen concurrently with router navigation.
   */
  const observer = new MutationObserver(callback);
  observer.observe(document, { subtree: true, childList: true });

  return () => {
    window.removeEventListener("popstate", callback);
    observer.disconnect();
  };
}

/**
 * Perform a browser navigation using the generic `history.pushState` API.
 * This is used as the fallback navigation logic when no custom router is provided.
 *
 * @param {string} url - The URL to navigate to.
 */
export function pushState(url: string): void {
  if (typeof window === "undefined") return;
  window.history.pushState({}, "", url);
}
