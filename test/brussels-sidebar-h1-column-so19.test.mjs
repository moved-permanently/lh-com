/* eslint-disable max-len */
/* Standing order 19, item 1 (Brussels P50, held since order 16): the sidebar-h1 sections' text column. www draws a 938 px
   column (9 of 12, calc(75% - 10px)) from 1025 px on every recorded page of the kind (18 of 18, the long legal pages too:
   the measurements' h1, text and accordion rows 938 px wide, the answers 923); ours used the full 1264 px. With the
   column come www's accordion answers in it: the full column (lufthansa.com's faq 66 %), 5 px under the question,
   15 px from the right and 51 above the next (the .sn collapsible's section padding 5px 15px 30px 0 plus the last
   paragraph's 20), and the text 41 px above the first question (ours 21). Shipped once the three documents with www's
   separators were live (reimport-so18-brussels-separators.txt, published 2026-11-13 01:34 CET): measured against the
   live documents, see the P50 row in tools/reports/brussels/parity.md. Reads brussels.css as written.
   Run: node --max-old-space-size=256 --test test/brussels-sidebar-h1-column-so19.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const SEC = 'body.brand-brussels main > .section.sidebar-h1';

test('from 1025 px a sidebar-h1 section\'s content in www\'s 9-of-12 column, its answers spaced as www\'s', () => {
  const at = css.indexOf(`@media (width >= 1025px) { ${SEC} > :not(.breadcrumb-wrapper) > * {`);
  assert.ok(at > 0, 'the media block');
  const block = css.slice(at, css.indexOf(' } }', at) + 4);
  assert.ok(block.includes(`${SEC} > :not(.breadcrumb-wrapper) > * { max-width: calc(75% - 10px); }`));
  assert.ok(block.includes(`${SEC} .accordion-columns.faq .accordion-columns-panel :is(p, ul, ol, h2, h3, h4, h5, h6) { max-width: none; }`));
  assert.ok(block.includes(`${SEC} .accordion-columns.faq .accordion-columns-panel { padding: 5px 15px 51px 0; }`));
  assert.ok(block.includes(`${SEC} > .default-content-wrapper + .accordion-columns-wrapper { margin-top: 40px; }`));
});
