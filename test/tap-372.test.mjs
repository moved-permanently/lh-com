/* eslint-disable max-len */
/* Brief 372, TAP (tools/reports/tap/parity.md): row 85, the homepage headings as www.flytap.com's
   once ema-lufthansa's documents make "Planeie a sua viagem ao detalhe" the H1 and the Miles&Go
   cards' second lines H2s: the H1 the carousel's heading (GT Flexa 28 / 33.6 on phones, 40 / 48
   from 1024 px, centred, www's place), the second lines Inter 600 14 / 21 on phones, 20 / 30 from
   1024 px. Today's live pages (an H2 there, a bold paragraph here) stay as they are.
   Run: node --max-old-space-size=512 --test test/tap-372.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('row 85: the homepage H1 over the carousel takes the carousel heading\'s style (28 px on phones, 40 from 1024 px)', () => {
  const sel = esc('body.brand-tap main .default-content-wrapper:has(+ .carousel-cards-wrapper > .carousel-cards-tap) > :is(h1, h2, h3):last-child');
  assert.match(css, new RegExp(`${sel} \\{\\s*margin: 52px 0 32px;\\s*font-size: 28px;\\s*line-height: 1\\.2;`));
  assert.match(css, new RegExp(`@media \\(width >= 1024px\\) \\{\\s*${sel} \\{\\s*margin-top: 84px;\\s*font-size: 40px;`));
  assert.equal(/default-content-wrapper:has\(\+ \.carousel-cards-wrapper > \.carousel-cards-tap\) > :is\(h2, h3\)/.test(css), false, 'the H2 rule now the H1\'s too');
});

test('row 85: the Miles&Go cards\' second lines (an H2 after the title) as www\'s: Inter 600, 14 / 21 on phones, 20 / 30 from 1024 px', () => {
  const sel = esc('body.brand-tap .columns-media.stack .columns-media-text :is(h2, h3) + h2');
  assert.match(css, new RegExp(`${sel} \\{\\s*font-family: var\\(--body-font-family\\);\\s*font-size: 14px;\\s*font-weight: 600;\\s*line-height: 1\\.5;\\s*letter-spacing: -0\\.01em;`));
  assert.match(css, new RegExp(`@media \\(width >= 1024px\\) \\{[^@]*${sel} \\{\\s*font-size: 20px;`));
  // today's bold paragraph keeps its rule until the documents are published
  assert.match(css, /body\.brand-tap \.columns-media\.stack \.columns-media-text p:has\(> strong:only-child\) \{\s*font-weight: 600;/);
});
