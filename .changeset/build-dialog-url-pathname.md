---
"@dialogs-valve/react": minor
---

Add a `pathName` option to `BuildDialogUrlOptions` so `buildDialogUrl` and `openDialog` can produce cross-route dialog links. When set, the URL is rooted at the given path with a freshly built query string (the current route's params are not merged); when omitted, behavior is unchanged.
