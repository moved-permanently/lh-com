/* eslint-disable max-len */
/* Standing order 26 of 2026-11-14 (gating lufthansa.com's offers grid): brief 500's padding above
   the destination finder's title (test/hub-flights-title-500.test.mjs) follows www's English flights
   pages, whose title stands inside the finder's padded section (/gb/en/flights in lh-parity-004a:
   its title 231 px down at 1440, 230 at 390). www's German ones have it where any page's title is
   (/de/de/fluege and /at/de/fluege: 191 and 211 px, as /gb/en/baggage's), ours 40 / 20 px lower.
   On a German page (html lang de) the title's wrapper gets no padding; the 94 px under the title
   stay (www's filter 123 px under the title's top on all three).
   Run: node --test test/german-flights-title-so26.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa main > .section > .default-content-wrapper:has(> h1:last-child):has(+ .destination-finder-wrapper > .destination-finder.grid)';

test('a German page: no padding above the finder\'s title, at any width', () => {
  const rule = `html[lang="de"] ${SEL} { padding-top: 0; }`;
  assert.ok(css.includes(rule));
  assert.ok(css.indexOf(rule) > css.indexOf(`@media (width >= 768px) { ${SEL} { padding-top: 40px; }`), 'after brief 500\'s rules');
  const media = css.match(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g) || [];
  assert.ok(!media.some((m) => m.includes(rule)), 'outside any media block');
});

test('the other languages as before', () => {
  assert.ok(css.includes(`${SEL} { padding-top: 20px; }`));
  assert.ok(css.includes(`@media (width >= 768px) { ${SEL} { padding-top: 40px; } ${SEL} > h1 { margin-bottom: 94px; } }`));
});
