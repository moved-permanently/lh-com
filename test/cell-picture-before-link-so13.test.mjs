/* eslint-disable max-len */
/* Standing order 13 (2026-11-13), item 2: the group airlines' tiles (delayed-baggage-lhg, report-baggage,
   feedback-and-contact-airlines): a text cell of a heading, the airline's logo and a lone link. www's logo is an image
   component, 4rem (40px) below it wherever it sits in the column item; ours gave a picture 40px only when it opens the
   cell, here the paragraph's 24px: each tile 16-20px shorter than www's, every next airline higher. A picture paragraph
   later in a text cell, before a lone link, keeps 40px. Injected on our host, % off www at 390 / 1440:
   feedback-and-contact-airlines 14.3 / 7.1 -> 9.4 / 3.5, report-baggage 13.9 / 14.0 -> 9.1 / 10.6, delayed-baggage-lhg
   13.7 / 6.7 -> 9.1 / 4.0. The recorded documents with a picture later in a text cell before something else (Insights
   articles' pictures before their captions, carry-on-baggage's icons before text) keep their spacing: another case.
   Run: node --max-old-space-size=256 --test test/cell-picture-before-link-so13.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa .columns-media .columns-media-text > p:has(> picture):not(:first-child):has(+ p.link-wrapper)';

test('a picture later in a text cell, before a lone link: 40px under it', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-bottom: 40px;/);
});

test('lufthansa.com only, before a lone link only; the opening picture keeps its own rule', () => {
  assert.ok(SEL.startsWith('body.brand-lufthansa ') && SEL.endsWith(':has(+ p.link-wrapper)'));
  assert.ok(css.includes('.columns-media .columns-media-text > p:has(> picture, > a > picture):first-child { margin-bottom: 40px; }'));
});
