/* TAP's alerts bar (tools/reports/tap/alerts-spec.md items 1 to 4 and 6; brief 326): the tenant
   tap (scripts/brands.js), messageLocale keeping the country of TAP's <ll>-<cc> roots (pt-pt:
   lang pt, country pt; Cargo and Air Dolomiti still without one), weight in the message-center
   index and TAP's messages in its order (1 first, rows without one after, by the rank as before),
   the bar (flash-teaser's tap variant, blocks/flash-teaser/flash-teaser-tap.js): pager n/N between
   the chevrons, the headline to the alerts page #<id>, "Ver todos" to the page, 5 s autoplay with
   a 1.2 s slide, held while the pointer or the focus is on it, the arrows don't stop it, reduced
   motion without autoplay; and where scripts.js puts it (scripts/alerts-bar.js): first in the
   body, before the header, on TAP's seven root homepages only, 52 px reserved.
   Run: node --max-old-space-size=512 --test test/tap-alerts.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body><header></header><main></main></body></html>');
window.hlx = { codeBasePath: '' };
const at = (pathname, meta = {}) => {
  const origin = 'https://tap.turnsthe.page';
  window.location = {
    hostname: 'tap.turnsthe.page', pathname, search: '', hash: '', replace: () => {}, href: `${origin}${pathname}`, origin,
  };
  document.head.innerHTML = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
};
at('/pt-pt', { brand: 'tap' });
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;

const { BRANDS } = await import('../scripts/brands.js');
const { getLocale } = await import('../scripts/locale.js');
const {
  messageLocale, selectMessages, siteTenant, parseRow, messageHref, ctiPagePath,
} = await import('../scripts/message-center.js');
const {
  buildTapBar, SEE_ALL, AUTOPLAY_MS, SLIDE_MS,
} = await import('../blocks/flash-teaser/flash-teaser-tap.js');
const { isRootHomepage, placeAlertsBar } = await import('../scripts/alerts-bar.js');

const NOW = Date.parse('2026-11-04T09:00:00.000Z');
const row = (path, fields = {}) => ({
  path, headline: `Headline ${path}`, criticality: 'low', tenants: '["tap"]', markets: '[]', touchpoints: '["web","android-app","ios-app"]', link: '', details: '', from: '2026-03-01T00:00:00.000Z', to: '', push: 'false', 'internal-title': '', lastModified: 1793000000, ...fields,
});
// TAP's eight alerts in pt (lh-tap's index, 2026-11-04) with their weight (TAP's order)
const PT = [
  row('/message-center/irreg/restrictions-baggage/pt', { weight: '7', from: '2026-03-23T10:40:00.000Z' }),
  row('/message-center/tech-outage/scheduled-technical-interventions/pt', { headline: 'Manutenção de sistemas', weight: '1', from: '2026-11-03T08:00:00.000Z' }),
  row('/message-center/irreg/travel-advisory-us/pt', { weight: '2', from: '2026-11-03T09:00:00.000Z' }),
  row('/message-center/irreg/portuguese-identity-card/pt', { weight: '4', markets: '["pt"]', from: '2026-08-07T17:00:00.000Z' }),
  row('/message-center/irreg/optiontown/pt', { weight: '3', from: '2026-07-21T16:00:00.000Z' }),
  row('/message-center/irreg/power-banks/pt', { weight: '6', from: '2026-03-28T21:23:00.000Z' }),
  row('/message-center/irreg/phishing-scheme/pt', { weight: '8', from: '2026-04-21T16:00:00.000Z' }),
  row('/message-center/irreg/surto-de-ebola/pt', { weight: '5', from: '2026-06-18T08:00:00.000Z' }),
  row('/message-center/irreg/lufthansa-only/pt', { tenants: '["lh"]', weight: '1' }),
];
const ORDER = ['scheduled-technical-interventions', 'travel-advisory-us', 'optiontown', 'portuguese-identity-card', 'surto-de-ebola', 'power-banks', 'restrictions-baggage', 'phishing-scheme'];
const CTI = [
  { tenant: 'tap', language: 'pt', webPath: '/pt-pt/alertas-e-informacoes' },
  { tenant: 'tap', language: 'de', webPath: '/de-de/warnmeldungen-und-informationen' },
];

test('1: brands.js tap has the tenant tap and the alerts bar; a TAP page reads tenant tap', () => {
  assert.equal(BRANDS.tap.messageCenter, 'tap');
  assert.equal(BRANDS.tap.alertsBar, 'tap');
  at('/pt-pt', { brand: 'tap' });
  assert.equal(siteTenant(), 'tap');
  assert.ok(!Object.values(BRANDS).some((b, i) => b.alertsBar && Object.keys(BRANDS)[i] !== 'tap'), 'TAP only');
});

test('2: messageLocale keeps the country of TAP\'s roots (pt-pt, en-pt, de-de); Cargo and Air Dolomiti none', () => {
  at('/pt-pt', { brand: 'tap' });
  let l = messageLocale();
  assert.deepEqual([l.lang, l.country], ['pt', 'pt']);
  at('/en-pt/help', { brand: 'tap' });
  l = messageLocale();
  assert.deepEqual([l.lang, l.country], ['en', 'pt']);
  at('/de-de', { brand: 'tap' });
  l = messageLocale();
  assert.deepEqual([l.lang, l.country], ['de', 'de']);
  at('/en/home', { brand: 'cargo' });
  l = messageLocale();
  assert.deepEqual([l.lang, l.country], ['en', '']);
  at('/de/', { brand: 'airdolomiti' });
  l = messageLocale();
  assert.deepEqual([l.lang, l.country], ['de', '']);
  // lh-com as before
  at('/de/en/homepage');
  l = messageLocale({ locale: getLocale('/de/en/homepage') });
  assert.deepEqual([l.lang, l.country], ['en', 'de']);
});

test('3: weight in the index (helix-query.yaml) and parsed; TAP in weight order, the PT-only alert on pt-pt and not on de-de', () => {
  const yaml = fs.readFileSync('helix-query.yaml', 'utf8');
  const index = yaml.slice(yaml.indexOf('  message-center:'), yaml.indexOf('\n  message-center-notifications:') > 0 ? yaml.indexOf('\n  message-center-notifications:') : undefined);
  assert.match(index, /\n {6}weight:\n {8}select: div > div > div:has\(#weight\) > div:last-child\n {8}value: textContent\(el\)/);
  assert.equal(parseRow(PT[1]).weight, 1);
  assert.equal(parseRow(row('/message-center/irreg/x/pt')).weight, null);
  assert.equal(parseRow(row('/message-center/irreg/x/pt', { weight: ' ' })).weight, null);
  const pt = selectMessages(PT, {
    market: 'pt', lang: 'pt', now: NOW, tenant: 'tap',
  });
  assert.deepEqual(pt.map((m) => m.id), ORDER);
  const de = selectMessages(PT.map((r) => ({ ...r, path: r.path.replace(/\/pt$/, '/de') })), {
    market: 'de', lang: 'de', now: NOW, tenant: 'tap',
  });
  assert.deepEqual(de.map((m) => m.id), ORDER.filter((id) => id !== 'portuguese-identity-card'));
  // rows without weight after the weighted ones, by the rank as before (irreg before tech-outage)
  const mixed = selectMessages([
    row('/message-center/tech-outage/t/pt', { from: '2026-11-01T00:00:00.000Z' }),
    row('/message-center/irreg/i/pt', { from: '2026-10-01T00:00:00.000Z' }),
    row('/message-center/irreg/w/pt', { weight: '2' }),
  ], {
    market: 'pt', lang: 'pt', now: NOW, tenant: 'tap',
  });
  assert.deepEqual(mixed.map((m) => m.id), ['w', 'i', 't']);
  // another tenant keeps the rank even with weights (lh-com's rows have none)
  const lh = selectMessages(PT.map((r) => ({ ...r, tenants: '["lh"]' })), {
    market: 'pt', lang: 'pt', now: NOW, tenant: 'lh',
  });
  assert.equal(lh[lh.length - 1].id, 'scheduled-technical-interventions', 'tech-outage low last by rank');
});

test('the alerts page: the CTI row\'s webPath for the language; a headline links to it with #<id>', () => {
  const locale = { lang: 'pt', country: 'pt' };
  assert.equal(ctiPagePath(CTI, locale, 'tap'), '/pt-pt/alertas-e-informacoes');
  assert.equal(ctiPagePath(CTI, { lang: 'de', country: 'de' }, 'tap'), '/de-de/warnmeldungen-und-informationen');
  assert.equal(ctiPagePath(CTI, locale, 'lh'), '');
  const msg = parseRow(PT[1]);
  assert.equal(messageHref(msg, CTI, locale, 'tap'), '/pt-pt/alertas-e-informacoes#scheduled-technical-interventions');
});

/** A bar with fake timers: advance(ms) runs the due ones in order. */
function make(n = 8, { reducedMotion = false, lang = 'pt' } = {}) {
  let t = 0;
  let timers = [];
  let id = 0;
  const env = {
    setTimeout: (fn, ms) => { id += 1; timers.push({ id, at: t + ms, fn }); return id; },
    clearTimeout: (i) => { timers = timers.filter((x) => x.id !== i); },
    reducedMotion,
  };
  const advance = (ms) => {
    const end = t + ms;
    for (;;) {
      timers.sort((a, b) => a.at - b.at);
      const next = timers[0];
      if (!next || next.at > end) break;
      timers.shift();
      t = next.at;
      next.fn();
    }
    t = end;
  };
  const messages = selectMessages(PT, {
    market: 'pt', lang: 'pt', now: NOW, tenant: 'tap',
  }).slice(0, n);
  const view = buildTapBar(messages, CTI, { lang, country: 'pt' }, env, 'tap');
  document.querySelector('main').replaceChildren(view.region);
  const active = () => [...view.region.querySelectorAll('.flash-teaser-tap-slide')].findIndex((s) => !s.hidden && s.classList.contains('is-active'));
  return {
    region: view.region, advance, active, pager: () => view.region.querySelector('.flash-teaser-tap-pager').textContent,
  };
}

