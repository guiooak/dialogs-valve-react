# @dialogs-valve/react

[![npm](https://img.shields.io/npm/v/@dialogs-valve/react.svg)](https://www.npmjs.com/package/@dialogs-valve/react)
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

Wrap your app (or the sub-tree where dialogs live) with `DialogsValveProvider`. Pass `onNavigate` and `locationSearch` from your router — this is the recommended setup for reliable, reactive integration.

```tsx
// App.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { DialogsValveProvider } from "@dialogs-valve/react";
import { dialogs } from "./dialogs-valve-registry";

function App() {
  const navigate = useNavigate();
  const { search } = useLocation();

  return (
    <DialogsValveProvider
      dialogs={dialogs}
      onNavigate={navigate}
      locationSearch={search}
    >
      <MainLayout />
    </DialogsValveProvider>
  );
}
```

Both props are optional — if omitted, the library falls back to `window.history.pushState` for navigation and a built-in `popstate` + `MutationObserver` listener for tracking URL changes. The fallbacks work in most cases but are less reliable than passing values directly from your router.

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

By default, opening a dialog **stacks** it on top of any currently open dialogs (`overlap: true`). Each dialog adds its own key to the URL — close one and the rest stay open.

```tsx
// Open a second drawer on top of the first — both stay in the URL
openDialog("settings");
// URL: ?dialog=user-profile&dialog=settings
```

Each dialog only removes itself when closed — the others remain open.

### Cross-Route Dialog Links

To open a dialog on a **different** route — "navigate to another page _and_ open a dialog there" from a single click — pass `pathName`. The helper builds a fresh query string rooted at that path, keeping prop serialization intact.

```tsx
import { buildDialogUrl } from "@dialogs-valve/react";

// A link on /list that lands on /admin/users with a dialog already open:
const href = buildDialogUrl("user-create", {
  props: { tab: "details" },
  pathName: "/admin/users",
});
// → "/admin/users?dialog=user-create&user-create.tab=details"

<Link to={href}>Add user</Link>;
```

The same option works on `openDialog("user-create", { pathName: "/admin/users" })`. When `pathName` is omitted, the URL is rooted at the current location's pathname (the default). Unlike same-route links, the current route's existing dialog params are **not** merged, since overlapping against another route is meaningless.

Every URL builder returns a path-rooted URL — `buildDialogUrl`, `buildCloseDialogUrl`, and `buildCloseAllDialogsUrl` all keep the current pathname rather than emitting a search-only string. Closing a dialog therefore keeps you on the page where you opened it (e.g. `/admin/users?dialog=user-view` → `/admin/users`) instead of bouncing back to the origin (`/`).

### Dialog Replacement

Pass `overlap: false` to remove all currently open dialogs and open the new one in their place. Useful for wizard-style flows or exclusive panels.

```tsx
openDialog("step-two", { overlap: false }); // removes step-one, adds step-two
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

If `canShow` returns `false`, the dialog is skipped and an error is logged to the console.

#### Reacting to a blocked dialog

Because dialog state lives in the URL, a user can land directly on a guarded dialog via a shared/deep link they aren't permitted to open — which by default results in *nothing visible*. To surface feedback (a toast, a redirect, an analytics event), pass `onUnauthorized`:

```tsx
<DialogsValveProvider
  dialogs={dialogs}
  permissions={{ isAdmin: currentUser.role === "admin" }}
  onUnauthorized={(key, permissions) => toast.error(`Not authorized: ${key}`)}
>
  <App />
</DialogsValveProvider>
```

`onUnauthorized` is invoked from an effect (not during render) and fires once per block event, so it's safe to run side effects inside it — keep your `canShow` guards pure.

#### Async permissions

When permissions load asynchronously (e.g. fetched after mount), the first render would otherwise evaluate guards against incomplete data — a guarded dialog can flash in then disappear, or a guard that reads `permissions.isAdmin` can throw on `undefined`. Pass `permissionsLoading` to tell the library while permissions are not yet safe to guard against:

```tsx
function App() {
  const { permissions, isLoading } = usePermissions();

  return (
    <DialogsValveProvider
      dialogs={dialogs}
      permissions={permissions}
      permissionsLoading={isLoading}
    >
      <MainLayout />
    </DialogsValveProvider>
  );
}
```

While `permissionsLoading` is `true`, dialogs with a `canShow` guard are **deferred** (not rendered) until it flips back to `false`. Dialogs without a guard are unaffected and always render. It defaults to `false`, so omitting it leaves behavior unchanged.

### Router Integration

The recommended way to set up the provider is to pass both `onNavigate` and `locationSearch` from your router. This gives the library a first-class, reactive integration — navigation goes through your router's history API and URL state is read directly from a value your router already tracks.

**React Router v6:**
```tsx
import { useLocation, useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const { search } = useLocation();

  return (
    <DialogsValveProvider
      dialogs={dialogs}
      onNavigate={navigate}
      locationSearch={search}
    >
      <MainLayout />
    </DialogsValveProvider>
  );
}
```

**Next.js App Router:**
```tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";

function AppShell() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <DialogsValveProvider
      dialogs={dialogs}
      onNavigate={router.push}
      locationSearch={searchParams.toString()}
    >
      <MainLayout />
    </DialogsValveProvider>
  );
}
```

**TanStack Router:**
```tsx
import { useNavigate, useLocation } from "@tanstack/react-router";

