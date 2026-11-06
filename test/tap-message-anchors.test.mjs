/* eslint-disable max-len */
/* Brief 437, item 2: TAP's Message Center as www.flytap.com.
   a. TAP's alert texts carry www's booking box anchors (#special-anchor-flight-status,
      -my-travels; also -book-flight, -check-in): on www its script opens the box on that tab
      (tools/reports/tap/booking-spec.md 2.4; the capture tap-snapshots-001's pages link
      "#special-anchor-my-travels" so). On lh-tap they led nowhere. In a message's text (the
      details, as the alerts page and the details page show them) and as a message's link (the
      strip), they go to the root homepage's box tab, /<root>#<tab>, as tools/importer/tap-import.mjs
      linkOf writes them for the pages; other anchors as they are; lufthansa.com's messages as before.
   b. Two TAP alerts with the same weight: www lists the older one first (the sync of 2026-11-06,
      /pt-il: the ASL notice, published 2024-12-19, before Madeira, 2026-11-06); lh-com's rank order
      (newest first within a rank) unchanged: lufthansa.com's captures show one message only, so
      nothing says www sorts its ties so (kept TAP-only).
   Run: node --max-old-space-size=512 --test test/tap-message-anchors.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body><main></main></body></html>');
window.hlx = { codeBasePath: '' };
const at = (pathname, meta = {}) => {
  const origin = 'https://tap.turnsthe.page';
  window.location = {
    hostname: 'tap.turnsthe.page', pathname, search: '', hash: '', replace: () => {}, href: `${origin}${pathname}`, origin,
  };
  document.head.innerHTML = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
};
at('/pt-il/alertas-e-informacoes', { brand: 'tap' });
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;

const {
  boxAnchorHref, withBoxAnchors, selectMessages, messageHref, loadDetails,
} = await import('../scripts/message-center.js');

const NOW = Date.parse('2026-11-06T18:00:00.000Z');
const row = (path, fields = {}) => ({
  path, headline: `Headline ${path}`, criticality: 'low', tenants: '["tap"]', markets: '[]', touchpoints: '["web","android-app","ios-app"]', link: '', details: '', from: '2026-03-01T00:00:00.000Z', to: '', push: 'false', 'internal-title': '', lastModified: 1793000000, ...fields,
});

test('a. the box anchors: the root homepage\'s box tab; other anchors and links as they are', () => {
  assert.equal(boxAnchorHref('#special-anchor-flight-status', { base: '/pt-il/' }), '/pt-il#flight-status');
  assert.equal(boxAnchorHref('#special-anchor-my-travels', { base: '/pt-pt/' }), '/pt-pt#my-travels');
  assert.equal(boxAnchorHref('#special-anchor-book-flight', { base: '/content/en-us/' }), '/en-us#book-flight', 'the local server\'s /content prefix');
  assert.equal(boxAnchorHref('#special-anchor-check-in', { base: '/de-de/' }), '/de-de#check-in');
  assert.equal(boxAnchorHref('#special-anchor-login', { base: '/pt-pt/' }), null, 'not a box tab');
  assert.equal(boxAnchorHref('#ola', { base: '/pt-pt/' }), null);
  assert.equal(boxAnchorHref('/pt-pt/ajuda', { base: '/pt-pt/' }), null);
});

test('a. a message\'s text on TAP: its box anchors mapped; on lufthansa.com as it is', () => {
  const box = document.createElement('div');
  box.innerHTML = '<p>Verifique o estado do seu voo <a href="#special-anchor-flight-status">aqui</a>.</p><p>Altere o bilhete <a href="#special-anchor-my-travels">aqui</a>, <a href="#outro">outro</a>.</p>';
  withBoxAnchors(box, { base: '/pt-il/' }, 'tap');
  assert.deepEqual([...box.querySelectorAll('a')].map((a) => a.getAttribute('href')), ['/pt-il#flight-status', '/pt-il#my-travels', '#outro']);
  const lh = document.createElement('div');
  lh.innerHTML = '<p><a href="#special-anchor-flight-status">x</a></p>';
  withBoxAnchors(lh, { base: '/de/en/' }, 'lh');
  assert.equal(lh.querySelector('a').getAttribute('href'), '#special-anchor-flight-status');
});

test('a. the details as the alerts page loads them (loadDetails) on TAP: mapped', async () => {
  globalThis.fetch = async () => new Response('<div><p>Verifique <a href="#special-anchor-flight-status">aqui</a> e <a href="#special-anchor-my-travels">aqui</a>.</p></div>', { status: 200 });
  const nodes = await loadDetails('/message-center/details/madeira-airport/pt');
  const box = document.createElement('div');
  box.append(...nodes);
  assert.deepEqual([...box.querySelectorAll('a')].map((a) => a.getAttribute('href')), ['/pt-il#flight-status', '/pt-il#my-travels']);
});

test('a. a message whose link is a box anchor (the strip\'s headline): the box tab, no #id', () => {
  const [msg] = selectMessages([row('/message-center/irreg/madeira-airport/pt', { link: '#special-anchor-flight-status', weight: '1' })], {
    market: 'il', lang: 'pt', now: NOW, tenant: 'tap',
  });
  assert.equal(messageHref(msg, [], { base: '/pt-il/', lang: 'pt', country: 'il' }, 'tap'), '/pt-il#flight-status');
});

test('a. the details page itself (scripts.js): its box anchors mapped on load', () => {
  const js = fs.readFileSync(new URL('../scripts/scripts.js', import.meta.url), 'utf8');
  assert.match(js, /\/message-center\/details\//);
  assert.match(js, /withBoxAnchors\(main/);
});

test('b. TAP: two alerts of the same weight, the older first; lufthansa.com: the newest first, as before', () => {
  const rows = [
    row('/message-center/irreg/madeira-airport/pt', { weight: '1', from: '2026-11-06T09:00:00.000Z' }),
    row('/message-center/irreg/lei-dos-servicos-de-aviacao-asl/pt', { weight: '1', from: '2024-12-19T00:00:00.000Z', markets: '["il"]' }),
    row('/message-center/irreg/travel-advisory-us/pt', { weight: '2', from: '2026-11-03T09:00:00.000Z' }),
  ];
  assert.deepEqual(selectMessages(rows, {
    market: 'il', lang: 'pt', now: NOW, tenant: 'tap',
  }).map((m) => m.id), ['lei-dos-servicos-de-aviacao-asl', 'madeira-airport', 'travel-advisory-us']);
  const lh = rows.map((r) => ({
    ...r, tenants: '["lh"]', weight: '', markets: '[]',
  }));
  assert.deepEqual(selectMessages(lh, {
    market: 'il', lang: 'pt', now: NOW, tenant: 'lh',
  }).map((m) => m.id), ['madeira-airport', 'travel-advisory-us', 'lei-dos-servicos-de-aviacao-asl']);
});
