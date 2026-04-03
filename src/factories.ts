import { useContext } from "react";
import { DialogsValveContext } from "./context";
import type { DialogsValveContextValue } from "./types";

/**
 * Creates a set of typed hooks and components for your dialog system.
 * This is the recommended way to use the library to avoid passing
 * generic types to `useDialogsValve` repeatedly.
 *
 * @template TKeys - Allowed keys for the dialogs.
 *
 * @example
 * ```tsx
 * // registry.ts
 * export type MyDialogKeys = "drawer-1" | "drawer-2";
 * export const { useDialogs } = createDialogsValve<MyDialogKeys>();
 *
 * // HomePage.tsx
 * const { openDialog } = useDialogs(); // "openDialog" is now typed!
 * ```
 */
export function createDialogsValve<TKeys extends string = string>() {
  /**
   * Hook to access the dialogs valve API, pre-typed with your keys.
   */
  const useDialogs = (): DialogsValveContextValue<TKeys> | null => {
    const context = useContext(DialogsValveContext);

    if (!context) {
      console.error(
        "[dialogs-valve] useDialogs() must be used within a <DialogsValveProvider>. " +
          "Make sure you have wrapped your app with <DialogsValveProvider>.",
      );
    }

    return context as DialogsValveContextValue<TKeys> | null;
  };

  return {
    useDialogs,
  };
}
