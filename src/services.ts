import {
  DIALOG_BOOLEAN_FALSE,
  DIALOG_BOOLEAN_TRUE,
  DIALOG_NUMBER_PREFIX,
  DIALOG_NUMBER_REGEX,
  DIALOG_PROP_PREFIX_SEPARATOR,
  DIALOG_BOOLEAN_PREFIX,
  DIALOG_MAIN_KEY,
} from "./constants";
import { getLocationSearch } from "./browser";
import type {
  BuildDialogUrlOptions,
  DialogPropValue,
  RegisteredDialogKeys,
} from "./types";

/*
 * QUERY PARAMS HELPERS
 */

export function extractDialogProps<TKeys extends string = RegisteredDialogKeys>(
  search: string,
  dialogKey: TKeys,
): Record<string, DialogPropValue> {
  const params = new URLSearchParams(search);
  const propPrefix = `${dialogKey}${DIALOG_PROP_PREFIX_SEPARATOR}`;
  const result: Record<string, DialogPropValue> = {};

  // Match the exact `dialogKey + separator` prefix (mirrors
  // `deleteDialogPropParams`). A loose `includes()` substring match would
  // wrongly pull in unrelated params that merely contain the prefix elsewhere
  // (e.g. extracting `xuser.id` as a prop of dialog `user`).
  params.forEach((value, key) => {
    if (key.startsWith(propPrefix)) {
      const realPropKey = key.slice(propPrefix.length);
      result[realPropKey] = parsePropValue(value);
    }
  });

  return result;
}

export function getActiveDialogKeys<
  TKeys extends string = RegisteredDialogKeys,
>(search: string, dialogParamKey: string): TKeys[] {
  const params = new URLSearchParams(search);
  const allDialogKeys = params.getAll(dialogParamKey);
  return allDialogKeys.filter(
    (value, index, array) => array.indexOf(value) === index,
  ) as TKeys[];
}

export function cleanUpQueryParams<TKeys extends string = RegisteredDialogKeys>(
  search: string,
  dialogParamKey: string,
  dialogKey: TKeys,
): string {
  const params = new URLSearchParams(search);

  params.delete(dialogParamKey, dialogKey);

  // Match the exact prop prefix so unrelated query params are preserved (see
  // `deleteDialogPropParams`).
  deleteDialogPropParams(params, dialogKey);

  return params.toString();
}

export function validateDialogKeys<TKeys extends string = RegisteredDialogKeys>(
  keys: TKeys[],
  validKeys: TKeys[],
): TKeys[] {
  return keys.filter((key) => {
    if (validKeys.includes(key)) {
      return true;
    }

    console.warn(
      `DialogsController: Invalid dialog key was provided. ("${key}") \n`,
    );

    return false;
  });
}

export function parsePropValue(value: string): DialogPropValue {
  if (value.startsWith(DIALOG_BOOLEAN_PREFIX)) {
    return parsePropBooleanValue(value);
  }

  if (value.startsWith(DIALOG_NUMBER_PREFIX)) {
    return parsePropNumberValue(value);
  }

  return value;
}

function parsePropBooleanValue(value: string) {
  if (value === DIALOG_BOOLEAN_TRUE) {
    return true;
  }

  if (value === DIALOG_BOOLEAN_FALSE) {
    return false;
  }

  console.error(
    `@dialogs-valve/react: Invalid boolean prop value was provided. ("${value}") \n`,
  );

  return value;
}

function parsePropNumberValue(value: string) {
  const numericPart = value.slice(DIALOG_NUMBER_PREFIX.length);
  if (DIALOG_NUMBER_REGEX.test(numericPart)) {
    return Number(numericPart);
  }

  console.error(
    `@dialogs-valve/react: Invalid number prop value was provided. ("${value}") \n`,
  );

  return value;
}

/*
 * URL BUILDERS
 */

