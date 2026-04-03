// Constants
export { DIALOG_MAIN_KEY, DIALOG_DELAY_TO_CLOSE } from "./constants";

// Types
export type {
  DialogPropValue,
  RouterAdapter,
  DialogEntry,
  DialogMap,
  DialogsValveConfig,
  BuildDialogUrlOptions,
  DialogsValveContextValue,
} from "./types";

// URL utilities
export {
  buildDialogUrl,
  buildCloseDialogUrl,
  buildCloseAllDialogsUrl,
} from "./url-builder";

// Query param utilities
export {
  extractDialogProps,
  getActiveDialogKeys,
  cleanUpQueryParams,
  validateDialogKeys,
  parsePropValue,
} from "./query-params-utils";

// React — Provider
export { DialogsValveProvider } from "./provider";
export type { DialogsValveProviderProps } from "./provider";

// React — Hook
export { useDialogsValve } from "./hooks";

// React — Factory for typed systems
export { createDialogsValve } from "./factory";
