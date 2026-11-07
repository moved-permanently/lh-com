/* eslint-disable max-len */
/* Air Dolomiti's blog list and Italian timetable titles (parity rows 48 and 50):
   - row 48: www's blog list (lazyblock/blog-posts, BlogPosts_categories_wrapper) has no h1; its first
     heading is "Categorie / Categories / Kategorien", semibold #040f32 37.8 / 40 px (43.2 / 48 from
     930px), 16px above the categories as pills (#003061, white, 6px 12px, an 8px radius, 16px, in a
     row that wraps, 16px apart, 8px from 930px). The importer writes that heading as the page's
     one h1 (no title h1 before it); the theme styles the h1 followed by the list in the section of
     the blog list.
   - row 50: www's Title (lazyblock/title, the Italian timetable /orario-voli: Title_h2_headline) is
     light 34 / 42 px (38 / 46 from 930px, 2px letter spacing from 530px), not TitleMargin's size.
     The importer marks the section of a top-level lazyblock/title written as the h1 with the style
     compact-title (section metadata), the theme sizes its h1 from it (no path in the code).
   Offline: the homepage fixture of airdolomiti-herohome.test.mjs.
   Run: node --max-old-space-size=512 --test test/airdolomiti-titles-48-50.test.mjs */
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
const withBlocks = (blocks, extra = '') => rendered.replace(NEXT, (m, open, json, close) => {
  const data = JSON.parse(json);
  // (the page's own blocks out: its herohome writes an h1 of its own)
  data.props.pageProps.post.blocks = blocks;
  return `${open}${JSON.stringify(data)}${close}`;
}).replace('</body>', `${extra}</body>`);
const H1S = (html) => (html.match(/<h1[\s>]/g) || []).length;

test('row 48: the blog list\'s "Categories" is the page\'s one h1, the categories under it; no title h1', () => {
  const cats = '<main><div class="BlogPosts_categories_wrapper__D2QVO"><h2 class="BlogPosts_h3_headline__2CzDQ">Categories</h2><ul><li><a href="/articles/dyk">#DidYouKnow</a></li><li><a href="/articles/avgeek-en">AvGeek</a></li></ul></div></main>';
  const { html } = convert(withBlocks([{ name: 'lazyblock/blog-posts', attributes: {} }], cats), HOME);
  assert.match(html, /<h1>Categories<\/h1><ul><li><a href="[^"]*dyk">#DidYouKnow<\/a><\/li>/);
  assert.equal(H1S(html), 1, 'one h1');
});

test('row 50: a top-level lazyblock/title written as the h1: its section styled compact-title; an h2 title not', () => {
  const { html } = convert(withBlocks([{ name: 'lazyblock/title', attributes: { tag: 'h1', title: "Orari e voli Air Dolomiti per l'Europa", subtitle: 'Consulta il programma dei voli.' } }]), HOME);
  assert.match(html, /<h1>Orari e voli Air Dolomiti per l(?:'|&#39;)Europa<\/h1><p>Consulta il programma dei voli\.<\/p>(?:(?!<\/div>\s*<div>)[\s\S])*<div class="section-metadata"><div><div>Style<\/div><div>compact-title<\/div><\/div><\/div>/);
  const h2 = convert(withBlocks([{ name: 'lazyblock/title', attributes: { tag: 'h2', title: 'Services tailored for you' } }]), HOME).html;
  assert.ok(!h2.includes('compact-title'), 'an h2 title: no style');
});

const css = readFileSync('styles/themes/airdolomiti.css', 'utf8');
const body = (sel, from = 0) => {
  const i = css.indexOf(`${sel} {`, from);
  assert.ok(i >= 0, `rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};
const media = (q, sel) => {
  let i = css.indexOf(`@media (${q}) {`);
  while (i >= 0) {
    if (css.slice(i, css.indexOf('\n}', i)).includes(`  ${sel} {`)) return i;
    i = css.indexOf(`@media (${q}) {`, i + 1);
  }
  assert.fail(`@media (${q}) with ${sel}`);
  return -1;
};
const B = 'body.brand-airdolomiti main .default-content-wrapper:has(> h1:first-child + ul):has(+ .blog-overview-wrapper)';
const T = 'body.brand-airdolomiti main > .section.compact-title .default-content-wrapper > h1:first-child';

test('row 48: the heading semibold #040f32 37.8 / 40 (43.2 / 48 from 930px), 16px above the pills', () => {
  const h = body(`${B} > h1`);
  assert.ok(/margin: 0 0 16px;/.test(h) && /color: #040f32;/.test(h) && /font-size: 37\.8px;/.test(h) && /font-weight: 600;/.test(h) && /line-height: 40px;/.test(h), h);
  const wide = body(`${B} > h1`, media('width >= 930px', `${B} > h1`));
  assert.ok(/font-size: 43\.2px;/.test(wide) && /line-height: 48px;/.test(wide), wide);
});

test('row 48: the categories as www\'s pills, 16px apart (8px from 930px), 50px above the list of posts', () => {
  const ul = body(`${B} > ul`);
  assert.ok(/display: flex;/.test(ul) && /flex-wrap: wrap;/.test(ul) && /gap: 16px;/.test(ul) && /margin: 0 0 50px;/.test(ul) && /list-style: none;/.test(ul), ul);
  assert.ok(/gap: 8px;/.test(body(`${B} > ul`, media('width >= 930px', `${B} > ul`))));
  const a = body(`${B} > ul a:any-link`);
  assert.ok(/background-color: #003061;/.test(a) && /color: #fff;/.test(a) && /padding: 6px 12px;/.test(a) && /border-radius: 8px;/.test(a) && /font-size: 16px;/.test(a) && /font-weight: 400;/.test(a), a);
});

test('row 50: the compact-title h1 light 34 / 42 px, 38 / 46 from 930px, 2px letter spacing from 530px', () => {
  const t = body(T);
  assert.ok(/font-size: 34px;/.test(t) && /line-height: 42px;/.test(t) && /font-weight: 300;/.test(t), t);
  assert.ok(/letter-spacing: 2px;/.test(body(T, media('width >= 530px', T))));
  const wide = body(T, media('width >= 930px', T));
  assert.ok(/font-size: 38px;/.test(wide) && /line-height: 46px;/.test(wide), wide);
});
