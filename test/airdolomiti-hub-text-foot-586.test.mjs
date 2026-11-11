/* eslint-disable max-len */
/* Air Dolomiti's hub text foot (standing order 3 of 2026-11-11, item 1, "the hub gap"; AD row 107; airdolomiti-parity-001
   /destinazioni, /en/destinations, /de/reiseziele, /voli-europa, /en/flights-europe, /de/fluege-in-europa at 1440 and
   390): www's TitleDescriptionTextCta ends 165 px over the next component from 930 px (its rich text's 25, the empty
   small text's 50 and its 90 px margin), 130 px below 930 px; the destinations' grid (GridTreNews) adds 80 px of its own
   on phones (210). Ours: the next component's title (the hub section's first H2 after the text) 40 px under the text.
   The theme sets that H2's space; the hub's other headings, and other pages, unchanged. Not while the section still
   holds the hub's carousel (documents before the re-import that gives it its own section, test/airdolomiti-hub-carousel-586).
   Run: node --test test/airdolomiti-hub-text-foot-586.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const H2 = 'body.brand-airdolomiti main > .section.cards-teaser-container:not(:has(> .carousel-cards-wrapper)) > .default-content-wrapper:first-child:has(> h1 ~ p ~ p) > :is(p, ul, ol) + h2';
const all = (sel) => {
  const out = [];
  let i = css.indexOf(`${sel} {`);
  while (i >= 0) {
    out.push(css.slice(i, css.indexOf('}', i)));
    i = css.indexOf(`${sel} {`, i + 1);
  }
  return out;
};

test('the first heading after the hub text 130 px under it below 930 px, 165 px from 930 px', () => {
  const r = all(H2);
  assert.equal(r.length, 2);
  assert.match(r[0], /margin-top: 130px;/);
  assert.match(r[1], /margin-top: 165px;/);
  const q = css.indexOf('@media (width >= 930px)', css.indexOf(r[0]));
  assert.ok(q > 0 && q < css.indexOf(r[1]), 'the 165 px in a 930 px query');
});

test('the destinations\' grid title (the text\'s last heading) 210 px under it on phones', () => {
  const r = all(`${H2}:last-child`);
  assert.equal(r.length, 2);
  assert.match(r[0], /margin-top: 210px;/);
  assert.match(r[1], /margin-top: 165px;/);
});
