#!/usr/bin/env node
// Built-tarball consumer smoke (fleet package contract): pack the package, install the tarball into a
// clean scratch consumer, then load the entry point through ESM import and exercise one call per
// module. The package is ESM-only, so there is no CommonJS leg. Proves the exports map and the files
// list. With MAZE_CORE_CONSUMER_SOURCE=
// @arcade-cabinet/maze-core@<version> it installs that published version from the registry instead,
// with no credential in reach (the release workflow's last step).
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REGISTRY = 'https://registry.npmjs.org/';
const NAME = '@arcade-cabinet/maze-core';
const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const scratch = mkdtempSync(path.join(tmpdir(), 'arcade-maze-core-smoke-'));
const registrySource = process.env.MAZE_CORE_CONSUMER_SOURCE;

try {
  if (
    registrySource &&
    !/^@arcade-cabinet\/maze-core@\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(registrySource)
  ) {
    throw new Error(`MAZE_CORE_CONSUMER_SOURCE must be an exact ${NAME}@<version> spec`);
  }
  const expectedVersion = registrySource ? registrySource.slice(NAME.length + 1) : manifest.version;
  let source = registrySource;
  if (!source) {
    execFileSync('npm', ['pack', '--pack-destination', scratch], {
      cwd: packageRoot,
      stdio: 'inherit',
    });
    const tarball = readdirSync(scratch).find((file) => file.endsWith('.tgz'));
    if (!tarball) throw new Error('npm pack produced no tarball');
    source = path.join(scratch, tarball);
  }

  const consumer = path.join(scratch, 'consumer');
  mkdirSync(consumer, { recursive: true });
  writeFileSync(
    path.join(consumer, 'package.json'),
    JSON.stringify({ name: 'maze-core-smoke-consumer', private: true, type: 'module' }),
  );
  // Anonymous: a user config with the public registry plus the fleet scope and nothing else, an
  // empty global config, and no inherited npm_config_* or credential-looking variables (pnpm run
  // exports npm_config_* into scripts), so no token on the machine can authenticate this install.
  const userConfig = path.join(scratch, 'anonymous.npmrc');
  const globalConfig = path.join(scratch, 'empty-global.npmrc');
  writeFileSync(
    userConfig,
    `registry=https://registry.npmjs.org/\n@arcade-cabinet:registry=${REGISTRY}\n`,
  );
  writeFileSync(globalConfig, '');
  const anonymousEnv = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !/^npm_config_/i.test(key) && !/auth|token|secret|password|credential/i.test(key),
    ),
  );
  execFileSync(
    'npm',
    [
      'install',
      '--no-audit',
      '--no-fund',
      '--ignore-scripts',
      '--userconfig',
      userConfig,
      '--globalconfig',
      globalConfig,
      source,
    ],
    { cwd: consumer, stdio: 'inherit', env: anonymousEnv },
  );

  // One call per module: a seeded maze is deterministic, its geometry has rail nodes, the layered
  // generator is provably solvable across layers, and the curved walls come out as polylines.
  const esm = `
    import * as api from ${JSON.stringify(NAME)}
    import pkg from ${JSON.stringify(`${NAME}/package.json`)} with { type: 'json' }
    if (pkg.version !== ${JSON.stringify(expectedVersion)}) throw new Error('version ' + pkg.version)
    for (const name of [
      'generateMaze', 'getConnections', 'buildGeometry', 'getNodeConnections', 'gridToWorld',
      'worldToGrid', 'generateLayeredMaze', 'assertSolvable', 'findDeadEnds', 'buildCurvedWalls',
      'distanceToWall', 'minDistanceToWalls', 'maxDeviation',
    ]) {
      if (typeof api[name] !== 'function') throw new Error('missing export ' + name)
    }
    const a = api.generateMaze(9, 9, 'smoke')
    const b = api.generateMaze(9, 9, 'smoke')
    if (JSON.stringify(a.cells) !== JSON.stringify(b.cells)) throw new Error('maze not deterministic')
    if (a.width !== 9 || a.height !== 9) throw new Error('maze size ' + a.width + 'x' + a.height)
    const geometry = api.buildGeometry(a, api.DEFAULT_CONFIG)
    if (geometry.railNodes.size === 0 || geometry.walls.length === 0) throw new Error('empty geometry')
    const layered = api.generateLayeredMaze({ layers: 3, width: 9, height: 9, seed: 'smoke' })
    const report = api.assertSolvable(layered)
    if (!report.solvable || report.unreachableLayers.length !== 0) {
      throw new Error('layered maze unsolvable: ' + JSON.stringify(report))
    }
    const walls = api.buildCurvedWalls(a, api.DEFAULT_CONFIG)
    if (walls.length === 0) throw new Error('no curved walls')
    console.log('esm ok')
  `;
  writeFileSync(path.join(consumer, 'esm.mjs'), esm);
  execFileSync(process.execPath, ['esm.mjs'], { cwd: consumer, stdio: 'inherit' });
  console.info(
    `${NAME}: consumer smoke passed (ESM) from ${registrySource ?? 'the packed tarball'}`,
  );
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
