/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* An author quote alone in its AEM section between padded ones (brief 441, item 5:
   /de/en/first-class-terminal's "Sojourn in style, travel efficiently…", between the intro and the
   carousel, both .section-padding-y-regular: 40px, 20px on phones). The import put intro, quote and
   carousel in one section, the paragraph's margin collapsing into the quote's: the quote 39px too
   high at 1440 (20 at 390), the carousel 72px (54) too close under it. The cleanup now puts spacers
   beside such a quote: before it "{spacer-0}" (the paragraph's margin no longer collapses) and
   "{spacer-14 from-768}", after it "{spacer-53}" and "{spacer-17 from-768}". A quote whose
   neighbours are not padded (/de/en/first-class) as before.
   Run: node --max-old-space-size=256 --test test/author-quote-padded.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

const section = (inner, padded) => `<div class="section"><div class=" mb-default "><div class="section-content container-fluid section-regular ${padded ? 'section-padding-y-regular' : ''}">${inner}</div></div></div>`;
const quote = '<div class="section"><div class=" mb-default "><div class="section-content container-fluid section-narrow"><div class="authorquote event section"><div class="dcep-author-quote"><div class="author-quote d-flex flex-column"><div class="quote-text text-left mb-0"><p>Sojourn in style, travel efficiently.</p></div><div class="subline-text"></div></div></div></div></div></div></div>';
const text = '<div class="text section"><div class="richtext"><p>Your personal refuge at the airport.</p></div></div>';
const carousel = '<div class="text section"><div class="richtext"><p>After the quote.</p></div></div>';

const run = (before, after) => {
  const url = 'https://www.lufthansa.com/de/en/first-class-terminal';
  const { document } = parseHTML(`<html><head><title>T | Lufthansa</title></head><body><main><div class="container-content">${section(text, before)}${quote}${section(carousel, after)}</div></main></body></html>`);
  transform('beforeTransform', document.body, { document, url, params: { originalURL: url } });
  const bq = document.querySelector('blockquote');
  const sib = (el, dir) => {
    const out = [];
    let n = el[dir];
    while (n && n.tagName === 'P' && /^\{spacer-/.test(n.textContent.trim())) { out.push(n.textContent.trim()); n = n[dir]; }
    return dir === 'previousElementSibling' ? out.reverse() : out;
  };
  return { before: sib(bq, 'previousElementSibling'), after: sib(bq, 'nextElementSibling') };
};

test('padded sections on both sides: spacers before and after the quote', () => {
  assert.deepEqual(run(true, true), { before: ['{spacer-0}', '{spacer-14 from-768}'], after: ['{spacer-53}', '{spacer-17 from-768}'] });
});

test('only one side padded: spacers on that side', () => {
  assert.deepEqual(run(true, false), { before: ['{spacer-0}', '{spacer-14 from-768}'], after: [] });
  assert.deepEqual(run(false, true), { before: [], after: ['{spacer-53}', '{spacer-17 from-768}'] });
});

test('neighbours not padded (/de/en/first-class): no spacers', () => {
  assert.deepEqual(run(false, false), { before: [], after: [] });
});

/* The image carousel alone in a padded AEM section before an unpadded one (first-class-terminal:
   the carousel, then "Your affairs in the best hands"): www has the carousel section's 40px (20px)
   padding and its 24px margin below the dots, the replica only the 24px between blocks; the
   heading was 62px (44 at 390) too close. Spacers after such a carousel: "{spacer-43}" and
   "{spacer-17 from-768}". */
const carouselSection = (padded) => `<div class="section"><div class=" mb-default "><div class="section-content container-fluid section-regular ${padded ? 'section-padding-y-regular' : ''}"><div class="carousel section"><div class="new-carousel"><div class="swiper swiper-single-slide"><div class="swiper-wrapper"><div class="swiper-slide"><div class="image"><img src="https://www.lufthansa.com/a.jpg" alt=""></div></div></div></div></div></div></div></div></div>`;
const afterCarousel = (padded, nextPadded) => {
  const url = 'https://www.lufthansa.com/de/en/first-class-terminal';
  const { document } = parseHTML(`<html><head><title>T | Lufthansa</title></head><body><main><div class="container-content">${carouselSection(padded)}${section('<div class="headline section"><h2>Your affairs in the best hands</h2></div>', nextPadded)}</div></main></body></html>`);
  transform('beforeTransform', document.body, { document, url, params: { originalURL: url } });
  const out = [];
  let n = document.querySelector('.carousel').nextElementSibling;
  while (n && n.tagName === 'P') { out.push(n.textContent.trim()); n = n.nextElementSibling; }
  return out;
};

test('a carousel alone in a padded section before an unpadded one: spacers after it', () => {
  assert.deepEqual(afterCarousel(true, false), ['{spacer-43}', '{spacer-17 from-768}']);
});

test('a carousel in an unpadded section, or before a padded one: none', () => {
  assert.deepEqual(afterCarousel(false, false), []);
  assert.deepEqual(afterCarousel(true, true), []);
});