test('4: the bar: previous, pager 1/8, next, the headline to #<id>, "Ver todos" to the alerts page; a carousel region', () => {
  const { region, pager } = make();
  assert.equal(region.getAttribute('role'), 'region');
  assert.equal(region.getAttribute('aria-roledescription'), 'carousel');
  assert.ok(region.getAttribute('aria-label'));
  const bar = region.querySelector('.flash-teaser-tap-bar');
  const order = [...bar.children].map((c) => c.className.split(' ')[0]);
  assert.deepEqual(order, ['flash-teaser-tap-prev', 'flash-teaser-tap-pager', 'flash-teaser-tap-next', 'flash-teaser-tap-slides', 'flash-teaser-tap-all']);
  assert.equal(pager(), '1/8');
  assert.equal(bar.querySelector('.flash-teaser-tap-pager').getAttribute('aria-hidden'), 'true');
  assert.ok(bar.querySelector('.flash-teaser-tap-prev').getAttribute('aria-label'));
  assert.ok(bar.querySelector('.flash-teaser-tap-next').getAttribute('aria-label'));
  const slides = [...region.querySelectorAll('.flash-teaser-tap-slide')];
  assert.equal(slides.length, 8);
  assert.equal(slides[0].getAttribute('role'), 'group');
  assert.equal(slides[0].getAttribute('aria-roledescription'), 'slide');
  const first = slides[0].querySelector('a');
  assert.equal(first.getAttribute('href'), '/pt-pt/alertas-e-informacoes#scheduled-technical-interventions');
  assert.equal(first.textContent, 'Manutenção de sistemas');
  assert.ok(slides.slice(1).every((s) => s.hidden));
  const all = bar.querySelector('.flash-teaser-tap-all');
  assert.equal(all.tagName, 'A');
  assert.equal(all.getAttribute('href'), '/pt-pt/alertas-e-informacoes');
  assert.equal(all.textContent, 'Ver todos');
  assert.deepEqual(SEE_ALL, {
    pt: 'Ver todos', en: 'See all', es: 'Ver todo', fr: 'Voir tous', de: 'Alle anzeigen', it: 'Veda tutto', pl: 'Zobacz wszystkie',
  });
});

