/* eslint-disable max-len */
/* The news feed (blocks/news-feed, brief 425, Cargo row 11): www.lufthansa-cargo.com's homepage
   "Latest news" (.latestNewsHome, cargo-parity-001 and the delivery snapshot's script) reads
   Mynewsdesk's pressroom list (www.mynewsdesk.com/services/pressroom/list/<key>/?format=json&
   type_of_media=pressrelease&limit=6&order=published; it answers any origin) and shows two press
   releases: the page language's first, then the others; each a card with the picture, "Press
   Release - 02 NOV 26 | 14:30" (www's label, the time as the feed gives it, the month in English
   also in German), the title and "Read more". www's "Read more" opens its embedded newsroom;
   ours links the release on Mynewsdesk (our newsroom page is a link there, row 20). Only a feed
   on www.mynewsdesk.com is read; a failed or empty one leaves the block out (the section's
   "Read all news" stays). Built without HTML strings (the pages require Trusted Types). Run:
   node --max-old-space-size=512 --test test/news-feed.test.mjs */
/* global globalThis */
import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const FEED = 'https://www.mynewsdesk.com/services/pressroom/list/pDlKMlDl6sSs1cRgYqlHHw/?format=json&type_of_media=pressrelease&limit=6&order=published';
const answer = fs.readFileSync(new URL('./fixtures/news-feed/mynewsdesk-cargo.json', import.meta.url), 'utf8');
const { default: decorate, pressDate } = await import('../blocks/news-feed/news-feed.js');

const page = (lang, rows) => {
  const { document } = parseHTML(`<!DOCTYPE html><html lang="${lang}"><body><main><div class="section"><div class="news-feed-wrapper"><div class="news-feed block">${rows}</div></div></div></main></body></html>`);
  globalThis.document = document;
  return document.querySelector('.news-feed');
};
const feedRow = (href = FEED) => `<div><div>Feed</div><div><a href="${href.replace(/&/g, '&amp;')}">${href.replace(/&/g, '&amp;')}</a></div></div>`;
const calls = [];
const serve = (body, ok = true) => {
  globalThis.fetch = async (url) => { calls.push(String(url)); return { ok, json: async () => JSON.parse(body) }; };
};
const text = (n) => (n ? n.textContent.replace(/\s+/g, ' ').trim() : '');
afterEach(() => { calls.length = 0; delete globalThis.fetch; });

test('en: the two newest English releases as cards: picture, the line, the title, Read more on Mynewsdesk', async () => {
  serve(answer);
  const block = page('en', feedRow());
  await decorate(block);
  assert.deepEqual(calls, [FEED]);
  const cards = [...block.querySelectorAll(':scope > ul > li')];
  assert.equal(cards.length, 2);
  const [first, second] = cards;
  const img = first.querySelector('.news-feed-image picture img');
  assert.match(img.getAttribute('src'), /^https:\/\/mnd-assets\.mynewsdesk\.com\/image\/upload\//);
  assert.equal(img.getAttribute('alt'), '');
  assert.equal(img.getAttribute('loading'), 'lazy');
  assert.equal(text(first.querySelector('.news-feed-meta')), 'Press Release - 02 NOV 26 | 14:30');
  assert.equal(text(first.querySelector('h3')), 'Lufthansa Cargo completes acquisition of LUG aircargo handling GmbH and strengthens infrastructure for future growth');
  const more = first.querySelector('a.news-feed-link');
  assert.equal(text(more), 'Read more');
  assert.match(more.getAttribute('href'), /^https:\/\/lufthansa-cargo-ag-com\.mynewsdesk\.com\/pressreleases\/lufthansa-cargo-completes-acquisition-of-lug/);
  assert.equal(more.getAttribute('aria-describedby'), first.querySelector('h3').id, 'the link named by its card');
  assert.equal(text(second.querySelector('h3')), 'GlobeCross Launches New Frankfurt Headquarters');
  assert.equal(text(second.querySelector('.news-feed-meta')), 'Press Release - 23 OCT 26 | 10:30');
  assert.ok(block.querySelector(':scope > div') === null, 'the config row gone');
});

test('de: the German releases, "Pressemitteilung", "Mehr lesen", the month in English as www', async () => {
  serve(answer);
  const block = page('de', feedRow());
  await decorate(block);
  const cards = [...block.querySelectorAll(':scope > ul > li')];
  assert.deepEqual(cards.map((c) => text(c.querySelector('h3'))), ['Lufthansa Cargo schließt Erwerb der LUG aircargo handling GmbH erfolgreich ab und stärkt die Infrastruktur für zukünftiges Wachstum', 'GlobeCross eröffnet neuen Hauptsitz in Frankfurt']);
  assert.equal(text(cards[0].querySelector('.news-feed-meta')), 'Pressemitteilung - 02 NOV 26 | 14:30');
  assert.equal(text(cards[0].querySelector('a.news-feed-link')), 'Mehr lesen');
});

test('fewer than two in the language: filled up with the others in the feed\'s order, as www', async () => {
  // the newest English release and the three German ones
  const all = JSON.parse(answer).items.item;
  const item = [all[0], ...all.filter((i) => i.language === 'de')];
  serve(JSON.stringify({ items: { item } }));
  const block = page('en', feedRow());
  await decorate(block);
  assert.deepEqual([...block.querySelectorAll('h3')].map(text), [
    'Lufthansa Cargo completes acquisition of LUG aircargo handling GmbH and strengthens infrastructure for future growth',
    'Lufthansa Cargo schließt Erwerb der LUG aircargo handling GmbH erfolgreich ab und stärkt die Infrastruktur für zukünftiges Wachstum',
  ]);
});

test('Count and the labels from the block; a feed not on www.mynewsdesk.com is not read', async () => {
  serve(answer);
  const block = page('en', `${feedRow()}<div><div>Count</div><div>3</div></div><div><div>Read more label</div><div>Details</div></div>`);
  await decorate(block);
  assert.equal(block.querySelectorAll(':scope > ul > li').length, 3);
  assert.equal(text(block.querySelector('a.news-feed-link')), 'Details');
  const other = page('en', feedRow('https://example.com/feed.json'));
  calls.length = 0;
  await decorate(other);
  assert.deepEqual(calls, []);
  assert.ok(other.closest('.news-feed-wrapper').hidden);
});

test('a failed or empty feed: the block left out, nothing else touched', async () => {
  serve('{}', false);
  const failed = page('en', feedRow());
  await decorate(failed);
  assert.ok(failed.closest('.news-feed-wrapper').hidden);
  assert.equal(failed.querySelectorAll('li').length, 0);
  serve('{"items":{"item":[]}}');
  const empty = page('en', feedRow());
  await decorate(empty);
  assert.ok(empty.closest('.news-feed-wrapper').hidden);
  globalThis.fetch = async () => { throw new TypeError('network'); };
  const thrown = page('en', feedRow());
  await decorate(thrown);
  assert.ok(thrown.closest('.news-feed-wrapper').hidden);
});

test('pressDate: the feed\'s own day and time, the month in English capitals', () => {
  assert.equal(pressDate('2026-11-02 14:30:00'), '02 NOV 26 | 14:30');
  assert.equal(pressDate('2026-01-05 09:05:00'), '05 JAN 26 | 09:05');
  assert.equal(pressDate('garbage'), '');
});

test('no HTML strings (Trusted Types)', () => {
  const js = fs.readFileSync(new URL('../blocks/news-feed/news-feed.js', import.meta.url), 'utf8');
  assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML/.test(js));
});
