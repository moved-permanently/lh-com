/* eslint-disable max-len, import/extensions */
/* Brussels' pages with a photo gallery (www's .slideshow: a picture that opens a lightbox), offline
   package 2026-11-06 (brussels-parity-002: /be/fr/travel-classes/business, premium-economy). lh-com's
   fleet template took them for the gallery (carousel-lightbox) but has none of a content page's other
   parsers: the picture and text rows, the teaser cards, the accordions came in as plain content.
   Now every page with a gallery imports with the info template, each gallery a placeholder, and
   the fleet template's import of the same page gives the galleries back in their places
   (tools/importer/brussels-import.mjs). Run: node --test test/brussels-galleries.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  templateOf, withGalleryPlaceholders, blocksOf, spliceGalleries,
} from '../tools/importer/brussels-import.mjs';

const slideshow = (n) => `<div class="slideshow parbase section"><maui-link-button data-target="#lightbox-${n}"><img src="/content/dam/bel/images/a${n}.jpg" alt=""></maui-link-button></div>`;
const page = `<div class="headline section"><h2>Galerie</h2></div>${slideshow(1)}<div class="separator section"><div class="hr"></div></div><div class="text section"><p>Text</p></div>${slideshow(2)}`;

test('templateOf: a page with a gallery imports with the info template (its other components as well), not the fleet one', () => {
  assert.equal(templateOf('/be/fr/travel-classes/business', `<div class="twocolumn"></div>${page}`), 'info');
  assert.equal(templateOf('/be/en/flying-with-us/the-belgian-icons/trident', page), 'info');
});

test('withGalleryPlaceholders: each gallery a numbered paragraph in its place, the rest as it was', () => {
  const out = withGalleryPlaceholders(page);
  assert.doesNotMatch(out, /class="slideshow/);
  assert.match(out, /<h2>Galerie<\/h2><\/div><div class="text section"><div class="richtext"><p>BRUSSELS-GALLERY-0<\/p><\/div><\/div><div class="separator section">/);
  assert.match(out, /<p>Text<\/p><\/div><div class="text section"><div class="richtext"><p>BRUSSELS-GALLERY-1<\/p><\/div><\/div>$/);
  assert.equal(withGalleryPlaceholders('<div class="text section"><p>x</p></div>'), '<div class="text section"><p>x</p></div>');
});

test('blocksOf and spliceGalleries: the fleet import\'s galleries (whole, nested rows) into the info import\'s placeholders, in order; a missing one leaves nothing', () => {
  const g = (n) => `<div class="carousel-lightbox"><div><div><picture><img src="a${n}.jpg" alt=""></picture></div><div>Caption ${n}</div></div></div>`;
  const fleet = `<div><h2>Galerie</h2>${g(1)}<p>Text</p>${g(2)}<div class="metadata"><div><div>Title</div><div>x</div></div></div></div>`;
  assert.deepEqual(blocksOf(fleet, 'carousel-lightbox'), [g(1), g(2)]);
  const info = '<div><h2>Galerie</h2><p>BRUSSELS-GALLERY-0</p><div class="columns-media"><div><div>a</div><div>b</div></div></div><p>BRUSSELS-GALLERY-1</p></div>';
  assert.equal(spliceGalleries(info, fleet), `<div><h2>Galerie</h2>${g(1)}<div class="columns-media"><div><div>a</div><div>b</div></div></div>${g(2)}</div>`);
  // the import's layout markers after the placeholder (www's full-width section: " {full-width}")
  assert.equal(spliceGalleries('<div><p>BRUSSELS-GALLERY-0 {full-width}</p></div>', fleet), `<div>${g(1)}</div>`);
  assert.equal(spliceGalleries(info, '<div></div>'), '<div><h2>Galerie</h2><div class="columns-media"><div><div>a</div><div>b</div></div></div></div>');
});
