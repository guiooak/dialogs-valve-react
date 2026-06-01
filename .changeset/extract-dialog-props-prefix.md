---
"@dialogs-valve/react": patch
---

Fix `extractDialogProps` to match the exact `dialogKey + separator` prefix instead of a loose substring (`includes`). Previously an unrelated query param that merely contained the prefix mid-string (e.g. `xuser.id` while opening dialog `user`) could be wrongly extracted as a dialog prop. This aligns extraction with the prefix matching already used when deleting prop params.
