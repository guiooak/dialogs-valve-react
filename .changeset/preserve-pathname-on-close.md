---
"@dialogs-valve/react": patch
---

Preserve the current pathname in every URL builder. `buildCloseDialogUrl` and `buildCloseAllDialogsUrl` previously returned a search-only string (e.g. `"?foo=bar"` or `""`), and `buildDialogUrl` did the same when `pathName` was omitted. Routers resolved these ambiguously and commonly bounced the user to the origin (`/`) when closing a dialog from a sub-route. The builders now return a complete, path-rooted URL (e.g. `/admin/users?dialog=user-view` → `/admin/users` on close), so closing a dialog keeps you on the page where you opened it. Adds a `getLocationPathname` browser helper (SSR-safe, returns `"/"` when `window` is unavailable).
