# Changelog

## [0.3.0](https://github.com/jbcom/maze-core/compare/v0.2.0...v0.3.0) (2026-10-07)


### Features

* author maze ceilings and animated blockades ([#8](https://github.com/jbcom/maze-core/issues/8)) ([cd7204c](https://github.com/jbcom/maze-core/commit/cd7204ce71de6b7f8588e75a1f018e9fe843cadb))
* build, test and release @arcade-cabinet/maze-core from its own repository ([879120d](https://github.com/jbcom/maze-core/commit/879120d5b9eca20bf5405f9439a462c8f7953cef))
* close out 1.0 landing and asset redesign ([#3](https://github.com/jbcom/maze-core/issues/3)) ([a2e8e89](https://github.com/jbcom/maze-core/commit/a2e8e896e05b83f4983e92e9161125dcabe721a6))
* extract @arcade-cabinet/maze-core package with multi-layer + curved-wall generation ([#1](https://github.com/jbcom/maze-core/issues/1)) ([65c131b](https://github.com/jbcom/maze-core/commit/65c131bb9d776be26bf08a6a81ef3394d551b2e7))


### Bug Fixes

* NodeNext .js specifiers in maze-core ESM output (0.1.1) ([#2](https://github.com/jbcom/maze-core/issues/2)) ([b7b5955](https://github.com/jbcom/maze-core/commit/b7b5955b0a55dd9e132343f86551aadc8caccd28))

## 0.2.0 (2026-10-07)

First release on npmjs, under the name `maze-core`, as open source under the MIT licence.

### Features

* ship a CommonJS build alongside ESM, each with its own declarations
* publish to npmjs with provenance

### Chores

* move to TypeScript 7, Vitest 5, Node 24 as the floor and Node 26 as the build toolchain

## 0.1.1

### Bug Fixes

* write `.js` import specifiers in the ESM output so Node resolves every module

## 0.1.0

* seeded grid mazes with perimeter exits
* rail-node geometry and grid/world conversion
* multi-layer mazes with stair, drop and jump connectors, a solvability proof and dead-end analysis
* curved-wall outlines that can never open a wall or seal a passage
