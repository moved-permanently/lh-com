/* eslint-disable max-len, import/extensions -- dev tooling */
/* SWISS's magazine documents for www's design (tools/importer/swiss-mag-docs.mjs, brief 403; the
   steps of brief 400 on the home, as a tool): the home and the section pages (a hero, a heading
   and carousel, the lists) get www's three sections (the hero; the Top Stories band: section style
   grey; the lists), each list a stories list followed by www's More Stories link ("More Stories",
   "Mehr Stories") to its Path; every overview and article page its Parent (the path one level up,
   where that page exists; up to the home); the nav www's white logo. A document the step has done
   already stays as it is (the tool runs again after a re-import); a category page's own list
   (Path = the page) keeps its pages and gets no link. The nav, footer, contact and print pages are
   not touched beyond the logo.
   Run: node --max-old-space-size=512 --test test/swiss-mag-docs.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseHTML } from 'linkedom';
import {
  transformDocument, parentOf, kindOf, MORE, LOGO, prepare,
} from '../tools/importer/swiss-mag-docs.mjs';

const list = (p, rows = '') => `<div class="blog-overview grid"><div><div>Path</div><div>${p}</div></div><div><div>Page size</div><div>5</div></div>${rows}</div>`;
const meta = (rows) => `<div class="metadata">${Object.entries(rows).map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div>`;
const doc = (main) => `<body><header></header><main>${main}</main><footer></footer></body>`;
const HERO = '<div class="hero-card-overlay"><div><div><picture><img src="https://content.da.live/x.jpg" alt=""></picture></div></div><div><div><p>Travel Stories</p><h1><a href="/magazine/en/travel/x">X</a></h1></div></div></div>';
const CAROUSEL = '<div class="carousel-cards"><div><div><picture><img src="https://content.da.live/y.jpg" alt=""></picture></div><div><p>Chip</p><h3><a href="/magazine/en/y">Y</a></h3></div></div></div>';
const home = (ll = 'en', root = `/magazine/${ll}`) => doc(`<div>${HERO}<h2 id="top-stories">Top Stories</h2>${CAROUSEL}<h2 id="a"><a href="${root}/inside-swiss">Inside SWISS</a></h2>${list(`${root}/inside-swiss`)}<h2 id="b">Travel</h2>${list(`${root}/travel`)}${meta({ Title: 'SWISS Magazine', 'page-type': 'overview' })}</div>`);
const KNOWN = new Set(['/magazine/en', '/magazine/en/inside-swiss', '/magazine/en/inside-swiss/behind-the-scenes', '/magazine/de', '/magazine/de/reisen']);
const sections = (html) => parseHTML(html).document.querySelectorAll('main > div').length;

test('kindOf and parentOf: by page type and path; the parent the nearest existing page up', () => {
  assert.equal(kindOf('/magazine/en', 'overview'), 'home');
  assert.equal(kindOf('/magazine/en/inside-swiss', 'overview'), 'overview');
  assert.equal(kindOf('/magazine/en/inside-swiss/behind-the-scenes/a350', 'article'), 'article');
  ['/magazine/en/nav', '/magazine/en/footer', '/magazine/en/contact', '/magazine/en/print'].forEach((p) => assert.equal(kindOf(p, ''), 'other', p));
  assert.equal(parentOf('/magazine/en/inside-swiss/behind-the-scenes/a350', KNOWN), '/magazine/en/inside-swiss/behind-the-scenes');
  assert.equal(parentOf('/magazine/en/inside-swiss', KNOWN), '/magazine/en');
  assert.equal(parentOf('/magazine/en/travel/destinations/paris', KNOWN), '/magazine/en', 'no travel pages known: up to the home');
  assert.equal(parentOf('/magazine/en', KNOWN), '');
});

test('the home: three sections, the band grey, the lists with More Stories; idempotent', () => {
  const { html, changes } = transformDocument(home(), '/magazine/en', { known: KNOWN });
  assert.deepEqual(changes, ['sections: hero, band (Top Stories), lists', 'lists: 2 stories with More Stories']);
  const main = html.match(/<main>([\s\S]*)<\/main>/)[1];
  assert.equal(sections(html), 3);
  assert.ok(main.includes('<div class="section-metadata"><div><div>Style</div><div>grey</div></div></div>'));
  assert.equal((main.match(/class="blog-overview grid stories"/g) || []).length, 2);
  assert.ok(main.includes(`<p><a href="/magazine/en/inside-swiss">${MORE.en}</a></p>`));
  assert.ok(main.includes(`<p><a href="/magazine/en/travel">${MORE.en}</a></p>`));
  assert.ok(!/Parent/.test(main), 'the home has no parent');
  // the band holds the heading and the carousel only
  const band = main.slice(main.indexOf('<h2 id="top-stories">'), main.indexOf('section-metadata'));
  assert.ok(band.includes('carousel-cards') && !band.includes('blog-overview'));
  const again = transformDocument(html, '/magazine/en', { known: KNOWN });
  assert.deepEqual(again.changes, []);
  assert.equal(again.html, html);
});

test('German: Mehr Stories; a section page as the home plus its Parent', () => {
  const de = transformDocument(home('de', '/magazine/de').replace('SWISS Magazine', 'Reisen'), '/magazine/de/reisen', { known: KNOWN });
  assert.ok(de.html.includes(`>${MORE.de}</a></p>`));
  assert.ok(de.changes.includes('parent /magazine/de'));
  assert.ok(de.html.includes('<div><div>Parent</div><div>/magazine/de</div></div>'));
  assert.equal(MORE.de, 'Mehr Stories');
});

test('a category page: its own list keeps its pages, no link; the Parent row', () => {
  const p = '/magazine/en/inside-swiss/behind-the-scenes';
  const { html, changes } = transformDocument(doc(`<div>${HERO}${list(p)}${meta({ Title: 'Behind the Scenes', 'page-type': 'overview' })}</div>`), p, { known: KNOWN });
  assert.deepEqual(changes, ['parent /magazine/en/inside-swiss']);
  assert.ok(!html.includes('stories') && !html.includes(MORE.en));
});

test('an article: the Parent row once; one with a Parent stays', () => {
  const p = '/magazine/en/inside-swiss/behind-the-scenes/a350';
  const src = doc(`<div><div class="article-header"><div><div>x</div></div></div><p>Text &amp; more</p>${meta({ Title: 'A350', 'page-type': 'article' })}</div>`);
  const { html, changes } = transformDocument(src, p, { known: KNOWN });
  assert.deepEqual(changes, ['parent /magazine/en/inside-swiss/behind-the-scenes']);
  assert.ok(html.includes('<p>Text &amp; more</p>'), 'entities kept');
  assert.deepEqual(transformDocument(html, p, { known: KNOWN }).changes, []);
});

test('the nav: www\'s white logo instead of www.swiss.com\'s red one; other pages untouched', () => {
  const nav = doc('<div><p><a href="/magazine/en"><img src="https://www.swiss.com/etc/designs/lx/clientlib-all/vite/img/swiss-logo.svg" alt="Swiss Magazine"></a></p></div><div><ul><li><a href="/magazine/en/travel">Travel</a></li></ul></div>');
  const { html, changes } = transformDocument(nav, '/magazine/en/nav', { known: KNOWN });
  assert.deepEqual(changes, ['nav: the white logo']);
  assert.ok(html.includes(`src="${LOGO}"`));
  assert.deepEqual(transformDocument(doc('<div><p>Contact</p></div>'), '/magazine/en/contact', { known: KNOWN }).changes, []);
});

test('prepare from a folder: the changed documents as <path>.plain.html, changes.tsv and changed-paths.txt, the logo file', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mag-'));
  const src = path.join(dir, 'src');
  const out = path.join(dir, 'out');
  const put = (p, html) => { fs.mkdirSync(path.dirname(path.join(src, `${p}.html`)), { recursive: true }); fs.writeFileSync(path.join(src, `${p}.html`), html); };
  put('/magazine/en', home());
  put('/magazine/en/inside-swiss', home().replace('SWISS Magazine', 'Inside SWISS'));
  put('/magazine/en/inside-swiss/behind-the-scenes/a350', doc(`<div><p>x</p>${meta({ 'page-type': 'article', Parent: '/magazine/en/inside-swiss/behind-the-scenes' })}</div>`));
  put('/magazine/en/inside-swiss/behind-the-scenes', doc(`<div>${HERO}${list('/magazine/en/inside-swiss/behind-the-scenes')}${meta({ 'page-type': 'overview' })}</div>`));
  const summary = await prepare({ from: src, out, langs: ['en'] });
  assert.deepEqual(summary, { read: 4, changed: 3, unchanged: 1 });
  const changed = fs.readFileSync(path.join(out, 'changed-paths.txt'), 'utf8').trim().split('\n');
  assert.deepEqual(changed.sort(), ['/magazine/en', '/magazine/en/inside-swiss', '/magazine/en/inside-swiss/behind-the-scenes']);
  const tsv = fs.readFileSync(path.join(out, 'changes.tsv'), 'utf8');
  assert.ok(tsv.startsWith('path\tkind\tchanges\n'));
  assert.ok(tsv.includes('/magazine/en/inside-swiss/behind-the-scenes\toverview\tparent /magazine/en/inside-swiss'));
  const plain = fs.readFileSync(path.join(out, 'magazine/en.plain.html'), 'utf8');
  assert.ok(!plain.includes('<main>') && plain.includes('section-metadata'), 'the main\'s inner HTML, as da-upload sends it');
  assert.ok(fs.existsSync(path.join(out, LOGO.slice(1))), 'the logo next to the documents (da-upload uploads it once)');
  fs.rmSync(dir, { recursive: true, force: true });
});
