/* eslint-disable max-len */
/* Air Dolomiti's lead with a picture (parity row 47, brief 456): www's DescritionNews (the in-flight
   entertainment pages) is the picture across the page (600px high, a 10px radius), then 50px under
   it the text in a column (centred, 50vw from 930px): its title 28.08 / 36 px navy (#05164d), 25px
   above the text, the text 19.44 / 33 px grey (#494949). The importer writes it as columns-media
   (news); without a picture, the text as before. Offline: the homepage fixture of
   airdolomiti-herohome.test.mjs.
   Run: node --max-old-space-size=512 --test test/airdolomiti-news-lead-456.test.mjs */
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
// the picture of the fixture's herohome block (one the fixture has)
const heroImage = () => {
  const data = JSON.parse(rendered.match(NEXT)[2]);
  const b = data.props.pageProps.post.blocks.find((x) => x.name === 'lazyblock/herohome');
  return b.attributes.backgroundImage || b.attributes.backgroundimage || b.attributes.image;
};
const withBlocks = (blocks) => rendered.replace(NEXT, (m, open, json, close) => {
  const data = JSON.parse(json);
  data.props.pageProps.post.blocks.push(...blocks);
  return `${open}${JSON.stringify(data)}${close}`;
});

test('lazyblock/description-news with a picture: columns-media (news), the picture, then its title and text', () => {
  const { html } = convert(withBlocks([{ name: 'lazyblock/description-news', attributes: { subtitle: 'In-Flight Entertainment System', description: '<p>Thanks to the valuable collaboration with Lufthansa Systems.</p>', backgroundImage: heroImage() } }]), HOME);
  assert.match(html, /<div class="columns-media news"><div><div><picture>[\s\S]*?<\/picture><\/div><div><h3>In-Flight Entertainment System<\/h3><p>Thanks to the valuable collaboration with Lufthansa Systems\.<\/p><\/div><\/div><\/div>/);
});

test('without a picture: its title and text in the page, as before', () => {
  const { html } = convert(withBlocks([{ name: 'lazyblock/description-news', attributes: { subtitle: 'Assistance', description: '<p>Request it.</p>', backgroundImage: '' } }]), HOME);
  assert.match(html, /<h3>Assistance<\/h3><p>Request it\.<\/p>/);
  assert.ok(!html.includes('columns-media news'));
});

test('the night of 2026-11-10 (AD row 101): without a picture and without a subtitle, the text a columns-media (news) of its own (www\'s DescritionNews text: 19.44 / 33 in its 50vw column)', () => {
  const { html } = convert(withBlocks([{ name: 'lazyblock/description-news', attributes: { subtitle: '', description: '<h2><strong>Unmissable London attractions</strong></h2><p>A visit to London.</p>', backgroundImage: '' } }]), HOME);
  assert.match(html, /<div class="columns-media news"><div><div><h2[^>]*><strong>Unmissable London attractions<\/strong><\/h2><p>A visit to London\.<\/p><\/div><\/div><\/div>/);
});

const css = readFileSync('styles/themes/airdolomiti.css', 'utf8');
const N = 'body.brand-airdolomiti .columns-media.news';
const body = (sel, from = 0) => {
  const i = css.indexOf(`${sel} {`, from);
  assert.ok(i >= 0, `rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};

test('the picture across the page, 600px high with a 10px radius, 50px above the text', () => {
  assert.match(body(`${N} .columns-media-row`), /grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(body(`${N} .columns-media-row > .columns-media-media`), /margin: 0 0 50px;/);
  const img = body(`${N} .columns-media-media :is(picture, img)`);
  assert.match(img, /height: 600px;/);
  assert.match(img, /border-radius: 10px;/);
  assert.match(img, /object-fit: cover;/);
});

test('the text: the title 28.08 / 36 px navy 25px above the text, the text 19.44 / 33 px grey; centred 50vw from 930px', () => {
  const h = body(`${N} .columns-media-text h3`);
  assert.match(h, /margin: 0 0 25px;/);
  assert.match(h, /color: #05164d;/);
  assert.match(h, /font-size: 28\.08px;/);
  assert.match(h, /font-weight: 400;/);
  assert.match(h, /line-height: 36px;/);
  const p = body(`${N} .columns-media-text p`);
  assert.match(p, /color: #494949;/);
  assert.match(p, /font-size: 19\.44px;/);
  assert.match(p, /line-height: 33px;/);
  const m = css.indexOf(`@media (width >= 930px) {\n  ${N} .columns-media-text {`);
  assert.ok(m >= 0, 'the 930px column');
  assert.match(body(`${N} .columns-media-text`, m), /width: 50vw;/);
});
