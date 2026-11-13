/* eslint-disable max-len */
/* Discover's spacing around headings, column rows and accordions as www's (the standing order of the night of
   2026-11-10, item e; ema-cashub's row D2 and the sweep; Discover rows 44 to 46; discover-parity-001 at 1440 and 390):
   - row 44: www's headlines have 36 px under them at 1440 (24 at 390, as ours); ours 32 (lh-com's heading margins);
   - row 45: from 768 px www's column-view rows are 80 px apart; between two Columns Media blocks with only a column mark
     between them ours were 40 (customer service's two rows), the brief-505 rule covering adjacent blocks only;
   - row 46: www's accordions (maui-collapsible) have 40 px over and under them from 768 px, 20 px under them on phones.
   Run: node --test test/discover-column-rows-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
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

test('row 45: from 768 px two Columns Media blocks with a column mark between them 80 px apart (40 and the mark\'s 40)', () => {
  const r = rules('body.brand-discover main .columns-media-wrapper + .default-content-wrapper:has(> p.column-mark:only-child) + .columns-media-wrapper');
  assert.ok(r.some(([m, d]) => /width >= 768px/.test(m) && /margin-top: 40px;/.test(d)));
});
