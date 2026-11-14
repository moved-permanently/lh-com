/* eslint-disable max-len */
/* Standing order 22 of 2026-11-14, item 2b: the parity render answers one call from a recorded
   file, so Discover's offers page can be gated again. A capture of our pages refuses every airline
   host (standing order 12); the offers grid's price call (www.lufthansa.com's destinationfinder
   FRA/E, months 0_11, RETURN, X-Portal FOUR_Y) then fails and the grid shows no offers, while
   www's recording shows 591. With PARITY_ANSWERS=<file> (the Captures child's recording of today's
   answer) capture.js answers that one call, its preflight too, from the file; every other request
   to an airline host stays refused. Never the 21 October recording: a file under data/recorded/ or
   an answer recorded on 2026-10-21 is refused, and so is a file without a recording date.
   Run: node --test test/parity-recorded-answer-so22.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { loadRecordedAnswers, recordedAnswer, ROOT } = require('../tools/parity/lib.js');

const URL_OK = 'https://www.lufthansa.com/service/api/destinationfinder/destination/finder/FRA/E?months=0_11&tripType=RETURN';
const BODY = { destinationFinderOffers: [{ city: 'PMI', price: 138.57 }], originCityName: 'Frankfurt' };
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'parity-answer-'));
const write = (name, data) => {
  const f = path.join(dir, name);
  fs.writeFileSync(f, JSON.stringify(data));
  return f;
};
const plain = (over = {}) => ({
  recordedAt: '2026-11-14T12:30:00Z', url: URL_OK, portal: 'FOUR_Y', status: 200, body: BODY, ...over,
});
const har = (startedDateTime, portal = 'FOUR_Y') => ({
  log: {
    entries: [{
      startedDateTime,
      request: { method: 'GET', url: URL_OK, headers: [{ name: 'X-Portal', value: portal }, { name: 'X-Portal-Site', value: 'DE' }] },
      response: { status: 200, headers: [{ name: 'content-type', value: 'application/json' }], content: { mimeType: 'application/json', text: JSON.stringify(BODY) } },
    }],
  },
});
const req = (url, method = 'GET', headers = { 'x-portal': 'FOUR_Y' }) => ({ url, method, headers });

test('today\'s answer (a plain file or a HAR): the price call answered from it, its preflight too', () => {
  [write('plain.json', plain()), write('today.har', har('2026-11-14T12:31:02.120Z'))].forEach((f) => {
    const answers = loadRecordedAnswers(f);
    const got = recordedAnswer(req(URL_OK), answers);
    assert.equal(got.status, 200);
    assert.deepEqual(JSON.parse(got.body), BODY);
    assert.equal(got.headers['access-control-allow-origin'], '*');
    // the query in another order is the same call
    const swapped = 'https://www.lufthansa.com/service/api/destinationfinder/destination/finder/FRA/E?tripType=RETURN&months=0_11';
    assert.ok(recordedAnswer(req(swapped), answers));
    const pre = recordedAnswer(req(URL_OK, 'OPTIONS', { 'access-control-request-headers': 'x-portal,x-portal-site' }), answers);
    assert.equal(pre.status, 204);
    assert.equal(pre.headers['access-control-allow-headers'], 'x-portal,x-portal-site');
  });
});

test('only that one call: another origin, cabin, month range, trip type, portal or host stays refused', () => {
  const answers = loadRecordedAnswers(write('plain2.json', plain()));
  [
    'https://www.lufthansa.com/service/api/destinationfinder/destination/finder/MUC/E?months=0_11&tripType=RETURN',
    'https://www.lufthansa.com/service/api/destinationfinder/destination/finder/FRA/B?months=0_11&tripType=RETURN',
    'https://www.lufthansa.com/service/api/destinationfinder/destination/finder/FRA/E?months=0_5&tripType=RETURN',
    'https://www.lufthansa.com/service/api/destinationfinder/destination/finder/FRA/E?months=0_11&tripType=ONEWAY',
    'https://www.lufthansa.com/service/api/labels/destinationFinder/lh/en',
    'https://www.discover-airlines.com/service/api/destinationfinder/destination/finder/FRA/E?months=0_11&tripType=RETURN',
  ].forEach((u) => assert.equal(recordedAnswer(req(u), answers), null, u));
  assert.equal(recordedAnswer(req(URL_OK, 'GET', { 'x-portal': 'LH' }), answers), null, 'the LH portal\'s answer is another one');
  assert.equal(recordedAnswer(req(URL_OK, 'POST'), answers), null);
  assert.equal(recordedAnswer(req(URL_OK), null), null, 'no file: nothing answered');
});

test('never the 21 October recording, never an undated answer, never another call recorded', () => {
  assert.throws(() => loadRecordedAnswers(write('old.json', plain({ recordedAt: '2026-10-21T18:26:45.823Z' }))), /21 October/);
  assert.throws(() => loadRecordedAnswers(write('old.har', har('2026-10-21T18:26:45.823Z'))), /21 October/);
  assert.throws(() => loadRecordedAnswers(write('undated.json', plain({ recordedAt: undefined }))), /recording date/);
  assert.throws(() => loadRecordedAnswers(write('other.json', plain({ url: URL_OK.replace('FRA', 'MUC') }))), /not the offers page's price call|not an answerable price call/);
  assert.throws(() => loadRecordedAnswers(write('lh.har', har('2026-11-14T12:31:02Z', 'LH'))), /not the offers page's price call|not an answerable price call/);
  // the site's own recording folder (the 21 October answers), whatever the file
  const inRepo = path.join(ROOT, 'data/recorded/index.json');
  assert.throws(() => loadRecordedAnswers(inRepo), /data\/recorded/);
});

// standing order 23: the Captures child's archive (discover-snapshots-005): api/<name>.request.json
// ({ requests: [{ url, method, status, at, contentType, xPortalRequestHeader }], sha256 }) next to
// api/<name>.json, the body as received; the body is checked against the record's sha256
test('the Captures child\'s request record and its body file: answered, the body checked against its sha256', async () => {
  const { createHash } = await import('node:crypto');
  const api = fs.mkdtempSync(path.join(os.tmpdir(), 'parity-answer-api-'));
  const body = JSON.stringify(BODY);
  fs.writeFileSync(path.join(api, 'destinationfinder-FRA-E.json'), body);
  const record = (over = {}) => ({
    pageUrl: 'https://discover.turnsthe.page/de/en/book/flights/offers',
    requests: [{
      url: URL_OK, method: 'GET', status: 200, at: '2026-11-14T12:19:01.439Z', contentType: 'application/json', xPortalRequestHeader: 'FOUR_Y', error: null,
    }],
    sha256: createHash('sha256').update(body).digest('hex'),
    ...over,
  });
  const file = path.join(api, 'destinationfinder-FRA-E.request.json');
  fs.writeFileSync(file, JSON.stringify(record()));
  const got = recordedAnswer(req(URL_OK), loadRecordedAnswers(file));
  assert.equal(got.status, 200);
  assert.deepEqual(JSON.parse(got.body), BODY);
  fs.writeFileSync(file, JSON.stringify(record({ sha256: '0'.repeat(64) })));
  assert.throws(() => loadRecordedAnswers(file), /sha256/);
  fs.writeFileSync(file, JSON.stringify(record({ requests: [{ ...record().requests[0], at: '2026-10-21T18:26:45Z' }] })));
  assert.throws(() => loadRecordedAnswers(file), /21 October/);
});

// standing order 23: the answer names its cities and countries in the page's language (www sends
// X-Portal-Language): an answer recorded on a de/en page answers en requests only, never de/de's
test('an answer of one language never answers another language\'s page', () => {
  const answers = loadRecordedAnswers(write('lang.json', plain({ language: 'en' })));
  assert.ok(recordedAnswer(req(URL_OK, 'GET', { 'x-portal': 'FOUR_Y', 'x-portal-language': 'en' }), answers));
  assert.equal(recordedAnswer(req(URL_OK, 'GET', { 'x-portal': 'FOUR_Y', 'x-portal-language': 'de' }), answers), null);
  // the Captures child's record: the language from its page's root (/de/en/...)
  const har2 = har('2026-11-14T12:31:02Z');
  har2.log.entries[0].request.headers.push({ name: 'X-Portal-Language', value: 'de' });
  const deOnly = loadRecordedAnswers(write('de.har', har2));
  assert.equal(recordedAnswer(req(URL_OK, 'GET', { 'x-portal': 'FOUR_Y', 'x-portal-language': 'en' }), deOnly), null);
  assert.ok(recordedAnswer(req(URL_OK, 'GET', { 'x-portal': 'FOUR_Y', 'x-portal-language': 'de' }), deOnly));
});

// standing order 25: the Captures child's index of a page load (api/index.json: per page its pageUrl
// and calls with url, status, at, xPortalRequestHeader, file, sha256): its price calls answer, by
// the page's language; the other calls of the load (labels, catalogs) are not answered; and
// lufthansa.com's own grid call (/gb/en/flights: destinationfinder LHR/E under X-Portal LH)
test('a page-load index: its finder calls answer by page language, its other calls are left alone', async () => {
  const { createHash } = await import('node:crypto');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'parity-index-'));
  fs.mkdirSync(path.join(root, 'api'));
  const en = JSON.stringify({ destinationFinderOffers: [{ city: 'PMI', cityName: 'Palma de Mallorca' }] });
  const de = JSON.stringify({ destinationFinderOffers: [{ city: 'MLH', cityName: 'Mülhausen Basel' }] });
  const labels = JSON.stringify({ 'common.x': 'y' });
  const put = (name, text) => {
    fs.writeFileSync(path.join(root, 'api', name), text);
    return createHash('sha256').update(text).digest('hex');
  };
  const call = (url, file, text) => ({
    url, host: 'www.lufthansa.com', method: 'GET', status: 200, at: '2026-11-14T18:08:15.004Z', contentType: 'application/json', xPortalRequestHeader: 'FOUR_Y', error: null, file: `api/${file}`, sha256: put(file, text),
  });
  const index = [
    { page: 'homepage-de-en', pageUrl: 'https://discover.turnsthe.page/de/en/homepage', calls: [call('https://www.lufthansa.com/service/api/labels/common/four_y/en', 'en-1.json', labels), call(URL_OK, 'en-2.json', en)] },
    { page: 'offers-de-de', pageUrl: 'https://discover.turnsthe.page/de/de/book/flights/offers', calls: [call(URL_OK, 'de-1.json', de)] },
  ];
  const file = path.join(root, 'api', 'index.json');
  fs.writeFileSync(file, JSON.stringify(index));
  const answers = loadRecordedAnswers(file);
  assert.equal(answers.length, 2, 'the finder calls only');
  const get = (lang) => recordedAnswer(req(URL_OK, 'GET', { 'x-portal': 'FOUR_Y', 'x-portal-language': lang }), answers);
  assert.match(get('en').body, /Palma de Mallorca/);
  assert.match(get('de').body, /Mülhausen Basel/);
  assert.equal(recordedAnswer(req('https://www.lufthansa.com/service/api/labels/common/four_y/en', 'GET', { 'x-portal': 'FOUR_Y', 'x-portal-language': 'en' }), answers), null, 'labels are not answered');
  // a body that is not the one indexed
  fs.writeFileSync(path.join(root, 'api', 'de-1.json'), 'tampered');
  assert.throws(() => loadRecordedAnswers(file), /sha256/);
});

test('lufthansa.com\'s grid call LHR/E under X-Portal LH answers from its own recording, never from Discover\'s FRA one', () => {
  const LHR = 'https://www.lufthansa.com/service/api/destinationfinder/destination/finder/LHR/E?months=0_11&tripType=RETURN';
  const lh = loadRecordedAnswers(write('lhr.json', plain({
    url: LHR, portal: 'LH', language: 'en', body: { originCityName: 'London' },
  })));
  assert.match(recordedAnswer(req(LHR, 'GET', { 'x-portal': 'LH', 'x-portal-language': 'en' }), lh).body, /London/);
  assert.equal(recordedAnswer(req(LHR, 'GET', { 'x-portal': 'FOUR_Y', 'x-portal-language': 'en' }), lh), null, 'LHR under the Discover portal');
  assert.equal(recordedAnswer(req(URL_OK, 'GET', { 'x-portal': 'FOUR_Y', 'x-portal-language': 'en' }), lh), null, 'the FRA call is not the LHR answer');
  const fra = loadRecordedAnswers(write('fra-en.json', plain({ language: 'en' })));
  assert.equal(recordedAnswer(req(LHR, 'GET', { 'x-portal': 'LH', 'x-portal-language': 'en' }), fra), null, 'the LHR call is not the FRA answer');
  assert.throws(() => loadRecordedAnswers(write('lhr-4y.json', plain({ url: LHR, portal: 'FOUR_Y' }))), /not the offers page's price call|not an answerable price call/);
  const preflight = recordedAnswer(req(LHR, 'OPTIONS', { 'access-control-request-headers': 'x-portal' }), lh);
  assert.equal(preflight.status, 204);
});
