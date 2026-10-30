/* The Workers' host lists (wrangler.toml vars and the code defaults) name only the replica's
   turnsthe.page brand hosts (scripts/demo.js TURNSTHE_PAGE_BRANDS), the Edge Delivery hosts and
   localhost: no retired bbird.live host and no *.aem-poc-lab.workers.dev address (lh-edge's
   ALIAS_REWRITE_HOSTS keeps the old hosts: it recognises old links in content). Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isTurnsThePageHost, turnsThePageBrandOf } from '../scripts/demo.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// the Workers with a config here (lh-msm deploys from its own source: its README)
const WORKERS = ['lh-edge', 'lh-forms', 'lh-messages', 'lh-proxy'].filter((w) => fs.existsSync(path.join(root, 'tools/workers', w, 'wrangler.toml')));
const RETIRED = /\.bbird\.live\b|aem-poc-lab/;
// lists that recognise old links in content keep the retired hosts
const KEEP = new Set(['lh-edge ALIAS_REWRITE_HOSTS']);

/** The [vars] of a wrangler.toml (one-line string values). */
const vars = (worker) => {
  const text = fs.readFileSync(path.join(root, 'tools/workers', worker, 'wrangler.toml'), 'utf8');
  return Object.fromEntries([...text.matchAll(/^([A-Z_]+) = "([^"]*)"$/gm)].map((m) => [m[1], m[2]]));
};
const items = (v) => String(v || '').split(/[,;]/).map((s) => s.trim()).filter(Boolean);

test('no Worker var names a retired bbird.live host or an aem-poc-lab address', () => {
  WORKERS.forEach((w) => Object.entries(vars(w)).forEach(([k, v]) => {
    if (KEEP.has(`${w} ${k}`)) return;
    assert.ok(!RETIRED.test(v), `${w} ${k} = ${v}`);
  }));
});

test('every turnsthe.page host in a Worker\'s host lists is a brand host', () => {
  WORKERS.forEach((w) => Object.entries(vars(w)).filter(([k]) => /HOSTS|ORIGINS|HOST$/.test(k)).forEach(([k, v]) => {
    items(v).forEach((item) => {
      const host = (item.match(/[a-z0-9-]+\.turnsthe\.page/) || [])[0];
      if (host) assert.ok(isTurnsThePageHost(host), `${w} ${k}: ${host}`);
    });
  }));
  assert.ok(items(vars('lh-edge').PILOT_COUNTRIES_BY_HOST).includes('lufthansa.turnsthe.page=ch'));
});

test('the code defaults of the origin lists equal their wrangler.toml and name no retired host', () => {
  [['lh-forms', 'EXTRA_ALLOWED_ORIGINS'], ['lh-proxy', 'EXTRA_ALLOWED_ORIGINS']].forEach(([w, k]) => {
    const src = fs.readFileSync(path.join(root, 'tools/workers', w, 'src/index.js'), 'utf8');
    const fallback = (src.match(new RegExp(`${k}: '([^']*)'`)) || [])[1];
    assert.equal(fallback, vars(w)[k], `${w} default = its wrangler.toml`);
    assert.ok(!RETIRED.test(src.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '')), `${w} src`);
  });
});

test('brand hosts: <brand>.turnsthe.page and <brand>-<role>.turnsthe.page of the brand list only', () => {
  ['lufthansa.turnsthe.page', 'lufthansa-edge.turnsthe.page', 'lufthansa-cn.turnsthe.page', 'lufthansa-forms.turnsthe.page', 'discover.turnsthe.page', 'discover-cn.turnsthe.page']
    .forEach((h) => assert.ok(isTurnsThePageHost(h), h));
  ['turnsthe.page', 'demo2.turnsthe.page', 'www.lufthansa.turnsthe.page', 'lufthansa-discover.example', 'lhcom.bbird.live']
    .forEach((h) => assert.ok(!isTurnsThePageHost(h), h));
  assert.deepEqual(['lufthansa-cn.turnsthe.page', 'discover.turnsthe.page', 'x.example'].map(turnsThePageBrandOf), ['lufthansa', 'discover', null]);
});
