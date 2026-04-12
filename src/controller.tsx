import { useEffect, useState } from "react";
import { extractDialogProps } from "./services";
import type { DialogMap } from "./types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type DialogsControllerProps<
  TKeys extends string = string,
  TPermissions = unknown,
> = {
  activeKeys: string[];
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
  const [renderedKeys, setRenderedKeys] = useState<string[]>(activeKeys);

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
      }, closeDelay);

      return () => clearTimeout(timer);
    }
  }, [activeKeys, renderedKeys, closeDelay]);

  // -------------------------------------------------------------------------
  // Render dialog components
  // -------------------------------------------------------------------------
  return renderedKeys.map((key) => {
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
}
