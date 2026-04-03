/**
 * Thin abstraction over `window.location`.
 *
 * Centralises every read of `window.location` so the rest of the codebase
 * never touches the global directly. This makes the code easier to test
 * and keeps SSR-safety concerns in a single place.
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
