/* eslint-disable max-len */
/* Standing order 56: Austrian's help app (help-center-web on the contact and help-center pages, the body's
   maui-theme-os) as the page's end: www's footer 36 px under the app's grey band on all 24 recorded page-widths
   (12 documents at 390 and 1440, austrian-parity-001 / -003 / -006 / -007 / -019); ours the section's 48 px. The
   culinary hub's app (culinary-hub, the same body class) and the other brands' help pages keep theirs.
   Run: node --max-old-space-size=256 --test test/micro-frontend-austrian-help-footer-gap-so56.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/micro-frontend/micro-frontend.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [m[1].trim(), m[2].trim()]);

test('Austrian: 36 px from the help app\'s section to the footer', () => {
  const r = rules.filter(([s]) => s.startsWith('body.maui-theme-os main > .section:last-child'));
  assert.equal(r.length, 1);
  assert.equal(r[0][0], 'body.maui-theme-os main > .section:last-child:has(.micro-frontend help-center-web)');
  assert.equal(r[0][1], 'margin-bottom: 36px;');
});

test('only the help app: no rule for the culinary hub\'s section end', () => {
  assert.ok(!rules.some(([s]) => s.includes('culinary-hub') && s.includes(':last-child')));
});

test('ITA and SWISS keep 24 / 30 px, Lufthansa and Brussels the section\'s gap', () => {
  const ends = rules.filter(([s]) => /main > \.section:last-child:has\(\.micro-frontend help-center-web\)$/.test(s));
  assert.deepEqual(ends.map(([s, b]) => `${s.split(' ')[0]} ${b}`).sort(), [
    'body.maui-theme-az margin-bottom: 24px;',
    'body.maui-theme-lx margin-bottom: 30px;',
    'body.maui-theme-os margin-bottom: 36px;',
  ]);
});
