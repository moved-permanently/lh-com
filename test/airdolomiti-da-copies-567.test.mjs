/* eslint-disable max-len */
/* Air Dolomiti's pictures by DA's copies (the standing order of 2026-11-10, item 2a): the importer wrote www's
   cms.airdolomiti.it address for a picture it had not downloaded itself, and the import helper patched each such page to
   DA's copy after the import. DA's copies are named from the www URL (airdolomiti-assets.mjs: /media-da/airdolomiti/
   <readable name>-<sha1 of the URL, 8>.<ext>) and lh-airdolomiti's upload state lists them, so the import writes DA's copy
   for any picture DA has, a resized copy's original too; a picture DA lacks keeps www's address (as before: the helper's
   download step takes it). Files www answers 404 for (airdolomiti-missing-assets.json, as Austrian's
   austrian-missing-assets.json) are left out. Offline: the homepage fixture of airdolomiti-herohome.test.mjs with a
   block in its blocks; real URLs from airdolomiti-parity-004 /reiseziele/bari-de.
   Run: node --max-old-space-size=512 --test test/airdolomiti-da-copies-567.test.mjs */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
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
const { copyPath, daCopyOf, missingAssets } = await import('../tools/importer/airdolomiti-media.mjs');
// a listed missing file (the list itself starts empty: entries need www's recorded answer)
const GONE = 'https://cms.airdolomiti.it/wp-content/uploads/2021/11/gone-on-www.jpg';
const list = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ad-missing-')), 'missing.json');
fs.writeFileSync(list, JSON.stringify({ assets: [{ url: GONE, answer: '404 (test)' }] }));
missingAssets(list);
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
const card = (url) => ({
  name: 'lazyblock/cardfullwidth', attributes: { tag: 'h2', title: `Card ${url.split('/').pop()}`, backgroundImage: { url, alt: '' } },
});
const IN_DA = 'https://cms.airdolomiti.it/wp-content/uploads/2021/11/Blog.jpg';
const RESIZED = 'https://cms.airdolomiti.it/wp-content/uploads/2021/12/prenota-volo-2-300x200.png';
const NOT_IN_DA = 'https://cms.airdolomiti.it/wp-content/uploads/2021/11/Logo-LinkedIn_footer.png';

test('the copies\' names as airdolomiti-assets.mjs names them; DA\'s copy found for a picture DA has', () => {
  assert.equal(copyPath(IN_DA, 'image/jpeg'), '/media-da/airdolomiti/blog-f8fb5c15.jpg');
  assert.equal(copyPath('https://cms.airdolomiti.it/wp-content/uploads/2021/11/Plan.svg', 'image/svg+xml').endsWith('.png'), true);
  assert.equal(daCopyOf(IN_DA), '/media-da/airdolomiti/blog-f8fb5c15.jpg');
  assert.equal(daCopyOf(`${IN_DA}?ver=2`), '/media-da/airdolomiti/blog-f8fb5c15.jpg', 'without the query');
  assert.equal(daCopyOf(NOT_IN_DA), null);
});

test('the import writes DA\'s copy (a resized copy\'s original too), www\'s address only where DA has none, nothing for a listed 404', () => {
  const { html } = convert(withBlocks([card(IN_DA), card(RESIZED), card(NOT_IN_DA), card(GONE)]), HOME);
  assert.match(html, /<img src="\/media-da\/airdolomiti\/blog-f8fb5c15\.jpg"/);
  assert.match(html, /<img src="\/media-da\/airdolomiti\/prenota-volo-2-c21e0de9\.png"/);
  assert.doesNotMatch(html, /src="[^"]*(?:Blog\.jpg|prenota-volo-2-300x200)/);
  assert.match(html, /<img src="https:\/\/cms\.airdolomiti\.it\/wp-content\/uploads\/2021\/11\/Logo-LinkedIn_footer\.png"/);
  assert.doesNotMatch(html, /src="[^"]*gone-on-www/);
  assert.match(html, /<h2>Card gone-on-www\.jpg<\/h2>/, 'the card stays, without its picture');
});
