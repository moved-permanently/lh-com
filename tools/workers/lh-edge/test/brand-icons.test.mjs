/* eslint-disable max-len */
/* The brand's favicon and manifest on its host (src/brand-icons.js, scripts/brand.js brandIcons):
   on an HTML answer of a site host the head's icon and manifest links point at the brand's files
   (a brand without a manifest: the link goes), before the first paint; .plain.html, non-HTML,
   lh-com's hosts (no site) untouched, no rewriter. */
import test from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import { rewriteBrandIcons } from '../src/brand-icons.js';

globalThis.HTMLRewriter = HTMLRewriter;
const PAGE = `<!DOCTYPE html><html><head><title>x</title>
<link rel="manifest" href="/etc/designs/dcep/manifest.json">
<link rel="shortcut icon" href="/etc/designs/dcep/favicon.ico" type="image/ico">
<link rel="stylesheet" href="/styles/styles.css">
</head><body><link rel="icon" href="/body-icon.png"></body></html>`;
const html = () => new Response(PAGE, { headers: { 'content-type': 'text/html; charset=utf-8' } });
const req = (path = '/it/en/homepage') => new Request(`https://ita.turnsthe.page${path}`);

test('a brand host: the brand\'s icon and manifest', async () => {
  const out = await rewriteBrandIcons(html(), req(), { name: 'ita' }).text();
  assert.match(out, /<link rel="manifest" href="\/etc\/designs\/ita\/manifest\.json">/);
  assert.match(out, /<link rel="shortcut icon" href="\/etc\/designs\/ita\/favicon\.ico" type="image\/ico">/);
  assert.match(out, /<link rel="stylesheet" href="\/styles\/styles\.css">/);
  assert.match(out, /<body><link rel="icon" href="\/body-icon\.png">/, 'the body untouched');
});

test('a brand without a manifest on www: the link goes', async () => {
  const out = await rewriteBrandIcons(html(), req('/de/en/homepage'), { name: 'discover' }).text();
  assert.doesNotMatch(out, /rel="manifest"/);
  assert.match(out, /<link rel="shortcut icon" href="\/etc\/designs\/four_y\/favicon\.ico"/);
});

test('no site (lh-com), .plain.html, non-HTML: the same response, no rewriter', async () => {
  const r = html();
  assert.ok(rewriteBrandIcons(r, req(), null) === r);
  const plain = html();
  assert.ok(rewriteBrandIcons(plain, req('/it/en/homepage.plain.html'), { name: 'ita' }) === plain);
  const json = new Response('{}', { headers: { 'content-type': 'application/json' } });
  assert.ok(rewriteBrandIcons(json, req('/x.json'), { name: 'ita' }) === json);
  const unknown = html();
  assert.ok(rewriteBrandIcons(unknown, req(), { name: 'nosuchbrand' }) === unknown, 'a site without a brand entry');
});
