/* eslint-disable max-len */
/* Standing order 59: below 930px any text after an Air Dolomiti FAQ accordion sits 110 px under it (www's TogleTariffe
   container's margin on /servizi-digitali at 390, airdolomiti-parity-014); from 930px only the related articles' title
   before a carousel takes www's 120 px (order 58), as our other next titles are already 99 px down there.
   Gate: gate-so59-airdolomiti-faq-accordion-end.txt.
   Run: node --max-old-space-size=256 --test test/airdolomiti-faq-accordion-end-so59.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const raw = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const ANY = 'body.brand-airdolomiti main > .section > .accordion-columns-wrapper:has(> .accordion-columns.faq) + .default-content-wrapper';
const media = (q) => {
  const out = [];
  let i = raw.indexOf(`@media (${q}) {`);
  while (i >= 0) {
    let d = 0;
    let k = raw.indexOf('{', i);
    for (; k < raw.length; k += 1) {
      if (raw[k] === '{') d += 1;
      if (raw[k] === '}') { d -= 1; if (!d) break; }
    }
    out.push(raw.slice(i, k + 1));
    i = raw.indexOf(`@media (${q}) {`, k);
  }
  return out.join(' ');
};

test('below 930px any text after a FAQ accordion 110 px under it', () => {
  assert.ok(media('width < 930px').includes(`${ANY} { margin-top: 110px; }`));
});

test('the rule for any text stays below 930px: not outside a media block, not from 930px', () => {
  assert.ok(!raw.includes(`} ${ANY} {`), 'no base rule for any text');
  assert.ok(!media('width >= 930px').includes(`${ANY} {`), 'from 930px only before a carousel');
});
