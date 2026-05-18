# Security Policy

## Supported versions

While `@dialogs-valve/react` is in `0.x`, only the latest published `0.x` minor receives fixes. After `1.0.0` is released, the most recent major will be supported.

| Version | Supported |
|---|---|
| Latest `0.x` minor | Yes |
| Older `0.x` versions | No — please upgrade |

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security reports.

Instead, email **github@guicarvalho.com.br** with:

- A description of the issue
- Steps to reproduce (or a minimal proof of concept)
- The version of `@dialogs-valve/react` affected
- Any suggested mitigation

You should receive an acknowledgement within 72 hours. If the issue is confirmed, a fix will be released as soon as practical and credited to you (unless you prefer to remain anonymous).

## Scope

This library handles dialog state via URL query parameters. Reports most relevant to this project include:

- Issues that could allow an attacker to escalate from URL manipulation to executing application code
- Issues that leak sensitive data through dialog state
- Issues in the library's interaction with router adapters that could be exploited

Issues in dependencies should be reported to those projects directly, though we appreciate a heads-up if a transitively-pulled dependency is affected.
