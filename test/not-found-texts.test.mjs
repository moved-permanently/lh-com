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
