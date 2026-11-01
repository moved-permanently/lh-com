/* eslint-disable import/no-extraneous-dependencies -- js-yaml is a dev dependency */
/* Air Dolomiti's post cards show the post's featured photo (its article-header's image) instead of
   the share image (og:image: on many posts www's "BLOG" picture): helix-query.yaml
   articles-airdolomiti-it, -en, -de take image (and image-alt) from the article-header's first
   image (/media_<hash>.<ext>: media resolve under any path) and keep the share image as
   share-image (share-image-alt); scripts/articles.js uses the share image only for a post without
   a header image (70 of 564 posts, 2026-11-01). Every other index and lufthansa.com's article rows
   as before.
   Run: node --max-old-space-size=512 --test test/airdolomiti-blog-images.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';

const AD = ['articles-airdolomiti-it', 'articles-airdolomiti-en', 'articles-airdolomiti-de'];
const now = yaml.load(fs.readFileSync('helix-query.yaml', 'utf8')).indices;
const before = yaml.load(execFileSync('git', ['show', 'HEAD:helix-query.yaml'], { encoding: 'utf8' })).indices;

test('the three posts indexes: image from the article-header, the share image kept as share-image', () => {
  AD.forEach((k) => {
    const p = now[k].properties;
    assert.equal(p.image.select, 'main .article-header img', k);
    assert.equal(p.image.value, 'match(attribute(el, "src"), "^\\.(/media_[^?]+)")', k);
    assert.equal(p['image-alt'].select, 'main .article-header img', k);
    assert.equal(p['image-alt'].value, 'attribute(el, "alt")', k);
    // the share image as the index had it as image (og:image, its path)
    assert.deepEqual(p['share-image'], {
      select: 'head > meta[property="og:image"]',
      value: 'match(attribute(el, "content"), "https:\\/\\/[^/]+(/.*)")',
    }, k);
    assert.deepEqual(p['share-image-alt'], { select: 'head > meta[property="og:image:alt"]', value: 'attribute(el, "content")' }, k);
    // the other properties as before
    ['title', 'description', 'category', 'publication-date', 'reading-time', 'lastModified'].forEach((n) => {
      assert.equal(JSON.stringify(p[n]), JSON.stringify(before[k].properties[n]), `${k} ${n}`);
    });
    assert.deepEqual(now[k].include, before[k].include);
    assert.equal(now[k].target, before[k].target);
  });
  assert.equal(JSON.stringify(now['articles-airdolomiti-en'].properties), JSON.stringify(now['articles-airdolomiti-it'].properties));
  assert.equal(JSON.stringify(now['articles-airdolomiti-de'].properties), JSON.stringify(now['articles-airdolomiti-it'].properties));
});

test('every other index as before, in its place', () => {
  // in its place: the indexes before as they were, later ones only appended after them
  assert.deepEqual(Object.keys(now).slice(0, Object.keys(before).length), Object.keys(before));
  Object.keys(before).filter((k) => !AD.includes(k)).forEach((k) => {
    assert.equal(JSON.stringify(now[k]), JSON.stringify(before[k]), k);
  });
});

test('toArticle: the header image, else the share image; lufthansa.com\'s rows as before', async () => {
  const { toArticle } = await import('../scripts/articles.js');
  const photo = toArticle({
    path: '/articoli/didyouknow/x', image: '/media_19e64242bba965297308130eab09bead780d0a12a.jpg', 'image-alt': 'Lufthansa upcycling collection', 'share-image': '/articoli/didyouknow/media_12c900a5123d610ec2524a3e856527cde2a2c91c7.png?width=1200', 'share-image-alt': 'BLOG',
  });
  assert.equal(photo.image, '/media_19e64242bba965297308130eab09bead780d0a12a.jpg');
  assert.equal(photo.imageAlt, 'Lufthansa upcycling collection');
  const noHeader = toArticle({
    path: '/en/articles/dyk/5-apps-for-travellers', image: '', 'image-alt': '', 'share-image': '/default-meta-image.png?width=1200', 'share-image-alt': 'Air Dolomiti',
  });
  assert.equal(noHeader.image, '/default-meta-image.png?width=1200');
  assert.equal(noHeader.imageAlt, 'Air Dolomiti');
  const lh = toArticle({ path: '/de/en/articles/highlights/a', image: '/de/en/articles/highlights/media_1.jpg', 'image-alt': 'A' });
  assert.equal(lh.image, '/de/en/articles/highlights/media_1.jpg');
  assert.equal(lh.imageAlt, 'A');
  assert.equal(toArticle({ path: '/x' }).image, '');
});