test('4: autoplay every 5 s with a 1.2 s slide, looping; the arrows move one back or on and don\'t stop it', () => {
  assert.equal(AUTOPLAY_MS, 5000);
  assert.equal(SLIDE_MS, 1200);
  const {
    region, advance, active, pager,
  } = make();
  advance(AUTOPLAY_MS - 1);
  assert.equal(active(), 0);
  advance(1);
  assert.equal(active(), 1);
  assert.equal(pager(), '2/8');
  advance(SLIDE_MS + AUTOPLAY_MS);
  assert.equal(active(), 2);
  const click = (sel) => region.querySelector(sel).dispatchEvent(new window.Event('click', { bubbles: true }));
  click('.flash-teaser-tap-prev');
  click('.flash-teaser-tap-prev');
  click('.flash-teaser-tap-prev');
  assert.equal(active(), 7, 'wraps back');
  assert.equal(pager(), '8/8');
  advance(SLIDE_MS + AUTOPLAY_MS);
  assert.equal(active(), 0, 'still playing, wraps on');
  click('.flash-teaser-tap-next');
  assert.equal(active(), 1);
  // the hidden slides' links are out of the tab order
  assert.equal(region.querySelectorAll('.flash-teaser-tap-slide:not([hidden]) a').length >= 1, true);
});

