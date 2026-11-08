/* eslint-disable max-len, import/extensions */
/* SWISS row 42 (brief 474): www has two kinds of card views. Most sit in a section component (the
   wrapper .threecolumn.section: manage, extra services, 839 views on 560 snapshot pages); the others
   straight in the page's container (special requests, travel information, travel classes, on board:
   517 views). Measured on www's screenshots (the cards' 1 px frames), against ours:
   - in a section: the first card 72 px under the H1 on phones (73 from 768 px), 65 / 64 px between grids;
   - plain: 60 px under the H1 on phones (80 from 768 px), 41 / 81 px between grids;
   - both: 31 px between cards on phones, each card's title 15 px over its text (ours 10: www's cards
     5 px taller).
   The importer marks a plain view's grid with the option plain-view (withPlainViews: grids matched
   by their card headings, as withTwoUpCards); the theme spaces each kind.
   Run: node --max-old-space-size=256 --test test/swiss-grid-kinds-474.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { withPlainViews } from '../tools/importer/swiss-import.mjs';

const fx = (n) => fs.readFileSync(new URL(`./fixtures/swiss-grid-kinds/${n}`, import.meta.url));
const daPlain = fx('ch-en-prepare-special-care-da.html').toString('utf8');
const wwwPlain = zlib.gunzipSync(fx('ch-en-prepare-special-care-www.html.gz')).toString('utf8');
const daSection = fx('ch-en-book-and-manage-overview-manage-da.html').toString('utf8');
const wwwSection = zlib.gunzipSync(fx('ch-en-book-and-manage-overview-manage-www.html.gz')).toString('utf8');

test('special requests (plain views): both grids get plain-view, nothing else changes; again: nothing to do', () => {
  const { doc, made } = withPlainViews(daPlain, wwwPlain);
  assert.equal(made, 2);
  assert.equal((doc.match(/class="carousel-cards grid[^"]* plain-view"/g) || []).length, 2);
  assert.equal(doc.replace(/ plain-view"/g, '"'), daPlain);
  assert.equal(withPlainViews(doc, wwwPlain).made, 0);
});

test('manage (views in a section): no grid changes', () => {
  assert.equal(withPlainViews(daSection, wwwSection).made, 0);
});

test('the importer runs it with the other SWISS steps', () => {
  const js = fs.readFileSync(new URL('../tools/importer/swiss-import.mjs', import.meta.url), 'utf8');
  assert.match(js, /withPlainViews\(withTwoUpCards\(/);
});

const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const H1 = 'body.brand-swiss main .default-content-wrapper:has(+ .carousel-cards-wrapper';
const NEXT = 'body.brand-swiss .carousel-cards-wrapper + .carousel-cards-wrapper > .carousel-cards';

test('the theme: views in a section (no option) 72 / 65 on phones, 73 / 64 from 768 px', () => {
  assert.ok(css.includes(`${H1}) > h1:last-child { margin-bottom: 72px; }`));
  assert.ok(css.includes(`${NEXT}.grid:not(.plain-view):has(.carousel-cards-slide:not(.carousel-cards-text-only)) { margin-top: 65px; }`));
  assert.match(css, /@media \(width >= 768px\) \{[^@]*body\.brand-swiss main \.default-content-wrapper:has\(\+ \.carousel-cards-wrapper\) > h1:last-child \{ margin-bottom: 73px; \}/);
  assert.match(css, /@media \(width >= 768px\) \{[^@]*body\.brand-swiss \.carousel-cards-wrapper \+ \.carousel-cards-wrapper > \.carousel-cards\.grid:not\(\.plain-view\):has\(\.carousel-cards-slide:not\(\.carousel-cards-text-only\)\) \{ margin-top: 64px; \}/);
});

test('the theme: plain views 60 / 41 on phones, 80 / 81 from 768 px', () => {
  assert.ok(css.includes(`${H1} > .carousel-cards.plain-view) > h1:last-child { margin-bottom: 60px; }`));
  assert.ok(css.includes(`${NEXT}.grid.plain-view { margin-top: 41px; }`));
  assert.match(css, /@media \(width >= 768px\) \{[^@]*body\.brand-swiss main \.default-content-wrapper:has\(\+ \.carousel-cards-wrapper > \.carousel-cards\.plain-view\) > h1:last-child \{ margin-bottom: 80px; \}/);
  assert.match(css, /@media \(width >= 768px\) \{[^@]*body\.brand-swiss \.carousel-cards-wrapper \+ \.carousel-cards-wrapper > \.carousel-cards\.grid\.plain-view \{ margin-top: 81px; \}/);
});

test('the theme: phones 31 px between image cards; every image card\'s title 15 px over its text', () => {
  assert.match(css, /@media \(width < 768px\) \{ body\.brand-swiss \.carousel-cards\.grid \.carousel-cards-track:has\(> \.carousel-cards-slide:not\(\.carousel-cards-text-only\)\) \{ gap: 31px; \} \}/);
  assert.ok(css.includes('body.brand-swiss .carousel-cards:is(.grid, .four-up) .carousel-cards-track:has(> .carousel-cards-slide:not(.carousel-cards-text-only)) > .carousel-cards-slide:not(.carousel-cards-text-only) .carousel-cards-body > :is(h1, h2, h3, h4, h5, h6) { margin-bottom: 15px; }'));
});
