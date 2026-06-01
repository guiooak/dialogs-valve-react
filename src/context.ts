import { createContext } from "react";
import type { DialogsValveContextValue } from "./types";

/**
 * React context for the dialogs valve system.
 *
 * Consumed via the `useDialogsValve()` hook. Provided by `<DialogsValveProvider>`.
 * Defaults to `null` — when used outside the provider, `useDialogsValve()` logs
 * an error and returns `null`.
 */
export const DialogsValveContext =
  createContext<DialogsValveContextValue<string> | null>(null);
