/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* ema-adobe's handover item 7 (lh-com-handover-ema-test.md, brief 526; the brief after 532, item 1a): an article's ruled
   chapters get their rule, but not a section of www's own that opens with a heading and a block right under it
   (be-picky-barcelona-insider-tips' "This may also be of interest to you" with its carousel, www draws no rule: +25 px).
   A chapter (a heading followed by text, a list, a bold chapter title) keeps it.
   Run: node --max-old-space-size=512 --test test/chapter-rule-teaser-532.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { THEMES } from '../scripts/style-markers.js';

const page = (html) => {
  const { document } = parseHTML(`<html><head></head><body><main>${html}</main></body></html>`);
  globalThis.document = document;
  return document.querySelector('main');
};
const { default: decorateTokenFree } = await import('../scripts/token-free.js');
const live = (fn) => {
  const had = THEMES.lufthansa.live;
  THEMES.lufthansa.live = true;
  try { fn(); } finally { if (had === undefined) delete THEMES.lufthansa.live; else THEMES.lufthansa.live = had; }
};
const ruled = (section) => section.firstElementChild.matches('p.spacer.divider');

test('no chapter rule above a heading a block follows right away; chapters keep theirs', () => live(() => {
  const main = page([
    '<div><div class="article-header"><div><div>h</div></div></div><p>Intro</p></div>',
    '<div><h2>About</h2><p>Text</p></div>',
    '<div><h3>Chiswick, London – More Tips</h3><ul><li>One</li></ul></div>',
    '<div><p><strong>Selected Tips – Additional Ideas</strong></p><p>Text</p></div>',
    '<div><h2>This may also be of interest to you</h2><div class="carousel-cards"><div><div>x</div></div></div></div>',
    '<div><h3>Related Articles</h3><div class="related-articles"><div><div>x</div></div></div></div>',
    '<div><h2>Alone</h2><div class="section-metadata"><div><div>style</div><div>grey</div></div></div></div>',
  ].join(''));
  decorateTokenFree(main, { brand: '', path: '/de/en/articles/explore-the-world/be-picky-barcelona-insider-tips' });
  const [, about, tips, bold, teaser, related, alone] = main.querySelectorAll(':scope > div');
  assert.ok(ruled(about) && ruled(tips) && ruled(bold), 'the chapters keep their rule');
  assert.ok(!ruled(teaser), 'www\'s teaser section: no rule');
  assert.ok(!ruled(related), 'Related Articles: no rule, as before');
  assert.ok(ruled(alone), 'a heading with only the section\'s metadata after it is still a chapter start');
}));
