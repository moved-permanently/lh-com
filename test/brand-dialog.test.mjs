/* eslint-disable max-len */
/* The header's country and language dialog and the flight status on a brand page: the brand's
   roots (scripts/locale.js ownRoots, siteLocales: ITA's nine, Discover's nine with www's labels)
   instead of Lufthansa's four, "Other countries" on the brand's www (siteOrigin), the countries'
   homepages on the site (getHomepageUrl); flight status hands off to the brand's www page (the
   page's own path), the brand's airline first, fleet links to the site's own fleet pages.
   lh-com as before. Run: node --max-old-space-size=512 --test test/brand-dialog.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
const setPath = (p, host = 'ita.turnsthe.page') => {
  window.location = {
    hostname: host, pathname: p, search: '', href: `https://${host}${p}`, origin: `https://${host}`,
  };
};
setPath('/it/en/manage-my-bookings/manage/flight-status');
const FS = await import('../blocks/flight-status/flight-status.js');
const { getLocale } = await import('../scripts/locale.js');

function onPage(meta, fn) {
  const rows = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  const { document } = parseHTML(`<!DOCTYPE html><html><head>${rows}</head><body></body></html>`);
  globalThis.document = document;
  try {
    return fn();
  } finally {
    delete globalThis.document;
  }
}
const query = {
  type: 'number', airline: 'AZ', flightNumber: '610', date: '2026-11-02',
};

test('flight status: a brand page hands off to the same page on the brand\'s www', () => {
  setPath('/it/en/manage-my-bookings/manage/flight-status');
  const url = onPage({ brand: 'ita' }, () => FS.buildFlightStatusUrl(query, getLocale(), ''));
  assert.equal(url, 'https://www.ita-airways.com/it/en/manage-my-bookings/manage/flight-status?tab=number&date=2026-11-02&flightNumber=AZ610');
  // an authored relative live page: on the brand's www
  assert.equal(onPage({ brand: 'ita' }, () => FS.buildFlightStatusUrl(query, getLocale(), '/it/en/x')), 'https://www.ita-airways.com/it/en/x?tab=number&date=2026-11-02&flightNumber=AZ610');
  assert.equal(onPage({ brand: 'ita' }, () => FS.buildFlightStatusUrl(query, getLocale(), 'https://example.org/fs')), 'https://example.org/fs?tab=number&date=2026-11-02&flightNumber=AZ610');
  setPath('/de/en/my-bookings/flight-status', 'discover.turnsthe.page');
  assert.match(onPage({ brand: 'discover' }, () => FS.buildFlightStatusUrl(query, getLocale(), '')), /^https:\/\/www\.discover-airlines\.com\/de\/en\/my-bookings\/flight-status\?/);
});

test('flight status on lh-com: www.lufthansa.com\'s timetable page, as before', () => {
  setPath('/de/en/flight-status', 'lufthansa.turnsthe.page');
  assert.equal(onPage({}, () => FS.buildFlightStatusUrl(query, getLocale(), '')), 'https://www.lufthansa.com/de/en/timetable-and-flight-status?tab=number&date=2026-11-02&flightNumber=AZ610');
  assert.equal(onPage({}, () => FS.buildFlightStatusUrl(query, getLocale(), '/de/en/x')), 'https://www.lufthansa.com/de/en/x?tab=number&date=2026-11-02&flightNumber=AZ610');
});

test('the default airline: the brand\'s (AZ, 4Y), LH on lh-com and the brands without one', () => {
  assert.equal(onPage({ brand: 'ita' }, () => FS.defaultAirline()), 'AZ');
  assert.equal(onPage({ brand: 'discover' }, () => FS.defaultAirline()), '4Y');
  assert.equal(onPage({}, () => FS.defaultAirline()), 'LH');
  assert.equal(onPage({ brand: 'cargo' }, () => FS.defaultAirline()), 'LH');
});

test('fleet links: lh-com\'s fleet slug as before; a brand\'s fleet page path', () => {
  const fleet = [{ path: '/de/en/discover-lufthansa/lufthansa-fleet/airbus-a350-900', 'aircraft-code': '359' }, { path: '/it/en/world-of-ita-airways/discover-ita-airways/fleet/long-haul', 'aircraft-code': '359' }];
  assert.equal(FS.aircraftLink('359', fleet, '/de/en'), '/de/en/discover-lufthansa/lufthansa-fleet/359');
  assert.equal(FS.aircraftLink('359', fleet, '/it/en', 'ita'), '/it/en/world-of-ita-airways/discover-ita-airways/fleet/long-haul');
  assert.equal(FS.aircraftLink('320', fleet, '/it/en', 'ita'), null);
});

test('the header\'s dialog reads the site\'s roots, names and www', () => {
  const src = fs.readFileSync(new URL('../blocks/header/header.js', import.meta.url), 'utf8');
  assert.match(src, /localeKeys = ownRoots\(\), otherCountries = true,/);
  assert.match(src, /const locales = siteLocales\(\);/);
  assert.match(src, /el\('a', \{ href: `\$\{siteOrigin\(\)\}\/` \}, labels\.otherCountries/);
  assert.doesNotMatch(src, /\$\{LIVE_ORIGIN\}\/` \}, labels\.otherCountries/);
});
