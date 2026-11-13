/* eslint-disable max-len */
/* TAP rows 154 and 155 (measured in standing order 14, applied in 15): plain text as www's rich text, and the page's end.
   www (the 25 recorded pages' default content, its offline renders against ours, text pair by pair): a paragraph or
   list 16 px over the paragraph or list after it (ours 24), list items 8 apart with the last one's inside its list (a
   list 24 px over a paragraph, 40 / 72 over a heading), a heading after text 64 px under it from 1024 px and 32 below
   (ours 40 / 24), the intro paragraph (right under the H1) 32 px over the next paragraph and the first heading; only the
   gaps between text elements (a paragraph before a block keeps its 24). The page's end: www's main 64 px over its
   footer from 1024 px (help, tap-fares, time-to-think), ours the last section's 48. Reads tap.css as written.
   Run: node --max-old-space-size=256 --test test/tap-text-rhythm-154.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const body = (sel, from = css) => {
  const at = from.indexOf(`${sel} {`);
  return at < 0 ? null : from.slice(at, from.indexOf('}', at));
};
const T = 'body.brand-tap main .default-content-wrapper';
const wide = (sel) => {
  const at = css.indexOf(`  ${sel} {`);
  const media = at < 0 ? -1 : css.lastIndexOf('@media', at);
  return { rule: at < 0 ? null : css.slice(at, css.indexOf('}', at)), media: media < 0 ? '' : css.slice(media, css.indexOf('{', media)) };
};

test('text 16 px apart, only before more text; list items 8, the last one inside its list', () => {
  assert.match(body(`${T} > :is(p, ul, ol):not(.button-wrapper, .link-wrapper):has(+ :is(p, ul, ol):not(.button-wrapper, .link-wrapper))`) || '', /margin-bottom: 16px;/);
  assert.match(body(`${T} li`) || '', /margin-bottom: 8px;/);
  assert.match(body(`${T} > :is(ul, ol):has(+ :is(p, h2):not(.button-wrapper, .link-wrapper))`) || '', /display: flow-root;/);
});

test('a heading after text: 32 px, 64 from 1024 px; the intro 32 over the next paragraph and the first heading', () => {
  assert.match(body(`${T} > :is(p, ul, ol) + h2`) || '', /margin-top: 32px;/);
  const w = wide(`${T} > :is(p, ul, ol) + h2`);
  assert.match(w.rule || '', /margin-top: 64px;/);
  assert.match(w.media, /width >= 1024px/);
  assert.match(body(`${T} > h1 + p:not(.button-wrapper, .link-wrapper):has(+ p:not(.button-wrapper, .link-wrapper))`) || '', /margin-bottom: 32px;/);
  assert.match(body(`${T} > :is(h1 + p + h2, h1 + p + p + h2, h1 + p + p + p + h2)`) || '', /margin-top: 32px;/);
});

test('the page\'s end: the last section 64 px over the footer from 1024 px', () => {
  const w = wide('body.brand-tap main > .section:last-child');
  assert.match(w.rule || '', /margin-bottom: 64px;/);
  assert.match(w.media, /width >= 1024px/);
});
