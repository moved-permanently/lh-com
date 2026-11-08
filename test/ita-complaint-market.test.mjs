/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 475, item 2: ITA's complaint-form links (www.complaint.ita-airways.com/s/complaint?language=..&market=..).
   A market root's page is served from its language version's document, whose links carry the version's market (market=IT
   or EN on every root). www's root pages carry the root's country in the content links, the language as the version has
   it (the user's market comparison of 2026-11-07, raw server HTML: /au/en/support/support-faq/baggage-delay-faq ten content
   links market=AU, the nav's market=EN; /be/fr/... nine market=BE with language=fr). At render time, on an ITA market root
   (documents "language", not an xx root), the links in main take the root's country; the nav and footer (outside main) and
   the reference roots keep theirs; other brands as before. Fixtures by hand after those two pages.
   Run: node --max-old-space-size=256 --test test/ita-complaint-market.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import rootMarketLinks, { withRootMarket } from '../scripts/ita-market-links.js';

const FORM = 'https://www.complaint.ita-airways.com/s/complaint';
const page = (links) => parseHTML(`<html><body><header><a id="nav" href="${FORM}?language=en_US&amp;market=EN">Complaints</a></header><main><div>${links.map((h, i) => `<p><a id="l${i}" href="${h}">form</a></p>`).join('')}</div></main><footer><a id="foot" href="${FORM}?language=en_US&amp;market=EN">Complaints</a></footer></body></html>`).document;
const au = {
  brand: 'ita', documents: 'language', country: 'au', lang: 'en', root: 'au/en',
};
const be = {
  brand: 'ita', documents: 'language', country: 'be', lang: 'fr', root: 'be/fr',
};

test('a link: the root\'s country as market, the language as it is, the rest of the URL kept', () => {
  assert.equal(withRootMarket(`${FORM}?language=en_US&market=IT`, 'au'), `${FORM}?language=en_US&market=AU`);
  assert.equal(withRootMarket(`${FORM}?language=fr&market=FR&prm=true`, 'be'), `${FORM}?language=fr&market=BE&prm=true`);
  assert.equal(withRootMarket(`${FORM}?language=fr`, 'be'), null, 'no market in the link: as it is');
  assert.equal(withRootMarket('https://www.ita-airways-connect.com/s/?language=en_US&market=US', 'au'), null, 'another host');
  assert.equal(withRootMarket('/au/en/support', 'au'), null);
});

test('/au/en baggage-delay-faq: the content links market=AU, the nav and footer keep market=EN', () => {
  const document = page([`${FORM}?language=en_US&market=IT`, `${FORM}?language=en_US&market=EN`, `${FORM}?language=en&market=it`]);
  rootMarketLinks(document.querySelector('main'), au);
  ['l0', 'l1', 'l2'].forEach((id) => assert.match(document.getElementById(id).getAttribute('href'), /[?&]market=AU(&|$)/, id));
  assert.match(document.getElementById('l2').getAttribute('href'), /language=en&/);
  assert.match(document.getElementById('nav').getAttribute('href'), /market=EN$/);
  assert.match(document.getElementById('foot').getAttribute('href'), /market=EN$/);
});

test('/be/fr: market=BE with language=fr; a link without market stays without', () => {
  const document = page([`${FORM}?language=fr&market=FR`, `${FORM}?language=fr`]);
  rootMarketLinks(document.querySelector('main'), be);
  assert.equal(document.getElementById('l0').getAttribute('href'), `${FORM}?language=fr&market=BE`);
  assert.equal(document.getElementById('l1').getAttribute('href'), `${FORM}?language=fr`);
});

test('a fragment\'s main (the footer, decorated before it is placed): as it is', () => {
  const { document } = parseHTML('<html><body><main></main></body></html>');
  const fragment = document.createElement('main');
  fragment.innerHTML = `<p><a id="f" href="${FORM}?language=en_US&amp;market=EN">form</a></p>`;
  rootMarketLinks(fragment, au);
  assert.match(fragment.querySelector('#f').getAttribute('href'), /market=EN$/);
});

test('reference roots, xx roots and other brands: as they are', () => {
  [
    {
      brand: 'ita', documents: 'own', country: 'it', lang: 'en', root: 'it/en',
    },
    {
      brand: 'ita', documents: 'language', country: 'xx', lang: 'en', root: 'xx/en',
    },
    {
      brand: 'austrian', documents: 'language', country: 'au', lang: 'en', root: 'au/en',
    },
    { country: 'de', lang: 'en', root: 'de/en' },
  ].forEach((locale) => {
    const document = page([`${FORM}?language=en_US&market=IT`]);
    rootMarketLinks(document.querySelector('main'), locale);
    assert.match(document.getElementById('l0').getAttribute('href'), /market=IT$/, locale.root);
  });
});
