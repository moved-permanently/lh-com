/* The stage teaser's countdown (blocks/hero-card-overlay, row End time), as www's main stage teaser
   (dcep-main-stage-teaser, linkModeConfig.campaignConfig campaignType "running" and
   campaignEndTime; www.austrian.com/us/en/homepage, 2026-11-01, "20 Hours : 45 Minutes : 49
   Seconds" to 2026-11-01T23:59:00.000-05:00; its component's script): the time left to the end,
   ticking every second; with a day or more left days : hours : minutes, else hours : minutes :
   seconds, each two digits with its label (www's labels/countdown: Days, Hours, Minutes, Seconds);
   once the end has passed the countdown is gone and the teaser stays as it is (www: link mode is
   always visible). An end time without an offset is the market's local time. No row, an empty or
   unreadable one: no timer, the block as before.
   Run: node --max-old-space-size=512 --test test/hero-card-overlay-countdown.test.mjs */
/* global globalThis */
import test, { mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
const at = (pathname, meta = {}) => {
  window.location = {
    hostname: 'main--lh-com--moved-permanently.aem.page', pathname, search: '', hash: '', replace: () => {}, href: `https://main--lh-com--moved-permanently.aem.page${pathname}`, origin: 'https://main--lh-com--moved-permanently.aem.page',
  };
  document.head.innerHTML = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
};
at('/de/de/homepage');
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: true, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.matchMedia = window.matchMedia;
globalThis.fetch = async () => new Response('{}', { status: 404 });

const { default: decorate, countdownParts, readEndTime } = await import('../blocks/hero-card-overlay/hero-card-overlay.js');

const CARD = '<p>Unser Highlight</p><h2>30 € Rabatt nach Südafrika</h2><p>Limitiertes Angebot</p><p><a href="/de/de/local-page/south-africa-winter-promotion">Jetzt sichern</a></p>';
const blockOf = (rows = []) => {
  const block = document.createElement('div');
  block.className = 'hero-card-overlay';
  block.innerHTML = `<div><div><picture><img src="/media_1.jpg" alt=""></picture></div></div><div><div>${CARD}</div></div>${rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}`;
  document.body.replaceChildren(block);
  return block;
};
// the heading's id counts the blocks decorated so far: not part of the markup compared
const sha = (s) => createHash('sha256').update(s.replace(/hero-card-overlay-heading-\d+/g, 'hero-card-overlay-heading-N')).digest('hex').slice(0, 16);
// 20:45:49 before the end of Austrian's us/en teaser (2026-11-02T04:59:00Z), as www showed it
const NOW = Date.parse('2026-11-01T08:13:11Z');

beforeEach(() => {
  mock.timers.enable({ apis: ['setInterval', 'setTimeout', 'Date'], now: NOW });
  at('/de/de/homepage');
});
afterEach(() => mock.timers.reset());

test('countdownParts: www\'s units (days : hours : minutes with a day left, else hours : minutes : seconds), two digits', () => {
  const end = Date.parse('2026-11-01T23:59:00-05:00');
  assert.deepEqual(countdownParts(end, NOW), { completed: false, units: [['hours', '20'], ['minutes', '45'], ['seconds', '49']] });
  assert.deepEqual(countdownParts(NOW + (((2 * 24 + 3) * 60 + 4) * 60 + 5) * 1000, NOW), { completed: false, units: [['days', '02'], ['hours', '03'], ['minutes', '04']] });
  assert.deepEqual(countdownParts(NOW + 9000, NOW), { completed: false, units: [['hours', '00'], ['minutes', '00'], ['seconds', '09']] });
  assert.equal(countdownParts(NOW, NOW).completed, true);
  assert.equal(countdownParts(NOW - 1, NOW).completed, true);
});

test('readEndTime: an offset as given; without one the market\'s local time; unreadable or empty: none', () => {
  // Austrian's us/en teaser: www's campaignEndTime and the same instant in CET
  const www = Date.parse('2026-11-02T04:59:00Z');
  assert.equal(readEndTime('2026-11-01T23:59:00.000-05:00', 'Europe/Berlin'), www);
  assert.equal(readEndTime('2026-11-02T05:59+01:00', 'America/New_York'), www);
  assert.equal(readEndTime('2026-11-02T04:59:00Z', 'Europe/Vienna'), www);
  // local times: Berlin/Vienna (CET, UTC+1 after the DST change), New York (EST, UTC-5)
  assert.equal(readEndTime('2026-11-02 05:59', 'Europe/Berlin'), www);
  assert.equal(readEndTime('02.11.2026 05:59', 'Europe/Vienna'), www);
  assert.equal(readEndTime('2026-11-01 23:59', 'America/New_York'), www);
  // summer time (CEST, UTC+2)
  assert.equal(readEndTime('2026-07-01 12:00', 'Europe/Berlin'), Date.parse('2026-07-01T10:00:00Z'));
  ['', 'soon', '2026-13-45', '31.02.2026 25:00', 'tomorrow 18:00'].forEach((v) => assert.equal(readEndTime(v, 'Europe/Berlin'), null, v));
});

test('before the end: the timer in the card before the link, www\'s labels, ticking every second', async () => {
  const block = blockOf([['End time', '2026-11-01T23:59:00.000-05:00']]);
  await decorate(block);
  const timer = block.querySelector('.hero-card-overlay-countdown');
  assert.ok(timer, 'the timer');
  assert.equal(timer.getAttribute('role'), 'timer');
  const text = () => [...timer.querySelectorAll('.hero-card-overlay-countdown-col')].map((c) => `${c.querySelector('.hero-card-overlay-countdown-num').textContent} ${c.querySelector('.hero-card-overlay-countdown-label').textContent}`).join(' : ');
  assert.equal(text(), '20 Stunden : 45 Minuten : 49 Sekunden');
  assert.equal(timer.querySelectorAll('.hero-card-overlay-countdown-sep').length, 2);
  // before the link, after the text (www's campaign-wrapper)
  assert.ok(timer.nextElementSibling.classList.contains('hero-card-overlay-cta'));
  assert.equal(block.textContent.includes('End time'), false, 'the row is not card text');
  mock.timers.tick(1000);
  assert.equal(text(), '20 Stunden : 45 Minuten : 48 Sekunden');
  mock.timers.tick(61 * 1000);
  assert.equal(text(), '20 Stunden : 44 Minuten : 47 Sekunden');
});

test('English page: www\'s English labels; two days left: days : hours : minutes', async () => {
  at('/de/en/homepage');
  const block = blockOf([['End time', new Date(NOW + (((2 * 24 + 3) * 60 + 4) * 60 + 5) * 1000).toISOString()]]);
  await decorate(block);
  const labels = [...block.querySelectorAll('.hero-card-overlay-countdown-label')].map((l) => l.textContent);
  assert.deepEqual(labels, ['Days', 'Hours', 'Minutes']);
  assert.deepEqual([...block.querySelectorAll('.hero-card-overlay-countdown-num')].map((n) => n.textContent), ['02', '03', '04']);
});

test('the end passes while shown: the timer goes, the teaser stays', async () => {
  const block = blockOf([['End time', new Date(NOW + 3000).toISOString()]]);
  await decorate(block);
  assert.ok(block.querySelector('.hero-card-overlay-countdown'));
  mock.timers.tick(3000);
  assert.equal(block.querySelector('.hero-card-overlay-countdown'), null);
  assert.equal(block.querySelector('h2').textContent, '30 € Rabatt nach Südafrika');
  assert.ok(block.querySelector('.hero-card-overlay-cta a') !== null);
});

test('after the end, an empty or unreadable end time, no row: no timer, the block as before', async () => {
  const markup = async (rows) => {
    const block = blockOf(rows);
    await decorate(block);
    assert.equal(block.querySelector('.hero-card-overlay-countdown'), null, JSON.stringify(rows));
    return sha(block.outerHTML);
  };
  const plain = await markup([]);
  // the block without the row: its markup before the countdown existed (test/fixtures)
  assert.equal(plain, JSON.parse(fs.readFileSync('test/fixtures/hero-card-overlay-hashes.json', 'utf8'))[0]);
  assert.equal(await markup([['End time', '2026-10-31T23:59:00+01:00']]), plain, 'past: as without the row');
  assert.equal(await markup([['End time', '']]), plain, 'empty');
  assert.equal(await markup([['End time', 'bald']]), plain, 'unreadable');
});

test('a market without a known time zone (Austrian us/en): an offset counts, a local time gives no timer', async () => {
  at('/us/en/homepage', { brand: 'austrian' });
  const withOffset = blockOf([['End time', '2026-11-01T23:59:00.000-05:00']]);
  await decorate(withOffset);
  assert.equal([...withOffset.querySelectorAll('.hero-card-overlay-countdown-num')].map((n) => n.textContent).join(':'), '20:45:49');
  const local = blockOf([['End time', '2026-11-01 23:59']]);
  await decorate(local);
  assert.equal(local.querySelector('.hero-card-overlay-countdown'), null, 'no zone to read it in: no timer');
  assert.equal(readEndTime('2026-11-01 23:59', null), null);
  assert.equal(readEndTime('2026-11-01T23:59-05:00', null), Date.parse('2026-11-02T04:59:00Z'));
});

test('an Austrian at/de page: a local time is Vienna time', async () => {
  at('/at/de/homepage', { brand: 'austrian' });
  const block = blockOf([['End time', '02.11.2026 05:59']]);
  await decorate(block);
  assert.equal([...block.querySelectorAll('.hero-card-overlay-countdown-num')].map((n) => n.textContent).join(':'), '20:45:49');
});
