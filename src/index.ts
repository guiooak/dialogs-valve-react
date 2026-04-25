// Types
export type {
  DialogPropValue,
  onNavigateType,
  DialogEntry,
  DialogMap,
  InferDialogKeys,
  DialogsValveConfig,
  BuildDialogUrlOptions,
  DialogsValveContextValue,
  RegisteredDialogKeys,
} from "./types";

// Module augmentation slot — consumers extend DialogsValveRegistry to auto-type all hooks/helpers
export type { DialogsValveRegistry } from "./types";

// React
export { DialogsValveProvider } from "./provider";
export type { DialogsValveProviderProps } from "./provider";
export { useDialogsValve } from "./hooks";

// URL builders & query param helpers
export {
  buildDialogUrl,
  buildCloseDialogUrl,
  buildCloseAllDialogsUrl,
  extractDialogProps,
  getActiveDialogKeys,
  cleanUpQueryParams,
  validateDialogKeys,
  parsePropValue,
} from "./services";

// Constants
export { DIALOG_MAIN_KEY, DIALOG_DELAY_TO_CLOSE } from "./constants";
