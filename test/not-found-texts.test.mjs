/* eslint-disable max-len, import/no-unresolved */
/* The brand's own not-found page (brief 342, scripts/not-found-texts.js): on a brand host the 404
   is the brand's, in the language of the path: its title, heading, text and homepage button as the
   brand's www has them (TAP: www.flytap.com's 404 per language version, 2026-11-04), the nav and
   footer of the path's root or language version (else the site's default language), read by
   scripts/not-found.js on the page and by lh-edge (src/not-found.js) before it is sent.
   lh-com (no brand): none, its 404 stays as it is (test/not-found-brand.test.mjs).
   Run: node --max-old-space-size=512 --test test/not-found-texts.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { brandNotFound, notFoundMarkup, NOT_FOUND_TEXTS } from '../scripts/not-found-texts.js';

const TAP_PT = {
  title: '404 Erro | TAP Air Portugal',
  heading: 'Erro 404',
  text: ['Este destino não está disponível', 'Regresse à página inicial e continue a sua viagem.'],
  button: 'Continuar',
};

test('TAP: www.flytap.com\'s 404 of the language version, the root\'s nav, footer and homepage', () => {
  assert.deepEqual(brandNotFound('tap', '/pt-pt/nao-existe'), {
    brand: 'tap',
    lang: 'pt',
    ...TAP_PT,
    home: '/pt-pt',
    meta: {
      brand: 'tap', language: 'pt', nav: '/pt-pt/nav', footer: '/pt-pt/footer',
    },
  });
  const fr = brandNotFound('tap', '/fr-fr/a/b');
  assert.equal(fr.title, '404 Erreur | TAP Air Portugal');
  assert.equal(fr.heading, 'Erreur 404');
  assert.deepEqual(fr.text, ['Cette destination n\'est pas disponible', 'Retournez à la page d\'accueil et poursuivez votre voyage.']);
  assert.equal(fr.button, 'Continuer');
  assert.equal(brandNotFound('tap', '/pl-pl/x').title, '404 Błąd | TAP Air Portugal');
  assert.equal(brandNotFound('tap', '/en-pt/x').button, 'Continue');
});

test('TAP: pt-br its own wording, a market root its language version\'s with its own nav and homepage', () => {
  const br = brandNotFound('tap', '/pt-br/nao-existe');
  assert.deepEqual(br.text, ['Este destino não está disponível', 'Volte para a página inicial e continue sua viagem.']);
  assert.deepEqual(br.meta, {
    brand: 'tap', language: 'pt', nav: '/pt-br/nav', footer: '/pt-br/footer',
  });
  const ch = brandNotFound('tap', '/de-ch/gibt-es-nicht');
  assert.equal(ch.title, '404 Fehler | TAP Air Portugal');
  assert.deepEqual(ch.text, ['Dieses Reiseziel ist nicht verfügbar', 'Kehren Sie zur Startseite zurück und setzen Sie Ihre Reise fort.']);
  assert.equal(ch.button, 'Weiter');
  assert.equal(ch.home, '/de-ch');
  assert.equal(ch.meta.nav, '/de-ch/nav');
  const us = brandNotFound('tap', '/en-us/x');
  assert.equal(us.heading, 'Error 404');
  assert.equal(us.home, '/en-us');
  assert.equal(brandNotFound('tap', '/pt-ao/x').text[1], TAP_PT.text[1], 'pt-ao: pt-pt\'s');
});

test('TAP: a path outside the roots: the site\'s default language (pt-pt)', () => {
  const page = brandNotFound('tap', '/no-such-folder/x');
  assert.equal(page.title, TAP_PT.title);
  assert.equal(page.home, '/pt-pt');
  assert.equal(page.meta.nav, '/pt-pt/nav');
  assert.equal(brandNotFound('tap', '/sitemap-old.xml').lang, 'pt');
});

test('every TAP language version has its texts', () => {
  assert.deepEqual(Object.keys(NOT_FOUND_TEXTS.tap).sort(), ['de-de', 'en-pt', 'es-es', 'fr-fr', 'it-it', 'pl-pl', 'pt-br', 'pt-pt']);
  Object.values(NOT_FOUND_TEXTS.tap).forEach((t) => {
    assert.match(t.title, / \| TAP Air Portugal$/);
    assert.ok(t.heading && t.button && t.text.length === 2, t.title);
  });
});

test('lh-com and unknown brands: none', () => {
  assert.equal(brandNotFound('', '/de/en/x'), null);
  assert.equal(brandNotFound('nosuchbrand', '/x'), null);
  assert.equal(brandNotFound(undefined, '/x'), null);
});

test('notFoundMarkup: the heading, the text and the homepage link (a button), escaped', () => {
  const html = notFoundMarkup(brandNotFound('tap', '/fr-fr/x'));
  assert.equal(html, '<div><h1>Erreur 404</h1><p>Cette destination n&#39;est pas disponible</p><p>Retournez à la page d&#39;accueil et poursuivez votre voyage.</p><p><a href="/fr-fr">Continuer</a></p></div>');
  assert.equal(notFoundMarkup({
    heading: '<b>', text: ['a & b'], home: '/"x', button: 'go',
  }), '<div><h1>&lt;b&gt;</h1><p>a &amp; b</p><p><a href="/&quot;x">go</a></p></div>');
});

test('scripts/not-found.js on a TAP host: the brand\'s page, its title and metadata', async () => {
  const { window, document } = parseHTML('<!DOCTYPE html><html><head><title>Page not found | Lufthansa</title><meta property="og:title" content="Page not found | Lufthansa"><meta name="brand" content="tap"></head><body><header></header><main><div><h1>Page not found</h1></div></main><footer></footer></body></html>');
  window.location = {
    hostname: 'tap.turnsthe.page', pathname: '/it-it/non-esiste', search: '', href: 'https://tap.turnsthe.page/it-it/non-esiste', origin: 'https://tap.turnsthe.page',
  };
  globalThis.window = window;
  globalThis.document = document;
  const nf = await import('../scripts/not-found.js');
  await nf.buildBrandNotFound(document.querySelector('main'));
  assert.equal(document.querySelector('main h1').textContent, 'Errore 404');
  assert.equal(document.querySelector('main a').getAttribute('href'), '/it-it');
  assert.equal(document.querySelector('main a').textContent, 'Continua');
  assert.equal(document.title, '404 Errore | TAP Air Portugal');
  assert.equal(document.querySelector('meta[property="og:title"]').content, '404 Errore | TAP Air Portugal');
  assert.deepEqual(nf.brandPageMeta('/it-it/non-esiste', 'tap'), {
    brand: 'tap', language: 'it', nav: '/it-it/nav', footer: '/it-it/footer',
  });
});

/* The other brands (their www 404 per language, read once each on 2026-11-04 over Bright Data:
   logs/b342/bd-404; Air Dolomiti's directly): sites with <cc>/<ll> roots take the texts of the
   root's language and the root's nav, footer and homepage; a path outside the roots the site's
   first language version's; SWISS's sub-sites their own language's. */
