/* eslint-disable max-len */
/* Air Dolomiti's homepage hero (tools/importer/airdolomiti-import.mjs 'lazyblock/herohome'):
   without a title (the three homepages: a label paragraph and the four "manage your trip" links)
   it is hero-campaign (services), the shared block's option for that shape (until the option is
   on main the block ignores the word); with a title it stays hero-campaign. From the
   homepage snapshot at / (content-sites/lh-airdolomiti/snapshots), offline.
   Run: node --max-old-space-size=512 --test test/airdolomiti-herohome.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// eslint-disable-next-line import/extensions
import { snapshotFile } from '../tools/importer/airdolomiti-capture.mjs';

// eslint-disable-next-line import/extensions
const { convert } = await import('../tools/importer/airdolomiti-import.mjs');
const HOME = 'https://www.airdolomiti.eu/';
const rendered = fs.readFileSync(snapshotFile(HOME), 'utf8');
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
