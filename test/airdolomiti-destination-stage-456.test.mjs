/* eslint-disable max-len */
/* Air Dolomiti's destination stage (parity rows 43 and 44, brief 456): www's HeroSecond
   (lazyblock/reach-monaco) is hero-card-overlay (destination), so every stage has www's look, with
   or without section links (the 447 rules needed the tiles' section, cards-icon-container: 54 of
   85 stages kept the navy card). Its links ("What to do / see / eat", www's white pills inside the
   stage, 70px under the text box) are a list in the stage's card, each item the link and its icon;
   no cards-icon block under the stage. The pills: white, a 10px radius, 18px 40px, teal 16 / 22 px
   500, the icon 28px 16px after the label (64px high pills), 8px apart, one row that scrolls sideways when it doesn't
   fit (www's flex wrapper). Offline: the homepage fixture of airdolomiti-herohome.test.mjs.
   Run: node --max-old-space-size=512 --test test/airdolomiti-destination-stage-456.test.mjs */
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
const stage = (buttonTexts) => ({
  name: 'lazyblock/reach-monaco',
  attributes: {
    header: 'The enchanting capital of Apulia', title: 'Explore Bari City in Puglia', titleWidget: 'Starting from', widgetPrice: '174€', ctaUrl: 'https://www.airdolomiti.eu/booking', ctaText: 'Book your flight', buttonTexts,
  },
});
// (the title an h2 here: the homepage fixture has its own h1, the importer keeps one a page)
const blockOf = (html) => {
  const i = html.indexOf('<div class="hero-card-overlay destination">');
  assert.ok(i >= 0, 'hero-card-overlay (destination)');
  return html.slice(i, html.indexOf('<div class="metadata">', i) > 0 ? html.indexOf('<div class="metadata">', i) : undefined);
};

test('lazyblock/reach-monaco: hero-card-overlay (destination) with the section links as a list after the title, no cards-icon tiles', () => {
  const { html } = convert(withBlocks([stage([
    { text: 'What to do', ctaUrl: '#what-to-do', icon: '' },
    { text: 'What to see', ctaUrl: '#what-to-see' },
    { text: 'Podcast', ctaUrl: 'https://www.airdolomiti.eu/podcast' },
  ])]), HOME);
  const b = blockOf(html);
  assert.match(b, /<p>The enchanting capital of Apulia<\/p><h([12])[^>]*>Explore Bari City in Puglia<\/h\1><ul><li><a href="#what-to-do">What to do<\/a><\/li><li><a href="#what-to-see">What to see<\/a><\/li><li><a href="[^"]*podcast">Podcast<\/a><\/li><\/ul><p>Starting from 174€<\/p><p><strong><a href="[^"]+">Book your flight<\/a><\/strong><\/p>/);
  assert.ok(!html.includes('<div class="cards-icon'), 'no cards-icon block');
});

test('without section links: hero-card-overlay (destination), no list', () => {
  const { html } = convert(withBlocks([stage([])]), HOME);
  const b = blockOf(html);
  assert.ok(!b.includes('<ul>'), 'no list');
  assert.match(b, /<h([12])[^>]*>Explore Bari City in Puglia<\/h\1><p>Starting from 174€<\/p>/);
});

const css = readFileSync('styles/themes/airdolomiti.css', 'utf8');
const S = 'body.brand-airdolomiti main > .section.hero-card-overlay-container .hero-card-overlay.destination';
const body = (sel, from = 0) => {
  const i = css.indexOf(`${sel} {`, from);
  assert.ok(i >= 0, `rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};

test('the stage rules are the option\'s, not the tiles\' section\'s', () => {
  assert.ok(!/cards-icon-container \.hero-card-overlay/.test(css), 'no rule needs the cards-icon section');
  assert.match(body(S), /min-height: 100vh;/);
  assert.match(body(`${S} .hero-card-overlay-card h1`), /font-weight: 300;/);
});

test('the text box: the line and the title on www\'s marble (60%), 10px in; the card itself clear', () => {
  const card = body(`${S} .hero-card-overlay-card`);
  assert.match(card, /padding: 0;/);
  assert.match(card, /background-color: transparent;/);
  const box = body(`${S} .hero-card-overlay-card > :is(.hero-card-overlay-eyebrow, h1)`);
  assert.match(box, /background-color: hsl\(26deg 26% 95% \/ 60%\);/);
  assert.match(body(`${S} .hero-card-overlay-card > .hero-card-overlay-eyebrow`), /padding: 10px 10px 0;/);
  assert.match(body(`${S} .hero-card-overlay-card > h1`), /padding: 0 10px 10px;/);
  assert.match(body(`${S} .hero-card-overlay-card > h1:first-child`), /padding-top: 10px;/);
});

test('the pills: one row 70px under the box, 8px apart, centred, scrolling sideways when it doesn\'t fit; white, 10px radius, 18px 40px, teal 16 / 22 px 500, the icon 28px 16px after the label', () => {
  const ul = body(`${S} .hero-card-overlay-card > ul`);
  assert.match(ul, /display: flex;/);
  assert.match(ul, /gap: 8px;/);
  assert.match(ul, /justify-content: safe center;/);
  assert.match(ul, /margin: 70px -16px 0;/);
  assert.match(ul, /overflow-x: auto;/);
  assert.match(ul, /list-style: none;/);
  const li = body(`${S} .hero-card-overlay-card > ul > li`);
  assert.match(li, /gap: 16px;/);
  assert.match(li, /padding: 18px 40px;/);
  assert.match(li, /border-radius: 10px;/);
  assert.match(li, /background-color: #fff;/);
  assert.match(li, /color: #00798a;/);
  assert.match(li, /font-size: 16px;/);
  assert.match(li, /font-weight: 500;/);
  assert.match(li, /line-height: 22px;/);
  const icon = body(`${S} .hero-card-overlay-card > ul > li :is(picture, img)`);
  assert.match(icon, /width: 28px;/);
  assert.match(icon, /height: 28px;/);
  assert.match(body(`${S} .hero-card-overlay-card > ul > li a::after`), /inset: 0;/);
});

test('an item\'s paragraphs (DA wraps the link and the icon in one each: the pill 88px high on preview) add nothing to the pill', () => {
  assert.match(body(`${S} .hero-card-overlay-card > ul > li > p`), /display: contents;/);
});
