/* eslint-disable max-len */
/* lufthansa.com's partner tiles on phones (brief 556, /gb/en/digital-self-services at 390, lh-parity-004a): www puts
   the next tile's title 74 px of ink under the last description line, ours 65 with the 30 px row gap. Below 768 px
   lufthansa.com's partner rows are 39 px apart; other brands (Austrian's accessible-travel) and 768 px up as before.
   Run: node --max-old-space-size=256 --test test/cards-icon-text-partner-rows-556.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/cards-icon-text/cards-icon-text.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 768 px lufthansa.com partner rows 39 px apart', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa .cards-icon-text.partner > ul { row-gap: 39px; } }'));
});

test('the partner grid keeps its 30 px gap for the other brands', () => {
  assert.ok(css.includes('.cards-icon-text.partner > ul { display: grid; grid-template-columns: minmax(0, 1fr); gap: 30px 20px; }'));
});
