import { DIALOG_MAIN_KEY } from "./constants";
import type { BuildDialogUrlOptions, DialogPropValue } from "./types";

/**
 * Build a URL that opens a specific dialog.
 *
 * Reads `window.location.pathname` and `window.location.search` to preserve
 * existing query params when `overlap` is true.
 *
 * @param dialogKey - The key identifying the dialog to open.
 * @param options - Optional props, overlap behavior, and pathname override.
 * @param dialogParamKey - The query param key for the dialog identifier. Defaults to `DIALOG_MAIN_KEY`.
 * @returns A fully-formed URL string (pathname + search).
 */
export function buildDialogUrl(
  dialogKey: string,
  options?: BuildDialogUrlOptions,
  dialogParamKey: string = DIALOG_MAIN_KEY,
): string {
  const { props, overlap = false, pathName } = options ?? {};

  const pathname = pathName ?? window.location.pathname;

  // Start from existing params when overlapping, otherwise start fresh
  const params = overlap
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();

  // Set the dialog key
  params.set(dialogParamKey, dialogKey);

  // Append custom props prefixed with the dialog key
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      params.set(`${dialogKey}.${key}`, serializePropValue(value));
    }
  }

  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

/**
 * Build a URL that closes a specific dialog.
 *
 * Removes the dialog's main key and all its prefixed props from the
 * current query params.
 *
 * @param dialogKey - The key identifying the dialog to close.
 * @param dialogParamKey - The query param key for the dialog identifier. Defaults to `DIALOG_MAIN_KEY`.
 * @returns A URL string with the dialog params removed.
 */
export function buildCloseDialogUrl(
  dialogKey: string,
  dialogParamKey: string = DIALOG_MAIN_KEY,
): string {
  const pathname = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  // Remove the main dialog key if it matches
  if (params.get(dialogParamKey) === dialogKey) {
    params.delete(dialogParamKey);
  }

  // Remove all props prefixed with the dialog key
  const keysToDelete: string[] = [];
  params.forEach((_value, key) => {
    if (key.startsWith(`${dialogKey}.`)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => params.delete(key));

  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

/**
 * Build a URL that closes all currently open dialogs.
 *
 * Removes the dialog param key and all params that look like dialog props
 * (i.e. any key registered in `validDialogKeys`).
 *
 * @param validDialogKeys - Array of all registered dialog keys, used to identify which params to strip.
 * @param dialogParamKey - The query param key for the dialog identifier. Defaults to `DIALOG_MAIN_KEY`.
 * @returns A URL string with all dialog-related params removed.
 */
export function buildCloseAllDialogsUrl(
  validDialogKeys: string[],
  dialogParamKey: string = DIALOG_MAIN_KEY,
): string {
  const pathname = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  // Remove the main dialog param
  params.delete(dialogParamKey);

  // Remove all props for every registered dialog key
  const keysToDelete: string[] = [];
  params.forEach((_value, key) => {
    for (const dialogKey of validDialogKeys) {
      if (key.startsWith(`${dialogKey}.`)) {
        keysToDelete.push(key);
        break;
      }
    }
  });
  keysToDelete.forEach((key) => params.delete(key));

  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Serialize a prop value to a string suitable for URL query params.
 */
function serializePropValue(value: DialogPropValue): string {
  return String(value);
}
