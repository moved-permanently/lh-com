/* eslint-disable max-len */
/* The header's language switch of a brand site without <cc>/<ll> roots (scripts/site-languages.js,
   blocks/header): per other language the counterpart page (the same path under its prefix) when the
   site has it, else that language's homepage; the nav's link to another language's homepage (Cargo's
   "Deutsch") is that language's entry. Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SITE_LANGUAGES, siteLanguagesOf, languageOfPath, counterpartPath, languageSwitch, switchTarget,
} from '../scripts/site-languages.js';

const CARGO = SITE_LANGUAGES.cargo;
const AD = SITE_LANGUAGES.airdolomiti;
const [en, de] = CARGO;
const [it, adEn, adDe] = AD;

test('siteLanguagesOf: the brand sites without roots only', () => {
  assert.equal(siteLanguagesOf((n) => (n === 'brand' ? 'cargo' : '')), CARGO);
  assert.equal(siteLanguagesOf((n) => (n === 'brand' ? ' AirDolomiti ' : '')), AD);
  ['', 'discover', 'ita', 'toString'].forEach((b) => assert.equal(siteLanguagesOf(() => b), null, b));
});

test('languageOfPath and counterpartPath: the same slug under the other prefix, homepage to homepage', () => {
  assert.equal(languageOfPath('/en/speed-flash', CARGO), en);
  assert.equal(languageOfPath('/de', CARGO), de);
  assert.equal(languageOfPath('/x', CARGO), null);
  assert.equal(languageOfPath('/voli', AD), it);
  assert.equal(languageOfPath('/en/flights', AD), adEn);
  assert.equal(counterpartPath('/en/speed-flash', en, de), '/de/speed-flash');
  assert.equal(counterpartPath('/en/home', en, de), '/de/home');
  assert.equal(counterpartPath('/en', en, de), '/de/home');
  assert.equal(counterpartPath('/de/ci/security', de, en), '/en/ci/security');
  assert.equal(counterpartPath('/', it, adEn), '/en/');
  assert.equal(counterpartPath('/voli/monaco', it, adDe), '/de/voli/monaco');
  assert.equal(counterpartPath('/en/', adEn, it), '/');
  assert.equal(counterpartPath('/en/flights', adEn, it), '/flights');
  assert.equal(counterpartPath('/x/y', en, de), null, 'not under the language\'s prefix');
});

test('languageSwitch: the nav\'s "Deutsch" link is the German entry (its label kept), other tools stay', () => {
  const tools = [
    { href: '/en/support-and-contact', label: 'Support & Contact', icon: 'help' },
    { href: '/de/home', label: 'Deutsch' },
    { href: 'https://www.lufthansa-cargo.com/en/home?p_p_id=login', label: 'Login', role: 'login' },
  ];
  const s = languageSwitch(tools, '/en/speed-flash', 'en', CARGO);
  assert.deepEqual(s.links, [{
    lang: 'de', label: 'Deutsch', home: '/de/home', counterpart: '/de/speed-flash',
  }]);
  assert.deepEqual(s.tools.map((t) => t.label), ['Support & Contact', 'Login']);
  const back = languageSwitch([{ href: '/en/home', label: 'English' }], '/de/speed-flash', 'de', CARGO);
  assert.deepEqual(back.links.map((l) => [l.label, l.counterpart]), [['English', '/en/speed-flash']]);
});

test('languageSwitch: without authored links every other language with its own name (Air Dolomiti)', () => {
  const s = languageSwitch([{ href: '/contatti', label: 'Contatti' }], '/voli', 'it', AD);
  assert.deepEqual(s.links.map((l) => [l.lang, l.label, l.home, l.counterpart]), [['en', 'English', '/en/', '/en/voli'], ['de', 'Deutsch', '/de/', '/de/voli']]);
  assert.equal(s.tools.length, 1);
  const home = languageSwitch([], '/en/', 'en', AD);
  assert.deepEqual(home.links.map((l) => [l.lang, l.counterpart]), [['it', '/'], ['de', '/de/']]);
});

test('switchTarget: the counterpart when the site has it, else the homepage', async () => {
  const link = { home: '/de/home', counterpart: '/de/speed-flash' };
  assert.equal(await switchTarget(link, async () => true), '/de/speed-flash');
  assert.equal(await switchTarget(link, async () => false), '/de/home');
  assert.equal(await switchTarget(link, async () => { throw new Error('offline'); }), '/de/home');
  let asked = 0;
  assert.equal(await switchTarget({ home: '/de/home', counterpart: '/de/home' }, async () => { asked += 1; return true; }), '/de/home');
  assert.equal(await switchTarget({ home: '/de/home', counterpart: null }, async () => { asked += 1; return true; }), '/de/home');
  assert.equal(asked, 0, 'no request for a homepage or an unknown counterpart');
});
