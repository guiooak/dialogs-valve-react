---
"@dialogs-valve/react": minor
---

Add an `onUnauthorized` callback to `DialogsValveProvider`, invoked when a `canShow` guard denies a dialog. This lets apps react to a blocked deep link (toast, redirect, analytics) instead of the dialog silently not rendering. The callback fires from an effect — once per block event — so `canShow` guards can stay pure.
