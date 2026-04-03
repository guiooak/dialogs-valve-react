/**
 * Thin abstraction over browser APIs (window, document, location).
 *
 * Centralises every read of `window.location` and event listener setup
 * so the rest of the codebase never touches globals directly.
 * This makes the code easier to test and keeps SSR-safety concerns in a single place.
 */

/**
 * Get the current URL search string (e.g. `"?dlg=my-dialog&foo=bar"`).
 * Returns an empty string when `window` is not available (SSR).
 */
export function getLocationSearch(): string {
  if (typeof window === "undefined") return "";
  return window.location.search;
}

/**
 * Get the current URL pathname (e.g. `"/app/dashboard"`).
 * Returns `"/"` when `window` is not available (SSR).
 */
export function getLocationPathname(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname;
}

/**
 * Listen for location changes (popstate and DOM changes that might indicate pushState).
 * Returns an unsubscribe function.
 */
export function addLocationChangeListener(callback: () => void): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  window.addEventListener("popstate", callback);

  // Fallback for pushState/replaceState changes (they don't fire popstate)
  // using a MutationObserver on the document as a proxy for URL changes
  // made by most SPA routers.
  const observer = new MutationObserver(callback);
  observer.observe(document, { subtree: true, childList: true });

  return () => {
    window.removeEventListener("popstate", callback);
    observer.disconnect();
  };
}
