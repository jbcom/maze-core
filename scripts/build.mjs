#!/usr/bin/env node
// Clean ESM build without a bundler: tsc emits JavaScript, declarations and source maps from
// tsconfig.build.json into dist/. dist/ is removed first so a deleted module can never linger in
// a published tarball.
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tscBin = path.join(pkgRoot, 'node_modules', '.bin', 'tsc');

rmSync(path.join(pkgRoot, 'dist'), { recursive: true, force: true });
execFileSync(tscBin, ['-p', 'tsconfig.build.json'], { cwd: pkgRoot, stdio: 'inherit' });

console.info('@arcade-cabinet/maze-core: built dist (ESM + types)');
