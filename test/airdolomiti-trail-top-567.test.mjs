/* eslint-disable max-len */
/* Air Dolomiti's trail over a page title from 1025 px (the standing order of 2026-11-10, item 6, AD row 97;
   airdolomiti-parity-001 at 1440). www's trail sits right under the 120 px bar (its text at 132) and the title at 170 on
   the booking, baggage, timetable, support and manage-booking pages; ours had the breadcrumb's 16 px over the trail, so
   the title was at 186 and the whole page 16 px lower. The FAQ half pages keep it (www's title there at 190, ours 186),
   and so do the pages whose trail lies on a stage (fleet, destinations) or the hidden-heading lead (row 95).
   Run: node --test test/airdolomiti-trail-top-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const SEL = 'body.brand-airdolomiti main > .section:not(.hidden-heading, :has(.accordion-columns.faq)) > .breadcrumb-wrapper:has(+ .default-content-wrapper > h1:first-child)';

test('from 1025 px no space over the trail of a page title', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i, css.indexOf('}', i)), /--breadcrumb-top: 0;/);
  const media = css.slice(0, i).match(/@media[^{]*\{(?![\s\S]*@media)/);
  assert.ok(media && /width >= 1025px/.test(media[0]), 'inside @media (width >= 1025px)');
});

test('the breadcrumb block reads the variable', () => {
  const block = fs.readFileSync(new URL('../blocks/breadcrumb/breadcrumb.css', import.meta.url), 'utf8');
  assert.match(block, /padding-top: var\(--breadcrumb-top, 16px\);/);
});
