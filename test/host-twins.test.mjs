/* The parallel run on the second Cloudflare account: every bbird.live demo host (the old hosts)
   has its turnsthe.page twin, with the same treatment in every Worker's host lists (wrangler.toml
   vars and the code defaults). Brand hosts on turnsthe.page that are no twin (discover.turnsthe.page
   and later brands, scripts/demo.js TURNSTHE_PAGE_BRANDS) stand alone. Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isTurnsThePageHost, turnsThePageBrandOf } from '../scripts/demo.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const TWINS = {
  'lhcom.bbird.live': 'lufthansa.turnsthe.page',
  'lhedge.bbird.live': 'lufthansa-edge.turnsthe.page',
  'lhcn.bbird.live': 'lufthansa-cn.turnsthe.page',
  'lhforms.bbird.live': 'lufthansa-forms.turnsthe.page',
};
const TWIN_HOSTS = new Set(Object.values(TWINS));

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
  // and no twin without its bbird.live host (the lists stay pairs); a brand host that is no twin
  // stands alone
  all.filter((x) => /turnsthe\.page/.test(x)).forEach((x) => {
    const host = (x.match(/[a-z0-9-]+\.turnsthe\.page/) || [])[0];
    if (!TWIN_HOSTS.has(host)) {
      assert.ok(isTurnsThePageHost(host), `${label}: ${host} is no brand host (scripts/demo.js)`);
      return;
    }
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

test('brand hosts: <brand>.turnsthe.page and <brand>-<role>.turnsthe.page of the brand list only; every twin is one', () => {
  ['lufthansa.turnsthe.page', 'lufthansa-edge.turnsthe.page', 'lufthansa-cn.turnsthe.page', 'discover.turnsthe.page', 'discover-cn.turnsthe.page']
    .forEach((h) => assert.ok(isTurnsThePageHost(h), h));
  ['turnsthe.page', 'demo2.turnsthe.page', 'www.lufthansa.turnsthe.page', 'lufthansa-discover.example', 'lhdiscover.bbird.live']
    .forEach((h) => assert.ok(!isTurnsThePageHost(h), h));
  assert.deepEqual(['lufthansa-cn.turnsthe.page', 'discover.turnsthe.page', 'x.example'].map(turnsThePageBrandOf), ['lufthansa', 'discover', null]);
  TWIN_HOSTS.forEach((h) => assert.ok(isTurnsThePageHost(h), h));
  // a brand host may stand without a twin in a list; a twin may not
  assert.doesNotThrow(() => assertTwins('https://lhcom.bbird.live,https://lufthansa.turnsthe.page,https://discover.turnsthe.page', 'sample'));
  assert.throws(() => assertTwins('https://lhcom.bbird.live,https://lufthansa-edge.turnsthe.page', 'sample'));
});
