/* eslint-disable max-len */
/* Air Dolomiti's homepage hero (tools/importer/airdolomiti-import.mjs 'lazyblock/herohome'):
   without a title (the three homepages: a label paragraph and the four "manage your trip" links)
   it is hero-campaign (services), the shared block's option for that shape (until the option is
   on main the block ignores the word); with a title it stays hero-campaign. Offline and from git
   alone: test/fixtures/airdolomiti-herohome is the part of content-sites/lh-airdolomiti convert
   reads for the homepage at /: its snapshot trimmed to the herohome block (the head to its
   alternate links), the it and de homepages' heads (their alternate links), the site data
   (paths.json, assets/files.json and state.json, capture-state.json: only the entries it asks
   for; the delivery lists' headers) and exists.json, the answers it gets on whether a file is
   there. While the tests run, the importer's reads of content-sites/lh-airdolomiti are answered
   from it (nothing is written).
   Run: node --max-old-space-size=512 --test test/airdolomiti-herohome.test.mjs */
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
// the importer's site data from the fixture (the module's fs is node:fs's default export)
fs.readFileSync = (p, ...rest) => (siteFile(p) === null ? readFileSync(p, ...rest) : readFileSync(path.join(FIXTURE, siteFile(p)), ...rest));
fs.existsSync = (p) => (siteFile(p) === null ? existsSync(p) : EXISTS[siteFile(p)] === true);
// (the snapshots' heads: airdolomiti-alternates.mjs snapshotHead reads them with openSync)
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
const heroOf = (html) => (html.match(/<div class="hero-campaign[^"]*">/) || [''])[0];

test('the homepage hero without a title: hero-campaign (services), its label and the four links as before', () => {
  const { html } = convert(rendered, HOME);
  assert.equal(heroOf(html), '<div class="hero-campaign services">');
  const hero = html.slice(html.indexOf('<div class="hero-campaign services">'));
  assert.match(hero, /^<div class="hero-campaign services"><div><div><picture>/);
  // a label paragraph, then four link-only paragraphs (check-in, booking, Miles & More, cars)
  assert.match(hero, /<div><div><p>[^<]+<\/p><p><a href="[^"]*online-check-in">[^<]+<\/a><\/p><p><a href="[^"]+">[^<]+<\/a><\/p><p><a href="[^"]*miles-and-more[^"]*">Miles &amp; More<\/a><\/p><p><a href="[^"]*carsbookingengine[^"]*">[^<]+<\/a><\/p><\/div><\/div><\/div>/);
  assert.ok(!/<div class="hero-campaign services">(?:(?!<\/div><\/div><\/div>)[\s\S])*<h[1-6]/.test(hero), 'no heading in the block');
});

test('a herohome hero with a title stays hero-campaign; the page hero (lazyblock/hero) as before', () => {
  const titled = rendered.replace(NEXT, (m, open, json, close) => {
    const data = JSON.parse(json);
    const b = data.props.pageProps.post.blocks.find((x) => x.name === 'lazyblock/herohome');
    b.attributes.title = 'Benvenuti a bordo';
    return `${open}${JSON.stringify(data)}${close}`;
  });
  const { html } = convert(titled, HOME);
  assert.equal(heroOf(html), '<div class="hero-campaign">');
  assert.match(html, /<div class="hero-campaign"><div><div><picture>[\s\S]*?<h2[^>]*>Benvenuti a bordo<\/h2>/);
  const js = fs.readFileSync('tools/importer/airdolomiti-import.mjs', 'utf8');
  assert.match(js, /page\.block\('hero-campaign \(narrow\)', \[\[page\.img\(a\.backgroundimage \|\| a\.backgroundImage\)\]/, 'lazyblock/hero: hero-campaign (narrow) as before');
});
