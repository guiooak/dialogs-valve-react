---
"@dialogs-valve/react": patch
---

Performance: coalesce the built-in `MutationObserver` fallback. The observer used to detect router navigations fires on *every* DOM mutation in the document, which re-ran the URL check on each unrelated change in busy apps. Observer-triggered checks are now batched into a single callback per animation frame (and the pending frame is cancelled on cleanup). The synchronous `popstate` path is unchanged. This only affects the fallback listener — apps that pass `locationSearch` from their router are unaffected.
