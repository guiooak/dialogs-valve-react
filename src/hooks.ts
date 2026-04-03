import { useContext } from "react";
import { DialogsValveContext } from "./context";
import type { DialogsValveContextValue } from "./types";

/**
 * Hook to access the dialogs valve API.
 *
 * Must be used within a `<DialogsValveProvider>`.
 *
 * @returns An object with methods to open, close, and query dialog state.
 *
 * @example
 * ```tsx
 * const { openDialog, closeDialog, isOpen } = useDialogsValve();
 *
 * openDialog("my-drawer", { props: { userId: "42" } });
 * closeDialog("my-drawer");
 * isOpen("my-drawer"); // boolean
 * ```
 */
export function useDialogsValve<
  TKeys extends string = string,
>(): DialogsValveContextValue<TKeys> | null {
  const context = useContext(DialogsValveContext);

  if (!context) {
    console.error(
      "[dialogs-valve] useDialogsValve() must be used within a <DialogsValveProvider>. " +
        "Make sure you have wrapped your app with <DialogsValveProvider>.",
    );
  }

  return context;
}
