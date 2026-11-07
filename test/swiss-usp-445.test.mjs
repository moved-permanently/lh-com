/* eslint-disable max-len, import/extensions */
/* SWISS's legal page (brief 445, item 6: ch/en and ch/de terms-conditions 1.75 of www's height):
   www's icon teasers (a.teaser.usp: a 64 px icon centred above a 24/26.4 px regular title, no frame,
   20/22 px below 1025 px) came in as framed cards with the icon at the card's width.
   swiss-import.mjs withUspTeasers: a carousel-cards block whose cards are all www's usp teasers
   gets the option usp; SWISS's theme draws it as www.
   Run: node --max-old-space-size=512 --test test/swiss-usp-445.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { withUspTeasers } from '../tools/importer/swiss-import.mjs';

const usp = (href, title) => `<div class="teaser event section"><a href="${href}" class="teaser usp "><h1 class="heading-copytext-large teaser-heading"><img class="icon icon-svg" src="/content/dam/lx/icons/x.svg" alt=""><div class="teaser-heading-text"> ${title} </div></h1></a></div>`;
const SNAP = `<html><body>${usp('/a', 'Terms and conditions of use')}${usp('/b', 'Legal notice')}</body></html>`;
const card = (title) => `<div><div><picture><img src="i.svg" alt=""></picture></div><div><h3 id="t"><a href="/x">${title}</a></h3></div></div>`;
const DOC = `<body><header></header><main><div><h1>Legal</h1><div class="carousel-cards grid">${card('Terms and conditions of use')}${card('Legal notice')}</div><div class="carousel-cards grid">${card('Legal notice')}${card('Something else')}</div></div></main><footer></footer></body>`;

test('withUspTeasers: a block of www\'s icon teasers gets the option usp; a block with other cards as it is; once', () => {
  const r = withUspTeasers(DOC, SNAP);
  assert.equal(r.made, 1);
  assert.ok(r.doc.includes(`<div class="carousel-cards grid usp">${card('Terms and conditions of use')}`));
  assert.ok(r.doc.includes(`<div class="carousel-cards grid">${card('Legal notice')}${card('Something else')}`));
  assert.equal(withUspTeasers(r.doc, SNAP).made, 0);
  assert.equal(withUspTeasers(DOC, '<html><body></body></html>').doc, DOC);
});

test('SWISS\'s theme: the usp cards without a frame, the 64 px icon centred, the title 24/26.4 regular centred (20/22 below 1025 px)', () => {
  const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const U = 'body\\.brand-swiss \\.carousel-cards\\.usp';
  // as specific as the grid cards' frame (the slide in a track of picture cards)
  const slide = 'body.brand-swiss .carousel-cards.usp .carousel-cards-track:has(> .carousel-cards-slide:not(.carousel-cards-text-only)) > .carousel-cards-slide';
  assert.ok(css.includes(`${slide}, ${slide}:hover { border: 0; box-shadow: none; text-align: center; }`));
  assert.match(css, new RegExp(`${U} \\.carousel-cards-slide \\.carousel-cards-image img \\{[^}]*width: 64px;[^}]*height: 64px;`));
  assert.match(css, new RegExp(`${U} \\.carousel-cards-body :is\\(h1, h2, h3, h4, h5, h6\\) \\{[^}]*font-size: 20px;[^}]*font-weight: 400;[^}]*line-height: 22px;`));
  assert.match(css, new RegExp(`@media \\(width >= 1025px\\) \\{ ${U} \\.carousel-cards-body :is\\(h1, h2, h3, h4, h5, h6\\) \\{[^}]*font-size: 24px;[^}]*line-height: 26\\.4px;`));
});

test('SWISS\'s theme: the FAQ hub\'s topic teasers (www\'s usp teasers too) centred, the 72 px icon, the title 20/22 px black (24/26.4 from 1025 px), 30 px apart (60 px between rows from 1025 px)', () => {
  const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const G = 'body.brand-swiss main .default-content-wrapper:has(> .column-start):has(> :is(h2, h3, h4) > a > picture:first-child)';
  assert.ok(css.includes(`${G} { gap: 30px 20px; }`));
  assert.ok(css.includes(`${G} > :is(h2, h3, h4):has(> a > picture:first-child) { margin: 0; padding-bottom: 36px; font-size: 20px; line-height: 22px; text-align: center; }`));
  assert.ok(css.includes(`${G} > :is(h2, h3, h4) > a > picture:first-child img { width: 72px; height: 72px; }`));
  assert.ok(css.includes(`@media (width >= 1025px) { ${G} { row-gap: 60px; } ${G} > h2 { margin: 33px 0 -21px; padding-top: 0; }`));
});
