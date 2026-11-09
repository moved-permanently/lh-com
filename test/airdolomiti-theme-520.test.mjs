/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 520, item 3: Air Dolomiti gets a theme entry of its own (the base theme), so its switch is one line
   on token-free-airdolomiti-live as every brand's (harness-pass-airdolomiti.md waits for it). Off on main: its
   imports keep their markers; the pass collapses with --force (the form's Default column).
   Run: node --max-old-space-size=512 --test test/airdolomiti-theme-520.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { THEMES, themeFor } from '../scripts/style-markers.js';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { LIVE } from './live-brands.mjs';

test('Air Dolomiti has an entry of its own, the base theme, live only with its switch', () => {
  assert.ok('airdolomiti' in THEMES);
  assert.equal(themeFor('airdolomiti').live, LIVE.has('airdolomiti'));
  assert.deepEqual(themeFor('airdolomiti').headings, themeFor('cargo').headings, 'the base theme, as Cargo');
  // the bundles carry the same entry (the switch is one line in each)
  fs.readdirSync(new URL('../tools/importer/', import.meta.url)).filter((f) => f.endsWith('.bundle.js')).forEach((f) => {
    const src = fs.readFileSync(new URL(`../tools/importer/${f}`, import.meta.url), 'utf8');
    if (src.includes('cargo: {}')) assert.match(src, /airdolomiti: \{( live: true )?\}/, f);
  });
});

test('the pass: a newsletter form\'s {selected} becomes its Default column', () => {
  const doc = '<div><div class="form"><div><div>Label</div><div>Type</div><div>Name</div><div>Required</div><div>Options</div></div><div><div>Language</div><div>select</div><div>lang</div><div></div><div>it=Italiano {selected}<br>en=English</div></div></div></div>';
  const forced = collapseHtml(doc, {
    path: '/iscrizione-newsletter', brand: 'airdolomiti', parse: parseHTML, force: true,
  });
  assert.match(forced.html, /<div>Default<\/div>/);
  assert.ok(!/\{selected\}/.test(forced.html));
  if (!LIVE.has('airdolomiti')) assert.equal(collapseHtml(doc, { path: '/iscrizione-newsletter', brand: 'airdolomiti', parse: parseHTML }).html, doc, 'off: the import keeps it');
});
