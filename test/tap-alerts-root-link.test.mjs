/* eslint-disable max-len */
/* TAP's alert strip on a market root links to the root's own alerts page (brief 358): www links
   pt-il's strip to /pt-il/alertas-e-informacoes#<id>, not the language version's page. The CTI
   sheet has one row per language (/pt-pt/alertas-e-informacoes …); scripts/message-center.js
   ctiPagePath puts a market root (tapLanguages' version) in place of its language version, unless
   the root lacks the page (its lacks: the version's as before). The language versions, pt-br and
   the other brands keep their CTI pages as they are.
   Run: node --max-old-space-size=512 --test test/tap-alerts-root-link.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'tap.turnsthe.page', pathname: '/pt-il', search: '', hash: '', href: 'https://tap.turnsthe.page/pt-il', origin: 'https://tap.turnsthe.page',
};
globalThis.window = window;
globalThis.document = document;
const { ctiPagePath, messageHref } = await import('../scripts/message-center.js');
const { SITE_LANGUAGES } = await import('../scripts/site-languages.js');

const CTI = [
  { tenant: 'tap', webPath: '/pt-pt/alertas-e-informacoes', language: 'pt' },
  { tenant: 'tap', webPath: '/en-pt/alerts-and-informations', language: 'en' },
  { tenant: 'tap', webPath: '/de-de/warnmeldungen-und-informationen', language: 'de' },
  { tenant: 'lh', webPath: '/{cc}/{ll}/information/current-travel-information' },
];
const at = (root, languages = SITE_LANGUAGES.tap) => {
  const [lang, country] = root.split('-');
  return {
    lang, country, base: `/${root}`, siteLanguages: languages,
  };
};
const ASL = { id: 'lei-dos-servicos-de-aviacao-asl', link: '' };

test('a market root: its own alerts page, in the strip\'s links and "Ver todos"', () => {
  assert.equal(ctiPagePath(CTI, at('pt-il'), 'tap'), '/pt-il/alertas-e-informacoes');
  assert.equal(messageHref(ASL, CTI, at('pt-il'), 'tap'), '/pt-il/alertas-e-informacoes#lei-dos-servicos-de-aviacao-asl');
  assert.equal(ctiPagePath(CTI, at('en-gb'), 'tap'), '/en-gb/alerts-and-informations');
  assert.equal(ctiPagePath(CTI, at('de-ch'), 'tap'), '/de-ch/warnmeldungen-und-informationen');
  assert.equal(ctiPagePath(CTI, { ...at('pt-il'), base: '/content/pt-il' }, 'tap'), '/pt-il/alertas-e-informacoes', 'the local server\'s /content prefix');
});

test('the language versions and pt-br as before; a root that lacks the page: the version\'s', () => {
  assert.equal(ctiPagePath(CTI, at('pt-pt'), 'tap'), '/pt-pt/alertas-e-informacoes');
  assert.equal(ctiPagePath(CTI, at('en-pt'), 'tap'), '/en-pt/alerts-and-informations');
  assert.equal(ctiPagePath(CTI, at('pt-br'), 'tap'), '/pt-pt/alertas-e-informacoes');
  const lacking = SITE_LANGUAGES.tap.map((l) => (l.path === '/pt-il/' ? { ...l, lacks: ['/alertas-e-informacoes'] } : l));
  assert.equal(ctiPagePath(CTI, at('pt-il', lacking), 'tap'), '/pt-pt/alertas-e-informacoes');
});

test('the other brands as before (no site languages, or no market roots)', () => {
  assert.equal(ctiPagePath(CTI, { lang: 'en', country: 'de', base: '/de/en' }, 'lh'), '/de/en/information/current-travel-information');
  assert.equal(ctiPagePath([{ tenant: 'airdolomiti', webPath: '/en/current-flight-information', language: 'en' }], { lang: 'en', base: '/en', siteLanguages: SITE_LANGUAGES.airdolomiti }, 'airdolomiti'), '/en/current-flight-information');
});