test('4: held while the pointer or the focus is on it, on again after; reduced motion: no autoplay', () => {
  const { region, advance, active } = make();
  const slides = region.querySelector('.flash-teaser-tap-slides');
  slides.dispatchEvent(new window.Event('mouseenter'));
  advance(AUTOPLAY_MS * 3);
  assert.equal(active(), 0, 'held');
  slides.dispatchEvent(new window.Event('mouseleave'));
  advance(AUTOPLAY_MS);
  assert.equal(active(), 1);
  region.dispatchEvent(new window.Event('focusin', { bubbles: true }));
  advance(AUTOPLAY_MS * 3);
  assert.equal(active(), 1, 'held while focused');
  region.dispatchEvent(new window.Event('focusout', { bubbles: true }));
  advance(SLIDE_MS + AUTOPLAY_MS);
  assert.equal(active(), 2);
  const still = make(8, { reducedMotion: true });
  still.advance(AUTOPLAY_MS * 4);
  assert.equal(still.active(), 0);
  still.region.querySelector('.flash-teaser-tap-next').dispatchEvent(new window.Event('click'));
  assert.equal(still.active(), 1, 'the arrows still work');
});

test('4: one alert: no arrows and no pager; the headline and "Ver todos"', () => {
  const { region } = make(1);
  assert.equal(region.querySelector('.flash-teaser-tap-prev'), null);
  assert.equal(region.querySelector('.flash-teaser-tap-pager'), null);
  assert.equal(region.querySelectorAll('.flash-teaser-tap-slide').length, 1);
  assert.ok(region.querySelector('.flash-teaser-tap-all'));
});

test('4: placed first in the body, before the header, on TAP\'s seven root homepages only, 52 px reserved', () => {
  at('/pt-pt', { brand: 'tap' });
  const roots = getLocale('/pt-pt').siteLanguages;
  ['/pt-pt', '/pt-pt/', '/en-pt', '/es-es', '/fr-fr', '/de-de', '/it-it', '/pl-pl', '/content/pt-pt'].forEach((p) => assert.ok(isRootHomepage(p, roots), p));
  ['/pt-pt/ajuda', '/pt-pt/alertas-e-informacoes', '/', '/drafts/booking-box/pt-pt', '/pt-ptx'].forEach((p) => assert.ok(!isRootHomepage(p, roots), p));
  at('/pt-pt', { brand: 'tap' });
  document.body.innerHTML = '<header></header><main></main>';
  const block = placeAlertsBar(document, BRANDS.tap, getLocale('/pt-pt'), '/pt-pt');
  assert.ok(block.classList.contains('flash-teaser'));
  assert.ok(block.classList.contains('tap'));
  const wrapper = document.body.firstElementChild;
  assert.equal(wrapper, block.parentElement);
  assert.ok(wrapper.classList.contains('alerts-bar'));
  assert.equal(wrapper.nextElementSibling.tagName, 'HEADER');
  assert.equal(wrapper.style.minHeight, '52px');
  // not on another page, not on another brand
  document.body.innerHTML = '<header></header><main></main>';
  assert.equal(placeAlertsBar(document, BRANDS.tap, getLocale('/pt-pt/ajuda'), '/pt-pt/ajuda'), null);
  assert.equal(placeAlertsBar(document, BRANDS.airdolomiti, getLocale('/'), '/'), null);
  assert.equal(placeAlertsBar(document, null, getLocale('/de/en/homepage'), '/de/en/homepage'), null);
  assert.equal(document.querySelector('.alerts-bar'), null);
});
