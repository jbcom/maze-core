#!/usr/bin/env node
// Minimal dual-format build: tsc emits ESM (+ .d.ts) and CJS (+ .d.cts) separately from two
// tsconfigs, no bundler. The CJS output's .js files are renamed to .cjs so Node resolves them as
// CommonJS regardless of the package's "type": "module", matching the package.json exports map.
//
// The CJS build emits its OWN declarations rather than reusing the ESM ones. Pointing a "require"
// condition at a .d.ts inside a "type": "module" package makes TypeScript read those types as ESM
// while the runtime file is CJS; arethetypeswrong reports this as "Masquerading as ESM".
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
// TypeScript 7 does not export `bin/tsc`, so the launcher is addressed by path. Running it through
// the active Node executable avoids the platform-specific `.bin` shim (`tsc` vs `tsc.cmd`).
const tscBin = path.join(pkgRoot, 'node_modules', 'typescript', 'bin', 'tsc');

function run(args) {
  execFileSync(process.execPath, [tscBin, ...args], { cwd: pkgRoot, stdio: 'inherit' });
}

function walk(dir, visit) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, visit);
      continue;
    }
    visit(full, entry);
  }
}

// Order matters: .d.ts.map is tested before .d.ts, and .d.ts before .js, or a shorter suffix
// claims a file the longer one owns.
const CJS_RENAMES = [
  ['.d.ts.map', '.d.cts.map'],
  ['.d.ts', '.d.cts'],
  ['.js.map', '.cjs.map'],
  ['.js', '.cjs'],
];

function renameForCjs(dir) {
  walk(dir, (full, entry) => {
    for (const [from, to] of CJS_RENAMES) {
      if (entry.endsWith(from)) {
        renameSync(full, full.slice(0, -from.length) + to);
        return;
      }
    }
  });
}

// tsc writes `require("./foo.js")`, `//# sourceMappingURL=foo.js.map` and `from "./foo.js"` in
// declarations regardless of the emitted file names. Rewrite each to the .cjs / .d.cts names the
// files now actually have, since Node's CommonJS resolver and tsc both look for the literal name.
function fixCjsSpecifiers(dir) {
  walk(dir, (full, entry) => {
    const src = readFileSync(full, 'utf8');
    let fixed = src;
    if (entry.endsWith('.d.cts')) {
      fixed = src
        .replace(/(from\s*|import\s*\()(["'])(\.[^"']+)\.js\2/g, '$1$2$3.cjs$2')
        .replace(/(\/\/#\s*sourceMappingURL=)(\S+)\.d\.ts\.map/g, '$1$2.d.cts.map');
    } else if (entry.endsWith('.cjs')) {
      fixed = src
        .replace(/require\((["'])(\.[^"']+)\.js\1\)/g, 'require($1$2.cjs$1)')
        .replace(/(\/\/#\s*sourceMappingURL=)(\S+)\.js\.map/g, '$1$2.cjs.map');
    }
    if (fixed !== src) writeFileSync(full, fixed);
  });
}

rmSync(path.join(pkgRoot, 'dist'), { recursive: true, force: true });

run(['-p', 'tsconfig.esm.json']);
run(['-p', 'tsconfig.cjs.json']);

const cjsDir = path.join(pkgRoot, 'dist', 'cjs');
renameForCjs(cjsDir);
fixCjsSpecifiers(cjsDir);

// A "type": "module" package makes Node treat a bare .js under dist/cjs as ESM. dist/cjs gets its
// own manifest so the whole directory is CommonJS.
writeFileSync(
  path.join(cjsDir, 'package.json'),
  `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`,
);

console.info('maze-core: built dist/esm (ESM + types) and dist/cjs (CommonJS + types)');
