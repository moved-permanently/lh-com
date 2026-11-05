/* eslint-disable max-len */
/* The travellers window's "Redeem miles" tab (blocks/flight-search/travellers-dialog.js; the brief
   after 388, Brussels P24, SWISS row 6), as www.brusselsairlines.com's and www.swiss.com's (capture
   redeem-miles-001: be/en, be/fr, ch/en, ch/de, 2026-11-05): a second tab beside Travel details,
   tabs as tabs (arrow keys, Home, End, one tab stop), the panel with the headline, Cash & Miles
   (three points, "Continue with login" to the replica's login page, the note, "Become a member"
   to the brand's Miles & More enrolment) and Book Award Flights (three points, "Search award
   flights" to miles-and-more.com, the note); no Continue under it. Brussels and SWISS only
   (scripts/brands.js travellersDialog.redeemMiles); Austrian's since capture redeem-miles-002.
   Values are compared as strings and booleans, never as DOM nodes (a failed node comparison
   prints the whole DOM). Run: node --max-old-space-size=256 --test test/flight-search-redeem-miles.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
const at = (host, pathname, brand) => {
  window.location = {
    hostname: host, pathname, search: '', hash: '', href: `https://${host}${pathname}`, origin: `https://${host}`,
  };
  document.head.innerHTML = brand ? `<meta name="brand" content="${brand}">` : '';
  document.documentElement.lang = pathname.split('/')[2] || 'en';
};
at('brussels.turnsthe.page', '/be/en/homepage', 'brussels');
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;
beforeEach(() => {
  globalThis.fetch = async () => new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
});

const { default: decorate } = await import('../blocks/flight-search/flight-search.js');
const { BRANDS } = await import('../scripts/brands.js');

const tick = () => new Promise((r) => { setImmediate(r); });
const flush = () => Array.from({ length: 20 }).reduce((p) => p.then(tick), Promise.resolve());
const built = async () => {
  const block = document.createElement('div');
  block.className = 'flight-search';
  [['Default origin', 'Brussels (BRU)'], ['Passenger picker', 'yes']].forEach(([k, v]) => {
    const row = document.createElement('div');
    row.innerHTML = `<div>${k}</div><div>${v}</div>`;
    block.append(row);
  });
  document.body.replaceChildren(block);
  decorate(block);
  await flush();
  return block;
};
const text = (node) => (node ? node.textContent.replace(/\s+/g, ' ').trim() : '');
const dialogOf = (block) => block.querySelector('dialog.flight-search-travellers-dialog');
const tabsOf = (dialog) => [...dialog.querySelectorAll('[role="tab"]')];
const panelOf = (dialog, tab) => dialog.querySelector(`#${tab.getAttribute('aria-controls')}`);
// linkedom has no KeyboardEvent: an Event carrying the key
const key = (node, k) => {
  const e = new window.Event('keydown', { bubbles: true, cancelable: true });
  e.key = k;
  return node.dispatchEvent(e);
};

test('the switch: Brussels, SWISS and Austrian have the tab; no other brand', () => {
  ['brussels', 'swiss', 'austrian'].forEach((k) => assert.ok(BRANDS[k].travellersDialog.redeemMiles, k));
  Object.keys(BRANDS).filter((k) => !['brussels', 'swiss', 'austrian'].includes(k))
    .forEach((k) => assert.equal(Boolean(BRANDS[k].travellersDialog && BRANDS[k].travellersDialog.redeemMiles), false, k));
});

test('Brussels be/en: two tabs; Redeem miles shows www\'s panel and hides Continue', async () => {
  at('brussels.turnsthe.page', '/be/en/homepage', 'brussels');
  const block = await built();
  const dialog = dialogOf(block);
  block.querySelector('.flight-search-travellers').click();
  const tabs = tabsOf(dialog);
  assert.deepEqual(tabs.map(text), ['Travel details', 'Redeem miles']);
  assert.deepEqual(tabs.map((t) => t.getAttribute('aria-selected')), ['true', 'false']);
  assert.deepEqual(tabs.map((t) => t.getAttribute('tabindex')), ['0', '-1'], 'one tab stop');
  const miles = panelOf(dialog, tabs[1]);
  assert.equal(miles.hidden, true);
  assert.equal(miles.getAttribute('role'), 'tabpanel');
  assert.equal(miles.getAttribute('aria-labelledby'), tabs[1].id);
  tabs[1].click();
  assert.deepEqual(tabs.map((t) => t.getAttribute('aria-selected')), ['false', 'true']);
  assert.deepEqual(tabs.map((t) => t.getAttribute('tabindex')), ['-1', '0']);
  assert.equal(miles.hidden, false);
  assert.equal(panelOf(dialog, tabs[0]).hidden, true);
  assert.equal(dialog.querySelector('.flight-search-travellers-footer').hidden, true, 'no Continue under the miles');
  assert.equal(dialog.getAttribute('aria-labelledby'), tabs[1].id, 'the window named by its open tab');
  assert.equal(text(miles.querySelector('h3')), 'Choose from two ways to use your miles.');
  assert.deepEqual([...miles.querySelectorAll('h4')].map(text), ['Cash & Miles', 'Book Award Flights']);
  assert.deepEqual(
    [...miles.querySelectorAll('.flight-search-miles-cash li')].map(text),
    ['Redeem from just 3,000 miles.', 'Choose freely how many miles you want to use.', 'Available for any travel date.'],
  );
  assert.deepEqual(
    [...miles.querySelectorAll('.flight-search-miles-awards li')].map(text),
    ['Start redeeming from just 15,000 miles.', 'Redeem miles based on your destination and travel class.', 'Our most popular way to redeem miles worldwide.'],
  );
  const login = miles.querySelector('a.flight-search-miles-login');
  assert.equal(text(login), 'Continue with login');
  assert.equal(login.getAttribute('href'), '/be/en/profile/login');
  assert.ok(login.classList.contains('button') && login.classList.contains('primary'));
  assert.equal(text(document.getElementById(login.getAttribute('aria-describedby'))), 'Click the button to proceed to login.');
  assert.equal(text(miles.querySelector('.flight-search-miles-cash .flight-search-miles-note')), 'The Cash & Miles payment option will be displayed after you select your flight.');
  const member = miles.querySelector('a.flight-search-miles-member');
  assert.equal(text(member), 'Become a member');
  assert.equal(member.getAttribute('href'), 'https://brusselsairlines.miles-and-more.com/web/row/en/enrolment.html?client_id=FuBoxl39ln5fAfvIAX18xIi2BI4d6rny&redirect_uri=https://www.brusselsairlines.com');
  assert.equal(text(document.getElementById(member.getAttribute('aria-describedby'))), 'Click the button to sign up.');
  const awards = miles.querySelector('a.flight-search-miles-awards-link');
  assert.equal(text(awards), 'Search award flights');
  assert.equal(awards.getAttribute('href'), 'https://www.miles-and-more.com/be/en/spend/flights.html');
  assert.ok(awards.classList.contains('button') && awards.classList.contains('secondary'));
  assert.equal(text(document.getElementById(awards.getAttribute('aria-describedby'))), 'Start your award flight search by clicking the button.');
  assert.equal(text(miles.querySelector('.flight-search-miles-awards .flight-search-miles-note')), 'You’re being sent to miles-and-more.com to continue.');
  assert.equal(miles.querySelectorAll('input, select, textarea').length, 0, 'no fields');
});

test('keyboard: arrows, Home and End move between the tabs and open them; a new opening starts on Travel details', async () => {
  at('brussels.turnsthe.page', '/be/en/homepage', 'brussels');
  const block = await built();
  const dialog = dialogOf(block);
  const opener = block.querySelector('.flight-search-travellers');
  opener.click();
  const tabs = tabsOf(dialog);
  const focused = [];
  tabs.forEach((t, i) => { t.focus = () => { focused.push(i); }; });
  key(tabs[0], 'ArrowRight');
  assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
  key(tabs[1], 'ArrowRight');
  assert.equal(tabs[0].getAttribute('aria-selected'), 'true', 'wraps round');
  key(tabs[0], 'ArrowLeft');
  assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
  key(tabs[1], 'Home');
  assert.equal(tabs[0].getAttribute('aria-selected'), 'true');
  key(tabs[0], 'End');
  assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
  assert.deepEqual(focused, [1, 0, 1, 0, 1]);
  dialog.querySelector('.flight-search-travellers-close').click();
  opener.click();
  assert.equal(tabs[0].getAttribute('aria-selected'), 'true', 'opens on Travel details');
  assert.equal(dialog.querySelector('.flight-search-travellers-footer').hidden, false);
});

test('Brussels be/fr: www\'s French texts; Become a member to the French enrolment page (www\'s link is broken)', async () => {
  at('brussels.turnsthe.page', '/be/fr/homepage', 'brussels');
  const dialog = dialogOf(await built());
  const tabs = tabsOf(dialog);
  assert.deepEqual(tabs.map(text), ['Informations sur le voyage', 'Échanger des Miles']);
  const miles = panelOf(dialog, tabs[1]);
  assert.equal(text(miles.querySelector('h3')), 'Vous avez le choix entre deux façons d’utiliser vos Miles.');
  assert.deepEqual([...miles.querySelectorAll('h4')].map(text), ['Offre Cash & Miles', 'Réserver des Award Flights']);
  assert.equal(text(miles.querySelector('a.flight-search-miles-login')), 'Poursuivre avec la connexion');
  assert.equal(miles.querySelector('a.flight-search-miles-login').getAttribute('href'), '/be/fr/profile/login');
  assert.equal(text(miles.querySelector('a.flight-search-miles-member')), 'Devenir membre');
  assert.equal(miles.querySelector('a.flight-search-miles-member').getAttribute('href'), 'https://brusselsairlines.miles-and-more.com/web/row/fr/enrolment.html?client_id=FuBoxl39ln5fAfvIAX18xIi2BI4d6rny&redirect_uri=https://www.brusselsairlines.com');
  assert.equal(text(miles.querySelector('a.flight-search-miles-awards-link')), 'Recherche de billets Prime');
  assert.equal(miles.querySelector('a.flight-search-miles-awards-link').getAttribute('href'), 'https://www.miles-and-more.com/be/en/spend/flights.html');
});

test('SWISS ch/de and ch/en: its targets; the award search filled (accent), as www', async () => {
  at('swiss.turnsthe.page', '/ch/de/homepage', 'swiss');
  let dialog = dialogOf(await built());
  let tabs = tabsOf(dialog);
  assert.deepEqual(tabs.map(text), ['Reisedetails', 'Meilen einlösen']);
  let miles = panelOf(dialog, tabs[1]);
  assert.equal(text(miles.querySelector('h3')), 'Sie haben zwei Möglichkeiten, Ihre Meilen einzulösen.');
  assert.equal(text(miles.querySelector('a.flight-search-miles-login')), 'Weiter mit Login');
  assert.equal(miles.querySelector('a.flight-search-miles-login').getAttribute('href'), '/ch/de/login');
  assert.equal(text(miles.querySelector('a.flight-search-miles-member')), 'Jetzt anmelden');
  assert.equal(miles.querySelector('a.flight-search-miles-member').getAttribute('href'), 'https://swiss.miles-and-more.com/web/row/de/enrolment.html?client_id=sAwlvrK8fb55GvHqM5Me9iAWpF9rchZL&redirect_uri=https://www.swiss.com');
  const awards = miles.querySelector('a.flight-search-miles-awards-link');
  assert.equal(text(awards), 'Award Flight suchen');
  assert.equal(awards.getAttribute('href'), 'https://www.miles-and-more.com/de/de/spend/flights.html');
  assert.ok(awards.classList.contains('accent'));
  at('swiss.turnsthe.page', '/ch/en/homepage', 'swiss');
  dialog = dialogOf(await built());
  tabs = tabsOf(dialog);
  miles = panelOf(dialog, tabs[1]);
  assert.equal(miles.querySelector('a.flight-search-miles-login').getAttribute('href'), '/ch/en/login');
  assert.equal(miles.querySelector('a.flight-search-miles-awards-link').getAttribute('href'), 'https://www.miles-and-more.com/de/de/spend/flights.html');
  assert.equal(miles.querySelector('a.flight-search-miles-member').getAttribute('href'), 'https://swiss.miles-and-more.com/web/row/en/enrolment.html?client_id=sAwlvrK8fb55GvHqM5Me9iAWpF9rchZL&redirect_uri=https://www.swiss.com');
});

test('Austrian at/en and at/de (capture redeem-miles-002): the tab with the group\'s texts; its login pages, enrolment and award search', async () => {
  at('austrian.turnsthe.page', '/at/en/homepage', 'austrian');
  let dialog = dialogOf(await built());
  let tabs = tabsOf(dialog);
  assert.deepEqual(tabs.map(text), ['Travel details', 'Redeem miles']);
  let miles = panelOf(dialog, tabs[1]);
  assert.equal(text(miles.querySelector('h3')), 'Choose from two ways to use your miles.');
  assert.equal(text(miles.querySelector('a.flight-search-miles-login')), 'Continue with login');
  assert.equal(miles.querySelector('a.flight-search-miles-login').getAttribute('href'), '/at/en/login');
  assert.equal(miles.querySelector('a.flight-search-miles-member').getAttribute('href'), 'https://austrian.miles-and-more.com/web/row/en/enrolment.html?client_id=dFquxAQT637lrYALS9UKBMieeibyGaVQ&redirect_uri=https://www.austrian.com');
  const awards = miles.querySelector('a.flight-search-miles-awards-link');
  assert.equal(awards.getAttribute('href'), 'https://www.miles-and-more.com/de/de/spend/flights.html');
  assert.ok(awards.classList.contains('secondary'));
  at('austrian.turnsthe.page', '/at/de/homepage', 'austrian');
  dialog = dialogOf(await built());
  tabs = tabsOf(dialog);
  assert.deepEqual(tabs.map(text), ['Reisedetails', 'Meilen einlösen']);
  miles = panelOf(dialog, tabs[1]);
  assert.equal(text(miles.querySelector('a.flight-search-miles-login')), 'Weiter mit Login');
  assert.equal(miles.querySelector('a.flight-search-miles-login').getAttribute('href'), '/at/de/anmeldung');
  assert.equal(miles.querySelector('a.flight-search-miles-member').getAttribute('href'), 'https://austrian.miles-and-more.com/web/row/de/enrolment.html?client_id=dFquxAQT637lrYALS9UKBMieeibyGaVQ&redirect_uri=https://www.austrian.com');
  assert.equal(miles.querySelector('a.flight-search-miles-awards-link').getAttribute('href'), 'https://www.miles-and-more.com/de/de/spend/flights.html');
});

test('SWISS ch/fr and Brussels de/de (capture redeem-miles-002): the borrowed texts; ch/fr\'s enrolment SWISS\'s French page (www\'s link goes to Lufthansa\'s German one)', async () => {
  at('swiss.turnsthe.page', '/ch/fr/homepage', 'swiss');
  let dialog = dialogOf(await built());
  let tabs = tabsOf(dialog);
  assert.deepEqual(tabs.map(text), ['Informations sur le voyage', 'Échanger des Miles']);
  let miles = panelOf(dialog, tabs[1]);
  assert.equal(text(miles.querySelector('h3')), 'Vous avez le choix entre deux façons d’utiliser vos Miles.');
  assert.equal(miles.querySelector('a.flight-search-miles-login').getAttribute('href'), '/ch/fr/login');
  assert.equal(miles.querySelector('a.flight-search-miles-member').getAttribute('href'), 'https://swiss.miles-and-more.com/web/row/fr/enrolment.html?client_id=sAwlvrK8fb55GvHqM5Me9iAWpF9rchZL&redirect_uri=https://www.swiss.com');
  assert.equal(miles.querySelector('a.flight-search-miles-awards-link').getAttribute('href'), 'https://www.miles-and-more.com/de/de/spend/flights.html');
  at('brussels.turnsthe.page', '/de/de/homepage', 'brussels');
  dialog = dialogOf(await built());
  tabs = tabsOf(dialog);
  assert.deepEqual(tabs.map(text), ['Reisedetails', 'Meilen einlösen']);
  miles = panelOf(dialog, tabs[1]);
  assert.equal(text(miles.querySelector('h3')), 'Sie haben zwei Möglichkeiten, Ihre Meilen einzulösen.');
  assert.equal(text(miles.querySelector('a.flight-search-miles-member')), 'Jetzt anmelden');
  assert.equal(miles.querySelector('a.flight-search-miles-login').getAttribute('href'), '/de/de/profile/login');
  assert.equal(miles.querySelector('a.flight-search-miles-member').getAttribute('href'), 'https://brusselsairlines.miles-and-more.com/web/row/de/enrolment.html?client_id=FuBoxl39ln5fAfvIAX18xIi2BI4d6rny&redirect_uri=https://www.brusselsairlines.com');
  assert.equal(miles.querySelector('a.flight-search-miles-awards-link').getAttribute('href'), 'https://www.miles-and-more.com/be/en/spend/flights.html');
});
