/* eslint-disable max-len */
/* Standing order 36 of 2026-11-15, item 1: Austrian's homepages ask www.lufthansa.com's destinationfinder and
   defaultAirport under X-Portal OS (the market as X-Portal-Site, the page's language). The requested loads of our
   pages (capture-requests-ema-cashub.txt) will hold those answers; the parity tools answer them by portal, market and
   language, as lufthansa-api-001 to -003's LH calls (standing orders 25 and 27). An origin no Austrian page asks stays
   refused, and an OS answer never answers lufthansa.com's (LH) or Discover's (FOUR_Y) call.
   Run: node --test test/parity-os-answers-so36.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { loadRecordedAnswers, recordedAnswer } = require('../tools/parity/lib.js');

const finder = (o) => `https://www.lufthansa.com/service/api/destinationfinder/destination/finder/${o}/E?months=0_11&tripType=RETURN`;
const DA = 'https://www.lufthansa.com/service/api/defaultAirport';
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'parity-os-'));
const write = (name, data) => {
  const f = path.join(dir, name);
  fs.writeFileSync(f, JSON.stringify(data));
  return f;
};
const plain = (url, site, language = 'en') => ({
  recordedAt: '2026-11-15T08:00:00Z', url, portal: 'OS', site, language, status: 200, body: { originCityName: site },
});
const ask = (url, portal, site, lang, answers) => recordedAnswer({ url, method: 'GET', headers: { 'x-portal': portal, 'x-portal-site': site, 'x-portal-language': lang } }, answers);

// the origins the Austrian homepages and the ski campaign ask (the call logs of standing order 36)
const OS_ORIGINS = ['SYD', 'ZRH', 'GVA', 'PRG', 'TBS', 'TYO', 'OSA', 'PAR', 'LON', 'MIL', 'RMO', 'TGD', 'WAW', 'LIS', 'FAO', 'BUH', 'BEG', 'VIE', 'IST', 'ANK', 'PRN', 'NYC', 'WAS'];

test('every origin an Austrian page asks under X-Portal OS answers its own call, by market and language', () => {
  OS_ORIGINS.forEach((o) => {
    const answers = loadRecordedAnswers(write(`${o}.json`, plain(finder(o), 'XY')));
    assert.ok(ask(finder(o), 'OS', 'XY', 'en', answers), o);
    assert.equal(ask(finder(o), 'OS', 'ZZ', 'en', answers), null, `${o}: another market`);
    assert.equal(ask(finder(o), 'OS', 'XY', 'de', answers), null, `${o}: another language`);
    assert.equal(ask(finder(o), 'LH', 'XY', 'en', answers), null, `${o} under LH`);
    assert.equal(ask(finder(o), 'FOUR_Y', 'XY', 'en', answers), null, `${o} under FOUR_Y`);
  });
});

test('an origin no Austrian page asks stays refused under OS; the LH and FOUR_Y calls are as before', () => {
  assert.throws(() => loadRecordedAnswers(write('muc-os.json', plain(finder('MUC'), 'DE'))), /not an answerable price call/);
  assert.throws(() => loadRecordedAnswers(write('vie-c.json', plain(finder('VIE').replace('/E?', '/C?'), 'AT'))), /not an answerable price call/);
  const fra = loadRecordedAnswers(write('fra-4y.json', { ...plain(finder('FRA'), 'XX'), portal: 'FOUR_Y' }));
  assert.ok(ask(finder('FRA'), 'FOUR_Y', 'XX', 'en', fra));
  assert.equal(ask(finder('FRA'), 'OS', 'XX', 'en', fra), null, 'Discover\'s FRA answer is not an OS answer');
});

test('the page\'s defaultAirport under X-Portal OS answers by market and language, without a query only', () => {
  const answers = loadRecordedAnswers(write('da-os.json', { ...plain(DA, 'AU'), body: { marketDefaultAirport: { iataCode: 'SYD' } } }));
  assert.match(ask(DA, 'OS', 'AU', 'en', answers).body, /SYD/);
  assert.equal(ask(DA, 'OS', 'CH', 'en', answers), null, 'another market');
  assert.equal(ask(DA, 'LH', 'AU', 'en', answers), null, 'the LH portal');
  assert.equal(ask(`${DA}?x=1`, 'OS', 'AU', 'en', answers), null, 'with a query it is another call');
});
