import { type ReactNode } from "react";
import { DialogsValveProvider as BaseProvider } from "./provider";
import { useDialogsValve as _useDialogsValve } from "./hooks";
import {
  buildDialogUrl as _buildDialogUrl,
  buildCloseDialogUrl as _buildCloseDialogUrl,
  buildCloseAllDialogsUrl as _buildCloseAllDialogsUrl,
  extractDialogProps as _extractDialogProps,
  getActiveDialogKeys as _getActiveDialogKeys,
  cleanUpQueryParams as _cleanUpQueryParams,
  validateDialogKeys as _validateDialogKeys,
  parsePropValue as _parsePropValue,
} from "./services";
import { DIALOG_MAIN_KEY, DIALOG_DELAY_TO_CLOSE } from "./constants";
import type {
  DialogMap,
  DialogsValveContextValue,
  BuildDialogUrlOptions,
  DialogPropValue,
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
  const useDialogsValve = (): DialogsValveContextValue<TKeys> | null =>
    _useDialogsValve<TKeys>();

  /**
   * Utility to build a URL that opens a dialog, pre-typed with the registered keys.
   */
  const buildDialogUrl = (
    key: TKeys,
    options?: BuildDialogUrlOptions,
    dialogParamKey?: string,
  ): string => _buildDialogUrl(key, options, dialogParamKey);

  /**
   * Utility to build a URL that closes a specific dialog, pre-typed with the registered keys.
   */
  const buildCloseDialogUrl = (key: TKeys, dialogParamKey?: string): string =>
    _buildCloseDialogUrl(key, dialogParamKey);

  /**
   * Utility to build a URL that closes all open dialogs.
   */
  const buildCloseAllDialogsUrl = (dialogParamKey?: string): string =>
    _buildCloseAllDialogsUrl(dialogParamKey);

  /**
   * Extracts the props for a specific dialog from a URL search string,
   * pre-typed with the registered keys.
   */
  const extractDialogProps = (
    search: string,
    dialogKey: TKeys,
  ): Record<string, DialogPropValue> => _extractDialogProps(search, dialogKey);

  /**
   * Returns the list of active dialog keys from a URL search string.
   */
  const getActiveDialogKeys = (
    search: string,
    dialogParamKey: string,
  ): TKeys[] => _getActiveDialogKeys<TKeys>(search, dialogParamKey);

  /**
   * Removes a dialog key and its associated props from a URL search string,
   * pre-typed with the registered keys.
   */
  const cleanUpQueryParams = (
    search: string,
    dialogParamKey: string,
    dialogKey: TKeys,
  ): string => _cleanUpQueryParams(search, dialogParamKey, dialogKey);

  /**
   * Filters a list of raw keys to only those that are registered,
   * returning a typed array of valid dialog keys.
   */
  const validateDialogKeys = (keys: string[], validKeys: string[]): TKeys[] =>
    _validateDialogKeys(keys, validKeys) as TKeys[];

  /**
   * Parses a raw URL query param string into its typed value
   * (string, number, or boolean).
   */
  const parsePropValue = _parsePropValue;

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
    // React stuff
    DialogsValveProvider,
    useDialogsValve,

    // URL builders
    buildDialogUrl,
    buildCloseDialogUrl,
    buildCloseAllDialogsUrl,

    // Query param helpers
    extractDialogProps,
    getActiveDialogKeys,
    cleanUpQueryParams,
    validateDialogKeys,
    parsePropValue,

    // Constants
    DIALOG_MAIN_KEY,
    DIALOG_DELAY_TO_CLOSE,
  };
}
