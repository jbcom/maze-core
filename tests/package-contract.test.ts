// @vitest-environment node
// Keeps the manifest pointing at the package's public home and keeps the dual-format wiring
// intact, so a stray edit cannot quietly turn the package back into a private or ESM-only one.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '..');
const read = (file: string) => readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('package.json')) as {
  name: string;
  license: string;
  version: string;
  homepage: string;
  repository: { type: string; url: string };
  engines: Record<string, string>;
  packageManager: string;
  publishConfig: { access: string; provenance: boolean; registry?: string };
  exports: Record<string, unknown>;
  scripts: Record<string, string>;
};

describe('package contract', () => {
  it('is the public MIT package seeded-maze, published from GitHub', () => {
    expect(manifest.name).toBe('seeded-maze');
    expect(manifest.homepage).toBe('https://jonbogaty.com/seeded-maze/');
    expect(manifest.license).toBe('MIT');
    expect(manifest.repository).toEqual({
      type: 'git',
      url: 'git+https://github.com/jbcom/seeded-maze.git',
    });
    expect(manifest.publishConfig).toEqual({ access: 'public', provenance: true });
    expect(read('.npmrc')).toBe('registry=https://registry.npmjs.org/\nprovenance=true\n');
  });

  it('builds on pnpm 12 and supports Node 22, 24 and 26', () => {
    expect(manifest.packageManager).toMatch(/^pnpm@12\.\d+\.\d+$/);
    expect(manifest.engines).toEqual({ node: '>=22' });
    expect(read('.nvmrc').trim()).toBe('26');
    const ci = read('.github/workflows/ci.yml');
    expect([...ci.matchAll(/node: "(\d+)"/g)].map((match) => match[1])).toEqual(['22', '24', '26']);
  });

  it('ships ESM and CommonJS, each with its own declarations', () => {
    expect(manifest.exports['.']).toEqual({
      import: { types: './dist/esm/index.d.ts', default: './dist/esm/index.js' },
      require: { types: './dist/cjs/index.d.cts', default: './dist/cjs/index.cjs' },
    });
  });

  it('verifies everything in one gate, including the packed consumer', () => {
    expect(manifest.scripts.verify).toContain('pnpm run package:check');
    expect(manifest.scripts['package:check']).toBe(
      'publint && attw --pack . && node scripts/verify-package.mjs',
    );
    expect(read('.github/workflows/ci.yml')).toContain('run: pnpm verify');
  });

  it('keeps release-please on one package at the root, starting from the manifest version', () => {
    const config = JSON.parse(read('release-please-config.json')) as {
      packages: Record<string, { 'package-name': string }>;
    };
    expect(Object.keys(config.packages)).toEqual(['.']);
    expect(config.packages['.']?.['package-name']).toBe('seeded-maze');
    expect(JSON.parse(read('.release-please-manifest.json'))).toEqual({ '.': manifest.version });
  });
});
