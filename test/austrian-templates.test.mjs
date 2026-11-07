/* eslint-disable max-len, import/extensions -- dev tooling */
/* Austrian's check-in and flight-status pages (austrian-parity-002, brief 427 package): lh-com's
   app-entry and flight-status templates map only lufthansa.com's hub pages' few components, so
   Austrian's /at/en/online-check-in lost its four-column steps, accordion, card row and column
   views, /at/de/flugstatus-und-flugplan its card row. tools/importer/austrian-templates.mjs writes
   two templates into page-templates.json: info's blocks and sections plus app-entry's booking-lookup
   (austrian-checkin) or flight-status's flight-status (austrian-flight-status); templateOf picks
   them. lh-com's own templates stay as they are.
   Run: node --max-old-space-size=512 --test test/austrian-templates.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { austrianTemplates } from '../tools/importer/austrian-templates.mjs';

const { templates } = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
const byName = (n) => templates.find((t) => t.name === n);

test('the two Austrian templates are info plus the page\'s own block, as the script builds them now (no drift from info)', () => {
  const built = austrianTemplates(templates);
  assert.deepEqual(built.map((t) => t.name), ['austrian-checkin', 'austrian-flight-status', 'austrian-hero-banner']);
  built.forEach((t) => assert.deepEqual(byName(t.name), t, `${t.name} in page-templates.json is the script's (run node tools/importer/austrian-templates.mjs)`));
  const info = byName('info');
  const checkin = byName('austrian-checkin');
  assert.deepEqual(checkin.blocks.slice(1), info.blocks);
  assert.deepEqual(checkin.blocks[0], byName('app-entry').blocks.find((b) => b.name === 'booking-lookup'));
  const fst = byName('austrian-flight-status');
  assert.deepEqual(fst.blocks[0], byName('flight-status').blocks.find((b) => b.name === 'flight-status'));
  assert.deepEqual(fst.blocks.slice(1), info.blocks);
  assert.ok(fs.existsSync(new URL('../tools/importer/import-austrian-checkin.bundle.js', import.meta.url)), 'bundle');
  assert.ok(fs.existsSync(new URL('../tools/importer/import-austrian-flight-status.bundle.js', import.meta.url)), 'bundle');
});

test('templateOf: Austrian\'s check-in and flight-status pages on the Austrian templates; lh-com\'s untouched', async () => {
  const { templateOf } = await import('../tools/importer/austrian-import.mjs');
  assert.equal(templateOf('/at/en/online-check-in', '<div class="tabs section"><div class="checkinpassengerreceiptentry">'), 'austrian-checkin');
  assert.equal(templateOf('/at/de/flugstatus-und-flugplan', '<div class="flightstatustimetable">'), 'austrian-flight-status');
  assert.equal(templateOf('/at/en/x', '<div class="text">'), 'info');
  assert.ok(byName('app-entry') && byName('flight-status'), 'lh-com\'s own templates still there');
});

test('row 37 (brief 444): culinary-services\' expanding panels (www\'s .herobanner .dcep-hero-banner, the component lh-com\'s hero-banner block is built for) on austrian-hero-banner: info plus hub\'s hero-banner', async () => {
  const built = austrianTemplates(templates);
  const hero = built.find((t) => t.name === 'austrian-hero-banner');
  assert.ok(hero, 'built');
  assert.deepEqual(byName('austrian-hero-banner'), hero, 'in page-templates.json as built');
  assert.deepEqual(hero.blocks[0], byName('hub').blocks.find((b) => b.name === 'hero-banner'));
  assert.deepEqual(hero.blocks.slice(1), byName('info').blocks);
  assert.ok(fs.existsSync(new URL('../tools/importer/import-austrian-hero-banner.bundle.js', import.meta.url)), 'bundle');
  const { templateOf } = await import('../tools/importer/austrian-import.mjs');
  assert.equal(templateOf('/at/en/fly/on-board/culinary-services', '<div class="herobanner section"><div class="dcep-hero-banner" role="presentation">'), 'austrian-hero-banner');
});

// brief 444: lh-com's cleanup gives column markers and flow spacing (Theme: flow-spacing, the separators in running
// text) to the info template by name only, so Austrian's info-plus-a-block templates lost both (culinary-services:
// its {spacer-25} and the theme row DA has). The built templates say base: info; the cleanup and the sections
// transformer take an info-based template as info.
test('the Austrian templates are info-based (base: info), and the transformers treat that as info', () => {
  austrianTemplates(templates).forEach((t) => assert.equal(t.base, 'info', t.name));
  const cleanup = fs.readFileSync(new URL('../tools/importer/transformers/lufthansa-cleanup.js', import.meta.url), 'utf8');
  assert.match(cleanup, /return COLUMN_MARK_TEMPLATES\.includes\(template\.name\) \|\| COLUMN_MARK_TEMPLATES\.includes\(template\.base\);/);
  const sections = fs.readFileSync(new URL('../tools/importer/transformers/lufthansa-sections.js', import.meta.url), 'utf8');
  assert.match(sections, /\(template\.name === 'info' \|\| template\.base === 'info'\) && first && padded\(first\)/);
});
