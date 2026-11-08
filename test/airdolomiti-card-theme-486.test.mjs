/* eslint-disable max-len */
/* Air Dolomiti's two-up cards with www's per-card theme (brief 486; airdolomiti-parity-001, the
   homepages' Business card): www's gridtwocolumns card carries theme "business" (CardDefault
   theme_business: the title box navy at 80 %, the title and line white; theme sustainability: olive
   at 80 %); no theme is www's general one. The importer writes it as the block's option
   theme-<theme>-<the card's position> (as accordion-columns' open-item-N), the theme draws it.
   Offline: the homepage fixture of airdolomiti-herohome.test.mjs.
   Run: node --max-old-space-size=512 --test test/airdolomiti-card-theme-486.test.mjs */
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
const grid = (cards) => ({ name: 'lazyblock/gridtwocolumns', attributes: { cardList: encodeURIComponent(JSON.stringify(cards)) } });
const card = (title, theme) => ({
  title, subtitle: 'Discover the services dedicated to you.', url: `/${title.toLowerCase()}-en`, ...(theme === undefined ? {} : { theme }),
});

test('a card with www\'s theme: the block\'s option theme-<theme>-<position>; general and no theme: none', () => {
  const { html } = convert(withBlocks([grid([card('Leisure'), card('Business', 'business')])]), HOME);
  assert.match(html, /<div class="cards-teaser theme-business-2">/);
  const two = convert(withBlocks([grid([card('Green', 'sustainability'), card('Leisure', 'general'), card('Business', 'business')])]), HOME).html;
  assert.match(two, /<div class="cards-teaser theme-sustainability-1 theme-business-3">/);
  const none = convert(withBlocks([grid([card('Leisure'), card('Other', 'general')])]), HOME).html;
  assert.ok(/<div class="cards-teaser">/.test(none) && !/theme-/.test(none));
  // a value that is no class name is left out
  const odd = convert(withBlocks([grid([card('Leisure', 'Dark Blue!')])]), HOME).html;
  assert.ok(!/theme-/.test(odd));
});

const css = readFileSync('styles/themes/airdolomiti.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ')
  .replace(/\( /g, '(')
  .replace(/ \)/g, ')');
const pos = (theme) => [1, 2, 3, 4].map((n) => `.cards-teaser.theme-${theme}-${n} > ul > li:nth-child(${n})`).join(', ');

test('the theme: business\'s title box navy at 80 %, sustainability\'s olive; their title and line white (cards 1 to 4)', () => {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  [['business', 'rgb\\(0 46 84 / 80%\\)'], ['sustainability', 'rgb\\(57 72 25 / 80%\\)']].forEach(([theme, bg]) => {
    const sel = `body.brand-airdolomiti :is(${pos(theme)}):has(> .cards-teaser-image)`;
    assert.match(css, new RegExp(`${esc(sel)} > \\.cards-teaser-body::before \\{ background-color: ${bg}; \\}`), theme);
    assert.match(css, new RegExp(`${esc(sel)} \\.cards-teaser-body > :is\\(\\.cards-teaser-title, p:not\\(\\.cards-teaser-cta\\)\\) \\{ color: #fff; \\}`), theme);
  });
});
