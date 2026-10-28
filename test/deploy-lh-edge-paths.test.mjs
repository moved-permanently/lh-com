/* eslint-disable max-len -- dev tooling */
/* The "Deploy lh-edge" workflow runs on changes to every file the worker bundles: lh-edge's code
   and the site modules it imports (transitively), and the locale data the locale table is
   generated from. A file missing from its `paths` would change the site and leave lh-edge on the
   old code. Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EDGE = path.join(root, 'tools/workers/lh-edge');
const WORKFLOW = path.join(root, '.github/workflows/deploy-lh-edge.yaml');

/** The workflow's push paths. */
const workflowPaths = (yaml) => {
  const block = yaml.slice(yaml.indexOf('paths:'), yaml.indexOf('workflow_dispatch'));
  return [...block.matchAll(/^\s*- '([^']+)'/gm)].map((m) => m[1]);
};
const covered = (file, paths) => paths.some((p) => (p.endsWith('/**') ? file.startsWith(p.slice(0, -2)) : file === p));

/** The repository files outside tools/workers/lh-edge/ that the worker's src imports. */
function bundledOutside() {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  const seen = new Set();
  const visit = (f) => {
    if (seen.has(f) || !fs.existsSync(f)) return;
    seen.add(f);
    if (!/\.m?js$/.test(f)) return;
    const src = fs.readFileSync(f, 'utf8');
    [...src.matchAll(/(?:from\s*|import\s*\(\s*|import\s+)['"](\.{1,2}\/[^'"]+)['"]/g)].forEach((m) => visit(path.resolve(path.dirname(f), m[1])));
  };
  walk(path.join(EDGE, 'src')).filter((f) => /\.m?js$/.test(f)).forEach(visit);
  return [...seen].filter((f) => !f.startsWith(`${EDGE}/`)).map((f) => path.relative(root, f)).sort();
}

test('deploy-lh-edge: the workflow runs on every site module lh-edge bundles', () => {
  const paths = workflowPaths(fs.readFileSync(WORKFLOW, 'utf8'));
  assert.ok(covered('tools/workers/lh-edge/src/index.js', paths));
  const outside = bundledOutside();
  assert.ok(outside.includes('scripts/locale-table.js'), 'lh-edge bundles the locale table');
  assert.deepEqual(outside.filter((f) => !covered(f, paths)), []);
});

test('deploy-lh-edge: and on the locale data the locale table is generated from', () => {
  const paths = workflowPaths(fs.readFileSync(WORKFLOW, 'utf8'));
  assert.ok(covered('tools/markets/locale-data.json', paths));
  assert.ok(covered('.github/workflows/deploy-lh-edge.yaml', paths));
});
