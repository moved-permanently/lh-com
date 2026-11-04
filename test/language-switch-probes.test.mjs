/* The language switch on the sites without <cc>/<ll> roots, without guesses that cannot work
   (scripts/site-languages.js, blocks/header): Air Dolomiti's languages have their own slugs (its
   search indexes, 2026-11-01: Italian, English and German share none), so a page's same path in
   another language never exists and is not probed (airdolomiti.turnsthe.page/iscrizione-newsletter
   sent HEAD /en/iscrizione-newsletter and /de/iscrizione-newsletter, 404, on every load): the
   switch goes to that language's homepage. A page can name its counterparts in its metadata
   (`Alternate en | /en/newsletter-subscription`): taken as they are, no probe, on both sites.
   Cargo (136 shared slugs of English and German) keeps the probe of the same path.
   Run: node --max-old-space-size=512 --test test/language-switch-probes.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  SITE_LANGUAGES, counterpartPath, languageSwitch, switchTarget,
} from '../scripts/site-languages.js';

const AD = SITE_LANGUAGES.airdolomiti;
const CARGO = SITE_LANGUAGES.cargo;
const [it, adEn, adDe] = AD;
const [en, de] = CARGO;
const probe = () => {
  const calls = [];
  const exists = async (p) => {
    calls.push(p);
    return true;
  };
  return { calls, exists };
};
const targets = async (switchResult, exists) => Promise.all(switchResult.links
  .map(async (l) => [l.lang, await switchTarget(l, exists)]));

test('Air Dolomiti: no same-path counterpart (own slugs); homepages to homepages as before', () => {
  assert.equal(counterpartPath('/iscrizione-newsletter', it, adEn), null);
  assert.equal(counterpartPath('/iscrizione-newsletter', it, adDe), null);
  assert.equal(counterpartPath('/en/newsletter-subscription', adEn, it), null);
  assert.equal(counterpartPath('/de/newsletter-anmeldung', adDe, adEn), null);
  assert.equal(counterpartPath('/', it, adEn), '/en/');
  assert.equal(counterpartPath('/en/', adEn, it), '/');
});

test('Air Dolomiti: the switch goes to the homepages without a probe', async () => {
  const { calls, exists } = probe();
  const s = languageSwitch([], '/iscrizione-newsletter', 'it', AD);
  assert.deepEqual(await targets(s, exists), [['en', '/en/'], ['de', '/de/']]);
  assert.deepEqual(calls, [], 'no HEAD requests');
});

test('a page\'s Alternate metadata: its counterparts as they are, no probe (both sites)', async () => {
  const { calls, exists } = probe();
  const s = languageSwitch([], '/iscrizione-newsletter', 'it', AD, { en: '/en/newsletter-subscription' });
  assert.deepEqual(await targets(s, exists), [['en', '/en/newsletter-subscription'], ['de', '/de/']]);
  const c = languageSwitch([], '/en/contact-us', 'en', CARGO, { de: '/de/kontakt' });
  assert.deepEqual(await targets(c, exists), [['de', '/de/kontakt']]);
  assert.deepEqual(calls, []);
});

test('Cargo: the same path in the other language, probed as before', async () => {
  const { calls, exists } = probe();
  assert.equal(counterpartPath('/en/speed-flash', en, de), '/de/speed-flash');
  const s = languageSwitch([], '/en/speed-flash', 'en', CARGO);
  assert.deepEqual(await targets(s, exists), [['de', '/de/speed-flash']]);
  assert.deepEqual(calls, ['/de/speed-flash']);
});

test('header.js: the Alternate rows of the page\'s metadata go to the switch', () => {
  const src = fs.readFileSync('blocks/header/header.js', 'utf8');
  // through switchAlternates since parity.md F4 (by language, and by root on a site with countries)
  assert.match(src, /switchAlternates\(locale\.siteLanguages \|\| \[\], getMetadata\)/);
  assert.match(fs.readFileSync('scripts/site-languages.js', 'utf8'), /read\(`alternate-\$\{k\}`\)/);
  assert.match(src, /languageSwitch\(navTools, pathname, locale\.lang, locale\.siteLanguages, alternates\)/);
});