export function buildDialogUrl<TKeys extends string = RegisteredDialogKeys>(
  dialogKey: TKeys,
  options?: BuildDialogUrlOptions,
  dialogParamKey: string = DIALOG_MAIN_KEY,
): string {
  const { props, overlap = true, pathName } = options ?? {};

  // For a cross-route `pathName`, start from a clean query; otherwise build on
  // top of the current location's params.
  const params = new URLSearchParams(!pathName ? getLocationSearch() : "");

  const allDialogKeys = params.getAll(dialogParamKey);

  if (overlap && !allDialogKeys.includes(dialogKey)) {
    params.append(dialogParamKey, dialogKey);
  } else {
    params.set(dialogParamKey, dialogKey);
  }

  if (props) {
    Object.entries(props).forEach(([propKey, value]) =>
      params.set(
        buildDialogPropParamKey(dialogKey, propKey),
        serializePropValue(value),
      ),
    );
  }

  // Return a relative, search-only URL when staying on the current route so the
  // consumer's router resolves it against the current location — preserving the
  // pathname and any router `basename` with no work on the consumer's side.
  // Pre-existing query params are kept (we built on top of the current search).
  // For a cross-route `pathName`, the consumer supplies the target path.
  const search = params.toString();
  return pathName ? `${pathName}?${search}` : `?${search}`;
}

function buildDialogPropParamKey(dialogKey: string, propKey: string): string {
  return `${dialogKey}${DIALOG_PROP_PREFIX_SEPARATOR}${propKey}`;
}

export function buildCloseDialogUrl<
  TKeys extends string = RegisteredDialogKeys,
>(dialogKey: TKeys, dialogParamKey: string = DIALOG_MAIN_KEY): string {
  const params = new URLSearchParams(getLocationSearch());

  params.delete(dialogParamKey, dialogKey);

  // Strip only this dialog's serialized props (keys prefixed with
  // `dialogKey + separator`). A loose `includes(dialogKey)` substring match
  // would wipe unrelated params that merely contain the key (e.g. closing
  // "user" deleting "username") and even the `dialog` param itself when the key
  // is a substring of "dialog" — every query param unrelated to dialogs-valve
  // must survive the close.
  deleteDialogPropParams(params, dialogKey);

  // Return a relative URL so the router keeps the current path and `basename`.
  // Pre-existing, non-dialog params remain in `search`. When nothing is left we
  // return "?" rather than "" — an empty string leaves the query untouched
  // under the `history.pushState` fallback, whereas "?" reliably clears it.
  const search = params.toString();
  return search ? `?${search}` : "?";
}

export function buildCloseAllDialogsUrl(
  dialogParamKey: string = DIALOG_MAIN_KEY,
): string {
  const params = new URLSearchParams(getLocationSearch());

  // Remove every open dialog's key and its serialized props, but leave any
  // unrelated query params (e.g. `utm_source`, filters, tabs) untouched.
  const activeDialogKeys = params.getAll(dialogParamKey);
  params.delete(dialogParamKey);
  activeDialogKeys.forEach((dialogKey) =>
    deleteDialogPropParams(params, dialogKey),
  );

  const search = params.toString();
  return search ? `?${search}` : "?";
}

/**
 * Deletes the serialized prop params belonging to `dialogKey` from `params`,
 * matching on the exact `dialogKey + separator` prefix so unrelated params are
 * never removed. Mutates `params` in place.
 */
function deleteDialogPropParams(
  params: URLSearchParams,
  dialogKey: string,
): void {
  const propPrefix = `${dialogKey}${DIALOG_PROP_PREFIX_SEPARATOR}`;
  Array.from(params.keys())
    .filter((key) => key.startsWith(propPrefix))
    .forEach((key) => params.delete(key));
}

function serializePropValue(value: DialogPropValue): string {
  if (typeof value === "boolean") {
    return `${DIALOG_BOOLEAN_PREFIX}${value}`;
  }

  if (typeof value === "number") {
    return `${DIALOG_NUMBER_PREFIX}${value}`;
  }

  return String(value);
}
