/* eslint-disable max-len */
/* Standing order 9 (2026-11-12), item 3: the ranking below 8 %. The upgrade pages (upgrade-first-class,
   upgrade-premium-economy-class, upgrade-business-class-long-haul, upgrade-to-business-class) and doctor-on-board-news
   end a section with an Accordion Columns (its column mark after it) and go on with a plain grey band. www has 20 px
   between the accordion and the band; ours had our section gap on top (68 px: "Further information about your
   upgrade" 48 px lower than www's). From 768 px that section has no gap. Injected on our live host, % off www at 1440:
   upgrade-business-class-long-haul 10.2 -> 6.7, upgrade-first-class 9.9 -> 6.5, upgrade-premium-economy-class
   9.9 -> 6.4, upgrade-to-business-class 8.3 -> 4.7, doctor-on-board-news 8.3 -> 7.3. At 390 the same measured worse
   on all five (+1.3 to +2.5: the page heights matched www's already), so phones stay as before. Flush, column-band
   and column-view grey sections are other cases (not measured here) and keep the gap.
   Run: node --max-old-space-size=256 --test test/accordion-grey-band-so9.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa main > .section:not(.grey, .padded, .stage):has(> .accordion-columns-wrapper:last-child, > .accordion-columns-wrapper + .default-content-wrapper:last-child > p:only-child:empty):has(+ .section.grey:not(.flush, .column-band, .column-view))';

test('from 768 px a section ending with an accordion before a plain grey band has no section gap', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i + SEL.length, css.indexOf('}', i)), /margin-bottom: 0;/);
  const media = css.lastIndexOf('@media', i);
  assert.ok(media >= 0 && css.slice(media, i).startsWith('@media (width >= 768px) {'), 'inside the 768 px query');
});

test('lufthansa.com only, not before flush, column-band or column-view grey sections, once', () => {
  assert.ok(SEL.startsWith('body.brand-lufthansa '));
  assert.ok(SEL.includes('.grey:not(.flush, .column-band, .column-view)'));
  assert.equal(css.split(`${SEL} {`).length, 2);
});
