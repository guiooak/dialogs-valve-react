---
"@dialogs-valve/react": patch
---

Docs: clarify that `useDialogsValve()` returns `null` (and logs an error) when called outside a `<DialogsValveProvider>` — it does not throw. The hook's JSDoc, the context comment, and the README return-value section previously implied it would throw; they now describe the actual nullable contract and the `useDialogsValve()!` assertion pattern.
