/* eslint-disable max-len */
/* Standing order 58: Air Dolomiti's FAQ package. The plain carousels outside the heading-icon sections draw www's
   CardNews from 930px too (30vw wide, the arrows at the title's right, 24 px under the cards; 466.67px and 20 px
   apart from 1450px), and the related articles' title after the FAQ accordion sits 110 px under it, 120 px from 930px (www's TogleTariffe
   container's margin, airdolomiti-parity-013 /faq/bagaglio). Gate: gate-so58-airdolomiti-faq-package.txt.
   Run: node --max-old-space-size=256 --test test/airdolomiti-faq-package-so58.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const raw = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const PLAIN = 'body.brand-airdolomiti main > .section:not(.heading-icon) .carousel-cards:not(.promo, .destinations)';
const ACC = 'body.brand-airdolomiti main > .section > .accordion-columns-wrapper:has(> .accordion-columns.faq) + .default-content-wrapper:has(+ .carousel-cards-wrapper)';
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

test('from 930px the plain carousels\' cards 30vw wide, 24 px under them, the arrows at the title\'s right', () => {
  const wide = media('width >= 930px');
  assert.ok(wide.includes(`${PLAIN} { padding-bottom: 24px; }`));
  assert.ok(wide.includes(`${PLAIN} .carousel-cards-slide { flex-basis: 30vw; }`));
  assert.ok(wide.includes(`${PLAIN} .carousel-cards-nav { inset: -60px 0 auto auto; }`));
});

test('from 1450px 466.67px cards 20 px apart', () => {
  const xl = media('width >= 1450px');
  assert.ok(xl.includes(`${PLAIN} .carousel-cards-track { gap: 20px; }`));
  assert.ok(xl.includes(`${PLAIN} .carousel-cards-slide { flex-basis: 466.67px; }`));
});

test('the related articles\' title after the FAQ accordion 110 px under it, 120 px from 930px (before a carousel only)', () => {
  assert.ok(raw.includes(`} ${ACC} { margin-top: 110px; }`), 'the base rule outside a media block');
  assert.ok(media('width >= 930px').includes(`${ACC} { margin-top: 120px; }`));
});
