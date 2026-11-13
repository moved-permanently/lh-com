/* eslint-disable max-len */
/* Air Dolomiti's hub carousel (standing order 3 of 2026-11-11, item 1, "the hub gap"; AD row 107; airdolomiti-parity-001
   /en/destinations, /destinazioni, /de/reiseziele): www's "Useful information to plan your journey" is the same
   CosaFareCarroussel (MiniCardSlider) as the destination pages' "What to do", without its title icon. The importer gave
   a carousel its own heading-icon section only with an icon, so the hubs' carousel stayed in the destination grid's
   section, without row 84's layout (at 1440 its cards 110 px lower under the title, dots and their space under them).
   Now every CosaFareCarroussel gets its own heading-icon section; the icon stays optional.
   Offline: a trimmed copy of the recording (test/fixtures/airdolomiti-hub: its breadcrumb, main and __NEXT_DATA__'s post)
   and the site data of the herohome fixture.
   Run: node --max-old-space-size=512 --test test/airdolomiti-hub-carousel-586.test.mjs */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const FIXTURE = fileURLToPath(new URL('./fixtures/airdolomiti-herohome/', import.meta.url));
const SITE = fileURLToPath(new URL('../content-sites/lh-airdolomiti/', import.meta.url));
const EXISTS = JSON.parse(fs.readFileSync(path.join(FIXTURE, 'exists.json'), 'utf8'));
const { readFileSync, existsSync, openSync } = fs;
const siteFile = (p) => (typeof p === 'string' && p.startsWith(SITE) ? path.relative(SITE, p) : null);
fs.readFileSync = (p, ...rest) => (siteFile(p) === null ? readFileSync(p, ...rest) : readFileSync(path.join(FIXTURE, siteFile(p)), ...rest));
fs.existsSync = (p) => (siteFile(p) === null ? existsSync(p) : EXISTS[siteFile(p)] === true);
fs.openSync = (p, ...rest) => (siteFile(p) === null ? openSync(p, ...rest) : openSync(path.join(FIXTURE, siteFile(p)), ...rest));
after(() => {
  fs.readFileSync = readFileSync;
  fs.existsSync = existsSync;
  fs.openSync = openSync;
});

// eslint-disable-next-line import/extensions
const { convert } = await import('../tools/importer/airdolomiti-import.mjs');
const rendered = readFileSync(fileURLToPath(new URL('./fixtures/airdolomiti-hub/en-destinations.html', import.meta.url)), 'utf8');
const { html } = convert(rendered, 'https://www.airdolomiti.eu/destinations');

const { document } = parseHTML(`<!DOCTYPE html><html><body>${html}</body></html>`);
const sections = [...document.body.children];
const titled = (t) => sections.find((x) => [...x.querySelectorAll('h2')].some((h) => h.textContent.trim() === t));

test('the hub\'s carousel opens a section of its own with the style heading-icon, without a picture before its title', () => {
  const own = titled('Useful information to plan your journey');
  assert.ok(own, 'the title');
  assert.ok(own.querySelector(':scope > .carousel-cards'), 'its carousel in the same section');
  assert.equal(own.querySelector(':scope > .section-metadata').textContent.replace(/\s+/g, ''), 'Styleheading-icon');
  const first = own.firstElementChild;
  assert.equal(first.tagName, 'H2', 'the title first, no picture before it');
  assert.equal(document.querySelectorAll('.section-metadata').length, 1, 'that section only');
});

test('the grid\'s section keeps the text and the grid, no carousel', () => {
  const grid = titled('Discover our destinations');
  assert.ok(grid && grid !== titled('Useful information to plan your journey'));
  assert.ok(grid.querySelector('.cards-teaser'), 'the grid');
  assert.ok(!grid.querySelector('.carousel-cards'), 'the carousel not in the grid\'s section');
});
