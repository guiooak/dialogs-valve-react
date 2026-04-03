import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DialogsValveContext } from "./context";
import { DIALOG_DELAY_TO_CLOSE, DIALOG_MAIN_KEY } from "./constants";
import { getLocationSearch } from "./location";
import {
  extractDialogProps,
  getActiveDialogKeys,
  validateDialogKeys,
  buildCloseAllDialogsUrl,
  buildCloseDialogUrl,
  buildDialogUrl,
} from "./services";
import type {
  BuildDialogUrlOptions,
  DialogMap,
  DialogPropValue,
  DialogsValveConfig,
  DialogsValveContextValue,
  RouterAdapter,
} from "./types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type DialogsValveProviderProps<
  TKeys extends string = string,
  TPermissions = unknown,
> = {
  /** Router adapter providing the `navigate` function. */
  router: RouterAdapter;

  /** Registry of dialog keys → components and optional guards. */
  dialogs: DialogMap<TKeys, TPermissions>;

  /** Optional permissions context passed to `canShow` guards. */
  permissions?: TPermissions;

  /** Optional configuration overrides. */
  config?: DialogsValveConfig;

  children: ReactNode;
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function DialogsValveProvider<
  TKeys extends string = string,
  TPermissions = unknown,
>({
  router,
  dialogs,
  permissions,
  config,
  children,
}: DialogsValveProviderProps<TKeys, TPermissions>) {
  const dialogParamKey = config?.dialogParamKey ?? DIALOG_MAIN_KEY;
  const closeDelay = config?.closeDelay ?? DIALOG_DELAY_TO_CLOSE;
  const validDialogKeys = useMemo(() => Object.keys(dialogs), [dialogs]);

  // -----------------------------------------------------------------------
  // Read current dialog keys from URL
  // -----------------------------------------------------------------------
  const [search, setSearch] = useState(() => getLocationSearch());

  // Listen for popstate (back/forward) and re-read search on navigation
  useEffect(() => {
    const onLocationChange = () => {
      setSearch(getLocationSearch());
    };

    window.addEventListener("popstate", onLocationChange);

    // Also poll for pushState/replaceState changes (they don't fire popstate)
    const observer = new MutationObserver(() => {
      if (getLocationSearch() !== search) {
        setSearch(getLocationSearch());
      }
    });
    observer.observe(document, { subtree: true, childList: true });

    return () => {
      window.removeEventListener("popstate", onLocationChange);
      observer.disconnect();
    };
  }, [search]);

  const activeKeys = useMemo(
    () =>
      validateDialogKeys(
        getActiveDialogKeys(search, dialogParamKey),
        validDialogKeys,
      ),
    [search, dialogParamKey, validDialogKeys],
  );

  // -----------------------------------------------------------------------
  // Delayed-close state machine
  // -----------------------------------------------------------------------
  // When a dialog closes, we keep rendering it for `closeDelay` ms so
  // close animations can play. `delayedKeys` holds keys that are still
  // rendered but no longer active.
  const [delayedKeys, setDelayedKeys] = useState<string[]>([]);
  const prevActiveKeysRef = useRef<string[]>(activeKeys);

  useEffect(() => {
    const prevKeys = prevActiveKeysRef.current;
    prevActiveKeysRef.current = activeKeys;

    // Keys that were active before but aren't anymore → need delayed removal
    const closedKeys = prevKeys.filter((k) => !activeKeys.includes(k));
    if (closedKeys.length === 0) return;

    setDelayedKeys((prev) => [...new Set([...prev, ...closedKeys])]);

    const timer = setTimeout(() => {
      setDelayedKeys((prev) => prev.filter((k) => !closedKeys.includes(k)));
    }, closeDelay);

    return () => clearTimeout(timer);
  }, [activeKeys, closeDelay]);

  // All keys to render: currently active + closing (delayed)
  const renderedKeys = useMemo(
    () => [...new Set([...activeKeys, ...delayedKeys])],
    [activeKeys, delayedKeys],
  );

  // -----------------------------------------------------------------------
  // Context value
  // -----------------------------------------------------------------------
  const openDialog = useCallback(
    (key: string, options?: BuildDialogUrlOptions) => {
      router.navigate(buildDialogUrl(key, options, dialogParamKey));
      // Update search immediately so React re-renders without waiting for events
      setTimeout(() => setSearch(getLocationSearch()), 0);
    },
    [router, dialogParamKey],
  );

  const closeDialog = useCallback(
    (key: string) => {
      router.navigate(buildCloseDialogUrl(key, dialogParamKey));
      setTimeout(() => setSearch(getLocationSearch()), 0);
    },
    [router, dialogParamKey],
  );

  const closeAllDialogs = useCallback(() => {
    router.navigate(buildCloseAllDialogsUrl(dialogParamKey));
    setTimeout(() => setSearch(getLocationSearch()), 0);
  }, [router, dialogParamKey]);

  const isOpen = useCallback(
    (key: string) => activeKeys.includes(key),
    [activeKeys],
  );

  const getDialogProps = useCallback(
    (key: string): Record<string, DialogPropValue> =>
      extractDialogProps(search, key),
    [search],
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

  // -----------------------------------------------------------------------
  // Render dialog components
  // -----------------------------------------------------------------------
  const dialogElements = renderedKeys.map((key) => {
    const entry = dialogs[key as TKeys];
    if (!entry) return null;

    // Guard check
    if (entry.canShow && permissions !== undefined) {
      if (!entry.canShow(permissions)) {
        console.error(
          `[dialogs-valve] Dialog "${key}" blocked by canShow guard.`,
        );
        return null;
      }
    }

    const { Component } = entry;
    const dialogProps = extractDialogProps(search, key);
    const isCurrentlyOpen = activeKeys.includes(key);

    return (
      <Component
        key={key}
        open={isCurrentlyOpen}
        onClose={() => closeDialog(key)}
        {...dialogProps}
      />
    );
  });

  return (
    <DialogsValveContext.Provider
      value={contextValue as DialogsValveContextValue<string>}
    >
      {children}
      {dialogElements}
    </DialogsValveContext.Provider>
  );
}
