# Plan: Add `locationSearch` prop to `DialogsValveProvider`

## Context

The provider currently reads URL search state through an internal `useState` seeded by `getLocationSearch()` and kept in sync via a `MutationObserver` + `popstate` listener (`addLocationChangeListener` in `browser.ts`). The MutationObserver is a heuristic: it assumes that when a SPA router calls `pushState`, it also triggers a DOM mutation. This works most of the time but is fragile — some routers batch mutations, some don't mutate the DOM at all, and timing gaps can cause the internal state to briefly diverge from the real URL.

The goal is to expose a `locationSearch?: string` prop that lets the host app pass a reactive search string directly (e.g. from `useLocation().search` in React Router). When provided, the library uses that value as the source of truth and skips its own listener entirely, making integration with any router trivially reliable.

## What changes and why it's correct

The `search` state inside the provider has two roles:
1. **Source of truth for reading** — `activeKeys`, `getDialogProps`, and the controller all derive from it.
2. **Optimistic update after navigation** — after calling `navigate()`, `setSearch(getLocationSearch())` forces an immediate re-render without waiting for the listener.

When `locationSearch` is provided by the parent, role 1 is taken over by the prop (which is already reactive — the parent re-renders when the router changes, passing a new string). Role 2 becomes unnecessary because the parent's re-render will propagate the new search string on the very next tick.

The implementation therefore:
- Computes `effectiveSearch = locationSearch ?? search`
- Uses `effectiveSearch` everywhere `search` was used for reading
- Skips `addLocationChangeListener` when `locationSearch !== undefined`
- Skips `setSearch(getLocationSearch())` in `navigate` when `locationSearch !== undefined`

The internal `useState` + listener path remains fully intact for the uncontrolled case, preserving backward compatibility.

## Critical files

- **`src/provider.tsx`** — all changes live here (props type + component body)
- **`src/types.ts`** — `DialogsValveProviderProps` type is defined in `provider.tsx` only, not here

## Implementation

### 1. Add prop to `DialogsValveProviderProps` (`src/provider.tsx`, lines 37–57)

```typescript
export type DialogsValveProviderProps<...> = {
  // ... existing props ...

  /**
   * Reactive URL search string supplied by the host router
   * (e.g. `useLocation().search` from React Router).
   * When provided, overrides the library's internal location listener.
   * When omitted, the library falls back to its built-in listener.
   */
  locationSearch?: string;

  children: ReactNode;
};
```

### 2. Destructure and wire up (`src/provider.tsx`, component body)

```typescript
export function DialogsValveProvider<...>({
  onNavigate,
  dialogs,
  permissions,
  config,
  locationSearch,   // ← new
  children,
}: DialogsValveProviderProps<TKeys, TPermissions>) {
  // ...

  const [search, setSearch] = useState(() => getLocationSearch());

  // Skip listener when the parent is providing search reactively
  useEffect(() => {
    if (locationSearch !== undefined) return;
    return addLocationChangeListener(() => {
      const currentSearch = getLocationSearch();
      if (currentSearch !== search) {
        setSearch(currentSearch);
      }
    });
  }, [search, locationSearch]);

  // Controlled search takes precedence over internal state
  const effectiveSearch = locationSearch ?? search;

  const activeKeys = useMemo(
    () => validateDialogKeys<TKeys>(
      getActiveDialogKeys(effectiveSearch, dialogParamKey),
      validDialogKeys,
    ),
    [effectiveSearch, dialogParamKey, validDialogKeys],
  );

  const navigate = useCallback(
    (url: string) => {
      if (onNavigate) {
        onNavigate(url);
      } else {
        pushState(url);
      }
      // Only optimistically update internal state when not externally controlled
      if (locationSearch === undefined) {
        setSearch(getLocationSearch());
      }
    },
    [onNavigate, locationSearch],
  );

  const getDialogProps = useCallback(
    (key: TKeys) => extractDialogProps(effectiveSearch, key),
    [effectiveSearch],
  );

  // DialogsController also receives effectiveSearch instead of search
  // <DialogsController search={effectiveSearch} ... />
```

## Verification

1. **Existing tests** — run `yarn test`. All current tests must pass since the uncontrolled path is unchanged.
2. **Controlled path — manual test** in the demo app:
   - Wrap `<DialogsValveProvider>` with `locationSearch={useLocation().search}` from React Router.
   - Open and close dialogs — verify the URL updates and dialogs mount/unmount correctly.
   - Use browser back/forward — verify the dialog state follows the URL.
3. **Uncontrolled path** — remove the `locationSearch` prop and confirm the original behavior still works.
4. **New unit tests** — add a test that renders the provider with a controlled `locationSearch` prop and updates it via `rerender`, asserting `activeKeys` reflects the new value without firing any navigation.
