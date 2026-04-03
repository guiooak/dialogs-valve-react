import {
  DIALOG_BOOLEAN_FALSE,
  DIALOG_BOOLEAN_TRUE,
  DIALOG_NUMBER_PREFIX,
  DIALOG_NUMBER_REGEX,
  DIALOG_PROP_PREFIX_SEPARATOR,
} from "./constants";
import type { DialogPropValue } from "./types";

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
