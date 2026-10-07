# Decisions

## 2026-10-07: moved out of Beppo-Laughs into its own repository

**Decision.** `@arcade-cabinet/maze-core` left `Beppo-Laughs/packages/maze-core` for
`arcade-cabinet/maze-core`, with its history (`git filter-repo --subdirectory-filter`).
Beppo-Laughs now installs it from the registry like any other consumer (shadow-and-gold
already did).

**Why.** The owner: "You shouldn't need other games as dependencies for shared packages."
Beppo-Laughs had kept it as `workspace:*` because it was the publisher; that made a second
game depend on a package whose source lived in the first game's repository, and the package
could only be released through that game's lockfile and workspace.

## The repository shape is the fleet package shape

Same as `arcade-cabinet/mobile`, `input-joystick` and `persistence-save`: `ci.yml` runs
`pnpm verify` on every push and pull request; `release.yml` runs release-please and a publish
job that reconciles the manifest version against tags and the registry, packs twice for byte
identity and proves the published version anonymously. Tags are plain `v<version>`.

Biome uses the style the source was written in (single quotes, semicolons, trailing commas),
so the move did not reformat it; one over-long line in `src/multiLayer.test.ts` was the only
source change. `prepack` builds, so a bare `npm pack` can never ship a stale or missing `dist`.

## The package stays ESM-only

It was ESM-only in Beppo-Laughs (`exports` has only `import`) and a relocation does not change
the module format, so no CommonJS build was added. The consumer smoke therefore has an ESM leg
only.

## `tsconfig.json` no longer extends the game's

The package's tsconfig extended `../../tsconfig.json`, the game's. The compiler options it
relied on are now inline in `tsconfig.json` (strict, `noUnused*`, bundler resolution, ES2022).
`tsconfig.build.json` extends it for the emit (declarations, source maps, tests excluded), so
`pnpm typecheck` covers the colocated `*.test.ts` files that the build leaves out of `dist`.

## Toolchain: Node 26 and pnpm 12 to build, Node 24 as the floor to run

Built where the fleet is moving. `engines` is `>=24` with no ceiling and `@types/node` stays on
24: a library must not reach for an API its oldest supported consumer lacks. TypeScript is 5.9
and Vitest 5.

## Versioning continues from the registry

0.1.0 and 0.1.1 were published from Beppo-Laughs. The manifest starts at 0.1.1 with
`bootstrap-sha` on the last imported commit, so release-please computes the next version from
this repository's own commits.
