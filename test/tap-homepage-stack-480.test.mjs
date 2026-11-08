/* eslint-disable max-len, import/extensions */
/* TAP's homepage Miles&Go cards (brief 480, tools/reports/tap/parity.md row 115; sweep 2026-11-08): www pins them with
   GSAP from 1280 px (xl): every card but the last in a pin of 580 + 1000 px of scroll, the next card sliding over the
   one before, the last card right after the pin (2,160 px for the region with three or four cards; ours were flat,
   n x 580 + gaps); from 1024 to 1279 px a column 16 px apart; on phones as before. Here blocks/columns-media/
   columns-media-tap.js (brand tap only) wraps every row but the last in .columns-media-pin and sets the step, the
   distance between the cards' starts (1000 px over the steps); tap.css makes the pin.
   Run: node --max-old-space-size=256 --test test/tap-homepage-stack-480.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const block = (n) => {
  const { document } = parseHTML(`<html><body><div class="columns-media stack block">${Array.from({ length: n }, (_, i) => `<div class="columns-media-row"><div class="columns-media-text"><h2>Card ${i}</h2></div><div class="columns-media-media"></div></div>`).join('')}</div></body></html>`);
  globalThis.document = document;
  return document.querySelector('.columns-media');
};
const { default: pinStack } = await import('../blocks/columns-media/columns-media-tap.js');

test('four cards: the first three in the pin; the last after it', () => {
  const b = block(4);
  pinStack(b);
  const pin = b.firstElementChild;
  assert.ok(pin.classList.contains('columns-media-pin'));
  assert.equal(pin.children.length, 3);
  assert.equal(b.children.length, 2);
  assert.ok(b.lastElementChild.classList.contains('columns-media-row'));
  assert.ok(b.lastElementChild.textContent.includes('Card 3'));
  // the cards' tones by their places, as the theme's nth-child(4n + …) gave them before the pin
  assert.deepEqual([...b.querySelectorAll('.columns-media-row')].map((r) => [...r.classList].find((c) => c.startsWith('columns-media-tone-'))), ['columns-media-tone-1', 'columns-media-tone-2', 'columns-media-tone-3', 'columns-media-tone-4']);
});

test('three cards: two in the pin; two cards or one: nothing to pin', () => {
  const b = block(3);
  pinStack(b);
  assert.equal(b.querySelector('.columns-media-pin').children.length, 2);
  const two = block(2);
  pinStack(two);
  assert.ok(!two.querySelector('.columns-media-pin'));
});

test('columns-media hands a stack on brand tap to columns-media-tap.js, nothing else', () => {
  const js = fs.readFileSync(new URL('../blocks/columns-media/columns-media.js', import.meta.url), 'utf8');
  assert.match(js, /if \(block\.classList\.contains\('stack'\) && getMetadata\('brand'\)\.trim\(\)\.toLowerCase\(\) === 'tap'\) \{\s+const \{ default: pinStack \} = await import\('\.\/columns-media-tap\.js'\);\s+pinStack\(block\);\s+\}/);
});

test('tap.css: a column 16 px apart from 1024 px, the pin from 1280 px (580 + 1000 px, the cards at 160 px)', () => {
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  const part = css.slice(css.indexOf('the Miles&Go cards pinned as www\'s (brief 480'));
  assert.ok(part.length > 100);
  assert.match(part, /@media \(width >= 1280px\) \{[\s\S]*body\.brand-tap \.columns-media\.stack > \.columns-media-pin \{\s+display: flex;\s+flex-direction: column;\s+height: 1580px;/);
  assert.match(part, /body\.brand-tap \.columns-media\.stack > \.columns-media-pin > \.columns-media-row \{\s+position: sticky;\s+top: 160px;/);
  // the card rules reach the rows in the pin; the tones by class there
  assert.match(css, /body\.brand-tap \.columns-media\.stack \.columns-media-row \{\s+--tap-card-panel: #fcfcfc;/);
  assert.match(css, /body\.brand-tap \.columns-media\.stack > \.columns-media-row:nth-child\(4n \+ 1\),\s+body\.brand-tap \.columns-media\.stack \.columns-media-row\.columns-media-tone-1 \{/);
});

test('brief 483, as www measured while scrolling: the cards held 30 px apart (160, 190, 220, 250 px) and the next one fading in as it comes up (a scroll timeline; none for reduced motion)', () => {
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  const part = css.slice(css.indexOf('www measured while scrolling (brief 483'));
  assert.ok(part.length > 100);
  assert.match(part, /\.columns-media-pin > \.columns-media-row:nth-child\(2\) \{\s+top: 190px;/);
  assert.match(part, /\.columns-media-pin > \.columns-media-row:nth-child\(3\) \{\s+top: 220px;/);
  assert.match(part, /\.columns-media-pin > \.columns-media-row:nth-child\(n \+ 4\) \{\s+top: 250px;/);
  assert.match(part, /@media \(width >= 1280px\) and \(prefers-reduced-motion: no-preference\) \{\s+@supports \(animation-timeline: view\(\)\) \{\s+body\.brand-tap \.columns-media\.stack > \.columns-media-pin > \.columns-media-row \+ \.columns-media-row \{\s+animation: tap-card-in linear both;\s+animation-timeline: view\(\);\s+animation-range: entry 28% entry 52%;/);
  assert.match(css, /@keyframes tap-card-in \{\s+from \{\s+opacity: 0;\s+\}\s+to \{\s+opacity: 1;\s+\}\s+\}/);
});

test('brief 483, www\'s timing: the second card settled 400 px into the pin, each next 200 px later; the last card 580 px up, sliding over the stack as the pin ends', () => {
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  const part = css.slice(css.indexOf('www measured while scrolling (brief 483'));
  assert.match(part, /\.columns-media-pin > \.columns-media-row:nth-child\(2\) \{\s+top: 190px;\s+margin-top: -180px;/);
  assert.match(part, /\.columns-media-pin > \.columns-media-row:nth-child\(n \+ 3\) \{\s+margin-top: -380px;/);
  assert.match(part, /body\.brand-tap \.columns-media\.stack > \.columns-media-pin \+ \.columns-media-row \{\s+margin-top: -580px;/);
  const js = fs.readFileSync(new URL('../blocks/columns-media/columns-media-tap.js', import.meta.url), 'utf8');
  assert.doesNotMatch(js, /--columns-media-pin-step/);
});
