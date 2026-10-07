---
title: seeded-maze
description: Deterministic maze generation with geometry, curved walls and provable multi-layer solvability.
---

seeded-maze generates mazes from a seed and describes them as plain data: a grid layout, render-ready
wall boxes, a navigation graph, smoothed wall outlines, and stacks of layers joined by stairs, drops
and jumps. It does not draw anything and has no opinion about your engine.

## Why use it?

| Problem | seeded-maze |
| --- | --- |
| A shared seed gives a different maze on another machine | The layout is a pure function of `(width, height, seed)` |
| Walls look like axis-aligned boxes | `buildCurvedWalls` smooths and wobbles them without changing which cells connect |
| A multi-floor maze can strand the player | `assertSolvable` proves the goal is reachable, honouring one-way drops |
| Every level feels the same | `findDeadEnds` reports side alcoves and their depth, so you can place rewards and scares |
| A maze library drags in a renderer | Plain arrays and maps, one small dependency (`seedrandom`) |

Start with [Getting started](./getting-started/), then use the [API reference](./API/) for signatures
and the [architecture notes](./ARCHITECTURE/) for the invariants behind them.
