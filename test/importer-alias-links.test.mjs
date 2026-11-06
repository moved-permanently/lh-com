/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* www's short URLs whose pages the site has at the short path (brief 435, the de/en re-import from
   lh-snapshots-062/063): www links them by their long path now (/de/en/prepare-for-your-trip/
   travel-classes/business-class, /de/en/during-your-trip/internet-on-board, …), which is not in
   scope, so the cleanup (tools/importer/transformers/lufthansa-cleanup.js) kept them on www where
   the earlier import linked the site's /de/en/business-class, /de/en/flynet. And the alias page
   itself (imported at /de/en/flynet, canonical www's long path) links its own sections by the long
   path: the in-page anchors stayed on www (www's …/internet-on-board#portal) instead of the
   heading ids (#our-complimentary-flynet-portal).
   Run: node --max-old-space-size=256 --test test/importer-alias-links.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

const page = (url, canonical, body) => {
  const { document } = parseHTML(`<html><head><title>T | Lufthansa</title><link rel="canonical" href="${canonical}"></head><body><main><div class="section">${body}</div></main></body></html>`);
  const payload = { document, url, params: { originalURL: url } };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  return [...document.querySelectorAll('a')].map((a) => a.getAttribute('href'));
};

test('a link to an alias page\'s long path goes to the site\'s alias page', () => {
  const hrefs = page('https://www.lufthansa.com/de/en/economy-class', 'https://www.lufthansa.com/de/en/economy-class', [
    '<p><a href="https://www.lufthansa.com/de/en/prepare-for-your-trip/travel-classes/business-class">Business Class</a></p>',
    '<p><a href="https://www.lufthansa.com/de/en/prepare-for-your-trip/baggage/free-baggage?x=1#y">Free baggage</a></p>',
    '<p><a href="/de/en/during-your-trip/internet-on-board">FlyNet</a></p>',
    '<p><a href="https://www.lufthansa.com/de/en/book-and-manage/digital-self-services/digital-travel-companion">Companion</a></p>',
    '<p><a href="https://www.lufthansa.com/de/en/during-your-trip/lounges">Lounges</a></p>',
  ].join(''));
  assert.deepEqual(hrefs, ['/de/en/business-class', '/de/en/freigepaeck-regeln?x=1#y', '/de/en/flynet', '/de/en/digital-travel-companion', '/de/en/lounges']);
});

test('other long paths stay as before', () => {
  const hrefs = page(
    'https://www.lufthansa.com/de/en/economy-class',
    'https://www.lufthansa.com/de/en/economy-class',
    '<p><a href="https://www.lufthansa.com/de/en/prepare-for-your-trip/travel-classes/not-a-page">x</a></p><p><a href="https://www.lufthansa.com/de/en/business-class">y</a></p>',
  );
  assert.deepEqual(hrefs, ['https://www.lufthansa.com/de/en/prepare-for-your-trip/travel-classes/not-a-page', '/de/en/business-class']);
});

test('the alias page\'s links to its own sections by the long path become in-page anchors', () => {
  const hrefs = page(
    'https://www.lufthansa.com/de/en/flynet',
    'https://www.lufthansa.com/de/en/during-your-trip/internet-on-board',
    '<p><a href="https://www.lufthansa.com/de/en/during-your-trip/internet-on-board#portal">Portal</a></p><div id="portal"><h2>Our complimentary FlyNet portal</h2><p>Text</p></div>',
  );
  assert.deepEqual(hrefs, ['#our-complimentary-flynet-portal']);
});
