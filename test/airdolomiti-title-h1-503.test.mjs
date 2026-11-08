/* eslint-disable max-len */
/* Air Dolomiti's pages without a heading of their own (brief 503, Air Dolomiti row 68; the sweep
   after 501: in-flight entertainment +6 to +7 %): www shows no page title there (its h1 is the
   header's logo; the description-news block's subtitle, an h3, is the first title on the page), and
   the importer wrote the post's title as a visible h1 above the block, the title twice on screen.
   The importer still writes that h1 (the page's one h1, for screen readers and search) and gives its
   section the style hidden-heading (styles.css: the section's h1 visually hidden), as the homepages'
   "Air Dolomiti". Pages with a heading of their own as before.
   Offline: the homepage fixture of airdolomiti-herohome.test.mjs.
   Run: node --max-old-space-size=512 --test test/airdolomiti-title-h1-503.test.mjs */
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
const page = (title, blocks) => rendered.replace(NEXT, (m, open, json, close) => {
  const data = JSON.parse(json);
  Object.assign(data.props.pageProps.post, { title, blocks });
  return `${open}${JSON.stringify(data)}${close}`;
});
// the en page's block (airdolomiti-parity-001): its picture makes it columns-media (news), the
// subtitle an h3 in the block
const PICTURE = encodeURIComponent(JSON.stringify({ alt: '', url: 'https://cms.airdolomiti.it/wp-content/uploads/2023/09/Smartphone-sito_1920x1080.jpg' }));
const IFE = {
  name: 'lazyblock/description-news',
  attributes: {
    subtitle: 'In-Flight Entertainment System', description: '<p>Thanks to the valuable collaboration with Lufthansa Systems, a new version of the in-flight entertainment system is now available.</p>', altImage: 'Fingers touching smartphone screen', backgroundImage: PICTURE, textBtn: '', urlBtn: '',
  },
};
// the document's first section: up to the first section break (a <hr> or the next top-level div)
const firstSection = (html) => html.split(/\n<hr>\n|<\/div>\n<div>/)[0];

test('row 68: a page without a heading of its own: the title h1 in a hidden-heading section (www shows no page title)', () => {
  const { html } = convert(page('In-Flight Entertainment System', [IFE]), HOME);
  assert.equal((html.match(/<h1>/g) || []).length, 1, 'one h1');
  assert.ok(html.includes('<h1>In-Flight Entertainment System</h1>'), 'the post\'s title');
  const first = firstSection(html);
  assert.ok(first.includes('<h1>In-Flight Entertainment System</h1>'), 'the h1 in the first section');
  assert.match(first, /<div class="section-metadata">[\s\S]*?<div>Style<\/div>\s*<div>[^<]*\bhidden-heading\b[^<]*<\/div>/, `the first section hidden-heading: ${first.slice(0, 600)}`);
  assert.ok(/<h3[^>]*>In-Flight Entertainment System<\/h3>/.test(html), 'the block\'s own title as it is');
});

test('row 68: a page with a heading of its own keeps its h1 visible (no hidden-heading)', () => {
  const content = '<h2>Lounges</h2><p>Our partner lounges.</p>';
  const { html } = convert(page('Lounges', [{ name: 'lazyblock/html-content', attributes: { content } }]), HOME);
  assert.ok(html.includes('<h1>Lounges</h1>'), 'its heading the h1');
  assert.ok(!/hidden-heading/.test(html));
});
