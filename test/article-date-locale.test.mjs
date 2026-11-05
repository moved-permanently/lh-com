/* The article header's publication date in each locale's own long format (Intl), every brand
   alike (brief 386 item 4, Brussels parity P16): www.brusselsairlines.com's be/en "May 11, 2026"
   and be/fr "11 mai 2026" (capture brussels-parity-001, 2026-11-05); German "20. August 2026"
   (at/de with Austrian month names: "22. Jänner 2025"); English in a German-speaking market
   (de, at, ch) as www.lufthansa.com's de/en and www.swiss.com's ch/en write it: "16. October 2025"
   (capture swiss-parity-001: "Published on 16. October 2025"); an undated text as written.
   Run: node --max-old-space-size=512 --test test/article-date-locale.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/', search: '', replace: () => {}, href: 'https://main--lh-com--moved-permanently.aem.page/', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { formatPublicationDate } = await import('../blocks/article-header/article-header.js');

const at = (country, lang) => ({ country, lang });

test('the locale\'s own long date: be/en, be/fr, it/it, pt, ru, zh', () => {
  assert.equal(formatPublicationDate('2026-05-11', at('be', 'en')), 'May 11, 2026');
  assert.equal(formatPublicationDate('2026-05-11', at('be', 'fr')), '11 mai 2026');
  assert.equal(formatPublicationDate('2026-05-11', at('gb', 'en')), 'May 11, 2026');
  assert.equal(formatPublicationDate('2023-07-19', at('it', 'it')), '19 luglio 2023');
  assert.equal(formatPublicationDate('2026-11-03', at('br', 'pt')), '3 de novembro de 2026');
  assert.equal(formatPublicationDate('2026-11-03', at('ru', 'ru')), '3 ноября 2026 г.');
  assert.equal(formatPublicationDate('2026-11-03', at('cn', 'zh')), '2026年11月3日');
});

test('German as before; at/de with Austrian month names', () => {
  assert.equal(formatPublicationDate('2026-08-20', at('de', 'de')), '20. August 2026');
  assert.equal(formatPublicationDate('2025-01-22', at('at', 'de')), '22. Jänner 2025');
  assert.equal(formatPublicationDate('2025-10-16', at('ch', 'de')), '16. Oktober 2025');
});

test('English in a German-speaking market: day, dot, month, year (de/en, at/en, ch/en)', () => {
  assert.equal(formatPublicationDate('2026-08-20', at('de', 'en')), '20. August 2026');
  assert.equal(formatPublicationDate('2025-10-16', at('ch', 'en')), '16. October 2025');
  assert.equal(formatPublicationDate('2025-10-16', at('at', 'en')), '16. October 2025');
});

test('a text that is no date stays as written', () => {
  assert.equal(formatPublicationDate('Spring 2026', at('be', 'en')), 'Spring 2026');
  assert.equal(formatPublicationDate('', at('be', 'en')), '');
});
