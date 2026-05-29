---
"@dialogs-valve/react": minor
---

Add a `permissionsLoading` prop to `DialogsValveProvider`. While `true`, dialogs with a `canShow` guard are deferred (not rendered) until permissions resolve, avoiding a guarded dialog flashing on first paint or a guard throwing against not-yet-loaded permissions. Dialogs without a guard are unaffected. Defaults to `false`, so existing behavior is unchanged.
