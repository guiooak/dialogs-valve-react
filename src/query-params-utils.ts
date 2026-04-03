import type { DialogPropValue } from "./types";

/**
 * Extract props for a specific dialog from the current URL search params.
 *
 * Dialog props are stored as `dialogKey.propName=value` in the URL.
 * This function strips the prefix and returns a clean key/value map
 * with values parsed to their correct types (boolean, number, or string).
 *
 * @param search - The URL search string (e.g. `window.location.search`).
 * @param dialogKey - The dialog key whose props to extract.
 * @returns A record of prop names to parsed values.
 */
export function extractDialogProps(
  search: string,
  dialogKey: string,
): Record<string, DialogPropValue> {
  const params = new URLSearchParams(search);
  const prefix = `${dialogKey}.`;
  const result: Record<string, DialogPropValue> = {};

  params.forEach((value, key) => {
    if (key.startsWith(prefix)) {
      const propName = key.slice(prefix.length);
      if (propName) {
        result[propName] = parsePropValue(value);
      }
    }
  });

  return result;
}

/**
 * Get the currently active dialog key(s) from the URL search params.
 *
 * @param search - The URL search string.
 * @param dialogParamKey - The query param key for the dialog identifier.
 * @returns An array of active dialog keys (usually 0 or 1 entries).
 */
export function getActiveDialogKeys(
  search: string,
  dialogParamKey: string,
): string[] {
  const params = new URLSearchParams(search);
  const value = params.get(dialogParamKey);
  return value ? [value] : [];
}

/**
 * Remove all dialog-related params from a search string.
 *
 * @param search - The URL search string.
 * @param dialogParamKey - The query param key for the dialog identifier.
 * @param validDialogKeys - All registered dialog keys.
 * @returns A cleaned search string (without leading `?`).
 */
export function cleanUpQueryParams(
  search: string,
  dialogParamKey: string,
  validDialogKeys: string[],
): string {
  const params = new URLSearchParams(search);

  // Remove the main dialog param
  params.delete(dialogParamKey);

  // Remove all dialog-prefixed props
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

  return params.toString();
}

/**
 * Validate that dialog keys from the URL are present in the registered dialog map.
 * Emits a `console.warn` for any unrecognized key.
 *
 * @param keys - The dialog keys found in the URL.
 * @param validKeys - The set of registered dialog keys.
 * @returns Only the keys that are valid (exist in the registry).
 */
export function validateDialogKeys(
  keys: string[],
  validKeys: string[],
): string[] {
  const validSet = new Set(validKeys);
  return keys.filter((key) => {
    if (!validSet.has(key)) {
      console.warn(
        `[dialogs-valve] Unknown dialog key "${key}" found in URL. ` +
          `Registered keys: [${validKeys.join(", ")}]`,
      );
      return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Parse a raw string value from a query param into its correct JS type.
 *
 * - `"true"` / `"false"` → `boolean`
 * - Numeric strings → `number`
 * - Everything else → `string`
 */
export function parsePropValue(value: string): DialogPropValue {
  // Booleans
  if (value === "true") return true;
  if (value === "false") return false;

  // Numbers (only finite, non-empty strings)
  if (value !== "" && !isNaN(Number(value))) {
    return Number(value);
  }

  return value;
}
