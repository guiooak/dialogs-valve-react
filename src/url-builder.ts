import {
  DIALOG_BOOLEAN_PREFIX,
  DIALOG_MAIN_KEY,
  DIALOG_NUMBER_PREFIX,
  DIALOG_PROP_PREFIX_SEPARATOR,
} from "./constants";
import { getLocationPathname, getLocationSearch } from "./location";
import type { BuildDialogUrlOptions, DialogPropValue } from "./types";

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
        serializePropValue(value)
      )
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
