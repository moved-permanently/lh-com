/* eslint-disable max-len */
/* Air Dolomiti's links to files in a text (parity row 57, the brief after 456): www's RichText links
   (the fleet's "Download E190 seat map here": bold, teal #008293, underlined at the text's size,
   www's external-link icon 20px 10px after it), not buttons. A bold link alone in its paragraph is
   a button in Edge Delivery (and Edge Delivery moves a link's bold outside it), so the importer
   writes a rich text's paragraph that is only a bold link to a file as the plain link, and the
   theme gives a link to a file alone in its paragraph www's look; consecutive ones line by line.
   Other lone links ("Show all", the maps) are as before. Offline: the homepage fixture of
   airdolomiti-herohome.test.mjs.
   Run: node --max-old-space-size=512 --test test/airdolomiti-file-links.test.mjs */
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
const PDF = 'https://www.airdolomiti.eu/seatmap-e190-en.pdf';

test('a paragraph that is only a bold link to a file: the plain link; other bold links and links in a sentence as before', () => {
  const description = `<p>The fleet.</p><p><a href="${PDF}"><strong>Download E190 seat map here</strong></a></p><p><strong><a href="${PDF.replace('e190', 'e195')}">Download E195 seat map here</a></strong></p><p><strong><a href="https://www.iata.org/travel">Visit the IATA site</a></strong></p><p>See <strong><a href="${PDF}">the map</a></strong> here.</p>`;
  const { html } = convert(withBlocks([{ name: 'lazyblock/title-description-text-cta', attributes: { tag: 'h2', title: 'The Fleet', description } }]), HOME);
  assert.match(html, /<p><a href="[^"]*seatmap-e190-en\.pdf">Download E190 seat map here<\/a><\/p>/);
  assert.match(html, /<p><a href="[^"]*seatmap-e195-en\.pdf">Download E195 seat map here<\/a><\/p>/);
  assert.match(html, /<p><strong><a href="[^"]*iata[^"]*">Visit the IATA site<\/a><\/strong><\/p>/, 'not a file: as before');
  assert.match(html, /<p>See <strong><a href="[^"]*\.pdf">the map<\/a><\/strong> here\.<\/p>/, 'in a sentence: as before');
});

const css = readFileSync('styles/themes/airdolomiti.css', 'utf8');
const A = 'body.brand-airdolomiti main .default-content-wrapper p.link-wrapper > a:any-link:is([href*="/documents/"], [href$=".pdf"])';
const body = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, `rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};

test('a link to a file alone in its paragraph: bold, teal, underlined, inline; no arrow; www\'s external-link icon 20px 10px after it', () => {
  const a = body(A);
  assert.match(a, /display: inline;/);
  assert.match(a, /color: #008293;/);
  assert.match(a, /font-weight: 700;/);
  assert.match(a, /text-decoration: underline;/);
  assert.match(body(`${A}::before`), /content: none;/);
  const icon = body(`${A}::after`);
  assert.match(icon, /width: 20px;/);
  assert.match(icon, /height: 20px;/);
  assert.match(icon, /margin-left: 10px;/);
  assert.match(icon, /mask: url\("data:image\/svg\+xml/);
});

test('consecutive file links line by line (no blank line between them)', () => {
  assert.match(css, /p\.link-wrapper:has\(> a:any-link:is\(\[href\*="\/documents\/"\], \[href\$="\.pdf"\]\)\):has\(\+ p\.link-wrapper > a:any-link:is\(\[href\*="\/documents\/"\], \[href\$="\.pdf"\]\)\) \{[^}]*margin-bottom: 0;/);
});
