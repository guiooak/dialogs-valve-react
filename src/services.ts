import {
  DIALOG_BOOLEAN_FALSE,
  DIALOG_BOOLEAN_TRUE,
  DIALOG_NUMBER_PREFIX,
  DIALOG_NUMBER_REGEX,
  DIALOG_PROP_PREFIX_SEPARATOR,
  DIALOG_BOOLEAN_PREFIX,
  DIALOG_MAIN_KEY,
} from "./constants";
import { getLocationPathname, getLocationSearch } from "./location";
import type { BuildDialogUrlOptions, DialogPropValue } from "./types";

/*
 * QUERY PARAMS HELPERS
 */

export function extractDialogProps(
  search: string,
  dialogKey: string,
): Record<string, DialogPropValue> {
  const params = new URLSearchParams(search);
  const propPrefix = `${dialogKey}${DIALOG_PROP_PREFIX_SEPARATOR}`;
  const result: Record<string, DialogPropValue> = {};

  params.forEach((value, key) => {
    if (key?.includes(propPrefix)) {
      const realPropKey = key.replace(propPrefix, "");
      result[realPropKey] = parsePropValue(value);
    }
  });

  return result;
}

export function getActiveDialogKeys(
  search: string,
  dialogParamKey: string,
): string[] {
  const params = new URLSearchParams(search);
  const allDialogKeys = params.getAll(dialogParamKey) || [];
  return allDialogKeys.filter(
    (value, index, array) => array.indexOf(value) === index,
  );
}

export function cleanUpQueryParams(
  search: string,
  dialogParamKey: string,
  dialogKey: string,
): string {
  const params = new URLSearchParams(search);

  params.delete(dialogParamKey, dialogKey);

  Array.from(params.keys())
    .filter((key) => key.includes(dialogKey))
    .forEach((key) => params.delete(key));

  return params.toString();
}

export function validateDialogKeys(
  keys: string[],
  validKeys: string[],
): string[] {
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
  if (value === DIALOG_BOOLEAN_TRUE) {
    return true;
  }

  if (value === DIALOG_BOOLEAN_FALSE) {
    return false;
  }

  if (DIALOG_NUMBER_REGEX.test(value)) {
    return Number(value.replace(DIALOG_NUMBER_PREFIX, ""));
  }

  return value;
}

/*
 * URL BUILDERS
 */

export function buildDialogUrl(
  dialogKey: string,
  options?: BuildDialogUrlOptions,
  dialogParamKey: string = DIALOG_MAIN_KEY,
): string {
  const { props, overlap = true, pathName } = options ?? {};

  const pathname = pathName ?? getLocationPathname();
  const params = new URLSearchParams(getLocationSearch());

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

  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

function buildDialogPropParamKey(dialogKey: string, propKey: string): string {
  return `${dialogKey}${DIALOG_PROP_PREFIX_SEPARATOR}${propKey}`;
}

export function buildCloseDialogUrl(
  dialogKey: string,
  dialogParamKey: string = DIALOG_MAIN_KEY,
): string {
  const pathname = getLocationPathname();
  const params = new URLSearchParams(getLocationSearch());

  params.delete(dialogParamKey, dialogKey);

  Array.from(params.keys())
    .filter((key) => key.includes(dialogKey))
    .forEach((key) => params.delete(key));

  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export function buildCloseAllDialogsUrl(
  dialogParamKey: string = DIALOG_MAIN_KEY,
): string {
  const pathname = getLocationPathname();
  const params = new URLSearchParams(getLocationSearch());

  params.delete(dialogParamKey);

  Array.from(params.keys()).forEach((key) => params.delete(key));

  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
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
