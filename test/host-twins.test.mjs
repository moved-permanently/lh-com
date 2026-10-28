/* The parallel run on the second Cloudflare account: every bbird.live demo host has its
   turnsthe.page twin, with the same treatment in every Worker's host lists (wrangler.toml vars and
   the code defaults). Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const TWINS = {
  'lhcom.bbird.live': 'lufthansa.turnsthe.page',
  'lhedge.bbird.live': 'lufthansa-edge.turnsthe.page',
  'lhcn.bbird.live': 'lufthansa-cn.turnsthe.page',
  'lhforms.bbird.live': 'lufthansa-forms.turnsthe.page',
  'lhdiscover.bbird.live': 'lufthansa-discover.turnsthe.page',
};

/** The [vars] of a wrangler.toml (one-line string values). */
const vars = (worker) => {
  const text = fs.readFileSync(path.join(root, 'tools/workers', worker, 'wrangler.toml'), 'utf8');
  return Object.fromEntries([...text.matchAll(/^([A-Z_]+) = "([^"]*)"$/gm)].map((m) => [m[1], m[2]]));
};
const items = (v) => String(v || '').split(/[,;]/).map((s) => s.trim()).filter(Boolean);
// an item with its bbird.live host replaced by the twin (a host, an origin, host=countries)
const twinOf = (item) => item.replace(/[a-z0-9-]+\.bbird\.live/, (h) => TWINS[h] || `${h} (no twin)`);

/** Every bbird.live item of a list has its twin in the same list. */
function assertTwins(list, label) {
  const all = items(list);
  const demo = all.filter((x) => /\.bbird\.live/.test(x));
  assert.ok(demo.length, `${label}: no bbird.live host`);
  demo.forEach((x) => assert.ok(all.includes(twinOf(x)), `${label}: ${x} without ${twinOf(x)}`));
  // and no turnsthe.page host without its bbird.live twin (the lists stay pairs)
  all.filter((x) => /turnsthe\.page/.test(x)).forEach((x) => {
    assert.ok(demo.some((d) => twinOf(d) === x), `${label}: ${x} has no bbird.live twin`);
  });
}

test('lh-edge: pilot, pilot-countries and alias host lists have every twin', () => {
  const v = vars('lh-edge');
  ['PILOT_HOSTS', 'PILOT_COUNTRIES_BY_HOST', 'ALIAS_HOSTS', 'ALIAS_REWRITE_HOSTS'].forEach((k) => assertTwins(v[k], `lh-edge ${k}`));
  assert.ok(items(v.PILOT_COUNTRIES_BY_HOST).includes('lufthansa.turnsthe.page=ch'));
});

test('lh-forms and lh-messages: the allowed origins have every twin (config and code default)', async () => {
  assertTwins(vars('lh-forms').EXTRA_ALLOWED_ORIGINS, 'lh-forms EXTRA_ALLOWED_ORIGINS');
  assertTwins(vars('lh-messages').EXTRA_ALLOWED_ORIGINS, 'lh-messages EXTRA_ALLOWED_ORIGINS');
  const src = fs.readFileSync(path.join(root, 'tools/workers/lh-forms/src/index.js'), 'utf8');
  const fallback = (src.match(/EXTRA_ALLOWED_ORIGINS: '([^']*)'/) || [])[1];
  assert.equal(fallback, vars('lh-forms').EXTRA_ALLOWED_ORIGINS, 'lh-forms default = its wrangler.toml');
});
