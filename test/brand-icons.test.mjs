/* eslint-disable max-len */
/* Each brand's favicon and web app manifest (scripts/brand.js brandIcons, applyBrandIcons; the
   files under www's paths in etc/designs/): www's own (bd-brand-icons.mjs captures); a brand
   without a manifest on www shows none (no "Add to home screen" as Lufthansa); lh-com keeps
   /etc/designs/dcep/. Run: node --max-old-space-size=512 --test test/brand-icons.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import {
  BRANDS, brandIcons, applyBrandIcons, DEFAULT_ICONS,
} from '../scripts/brand.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const meta = (brand) => (name) => (name === 'brand' ? brand : '');
const file = (p) => path.join(root, p.replace(/^\//, ''));

test('brandIcons: lh-com\'s as in head.html; every brand its own', () => {
  assert.deepEqual(DEFAULT_ICONS, { icon: '/etc/designs/dcep/favicon.ico', manifest: '/etc/designs/dcep/manifest.json' });
  assert.ok(brandIcons(meta('')) === DEFAULT_ICONS);
  assert.deepEqual(brandIcons(meta('ita')), { icon: '/etc/designs/ita/favicon.ico', type: 'image/ico', manifest: '/etc/designs/ita/manifest.json' });
  assert.deepEqual(brandIcons(meta('discover')), { icon: '/etc/designs/four_y/favicon.ico', type: 'image/ico', manifest: '' }, 'www Discover links no manifest');
  assert.deepEqual(brandIcons(meta('cargo')), { icon: '/o/eportal-theme/images/favicon.ico', type: 'image/x-icon', manifest: '' });
  assert.deepEqual(brandIcons(meta('airdolomiti')), { icon: '/favicon/favicon.ico', type: 'image/png', manifest: '' }, 'www\'s favicon.ico is a PNG');
  Object.keys(BRANDS).forEach((key) => {
    const icons = brandIcons(meta(key));
    assert.ok(icons !== DEFAULT_ICONS && icons.icon !== DEFAULT_ICONS.icon, `${key} has its own icon`);
  });
});

test('the files are there: each icon, each manifest (JSON, not Lufthansa\'s) and the icons it names', () => {
  const head = fs.readFileSync(file('head.html'), 'utf8');
  assert.match(head, /<link rel="manifest" href="\/etc\/designs\/dcep\/manifest\.json">/, 'lh-com\'s head as before');
  assert.match(head, /<link rel="shortcut icon" href="\/etc\/designs\/dcep\/favicon\.ico" type="image\/ico">/);
  Object.keys(BRANDS).forEach((key) => {
    const { icon, manifest } = brandIcons(meta(key));
    assert.ok(fs.statSync(file(icon)).size > 0, `${key} ${icon}`);
    if (!manifest) return;
    const json = JSON.parse(fs.readFileSync(file(manifest), 'utf8'));
    assert.notEqual(json.name, 'Lufthansa', `${key} manifest`);
    (json.icons || []).forEach((ic) => {
      const src = new URL(ic.src, `https://x${manifest}`).pathname;
      assert.ok(fs.statSync(file(src)).size > 0, `${key} ${src}`);
    });
  });
});

test('applyBrandIcons: the head\'s links point at the brand\'s files; no manifest: no link; lh-com untouched', () => {
  const doc = (brand) => {
    const { document } = parseHTML(`<!DOCTYPE html><html><head>${brand ? `<meta name="brand" content="${brand}">` : ''}<link rel="manifest" href="/etc/designs/dcep/manifest.json"><link rel="shortcut icon" href="/etc/designs/dcep/favicon.ico" type="image/ico"></head><body></body></html>`);
    globalThis.document = document;
    return document;
  };
  const ita = doc('ita');
  applyBrandIcons();
  assert.equal(ita.querySelector('link[rel="shortcut icon"]').getAttribute('href'), '/etc/designs/ita/favicon.ico');
  assert.equal(ita.querySelector('link[rel="manifest"]').getAttribute('href'), '/etc/designs/ita/manifest.json');
  const discover = doc('discover');
  applyBrandIcons();
  assert.equal(discover.querySelector('link[rel="shortcut icon"]').getAttribute('href'), '/etc/designs/four_y/favicon.ico');
  assert.ok(discover.querySelector('link[rel="manifest"]') === null, 'no manifest');
  const lh = doc('');
  const before = lh.head.innerHTML;
  applyBrandIcons();
  assert.equal(lh.head.innerHTML, before);
  delete globalThis.document;
});

test('lh-edge rewrites the links on a brand host before the first paint (src/brand-icons.js)', () => {
  const src = fs.readFileSync(file('tools/workers/lh-edge/src/index.js'), 'utf8');
  assert.match(src, /if \(site\) resp = rewriteBrandIcons\(resp, incoming, site\);/);
  const deploy = fs.readFileSync(file('.github/workflows/deploy-lh-edge.yaml'), 'utf8');
  assert.match(deploy, /- 'scripts\/brand-icons\.js'/, 'lh-edge bundles brand-icons.js: its changes deploy');
  assert.match(fs.readFileSync(file('tools/workers/lh-edge/src/brand-icons.js'), 'utf8'), /from '\.\.\/\.\.\/\.\.\/\.\.\/scripts\/brand-icons\.js'/, 'not brand.js (it loads aem.js)');
});
