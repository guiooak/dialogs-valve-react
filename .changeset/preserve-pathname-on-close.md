---
"@dialogs-valve/react": patch
---

Root every URL builder at an explicit pathname so closing a dialog keeps you on the current page instead of bouncing to the origin (`/`). `buildDialogUrl` uses the cross-route `pathName` option when provided, otherwise the current `window.location.pathname`; `buildCloseDialogUrl` and `buildCloseAllDialogsUrl` use the current pathname. When the query becomes empty the builders return the pathname alone (no trailing `"?"`).

Closing dialogs now preserves unrelated query params. `buildCloseAllDialogsUrl` previously dropped the entire query string; it now removes only the dialog keys and their serialized props, leaving anything else (e.g. `utm_source`, filters, pagination) intact. Prop cleanup across `buildCloseDialogUrl`, `buildCloseAllDialogsUrl`, and `cleanUpQueryParams` also matches the exact `dialogKey + "."` prefix instead of a loose substring, so a param like `username` is no longer removed when closing a `user` dialog (and a single-character key no longer matches the `dialog` param itself).

Note: because the builders return the full `window.location.pathname`, it includes any router `basename`. Consumers whose router re-prepends the basename on navigation (e.g. react-router) should strip it in `onNavigate` before navigating, to avoid a doubled path.
