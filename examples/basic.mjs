import {
  assertSolvable,
  buildCurvedWalls,
  buildGeometry,
  DEFAULT_CONFIG,
  findDeadEnds,
  generateLayeredMaze,
  generateMaze,
} from 'maze-core';

// One seeded maze: the same seed always gives the same layout.
const layout = generateMaze(9, 9, 'level-1');
const geometry = buildGeometry(layout, DEFAULT_CONFIG);
const walls = buildCurvedWalls(layout, DEFAULT_CONFIG);

// Three stacked layers, with a proof that the goal can be reached from the entry.
const layered = generateLayeredMaze({ layers: 3, width: 9, height: 9, seed: 'tower-1' });
const report = assertSolvable(layered);

console.log({
  size: `${layout.width}x${layout.height}`,
  exits: layout.exits.length,
  wallSegments: geometry.walls.length,
  railNodes: geometry.railNodes.size,
  curvedWalls: walls.length,
  deadEnds: findDeadEnds(layout).length,
  solvable: report.solvable,
  pathLength: report.pathLength,
});
