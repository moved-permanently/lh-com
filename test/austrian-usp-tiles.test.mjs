/* eslint-disable max-len -- dev tooling */
/* Austrian's legal hub (/<market>/<lang>/legal, brief 445 item 2): www's four icon teasers (a.teaser.usp) import as
   lh-com's cards-icon usp four-up; Austrian's row 13 tiles (white boxes with a shadow, CoreSans 18 labels, the
   homepage's) reached them too. www's usp tiles have no box, the icon over a Portada 500 label, 22 / 27.5 below
   1025 px and 28 / 35 from there (austrian-parity-002 measurements of /at/de/legal).
   Run: node --max-old-space-size=256 --test test/austrian-usp-tiles.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('the theme: usp tiles without a box, Portada 500 labels as www\'s', () => {
  const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /body\.brand-austrian \.cards-icon\.usp \.cards-icon-tile \{ border-color: transparent; background-color: transparent; box-shadow: none; \}/);
  assert.match(css, /body\.brand-austrian \.cards-icon\.usp \.cards-icon-label \{ font-family: var\(--heading-font-family\); font-size: 22px; line-height: 27\.5px; \}/);
  assert.match(css, /@media \(width >= 1025px\) \{ body\.brand-austrian \.cards-icon\.usp \.cards-icon-label \{ font-size: 28px; line-height: 35px; \} \}/);
});
