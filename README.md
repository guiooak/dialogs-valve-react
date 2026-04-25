# @dialogs-valve/react

![CI](https://github.com/guiooak/dialogs-valve-react/actions/workflows/ci.yml/badge.svg?branch=main)
![Deploy Demo](https://github.com/guiooak/dialogs-valve-react/actions/workflows/deploy-demo.yml/badge.svg?branch=main)
[![codecov](https://codecov.io/gh/guiooak/dialogs-valve-react/graph/badge.svg)](https://codecov.io/gh/guiooak/dialogs-valve-react)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

> [!TIP]
> **Check out the [Live Demo](https://guiooak.github.io/dialogs-valve-react/)!** 🚀
> 
> See how Dialogs Valve handles deep linking, history, and overlapping modals in real-time.

A small, router-agnostic React library to manage dialogs (modals, drawers, etc.) using URL query params.

By storing your dialog state in the URL, you get out-of-the-box support for deep linking, browser history (back/forward buttons), and shareable URLs.

## Features

- 🔗 **URL-Driven:** Dialog state is completely synced with URL query parameters.
- 🚏 **Router-Agnostic:** Works seamlessly with Next.js, React Router, TanStack Router, Remix, or any custom router.
- 🌐 **Route-Independent:** Open any dialog from any page without registering it as a route — the current page stays underneath, and closing returns you to it untouched.
- 🎭 **Overlap Support:** Open multiple dialogs stacked on top of each other.
- 🧩 **Type-Safe:** Define a strict registry of dialog keys and get full compile-time validation via module augmentation — no generics at call sites.
- 💂 **Route Guards:** Built-in `canShow` guard mechanism for permission-based rendering.
- ✨ **Animated Exits:** Configurable delay to allow close animations to finish before unmounting.

## Installation

```bash
npm install @dialogs-valve/react
```

```bash
yarn add @dialogs-valve/react
```

```bash
pnpm install @dialogs-valve/react
```

## Quick Start

### 1. Define your dialog registry

Create a map of dialog keys to their corresponding React components. Add a `declare module` block in the same file to register your types — this is what enables compile-time key validation and autocomplete across the entire app with no boilerplate at call sites.

```tsx
// dialogs-valve-registry.tsx
import type { DialogMap } from "@dialogs-valve/react";
import { UserProfileModal } from "./components/UserProfileModal";
import { SettingsDrawer } from "./components/SettingsDrawer";

export const dialogs = {
  "user-profile": { Component: UserProfileModal },
  "settings":     { Component: SettingsDrawer },
} as const satisfies DialogMap;

// Register once — all hooks and helpers are auto-typed from this point on
declare module "@dialogs-valve/react" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface DialogsValveRegistry {
    dialogs: typeof dialogs;
  }
}
```

> **Note on dialog components:** The library automatically passes `open` (boolean) and `onClose` (() => void) to every dialog component it renders, along with any custom props extracted from query params. Any props beyond `open` and `onClose` should be declared as **optional**, since a dialog can be opened from a deep link without those query params present.

### 2. Setup the Provider

Wrap your app (or the sub-tree where dialogs live) with `DialogsValveProvider`, imported directly from the library. Pass your `dialogs` registry as a prop.

```tsx
// App.tsx
import { useNavigate } from "react-router-dom";
import { DialogsValveProvider } from "@dialogs-valve/react";
import { dialogs } from "./dialogs-valve-registry";

function App() {
  const navigate = useNavigate();

  return (
    <DialogsValveProvider dialogs={dialogs} onNavigate={navigate}>
      <MainLayout />
    </DialogsValveProvider>
  );
}
```

The `onNavigate` prop is optional — if omitted, the library falls back to `window.history.pushState` directly.

### 3. Trigger dialogs anywhere

Import `useDialogsValve` directly from the library anywhere inside the provider. Keys are fully typed — TypeScript will error on typos and provide autocomplete.

```tsx
// UserList.tsx
import { useDialogsValve } from "@dialogs-valve/react";

export function UserList() {
  const { openDialog, closeDialog, closeAllDialogs, isOpen } = useDialogsValve()!;

  return (
    <div>
      <button onClick={() => openDialog("settings")}>
        Open Settings
      </button>

      {/* Pass extra context through URL params */}
      <button onClick={() => openDialog("user-profile", { props: { userId: "42" } })}>
        View User 42
      </button>
    </div>
  );
}
```

## Advanced Features

### Passing Props via Query Params

When you call `openDialog("key", { props: { ... } })`, primitive values (`string`, `number`, `boolean`) are serialized into the URL alongside the active dialog key.

For example:
```tsx
openDialog("user-profile", { props: { userId: "123", mode: "edit" } })
```

Generates a URL like: `?dialog=user-profile&user-profile.userId=123&user-profile.mode=edit`

These props are automatically extracted and spread as React props onto the rendered component:
```tsx
// <UserProfileModal> receives:
{
  open: true,
  onClose: () => void,
  userId: "123",
  mode: "edit",
}
```

### Overlapping Dialogs

By default, opening a dialog **replaces** all currently open dialogs (`overlap: false`). Set `overlap: true` to stack the new dialog on top of existing ones instead.

```tsx
// Open a second drawer on top of the first — both stay in the URL
openDialog("settings", { overlap: true });
// URL: ?dialog=user-profile&dialog=settings
```

Each dialog only removes itself when closed — the others remain open.

### Dialog Replacement

The default (`overlap: false`) removes all currently open dialogs and opens the new one. Useful for wizard-style flows or exclusive panels.

```tsx
openDialog("step-two"); // removes step-one, adds step-two
// URL: ?dialog=step-one → ?dialog=step-two
```

### Dialog Guards and Permissions

Add a `canShow` guard to any registry entry to conditionally prevent rendering. Pass a `permissions` context object to the provider — it is forwarded to every `canShow` call.

```tsx
// dialogs-valve-registry.tsx
export type AppPermissions = { isAdmin: boolean };

export const dialogs = {
  "admin-dashboard": {
    Component: AdminDashboardModal,
    canShow: (permissions: AppPermissions) => permissions.isAdmin === true,
  },
} as const satisfies DialogMap<string, AppPermissions>;

declare module "@dialogs-valve/react" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface DialogsValveRegistry {
    dialogs: typeof dialogs;
  }
}
```

```tsx
// App.tsx
<DialogsValveProvider
  dialogs={dialogs}
  onNavigate={navigate}
  permissions={{ isAdmin: currentUser.role === "admin" }}
>
  <App />
</DialogsValveProvider>
```

If `canShow` returns `false`, the dialog is skipped and a `console.warn` is emitted.

### Global Configuration

Customize the URL param key and animation timing via the `config` prop on `DialogsValveProvider`.

```tsx
<DialogsValveProvider
  dialogs={dialogs}
  onNavigate={navigate}
  config={{
    dialogParamKey: "modal", // Default: "dialog"
    closeDelay: 500,         // Default: 300ms — wait before unmounting for animations
  }}
>
```

## API Reference

### `DialogsValveProvider` Props

Import directly from `@dialogs-valve/react`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dialogs` | `DialogMap` | — | **Required.** Your dialog registry map. |
| `onNavigate` | `(url: string) => void` | `history.pushState` | Navigation callback from your router. |
| `permissions` | `TPermissions` | — | Permissions context forwarded to `canShow` guards. |
| `config` | `DialogsValveConfig` | — | Override `dialogParamKey` or `closeDelay`. |
| `children` | `ReactNode` | — | Your app content. |

---

### `useDialogsValve()` Return Value

Import directly from `@dialogs-valve/react`. Must be called within a `DialogsValveProvider`. Keys are automatically typed from your `DialogsValveRegistry` augmentation.

| Method / Property | Signature | Description |
|-------------------|-----------|-------------|
| `openDialog` | `(key, options?) => void` | Opens a dialog. Optionally pass `props` or `overlap`. |
| `closeDialog` | `(key) => void` | Closes a specific dialog by key. |
| `closeAllDialogs` | `() => void` | Closes all currently open dialogs. |
| `isOpen` | `(key) => boolean` | Returns `true` if the dialog is currently open. |
| `getDialogProps` | `(key) => Record<string, DialogPropValue>` | Returns the deserialized props for a dialog from the URL. |
| `dialogParamKey` | `string` | The active URL param key (e.g. `"dialog"`). |

---

### URL Builder Helpers

All imported directly from `@dialogs-valve/react`. Keys are typed from your registry augmentation.

| Function | Signature | Description |
|----------|-----------|-------------|
| `buildDialogUrl` | `(key, options?, paramKey?) => string` | Builds a URL that opens a dialog. |
| `buildCloseDialogUrl` | `(key, paramKey?) => string` | Builds a URL that closes a specific dialog. |
| `buildCloseAllDialogsUrl` | `(paramKey?) => string` | Builds a URL that closes all dialogs. |
| `extractDialogProps` | `(search, key) => Record<string, DialogPropValue>` | Extracts props for a dialog from a URL search string. |
| `getActiveDialogKeys` | `(search, paramKey) => string[]` | Returns the currently active dialog keys from a URL. |
| `cleanUpQueryParams` | `(search, paramKey, key) => string` | Removes a dialog key and its props from a URL search string. |
| `validateDialogKeys` | `(keys, validKeys) => string[]` | Filters a list of keys to only registered ones. |
| `parsePropValue` | `(value) => DialogPropValue` | Deserializes a URL-encoded prop value to its typed primitive. |

---

### Constants

| Export | Value | Description |
|--------|-------|-------------|
| `DIALOG_MAIN_KEY` | `"dialog"` | Default URL query param key for tracking active dialogs. |
| `DIALOG_DELAY_TO_CLOSE` | `300` | Default milliseconds before unmounting a closed dialog. |

---

### `BuildDialogUrlOptions`

Passed as the second argument to `openDialog` or `buildDialogUrl`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `props` | `Record<string, string \| number \| boolean>` | — | Custom props to serialize into the URL. |
| `overlap` | `boolean` | `true` | `true` to stack on existing dialogs; `false` to replace them. |

---

### `DialogsValveConfig`

Passed as `config` to `DialogsValveProvider`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dialogParamKey` | `string` | `"dialog"` | The URL query param key for tracking active dialogs. |
| `closeDelay` | `number` | `300` | Milliseconds to wait before unmounting a closed dialog (for exit animations). |

---

### Types

All types are re-exported directly from `@dialogs-valve/react`:

```tsx
import type {
  DialogMap,              // Registry map type
  DialogEntry,            // Single registry entry { Component, canShow? }
  DialogPropValue,        // string | number | boolean
  BuildDialogUrlOptions,
  DialogsValveConfig,
  DialogsValveContextValue,
  DialogsValveProviderProps,
  InferDialogKeys,        // Extracts key union from a registry type
  RegisteredDialogKeys,   // Key union resolved from DialogsValveRegistry augmentation
  onNavigateType,         // (url: string) => void
} from "@dialogs-valve/react";
```

`InferDialogKeys` is useful when you need the key union in other type declarations:

```tsx
type MyDialogKeys = InferDialogKeys<typeof dialogs>;
// "user-profile" | "settings"
```

`DialogsValveRegistry` is the augmentation interface. Extend it once in your registry file:

```tsx
declare module "@dialogs-valve/react" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface DialogsValveRegistry {
    dialogs: typeof dialogs;
  }
}
```
