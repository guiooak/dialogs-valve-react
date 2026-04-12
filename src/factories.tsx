import { useContext, type ReactNode } from "react";
import { DialogsValveContext } from "./context";
import { DialogsValveProvider as BaseProvider } from "./provider";
import { buildDialogUrl } from "./services";
import type {
  DialogMap,
  DialogsValveContextValue,
  BuildDialogUrlOptions,
  onNavigateType,
  DialogsValveConfig,
} from "./types";

/**
 * Creates a set of typed hooks and components for your dialog system.
 * This is the recommended way to use the library — pass your registry once
 * and get back a fully typed `DialogsValveProvider`, `useDialogsValve`, and
 * `buildDialogUrl` that only accept keys that exist in the registry.
 *
 * TypeScript will error at compile time if you pass an unregistered key.
 *
 * @template TMap - The registry map type (inferred from the `dialogs` argument).
 * @template TPermissions - Shape of the permissions/guard context object.
 *
 * @example
 * ```tsx
 * // dialogs-valve-registry.ts
 * export const dialogs = {
 *   "user-profile": { Component: UserProfileModal },
 *   "settings": { Component: SettingsDrawer },
 * } as const satisfies DialogMap;
 *
 * export const { DialogsValveProvider, useDialogsValve, buildDialogUrl } =
 *   createDialogsValve(dialogs);
 *
 * // App.tsx
 * <DialogsValveProvider onNavigate={navigate}>
 *   <App />
 * </DialogsValveProvider>
 *
 * // HomePage.tsx
 * const { openDialog } = useDialogsValve()!;
 * openDialog("user-profile"); // OK
 * openDialog("nonexistent");  // TypeScript error
 * ```
 */
export function createDialogsValve<
  TMap extends DialogMap<string, TPermissions>,
  TPermissions = unknown,
>(dialogs: TMap) {
  type TKeys = keyof TMap & string;

  /**
   * Hook to access the dialogs valve API, pre-typed with the registered keys.
   */
  const useDialogsValve = (): DialogsValveContextValue<TKeys> | null => {
    const context = useContext(DialogsValveContext);

    if (!context) {
      console.error(
        "[dialogs-valve] useDialogsValve() must be used within a <DialogsValveProvider>. " +
          "Make sure you have wrapped your app with <DialogsValveProvider>.",
      );
    }

    return context as DialogsValveContextValue<TKeys> | null;
  };

  /**
   * Utility to build a URL for a dialog, pre-typed with the registered keys.
   */
  const buildDialogUrlTyped = (
    key: TKeys,
    options?: BuildDialogUrlOptions,
    dialogParamKey?: string,
  ): string => buildDialogUrl(key, options, dialogParamKey);

  type ProviderProps = {
    onNavigate?: onNavigateType;
    permissions?: TPermissions;
    config?: DialogsValveConfig;
    children: ReactNode;
  };

  /**
   * Pre-bound provider with the registry already captured.
   * No need to pass `dialogs` as a prop — use this instead of
   * importing `DialogsValveProvider` directly from the library.
   */
  const DialogsValveProvider = (props: ProviderProps) => (
    <BaseProvider<TKeys, TPermissions>
      dialogs={dialogs as DialogMap<TKeys, TPermissions>}
      {...props}
    />
  );

  return {
    DialogsValveProvider,
    useDialogsValve,
    buildDialogUrl: buildDialogUrlTyped,
  };
}
