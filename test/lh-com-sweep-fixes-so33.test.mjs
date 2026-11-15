/* eslint-disable max-len */
/* Standing order 33 of 2026-11-15, item 1: two of sweep-so32-lh-info.md's worst ten, lufthansa.com only.
   - styles.css, section style gap-after-small: 24px to the next section (www's gap from a section ending with a Columns
     Media to a stage or a flush grey band on some pages; a rule for every such section took 12 recorded pages further,
     so rows put the style where it measures closer: first-class-terminal, business-class-on-long-haul-routes,
     flight-disruptions, lhg-wifi, lufthansa-express).
   - columns-media.css on phones: a media cell's link under its picture 37px down (ours 22), the cell 35px from the next
     (ours 50), as www's teasers (the LoungeNet first class lounges at 390: 28.1 -> 17.6 %).
   Run: node --max-old-space-size=256 --test test/lh-com-sweep-fixes-so33.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const flat = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const styles = flat('../styles/styles.css');
const cm = flat('../blocks/columns-media/columns-media.css');

test('section style gap-after-small: 24px under the section, lufthansa.com only', () => {
  assert.ok(styles.includes('body.brand-lufthansa main > .section.gap-after-small { margin-bottom: 24px; }'));
});

test('Columns Media on phones: the link under a picture 37px down, the cell 35px from the next', () => {
  assert.ok(cm.includes('@media (width < 768px) { body.brand-lufthansa main .columns-media .columns-media-row > .columns-media-media > p:has(picture) + p.link-wrapper:last-child { margin-top: 37px; } body.brand-lufthansa .columns-media .columns-media-row > .columns-media-media:not(:last-child):has(> p picture):has(> p.link-wrapper) { margin-bottom: 35px; } }'));
});

test('the link rule outranks the 22px rule it replaces on phones (it comes later and is more specific)', () => {
  const old = 'body.brand-lufthansa main .columns-media .columns-media-media > p:has(> picture) + p.link-wrapper:last-child {';
  const now = 'body.brand-lufthansa main .columns-media .columns-media-row > .columns-media-media > p:has(picture) + p.link-wrapper:last-child {';
  assert.ok(cm.indexOf(old) >= 0 && cm.indexOf(now) > cm.indexOf(old));
});
