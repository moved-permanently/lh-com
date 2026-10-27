/* eslint-disable max-len, import/no-extraneous-dependencies -- linkedom is a dev dependency */
/* The page's clock and time travel (scripts/clock.js) and the content that reads it: the Message
   Center (flash teaser, message center block) and the stage promotions. Run: node --test test/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import {
  parseLocalTime, isPreviewHost, readTimeTravel, initClock, now, timeTravel, outsideUrl, formatInZone,
  marketOf, showTimeTravelBar, MARKET_TIME_ZONES,
} from '../scripts/clock.js';
import { selectMessages } from '../scripts/message-center.js';
import { pickActive, parseStageTime } from '../blocks/stage-promotions/schedule.js';

const PREVIEW = 'main--lh-com--moved-permanently.aem.page';
const at = (search, pathname = '/de/de/homepage', hostname = PREVIEW) => ({ hostname, search, pathname });

test('parseLocalTime: the market\'s local time without an offset (DST included), offsets, dates, German dates', () => {
  assert.equal(parseLocalTime('2026-12-24T09:00', 'Europe/Berlin'), Date.parse('2026-12-24T08:00:00Z'), 'winter: UTC+1');
  assert.equal(parseLocalTime('2026-07-01 09:00', 'Europe/Berlin'), Date.parse('2026-07-01T07:00:00Z'), 'summer: UTC+2');
  assert.equal(parseLocalTime('2026-12-24T09:00', 'Europe/London'), Date.parse('2026-12-24T09:00:00Z'));
  assert.equal(parseLocalTime('2026-12-24T09:00+05:30', 'Europe/Berlin'), Date.parse('2026-12-24T03:30:00Z'), 'an offset wins');
  assert.equal(parseLocalTime('2026-12-24T09:00Z', 'Europe/Berlin'), Date.parse('2026-12-24T09:00:00Z'));
  assert.equal(parseLocalTime('24.12.2026 09:00', 'Europe/Vienna'), Date.parse('2026-12-24T08:00:00Z'));
  assert.equal(parseLocalTime('2026-12-24', 'Europe/Berlin'), Date.parse('2026-12-23T23:00:00Z'), 'a date: the start of the day');
  assert.equal(parseLocalTime('2026-12-24', 'Europe/Berlin', true), Date.parse('2026-12-24T23:00:00Z'), 'as an end: the end of the day');
  // the night of the clock change (29 March 2026, 02:00 -> 03:00 in Berlin)
  assert.equal(parseLocalTime('2026-03-29T03:30', 'Europe/Berlin'), Date.parse('2026-03-29T01:30:00Z'));
  assert.equal(parseLocalTime('', 'Europe/Berlin'), null);
  assert.ok(Number.isNaN(parseLocalTime('next Tuesday', 'Europe/Berlin')));
  assert.equal(parseStageTime('2026-12-24T09:00', 'Europe/Berlin'), parseLocalTime('2026-12-24T09:00', 'Europe/Berlin'), 'the stage promotions read the same way');
});

test('isPreviewHost: main and branch previews and localhost; never the live site or the replica hosts', () => {
  [PREVIEW, 'time-travel--lh-com--moved-permanently.aem.page', 'main--lh-discover--moved-permanently.aem.page', 'localhost', '127.0.0.1'].forEach((h) => assert.ok(isPreviewHost(h), h));
  ['main--lh-com--moved-permanently.aem.live', 'lhcom.bbird.live', 'lhedge.bbird.live', 'lhcn.bbird.live', 'www.lufthansa.com', 'aem.page.example.com', ''].forEach((h) => assert.ok(!isPreviewHost(h), h));
});

test('readTimeTravel: the parameter on a preview host, the market\'s time zone, &time-zone=, ?stage-time=', () => {
  assert.equal(readTimeTravel(at('')), null, 'no parameter: nothing');
  assert.equal(readTimeTravel(at('?time-travel=2026-12-24T09:00', '/de/de/homepage', 'main--lh-com--moved-permanently.aem.live')), null, 'ignored on aem.live');
  assert.equal(readTimeTravel(at('?time-travel=2026-12-24T09:00', '/de/de/homepage', 'lhedge.bbird.live')), null, 'ignored on lhedge');
  assert.deepEqual(readTimeTravel(at('?time-travel=2026-12-24T09:00')), { value: '2026-12-24T09:00', timeZone: 'Europe/Berlin', ts: Date.parse('2026-12-24T08:00:00Z') });
  assert.equal(readTimeTravel(at('?time-travel=2026-12-24T09:00', '/gb/en/homepage')).ts, Date.parse('2026-12-24T09:00:00Z'), 'gb: London');
  assert.equal(readTimeTravel(at('?time-travel=2026-12-24T09:00', '/content/at/de/homepage', 'localhost')).timeZone, 'Europe/Vienna', 'the dev server\'s /content/ paths');
  const ny = readTimeTravel(at('?time-travel=2026-12-24T09:00&time-zone=America/New_York'));
  assert.equal(ny.timeZone, 'America/New_York');
  assert.equal(ny.ts, Date.parse('2026-12-24T14:00:00Z'));
  assert.equal(readTimeTravel(at('?time-travel=2026-12-24T09:00&time-zone=Mars/Olympus')).timeZone, 'Europe/Berlin', 'an unknown zone: the market\'s');
  assert.equal(readTimeTravel(at('?stage-time=2026-12-24')).ts, Date.parse('2026-12-23T23:00:00Z'), 'the earlier parameter');
  const bad = readTimeTravel(at('?time-travel=soon'));
  assert.ok(Number.isNaN(bad.ts), 'unreadable: the bar says so, the clock keeps the real time');
  assert.equal(marketOf('/content/lh/markets/gb/en/lounges'), 'gb');
  assert.deepEqual(Object.keys(MARKET_TIME_ZONES), ['de', 'at', 'gb']);
});

test('now(): the time travelled to, else the real time (no parameter, unreadable, live host)', () => {
  initClock(at('?time-travel=2026-12-24T09:00'));
  assert.equal(now(), Date.parse('2026-12-24T08:00:00Z'));
  assert.ok(timeTravel());
  [at(''), at('?time-travel=soon'), at('?time-travel=2026-12-24T09:00', '/de/de/homepage', 'main--lh-com--moved-permanently.aem.live')].forEach((loc) => {
    initClock(loc);
    const before = Date.now();
    const t = now();
    assert.ok(t >= before && t <= Date.now(), JSON.stringify(loc));
  });
  initClock(null);
  assert.equal(timeTravel(), null);
});

test('outsideUrl: what the page sends elsewhere loses the time-travel parameters, nothing else', () => {
  assert.equal(outsideUrl(`https://${PREVIEW}/de/de/feedback?time-travel=2026-12-24T09:00&time-zone=Europe/Berlin&x=1#top`), `https://${PREVIEW}/de/de/feedback?x=1#top`);
  assert.equal(outsideUrl(`https://${PREVIEW}/de/de/feedback?stage-time=2026-12-24`), `https://${PREVIEW}/de/de/feedback`);
  assert.equal(outsideUrl('https://www.lufthansa.com/de/de/feedback'), 'https://www.lufthansa.com/de/de/feedback');
  assert.equal(outsideUrl('not a url'), 'not a url');
});

test('the bar: chosen time, time zone, a link back to now; outside main and forms, no fields', () => {
  const { document } = parseHTML('<html><body><header></header><main><div><form><input name="a"></form></div></main><footer></footer></body></html>');
  const href = `https://${PREVIEW}/de/de/homepage?time-travel=2026-12-24T09:00&x=1`;
  initClock(at('?time-travel=2026-12-24T09:00&x=1'));
  const bar = showTimeTravelBar(document, href);
  assert.equal(bar.parentElement, document.body);
  assert.ok(!bar.closest('main, form'));
  assert.equal(bar.querySelectorAll('input, select, textarea, button').length, 0);
  assert.match(bar.textContent, /Time travel: the page shows 24 Dec 2026, 09:00 \(Europe\/Berlin, UTC\+01:00\)\./);
  assert.equal(bar.querySelector('a').getAttribute('href'), `https://${PREVIEW}/de/de/homepage?x=1`);
  assert.ok(bar.hasAttribute('data-nosnippet'));
  assert.equal(showTimeTravelBar(document, href), null, 'once per page');
  initClock(at(''));
  const { document: plain } = parseHTML('<html><body><main></main></body></html>');
  assert.equal(showTimeTravelBar(plain, `https://${PREVIEW}/de/de/homepage`), null, 'no bar without time travel');
  assert.equal(formatInZone(Date.parse('2026-07-01T07:00:00Z'), 'Europe/Berlin'), '1 Jul 2026, 09:00 (Europe/Berlin, UTC+02:00)');
});

// the Message Center: a disruption from 23 Dec 18:00 to 24 Dec 18:00 (UTC) for de
const MESSAGES = [{
  path: '/message-center/irreg/storm/en', headline: 'Storm in Frankfurt', criticality: 'high', tenants: ['lh'], markets: ['de'], touchpoints: ['web'], from: '2026-12-23T18:00:00.000Z', to: '2026-12-24T18:00:00.000Z', lastModified: 1,
}];
const shown = () => selectMessages(MESSAGES, { market: 'de', lang: 'en' }).map((m) => m.id);

test('Message Center (flash teaser, message center block): before, inside and after the window, by the page\'s clock', () => {
  initClock(at('?time-travel=2026-12-23T18:59', '/de/en/homepage'));
  assert.deepEqual(shown(), [], 'before: 17:59 UTC');
  initClock(at('?time-travel=2026-12-24T09:00', '/de/en/homepage'));
  assert.deepEqual(shown(), ['storm'], 'inside');
  initClock(at('?time-travel=2026-12-24T19:00', '/de/en/homepage'));
  assert.deepEqual(shown(), [], 'after: 18:00 UTC is the end');
  initClock(at('?time-travel=2026-12-24T09:00', '/de/en/homepage', 'main--lh-com--moved-permanently.aem.live'));
  assert.deepEqual(shown(), [], 'on the live host the real time (October 2026): not yet');
  // both blocks take the clock: neither passes its own now
  ['blocks/flash-teaser/flash-teaser.js', 'blocks/message-center/message-center.js'].forEach((f) => {
    const src = fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
    assert.match(src, /selectMessages\(rows, \{ market: locale\.country, lang: locale\.lang, types \}\)/, f);
  });
});

test('stage promotions: before, inside and after a promotion, in the market\'s time zone, by the page\'s clock', () => {
  const zone = MARKET_TIME_ZONES.at;
  const promotions = [
    { start: parseStageTime('', zone), end: parseStageTime('', zone, true) }, // the default stage
    { start: parseStageTime('2026-12-24 09:00', zone), end: parseStageTime('26.12.2026', zone, true) }, // Christmas
  ];
  const active = (search) => {
    initClock(at(search, '/at/de/homepage'));
    return pickActive(promotions, now());
  };
  assert.equal(active('?time-travel=2026-12-24T08:59'), 0, 'before: the default');
  assert.equal(active('?time-travel=2026-12-24T09:00'), 1, 'from 09:00 Vienna time');
  assert.equal(active('?time-travel=2026-12-26T23:59'), 1, 'the whole of the End day');
  assert.equal(active('?time-travel=2026-12-27T00:00'), 0, 'after');
  assert.equal(active('?time-travel=2026-12-24T08:30Z'), 1, 'an offset: 09:30 in Vienna');
  initClock(null);
});
