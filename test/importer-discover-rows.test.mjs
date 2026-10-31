/* eslint-disable max-len, import/extensions */
/* Discover's rows in the importer (tools/importer/parsers/booking-lookup.js, flight-status.js): on a
   page of www.discover-airlines.com (params.originalURL) the check-in block gets the Submit URL of
   the page's own once.discover-airlines.com link (TENANT=4Y) and flight status its Live page (the
   page on www), after the Submit label row, as the published documents have them (176). Every other
   source (lufthansa.com) exactly as before: the same block HTML as the previous parsers on the
   snapshots. Run: node --max-old-space-size=512 --test test/importer-discover-rows.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseHTML } from 'linkedom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// the blocks' elements of the pages' snapshots (tools/importer/bd-snapshots is not in git)
const SNAP = path.join(root, 'test/fixtures/importer-rows');

// the helix importer's createBlock: a table, the block name in its first row
globalThis.WebImporter = {
  Blocks: {
    createBlock(document, { name, cells }) {
      const table = document.createElement('table');
      const head = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = name;
      head.append(th);
      table.append(head);
      (Array.isArray(cells) ? cells : []).forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((c) => {
          const td = document.createElement('td');
          if (c && typeof c === 'object' && c.nodeType) td.append(c);
          else td.textContent = c == null ? '' : String(c);
          tr.append(td);
        });
        table.append(tr);
      });
      return table;
    },
  },
};
globalThis.CSS = { escape: (s) => String(s).replace(/[^\w-]/g, (c) => `\\${c}`) };

const bookingLookup = (await import('../tools/importer/parsers/booking-lookup.js')).default;
const flightStatus = (await import('../tools/importer/parsers/flight-status.js')).default;

/** The block of a page's snapshot through a parser (the importer's element for it). */
function run(parser, url) {
  const file = path.join(SNAP, `${new URL(url).hostname}${new URL(url).pathname}.html`);
  const { document } = parseHTML(fs.readFileSync(file, 'utf8'));
  const element = parser === flightStatus
    ? document.querySelector('.flightstatustimetable')
    : [...document.querySelectorAll('.tabs')].find((e) => e.querySelector('.checkinpassengerreceiptentry'));
  assert.ok(element, `${url}: the block's element`);
  const parent = element.parentElement;
  parser(element, { document, url, params: { originalURL: url } });
  return parent.querySelector('table');
}
const rows = (table) => [...table.querySelectorAll('tr')].slice(1).map((tr) => [...tr.children].map((td) => td.innerHTML));

test('Discover\'s check-in: the Submit URL of its once link (TENANT=4Y), after the Submit label', () => {
  const t = run(bookingLookup, 'https://www.discover-airlines.com/de/en/my-bookings/check-in/online-check-in');
  const r = rows(t);
  const at = r.findIndex(([k]) => k === 'Submit URL');
  assert.ok(at > 0, 'a Submit URL row');
  assert.equal(r[at - 1][0], 'Submit label');
  // the link's address (linkedom writes "&" raw in attributes, a browser "&amp;")
  const link = t.querySelectorAll('tr')[at + 1].querySelector('td:last-child a');
  const once = 'https://once.discover-airlines.com/connect/main-app?APPID=LHG_ONLINE&TENANT=4Y&LANGUAGE=en&COUNTRY=DE&MODE=PORTAL&ENTRY=identification.cf';
  assert.equal(link.getAttribute('href'), once);
  assert.equal(link.textContent, once);
});

test('Discover\'s flight status: its Live page, the page on www, after the Submit label', () => {
  const t = run(flightStatus, 'https://www.discover-airlines.com/de/de/my-bookings/flight-status');
  const r = rows(t);
  const at = r.findIndex(([k]) => k === 'Live page');
  assert.ok(at > 0, 'a Live page row');
  assert.equal(r[at - 1][0], 'Submit label');
  assert.equal(r[at][1], '<a href="https://www.discover-airlines.com/de/de/my-bookings/flight-status">https://www.discover-airlines.com/de/de/my-bookings/flight-status</a>');
});

test('lufthansa.com: the same blocks as the previous parsers', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'parsers-old-'));
  const old = {};
  for (const name of ['booking-lookup', 'flight-status']) { // eslint-disable-line no-restricted-syntax
    fs.writeFileSync(path.join(dir, `${name}.mjs`), execFileSync('git', ['show', `f0a42b6:tools/importer/parsers/${name}.js`], { cwd: root, encoding: 'utf8' }));
    old[name] = (await import(pathToFileURL(path.join(dir, `${name}.mjs`)).href)).default; // eslint-disable-line no-await-in-loop
  }
  const pages = [
    [bookingLookup, old['booking-lookup'], 'https://www.lufthansa.com/de/en/online-check-in'],
    [bookingLookup, old['booking-lookup'], 'https://www.lufthansa.com/de/de/online-check-in'],
    [flightStatus, old['flight-status'], 'https://www.lufthansa.com/de/en/timetable-and-flight-status'],
    [flightStatus, old['flight-status'], 'https://www.lufthansa.com/de/de/flugplan-und-flugstatus'],
    [flightStatus, old['flight-status'], 'https://www.lufthansa.com/gb/en/timetable-and-flight-status'],
  ].filter(([, , u]) => fs.existsSync(path.join(SNAP, `${new URL(u).hostname}${new URL(u).pathname}.html`)));
  assert.equal(pages.length, 5, 'lufthansa.com fixtures');
  pages.forEach(([now, before, url]) => {
    const a = run(now, url).outerHTML;
    // the previous parser on a fresh copy of the snapshot
    const file = path.join(SNAP, `${new URL(url).hostname}${new URL(url).pathname}.html`);
    const { document } = parseHTML(fs.readFileSync(file, 'utf8'));
    const element = now === flightStatus ? document.querySelector('.flightstatustimetable') : [...document.querySelectorAll('.tabs')].find((e) => e.querySelector('.checkinpassengerreceiptentry'));
    const parent = element.parentElement;
    before(element, { document, url, params: { originalURL: url } });
    assert.equal(a, parent.querySelector('table').outerHTML, url);
    assert.doesNotMatch(a, /Live page|discover-airlines/, url);
  });
  fs.rmSync(dir, { recursive: true, force: true });
});
