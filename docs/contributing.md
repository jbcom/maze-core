---
title: Contributing
description: Set up maze-core, validate a change, and contribute through the protected workflow.
---

## Local workflow

```sh
mise install
pnpm install --frozen-lockfile
pnpm verify
pnpm docs:build
```

`pnpm verify` is the library gate: Biome, Markdown linting, strict TypeScript, tests with coverage,
the dual-format build, runnable examples, package validation, and a clean-consumer runtime check.
`pnpm docs:build` validates and renders the Sourcey site.

Branch from `main`, make a focused Conventional Commit, open a pull request, and keep the branch
current by merging `main` into it when necessary. Do not hand-edit versions or `CHANGELOG.md`:
release-please owns them.

Read the repository [contribution guide](https://github.com/jbcom/maze-core/blob/main/CONTRIBUTING.md)
and [agent instructions](https://github.com/jbcom/maze-core/blob/main/AGENTS.md) before changing
public APIs.
