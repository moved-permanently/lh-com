/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; js-yaml is a dev dependency */
/* TAP's market roots on the site (brief 328): scripts/tap-markets.js (generated from www's market
   settings and ema-lufthansa's tools/reports/tap/markets.json: its 137 roots, their own pages and
   the paths each lacks or has no document for; tools/markets/tap-market-table.mjs), the switch
   TAP_LIVE_MARKETS (since brief 340 pt-br and all 137 roots on), the roots in SITE_LANGUAGES.tap
   (their pages resolve; the country selector, the header's language switch, lists one only when it
   is on, each once; pt-br, the eighth language version, likewise), a market
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
  // www's forms (sign-up, complaint, Miles&Go information, suggestion) are no documents: lacks; the 14 pages www redirects away on a root (market-diff rulings 2026-11-09: de-ch /buchungen ...) are lacks too
  const FORMS_DE = ['/hilfe/anfragen-reklamationen/anregung-oder-kompliment', '/hilfe/anfragen-reklamationen/informationen-miles-go', '/hilfe/anfragen-reklamationen/reklamationen'];
  assert.deepEqual(TAP_MARKETS['de-ch'], ['de', 'ch', 'de-de', 'CHF', 'GVA', 'Deutsch (Schweiz)', [], ['/buchungen', '/buchungen/gift-card', ...FORMS_DE, '/rechtliche-informationen/schlichtungsstelle', '/registrierung']]);
  assert.deepEqual(TAP_MARKETS['fr-ca'], ['fr', 'ca', 'fr-fr', 'CAD', 'YYZ', 'Français (Canada)',
    ['/mentions-legales/droits-passagers-canada', '/mentions-legales/plan-accessibilite-canada', '/miles-and-go/gagnez-miles/cartes-de-credit'],
    ['/aide/demandes-reclamations/informations-miles-go', '/aide/demandes-reclamations/reclamation', '/aide/demandes-reclamations/suggestion-ou-compliment', '/inscription',
      '/mentions-legales/droits-des-passagers-france', '/reservations/assurances', '/reservations/gift-card']]);
  // lacks and the paths without a document both answer 404 (en-ch's sign-up); the 13 legal pages the
  // user's harness published on their roots (brief 414: en-ch's legal notices, en-de's and en-at's
  // legal notices and arbitration body …) are the roots' own pages now
  assert.ok(TAP_MARKETS['en-ch'][7].includes('/sign-up'));
  assert.ok(TAP_MARKETS['en-ch'][6].includes('/legal-info/legal-notices') && !TAP_MARKETS['en-ch'][7].includes('/legal-info/legal-notices'));
  assert.deepEqual(TAP_MARKETS['en-de'][6], ['/legal-info/arbitration-body', '/legal-info/legal-notices']);
  assert.deepEqual(TAP_MARKETS['fr-ch'][6], ['/mentions-legales/mentions-legales']);
  assert.equal(Object.values(TAP_MARKETS).reduce((n, row) => n + row[6].filter((p) => /legal|legais|mentions/.test(p)).length, 0), 19, 'the 13 and the Canadian roots\' six (en-ca, fr-ca, pt-ca)');
  assert.deepEqual(TAP_MARKETS['de-at'].slice(6), [[], [...FORMS_DE, '/registrierung']]);
  assert.deepEqual(TAP_MARKETS['en-us'].slice(0, 5), ['en', 'us', 'en-pt', 'USD', 'NYC']);
  assert.deepEqual(TAP_MARKETS['en-br'].slice(0, 5), ['en', 'br', 'en-pt', 'BRL', 'RIO'], 'en-br from en-pt; pt-br is a language version');
  assert.equal(TAP_MARKETS['pt-br'], undefined);
  assert.equal(TAP_MARKETS['pt-pt'], undefined);
  assert.equal(fs.readFileSync('scripts/tap-markets.js', 'utf8'), render(marketRows(www, list), TAP_LIVE_MARKETS));
  // pt-br and every root on since brief 340 (the merged language documents, pt-br's and all 137
  // roots' own documents and the eight pages indexes live 2026-11-04 10:52; the pilots de-ch,
  // en-us, fr-ca since brief 330); pt-br first, then the table's order
  assert.deepEqual(TAP_LIVE_MARKETS, ['pt-br', ...Object.keys(TAP_MARKETS)]);
});

test('SITE_LANGUAGES.tap: the seven language roots as before, then pt-br and the 137 market roots, every one listed', () => {
  const rows = SITE_LANGUAGES.tap;
  assert.deepEqual(rows.slice(0, 7).map((l) => l.path), LANGUAGE_ROOTS);
  assert.ok(rows.slice(0, 7).every((l) => l.listed === undefined));
  const br = rows.find((l) => l.path === '/pt-br/');
  assert.deepEqual([br.lang, br.country, br.home, br.listed], ['pt', 'br', '/pt-br', undefined]);
  const ch = rows.find((l) => l.path === '/de-ch/');
  assert.deepEqual([ch.lang, ch.country, ch.home, ch.name, ch.version, ch.listed, ch.slugs], ['de', 'ch', '/de-ch', 'Deutsch (Schweiz)', 'de-de', undefined, 'own']);
  assert.equal(rows.find((l) => l.path === '/pt-ao/').listed, undefined, 'pt-ao on too');
  assert.equal(rows.length, 7 + 1 + 137);
  const all = [...LANGUAGE_ROOTS, '/pt-br/', ...Object.keys(TAP_MARKETS).map((r) => `/${r}/`)];
  assert.deepEqual(rows.filter((l) => l.listed !== false).map((l) => l.path), all);
  // the country selector on a page (the header's language switch): every other root, each once
  ['/pt-pt/ajuda', '/pt-br/ajuda', '/de-at/an-bord', '/en-gb/help', '/es-mx/ayuda', '/fr-be/aide', '/it-it/assistenza', '/pl-pl/pomoc', '/pt-ao/ajuda'].forEach((page) => {
    const own = `/${page.split('/')[1]}`;
    const homes = languageSwitch([], page, getLocale(page).lang, rows).links.map((l) => l.home);
    assert.equal(homes.length, 144, page);
    assert.equal(new Set(homes).size, 144, `${page}: each root once`);
    assert.deepEqual([...homes].sort(), all.map((p) => p.slice(0, -1)).filter((h) => h !== own).sort(), page);
  });
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
  // the page's language metadata (en, as every TAP document has it) names no root: the path's
  // root counts (en-us is US, not en-pt's Portugal: the PT-only alert stays off it; brief 330)
  const us = messageLocale({ locale: getLocale('/en-us'), read: (n) => (n === 'language' ? 'en' : ''), pathname: '/en-us' });
  assert.deepEqual([us.lang, us.country], ['en', 'us']);
  const ca = messageLocale({ locale: getLocale('/fr-ca/aide'), read: (n) => (n === 'language' ? 'fr' : ''), pathname: '/fr-ca/aide' });
  assert.deepEqual([ca.lang, ca.country], ['fr', 'ca']);
  const pt = messageLocale({ locale: getLocale('/en-pt'), read: (n) => (n === 'language' ? 'en' : ''), pathname: '/en-pt' });
  assert.deepEqual([pt.lang, pt.country], ['en', 'pt']);
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
