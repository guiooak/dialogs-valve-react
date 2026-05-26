# Contributing to @dialogs-valve/react

Thanks for your interest in contributing! This document describes how to get a development environment running and how to submit changes.

## Prerequisites

- Node.js 20+
- Yarn (this project standardizes on Yarn; do not use npm)

## Getting started

```bash
git clone https://github.com/guiooak/dialogs-valve-react.git
cd dialogs-valve-react
yarn install
```

## Common scripts

| Command | What it does |
|---|---|
| `yarn build` | Build the library to `dist/` |
| `yarn dev` | Build in watch mode |
| `yarn test` | Run the unit test suite once |
| `yarn test:watch` | Run tests in watch mode |
| `yarn test:coverage` | Run tests and produce a coverage report |
| `yarn typecheck` | Type-check the library without emitting |
| `yarn lint` | Run ESLint over `src/` and `demo-app/src/` |
| `yarn format` | Apply Prettier formatting |
| `yarn format:check` | Verify formatting without writing |
| `yarn demo:dev` | Start the demo app against the local build |

## Workflow

1. Fork the repo and create a topic branch off `main`.
2. Make your change with tests where appropriate.
3. Run `yarn lint`, `yarn typecheck`, `yarn test`, and `yarn format:check` locally.
4. **Add a changeset** describing your change (see below). PRs without a changeset will fail CI.
5. Push your branch and open a pull request against `main`. Mark it as a draft if it's still in progress.

## Changesets

This project uses [Changesets](https://github.com/changesets/changesets) to manage versions and publish to npm. Every PR that affects published behavior must include a changeset.

To add one:

```bash
yarn changeset
```

The CLI will ask you to pick a bump type and write a one-line summary. It creates a markdown file under `.changeset/` — commit it with your change.

### Picking the bump type

While the library is in `0.x`, we follow the **0ver** convention:

| Change | Bump type | Example |
|---|---|---|
| Breaking change | `minor` | `0.1.0` → `0.2.0` |
| New feature | `patch` | `0.1.0` → `0.1.1` |
| Bug fix | `patch` | `0.1.0` → `0.1.1` |

`major` is reserved for the deliberate `0.x` → `1.0.0` graduation. After `1.0.0`, the project switches to standard SemVer (`major` = breaking, `minor` = feature, `patch` = fix).

### PRs that don't need a release

If your PR is internal-only (refactor with no API surface change, docs, CI tweaks), add an empty changeset:

```bash
yarn changeset --empty
```

This satisfies the CI check without bumping the version.

### What a good changeset body looks like

For most changes, one sentence is fine. For breaking changes, the body should answer:

1. **What changed?** — the API delta
2. **Why?** — one-clause motivation
3. **How to migrate?** — a concrete before/after snippet

Example:

````markdown
---
"@dialogs-valve/react": minor
---

`<DialogProvider>` no longer accepts `routerAdapter` as a prop. Pass it through the `adapter` option on `createDialogsRegistry` instead.

**Migration:**

```tsx
// Before
<DialogProvider routerAdapter={reactRouterAdapter}>

// After
const registry = createDialogsRegistry({ adapter: reactRouterAdapter });
<DialogProvider registry={registry}>
```
````

## How releases happen

Releases are fully automated:

1. PRs land on `main` with their changesets.
2. The Changesets GitHub Action opens (and continuously updates) a "Version Packages" PR that accumulates the pending changes.
3. When a maintainer merges that PR, the action publishes to npm and creates a GitHub Release.

Maintainers never run `npm publish` manually.

## Reporting bugs

File an issue at <https://github.com/guiooak/dialogs-valve-react/issues>. Include a minimal repro (CodeSandbox / StackBlitz is ideal) and the versions of `@dialogs-valve/react`, `react`, and your router.

## Code of Conduct

By participating in this project you agree to abide by the [Code of Conduct](./CODE_OF_CONDUCT.md).
