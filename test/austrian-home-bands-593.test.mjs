/* eslint-disable max-len */
/* The brief after 593, item 1: the Austrian homepage's short bands, released with the footer-disclaimer patch. Every
   rule needs today's disclaimer form in the document (a link to /fragments/modals/), so a homepage as published today is
   not changed (measured: 4543 / 5886 px with and without the rules). Run: node --max-old-space-size=256 --test test/austrian-home-bands-593.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8');
const start = css.indexOf('the homepage after its footer-disclaimer patch');
const end = css.indexOf('/* numbered steps', start);
const block = css.slice(css.indexOf('*/', start) + 2, end > 0 ? end : undefined);
const rules = block.replace(/\/\*[\s\S]*?\*\//g, '').split('}').map((r) => r.trim()).filter((r) => r.includes('{') && !r.startsWith('@media'));

test('every rule of the set needs the patched document (a link to /fragments/modals/)', () => {
  const selectors = rules.map((r) => r.replace(/^@media[^{]*\{/, '').split('{')[0].trim()).filter(Boolean);
  assert.ok(selectors.length >= 14);
  assert.ok(selectors.every((s) => s.startsWith('body.brand-austrian main:has(a[href*="/fragments/modals/"])')));
});

test('the values measured on the bands', () => {
  ['padding-top: 86px', 'padding-top: 59px', 'margin-bottom: 80px', 'margin-bottom: 44px', 'row-gap: 24px; margin-bottom: 60px',
    'calc(var(--section-gap) + 86px)', 'calc(var(--section-gap) + 81px)', 'calc(var(--section-gap) + 142px)', 'calc(var(--section-gap) + 82px)',
    'margin-top: 65px', 'margin-top: 114px'].forEach((v) => assert.ok(block.includes(v), v));
});
