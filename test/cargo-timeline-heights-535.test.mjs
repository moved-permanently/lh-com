/* eslint-disable max-len */
/* Cargo's history timeline (carousel-cards (timeline), /en/ci/facts-figures) against www's (the brief after 531,
   item 1; cargo-parity-002 with its 24 timeline item boxes after .timeline--loaded at 1440 and 390). www's event
   texts at every width: the year 40 / 48 px, the title 18 / 21.6 px, the text 15 / 22.5 px, each 10 px apart, the
   card 20 px in with a 1 px #ccc border and 10 px corners. From 768 px www's script (timeline.js) gives the top
   cards' row the tallest card's height plus 40 px (the card 40 px above the line) and the bottom row 48 px more,
   the bottom cards 40 px under the line: the slides 80 px between the two card rows and 48 px under the lower one
   (ours: 40 px, nothing under), the dot on the line.
   Run: node --max-old-space-size=512 --test test/cargo-timeline-heights-535.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const T = 'body.brand-cargo .carousel-cards.timeline';

// the bodies of the media blocks for a query (brace matched)
const mediaBlocks = (media) => {
  const out = [];
  let at = css.indexOf(`@media ${media} {`);
  while (at >= 0) {
    let depth = 0;
    let end = css.indexOf('{', at);
    for (; end < css.length; end += 1) {
      if (css[end] === '{') depth += 1;
      if (css[end] === '}') { depth -= 1; if (!depth) break; }
    }
    out.push(css.slice(css.indexOf('{', at) + 1, end).replace(/\n {2}/g, '\n'));
    at = css.indexOf(`@media ${media} {`, end);
  }
  return out;
};

// the declarations of a selector's last rule (inside the media query when given)
const rule = (selector, media) => {
  const scope = media ? mediaBlocks(media).filter((b) => b.includes(`\n${selector} {`)).pop() : css;
  assert.ok(scope, `${selector} in @media ${media}`);
  const i = scope.lastIndexOf(`\n${selector} {`);
  assert.ok(i >= 0, selector);
  const body = scope.slice(i + selector.length + 3, scope.indexOf('}', i));
  return Object.fromEntries(body.split(';').map((d) => d.trim()).filter(Boolean).map((d) => d.split(/:\s*/)));
};

test('the texts as www\'s at every width', () => {
  assert.deepEqual([rule(`${T} .carousel-cards-body > *`)['font-size'], rule(`${T} .carousel-cards-body > *`)['line-height'], rule(`${T} .carousel-cards-body > *`).margin], ['15px', '22.5px', '0 0 10px']);
  assert.deepEqual([rule(`${T} .carousel-cards-body > p:first-child`)['font-size'], rule(`${T} .carousel-cards-body > p:first-child`)['line-height']], ['40px', '48px']);
  const h = rule(`${T} .carousel-cards-body > :is(h2, h3, h4)`);
  assert.deepEqual([h['font-size'], h['line-height'], h.margin], ['18px', '21.6px', '10px 0']);
  assert.equal(rule(`${T} .carousel-cards-body > :last-child`)['margin-bottom'], '10px', 'www\'s last text keeps its 10 px');
  const card = rule(`${T} .carousel-cards-body`);
  assert.deepEqual([card.padding, card.border, card['border-radius']], ['20px', '1px solid #ccc', '10px']);
  assert.equal(css.includes(`@media (width < 768px) {\n  ${T} .carousel-cards-body > * {`), false, 'no phone sizes of their own');
});

test('from 768 px: 80 px between the card rows, 48 px under the lower one, the dot on the line', () => {
  const slide = rule(`${T} .carousel-cards-slide`, '(width >= 768px)');
  assert.equal(slide['grid-template-rows'], '1fr 80px 1fr');
  assert.equal(slide['padding-bottom'], '48px');
  assert.equal(rule(`${T} .carousel-cards-slide::after`, '(width >= 768px)').top, 'calc(50% - 34px)');
});
