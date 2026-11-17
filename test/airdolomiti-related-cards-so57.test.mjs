/* eslint-disable max-len */
/* Standing order 57: Air Dolomiti's plain carousels outside the heading-icon sections (the FAQ pages' "Articoli
   correlati", the articles' and the destinations' sub-pages' related lists) as www's MiniCardSlider of CardNews below
   930px (airdolomiti-parity-013 /faq/bagaglio at 390): 325 x 470 px cards 2.5vw apart, the title 20 px over them, the
   arrows 50 px under them and 100 px over what follows. Standing order 58 widened them from 930px with the FAQ
   accordion's end and the intro lines' row (test/airdolomiti-faq-package-so58.test.mjs). The rules keep the heading-icon rules' weight (.section:not(.heading-icon) for
   .section.heading-icon). Run: node --max-old-space-size=256 --test test/airdolomiti-related-cards-so57.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const raw = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const PLAIN = 'body.brand-airdolomiti main > .section:not(.heading-icon) .carousel-cards:not(.promo, .destinations)';
const start = raw.indexOf('body.brand-airdolomiti main > .section:not(.heading-icon) > .default-content-wrapper:has(+ .carousel-cards-wrapper');
const body = (sel) => {
  const i = raw.indexOf(`${sel} {`, start);
  return i < 0 ? null : raw.slice(i + sel.length + 2, raw.indexOf('}', i)).trim();
};

test('the plain carousels\' rules apply at every width (order 58), one slide rule outside a media block', () => {
  assert.ok(start > 0);
  assert.equal(raw.indexOf(`${PLAIN} .carousel-cards-slide {`), raw.indexOf(`${PLAIN} .carousel-cards-slide {`, start), 'one slide rule, after the start');
  assert.ok(!/@media \(width < 930px\) \{ body\.brand-airdolomiti main > \.section:not\(\.heading-icon\) > \.default-content-wrapper/.test(raw), 'no phone-only block left');
});

test('www\'s CardNews: 325 x 470, the picture 60 %, the title 20 / 26 regular, three lines at most', () => {
  const s = body(`${PLAIN} .carousel-cards-slide`);
  assert.match(s, /flex: 0 0 325px;/);
  assert.match(s, /height: 470px;/);
  assert.match(s, /border-radius: 10px;/);
  assert.match(body(`${PLAIN} .carousel-cards-image`), /height: 60%;/);
  const h = body(`${PLAIN} .carousel-cards-body > :is(h2, h3, h4)`);
  assert.match(h, /font-size: 20px;/);
  assert.match(h, /line-height: 26px;/);
  assert.match(h, /font-weight: 400;/);
  assert.match(h, /-webkit-line-clamp: 3;/);
  assert.match(body(`${PLAIN} .carousel-cards-track`), /gap: 2\.5vw;/);
});

test('the title 20 px over the cards, the arrows 50 px under them and 100 px over what follows', () => {
  assert.equal(body('body.brand-airdolomiti main > .section:not(.heading-icon) > .default-content-wrapper:has(+ .carousel-cards-wrapper > .carousel-cards:not(.promo, .destinations)) > :is(h2, h3):last-child'), 'margin-bottom: 0;');
  assert.equal(body('body.brand-airdolomiti main > .section:not(.heading-icon) > .default-content-wrapper:has(> :is(h2, h3):last-child) + .carousel-cards-wrapper:has(> .carousel-cards:not(.promo, .destinations))'), 'margin-top: 15px;');
  assert.match(body(PLAIN), /padding-bottom: 134px;/);
  assert.match(body(`${PLAIN} .carousel-cards-nav`), /inset: auto 0 52px auto;/);
  assert.match(body(`${PLAIN} .carousel-cards-dots`), /display: none;/);
});

test('the heading-icon sections\' rules are unchanged', () => {
  assert.ok(raw.includes('body.brand-airdolomiti main > .section.heading-icon .carousel-cards:not(.promo, .destinations) .carousel-cards-slide { position: relative; flex: 0 0 325px;'));
});