function App() {
  const navigate = useNavigate();
  const { searchStr } = useLocation();

  return (
    <DialogsValveProvider
      dialogs={dialogs}
      onNavigate={(url) => navigate({ to: url })}
      locationSearch={searchStr}
    >
      <MainLayout />
    </DialogsValveProvider>
  );
}
```

**Without a router (fallback mode):**

If you don't have access to router hooks — for example in a plain Vite app without a router, or in a context where the router isn't available — both props can be omitted. The library will fall back to `window.history.pushState` for navigation and a built-in `popstate` + `MutationObserver` listener for tracking URL changes.

```tsx
<DialogsValveProvider dialogs={dialogs}>
  <MainLayout />
</DialogsValveProvider>
```

This fallback works in most cases, but the router-integrated setup is preferred whenever possible.

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
| `permissionsLoading` | `boolean` | `false` | While `true`, dialogs with a `canShow` guard are deferred until permissions resolve. Unguarded dialogs are unaffected. |
| `onUnauthorized` | `(key, permissions?) => void` | — | Called when a `canShow` guard denies a dialog. Fires from an effect, once per block event. |
| `config` | `DialogsValveConfig` | — | Override `dialogParamKey` or `closeDelay`. |
| `locationSearch` | `string` | — | Reactive search string from your router (e.g. `useLocation().search`). When provided, overrides the built-in location listener. |
| `children` | `ReactNode` | — | Your app content. |

---

### `useDialogsValve()` Return Value

Import directly from `@dialogs-valve/react`. Must be called within a `DialogsValveProvider`. Keys are automatically typed from your `DialogsValveRegistry` augmentation.

| Method / Property | Signature | Description |
|-------------------|-----------|-------------|
| `openDialog` | `(key, options?) => void` | Opens a dialog. Optionally pass `props`, `overlap`, or `pathName`. |
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
| `pathName` | `string` | current path | Root the URL at this path instead of the current location, for cross-route dialog links. When set, the query is built from scratch (current params are not merged). |

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

## Versioning

This project uses [Semantic Versioning](https://semver.org/), with one caveat while it is in `0.x`.

### While in `0.x` (current)

The library follows the **0ver** convention used by most pre-1.0 OSS projects (React, Vue, Vite all did this):

- Breaking changes bump the **minor** number — `0.1.0` → `0.2.0`
- Features and fixes bump the **patch** number — `0.1.0` → `0.1.1`

Breaking changes are allowed in any `0.x` release. If you depend on this library while it is in `0.x`, pin with `~0.x.y` (patch-only updates) rather than `^0.x.y` (which would let breaking changes in).

### After `1.0.0`

Once `1.0.0` ships, standard [SemVer](https://semver.org/) applies:

- **Major** (`1.x` → `2.0`) — breaking changes
- **Minor** (`1.0` → `1.1`) — new features, backwards-compatible
- **Patch** (`1.0.0` → `1.0.1`) — bug fixes, backwards-compatible

At that point `^1.0.0` is safe to use.

### Release process

Releases are managed via [Changesets](https://github.com/changesets/changesets) and published automatically to npm by GitHub Actions. See [CONTRIBUTING.md](./CONTRIBUTING.md#changesets) for how to add a changeset to your PR.

The changelog for each version lives in [`CHANGELOG.md`](./CHANGELOG.md) once the first automated release lands.
