/* eslint-disable max-len, import/extensions */
/* SWISS's second-level menu pages (brief 445, item 6: baggage, airport, check-in, lounges, travel
   regulations, fleet, corporate customers, children travelling): every card of www ends with a link
   row (its teaser-link-text); lh-com's import makes the card's title the link. swiss-import.mjs
   withCardLinks: the title plain text, a link paragraph with www's link text after the card's text
   (as brief 380 did on the first-level menu pages); cards www shows without a link text, and a
   document that has the rows, as they are.
   Run: node --max-old-space-size=512 --test test/swiss-card-links-445.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { withCardLinks } from '../tools/importer/swiss-import.mjs';

const wwwCard = (href, title, link) => `<div class="teaser event section"><a href="${href}" class="teaser card"><div class="image-wrapper"><img src="/x.jpg"></div><div class="card-body"><h3 class="teaser-heading">${title}</h3><p>Text.</p></div>${link ? `<div class="teaser-link-text"><span class="btn-link"><maui-icon></maui-icon><span>${link}</span></span></div>` : ''}</a></div>`;
const SNAP = `<html><body>${wwwCard('https://www.swiss.com/ch/en/prepare/baggage/sports-equipment', 'Sports baggage', 'Sports baggage')}${wwwCard('https://www.swiss.com/ch/en/prepare/baggage/hand-baggage', 'Carry-on baggage', 'Carry-on baggage')}${wwwCard('https://www.swiss.com/ch/en/x', 'No link text', '')}</body></html>`;
const ourCard = (href, title) => `<div><div><picture><img src="a.jpg"></picture></div><div><h3 id="x"><a href="${href}">${title}</a></h3><p>Text.</p></div></div>`;
const DOC = `<body><header></header><main><div><h1>Baggage rules</h1><div class="carousel-cards grid">${ourCard('/ch/en/prepare/baggage/sports-equipment', 'Sports baggage')}${ourCard('/ch/en/prepare/baggage/hand-baggage', 'Carry-on baggage')}${ourCard('/ch/en/x', 'No link text')}</div></div></main><footer></footer></body>`;

test('withCardLinks: www\'s link text as each card\'s last paragraph, the title plain text; a card www shows without one as it is', () => {
  const r = withCardLinks(DOC, SNAP);
  assert.equal(r.made, 2);
  assert.ok(r.doc.includes('<div><h3 id="x">Sports baggage</h3><p>Text.</p><p><a href="/ch/en/prepare/baggage/sports-equipment">Sports baggage</a></p></div>'), r.doc);
  assert.ok(r.doc.includes('<div><h3 id="x">Carry-on baggage</h3><p>Text.</p><p><a href="/ch/en/prepare/baggage/hand-baggage">Carry-on baggage</a></p></div>'));
  assert.ok(r.doc.includes('<h3 id="x"><a href="/ch/en/x">No link text</a></h3>'), 'no www link text: as it was');
  assert.ok(r.doc.startsWith('<body><header></header><main>') && r.doc.endsWith('</main><footer></footer></body>'));
});

test('withCardLinks: once; a snapshot without teaser cards, as it is', () => {
  const once = withCardLinks(DOC, SNAP).doc;
  assert.equal(withCardLinks(once, SNAP).made, 0);
  assert.equal(withCardLinks(once, SNAP).doc, once);
  assert.equal(withCardLinks(DOC, '<html><body></body></html>').doc, DOC);
});
