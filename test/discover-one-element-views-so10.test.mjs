/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 10 of 2026-11-12, item 2 (Discover): www puts additional-services' intro in a one-column view of its
   own after the title (and the cards in two-column views). The import writes it as the paragraph's own marks,
   "{column-start-outer column-end-outer}"; the Discover collapse carried column views for Columns Media only and
   dropped them, so DA's copies have none: the intro 60 px and the cards 118 px higher than www's at 1440. Now
   (THEMES.discover columnViews.oneElementViews) a view that opens and closes on one running-text element keeps both
   marks on it; the page draws them as the view's padding. Larger groups, other brands: as before. Measured on the
   two recorded pages (the only recorded Discover documents with such a view): 4 page-widths, 4 better (de/de 1440
   48.78 -> 30.72, de/en 47.25 -> 35.34, 390 33.11 -> 26.23 and 23.86 -> 19.34).
   Run: node --test test/discover-one-element-views-so10.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { themeFor } from '../scripts/style-markers.js';

const run = (html, brand = 'discover') => collapseHtml(html, {
  path: '/de/en/my-bookings/services/additional-services', brand, parse: parseHTML, force: true,
}).html;
const doc = '<div><h1>Additional services</h1><p>Everything ready for take-off? {column-start-outer column-end-outer}</p><div class="carousel-cards grid two-up"><div><div>a</div><div><h2>Card</h2></div></div></div></div>';

test('Discover: a one-paragraph view keeps both its marks on the paragraph', () => {
  assert.ok(themeFor('discover').columnViews.oneElementViews === true);
  const once = run(doc);
  assert.ok(once.includes('<p>Everything ready for take-off? {column-start-outer column-end-outer}</p>'), once.slice(0, 300));
  assert.ok(run(once).includes('take-off? {column-start-outer column-end-outer}</p>'), 'second run');
});

test('Discover: a view over several elements goes as before; other brands drop the one-paragraph view', () => {
  const several = run('<div><h1>T</h1><p>One {column-start-outer}</p><p>Two {column-end-outer}</p><div class="cards"><div><div>c</div></div></div></div>');
  assert.ok(!several.includes('{column-'), several.slice(0, 300));
  assert.ok(!run(doc, 'lufthansa').includes('{column-'), 'lufthansa.com');
  assert.ok(!run(doc, 'b2b').includes('{column-start-outer column-end-outer}'), 'b2b');
});

test('the delta for DA\'s copies: the paragraph after the H1 gets both marks, once; the list\'s READY rows', async () => {
  const fs = await import('node:fs');
  const { applyOneElementView, listPaths } = await import('../tools/importer/one-element-view-apply.mjs');
  const da = '<div><h1 id="additional-services">Additional services</h1><p>Everything ready for take-off? Take advantage of our extra benefits.</p></div><div><div class="carousel-cards grid two-up"><div><div>a</div></div></div></div>';
  const row = { path: '/de/en/my-bookings/services/additional-services', text: 'Everything ready for take-off?' };
  const once = applyOneElementView(da, row);
  assert.ok(once.result === 'marked' && once.html.includes('extra benefits. {column-start-outer column-end-outer}</p>'));
  assert.ok(applyOneElementView(once.html, row).result === 'present');
  assert.ok(applyOneElementView(da, { ...row, text: 'Something else' }).result === 'not found');
  const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-so10-discover-intro-views.txt', import.meta.url), 'utf8');
  assert.deepEqual(listPaths(list), ['/de/de/my-bookings/services/additional-services', '/de/en/my-bookings/services/additional-services']);
});

/* From 768 px the cards after such an intro view start 40 px under it, in the same section or the next (www's view
   gap: additional-services de/en 1440 35.33 -> 21.60, de/de 30.71 -> 26.13; at 390 it made de/en worse, so not there). */
test('Discover from 768 px: the cards 40 px under an intro\'s one-paragraph view', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('@media (width >= 768px) { body.brand-discover main .default-content-wrapper:has(> p.column-start-outer.column-end-outer:last-child) + .carousel-cards-wrapper, body.brand-discover main > .section:has(> .default-content-wrapper:last-child > p.column-start-outer.column-end-outer:last-child) + .section { margin-top: 40px; } }'));
});
