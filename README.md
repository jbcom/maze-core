# @arcade-cabinet/maze-core

Engine-agnostic maze generation for arcade-cabinet games. Pure data in and out, no rendering
library types, deterministic for a given seed. Extracted from Beppo-Laughs.

- **Seeded grid mazes.** `generateMaze(width, height, seed)` returns a `MazeLayout` (cells, passages,
  centre, perimeter exits). Dimensions are forced odd so the centre is shared.
- **Rail-node geometry.** `buildGeometry(layout, config)` turns a layout into wall segments, floor and
  ceiling tiles and a rail-node graph; `gridToWorld` / `worldToGrid` convert between the two spaces.
- **Multi-layer topology.** `generateLayeredMaze({ layers, width, height, seed })` stacks layers joined
  by `stair`, `drop` and `jump` connectors, and `assertSolvable` proves the goal is reachable from the
  entry across layers. `findDeadEnds` reports dead ends and their distance from the solution path.
- **Curved-wall outlines.** `buildCurvedWalls` smooths and wobbles the wall lines into polylines, clamped
  so a curve can never open a walled boundary or seal an open passage.

## Install

```sh
pnpm add @arcade-cabinet/maze-core
```

Served by the `arcade-cabinet` Gitea registry on a private network, read anonymously:

```ini
@arcade-cabinet:registry=https://registry.npmjs.org/
```

The package is ESM-only.

## Usage

```ts
import { buildGeometry, DEFAULT_CONFIG, generateMaze } from '@arcade-cabinet/maze-core';

const layout = generateMaze(9, 9, 'level-1');
const geometry = buildGeometry(layout, DEFAULT_CONFIG);
```

## Development

Built on the fleet toolchain, Node 26 (`.node-version`) and pnpm 12 (`packageManager`, through
Corepack); the package itself runs on Node 24 and later.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm verify   # Biome, tsc, Vitest, the ESM build, a packed-tarball consumer smoke
```

## Release

Conventional Commits drive release-please; merging its release pull request tags `v<version>`.
The publish job in `.gitea/workflows/release.yml` reconciles on every `main` run: when the manifest
version is tagged but absent from the registry, it verifies at the tag, packs twice and requires byte
identity, publishes those bytes with the organisation secret `NPM_TOKEN` from a
throwaway npmrc, then reruns the consumer smoke against the published version with
`MAZE_CORE_CONSUMER_SOURCE=@arcade-cabinet/maze-core@<version>` and an anonymous npm config.
Never edit the `version` field by hand. Why the repository is shaped this way: `docs/decisions.md`.
