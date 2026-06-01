import { useContext } from "react";
import { DialogsValveContext } from "./context";
import type { DialogsValveContextValue, RegisteredDialogKeys } from "./types";

/**
 * Hook to access the dialogs valve API.
 *
 * Must be used within a `<DialogsValveProvider>`. When called outside one, it
 * logs an error and returns `null` (it does not throw), so the return type is
 * nullable — assert it (`useDialogsValve()!`) or guard the result once a
 * provider is guaranteed to be mounted above the caller.
 *
 * @returns The dialogs valve API, or `null` when called outside a
 *   `<DialogsValveProvider>` (an error is logged in that case).
 *
 * @example
 * ```tsx
 * const { openDialog, closeDialog, isOpen } = useDialogsValve()!;
 *
 * openDialog("my-drawer", { props: { userId: "42" } });
 * closeDialog("my-drawer");
 * isOpen("my-drawer"); // boolean
 * ```
 */
export function useDialogsValve<
  TKeys extends string = RegisteredDialogKeys,
>(): DialogsValveContextValue<TKeys> | null {
  const context = useContext(DialogsValveContext);

  if (!context) {
    console.error(
      "[dialogs-valve] useDialogsValve() must be used within a <DialogsValveProvider>. " +
        "Make sure you have wrapped your app with <DialogsValveProvider>.",
    );
  }

  return context as DialogsValveContextValue<TKeys> | null;
}
