/* eslint-disable max-len */
/* Group for Business (ema-lufthansa, standing order 24 of 2026-11-15, item 3): order 23's two held places on
   /de/en/travel-solutions/lufthansa-group-wifi, each scoped so celebrating-shared-stories and our-european-fares stay as
   they are (the gate failed there). (1) The title 40 px above the video stage as www's: no column-mark padding after the
   H1 when the background-video stage is followed by a sidebar (only wifi of the 102 recorded pages; celebrating-shared-
   stories' stage is followed by a spacer, and its page is short elsewhere). (2) The FAQ accordion meeting the footer as
   www's: no section margin when a page ends with a faq accordion that is not "spaced" (our-european-fares' are spaced;
   of the recorded pages that end with an accordion only wifi). 1440 4557 -> 4469 (www 4476, +1.81 -> -0.16 %), 390 6563
   -> 6495 (www 6532, +0.47 -> -0.57 %, 0.10 points further, closer at 1440); the four other pages unchanged.
   Run: node --test test/b2b-wifi-stage-faq-end-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const body = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, sel);
  assert.equal(css.split(`${sel} {`).length - 1, 1, `${sel}: once`);
  return css.slice(i, css.indexOf('}', i));
};

test('the title above a background-video stage that a sidebar follows: no column-mark padding', () => {
  assert.match(body('body.brand-b2b main > .section > .default-content-wrapper:has(+ .columns-media-wrapper > .columns-media.background-video):has(+ .columns-media-wrapper + .default-content-wrapper + .columns-media-wrapper > .columns-media.sidebar) > h1 + p.column-mark.column-start-outer:last-child'), /padding-top: 0;/);
});

test('a page ending with a faq accordion that is not spaced: no section margin before the footer', () => {
  assert.match(body('body.brand-b2b main > .section:where(:has(> .accordion-columns-wrapper:last-child > .accordion-columns.faq:not(.spaced)):not(:has(~ .section > *)))'), /margin-bottom: 0;/);
});
