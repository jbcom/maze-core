---
title: Getting started
description: Install seeded-maze and generate, measure and render your first maze.
---

## Install

```sh
npm install seeded-maze
```

Use Node.js 24 or newer. seeded-maze ships native ESM and CommonJS entry points with format-correct
TypeScript declarations.

## A single maze

```ts
import { buildGeometry, DEFAULT_CONFIG, generateMaze } from 'seeded-maze';

const layout = generateMaze(9, 9, 'level-1');
const geometry = buildGeometry(layout, DEFAULT_CONFIG);

for (const wall of geometry.walls) {
  // Place a box of wall.width x wall.height x wall.depth at (wall.x, wall.z).
}
```

The same seed gives the same maze everywhere. Change the seed for a new one. Even dimensions are bumped
to the next odd number so the maze has a single centre cell.

## Moving through it

```ts
import { getNodeConnections } from 'seeded-maze';

let node = geometry.railNodes.get(geometry.centerNodeId);
if (node) {
  const options = getNodeConnections(geometry, node.id); // the nodes you can step to
  node = options[0];
}
```

`gridToWorld` and `worldToGrid` convert between cells and world positions, so a character controller
can ask which cell it is standing in.

## Curved walls

```ts
import { buildCurvedWalls, minDistanceToWalls } from 'seeded-maze';

const walls = buildCurvedWalls(layout, DEFAULT_CONFIG, {
  smoothing: 2,
  wobble: { amplitude: 0.4, wavelength: 8, seed: 'level-1' },
});
const clearance = minDistanceToWalls({ x: 0, z: 0 }, walls);
```

## Several layers

```ts
import { assertSolvable, generateLayeredMaze } from 'seeded-maze';

const tower = generateLayeredMaze({ layers: 4, width: 11, height: 11, seed: 'tower-1' });
const report = assertSolvable(tower);
if (!report.solvable) throw new Error(`unreachable layers: ${report.unreachableLayers}`);
```

Runnable ESM and CommonJS examples are in the
[repository](https://github.com/jbcom/seeded-maze/tree/main/examples).
