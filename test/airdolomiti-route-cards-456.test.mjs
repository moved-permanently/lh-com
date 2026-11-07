/* eslint-disable max-len */
/* Air Dolomiti's route cards (parity row 55, brief 456): www's select-flight-list (flights to
   Europe, the destinations' "flights from" lists) is CardPromo, grey cards with the route over its
   picture's place: phones a row that scrolls sideways of 250 x 400 px cards (the route 40px 24px
   in, the picture the lower half); from 930px a grid 20px apart, two a row, three from 1230px, of
   cards 140px high with the picture the left 30% and the route 16px after it; the route 20 / 26 px
   navy, underlined; on hover (930px on) white with a shadow. The importer writes the block as
   cards-teaser (three-up, routes); the theme's other three-up card rules (the link tiles, the hub's
   cards) leave the option out. Offline: the homepage fixture of airdolomiti-herohome.test.mjs.
   Run: node --max-old-space-size=512 --test test/airdolomiti-route-cards-456.test.mjs */
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
  data.props.pageProps.post.blocks.push(...blocks);
  return `${open}${JSON.stringify(data)}${close}`;
});

test('lazyblock/select-flight-list: cards-teaser (three-up, routes); the baggage cards stay three-up', () => {
  const { html } = convert(withBlocks([
    { name: 'lazyblock/select-flight-list', attributes: { tag: 'h2', title: 'Flights from Frankfurt', cardList: [{ title: 'Frankfurt - Basel', ctaUrl: 'https://www.airdolomiti.eu/routes/flight-from-frankfurt-to-basel' }] } },
    { name: 'lazyblock/add-baggage-cards', attributes: { tag: 'h2', title: 'Baggage', addBaggageCards: [{ title: 'Hand baggage', ctaUrl: 'https://www.airdolomiti.eu/baggage' }] } },
  ]), HOME);
  assert.match(html, /<div class="cards-teaser three-up routes">(?:(?!<div class="cards-teaser)[\s\S])*Frankfurt - Basel/);
  assert.match(html, /<div class="cards-teaser three-up">(?:(?!<div class="cards-teaser)[\s\S])*Hand baggage/);
});

const css = readFileSync('styles/themes/airdolomiti.css', 'utf8');
const body = (sel, from = 0) => {
  const i = css.indexOf(`${sel} {`, from);
  assert.ok(i >= 0, `rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};
const R = 'body.brand-airdolomiti .cards-teaser.three-up.routes';
// the @media (q) block with the route cards' list in it
const media = (q) => {
  let i = css.indexOf(`@media (${q}) {`);
  while (i >= 0) {
    const end = css.indexOf('\n}', i);
    if (css.slice(i, end).includes(`  ${R} > ul {`)) return i;
    i = css.indexOf(`@media (${q}) {`, i + 1);
  }
  assert.fail(`@media (${q}) with the route cards`);
  return -1;
};
const WRAP = 'body.brand-airdolomiti main > .section > .cards-teaser-wrapper:has(> .cards-teaser.routes)';

test('right under the text above (its 20px, not the hub grid\'s 70px); from 930px 60px above the next heading', () => {
  assert.match(body(WRAP), /margin-top: 0;/);
  assert.match(body(WRAP, media('width >= 930px')), /margin-bottom: 60px;/);
  assert.match(css, /\+ \.cards-teaser-wrapper:not\(:has\(> \.cards-teaser\.routes\)\) \{\n {2}margin-top: 70px;/);
});

test('the theme\'s other three-up card rules leave the option routes out', () => {
  const tiles = css.match(/body\.brand-airdolomiti \.cards-teaser\.three-up[^ ]* > ul(?: > li)?:has\(> (?:li > )?\.cards-teaser-image \+ \.cards-teaser-body > \.cards-teaser-title:first-child \+ (?:p:not\(\.cards-teaser-cta\) \+ )?\.cards-teaser-cta:last-child\)/g);
  assert.ok(tiles.length >= 20, `${tiles.length} rules`);
  tiles.forEach((s) => assert.match(s, /\.cards-teaser\.three-up:not\(\.routes\) > ul/, s));
});

test('phones: one row that scrolls sideways, cards 250 x 400 px 2.5vw apart, grey with a 10px radius, the route over the picture (the lower half)', () => {
  const ul = body(`${R} > ul`);
  assert.match(ul, /display: flex;/);
  assert.match(ul, /gap: 2\.5vw;/);
  assert.match(ul, /overflow-x: auto;/);
  const li = body(`${R} > ul > li`);
  assert.match(li, /flex: 0 0 250px;/);
  assert.match(li, /flex-direction: column-reverse;/);
  assert.match(li, /height: 400px;/);
  assert.match(li, /border-radius: 10px;/);
  assert.match(li, /background-color: #f4f4f4;/);
  assert.match(body(`${R} .cards-teaser-body`), /padding: 40px 24px 24px;/);
  const t = body(`${R} .cards-teaser-title`);
  assert.match(t, /font-size: 20px;/);
  assert.match(t, /line-height: 26px;/);
  assert.match(t, /font-weight: 400;/);
  assert.match(t, /text-decoration: underline;/);
  assert.match(t, /color: #002e54;/);
  assert.match(body(`${R} .cards-teaser-cta-link`), /inset: 0;/);
});

test('from 930px a grid 20px apart, two a row, cards 140px high, the picture the left 30%; three a row from 1230px (after it)', () => {
  const m930 = media('width >= 930px');
  const m1230 = media('width >= 1230px');
  assert.ok(m930 < m1230, 'the 1230px rule after the 930px one');
  const ul = body(`${R} > ul`, m930);
  assert.match(ul, /display: grid;/);
  assert.match(ul, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(ul, /gap: 20px;/);
  const li = body(`${R} > ul > li`, m930);
  assert.match(li, /flex-direction: row;/);
  assert.match(li, /gap: 16px;/);
  assert.match(li, /height: 140px;/);
  assert.match(body(`${R} .cards-teaser-image`, m930), /flex: 0 0 30%;/);
  assert.match(body(`${R} .cards-teaser-body`, m930), /padding: 15px 0;/);
  assert.match(body(`${R} > ul > li:hover`, m930), /background-color: #fff;/);
  assert.match(body(`${R} > ul`, m1230), /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
});
