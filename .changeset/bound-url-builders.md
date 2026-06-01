---
"@dialogs-valve/react": minor
---

Expose pre-bound URL builders from `useDialogsValve()`: `buildDialogUrl`, `buildCloseDialogUrl`, and `buildCloseAllDialogsUrl`. Each is pre-bound to the provider's resolved `dialogParamKey`, fixing the bug where standalone imports would silently ignore a custom key configured via `<DialogsValveProvider config={{ dialogParamKey: "..." }}>`.
