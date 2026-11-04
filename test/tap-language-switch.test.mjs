/* eslint-disable max-len */
/* TAP's language switch per root (tools/reports/tap/parity.md F4; brief 330): a site whose
   languages name a country reads the page's folder-keyed `Alternate <ll>-<cc>` rows first, the
   language-keyed `Alternate <lang>` only for that language's first listed root (pt for pt-pt, en
   for en-pt), so two roots of one language (pt-pt, pt-br; en-pt, en-us) each get their own
   counterpart; a market root and its language version share their slugs (en-us/help ↔
   en-pt/help); the nav's own language link stays as the nav tool writes it (pt-br's English:
   en-br on www). The other sites (Cargo, Air Dolomiti: language-keyed only) as before.
   Run: node --max-old-space-size=512 --test test/tap-language-switch.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  tapLanguages, languageSwitch, switchAlternates, SITE_LANGUAGES,
} from '../scripts/site-languages.js';

const byHome = (links) => Object.fromEntries(links.map((l) => [l.home, l.alternate || l.counterpart || null]));
// pt-pt/ajuda's rows as tap-import writes them (Alternate <ll>-<cc> per root, Alternate <lang> for the switch's root)
const PT_PT = {
  'alternate-de': '/de-de/hilfe', 'alternate-de-de': '/de-de/hilfe', 'alternate-en': '/en-pt/help', 'alternate-en-pt': '/en-pt/help', 'alternate-pt-br': '/pt-br/ajuda',
};
const read = (rows) => (name) => rows[name] || '';

test('switchAlternates: the page\'s rows by root and by language, for every root of the site', () => {
  const rows = tapLanguages(['pt-br', 'en-us']);
  assert.deepEqual(switchAlternates(rows, read(PT_PT)), {
    de: '/de-de/hilfe', 'de-de': '/de-de/hilfe', en: '/en-pt/help', 'en-pt': '/en-pt/help', 'pt-br': '/pt-br/ajuda',
  });
  // a site without countries: by language, as the header read them
  assert.deepEqual(switchAlternates(SITE_LANGUAGES.airdolomiti, read({ 'alternate-en': '/en/x', 'alternate-de': '/de/x' })), { en: '/en/x', de: '/de/x' });
});

test('pt-pt shows pt-br\'s counterpart (folder-keyed); en-pt its own; a second root of a language not the language\'s row', () => {
  const rows = tapLanguages(['pt-br', 'en-us']);
  const { links } = languageSwitch([], '/pt-pt/ajuda', 'pt', rows, switchAlternates(rows, read(PT_PT)));
  const targets = byHome(links);
  assert.equal(targets['/pt-br'], '/pt-br/ajuda');
  assert.equal(targets['/en-pt'], '/en-pt/help');
  assert.equal(targets['/de-de'], '/de-de/hilfe');
  assert.equal(targets['/en-us'], null, 'en-us: no row of its own, not Alternate en (en-pt\'s)');
});

test('pt-br shows pt-pt by its rows; the nav\'s English (en-br on www) stays its tool as the nav tool writes it', () => {
  const rows = tapLanguages(['pt-br']);
  const tools = [{ href: 'https://www.flytap.com/en-br', label: 'English' }, { href: '/pt-br/ajuda', label: 'Ajuda', role: 'help' }];
  const sw = languageSwitch(tools, '/pt-br/ajuda', 'pt', rows, switchAlternates(rows, read({ 'alternate-pt': '/pt-pt/ajuda', 'alternate-pt-pt': '/pt-pt/ajuda', 'alternate-en-pt': '/en-pt/help' })));
  assert.equal(byHome(sw.links)['/pt-pt'], '/pt-pt/ajuda');
  assert.equal(byHome(sw.links)['/en-pt'], '/en-pt/help');
  assert.ok(sw.tools.some((t) => t.href === 'https://www.flytap.com/en-br'), 'the nav\'s English link kept');
  assert.ok(!sw.links.some((l) => l.home === '/pt-br'), 'not itself');
});

test('a market root and its language version share their slugs: en-us/help ↔ en-pt/help, de-ch/hilfe ↔ de-de/hilfe', () => {
  const rows = tapLanguages(['en-us', 'de-ch']);
  const fromUs = byHome(languageSwitch([], '/en-us/help', 'en', rows, {}).links);
  assert.equal(fromUs['/en-pt'], '/en-pt/help');
  assert.equal(fromUs['/pt-pt'], null, 'another language: its row or its homepage');
  const fromPt = byHome(languageSwitch([], '/en-pt/help', 'en', rows, {}).links);
  assert.equal(fromPt['/en-us'], '/en-us/help');
  const fromCh = byHome(languageSwitch([], '/de-ch/hilfe', 'de', rows, {}).links);
  assert.equal(fromCh['/de-de'], '/de-de/hilfe');
  // a page the root lacks on www (markets.json lacks): its homepage, no probe
  assert.equal(byHome(languageSwitch([], '/en-pt/bookings/gift-card', 'en', rows, {}).links)['/en-us'], null);
  assert.equal(languageSwitch([], '/en-pt/bookings/gift-card', 'en', rows, {}).links.find((l) => l.home === '/en-us').counterpart, null);
  // homepages to homepages
  assert.equal(byHome(languageSwitch([], '/en-us', 'en', rows, {}).links)['/en-pt'], '/en-pt');
});

test('the other sites as before: Air Dolomiti\'s language-keyed rows', () => {
  const rows = SITE_LANGUAGES.airdolomiti;
  const { links } = languageSwitch([], '/iscrizione-newsletter', 'it', rows, { en: '/en/newsletter-subscription' });
  assert.equal(links.find((l) => l.lang === 'en').alternate, '/en/newsletter-subscription');
});
