/* The fallback cookie banner's lang attribute (scripts/consent-banner.js, every brand; brief 422):
   the language of the texts it shows. It said "en" on every page: the texts are a copy with the
   brand's links, never TEXTS.de itself, so the German banner (and the eight other languages')
   was announced as English. A page language without texts gets the English texts and "en".
   Run: node --max-old-space-size=512 --test test/consent-banner-lang.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'cargo.turnsthe.page', pathname: '/de/home', search: '', href: 'https://cargo.turnsthe.page/de/home', origin: 'https://cargo.turnsthe.page',
};
window.hlx = { codeBasePath: '' };
Object.defineProperty(window, 'origin', { value: 'https://cargo.turnsthe.page', configurable: true });
globalThis.window = window;
const { bannerTexts } = await import('../scripts/consent-banner.js');

const onPage = (lang, fn) => {
  const { document } = parseHTML(`<!DOCTYPE html><html lang="${lang}"><head></head><body></body></html>`);
  globalThis.document = document;
  try {
    return fn();
  } finally {
    delete globalThis.document;
  }
};

test('the texts\' language: German, French, Italian pages theirs; a language without texts English', () => {
  assert.equal(onPage('de', () => bannerTexts()).lang, 'de');
  assert.equal(onPage('de', () => bannerTexts()).reject, 'Nur erforderliche');
  assert.equal(onPage('fr', () => bannerTexts()).lang, 'fr');
  assert.equal(onPage('it', () => bannerTexts()).lang, 'it');
  assert.equal(onPage('en', () => bannerTexts()).lang, 'en');
  const other = onPage('sv', () => bannerTexts());
  assert.equal(other.lang, 'en');
  assert.equal(other.reject, 'Only necessary');
});

test('showConsentBanner writes the texts\' language on its root', () => {
  const js = fs.readFileSync('scripts/consent-banner.js', 'utf8');
  assert.doesNotMatch(js, /t === TEXTS\.de/);
  assert.match(js, /root = el\('div', \{ className: 'lh-consent', lang: t\.lang, 'data-nosnippet': 'true' \}/);
});
