/* The block library per site (tools/library/sites.mjs): lh-com's library, its sheets and reports
   where they have been; lh-tap's built from lh-tap's own content (content-sites/lh-tap/content)
   into its own folder, manifest and reports, uploaded to DA moved-permanently/lh-tap under
   /library/ (blocks.json only), and a description for every block lh-tap's pages use.
   Run: node --max-old-space-size=512 --test test/library-sites.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteConfig, specFor } from '../tools/library/sites.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => path.relative(root, p);

test('lh-com (the default): the library, sheets, manifest and reports as before', () => {
  const s = siteConfig();
  assert.equal(s.name, 'lh-com');
  assert.equal(s.org, 'moved-permanently/lh-com');
  assert.equal(rel(s.content), 'content');
  assert.equal(rel(s.library), 'content/library');
  assert.equal(rel(s.manifest), 'tools/library/library-variants.json');
  assert.equal(rel(s.reports), 'tools/reports');
  assert.deepEqual(s.sheets, ['blocks.json', 'ema-library.json']);
  assert.equal(s.source, 'https://admin.da.live/source/moved-permanently/lh-com/library');
  assert.equal(s.preview, 'https://admin.hlx.page/preview/moved-permanently/lh-com/main/library');
  assert.equal(s.locales[0], '/de/en/');
  assert.ok(s.skipDirs.test('message-center') && s.skipPages.has('/index'));
  assert.deepEqual(siteConfig('lh-com'), s);
});

test('lh-tap: its own content, folder, manifest and reports; DA moved-permanently/lh-tap under /library/, blocks.json only', () => {
  const s = siteConfig('lh-tap');
  assert.equal(s.org, 'moved-permanently/lh-tap');
  assert.equal(rel(s.content), 'content-sites/lh-tap/content');
  assert.equal(rel(s.library), 'content-sites/lh-tap/content/library');
  assert.equal(rel(s.manifest), 'tools/library/sites/lh-tap/library-variants.json');
  assert.equal(rel(s.reports), 'tools/reports/lh-tap');
  assert.deepEqual(s.sheets, ['blocks.json']);
  assert.equal(s.source, 'https://admin.da.live/source/moved-permanently/lh-tap/library');
  assert.equal(s.preview, 'https://admin.hlx.page/preview/moved-permanently/lh-tap/main/library');
  assert.equal(s.locales[0], '/pt-pt/');
  assert.ok(s.skipDirs.test('library') && s.skipDirs.test('media-da'));
  assert.ok(!s.skipDirs.test('pt-pt'));
});

test('an unknown site is an error', () => {
  assert.throws(() => siteConfig('lh-xx'), /unknown site lh-xx/);
});

test('lh-tap\'s descriptions: its own where its blocks differ from lh-com\'s (booking-box, cards, columns), lh-com\'s otherwise', () => {
  assert.match(specFor('lh-tap', 'booking-box').description, /booking box/i);
  assert.doesNotMatch(specFor('lh-tap', 'cards').description, /starter page/);
  assert.doesNotMatch(specFor('lh-tap', 'columns').description, /starter page/);
  assert.equal(specFor('lh-tap', 'accordion-columns'), specFor('lh-com', 'accordion-columns'));
});

const tapManifest = path.join(root, 'tools/library/sites/lh-tap/library-variants.json');
test('every block of lh-tap\'s library has a description', { skip: !fs.existsSync(tapManifest) && 'lh-tap\'s library not built' }, () => {
  const blocks = new Set(Object.values(JSON.parse(fs.readFileSync(tapManifest, 'utf8'))).map((e) => e.block));
  assert.ok(blocks.has('booking-box'));
  blocks.forEach((b) => assert.ok(specFor('lh-tap', b).description, b));
});
