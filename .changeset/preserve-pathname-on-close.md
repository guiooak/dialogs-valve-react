---
"@dialogs-valve/react": patch
---

Keep the current route (and any router `basename`) when closing dialogs. `buildCloseDialogUrl` and `buildCloseAllDialogsUrl` previously returned `""` when no dialog params remained — under the `history.pushState` fallback (and for `<a href="">`) an empty string resolves to the current/origin URL with the existing query left in place, so the dialog wasn't reliably cleared. They now return `"?"`, which clears the query while staying on the current path across every navigation path (`navigate`, `<Link>`, and `pushState`).

The same-route builders deliberately return a **relative**, search-only URL (e.g. `?dialog=x`, or `?`) rather than an absolute pathname: returning the current `window.location.pathname` would double a configured router `basename` (e.g. react-router re-prepends it on `navigate`). Relative URLs let the router resolve against the current location, preserving the pathname and basename. Cross-route links via the `pathName` option are unaffected.

The built-in `history.pushState` fallback (used when no `onNavigate` is provided) now resolves the URL against the current location and pushes `pathname + search + hash`, so the query-clearing `"?"` doesn't leave a bare `"?"` lingering in the address bar.
