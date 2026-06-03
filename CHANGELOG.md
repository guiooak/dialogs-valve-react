# @dialogs-valve/react

## 0.3.0

### Minor Changes

- 4ddf692: Expose pre-bound URL builders from `useDialogsValve()`: `buildDialogUrl`, `buildCloseDialogUrl`, and `buildCloseAllDialogsUrl`. Each is pre-bound to the provider's resolved `dialogParamKey`, fixing the bug where standalone imports would silently ignore a custom key configured via `<DialogsValveProvider config={{ dialogParamKey: "..." }}>`.

### Patch Changes

- 128d0d2: Docs: clarify that `useDialogsValve()` returns `null` (and logs an error) when called outside a `<DialogsValveProvider>` — it does not throw. The hook's JSDoc, the context comment, and the README return-value section previously implied it would throw; they now describe the actual nullable contract and the `useDialogsValve()!` assertion pattern.
- 2ef9bd3: Performance: coalesce the built-in `MutationObserver` fallback. The observer used to detect router navigations fires on _every_ DOM mutation in the document, which re-ran the URL check on each unrelated change in busy apps. Observer-triggered checks are now batched into a single callback per animation frame (and the pending frame is cancelled on cleanup). The synchronous `popstate` path is unchanged. This only affects the fallback listener — apps that pass `locationSearch` from their router are unaffected.
- 12e83d3: Fix `extractDialogProps` to match the exact `dialogKey + separator` prefix instead of a loose substring (`includes`). Previously an unrelated query param that merely contained the prefix mid-string (e.g. `xuser.id` while opening dialog `user`) could be wrongly extracted as a dialog prop. This aligns extraction with the prefix matching already used when deleting prop params.
- 786020e: Fix number prop round-tripping for negative and decimal (and exponent) values. `parsePropValue` previously validated with `/^number.\d+$/`, which only matched non-negative integers — so a serialized `number.-5` or `number.3.14` came back as a **string** instead of a number. The numeric payload is now matched against a grammar that accepts signs, decimals and exponent notation (the forms `String(value)` produces), while still rejecting hex, `Infinity`/`NaN` and empty payloads. The stray unescaped `.` in the old pattern is also gone.

## 0.2.1

### Patch Changes

- 97b3eba: Keep the current route (and any router `basename`) when closing dialogs, with no work on the consumer's side. The same-route builders return a **relative**, search-only URL (`?dialog=x`, or `?` when nothing remains) so the router resolves it against the current location — `onNavigate={navigate}` works as-is even under a `basename`. `buildCloseDialogUrl` / `buildCloseAllDialogsUrl` previously returned `""` when no dialog params remained, which left the query untouched under the `history.pushState` fallback; they now return `"?"`, which reliably clears it. The `pushState` fallback resolves the URL against the current location before pushing, so a query-clearing `"?"` doesn't leave a bare `"?"` in the address bar.

  Opening and closing dialogs preserves unrelated query params. `buildDialogUrl` builds on top of the current query, and `buildCloseAllDialogsUrl` (which previously dropped the entire query string) now removes only the dialog keys and their serialized props — anything else (e.g. `utm_source`, filters, pagination) stays put. Prop cleanup across `buildCloseDialogUrl`, `buildCloseAllDialogsUrl`, and `cleanUpQueryParams` matches the exact `dialogKey + "."` prefix instead of a loose substring, so a param like `username` is no longer removed when closing a `user` dialog (and a single-character key no longer matches the `dialog` param itself).

## 0.2.0

### Minor Changes

- 029038a: Add a `pathName` option to `BuildDialogUrlOptions` so `buildDialogUrl` and `openDialog` can produce cross-route dialog links. When set, the URL is rooted at the given path with a freshly built query string (the current route's params are not merged); when omitted, behavior is unchanged.
- 56d9cf9: Add an `onUnauthorized` callback to `DialogsValveProvider`, invoked when a `canShow` guard denies a dialog. This lets apps react to a blocked deep link (toast, redirect, analytics) instead of the dialog silently not rendering. The callback fires from an effect — once per block event — so `canShow` guards can stay pure.
- fcc21fe: Add a `permissionsLoading` prop to `DialogsValveProvider`. While `true`, dialogs with a `canShow` guard are deferred (not rendered) until permissions resolve, avoiding a guarded dialog flashing on first paint or a guard throwing against not-yet-loaded permissions. Dialogs without a guard are unaffected. Defaults to `false`, so existing behavior is unchanged.

## 0.1.1

### Patch Changes

- 745af49: Add `locationSearch` prop to `DialogsValveProvider` for passing a reactive URL search string from the host router, replacing the built-in location listener when provided.
