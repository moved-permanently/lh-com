/* eslint-disable max-len, import/extensions */
/* SWISS's fleet and travel regulations pages (brief 450, item 3): www shows their teaser cards two to
   a row (a .twocolumn view of a.teaser.card, .col-md-6); swiss-import.mjs withTeaserColumns makes
   such a view a three-column view for lh-com's importer (a carousel-cards grid, three to a row from
   1025 px). withTwoUpCards: a carousel-cards grid whose cards are exactly one of www's two-column
   teaser views gets the option two-up (blocks/carousel-cards: two per row from 768 px). Other
   blocks, and a block with the option, as they are.
   Run: node --max-old-space-size=512 --test test/swiss-two-up-450.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { withTwoUpCards } from '../tools/importer/swiss-import.mjs';

const teaser = (title) => `<div class="col-md-6 col-lg column-view-item"><div class="teaser event section"><a href="/x" class="teaser card"><div class="card-body"><h3 class="teaser-heading">${title}</h3></div></a></div></div>`;
const view = (cls, titles) => `<div class="${cls} column event section"><div class="column-view flex-column"><div class="row">${titles.map(teaser).join('')}</div></div></div>`;
const SNAP = `<html><body>${view('twocolumn', ['Short- and medium-haul fleet', 'Long-haul fleet'])}${view('threecolumn', ['A', 'B', 'C'])}</body></html>`;
const card = (title) => `<div><div><picture><img src="i.jpg" alt=""></picture></div><div><h3 id="t">${title}</h3><p>Text.</p></div></div>`;
const DOC = `<body><header></header><main><div><h1>Fleet</h1><div class="carousel-cards grid">${card('Short- and medium-haul fleet')}${card('Long-haul fleet')}</div><div class="carousel-cards grid">${card('A')}${card('B')}${card('C')}</div></div></main><footer></footer></body>`;

test('withTwoUpCards: the block of a www two-column teaser view gets two-up; a three-column one as it is; once', () => {
  const r = withTwoUpCards(DOC, SNAP);
  assert.equal(r.made, 1);
  assert.ok(r.doc.includes(`<div class="carousel-cards grid two-up">${card('Short- and medium-haul fleet')}`), r.doc);
  assert.ok(r.doc.includes(`<div class="carousel-cards grid">${card('A')}`));
  assert.equal(withTwoUpCards(r.doc, SNAP).made, 0);
  assert.equal(withTwoUpCards(DOC, '<html><body></body></html>').doc, DOC);
});

test('withTwoUpCards: a block with only some of the view\'s cards, or more, as it is', () => {
  const doc = DOC.replace(card('Long-haul fleet'), '');
  assert.equal(withTwoUpCards(doc, SNAP).made, 0);
  const more = DOC.replace(card('Long-haul fleet'), `${card('Long-haul fleet')}${card('Cargo fleet')}`);
  assert.equal(withTwoUpCards(more, SNAP).made, 0);
});
