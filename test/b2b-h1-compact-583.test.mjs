/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions, object-curly-newline -- dev tooling; linkedom is a dev dependency */
/* The standing order of 2026-11-10 evening, decision 3 (the B2B ranking worst-first): the 20 airlines-at-a-glance pages
   (45 to 55 % at 1440 against b2b-parity-006) open with www's "Air Dolomiti Produkte & Services" in heading-small (one
   line, title case); DA's H1 says {heading-small column-start-outer}, two steps under the H1 default, and B2B's theme had
   no compact H1, so the collapse dropped the size and ours drew heading-large (three lines at 390, 76 px lower). B2B's
   census: 21 first H1s and 20 later ones marked heading-small (heading-medium: one step, the default as before).
   THEMES.b2b headingChoices.h1.compact heading-small: the collapse writes the section style H1 compact (brief 582's).
   Run: node --max-old-space-size=256 --test test/b2b-h1-compact-583.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { headingChoice, themeFor } from '../scripts/style-markers.js';

const DOC = (size) => `<div><h1 id="t">Air Dolomiti Produkte &amp; Services {${size} column-start-outer}</h1><div class="carousel-cards grid two-up"><div><div>x</div><div><h4>Streckennetz</h4></div></div></div><p>{column-end-outer}</p></div>`;
const run = (size, brand = 'b2b') => collapseHtml(DOC(size), { brand, force: true, path: '/de/de/program/experts/airlines-at-a-glance/airdolomiti', parse: (h) => parseHTML(h) }).html;

test('B2B: an H1 marked heading-small becomes the section style H1 compact, heading-small on the site', () => {
  const html = run('heading-small');
  assert.ok(!html.includes('{heading-small'), html.slice(0, 200));
  assert.ok(/<div class="section-metadata"><div><div>Style<\/div><div>[^<]*h1-compact[^<]*<\/div><\/div><\/div>/i.test(html), 'section style');
  assert.equal(headingChoice(themeFor('b2b', 'flow'), 1, 'compact'), 'heading-small');
});

test('B2B: an H1 one step under the default (heading-medium) takes the default as before; lufthansa\'s H1 compact as it was', () => {
  assert.ok(!/h1-compact/i.test(run('heading-medium')));
  assert.equal(headingChoice(themeFor('lufthansa'), 1, 'compact'), 'heading-medium');
  assert.equal(headingChoice(themeFor('discover'), 1, 'compact'), null);
});

test('the site: a B2B section of style H1 compact draws its H1 in heading-small', async () => {
  // the section's style as a class, as decorateSections leaves it
  const { document } = parseHTML('<html><head><meta name="theme" content="flow-spacing"></head><body><main><div class="h1-compact"><h1>Air Dolomiti</h1><p>x</p></div><div><h1>Other</h1></div></main></body></html>');
  globalThis.document = document;
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const main = document.querySelector('main');
  decorateTokenFree(main, { brand: 'b2b', path: '/de/de/program/experts/airlines-at-a-glance/airdolomiti', read: (k) => (k === 'theme' ? 'flow-spacing' : '') });
  const [own, other] = main.querySelectorAll('h1');
  assert.ok(own.classList.contains('heading-small'), own.className);
  assert.ok(!other.classList.contains('heading-small'), 'another section: the default');
});
