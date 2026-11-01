/* eslint-disable import/no-extraneous-dependencies -- js-yaml is a dev dependency */
/* Lufthansa Cargo's notifications from the site's Message Center, as www.lufthansa-cargo.com shows
   them (2026-11-01, its own CMS before the switch-off): the header bell's panel (Notifications,
   "16 Sep 26 | 11:07 - Services & Support", headline, short text, Read more to the overview, Read
   all) and /en/notification-overview (Filter by category: All categories + the categories; items
   "16 SEP 26, 11:07 | Services & Support", headline, the full text, Read more). The documents
   /message-center/notification/<id>/<lang> (category, teaser, details page) and their own index
   /message-center/notifications.json (helix-query.yaml message-center-notifications, appended: the
   Message Center index and every other index as before). Opt-in per brand (scripts/brands.js
   notifications): the bell tool of any other brand stays a link.
   Run: node --max-old-space-size=512 --test test/notifications.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
const at = (pathname, meta = { brand: 'cargo' }) => {
  window.location = {
    hostname: 'main--lh-cargo--moved-permanently.aem.page', pathname, search: '', hash: '', replace: () => {}, href: `https://main--lh-cargo--moved-permanently.aem.page${pathname}`, origin: 'https://main--lh-cargo--moved-permanently.aem.page',
  };
  document.head.innerHTML = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
};
at('/en/home');
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
// linkedom's select has no value setter (the test picks a category)
Object.defineProperty(window.HTMLSelectElement.prototype, 'value', {
  configurable: true,
  get() { return (this.querySelector('option[selected]') || this.querySelector('option') || {}).value || ''; },
  set(v) { [...this.querySelectorAll('option')].forEach((o) => o.toggleAttribute('selected', o.value === v)); },
});
globalThis.window = window;
globalThis.document = document;

const NOW = Date.parse('2026-11-01T10:00:00.000Z');
const row = (path, fields = {}) => ({
  path, headline: `Headline ${path}`, category: 'Services & Support', teaser: '', tenants: ['cargo'], details: '', from: '', to: '', 'internal-title': '', lastModified: 1792900000, ...fields,
});
// www's notification (2026-09-16 11:07 Berlin time) in both languages, and others
const ROWS = [
  row('/message-center/notification/emergency/en', {
    headline: 'Guaranteed uplift for your most critical shipments',
    teaser: 'Our new Add-on Service Emergency combines the highest transport priority with guaranteed uplift – regardless of the commodity.',
    details: '/message-center/details/emergency/en',
    from: '2026-09-16T09:07:00.000Z',
  }),
  row('/message-center/notification/emergency/de', {
    headline: 'Garantierte Beförderung für Ihre kritischsten Sendungen',
    teaser: 'Verfügbar für ausgewählte Produkte und Speed-Optionen, kombiniert der Add-on Service Emergency höchste Priorität mit einer garantierten Beförderung, unabhängig vom Transportgut.',
    details: '/message-center/details/emergency/de',
    from: '2026-09-16T09:07:00.000Z',
  }),
  row('/message-center/notification/network/en', { headline: 'New route to Atlanta', category: 'Network', from: '2026-10-20T08:00:00.000Z' }),
  row('/message-center/notification/expired/en', { to: '2026-10-01T00:00:00.000Z' }),
  row('/message-center/notification/later/en', { from: '2026-12-01T00:00:00.000Z' }),
  row('/message-center/notification/other-tenant/en', { tenants: ['lh'] }),
  row('/message-center/irreg/not-a-notification/en'),
];

let fetches;
beforeEach(() => {
  fetches = [];
  globalThis.fetch = async (url) => {
    const href = String(url);
    fetches.push(href);
    const json = (data) => new Response(JSON.stringify({ data }), { headers: { 'content-type': 'application/json' } });
    if (href.startsWith('/message-center/notifications.json')) return json(ROWS.map((r) => (r.from ? r : { ...r, from: '2026-10-01T00:00:00.000Z' })));
    if (href.startsWith('/message-center/details/emergency/en.plain.html')) {
      return new Response('<div><p>When your shipments simply cannot be delayed, you need a transportation solution you can rely on.</p><ul><li><strong>Priority transport</strong></li></ul><p><a href="https://www.lufthansa-cargo.com/add-on-services/emergency">Details on the new Add-on Service Emergency</a></p></div>');
    }
    return new Response('', { status: 404 });
  };
});

const { BRANDS } = await import('../scripts/brands.js');
const mc = await import('../scripts/message-center.js');

test('helix-query.yaml: the notifications index appended; the Message Center index and every other as before', () => {
  const now = yaml.load(fs.readFileSync('helix-query.yaml', 'utf8')).indices;
  const ix = now['message-center-notifications'];
  assert.deepEqual(ix.include, ['/message-center/notification/**']);
  assert.equal(ix.target, '/message-center/notifications.json');
  assert.deepEqual(Object.keys(ix.properties), ['headline', 'category', 'teaser', 'tenants', 'details', 'from', 'to', 'internal-title', 'lastModified']);
  assert.equal(ix.properties.category.select, 'div > div > div:has(#category) > div:last-child');
  assert.equal(ix.properties.tenants.select, 'div > div > div:has(#tenants) > div:last-child li');
  assert.equal(Object.keys(now).pop(), 'message-center-notifications', 'appended at the end');
  const before = yaml.load(execFileSync('git', ['show', 'HEAD:helix-query.yaml'], { encoding: 'utf8' })).indices;
  Object.keys(before).filter((k) => k !== 'message-center-notifications').forEach((k) => {
    assert.equal(JSON.stringify(now[k]), JSON.stringify(before[k]), k);
  });
  assert.ok(!now['message-center'].include.some((g) => g.includes('notification')), 'not in the Message Center index');
});

test('brands.js: Cargo\'s notifications page; no other brand has notifications', () => {
  assert.deepEqual(BRANDS.cargo.notifications, { page: '/{ll}/notification-overview' });
  Object.entries(BRANDS).filter(([k]) => k !== 'cargo').forEach(([k, b]) => assert.equal(b.notifications, undefined, k));
  assert.equal(mc.notificationsPage(BRANDS.cargo, 'de'), '/de/notification-overview');
  assert.equal(mc.notificationsPage(BRANDS.ita, 'en'), '');
});

test('selectNotifications: the site\'s tenant, the page\'s language else English, in their window, newest first', () => {
  const en = mc.selectNotifications(ROWS, { lang: 'en', now: NOW, tenant: 'cargo' });
  assert.deepEqual(en.map((n) => n.id), ['network', 'emergency']);
  assert.equal(en[1].category, 'Services & Support');
  assert.equal(en[1].teaser.startsWith('Our new Add-on'), true);
  const de = mc.selectNotifications(ROWS, { lang: 'de', now: NOW, tenant: 'cargo' });
  assert.deepEqual(de.map((n) => `${n.id}/${n.lang}`), ['network/en', 'emergency/de']);
  assert.deepEqual(mc.selectNotifications(ROWS, { lang: 'en', now: NOW, tenant: 'ita' }), []);
  assert.deepEqual(mc.notificationCategories(en), ['Network', 'Services & Support']);
});

test('notificationDate: www\'s day, month and time (Berlin time); German months as www', () => {
  const t = Date.parse('2026-09-16T09:07:00.000Z');
  assert.deepEqual(mc.notificationDate(t, 'en'), { date: '16 Sep 26', time: '11:07' });
  assert.deepEqual(mc.notificationDate(t, 'de'), { date: '16 Sept. 26', time: '11:07' });
  assert.deepEqual(mc.notificationDate(Date.parse('2026-01-05T23:30:00.000Z'), 'en'), { date: '06 Jan 26', time: '00:30' });
});

test('the header bell (blocks/header/header-notifications.js): the panel as www\'s, loaded on first open', async () => {
  at('/en/home');
  const { default: buildNotifications } = await import('../blocks/header/header-notifications.js');
  const { button, panel } = buildNotifications({ label: 'Notification', lang: 'en', page: '/en/notification-overview' });
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(button.getAttribute('aria-label'), 'Notification');
  assert.ok(panel.hasAttribute('hidden'));
  assert.ok(!fetches.some((f) => f.includes('notifications.json')), 'nothing loaded before it is opened');
  document.body.replaceChildren(button, panel);
  button.click();
  await new Promise((r) => { setTimeout(r, 30); });
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.ok(!panel.hasAttribute('hidden'));
  assert.equal(panel.querySelector('.nav-notifications-title').textContent, 'Notifications');
  const items = [...panel.querySelectorAll('.nav-notifications-item')];
  assert.equal(items.length, 2);
  const emergency = items[1];
  assert.equal(emergency.querySelector('.nav-notifications-date').textContent, '16 Sep 26 | 11:07 - Services & Support');
  assert.equal(emergency.querySelector('.nav-notifications-headline').textContent, 'Guaranteed uplift for your most critical shipments');
  assert.equal(emergency.querySelector('.nav-notifications-teaser').textContent, ROWS[0].teaser);
  assert.equal(emergency.querySelector('a.nav-notifications-more').getAttribute('href'), '/en/notification-overview');
  assert.equal(emergency.querySelector('a.nav-notifications-more').textContent, 'Read more');
  assert.equal(panel.querySelector('a.nav-notifications-all').textContent, 'Read all');
  // www's limits: headlines 70, texts 190 characters
  const long = 'x'.repeat(250);
  assert.equal(mc.clip(long, 190), `${'x'.repeat(190)} ...`);
  assert.equal(mc.clip('short', 190), 'short');
  // close: the button again, the close button, Escape
  panel.querySelector('.nav-notifications-close').click();
  assert.ok(panel.hasAttribute('hidden'));
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  button.click();
  // (linkedom has no KeyboardEvent: an event with the key)
  const escape = new window.Event('keydown');
  escape.key = 'Escape';
  document.dispatchEvent(escape);
  assert.ok(panel.hasAttribute('hidden'));
  assert.equal(fetches.filter((f) => f.includes('notifications.json')).length, 1, 'loaded once');
});

test('the header bell in German: www\'s texts (Benachrichtigungen, Read more, Alles lesen)', async () => {
  at('/de/home');
  const { default: buildNotifications } = await import('../blocks/header/header-notifications.js');
  const { button, panel } = buildNotifications({ label: 'Benachrichtigung', lang: 'de', page: '/de/notification-overview' });
  document.body.replaceChildren(button, panel);
  button.click();
  await new Promise((r) => { setTimeout(r, 30); });
  assert.equal(panel.querySelector('.nav-notifications-title').textContent, 'Benachrichtigungen');
  assert.equal(panel.querySelector('.nav-notifications-item .nav-notifications-date').textContent, '20 Okt. 26 | 10:00 - Network');
  assert.equal(panel.querySelector('a.nav-notifications-all').textContent, 'Alles lesen');
  assert.equal(panel.querySelector('a.nav-notifications-more').textContent, 'Read more');
});

test('header.js: a bell tool is the notifications button only on a brand with notifications', () => {
  const src = fs.readFileSync('blocks/header/header.js', 'utf8');
  assert.match(src, /bell: 'notifications'/);
  assert.match(src, /brandEntry\(\)/);
  assert.match(src, /import\('\.\/header-notifications\.js'\)/);
  assert.match(fs.readFileSync('blocks/header/header.css', 'utf8'), /\.nav-notifications\b/);
});

test('the notifications block: www\'s overview, the category filter, the full text, Read more', async () => {
  at('/en/notification-overview');
  const { default: decorate } = await import('../blocks/notifications/notifications.js');
  const block = document.createElement('div');
  block.className = 'notifications';
  block.innerHTML = '<div><div><p>There are no notifications at the moment.</p></div></div>';
  document.body.replaceChildren(block);
  await decorate(block);
  const select = block.querySelector('select');
  assert.equal(block.querySelector('label').textContent, 'Filter by category');
  assert.deepEqual([...select.options].map((o) => [o.value, o.textContent]), [['', 'All categories'], ['Network', 'Network'], ['Services & Support', 'Services & Support']]);
  const items = [...block.querySelectorAll('.notifications-item')];
  assert.deepEqual(items.map((i) => i.id), ['notification-network', 'notification-emergency']);
  const em = items[1];
  assert.equal(em.dataset.category, 'Services & Support');
  assert.equal(em.querySelector('.notifications-date').textContent, '16 Sep 26, 11:07 | Services & Support');
  assert.equal(em.querySelector('h2').textContent, 'Guaranteed uplift for your most critical shipments');
  assert.ok(em.querySelector('.notifications-detail ul li strong') !== null, 'the details page\'s rich text');
  assert.equal(em.querySelector('.notifications-more').textContent, 'Read more');
  // the network notification has no details page: its teaser, else nothing to expand
  assert.equal(items[0].querySelector('.notifications-more'), null);
  // the filter
  select.value = 'Network';
  select.dispatchEvent(new window.Event('change'));
  assert.ok(!items[0].hasAttribute('hidden'));
  assert.ok(items[1].hasAttribute('hidden'));
  select.value = '';
  select.dispatchEvent(new window.Event('change'));
  assert.ok(items.every((i) => !i.hasAttribute('hidden')));
  // Read more opens the text
  em.querySelector('.notifications-more').click();
  assert.equal(em.querySelector('.notifications-more').getAttribute('aria-expanded'), 'true');
  assert.ok(em.classList.contains('is-open'));
});

test('the notifications block without notifications: the authored text; another brand: nothing', async () => {
  const { default: decorate } = await import('../blocks/notifications/notifications.js');
  at('/en/notification-overview', { brand: 'ita' });
  const block = document.createElement('div');
  block.className = 'notifications';
  block.innerHTML = '<div><div><p>There are no notifications at the moment.</p></div></div>';
  document.body.replaceChildren(block);
  await decorate(block);
  assert.equal(block.querySelectorAll('.notifications-item').length, 0);
  assert.equal(block.querySelector('select'), null);
  assert.match(block.textContent, /There are no notifications at the moment\./);
});
