/* eslint-disable max-len */
/* The flight search's background video (blocks/flight-search, brief 260): a `Background video`
   row (a link to an .mp4) plays it behind the search as the hero does: muted, looped and inline
   over the Background image (its poster, shown until the video plays); with
   prefers-reduced-motion the picture alone. www.swiss.com's flight manager shows the Bengaluru
   video behind the search on nine pages (its promotion teaser's moving image). Without the row
   the band as before.
   Run: node --max-old-space-size=512 --test test/flight-search-background-video.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'swiss.turnsthe.page', pathname: '/ch/en/book-and-manage/flights', search: '', href: 'https://swiss.turnsthe.page/ch/en/book-and-manage/flights', origin: 'https://swiss.turnsthe.page',
};
let reduced = false;
window.matchMedia = (q) => ({ matches: /prefers-reduced-motion/.test(q) ? reduced : false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.matchMedia = window.matchMedia;
const { addBackground } = await import('../blocks/flight-search/flight-search.js');

const VIDEO = '/content/dam/lx/video/bengaluru-header-video-8017471.mp4';
const POSTER = 'https://content.da.live/moved-permanently/lh-swiss/content/dam/lx/images/frontify_variations/6/c-1455672767-478966716.jpg';
const cell = (html) => {
  const c = document.createElement('div');
  c.innerHTML = html;
  return c;
};
const block = () => {
  const wrapper = document.createElement('div');
  wrapper.className = 'flight-search-wrapper';
  const b = document.createElement('div');
  b.className = 'flight-search';
  wrapper.append(b);
  document.body.replaceChildren(wrapper);
  return b;
};

test('a Background video row: the video over the picture, muted, looped, inline, its poster the picture', () => {
  reduced = false;
  const b = block();
  addBackground(b, cell(`<picture><img src="${POSTER}" alt=""></picture>`), null, cell(`<a href="${VIDEO}">${VIDEO}</a>`));
  const band = b.parentElement.querySelector(':scope > .flight-search-background');
  assert.ok(band);
  assert.deepEqual([...band.children].map((c) => c.tagName.toLowerCase()), ['picture', 'video']);
  const video = band.querySelector('video');
  assert.equal(video.className, 'flight-search-video');
  ['muted', 'loop', 'playsinline', 'autoplay'].forEach((a) => assert.ok(video.hasAttribute(a), a));
  assert.equal(video.getAttribute('aria-hidden'), 'true');
  assert.equal(video.getAttribute('preload'), 'metadata');
  assert.equal(video.getAttribute('poster'), POSTER);
  assert.equal(video.querySelector('source').getAttribute('src'), VIDEO);
  assert.equal(video.querySelector('source').getAttribute('type'), 'video/mp4');
  assert.ok(b.parentElement.classList.contains('flight-search-band'));
});

test('prefers-reduced-motion: the picture alone', () => {
  reduced = true;
  const b = block();
  addBackground(b, cell(`<picture><img src="${POSTER}" alt=""></picture>`), null, cell(`<a href="${VIDEO}">x</a>`));
  const band = b.parentElement.querySelector('.flight-search-background');
  assert.deepEqual([...band.children].map((c) => c.tagName.toLowerCase()), ['picture']);
  reduced = false;
});

test('without the row, or a link that is no .mp4: the band as before', () => {
  const plain = block();
  addBackground(plain, cell(`<picture><img src="${POSTER}" alt=""></picture>`));
  const before = plain.parentElement.outerHTML;
  const other = block();
  addBackground(other, cell(`<picture><img src="${POSTER}" alt=""></picture>`), null, cell('<a href="/x.pdf">x</a>'));
  assert.equal(other.parentElement.outerHTML, before);
});

test('flight-search.js reads the row; the CSS shows the video once it plays', () => {
  const js = fs.readFileSync('blocks/flight-search/flight-search.js', 'utf8');
  assert.match(js, /pick\(config, 'background-video'\)/);
  const css = fs.readFileSync('blocks/flight-search/flight-search.css', 'utf8');
  assert.match(css, /\.flight-search-band > \.flight-search-background \.flight-search-video \{[^}]*position: absolute;[^}]*object-fit: cover;[^}]*opacity: 0;/);
  assert.match(css, /\.flight-search-video\.is-playing \{[^}]*opacity: 1;/);
});
