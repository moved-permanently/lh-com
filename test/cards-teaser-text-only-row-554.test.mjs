/* eslint-disable max-len */
/* lufthansa.com's spacious teaser rows on phones, a row that starts with a card without a picture (brief 554,
   lh-parity-004a/b's services-am-flughafen on /de/de, /at/de and /gb/en at 390: "Boarding" after the row with "Zeitfenster
   für die Sicherheitskontrolle"). www puts that card's title 50 px under the link above, ours 76 with the 66 px of a
   row's first card (a picture card's 66 px are www's 69-70 from the link to the picture). A row's first card without a
   picture takes 40 px; picture cards as before (66 px, 41 with the digital assistant).
   Run: node --max-old-space-size=256 --test test/cards-teaser-text-only-row-554.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/cards-teaser/cards-teaser.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const ROW = '.cards-teaser.spacious:not(.overlay, .three-up, .four-up) > ul > li';

const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, sel);
  return { body: css.slice(i + sel.length, css.indexOf('}', i)), before: css.slice(0, i) };
};

test('a row\'s first card without a picture: 40 px under the row above, below 768 px', () => {
  const { body, before } = rule(`body.brand-lufthansa ${ROW}.cards-teaser-text-only:nth-child(2n + 3)`);
  assert.match(body, /margin-top: 40px;/);
  const media = before.slice(before.lastIndexOf('@media'));
  assert.ok(media.startsWith('@media (width < 768px) {'), 'phones only');
  assert.equal((media.match(/\{/g) || []).length - (media.match(/\}/g) || []).length, 1, 'inside that block');
});

test('picture cards keep 66 px (41 with the digital assistant)', () => {
  assert.match(rule(`body.brand-lufthansa ${ROW}:nth-child(2n + 3)`).body, /margin-top: 66px;/);
  assert.match(rule(`body.brand-lufthansa.digital-assistant ${ROW}:nth-child(2n + 3)`).body, /margin-top: 41px;/);
});
