/* eslint-disable max-len */
/* Air Dolomiti's destination carousels' "see all" link with the number of cards, as www writes it (the sweep after 556,
   airdolomiti-parity-001 /de/reiseziele/bari-de: "Zeige alles (4)" over the four cards of "Ausflüge & Tipps"). The
   importer wrote lazyblock/cosa-fare-carroussel's link as its bare text ("Zeige alles"); the offers and the homepage
   destinations already go through showMoreLink, which adds the count. Offline: the homepage fixture of
   airdolomiti-herohome.test.mjs with a carousel in its blocks.
   Run: node --max-old-space-size=512 --test test/airdolomiti-cosa-fare-count-557.test.mjs */
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
const card = (title, slug) => ({ title, Url: `https://www.airdolomiti.eu/destinations/bari/what-to-do/${slug}`, ctaText: title });
const carousel = (attributes) => ({ name: 'lazyblock/cosa-fare-carroussel', attributes: { tag: 'h2', title: 'What to do', ...attributes } });

test('the carousel\'s "see all" link carries the number of cards, as www\'s', () => {
  const { html } = convert(withBlocks([carousel({
    showMoreText: 'Show all',
    showMoreTextUrl: 'https://www.airdolomiti.eu/destinations/bari/what-to-do',
    cardList: [card('Valle d\'Itria', 'valle'), card('Beaches', 'beaches'), card('Caves', 'caves'), card('Cammino', 'cammino')],
  })]), HOME);
  const rest = html.slice(html.indexOf('What to do'));
  assert.match(rest, /<a href="[^"]*what-to-do">Show all \(4\)<\/a>/);
  assert.doesNotMatch(rest, />Show all<\/a>/);
});

test('without the link\'s address or text: no link', () => {
  const { html } = convert(withBlocks([carousel({ showMoreText: 'Show all', cardList: [card('Caves', 'caves')] })]), HOME);
  assert.doesNotMatch(html.slice(html.indexOf('What to do')), /Show all/);
});
