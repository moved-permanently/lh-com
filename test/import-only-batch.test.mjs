/* eslint-disable max-len, import/extensions */
/* An import run never takes a link back to www outside its batch (tools/importer/own-links.mjs
   onlyBatch, around site-postprocess.mjs in ita-import.mjs and austrian-import.mjs): ITA's footers'
   /<root>/profile/miles-and-more and Austrian's navs' /<root>/login, relative in DA, became www
   links again when a later batch ran; a change that only makes links relative (links to the
   batch's new pages) stays.
   Run: node --max-old-space-size=512 --test test/import-only-batch.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { onlyMadeRelative, linksTakenBack } from '../tools/importer/own-links.mjs';

const footer = (href) => `<div><ul><li><a href="${href}">Miles &#x26; More</a></li><li><a href="/it/en/legal">Legal</a></li></ul></div>`;

test('a link taken back to www is no relative-only change', () => {
  assert.equal(onlyMadeRelative(footer('/it/en/profile/miles-and-more'), footer('https://www.ita-airways.com/it/en/profile/miles-and-more')), false);
});

test('links made relative, and nothing else, are', () => {
  assert.equal(onlyMadeRelative(footer('https://www.ita-airways.com/it/en/volare'), footer('/it/en/volare')), true);
  assert.equal(onlyMadeRelative(footer('https://www.ita-airways.com/it/en/volare'), `${footer('/it/en/volare')}<p>more</p>`), false);
});

test('da-upload: a local copy that links on www what DA links relative is named (not uploaded)', () => {
  const da = `<body><header></header><main>${footer('/it/en/profile/miles-and-more')}</main><footer></footer></body>`;
  assert.deepEqual(linksTakenBack(da, footer('https://www.ita-airways.com/it/en/profile/miles-and-more')), ['/it/en/profile/miles-and-more']);
  assert.deepEqual(linksTakenBack(da, footer('/it/en/profile/miles-and-more')), [], 'the same links: uploaded');
  assert.deepEqual(linksTakenBack(da, footer('/it/en/profile/travel-id')), [], 'another relative link: no www link taken back');
});

test('onlyBatch puts back what the step took to www outside the batch, keeps the batch', async () => {
  // the helper works on content-sites/<site>/content of the repo: a scratch site there
  const repo = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
  const site = `test-only-batch-${process.pid}`;
  const dir = path.join(repo, 'content-sites', site, 'content', 'it', 'en');
  fs.mkdirSync(dir, { recursive: true });
  try {
    const { onlyBatch } = await import('../tools/importer/own-links.mjs');
    fs.writeFileSync(path.join(dir, 'footer.plain.html'), footer('/it/en/profile/miles-and-more'));
    fs.writeFileSync(path.join(dir, 'sitemap.plain.html'), footer('https://www.ita-airways.com/it/en/new-page'));
    fs.writeFileSync(path.join(dir, 'new-page.plain.html'), footer('/it/en/x'));
    const { restored } = onlyBatch(site, new Set(['/it/en/new-page']), () => {
      fs.writeFileSync(path.join(dir, 'footer.plain.html'), footer('https://www.ita-airways.com/it/en/profile/miles-and-more'));
      fs.writeFileSync(path.join(dir, 'sitemap.plain.html'), footer('/it/en/new-page'));
      fs.writeFileSync(path.join(dir, 'new-page.plain.html'), footer('https://www.ita-airways.com/it/en/x'));
    });
    assert.deepEqual(restored, ['/it/en/footer']);
    assert.equal(fs.readFileSync(path.join(dir, 'footer.plain.html'), 'utf8'), footer('/it/en/profile/miles-and-more'));
    assert.equal(fs.readFileSync(path.join(dir, 'sitemap.plain.html'), 'utf8'), footer('/it/en/new-page'), 'made relative: kept');
    assert.equal(fs.readFileSync(path.join(dir, 'new-page.plain.html'), 'utf8'), footer('https://www.ita-airways.com/it/en/x'), 'the batch as the step left it');
  } finally {
    fs.rmSync(path.join(repo, 'content-sites', site), { recursive: true, force: true });
  }
});
