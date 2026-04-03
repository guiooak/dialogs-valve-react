import { useContext } from "react";
import { DialogsValveContext } from "./context";
import { buildDialogUrl } from "./services";
import type { DialogsValveContextValue, BuildDialogUrlOptions } from "./types";

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
 * export const { useDialogs, buildDialogUrl } = createDialogsValve<MyDialogKeys>();
 *
 * // HomePage.tsx
 * const { openDialog } = useDialogs(); // "openDialog" is now typed!
 * const url = buildDialogUrl("drawer-1"); // Now typed with MyDialogKeys!
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

  /**
   * Utility to build a URL for a dialog, pre-typed with your keys.
   */
  const buildDialogUrlTyped = (
    key: TKeys,
    options?: BuildDialogUrlOptions,
    dialogParamKey?: string,
  ): string => buildDialogUrl(key, options, dialogParamKey);

  return {
    useDialogs,
    buildDialogUrl: buildDialogUrlTyped,
  };
}
