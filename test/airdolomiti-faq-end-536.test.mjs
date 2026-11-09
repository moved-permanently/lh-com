/* eslint-disable max-len */
/* Air Dolomiti's FAQ half pages (the accordions beside the help card) end as www's (the brief after 531, item 1:
   airdolomiti-parity-002 /reisenformationen/tiere-an-bord at 1440, a page not recorded before): where the accordions
   are longer than the card, www's newsletter title stands 127 px under the last accordion's line, ours 52 px (the
   page -4.9 % to the footer). From 930 px (where the card stands beside the accordions) the accordions 75 px more
   under them; a page whose card is the taller column (schwangere-und-kinder) keeps its end.
   Run: node --max-old-space-size=512 --test test/airdolomiti-faq-end-536.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const S = 'body.brand-airdolomiti main > .section:is(.accordion-columns-container, .flight-status-container).columns-media-container > .accordion-columns-wrapper';

test('from 930 px: 75 px under the half page\'s accordions', () => {
  const at = css.indexOf(`@media (width >= 930px) {\n  ${S} {\n    margin-bottom: 75px;\n  }\n}`);
  assert.ok(at >= 0);
});
