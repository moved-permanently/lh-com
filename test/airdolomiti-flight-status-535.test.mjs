/* eslint-disable max-len */
/* Air Dolomiti's flight status pages as www's (the brief after 531, item 1; airdolomiti-parity-002 /flug-status at
   1440): www's page title (a Title h1 before the half page) sits under its fixed 120 px header (y 20), the half page's
   own title "Flugstatus" shows over the form, the card ("Sie haben einen Flug gebucht?") beside it. Ours showed
   both titles one under the other and the card under the form. The importer keeps www's page title as the section's
   h1, hidden (section style hidden-heading, once compact-title), the half page's title the visible h2; the theme lays
   the form and the card out as the FAQ pages' half page (55 % / 410 px from 930 px).
   Offline: a trimmed copy of the recording (test/fixtures/airdolomiti-flight-status: its main, __NEXT_DATA__'s post)
   and the site data of the herohome fixture.
   Run: node --max-old-space-size=512 --test test/airdolomiti-flight-status-535.test.mjs */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
const rendered = readFileSync(fileURLToPath(new URL('./fixtures/airdolomiti-flight-status/flug-status.html', import.meta.url)), 'utf8');
const { html } = convert(rendered, 'https://www.airdolomiti.de/flug-status');
const css = readFileSync(fileURLToPath(new URL('../styles/themes/airdolomiti.css', import.meta.url)), 'utf8');

test('www\'s page title stays the h1, hidden; the half page\'s title shows, then the form and the card', () => {
  const first = html.split('<div class="section-metadata">')[0];
  assert.match(first, /^<div><h1>Flugstatus<\/h1><h2>Flugstatus<\/h2><p>Alle angezeigten/);
  assert.ok(first.indexOf('<div class="flight-status">') < first.indexOf('<div class="columns-media">'));
  assert.match(html, /<div class="section-metadata"><div><div>Style<\/div><div>compact-title, hidden-heading<\/div><\/div><\/div>/, 'hidden, compact-title once');
});

test('the theme lays the form and the card out as the FAQ pages\' half page', () => {
  assert.ok(!css.includes('main > .section.accordion-columns-container.columns-media-container'), 'every half page rule for both');
  assert.ok(css.includes('@media (width >= 930px) {\n  body.brand-airdolomiti main > .section:is(.accordion-columns-container, .flight-status-container).columns-media-container {\n    display: grid;'));
  assert.ok(css.includes('body.brand-airdolomiti main > .section.flight-status-container.columns-media-container .default-content-wrapper h1 + h2 {'), 'the visible title as the half page\'s');
});
