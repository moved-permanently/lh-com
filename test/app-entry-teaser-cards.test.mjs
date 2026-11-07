/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brussels P41 (tools/reports/brussels/parity.md, the brief after 467): the app-entry template
   (pages with the check-in entry or quick actions: Brussels' and SWISS's importers pick it, and
   lufthansa.com's online check-in, bookings, flight search, logbook pages) had no mapping for www's
   four-column teaser cards (.fourcolumn with a.teaser.card), which info maps to carousel-cards:
   /be/fr/check-in-options-and-info/online-check-in-options' "Autres sujets" came out as four
   full-width pictures with headings. app-entry now has info's selector, leaving a four-column view
   in tabs to cards-steps (app-entry's .tabs .fourcolumn) as before. The fixture is the snapshot's
   view (be/fr online-check-in-options, its four cards; images and texts shortened).
   Run: node --test test/app-entry-teaser-cards.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { templates } = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
const block = (template, name) => templates.find((t) => t.name === template).blocks.find((b) => b.name === name);
const SELECTOR = '.fourcolumn:has(a.teaser.card):not(.tabs .fourcolumn)';

const card = (href, title) => `<div class="col-md-6 col-lg column-view-item"><div class="teaser event section"><a href="${href}" class="teaser card"><div class="image-wrapper"><img src="a.jpg" alt=""></div><div class="card-content"><h4 class="heading-copytext-large teaser-heading">${title}</h4></div></a></div></div>`;
const CARDS = `<div class="section-content container-fluid section-regular"><div class="fourcolumn column event section"><div class="column-view flex-column" data-identifier="fourcolumn"><div class="row">${[
  ['/be/fr/check-in-options-and-info/check-in-times', 'Délais d’enregistrement'],
  ['/be/fr/flying-with-us/mobile-app', 'Votre application Brussels Airlines'],
  ['/be/fr/check-in-options-and-info/check-in-options-for-africa', 'Options d’enregistrement pour l’Afrique'],
  ['/be/fr/check-in-options-and-info/airport-check-in', 'Enregistrement à l’aéroport'],
].map(([h, t]) => card(h, t)).join('')}</div></div></div></div>`;
const IN_TABS = `<div class="tabs panelcontainer"><div class="fourcolumn column event section"><div class="column-view"><div class="row">${card('/x', 'Step 1')}</div></div></div></div>`;
const NO_CARDS = '<div class="sidebar-content col-sidebar-content"><div class="fourcolumn column event section"><div class="column-view"><div class="row"><div class="column-view-item"><div class="text"><p>Text</p></div></div></div></div></div></div>';
const matches = (html, sel) => parseHTML(`<html><body>${html}</body></html>`).document.querySelectorAll(sel).length;

test('app-entry maps www\'s four-column teaser cards to carousel-cards, as info does', () => {
  assert.ok(block('info', 'carousel-cards').instances.includes('.fourcolumn:has(a.teaser.card)'), 'info\'s mapping');
  assert.ok(block('app-entry', 'carousel-cards').instances.includes(SELECTOR), 'app-entry\'s');
  assert.ok(block('app-entry', 'carousel-cards').instances.includes('.loginform:has(.login-oneid-card)'), 'its login card as before');
});

test('the selector takes the snapshot\'s cards; not a four-column view in tabs (cards-steps) or one without cards', () => {
  assert.equal(matches(CARDS, SELECTOR), 1);
  assert.equal(matches(IN_TABS, SELECTOR), 0, 'in tabs: cards-steps');
  assert.equal(matches(IN_TABS, block('app-entry', 'cards-steps').instances[0]), 1, 'cards-steps still takes it');
  assert.equal(matches(NO_CARDS, SELECTOR), 0);
});

test('import-app-entry.js and its bundle carry the selector', () => {
  const quoted = JSON.stringify(SELECTOR);
  assert.ok(fs.readFileSync(new URL('../tools/importer/import-app-entry.js', import.meta.url), 'utf8').includes(quoted), 'import-app-entry.js');
  const bundle = fs.readFileSync(new URL('../tools/importer/import-app-entry.bundle.js', import.meta.url), 'utf8');
  assert.ok(bundle.includes(quoted) || bundle.includes(`'${SELECTOR}'`), 'the bundle');
});
