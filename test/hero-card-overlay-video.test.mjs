/* eslint-disable max-len, import/extensions */
/* The hero's video (blocks/hero-card-overlay, brief 255): a hero document that links an .mp4 (as
   SWISS's main stage teaser, www's moving image with its videoUrl: the Bengaluru header video on
   the ch/en and ch/de homepages) plays it muted, looped and inline over its picture, the picture
   first (the video's poster and what shows until it plays); with prefers-reduced-motion the
   picture alone. The link is no card content. Every other hero (the brands' heroes on preview,
   test/fixtures/heroes) decorates as before: its markup's hash from before the option.
   Run: node --max-old-space-size=512 --test test/hero-card-overlay-video.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { heroOf, hashOf, FIXTURES } = await import('./hero-harness.mjs');
const HASHES = JSON.parse(fs.readFileSync(new URL('./fixtures/heroes/hashes.json', import.meta.url), 'utf8'));

FIXTURES.forEach((f) => {
  test(`${f}: as before`, () => {
    assert.equal(hashOf(heroOf(f)), HASHES[f]);
  });
});

const VIDEO = '/content/dam/lx/video/bengaluru-header-video-8017471.mp4';
const swiss = () => fs.readFileSync(new URL('./fixtures/heroes/lh-swiss-ch-en-homepage-0.html', import.meta.url), 'utf8')
  .replace(/<\/picture>\s*<\/div>/, `</picture><p><a href="${VIDEO}">${VIDEO}</a></p></div>`);

test('a hero linking an mp4: the video muted, looped, inline over the picture; the picture its poster', () => {
  const block = heroOf(swiss());
  const media = block.querySelector('.hero-card-overlay-media');
  assert.deepEqual([...media.children].map((c) => c.tagName.toLowerCase()), ['picture', 'video']);
  const video = media.querySelector('video');
  assert.equal(video.className, 'hero-card-overlay-video');
  ['muted', 'loop', 'playsinline', 'autoplay'].forEach((a) => assert.ok(video.hasAttribute(a), a));
  assert.equal(video.getAttribute('aria-hidden'), 'true', 'a decoration: the card carries the content');
  assert.equal(video.getAttribute('preload'), 'metadata');
  const poster = media.querySelector('picture img').getAttribute('src');
  assert.equal(video.getAttribute('poster'), poster);
  const source = video.querySelector('source');
  assert.equal(source.getAttribute('src'), VIDEO);
  assert.equal(source.getAttribute('type'), 'video/mp4');
  assert.ok(block.classList.contains('hero-card-overlay-has-video'));
  assert.ok(!block.querySelector('.hero-card-overlay-card a[href$=".mp4"]'), 'the link is no card content');
  assert.match(block.querySelector('.hero-card-overlay-card h2').textContent, /Bengaluru/);
  assert.ok(block.querySelector('.hero-card-overlay-card .hero-card-overlay-cta a'), 'the CTA as before');
});

test('prefers-reduced-motion: the picture alone, no video, the link gone too', () => {
  const block = heroOf(swiss(), { reducedMotion: true });
  const media = block.querySelector('.hero-card-overlay-media');
  assert.deepEqual([...media.children].map((c) => c.tagName.toLowerCase()), ['picture']);
  assert.ok(!block.querySelector('a[href$=".mp4"]'));
  assert.ok(!block.classList.contains('hero-card-overlay-has-video'));
});

test('hero-card-overlay.css: the video covers the media area, shown once it plays', () => {
  const css = fs.readFileSync('blocks/hero-card-overlay/hero-card-overlay.css', 'utf8');
  assert.match(css, /\.hero-card-overlay \.hero-card-overlay-video \{[^}]*position: absolute;[^}]*object-fit: cover;[^}]*opacity: 0;/);
  assert.match(css, /\.hero-card-overlay \.hero-card-overlay-video\.is-playing \{[^}]*opacity: 1;/);
});
