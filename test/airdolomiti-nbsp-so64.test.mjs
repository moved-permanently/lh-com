/* eslint-disable max-len */
/* Air Dolomiti's no-break spaces (standing order 64, item 2): www's WordPress text binds a bold word
   or a link to its neighbours with &nbsp; ("begin in&nbsp;<b>Germany</b>, where&nbsp;<a><b>Munich</b></a>&nbsp;fascinates"),
   which sets where www's lines wrap (destinations at 390: its paragraphs 561 and 374 px, ours 524 and
   337 with plain spaces). The importer keeps those next to an element; between two words of a text
   (Word-pasted text, frankfurt-de) and in a heading they are plain spaces. Offline: the homepage fixture of airdolomiti-herohome.test.mjs.
   Run: node --max-old-space-size=512 --test test/airdolomiti-nbsp-so64.test.mjs */
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
const { convert, textRun } = await import('../tools/importer/airdolomiti-import.mjs');
const HOME = 'https://www.airdolomiti.eu/';
const rendered = readFileSync(path.join(FIXTURE, 'snapshots/www.airdolomiti.eu/index.html'), 'utf8');
const NEXT = /(<script id="__NEXT_DATA__" type="application\/json"[^>]*>)([\s\S]*?)(<\/script>)/;
const withBlocks = (blocks) => rendered.replace(NEXT, (m, open, json, close) => {
  const data = JSON.parse(json);
  data.props.pageProps.post.blocks.push(...blocks);
  return `${open}${JSON.stringify(data)}${close}`;
});
const NB = '\u00a0';

test('a text run: white space one space; a no-break space kept at its ends (next to an element), between words a plain space', () => {
  assert.equal(textRun(`Your journey might begin in${NB}`), `Your journey might begin in${NB}`);
  assert.equal(textRun(`${NB}fascinates with${NB}its \n\t old town`), `${NB}fascinates with its old town`);
  assert.equal(textRun(`Die S-Bahn-Linien S8 und S9${NB}verbinden${NB}Frankfurt`), 'Die S-Bahn-Linien S8 und S9 verbinden Frankfurt');
  assert.equal(textRun(`${NB} `), `${NB} `, 'a text that is only spaces between two elements: as it is');
});

test('www\'s no-break spaces around a bold word and a link stay in the paragraph; a heading\'s are plain', () => {
  const description = '<p>Your journey might begin in&nbsp;<b>Germany</b>, where&nbsp;<a href="https://www.airdolomiti.eu/flights-munich"><b>Munich</b></a>&nbsp;fascinates.</p><h3>Our&nbsp;destinations</h3>';
  const { html } = convert(withBlocks([{ name: 'lazyblock/title-description-text-cta', attributes: { tag: 'h2', title: 'The Fleet', description } }]), HOME);
  assert.ok(html.includes(`begin in${NB}<strong>Germany</strong>, where${NB}<a `), 'before the bold word and the link');
  assert.ok(html.includes(`</a>${NB}fascinates`), 'after the link');
  const h3 = html.match(/<h3[^>]*>Our.destinations<\/h3>/);
  assert.ok(h3 && h3[0].includes('Our destinations'), `the heading with a plain space: ${h3 && h3[0]}`);
});
