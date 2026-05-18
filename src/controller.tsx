import { useEffect, useRef, useState } from "react";
import { extractDialogProps } from "./services";
import type { DialogMap, DialogPropValue } from "./types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type DialogsControllerProps<
  TKeys extends string = string,
  TPermissions = unknown,
> = {
  activeKeys: TKeys[];
  search: string;
  closeDelay: number;
  dialogs: DialogMap<TKeys, TPermissions>;
  permissions?: TPermissions;
  closeDialog: (key: string) => void;
};

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

export function DialogsController<
  TKeys extends string = string,
  TPermissions = unknown,
>({
  activeKeys,
  search,
  closeDelay,
  dialogs,
  permissions,
  closeDialog,
}: DialogsControllerProps<TKeys, TPermissions>) {
  // -------------------------------------------------------------------------
  // Rendered Keys State Machine
  // -------------------------------------------------------------------------
  // We maintain a stable list of keys to render in the DOM.
  // - Additions: Synchronized immediately during render (gap-free opening).
  // - Removals: Synchronized after `closeDelay` via useEffect (smooth exit).
  const [renderedKeys, setRenderedKeys] = useState<TKeys[]>(activeKeys);

  // Cache of last-known props per dialog key. The URL is cleaned the moment
  // a dialog closes, but we keep the dialog mounted for `closeDelay` so its
  // exit animation can play. Reading directly from `search` during that window
  // would yield empty props and visually wipe the dialog's content mid-exit.
  const propsCacheRef = useRef<
    Partial<Record<TKeys, Record<string, DialogPropValue>>>
  >({});

  // Synchronously update renderedKeys if new dialogs are opened.
  // This prevents the "one-frame blank gap" when a drawer first appears.
  const hasNewKeys = activeKeys.some((k) => !renderedKeys.includes(k));
  if (hasNewKeys) {
    setRenderedKeys((prev) => [...new Set([...prev, ...activeKeys])]);
  }

  useEffect(() => {
    // Check if we have keys that are currently rendered but no longer active.
    const hasKeysToRemove = renderedKeys.some((k) => !activeKeys.includes(k));

    if (hasKeysToRemove) {
      const timer = setTimeout(() => {
        // After the delay, we sync the DOM state with the URL state.
        setRenderedKeys(activeKeys);

        // Drop cached props for keys that are no longer active so a future
        // reopen starts from a clean slate.
        (Object.keys(propsCacheRef.current) as TKeys[]).forEach((cachedKey) => {
          if (!activeKeys.includes(cachedKey)) {
            delete propsCacheRef.current[cachedKey];
          }
        });
      }, closeDelay);

      return () => clearTimeout(timer);
    }
  }, [activeKeys, renderedKeys, closeDelay]);

  // -------------------------------------------------------------------------
  // Render dialog components
  // -------------------------------------------------------------------------
  return renderedKeys.map((key) => {
    const entry = dialogs[key];
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
    const isCurrentlyOpen = activeKeys.includes(key);

    let dialogProps: Record<string, DialogPropValue>;
    if (isCurrentlyOpen) {
      dialogProps = extractDialogProps(search, key);
      propsCacheRef.current[key] = dialogProps;
    } else {
      dialogProps =
        propsCacheRef.current[key] ?? extractDialogProps(search, key);
    }

    return (
      <Component
        key={key}
        open={isCurrentlyOpen}
        onClose={() => closeDialog(key)}
        {...dialogProps}
      />
    );
  });
}