test('brands with <cc>/<ll> roots: the root\'s language and nav, else the first language version', () => {
  assert.deepEqual(brandNotFound('discover', '/de/en/no-such'), {
    brand: 'discover',
    lang: 'en',
    title: 'Page not found | Discover Airlines',
    heading: 'Page not found',
    text: ['There may be a typing error in the link or the page may no longer exist.', 'Please use our navigation to search for an alternative or use the button below to return to the homepage.'],
    button: 'To the homepage',
    home: '/de/en/homepage',
    meta: { brand: 'discover', nav: '/de/en/nav', footer: '/de/en/footer' },
  });
  const usde = brandNotFound('discover', '/us/de/x/y');
  assert.equal(usde.title, 'Seite nicht gefunden | Discover Airlines');
  assert.equal(usde.home, '/us/de/homepage');
  assert.deepEqual(usde.meta, { brand: 'discover', nav: '/us/de/nav', footer: '/us/de/footer' });
  const outside = brandNotFound('discover', '/zz/qq/x');
  assert.equal(outside.home, '/de/en/homepage', 'not a root: the first language version');
  assert.equal(outside.lang, 'en');
  assert.equal(brandNotFound('ita', '/it/en/x').heading, 'Unable to find the page');
  assert.equal(brandNotFound('ita', '/it/en/x').title, 'Page not found | ITA Airways');
  assert.equal(brandNotFound('ita', '/ch/de/x').title, 'Seite nicht gefunden | ITA Airways', 'a market root: its language');
  assert.equal(brandNotFound('ita', '/jp/ja/x').text[0], '申し訳ございません。お探しのページが見つかりませんでした。');
  assert.equal(brandNotFound('austrian', '/ru/ru/x').title, 'Страница не найдена | Austrian Airlines');
  assert.equal(brandNotFound('austrian', '/at/de/x').button, 'Zur Startseite');
  assert.equal(brandNotFound('brussels', '/be/nl/x').heading, 'De pagina kon niet worden gevonden');
  assert.deepEqual(brandNotFound('brussels', '/be/fr/x').text, ['La page demandée n’existe plus ou a été déplacée.']);
  assert.equal(brandNotFound('b2b', '/de/de/x').title, 'Seite nicht gefunden | Lufthansa Group');
  assert.equal(brandNotFound('b2b', '/us/en/x').button, 'To Homepage');
  assert.equal(brandNotFound('swiss', '/ch/pt/x').title, 'A página não foi encontrada | SWISS');
  assert.equal(brandNotFound('swiss', '/ch/zh/x').button, '回到主页');
});

