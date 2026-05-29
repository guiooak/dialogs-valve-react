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
  onGuardBlocked?: (key: TKeys, permissions?: TPermissions) => void;
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
  onGuardBlocked,
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
  // Keys whose canShow guard denied them this render. Collected here (render
  // stays pure) and reported afterward in an effect, since canShow may run
  // multiple times during a render.
  const blockedKeys: TKeys[] = [];

  const elements = renderedKeys.map((key) => {
    const entry = dialogs[key];
    if (!entry) return null;

    // Guard check
    if (entry.canShow && !!permissions && !entry.canShow(permissions)) {
      blockedKeys.push(key);

      console.error(
        `[dialogs-valve] Dialog "${key}" blocked by canShow guard.`,
      );

      return null;
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

  // Notify once per "block event": when the set of blocked keys changes, log a
  // warning and invoke onGuardBlocked. Keyed on a stable signature so it does
  // not re-fire on unrelated re-renders. blockedKeys, onGuardBlocked and
  // permissions are read via closure — the effect only runs right after the
  // commit that produced this signature, so the closure values match the
  // triggering render. Note: while the same key stays blocked, a later change
  // to permissions won't re-fire — permissions reflects the block event only.
  const blockedSignature = blockedKeys.join(",");
  useEffect(() => {
    blockedKeys.forEach((key) => {
      console.error(
        `[dialogs-valve] Dialog "${key}" blocked by canShow guard.`,
      );
      onGuardBlocked?.(key, permissions);
    });
  }, [blockedSignature]);

  return elements;
}
