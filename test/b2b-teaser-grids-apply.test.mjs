/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The standing order of 2026-11-10 evening, decision 3: Group for Business documents imported before the two-up teaser rule
   hold www's teaser cards as loose content (a paragraph with a linked picture, an H4, a paragraph per card); DA's copy plus
   the delta (tools/importer/b2b-teaser-grids-apply.mjs): each run of two or more as the Carousel Cards block today's import
   writes for it, the H1's section H1 compact where the import gives it; the rest of the document as it is.
   Run: node --max-old-space-size=256 --test test/b2b-teaser-grids-apply.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTeaserGrids } from '../tools/importer/b2b-teaser-grids-apply.mjs';

const card = (href, title, line, img) => `<p><a href="${href}"><picture><img src="./media_${img}.jpg" alt=""></picture></a></p>\n  <h4 id="${img}"><a href="${href}">${title}</a></h4>\n  <p><a href="${href}">${line}</a></p>`;
const DA = `<div>
  <div class="columns-media"><div><div><picture><img src="./media_logo.png" alt=""></picture></div></div></div>
  <h1 id="t">Air Dolomiti Produkte &#x26; Services</h1>
  ${card('/de/de/a', 'Streckennetz und Flugplan', 'Entdecken Sie das Streckennetz', 'a')}
  ${card('/de/de/b', 'Reiseklassen', 'Finden Sie hier alles', 'b')}
  <div class="carousel-cards grid"><div><div><picture><img src="./media_c.jpg" alt=""></picture></div><div><h4>Kulinarisches</h4><p>x</p></div></div></div>
</div>
<div data-markets="bg/en"><p>Market text</p></div>`;
const IMPORTED = '<div><h1>Air Dolomiti Produkte &amp; Services</h1><div class="carousel-cards grid two-up space-m"><div><div><picture><img src="https://www/a.jpg"></picture></div><div><h4><a href="/de/de/a">Streckennetz und Flugplan</a></h4><p>Entdecken Sie das Streckennetz</p></div></div><div><div><picture><img src="https://www/b.jpg"></picture></div><div><h4><a href="/de/de/b">Reiseklassen</a></h4><p>Finden Sie hier alles</p></div></div></div><div class="section-metadata"><div><div>Style</div><div>h1-compact</div></div></div></div>';

test('a run of loose cards becomes the import\'s block, DA\'s pictures and links kept; the H1 section H1 compact', () => {
  const r = applyTeaserGrids(DA, IMPORTED);
  assert.deepEqual(r.grids, ['carousel-cards grid two-up: Streckennetz und Flugplan | Reiseklassen']);
  assert.equal(r.h1, true);
  assert.ok(r.html.includes('<div class="carousel-cards grid two-up"><div><div><picture><img src="./media_a.jpg" alt=""></picture></div><div><h4 id="a"><a href="/de/de/a">Streckennetz und Flugplan</a></h4><p>Entdecken Sie das Streckennetz</p></div></div>'), r.html);
  assert.ok(!r.html.includes('https://www/'), 'no picture from the import');
  assert.ok(!/<p><a href="\/de\/de\/a"><picture>/.test(r.html), 'the loose card is gone');
  assert.ok(r.html.includes('<h4>Kulinarisches</h4>'), 'the block after it as it was');
  assert.ok(r.html.includes('<div data-markets="bg/en"><p>Market text</p></div>'), 'a market section as it was');
  assert.match(r.html, /<div class="section-metadata"><div><div>Style<\/div><div>h1-compact<\/div><\/div><\/div><\/div>\s*<div data-markets/);
  assert.equal(applyTeaserGrids(r.html, IMPORTED).html, r.html, 'applied once only');
});

test('a run the import has no block for, or a single card, stays; an existing Style row is extended', () => {
  const other = '<div><h4>Something else</h4></div>';
  const kept = applyTeaserGrids(DA, other);
  assert.deepEqual(kept.grids, []);
  assert.equal(kept.h1, false);
  assert.ok(kept.html.includes('<p><a href="/de/de/a"><picture>'));
  const one = `<div><h1>T</h1>${card('/x', 'Only', 'One', 'o')}<div class="section-metadata"><div><div>Style</div><div>grey</div></div></div></div>`;
  const r = applyTeaserGrids(one, IMPORTED);
  assert.deepEqual(r.grids, []);
  assert.ok(r.html.includes('<div><div>Style</div><div>grey, h1-compact</div></div>'), r.html);
});