test('SWISS: kr/ko as www (English, no text), its sub-sites their own language\'s nav and homepage', () => {
  const ko = brandNotFound('swiss', '/kr/ko/x');
  assert.equal(ko.title, 'The requested page could not be found | SWISS');
  assert.equal(ko.lang, 'en');
  assert.deepEqual(ko.text, []);
  assert.equal(ko.meta.nav, '/kr/ko/nav');
  const corp = brandNotFound('swiss', '/corporate/de/no-such');
  assert.equal(corp.title, 'Diese Seite ist nicht auffindbar | SWISS');
  assert.equal(corp.home, '/corporate/de/homepage');
  assert.deepEqual(corp.meta, { brand: 'swiss', nav: '/corporate/de/nav', footer: '/corporate/de/footer' });
  assert.equal(brandNotFound('swiss', '/magazine/en/x').home, '/magazine/en');
});

test('sites without roots: Cargo (no button on www), Air Dolomiti (Italian at /)', () => {
  const cargo = brandNotFound('cargo', '/de/no-such');
  assert.equal(cargo.title, 'Diese Webseite ist nicht mehr verfügbar | Lufthansa Cargo');
  assert.equal(cargo.button, undefined);
  assert.deepEqual(cargo.meta, {
    brand: 'cargo', language: 'de', nav: '/de/nav', footer: '/de/footer',
  });
  assert.equal(notFoundMarkup(cargo), '<div><h1>Diese Webseite ist nicht mehr verfügbar</h1><p>Die von Ihnen gesuchte Webseite ist leider nicht mehr verfügbar.</p><p>Vielen Dank!</p></div>');
  assert.equal(brandNotFound('cargo', '/x').lang, 'en');
  const ad = brandNotFound('airdolomiti', '/voli/x');
  assert.equal(ad.title, 'Impossibile trovare la pagina | Air Dolomiti');
  assert.equal(ad.button, 'Torna all’homepage');
  assert.equal(ad.home, '/');
  assert.equal(brandNotFound('airdolomiti', '/en/x').button, 'Back to homepage');
  assert.equal(brandNotFound('airdolomiti', '/de/x').heading, 'Seite konnte nicht gefunden werden');
});

test('every brand has its texts, for every language of its roots', async () => {
  const { BRANDS, BRAND_SITES } = await import('../scripts/brands.js');
  assert.deepEqual(Object.keys(NOT_FOUND_TEXTS).sort(), Object.keys(BRANDS).sort());
  Object.entries(BRAND_SITES).forEach(([brand, site]) => {
    new Set(Object.values(site.rows).map((r) => r.lang)).forEach((ll) => assert.ok(NOT_FOUND_TEXTS[brand][ll], `${brand} ${ll}`));
  });
  const shortName = { b2b: 'Lufthansa Group' };
  Object.entries(NOT_FOUND_TEXTS).forEach(([brand, texts]) => Object.values(texts).forEach((t) => {
    assert.ok(t.title.endsWith(` | ${shortName[brand] || BRANDS[brand].name}`), `${brand} ${t.title}`);
    assert.ok(t.heading && Array.isArray(t.text), `${brand} ${t.title}`);
  }));
});
