const { assertSolvable, generateLayeredMaze, generateMaze } = require('maze-core');

const layout = generateMaze(9, 9, 'commonjs');
const layered = generateLayeredMaze({ layers: 2, width: 9, height: 9, seed: 'commonjs' });

console.log({
  size: `${layout.width}x${layout.height}`,
  solvable: assertSolvable(layered).solvable,
});
