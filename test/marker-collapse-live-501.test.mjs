/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 500, item 1: until a brand's theme is live (scripts/style-markers.js THEMES[brand].live, the one switch),
   the importers' last step leaves the markers alone, so an import comes out exactly as before ac3ff61f; with the theme
   live (or a site's collapse pass: force) it collapses. The importers (bundles, collapse-docs.mjs) never force.
   Run: node --max-old-space-size=512 --test test/marker-collapse-live-501.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { THEMES, isThemeLive } from '../scripts/style-markers.js';
import { collapseHtml, collapseMain } from '../tools/importer/marker-collapse.mjs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const DOC = '<div><p>{spacer-60}</p><h2 id="a-heading-small">A {heading-small}</h2><p>Text {full-width}</p></div>';
const run = (opts) => collapseHtml(DOC, { path: '/it/en/x', parse: parseHTML, ...opts });

test('no brand is live yet; the switch is THEMES[brand].live', () => {
  ['lufthansa', 'austrian', 'brussels', 'ita', 'swiss', 'tap', 'discover', 'b2b', 'cargo', 'airdolomiti'].forEach((b) => assert.equal(isThemeLive(b), false, b));
});

test('a brand whose theme is off: the document as it came; live or forced: collapsed', () => {
  assert.equal(run({ brand: 'ita' }).html, DOC);
  assert.equal(run({ brand: 'ita' }).changed, false);
  const forced = run({ brand: 'ita', force: true });
  assert.ok(forced.changed && !/\{/.test(forced.html), forced.html);
  THEMES.ita.live = true;
  try {
    assert.equal(run({ brand: 'ita' }).html, forced.html, 'live: the same as the forced pass');
    assert.equal(run({ brand: 'brussels' }).html, DOC, 'another brand stays');
  } finally {
    delete THEMES.ita.live;
  }
  assert.equal(isThemeLive('ita'), false);
});

test('the importers\' table form and the app screens too', () => {
  const { document } = parseHTML('<html><body><main><p>{spacer-60}</p><p>A {copytext-small}</p><hr><table><tr><th>Metadata</th></tr></table></main></body></html>');
  const main = document.querySelector('main');
  const before = main.innerHTML;
  collapseMain(main, { path: '/de/en/x', brand: 'lufthansa', document });
  assert.equal(main.innerHTML, before);
  const app = '<div><p>{spacer: medium}</p><p>Fine {small}</p></div>';
  assert.equal(collapseHtml(app, { path: '/content/mobile/lh/de/x', parse: parseHTML }).html, app);
  assert.notEqual(collapseHtml(app, { path: '/content/mobile/lh/de/x', parse: parseHTML, force: true }).html, app);
});

test('the importers never force; the CLI forces only when asked (a site\'s pass)', () => {
  assert.ok(!/force/.test(read('../tools/importer/collapse-docs.mjs').replace(/\/\*[\s\S]*?\*\//g, '')), 'collapse-docs.mjs');
  assert.ok(!/force/.test(read('../tools/importer/build-import-script.js')), 'the generated import scripts');
  assert.match(read('../tools/importer/marker-collapse-cli.mjs'), /const force = argv\.includes\('--force'\);/);
});
