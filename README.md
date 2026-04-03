# @dialogs-valve/react

A small, router-agnostic React library to manage dialogs (modals, drawers, etc.) using URL query params.

By storing your dialog state in the URL, you get out-of-the-box support for deep linking, browser history (back/forward buttons), and shareable URLs.

## Features

- 🔗 **URL-Driven:** Dialog state is completely synced with URL query parameters.
- 🚏 **Router-Agnostic:** Works seamlessly with Next.js, React Router, TanStack Router, Remix, or any custom router handling scheme.
- 🎭 **Overlap Support:** Open multiple dialogs stacked on top of each other.
- 🧩 **Type-Safe:** Define a strict registry of dialog keys and components.
- 💂‍♀️ **Route Guards:** Built-in `canShow` guard mechanism for verifying permissions or conditions.
- ✨ **Animated Exits:** Includes configurable delay to allow close animations to finish before unmounting.

## Installation

You can install this package using your preferred package manager:

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

First, create a map of your dialog keys to their corresponding React components. 

```tsx
import { DialogMap } from "@dialogs-valve/react";
import { UserProfileModal } from "./components/UserProfileModal";
import { SettingsDrawer } from "./components/SettingsDrawer";

export const dialogs = {
  "user-profile": {
    Component: UserProfileModal,
  },
  "settings": {
    Component: SettingsDrawer,
  },
} as const satisfies DialogMap;

// Optional: Extract the exact dialog keys for type-safe usage down the line
export type MyDialogKeys = keyof typeof dialogs;
```

**Note on Dialog Components:** The library will automatically pass down `open` (boolean) and `onClose` (() => void) props to your dialog components when they are rendered, along with any dynamically extracted query parameters. 

### 2. Implement a Router Adapter

The library exposes a minimalistic adapter to perform navigations, allowing it to remain completely unopinionated about your specific framework's routing logic. It merely requires an object structure fulfilling the `RouterAdapter` interface type.

**Example using `react-router-dom`:**
```tsx
import { useNavigate } from "react-router-dom";
import { RouterAdapter } from "@dialogs-valve/react";

export function useAppRouterAdapter(): RouterAdapter {
  const navigate = useNavigate();
  return {
    // You can customize whether opening a dialog pushes a new state 
    // or replaces the current one.
    navigate: (url) => navigate(url, { replace: false }),
  };
}
```

### 3. Setup the Provider

Wrap your application or the sub-tree layout where you want to render the dialogs with the `DialogsValveProvider`.

```tsx
import { DialogsValveProvider } from "@dialogs-valve/react";
import { dialogs } from "./dialogs";
import { useAppRouterAdapter } from "./useAppRouterAdapter"; 

function App() {
  const routerAdapter = useAppRouterAdapter();

  return (
    <DialogsValveProvider 
      router={routerAdapter} 
      dialogs={dialogs}
    >
      {/* Your standard application layout goes here */}
      <MainLayout />
      
      {/* Dialogs will be injected automatically by the provider */}
    </DialogsValveProvider>
  );
}
```

### 4. Trigger Dialogs anywhere

Use the `useDialogsValve` hook throughout your app to open, close, and inspect active dialogs.

```tsx
import { useDialogsValve } from "@dialogs-valve/react";

export function UserList() {
  const { openDialog, closeDialog, closeAllDialogs, isOpen } = useDialogsValve();

  return (
    <div>
      <button onClick={() => openDialog("settings")}>
        Open Settings
      </button>

      {/* Passing extra context props directly through URL params */}
      <button onClick={() => openDialog("user-profile", { props: { userId: "42" } })}>
        View User 42
      </button>
    </div>
  );
}
```

## Advanced Features

### Passing Props via Query Params

When you call `openDialog("key", { props: { ... } })`, simple primitive values are safely serialized into the URL alongside the active dialog key. 

For example calling:
```tsx
openDialog("user-profile", { props: { userId: "123", mode: "edit" } })
```

Generates underlying parameters similar to: `?dlg=user-profile&user-profile~userId=123&user-profile~mode=edit`

These props will then be automatically extracted from the search params and spread as standard React props onto the corresponding rendered `Component`. That means your `<UserProfileModal>` will directly receive the props map:
```tsx
{ 
  open: true, 
  onClose: () => void, 
  userId: "123", 
  mode: "edit" 
}
```

### Overlapping Dialogs

By default, the library supports rendering and holding multiple dialogs at the same time via the `overlap` option on `openDialog`.
Setting `overlap: false` inside the options will automatically replace all currently active dialogs with the newly requested one.

```tsx
openDialog("settings", { overlap: false });
```

### Dialog Guards and Permissions

You optionally can prevent certain dialogs from rendering by using the `canShow` guard inside your dialog map entries configuration. You can pass a `permissions` context object into the `DialogsValveProvider` that is subsequently injected into the `canShow` invocations.

```tsx
export const dialogs = {
  "admin-dashboard": {
    Component: AdminDashboardModal,
    canShow: (permissions) => permissions.isAdmin === true,
  },
} as const satisfies DialogMap<{ isAdmin: boolean }>;
```

Then in your provider, map over and supply the resolved permissions from whatever domain models your app utilizes:

```tsx
<DialogsValveProvider
  router={routerAdapter}
  dialogs={dialogs}
  permissions={{ isAdmin: currentUser.role === 'admin' }} // Provide global context
>
  <App />
</DialogsValveProvider>
```

*(Any dialog restricted by a returning `false` will skip rendering and output a console warning.)*

### Global Configuration Options

You can customize standard base query parameter formatting logic and animation timings via the `config` prop on `DialogsValveProvider`.

```tsx
<DialogsValveProvider
  router={routerAdapter}
  dialogs={dialogs}
  config={{
    dialogParamKey: "modal", // Default is "dlg", controls overarching query search param.
    closeDelay: 500, // Waits 500ms before fully unmounting. Used to gracefully transition animations. Default is 300ms.
  }}
>
```

## API Reference

### `DialogsValveProvider` Props
- **`router`** (`RouterAdapter`): Minimal adapter exposing a `{ navigate: (url: string) => void }` function, executed upon dialog routing actions. 
- **`dialogs`** (`DialogMap`): The registry lookup tying your application dialog keys to their respective exported component definitions.
- **`permissions`** (`TPermissions`, optional): Custom globally available permissions context object distributed individually to `canShow` guard functions.
- **`config`** (`DialogsValveConfig`, optional): Overrides library baseline constants (`dialogParamKey`, `closeDelay`).

### `useDialogsValve()` Object Scope
Provides API access to execute and inspect dialogs from within child nodes to the `DialogsValveProvider`.
- **`openDialog(key: string, options?: BuildDialogUrlOptions): void`**: Opens a dialog matching the provided key label. Optionally assign serializable `props` and standard navigation overrides.
- **`closeDialog(key: string): void`**: Instructs active instances matching the specified dialog key to close immediately.
- **`closeAllDialogs(): void`**: Evaluates and sequentially requests closure for all active dialog components inside the URL.
- **`isOpen(key: string): boolean`**: Helper identifying whether the given dialog is strictly initialized/active in the URL structure.
- **`getDialogProps(key: string): Record<string, DialogPropValue>`**: Deserializes actively injected query-param metadata for a particular dialog.
- **`dialogParamKey: string`**: Reflects the baseline active URL parameter grouping keys (i.e. `"dlg"`).
