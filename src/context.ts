import { createContext } from "react";
import type { DialogsValveContextValue } from "./types";

/**
 * React context for the dialogs valve system.
 *
 * Consumed via the `useDialogsValve()` hook. Provided by `<DialogsValveProvider>`.
 * Defaults to `null` — the hook will throw if used outside the provider.
 */
export const DialogsValveContext =
  createContext<DialogsValveContextValue<any> | null>(null);
