import type { ComponentType } from "react";

// ---------------------------------------------------------------------------
// Primitive value types
// ---------------------------------------------------------------------------

/**
 * Values that can be serialized into URL query params for dialog props.
 */
export type DialogPropValue = string | number | boolean;

// ---------------------------------------------------------------------------
// Router adapter
// ---------------------------------------------------------------------------

/**
 * Function signature for performing navigation within the hosting application's router.
 *
 * This allows the library to remain router-agnostic. Consumers provide this function
 * (e.g., from `useNavigate` in react-router-dom or `useRouter` in Next.js).
 */
export type onNavigateType = (url: string) => void;

// ---------------------------------------------------------------------------
// Dialog registry
// ---------------------------------------------------------------------------

/**
 * A single dialog entry in the map.
 *
 * @template TPermissions - Shape of the permissions/guard context object.
 */
export type DialogEntry<TPermissions = unknown> = {
  /**
   * The React component to render for this dialog.
   * It will receive `open` and `onClose` props controlled by the library,
   * plus any custom props passed via query params.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: ComponentType<any>;

  /**
   * Optional guard function. When provided, the library calls it before
   * rendering the dialog. If it returns `false`, the dialog is skipped
   * and a `console.warn` is emitted.
   */
  canShow?: (permissions: TPermissions) => boolean;
};

/**
 * A map of dialog keys to their entries.
 *
 * Consumers typically define this with `as const satisfies DialogMap<T>`
 * for full type-safe key autocomplete.
 *
 * @template TKeys - Allowed keys for the dialogs.
 * @template TPermissions - Shape of the permissions/guard context object.
 */
export type DialogMap<
  TKeys extends string = string,
  TPermissions = unknown,
> = Record<TKeys, DialogEntry<TPermissions>>;

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

/**
 * Optional configuration for `<DialogsValveProvider>`.
 */
export type DialogsValveConfig = {
  /**
   * The query param key used to identify the active dialog.
   * @default "dialog"
   */
  dialogParamKey?: string;

  /**
   * Delay in milliseconds before unmounting a closed dialog,
   * allowing close animations to complete.
   * @default 300
   */
  closeDelay?: number;
};

// ---------------------------------------------------------------------------
// URL builder options
// ---------------------------------------------------------------------------

/**
 * Options for `buildDialogUrl()`.
 */
export type BuildDialogUrlOptions = {
  /**
   * Custom props to pass to the dialog via query params.
   * Values are serialized as strings in the URL.
   */
  props?: Record<string, DialogPropValue>;

  /**
   * When `true`, the new dialog params are **added** to any existing
   * dialog params (allowing multiple dialogs to be open at once).
   * When `false` (default), existing dialog params are replaced.
   */
  overlap?: boolean;
};

// ---------------------------------------------------------------------------
// Utility types
// ---------------------------------------------------------------------------

/**
 * Extracts the dialog key union from a registry map type.
 * Useful when you need the key union for other purposes (e.g. analytics, routing)
 * without manually writing `keyof typeof dialogs`.
 *
 * @example
 *   type MyKeys = InferDialogKeys<typeof myDialogs>; // "drawer-1" | "drawer-2"
 */
export type InferDialogKeys<TMap extends DialogMap> = keyof TMap & string;

// ---------------------------------------------------------------------------
// Module augmentation registry
// ---------------------------------------------------------------------------

/**
 * Augment this interface in your app to register your dialogs map.
 * All hooks and helpers will automatically use the registered keys —
 * no generic parameter needed at every call site.
 *
 * @example
 * ```ts
 * // In the same file where you define your dialogs:
 * declare module "@dialogs-valve/react" {
 *   interface DialogsValveRegistry {
 *     dialogs: typeof myDialogs;
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogsValveRegistry {}

/**
 * The dialog key union inferred from the augmented registry.
 * Falls back to `string` when no registry is declared.
 */
export type RegisteredDialogKeys =
  DialogsValveRegistry extends { dialogs: infer D extends DialogMap }
    ? keyof D & string
    : string;

// ---------------------------------------------------------------------------
// Internal / context types
// ---------------------------------------------------------------------------

/**
 * The shape of the value provided by `DialogsValveContext`.
 * Used internally by the provider and the `useDialogsValve()` hook.
 *
 * @template TKeys - Allowed keys for the dialogs.
 */
export type DialogsValveContextValue<TKeys extends string = string> = {
  /** Open a dialog by key with optional props and overlap. */
  openDialog: (key: TKeys, options?: BuildDialogUrlOptions) => void;

  /** Close a specific dialog by key. */
  closeDialog: (key: TKeys) => void;

  /** Close all currently open dialogs. */
  closeAllDialogs: () => void;

  /** Check whether a specific dialog is currently open. */
  isOpen: (key: TKeys) => boolean;

  /** Get the custom props for a specific dialog extracted from query params. */
  getDialogProps: (key: TKeys) => Record<string, DialogPropValue>;

  /** The dialog param key in use (resolved from config or default). */
  dialogParamKey: string;
};
