/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; js-yaml is a dev dependency */
/* TAP's market roots on the site (brief 328): scripts/tap-markets.js (generated from www's market
   settings and ema-lufthansa's tools/reports/tap/markets.json: its 137 roots, their own pages and
   the paths each lacks or has no document for; tools/markets/tap-market-table.mjs), the switch
   TAP_LIVE_MARKETS (none on), the roots in SITE_LANGUAGES.tap (their pages resolve; the country
   selector lists one only when it is on; pt-br, the eighth language version, likewise), a market
   root's locale (its language, country, hreflang <ll>-<CC>, base, currency and home airport; the
   language roots get www's currency and airport too), the alerts bar on its homepage, the Message
   Center's country and the booking box's default origin from the root.
   Run: node --max-old-space-size=512 --test test/tap-market-roots.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import yaml from 'js-yaml';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="tap"></head><body></body></html>');
window.location = { pathname: '/pt-pt', hostname: 'tap.turnsthe.page', href: 'https://tap.turnsthe.page/pt-pt' };
globalThis.window = window;
globalThis.document = document;

const { TAP_MARKETS, TAP_LIVE_MARKETS } = await import('../scripts/tap-markets.js');
const { SITE_LANGUAGES, tapLanguages, languageSwitch } = await import('../scripts/site-languages.js');
const { getLocale } = await import('../scripts/locale.js');
const { marketRows, render } = await import('../tools/markets/tap-market-table.mjs');
const { isRootHomepage } = await import('../scripts/alerts-bar.js');
const { messageLocale } = await import('../scripts/message-center.js');
const { marketOrigin } = await import('../blocks/booking-box/tap-format.js');

const pick = (l) => ({
  lang: l.lang, country: l.country, hreflang: l.hreflang, base: l.base, currency: l.currency, homeAirport: l.homeAirport,
});
const LANGUAGE_ROOTS = ['/pt-pt/', '/en-pt/', '/es-es/', '/fr-fr/', '/de-de/', '/it-it/', '/pl-pl/'];

test('the table: markets.json\'s 137 roots with www\'s currency and airport, own pages, lacks; generated, up to date; the switch off', () => {
  const list = JSON.parse(fs.readFileSync('tools/reports/tap/markets.json', 'utf8'));
  const www = JSON.parse(fs.readFileSync('tools/markets/tap/www-markets.json', 'utf8'));
  assert.equal(Object.keys(TAP_MARKETS).length, 137);
  assert.deepEqual(Object.keys(TAP_MARKETS).sort(), Object.keys(list.roots).sort());
  assert.deepEqual(TAP_MARKETS['de-ch'], ['de', 'ch', 'de-de', 'CHF', 'GVA', 'Deutsch (Schweiz)', [], ['/buchungen/gift-card', '/rechtliche-informationen/schlichtungsstelle']]);
  assert.deepEqual(TAP_MARKETS['fr-ca'], ['fr', 'ca', 'fr-fr', 'CAD', 'YYZ', 'Français (Canada)',
    ['/mentions-legales/droits-passagers-canada', '/mentions-legales/plan-accessibilite-canada', '/miles-and-go/gagnez-miles/cartes-de-credit'],
    ['/mentions-legales/droits-des-passagers-france', '/reservations/assurances', '/reservations/gift-card']]);
  // lacks and the paths without a document (en-ch's legal notices) both answer 404
  assert.ok(TAP_MARKETS['en-ch'][7].includes('/legal-info/legal-notices'));
  assert.deepEqual(TAP_MARKETS['de-at'].slice(6), [[], []]);
  assert.deepEqual(TAP_MARKETS['en-us'].slice(0, 5), ['en', 'us', 'en-pt', 'USD', 'NYC']);
  assert.deepEqual(TAP_MARKETS['en-br'].slice(0, 5), ['en', 'br', 'en-pt', 'BRL', 'RIO'], 'en-br from en-pt; pt-br is a language version');
  assert.equal(TAP_MARKETS['pt-br'], undefined);
  assert.equal(TAP_MARKETS['pt-pt'], undefined);
  assert.equal(fs.readFileSync('scripts/tap-markets.js', 'utf8'), render(marketRows(www, list), TAP_LIVE_MARKETS));
  assert.deepEqual(TAP_LIVE_MARKETS, []);
});

test('SITE_LANGUAGES.tap: the seven language roots as before, then pt-br and the market roots, none listed while off', () => {
  const rows = SITE_LANGUAGES.tap;
  assert.deepEqual(rows.slice(0, 7).map((l) => l.path), LANGUAGE_ROOTS);
  assert.ok(rows.slice(0, 7).every((l) => l.listed === undefined));
  const br = rows.find((l) => l.path === '/pt-br/');
  assert.deepEqual([br.lang, br.country, br.home, br.listed], ['pt', 'br', '/pt-br', false]);
  const ch = rows.find((l) => l.path === '/de-ch/');
  assert.deepEqual([ch.lang, ch.country, ch.home, ch.name, ch.version, ch.listed, ch.slugs], ['de', 'ch', '/de-ch', 'Deutsch (Schweiz)', 'de-de', false, 'own']);
  assert.equal(rows.length, 7 + 1 + 137);
  assert.deepEqual(rows.filter((l) => l.listed !== false).map((l) => l.path), LANGUAGE_ROOTS);
  // the switch's others on a page: the six other language roots, as before
  assert.deepEqual(languageSwitch([], '/pt-pt/ajuda', 'pt', rows).links.map((l) => l.home), ['/en-pt', '/es-es', '/fr-fr', '/de-de', '/it-it', '/pl-pl']);
});

test('a root is listed once it is on (tapLanguages(live)): de-ch and pt-br on', () => {
  const rows = tapLanguages(['de-ch', 'pt-br']);
  assert.deepEqual(rows.filter((l) => l.listed !== false).map((l) => l.path), [...LANGUAGE_ROOTS, '/pt-br/', '/de-ch/']);
  assert.ok(languageSwitch([], '/pt-pt', 'pt', rows).links.some((l) => l.home === '/de-ch'));
});

test('a market root\'s locale: language, country, hreflang, base, currency and home airport from the root', () => {
  assert.deepEqual(pick(getLocale('/de-ch')), {
    lang: 'de', country: 'ch', hreflang: 'de-CH', base: '/de-ch', currency: 'CHF', homeAirport: 'GVA',
  });
  assert.deepEqual(pick(getLocale('/fr-ca/mentions-legales/droits-passagers-canada')), {
    lang: 'fr', country: 'ca', hreflang: 'fr-CA', base: '/fr-ca', currency: 'CAD', homeAirport: 'YYZ',
  });
  assert.deepEqual(pick(getLocale('/en-us/miles-and-go')), {
    lang: 'en', country: 'us', hreflang: 'en-US', base: '/en-us', currency: 'USD', homeAirport: 'NYC',
  });
  assert.deepEqual(pick(getLocale('/pt-br/x')), {
    lang: 'pt', country: 'br', hreflang: 'pt-BR', base: '/pt-br', currency: 'BRL', homeAirport: 'RIO',
  });
  // the language roots: www's settings of their market
  assert.deepEqual(pick(getLocale('/pt-pt')), {
    lang: 'pt', country: 'pt', hreflang: 'pt-PT', base: '/pt-pt', currency: 'EUR', homeAirport: 'LIS',
  });
  assert.deepEqual(pick(getLocale('/en-pt/help')), {
    lang: 'en', country: 'pt', hreflang: 'en-PT', base: '/en-pt', currency: 'EUR', homeAirport: 'LIS',
  });
  assert.deepEqual([getLocale('/pl-pl').currency, getLocale('/pl-pl').homeAirport], ['PLN', 'WAW']);
  // a path of no root: the first root, as before
  assert.equal(getLocale('/fragments/x').base, '/pt-pt');
});

test('on a market root: the alerts bar on its homepage, the Message Center\'s country, the booking box\'s origin', () => {
  assert.ok(isRootHomepage('/de-ch', SITE_LANGUAGES.tap));
  assert.ok(isRootHomepage('/fr-ca/', SITE_LANGUAGES.tap));
  assert.ok(!isRootHomepage('/de-ch/an-bord', SITE_LANGUAGES.tap));
  const l = messageLocale({ locale: getLocale('/de-ch'), read: () => '', pathname: '/de-ch' });
  assert.deepEqual([l.lang, l.country], ['de', 'ch']);
  assert.equal(marketOrigin('CH', 'GVA'), 'GVA');
  assert.equal(marketOrigin('US', 'NYC'), 'NYC');
  assert.equal(marketOrigin('PT', 'LIS'), 'LIS');
  assert.equal(marketOrigin('PT', ''), 'LIS', 'without the root\'s airport: TAP\'s market default');
  assert.equal(marketOrigin('XX', ''), '');
});

test('helix-query.yaml: a pages index per language version (markets, robots, lastModified), nav, footer and fragments left out', () => {
  const { indices } = yaml.load(fs.readFileSync('helix-query.yaml', 'utf8'));
  ['pt-pt', 'en-pt', 'es-es', 'fr-fr', 'de-de', 'it-it', 'pl-pl', 'pt-br'].forEach((v) => {
    const def = indices[`tap-pages-${v}`];
    assert.ok(def, v);
    assert.deepEqual(def.include, [`/${v}`, `/${v}/**`], v);
    assert.deepEqual(def.exclude, [`/${v}/nav`, `/${v}/footer`, `/${v}/fragments/**`, `/${v}/**/nav`, `/${v}/**/footer`], v);
    assert.equal(def.target, `/${v}/pages-index.json`, v);
    assert.deepEqual(Object.keys(def.properties), ['markets', 'robots', 'lastModified'], v);
    assert.equal(def.properties.markets.select, 'head > meta[name="markets"]');
    assert.equal(def.properties.markets.value, 'attribute(el, "content")');
  });
});
