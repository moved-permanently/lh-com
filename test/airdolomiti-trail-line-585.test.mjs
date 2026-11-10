/* eslint-disable max-len */
/* Air Dolomiti's trail on one line (the standing order of the night of 2026-11-10, item e; AD row 100;
   airdolomiti-parity-001 / -005 at 390). www's Breadcrumbs is one flex row that does not wrap: a parent may break inside
   itself, the current page ends in an ellipsis (li:last-child { overflow: hidden; text-overflow: ellipsis }, its span
   nowrap). Ours wrapped the items onto two or three lines on phones (the German post's trail 98 px, its title 178 against
   www's 150). With the trail on one line, the post header gets 28 px over it below 768 px so a post's title stays at
   www's 150 (row 99 had been measured with a two-line trail).
   Run: node --test test/airdolomiti-trail-line-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rules = (sel) => {
  const out = [];
  const re = /(@media[^{]*\{)|([^{}]+)\{([^{}]*)\}|(\})/g;
  let m;
  let media = '';
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(css))) {
    if (m[1]) media = m[1].replace(/\s*\{$/, '').trim();
    else if (m[4]) media = '';
    else if (m[2].trim() === sel) out.push([media, m[3]]);
  }
  return out;
};

test('the trail one row, the current page cut with an ellipsis', () => {
  assert.ok(rules('body.brand-airdolomiti .breadcrumb ol').some(([m, d]) => !m && /flex-wrap: nowrap;/.test(d)));
  assert.ok(rules('body.brand-airdolomiti .breadcrumb li:last-child').some(([m, d]) => !m && /min-width: 0;/.test(d)));
  const cut = rules('body.brand-airdolomiti .breadcrumb li:last-child > *').map(([, d]) => d).join('');
  ['overflow: hidden;', 'text-overflow: ellipsis;', 'white-space: nowrap;'].forEach((d) => assert.ok(cut.includes(d), d));
});

test('below 768 px the post header 28 px under the one-line trail', () => {
  const r = rules('body.brand-airdolomiti main > .section > .breadcrumb-wrapper + .article-header-wrapper');
  assert.ok(r.some(([m, d]) => /width < 768px/.test(m) && /margin-top: 28px;/.test(d)));
  assert.ok(!r.some(([m, d]) => /width < 768px/.test(m) && /margin-top: 0;/.test(d)), 'row 99\'s 0 replaced');
});
