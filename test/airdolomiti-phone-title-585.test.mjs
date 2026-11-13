/* eslint-disable max-len */
/* Air Dolomiti's page title on phones (the standing order of the night of 2026-11-10, decision 1; AD row 98;
   airdolomiti-parity-001 at 390 x 844). On the title pages (booking, baggage, timetables, support, manage booking,
   gepaeck) www's trail sits where ours does (its text at 112) and the title 24 px lower than ours (170 against 146),
   the text under it 25 px under the title as ours. The title's wrapper gets 24 px of padding over it below 768 px (a margin would collapse into the trail's); the FAQ half pages
   (www's title at 150 against our 146), a stage's trail and the hidden-heading lead are left as they are (row 97's
   scope).
   Run: node --test test/airdolomiti-phone-title-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const SEL = 'body.brand-airdolomiti main > .section:not(.hidden-heading, :has(.accordion-columns.faq)) > .breadcrumb-wrapper + .default-content-wrapper:has(> h1:first-child)';

test('below 768 px the title pages\' title 24 px under the trail', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i, css.indexOf('}', i)), /padding-top: 24px;/);
  const media = css.slice(0, i).match(/@media[^{]*\{(?![\s\S]*@media)/);
  assert.ok(media && /width < 768px/.test(media[0]), 'inside @media (width < 768px)');
});
