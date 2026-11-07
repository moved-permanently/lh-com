/* eslint-disable max-len */
/* Air Dolomiti's posts (the parity sweep after brief 470, row 59 of tools/reports/airdolomiti/parity.md):
   WordPress puts a picture inside a heading ("<h2><img …><strong>The Frasassi Caves: a world beneath
   our feet</strong></h2>", the Ancona post in it, en and de); www shows it as a picture across the
   column above the heading. The importer writes the picture as a paragraph of its own before the
   heading, the heading only its text (in the heading the picture was a 20 px inline image).
   Offline: the homepage fixture of airdolomiti-herohome.test.mjs.
   Run: node --max-old-space-size=512 --test test/airdolomiti-heading-image-471.test.mjs */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURE = fileURLToPath(new URL('./fixtures/airdolomiti-herohome/', import.meta.url));
const SITE = fileURLToPath(new URL('../content-sites/lh-airdolomiti/', import.meta.url));
const EXISTS = JSON.parse(fs.readFileSync(path.join(FIXTURE, 'exists.json'), 'utf8'));
const { readFileSync, existsSync, openSync } = fs;
const siteFile = (p) => (typeof p === 'string' && p.startsWith(SITE) ? path.relative(SITE, p) : null);
fs.readFileSync = (p, ...rest) => (siteFile(p) === null ? readFileSync(p, ...rest) : readFileSync(path.join(FIXTURE, siteFile(p)), ...rest));
fs.existsSync = (p) => (siteFile(p) === null ? existsSync(p) : EXISTS[siteFile(p)] === true);
fs.openSync = (p, ...rest) => (siteFile(p) === null ? openSync(p, ...rest) : openSync(path.join(FIXTURE, siteFile(p)), ...rest));
after(() => {
  fs.readFileSync = readFileSync;
  fs.existsSync = existsSync;
  fs.openSync = openSync;
});

// eslint-disable-next-line import/extensions
const { convert } = await import('../tools/importer/airdolomiti-import.mjs');
const HOME = 'https://www.airdolomiti.eu/';
const rendered = readFileSync(path.join(FIXTURE, 'snapshots/www.airdolomiti.eu/index.html'), 'utf8');
const NEXT = /(<script id="__NEXT_DATA__" type="application\/json"[^>]*>)([\s\S]*?)(<\/script>)/;
const withBlocks = (blocks) => rendered.replace(NEXT, (m, open, json, close) => {
  const data = JSON.parse(json);
  data.props.pageProps.post.blocks = blocks;
  return `${open}${JSON.stringify(data)}${close}`;
});

test('row 59: a picture inside a post\'s heading as its own paragraph before the heading; the heading its text only', () => {
  const content = '<h1>Ancona: sea and mountains</h1><p>The beaches of elegant <strong>Sirolo</strong>.</p><h2><img class="alignnone wp-image-37930 size-full" src="https://cms.airdolomiti.it/wp-content/uploads/2026/04/iStock-904359012-scaled-e1776170299831.jpg" alt="" width="2560" height="1408"><strong>The Frasassi Caves: a world beneath our feet</strong></h2><p>Head inland for an hour.</p>';
  const { html } = convert(withBlocks([{ name: 'lazyblock/html-content', attributes: { content } }]), HOME);
  const h = html.match(/<h2>([\s\S]*?)<\/h2>/);
  assert.ok(h, 'the heading');
  assert.ok(!/<img|<picture/.test(h[1]), `no picture in the heading: ${h[0]}`);
  assert.ok(/The Frasassi Caves: a world beneath our feet/.test(h[1]), 'its text');
  const before = html.slice(0, html.indexOf(h[0]));
  assert.ok(/<p>(?:<picture>[\s\S]*?<\/picture>|<img[^>]*>|<a [^>]*>[^<]*<\/a>)<\/p>$/.test(before), `the picture's own paragraph right before it: ${before.slice(-400)}`);
  assert.ok(/iStock-904359012|media/.test(before.slice(-600)), 'the post\'s picture');
});

test('row 59: a heading without a picture as before', () => {
  const { html } = convert(withBlocks([{ name: 'lazyblock/html-content', attributes: { content: '<h1>Ancona: sea and mountains</h1><h2><strong>A city to go back to</strong></h2><p>Ancona.</p>' } }]), HOME);
  assert.ok(/<h2>(<strong>)?A city to go back to(<\/strong>)?<\/h2><p>Ancona\.<\/p>/.test(html), html.slice(0, 500));
});
