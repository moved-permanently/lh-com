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
  assert.throws(() => loadRecordedAnswers(write('other.json', plain({ url: URL_OK.replace('FRA', 'MUC') }))), /not the offers page's price call/);
  assert.throws(() => loadRecordedAnswers(write('lh.har', har('2026-11-14T12:31:02Z', 'LH'))), /not the offers page's price call/);
  // the site's own recording folder (the 21 October answers), whatever the file
  const inRepo = path.join(ROOT, 'data/recorded/index.json');
  assert.throws(() => loadRecordedAnswers(inRepo), /data\/recorded/);
});
