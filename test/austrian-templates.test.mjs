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
  assert.deepEqual(built.map((t) => t.name), ['austrian-checkin', 'austrian-flight-status']);
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
