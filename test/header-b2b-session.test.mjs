/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The header's Login menu on Lufthansa Group for Business (blocks/header/header-b2b-session.js,
   scripts/brands.js b2b header.session 'b2b'): with session.company or session.experts set
   (GET /service/secured/api/b2bneo/session), the menu's Login item shows the name and, under each
   signed-in side's own heading (the nav's "For Companies", "For Travel Agencies"), the member home
   and Log out (companies: /sso/b2bneo/logout?redirect=https://<host>/<root>/login; eXperts:
   /service/secured/api/experts/logout); signed out, or the session unknown: as today.
   Run: node --max-old-space-size=256 --test test/header-b2b-session.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head></head><body></body></html>');
globalThis.window = window;
globalThis.document = document;
window.location = {
  hostname: 'b2b.turnsthe.page', pathname: '/de/en/homepage', search: '', href: 'https://b2b.turnsthe.page/de/en/homepage', origin: 'https://b2b.turnsthe.page',
};
const { withSession, loadSession } = await import('../blocks/header/header-b2b-session.js');

const a = (href, text) => {
  const x = document.createElement('a');
  x.setAttribute('href', href);
  x.textContent = text;
  return x;
};
const menu = () => [
  {
    label: 'Login',
    link: null,
    groups: [
      { label: 'For Companies', links: [a('https://www.partnerplusbenefit.com/application/de/en/public/start-page.action', 'PartnerPlusBenefit ↗'), a('/de/en/login', 'Lufthansa Group for Business Programm')] },
      { label: 'For Travel Agencies', links: [a('/service/secured/api/experts/login?country=de&language=en', 'eXperts')] },
    ],
  },
  { label: 'News', link: null, groups: [{ label: 'For Companies', links: [a('/de/en/news', 'Newsroom')] }] },
];
const view = (items) => items.map((i) => [i.label, i.groups.map((g) => [g.label, g.links.map((l) => [l.textContent, l.getAttribute('href')])])]);

test('signed out or unknown: the menu as it is', () => {
  assert.deepEqual(view(withSession(menu(), null)), view(menu()));
  assert.deepEqual(view(withSession(menu(), { company: null, experts: null })), view(menu()));
});

test('a company user: the name, the member home and Log out under "For Companies"', () => {
  const items = withSession(menu(), {
    company: {
      firstName: 'Anna', lastName: 'Example', home: '/de/en/home', loginType: 'EXT',
    },
    experts: null,
  });
  assert.deepEqual(view(items)[0], ['Anna Example', [['For Companies', [['Member area', '/de/en/home'], ['Log out', '/sso/b2bneo/logout?redirect=https://b2b.turnsthe.page/de/en/login']]]]]);
  assert.equal(view(items)[1][0], 'News', 'the other items as they are');
});

test('an eXperts agent; both signed in: two groups', () => {
  const ex = withSession(menu(), { company: null, experts: { name: 'Petra', surname: 'Hahn', home: '/de/en/experts-members' } });
  assert.deepEqual(view(ex)[0], ['Petra Hahn', [['For Travel Agencies', [['Member area', '/de/en/experts-members'], ['Log out', '/service/secured/api/experts/logout']]]]]);
  const both = withSession(menu(), { company: { firstName: 'Anna', lastName: 'Example', home: '/de/en/home' }, experts: { name: 'Petra', surname: 'Hahn', home: '/de/en/experts-members' } });
  assert.equal(view(both)[0][0], 'Anna Example');
  assert.deepEqual(view(both)[0][1].map(([g]) => g), ['For Companies', 'For Travel Agencies']);
});

test('the Login item found by its links (www\'s absolute ones too); German texts', () => {
  const items = menu();
  items[0].groups[0].links[1] = a('https://business.lufthansagroup.com/de/de/login', 'Programm');
  items[0].label = 'Anmelden';
  const out = withSession(items, { company: { firstName: 'Anna', lastName: 'Example', home: '/de/de/home' } }, { lang: 'de', root: 'de/de' });
  assert.deepEqual(view(out)[0][1][0][1].map(([t]) => t), ['Mitgliederbereich', 'Abmelden']);
});

test('loadSession: the session JSON; any failure: null', async () => {
  globalThis.fetch = async (url) => {
    assert.equal(String(url), '/service/secured/api/b2bneo/session');
    return new Response(JSON.stringify({ company: { firstName: 'A' }, experts: null }), { headers: { 'content-type': 'application/json' } });
  };
  assert.deepEqual(await loadSession(), { company: { firstName: 'A' }, experts: null });
  globalThis.fetch = async () => new Response('Not found', { status: 404 });
  assert.equal(await loadSession(), null);
  globalThis.fetch = async () => { throw new Error('offline'); };
  assert.equal(await loadSession(), null);
});
