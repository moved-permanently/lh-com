/* eslint-disable max-len, import/extensions, import/no-relative-packages, import/no-extraneous-dependencies -- dev tooling; js-yaml is a dev dependency */
/* Lufthansa Cargo's Spanish, French, Italian and Portuguese pages (brief 414: the user's harness
   imported www's /<ll>/ci/... pages, eFreight and the imprint, their nav and footer: 61 documents
   on lh-cargo's preview; www keeps their homepage, /<ll>/home, where their nav's logo leads).
   Behind one switch, CARGO_LIVE_LANGUAGES (scripts/site-languages.js, empty until the user
   publishes them):
   - SITE_LANGUAGES.cargo has them (their pages take their locale and switch to en / de), listed in
     the header's switch and in the sitemaps only once on;
   - lh-edge's entry paths /<ll> and /<ll>/ (302 to www's /<ll>/home) only once on;
   - their own indexes (helix-query.yaml search-brand-<ll>) by their folders, so no other site's
     /es/es, /fr/fr ... root fills them; lh-cargo.json's nav and footer pattern; cargo-nav.mjs's labels.
   Run: node --max-old-space-size=512 --test test/cargo-languages.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import {
  SITE_LANGUAGES, CARGO_LANGUAGES, CARGO_LIVE_LANGUAGES, cargoLanguages, languageSwitch, languageOfPath,
} from '../scripts/site-languages.js';
import { brandSiteLocale } from '../scripts/locale.js';
import { cargoEntry, PLAIN_SITES } from '../tools/workers/lh-edge/src/sites.js';
import { LABELS, SEARCH, linksOf } from '../tools/importer/cargo-nav.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NEW = ['es', 'fr', 'it', 'pt'];
const WWW = 'https://www.lufthansa-cargo.com';

test('SITE_LANGUAGES.cargo: en and de, then es, fr, it, pt (their homepage on www), off: not listed', () => {
  assert.deepEqual(CARGO_LIVE_LANGUAGES, [], 'off until the user publishes them');
  assert.deepEqual(CARGO_LANGUAGES.map(([l]) => l), NEW);
  const { cargo } = SITE_LANGUAGES;
  assert.deepEqual(cargo.map((l) => l.lang), ['en', 'de', ...NEW]);
  assert.deepEqual(cargo[0], {
    lang: 'en', path: '/en/', home: '/en/home', name: 'English',
  });
  assert.deepEqual(cargo[2], {
    lang: 'es', path: '/es/', home: `${WWW}/es/home`, name: 'Español', listed: false,
  });
  assert.deepEqual(cargo.slice(2).map((l) => l.name), ['Español', 'Français', 'Italiano', 'Português']);
  // on: listed
  const on = cargoLanguages(['es', 'pt']);
  assert.equal(on.find((l) => l.lang === 'es').listed, undefined);
  assert.equal(on.find((l) => l.lang === 'fr').listed, false);
  assert.equal(languageOfPath('/it/ci/social', cargo).lang, 'it');
});

test('a Spanish page: its locale Spanish; the switch offers English and German (the same path), the new languages only once on', () => {
  const read = (n) => ({ brand: 'cargo', language: 'es' }[n] || '');
  const locale = brandSiteLocale('', read, '/es/ci/social');
  assert.equal(locale.lang, 'es');
  assert.equal(locale.siteLanguages, SITE_LANGUAGES.cargo);
  const { links } = languageSwitch([], '/es/ci/social', 'es', SITE_LANGUAGES.cargo);
  assert.deepEqual(links.map((l) => [l.lang, l.counterpart]), [['en', '/en/ci/social'], ['de', '/de/ci/social']]);
  const en = languageSwitch([], '/en/ci/social', 'en', SITE_LANGUAGES.cargo).links;
  assert.deepEqual(en.map((l) => l.lang), ['de'], 'off: not offered');
  const live = languageSwitch([], '/en/ci/social', 'en', cargoLanguages(['es'])).links;
  assert.deepEqual(live.map((l) => [l.lang, l.counterpart, l.home]), [['de', '/de/ci/social', '/de/home'], ['es', '/es/ci/social', `${WWW}/es/home`]]);
});

test('lh-edge: Cargo\'s entry paths as before while off; on: /<ll> and /<ll>/ to www\'s /<ll>/home', () => {
  const before = {
    '/': '/en/home', '/en': '/en/home', '/en/': '/en/home', '/de': '/de/home', '/de/': '/de/home',
  };
  assert.deepEqual(cargoEntry(), before);
  assert.deepEqual(PLAIN_SITES.cargo.entry, before);
  assert.deepEqual(cargoEntry(['es', 'it']), {
    ...before, '/es': `${WWW}/es/home`, '/es/': `${WWW}/es/home`, '/it': `${WWW}/it/home`, '/it/': `${WWW}/it/home`,
  });
});

const { indices } = yaml.load(fs.readFileSync(path.join(root, 'helix-query.yaml'), 'utf8'));
const globRe = (g) => new RegExp(`^${g.split('/').map((s) => (s === '**' ? '.*' : s.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*'))).join('/').replace(/\/\.\*$/, '(/.*)?')}$`);
const covers = (index, p) => index.include.some((g) => globRe(g).test(p)) && !(index.exclude || []).some((g) => globRe(g).test(p));
const pathsOf = (site) => JSON.parse(fs.readFileSync(path.join(root, `tools/importer/sites/${site}.json`), 'utf8')).paths;

test('helix-query.yaml: an index per new language, its pages in it (nav and footer out), no other site\'s page in any', () => {
  const cargo = pathsOf('lh-cargo');
  NEW.forEach((l) => {
    const index = indices[`search-brand-${l}`];
    assert.ok(index, l);
    assert.equal(index.target, `/${l}/search-index.json`);
    ['title', 'description', 'headings', 'content', 'hide-in-search', 'lastModified'].forEach((c) => assert.ok(c in index.properties, `${l}: ${c}`));
    const mine = cargo.filter((p) => p.startsWith(`/${l}/`));
    assert.ok(mine.length >= 15, l);
    mine.forEach((p) => assert.equal(covers(index, p), !/\/(nav|footer)$/.test(p), p));
    ['lh-com', 'lh-ita', 'lh-austrian', 'lh-discover', 'lh-brussels', 'lh-swiss', 'lh-airdolomiti', 'lh-b2b', 'lh-tap'].forEach((site) => {
      pathsOf(site).forEach((p) => assert.ok(!covers(index, p), `${site}${p} in search-brand-${l}`));
    });
  });
});

test('lh-cargo.json: the nav and footer of every language by pattern, the search pages only en and de', () => {
  const { patterns } = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/sites/lh-cargo.json'), 'utf8'));
  const allowed = (p) => patterns.some((r) => new RegExp(r).test(p));
  ['en', 'de', ...NEW].forEach((l) => ['nav', 'footer'].forEach((d) => assert.ok(allowed(`/${l}/${d}`), `/${l}/${d}`)));
  assert.ok(allowed('/en/search') && allowed('/de/search'));
  NEW.forEach((l) => assert.ok(!allowed(`/${l}/search`), `/${l}/search`));
});

test('cargo-nav.mjs: labels for every language (www\'s quick links, login and cookies as the harness took them), links to the site\'s en pages where the language has none', () => {
  assert.deepEqual(Object.keys(LABELS), ['en', 'de', ...NEW]);
  assert.deepEqual(Object.keys(SEARCH), ['en', 'de', ...NEW]);
  assert.deepEqual(['es', 'fr', 'it', 'pt'].map((l) => [LABELS[l].book, LABELS[l].track, LABELS[l].schedule]), [
    ['Reserva', 'Seguimiento', 'Horario'], ['Réserver', 'Suivre', 'Calendrier'], ['Prenotazioni', 'Tracking', 'Schedulato'], ['Reservar', 'Rastreamento de AWBs', 'Programação de Voos'],
  ]);
  assert.deepEqual(NEW.map((l) => LABELS[l].login), ['Login', 'Authentification', 'Accesso', 'Autenticação']);
  NEW.forEach((l) => {
    ['logo', 'menu', 'other', 'cookies'].forEach((k) => assert.ok(LABELS[l][k], `${l} ${k}`));
    assert.ok(SEARCH[l].bell && SEARCH[l].search, l);
    assert.notEqual(LABELS[l].logo, LABELS.en.logo, `${l}: the logo's alt in its language`);
    assert.deepEqual(linksOf(l), {
      home: `${WWW}/${l}/home`, bell: '/en/notification-overview', search: '/en/search?query=', other: '/en/home', ownSearch: false,
    });
  });
  assert.deepEqual(linksOf('de'), {
    home: '/de/home', bell: '/de/notification-overview', search: '/de/search?query=', other: '/en/home', ownSearch: true,
  });
});
