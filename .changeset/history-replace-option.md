---
"@dialogs-valve/react": minor
---

Add an optional `replace` flag to the open/close actions so a dialog navigation can swap the current history entry instead of pushing a new one — handy for transient dialogs you don't want in the back-button history.

- `openDialog(key, { replace: true })`, `closeDialog(key, { replace: true })` and `closeAllDialogs({ replace: true })` now accept `replace`.
- The built-in `history` fallback uses `history.replaceState` when `replace` is set; otherwise it keeps using `pushState`.
- `onNavigate` now receives the navigation intent as a second argument — `onNavigate(url, { replace })` — so routers that support it (e.g. `react-router`'s `navigate(to, { replace })`) honour it. The argument is optional and backward compatible.
- New exported types: `DialogNavigateOptions` and `OpenDialogOptions`. A new `replaceState` browser helper backs the fallback.
