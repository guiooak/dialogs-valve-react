# @dialogs-valve/react

## 0.2.0

### Minor Changes

- 029038a: Add a `pathName` option to `BuildDialogUrlOptions` so `buildDialogUrl` and `openDialog` can produce cross-route dialog links. When set, the URL is rooted at the given path with a freshly built query string (the current route's params are not merged); when omitted, behavior is unchanged.
- 56d9cf9: Add an `onUnauthorized` callback to `DialogsValveProvider`, invoked when a `canShow` guard denies a dialog. This lets apps react to a blocked deep link (toast, redirect, analytics) instead of the dialog silently not rendering. The callback fires from an effect — once per block event — so `canShow` guards can stay pure.
- fcc21fe: Add a `permissionsLoading` prop to `DialogsValveProvider`. While `true`, dialogs with a `canShow` guard are deferred (not rendered) until permissions resolve, avoiding a guarded dialog flashing on first paint or a guard throwing against not-yet-loaded permissions. Dialogs without a guard are unaffected. Defaults to `false`, so existing behavior is unchanged.

## 0.1.1

### Patch Changes

- 745af49: Add `locationSearch` prop to `DialogsValveProvider` for passing a reactive URL search string from the host router, replacing the built-in location listener when provided.
