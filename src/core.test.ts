import { describe, expect, it } from 'vitest';
import { generateMaze, getConnections, type MazeCell } from './core.js';

describe('generateMaze', () => {
  it('generates maze with correct dimensions', () => {
    const maze = generateMaze(7, 7, 'test');

    expect(maze.width).toBe(7);
    expect(maze.height).toBe(7);
    expect(maze.cells.length).toBe(7);
    expect(maze.cells[0].length).toBe(7);
  });

  it('enforces odd dimensions', () => {
    const maze = generateMaze(6, 8, 'test');

    expect(maze.width).toBe(7);
    expect(maze.height).toBe(9);
  });

  it('center cell is correctly identified', () => {
    const maze = generateMaze(7, 7, 'test');

    expect(maze.center.x).toBe(3);
    expect(maze.center.y).toBe(3);

    const centerCell = maze.cells[maze.center.y][maze.center.x];
    expect(centerCell.isCenter).toBe(true);
  });

  it('has at least one exit on perimeter', () => {
    const maze = generateMaze(9, 9, 'test');

    const exits: MazeCell[] = [];
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        if (maze.cells[y][x].isExit) {
          exits.push(maze.cells[y][x]);
        }
      }
    }

    expect(exits.length).toBeGreaterThan(0);

    exits.forEach((exit) => {
      const isOnPerimeter =
        exit.x === 0 || exit.x === maze.width - 1 || exit.y === 0 || exit.y === maze.height - 1;
      expect(isOnPerimeter).toBe(true);
    });
  });

  it('all cells are visited (connected maze)', () => {
    const maze = generateMaze(9, 9, 'connectivity');

    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        expect(maze.cells[y][x].visited).toBe(true);
      }
    }
  });

  it('walls are consistent between adjacent cells', () => {
    const maze = generateMaze(7, 7, 'walls');

    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        const cell = maze.cells[y][x];

        if (x < maze.width - 1) {
          const rightCell = maze.cells[y][x + 1];
          expect(cell.walls.east).toBe(rightCell.walls.west);
        }

        if (y < maze.height - 1) {
          const belowCell = maze.cells[y + 1][x];
          expect(cell.walls.south).toBe(belowCell.walls.north);
        }
      }
    }
  });

  it('same seed produces identical maze', () => {
    const maze1 = generateMaze(9, 9, 'deterministic');
    const maze2 = generateMaze(9, 9, 'deterministic');

    for (let y = 0; y < maze1.height; y++) {
      for (let x = 0; x < maze1.width; x++) {
        expect(maze1.cells[y][x].walls).toEqual(maze2.cells[y][x].walls);
        expect(maze1.cells[y][x].isExit).toBe(maze2.cells[y][x].isExit);
      }
    }
  });

  it('different seeds produce different mazes', () => {
    const maze1 = generateMaze(11, 11, 'seed-a');
    const maze2 = generateMaze(11, 11, 'seed-b');

    let differences = 0;
    for (let y = 0; y < maze1.height; y++) {
      for (let x = 0; x < maze1.width; x++) {
        if (maze1.cells[y][x].walls.north !== maze2.cells[y][x].walls.north) differences++;
        if (maze1.cells[y][x].walls.south !== maze2.cells[y][x].walls.south) differences++;
        if (maze1.cells[y][x].walls.east !== maze2.cells[y][x].walls.east) differences++;
        if (maze1.cells[y][x].walls.west !== maze2.cells[y][x].walls.west) differences++;
      }
    }

    expect(differences).toBeGreaterThan(0);
  });

  it('path exists from center to at least one exit', () => {
    const maze = generateMaze(11, 11, 'path-test');

    const visited = new Set<string>();
    const queue: [number, number][] = [[maze.center.x, maze.center.y]];
    let foundExit = false;

    while (queue.length > 0 && !foundExit) {
      const next = queue.shift();
      if (!next) continue;
      const [x, y] = next;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      const cell = maze.cells[y][x];
      if (cell.isExit) {
        foundExit = true;
        break;
      }

      if (!cell.walls.north && y > 0) queue.push([x, y - 1]);
      if (!cell.walls.south && y < maze.height - 1) queue.push([x, y + 1]);
      if (!cell.walls.east && x < maze.width - 1) queue.push([x + 1, y]);
      if (!cell.walls.west && x > 0) queue.push([x - 1, y]);
    }

    expect(foundExit).toBe(true);
  });
});

describe('getConnections', () => {
  const maze = generateMaze(9, 9, 'connections');

  it('lists exactly the open neighbours of an interior cell', () => {
    for (const row of maze.cells) {
      for (const cell of row) {
        if (cell.x === 0 || cell.y === 0 || cell.x === 8 || cell.y === 8) continue;
        const open = (['north', 'south', 'east', 'west'] as const).filter((d) => !cell.walls[d]);
        const connections = getConnections(maze, cell.x, cell.y);
        expect(connections.map((c) => c.direction).sort()).toEqual([...open].sort());
        for (const c of connections) {
          expect(Math.abs(c.x - cell.x) + Math.abs(c.y - cell.y)).toBe(1);
        }
      }
    }
  });

  it('is symmetric: if A reaches B then B reaches A', () => {
    for (const passage of maze.passages) {
      const back = getConnections(maze, passage.to.x, passage.to.y);
      expect(back.some((c) => c.x === passage.from.x && c.y === passage.from.y)).toBe(true);
    }
  });

  it('returns nothing for a coordinate outside the grid', () => {
    expect(getConnections(maze, -1, 0)).toEqual([]);
    expect(getConnections(maze, 0, 99)).toEqual([]);
    expect(getConnections(maze, 99, 99)).toEqual([]);
  });

  it('lets an exit cell step out of the maze through its perimeter side', () => {
    for (const exit of maze.exits) {
      const outside = getConnections(maze, exit.x, exit.y).filter(
        (c) => c.x < 0 || c.y < 0 || c.x >= maze.width || c.y >= maze.height,
      );
      expect(outside).toHaveLength(1);
    }
  });
});
