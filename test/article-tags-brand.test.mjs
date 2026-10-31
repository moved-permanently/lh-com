/* The article header's tag chips (blocks/article-header buildTags) per brand: lufthansa.com's link
   /<root>/articles/tags/<slug> as before; a brand's link its tag page on its www (scripts/brands.js
   articleTags, per language: Air Dolomiti's Italian /articoli/<slug> on www.airdolomiti.it, as
   its /articoli page links them, 2026-10-31); a brand (or a language) without tag pages shows
   the chips without a link. A brand's post names its tag in Category (Air Dolomiti's importer)
   when it has no Tags row; lufthansa.com's pages only from Tags, as before.
   Run: node --max-old-space-size=512 --test test/article-tags-brand.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
// the block's imports load scripts.js: on a demo host's / (lh-com, no brand) it only redirects
// (stubbed), it decorates nothing
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/', search: '', replace: () => {}, href: 'https://main--lh-com--moved-permanently.aem.page/', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { buildTags } = await import('../blocks/article-header/article-header.js');
const { BRANDS } = await import('../scripts/brands.js');

const LABELS = { 'tags label': 'Tags' };
const onPage = (meta, fn) => {
  document.head.innerHTML = Object.entries(meta).map(([k, v]) => (k.includes(':')
    ? `<meta property="${k}" content="${v}">` : `<meta name="${k}" content="${v}">`)).join('');
  try {
    return fn();
  } finally {
    document.head.innerHTML = '';
  }
};
const chips = (list) => [...list.querySelectorAll('li')].map((li) => {
  const a = li.querySelector('a');
  return a ? `${li.textContent} -> ${a.getAttribute('href')}` : `${li.textContent} (no link)`;
});

test('lufthansa.com: /<root>/articles/tags/<slug>, from Tags only, as before', () => {
  const locale = { base: '/de/en', lang: 'en' };
  assert.deepEqual(chips(onPage({ 'article:tag': 'Eat See Do, Travel' }, () => buildTags(LABELS, locale))), [
    'Eat See Do -> /de/en/articles/tags/eat-see-do', 'Travel -> /de/en/articles/tags/travel']);
  assert.ok(onPage({ category: 'AvGeek' }, () => buildTags(LABELS, locale)) === null, 'no chips from Category');
});

test('Air Dolomiti (Italian): its category page on www.airdolomiti.it, from Category without Tags', () => {
  assert.equal(BRANDS.airdolomiti.articleTags.it, 'https://www.airdolomiti.it/articoli');
  const locale = { base: '/de/en', lang: 'it' };
  assert.deepEqual(chips(onPage({ brand: 'airdolomiti', category: 'AvGeek' }, () => buildTags(LABELS, locale))), [
    'AvGeek -> https://www.airdolomiti.it/articoli/avgeek']);
  assert.deepEqual(chips(onPage({ brand: 'airdolomiti', category: '#DidYouKnow' }, () => buildTags(LABELS, locale))), [
    '#DidYouKnow -> https://www.airdolomiti.it/articoli/didyouknow'], 'as www\'s /articoli/didyouknow');
  assert.deepEqual(chips(onPage({ brand: 'airdolomiti', 'article:tag': 'Destinazioni', category: 'AvGeek' }, () => buildTags(LABELS, locale))), [
    'Destinazioni -> https://www.airdolomiti.it/articoli/destinazioni'], 'Tags first');
});

test('a language or brand without tag pages: the chips without a link', () => {
  assert.deepEqual(chips(onPage({ brand: 'airdolomiti', category: 'AvGeek' }, () => buildTags(LABELS, { base: '/de/en', lang: 'en' }))), [
    'AvGeek (no link)']);
  assert.deepEqual(chips(onPage({ brand: 'discover', 'article:tag': 'Travel' }, () => buildTags(LABELS, { base: '/de/en', lang: 'en' }))), [
    'Travel (no link)']);
});
