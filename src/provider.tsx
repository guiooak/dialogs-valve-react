import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DialogsValveContext } from "./context";
import { DIALOG_DELAY_TO_CLOSE, DIALOG_MAIN_KEY } from "./constants";
import {
  getLocationSearch,
  addLocationChangeListener,
  pushState,
} from "./browser";
import {
  extractDialogProps,
  getActiveDialogKeys,
  validateDialogKeys,
  buildCloseAllDialogsUrl,
  buildCloseDialogUrl,
  buildDialogUrl,
} from "./services";
import { DialogsController } from "./controller";
import type {
  BuildDialogUrlOptions,
  DialogMap,
  DialogPropValue,
  DialogsValveConfig,
  DialogsValveContextValue,
  onNavigateType,
} from "./types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type DialogsValveProviderProps<
  TKeys extends string = string,
  TPermissions = unknown,
> = {
  /**
   * Callback to perform navigation within the hosting application's router.
   * If not provided, the library falls back to `window.history.pushState`.
   */
  onNavigate?: onNavigateType;

  /** Registry of dialog keys → components and optional guards. */
  dialogs: DialogMap<TKeys, TPermissions>;

  /** Optional permissions context passed to `canShow` guards. */
  permissions?: TPermissions;

  /**
   * Whether `permissions` are still loading and not yet safe to guard against.
   *
   * Set to `true` while permissions load asynchronously: guarded dialogs
   * (those with a `canShow`) are deferred — not rendered — until it flips back
   * to `false`. This prevents a guarded dialog from flashing on first paint, or
   * a guard throwing when it reads a not-yet-populated permissions shape.
   * Dialogs without a `canShow` are unaffected and always render.
   *
   * @default false
   */
  permissionsLoading?: boolean;

  /** Called when a `canShow` guard denies a dialog — useful for surfacing
   * feedback (toast, redirect, analytics). Fires from an effect, once per block event. */
  onUnauthorized?: (key: TKeys, permissions?: TPermissions) => void;

  /** Optional configuration overrides. */
  config?: DialogsValveConfig;

  /**
   * Reactive URL search string supplied by the host router
   * (e.g. `useLocation().search` from React Router).
   * When provided, overrides the library's internal location listener.
   * When omitted, the library falls back to its built-in listener.
   */
  locationSearch?: string;

  children: ReactNode;
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function DialogsValveProvider<
  TKeys extends string = string,
  TPermissions = unknown,
>({
  onNavigate,
  dialogs,
  permissions,
  permissionsLoading,
  onUnauthorized,
  config,
  locationSearch,
  children,
}: DialogsValveProviderProps<TKeys, TPermissions>) {
  const dialogParamKey = config?.dialogParamKey ?? DIALOG_MAIN_KEY;
  const closeDelay = config?.closeDelay ?? DIALOG_DELAY_TO_CLOSE;
  const validDialogKeys = useMemo(
    () => Object.keys(dialogs) as TKeys[],
    [dialogs],
  );

  // -----------------------------------------------------------------------
  // Read current dialog keys from URL
  // -----------------------------------------------------------------------
  const [search, setSearch] = useState(() => getLocationSearch());

  // Listen for location change (popstate or router-triggered DOM changes).
  // Skipped when locationSearch is provided — the parent handles reactivity.
  useEffect(() => {
    if (locationSearch !== undefined) return;
    return addLocationChangeListener(() => {
      const currentSearch = getLocationSearch();
      if (currentSearch !== search) {
        setSearch(currentSearch);
      }
    });
  }, [search, locationSearch]);

  // When locationSearch is provided it acts as the controlled source of truth.
  const effectiveSearch = locationSearch ?? search;

  const activeKeys = useMemo(
    () =>
      validateDialogKeys<TKeys>(
        getActiveDialogKeys(effectiveSearch, dialogParamKey),
        validDialogKeys,
      ),
    [effectiveSearch, dialogParamKey, validDialogKeys],
  );

  // -----------------------------------------------------------------------
  // Navigation Helper
  // -----------------------------------------------------------------------
  const navigate = useCallback(
    (url: string) => {
      if (onNavigate) {
        onNavigate(url);
      } else {
        pushState(url);
      }

      // When locationSearch is not provided, optimistically sync internal state
      // so React re-renders without waiting for the listener to fire.
      if (locationSearch === undefined) {
        setSearch(getLocationSearch());
      }
    },
    [onNavigate, locationSearch],
  );

  // -----------------------------------------------------------------------
  // Context value
  // -----------------------------------------------------------------------
  const openDialog = useCallback(
    (key: string, options?: BuildDialogUrlOptions) => {
      navigate(buildDialogUrl(key, options, dialogParamKey));
    },
    [navigate, dialogParamKey],
  );

  const closeDialog = useCallback(
    (key: string) => {
      navigate(buildCloseDialogUrl(key, dialogParamKey));
    },
    [navigate, dialogParamKey],
  );

  const closeAllDialogs = useCallback(() => {
    navigate(buildCloseAllDialogsUrl(dialogParamKey));
  }, [navigate, dialogParamKey]);

  const isOpen = useCallback(
    (key: TKeys) => activeKeys.includes(key),
    [activeKeys],
  );

  const getDialogProps = useCallback(
    (key: TKeys): Record<string, DialogPropValue> =>
      extractDialogProps(effectiveSearch, key),
    [effectiveSearch],
  );

  const contextValue: DialogsValveContextValue<TKeys> = useMemo(
    () => ({
      openDialog: openDialog as (
        key: TKeys,
        options?: BuildDialogUrlOptions,
      ) => void,
      closeDialog: closeDialog as (key: TKeys) => void,
      closeAllDialogs,
      isOpen: isOpen as (key: TKeys) => boolean,
      getDialogProps: getDialogProps as (
        key: TKeys,
      ) => Record<string, DialogPropValue>,
      dialogParamKey,
    }),
    [
      openDialog,
      closeDialog,
      closeAllDialogs,
      isOpen,
      getDialogProps,
      dialogParamKey,
    ],
  );

  return (
    <DialogsValveContext.Provider
      value={contextValue as DialogsValveContextValue<string>}
    >
      {children}
      <DialogsController
        activeKeys={activeKeys}
        search={effectiveSearch}
        closeDelay={closeDelay}
        dialogs={dialogs}
        permissions={permissions}
        permissionsLoading={permissionsLoading}
        onUnauthorized={onUnauthorized}
        closeDialog={closeDialog}
      />
    </DialogsValveContext.Provider>
  );
}
