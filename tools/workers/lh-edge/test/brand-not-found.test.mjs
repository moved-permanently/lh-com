/* eslint-disable max-len */
/* The brand's not-found page on its host (brief 342, src/not-found.js): the origin's 404 page
   (the code's 404.html, Lufthansa's title and text) is the brand's before it is sent, as
   scripts/not-found.js makes it on the page (scripts/not-found-texts.js): its title and og:title,
   <html lang>, the brand, nav, footer (and language) metadata of the path's root, the heading,
   text and homepage button; status 404 and the page's scripts as they are. lh-com's hosts (no
   site), other answers, .plain.html and HEAD: untouched, the same response. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brandNotFoundPage } from '../src/not-found.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const PAGE = fs.readFileSync(path.join(root, '404.html'), 'utf8');
const notFound = (body = PAGE, headers = {}) => new Response(body, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8', 'x-lh-edge-route': 'site', ...headers } });
const req = (p, method = 'GET') => new Request(`https://tap.turnsthe.page${p}`, { method });
const TAP = { name: 'tap' };

test('TAP: the 404 of the path\'s root in its language, the brand\'s title and metadata', async () => {
  const resp = await brandNotFoundPage(notFound(), req('/pt-pt/nao-existe'), TAP);
  assert.equal(resp.status, 404);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'site');
  const html = await resp.text();
  assert.match(html, /<html lang="pt">/);
  assert.match(html, /<title>404 Erro \| TAP Air Portugal<\/title>/);
  assert.match(html, /<meta property="og:title" content="404 Erro \| TAP Air Portugal">/);
  assert.doesNotMatch(html, /Lufthansa/);
  assert.match(html, /<meta name="brand" content="tap"><meta name="language" content="pt"><meta name="nav" content="\/pt-pt\/nav"><meta name="footer" content="\/pt-pt\/footer">\s*<\/head>/);
  assert.match(html, /<main><div><h1>Erro 404<\/h1><p>Este destino não está disponível<\/p><p>Regresse à página inicial e continue a sua viagem\.<\/p><p><strong><a href="\/pt-pt">Continuar<\/a><\/strong><\/p><\/div><\/main>/);
  assert.match(html, /window\.isErrorPage = true;/, 'the page\'s scripts as they are');
  assert.match(html, /<script nonce="aem" src="\/scripts\/not-found\.js" type="module"><\/script>/);
});

test('TAP: a market root (its language version\'s wording, its own nav), pt-br, a path outside the roots', async () => {
  const ch = await (await brandNotFoundPage(notFound(), req('/de-ch/gibt-es-nicht'), TAP)).text();
  assert.match(ch, /<title>404 Fehler \| TAP Air Portugal<\/title>/);
  assert.match(ch, /<meta name="nav" content="\/de-ch\/nav">/);
  assert.match(ch, /<a href="\/de-ch">Weiter<\/a>/);
  const br = await (await brandNotFoundPage(notFound(), req('/pt-br/x'), TAP)).text();
  assert.match(br, /Volte para a página inicial e continue sua viagem\./);
  const none = await (await brandNotFoundPage(notFound(), req('/no-such-folder'), TAP)).text();
  assert.match(none, /<meta name="nav" content="\/pt-pt\/nav">/);
  assert.match(none, /<title>404 Erro \| TAP Air Portugal<\/title>/);
});

test('the other brands: a <cc>/<ll> root (no language row), a site without roots, Cargo without a button', async () => {
  const at = (host, p) => new Request(`https://${host}.turnsthe.page${p}`);
  const disc = await (await brandNotFoundPage(notFound(), at('discover', '/us/de/gibt-es-nicht'), { name: 'discover' })).text();
  assert.match(disc, /<html lang="de">/);
  assert.match(disc, /<title>Seite nicht gefunden \| Discover Airlines<\/title>/);
  assert.match(disc, /<meta name="brand" content="discover"><meta name="nav" content="\/us\/de\/nav"><meta name="footer" content="\/us\/de\/footer">\s*<\/head>/);
  assert.match(disc, /<p><strong><a href="\/us\/de\/homepage">Zur Startseite<\/a><\/strong><\/p>/);
  const swiss = await (await brandNotFoundPage(notFound(), at('swiss', '/ch/fr/x'), { name: 'swiss' })).text();
  assert.match(swiss, /<title>La page que vous avez demandée n’a pas pu être trouvée \| SWISS<\/title>/);
  const ad = await (await brandNotFoundPage(notFound(), at('airdolomiti', '/en/x'), { name: 'airdolomiti' })).text();
  assert.match(ad, /<meta name="language" content="en">/);
  assert.match(ad, /<p><a href="\/en\/">Back to homepage<\/a><\/p>/);
  const cargo = await (await brandNotFoundPage(notFound(), at('cargo', '/de/x'), { name: 'cargo' })).text();
  assert.match(cargo, /<main><div><h1>Diese Webseite ist nicht mehr verfügbar<\/h1><p>Die von Ihnen gesuchte Webseite ist leider nicht mehr verfügbar\.<\/p><p>Vielen Dank!<\/p><\/div><\/main>/);
});

test('untouched: lh-com\'s hosts, an unknown brand, other statuses, other types, .plain.html, HEAD, another 404 body', async () => {
  const same = async (resp, request, site) => assert.ok(await brandNotFoundPage(resp, request, site) === resp);
  await same(notFound(), req('/de/en/x'), null);
  await same(notFound(), req('/x'), { name: 'nosuchbrand' });
  await same(new Response(PAGE, { status: 200, headers: { 'content-type': 'text/html' } }), req('/pt-pt'), TAP);
  await same(notFound('{}', { 'content-type': 'application/json' }), req('/pt-pt/x.json'), TAP);
  await same(notFound(), req('/pt-pt/x.plain.html'), TAP);
  await same(new Response(null, { status: 404, headers: { 'content-type': 'text/html' } }), req('/pt-pt/x', 'HEAD'), TAP);
  const other = await brandNotFoundPage(notFound('<html><head><title>Not Found</title></head><body>gone</body></html>'), req('/pt-pt/x'), TAP);
  assert.equal(other.status, 404);
  assert.equal(await other.text(), '<html><head><title>Not Found</title></head><body>gone</body></html>', 'not the code\'s 404 page: as it is');
});
