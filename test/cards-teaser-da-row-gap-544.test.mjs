/* eslint-disable max-len */
/* lufthansa.com's spacious teaser rows on phones, pages with the digital assistant (Theme digital-assistant), brief 544:
   lh-parity-005 (overview-travel-information on /de/de, /at/de, /gb/en at 390, the assistant closed) and lh-parity-002
   (/de/en) put a row's first card 45 px under the row above's link, the same 41 px card margin as within a row plus
   the link line; ours kept the 66 px of the other pages (take-off, services-am-flughafen: 69-70 px on www, as ours),
   the page 50 px too long. With the assistant's theme the row's first card takes 41 px; elsewhere as before.
   Run: node --max-old-space-size=256 --test test/cards-teaser-da-row-gap-544.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/cards-teaser/cards-teaser.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const ROW = '.cards-teaser.spacious:not(.overlay, .three-up, .four-up) > ul > li:nth-child(2n + 3) {';

const ruleBody = (sel) => {
  const i = css.indexOf(sel);
  assert.ok(i >= 0, sel);
  return css.slice(i + sel.length, css.indexOf('}', i));
};

test('with the digital assistant: a row\'s first card 41 px under the row above, below 768 px', () => {
  const sel = `body.brand-lufthansa.digital-assistant ${ROW}`;
  assert.match(ruleBody(sel), /margin-top: 41px;/);
  const before = css.slice(0, css.indexOf(sel));
  const media = before.slice(before.lastIndexOf('@media'));
  assert.ok(media.startsWith('@media (width < 768px) {'), 'below 768 px only');
  assert.equal((media.match(/\{/g) || []).length - (media.match(/\}/g) || []).length, 1, 'inside that block');
});

test('the other pages keep 66 px', () => {
  assert.match(ruleBody(`body.brand-lufthansa ${ROW}`), /margin-top: 66px;/);
});
