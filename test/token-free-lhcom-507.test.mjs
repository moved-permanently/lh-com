/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* ema-adobe's lufthansa.com pass check (tools/reports/token-free/lh-com-handover-ema-test.md, items 2, 4, 5), in ema-test's
   files: /100-years has no sections-m (its campaign sections carry www's spacing); a caption in a block's cell keeps the
   caption class "{caption}" gave it; the ruled chapters' rule is not drawn above the Related Articles.
   Run: node --max-old-space-size=512 --test test/token-free-lhcom-507.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { THEMES, themeFor } from '../scripts/style-markers.js';

const page = (html) => {
  const { document } = parseHTML(`<html><head></head><body><main>${html}</main></body></html>`);
  globalThis.document = document;
  return document.querySelector('main');
};
const { default: decorateTokenFree } = await import('../scripts/token-free.js');
const PIC = '<picture><img src="/media_1.jpg" alt="A view"></picture>';
const liveLufthansa = (fn) => {
  const had = THEMES.lufthansa.live;
  THEMES.lufthansa.live = true;
  try { fn(); } finally { if (had === undefined) delete THEMES.lufthansa.live; else THEMES.lufthansa.live = had; }
};

test('/100-years has no page-type rule of its own any more', () => {
  assert.deepEqual(themeFor('lufthansa', '100-years').rules, []);
  liveLufthansa(() => {
    const main = page('<div><h2>A</h2><p>a</p></div><div><h2>B</h2><p>b</p></div>');
    decorateTokenFree(main, { brand: '', path: '/de/en/100-years/chronicle' });
    assert.equal(main.querySelectorAll('p.spacer').length, 0);
  });
});

test('a caption in a block cell: the italic paragraph after an image gets the class caption (theme on or off)', () => {
  const html = `<div><div class="columns-media"><div><div><p>${PIC}</p><p><em>The view</em></p><p>Text</p></div></div></div><p>${PIC}</p><p><em>Own</em></p></div>`;
  const main = page(html);
  decorateTokenFree(main, { brand: '', path: '/de/en/x' });
  const cell = main.querySelector('.columns-media > div > div');
  assert.deepEqual([...cell.children].map((p) => p.className), ['', 'caption', '']);
  assert.ok(main.querySelector(':scope > div > figure.image-caption'), 'a section\'s own caption: the figure, as before');
});

test('an article\'s ruled chapters: no rule above the Related Articles', () => {
  liveLufthansa(() => {
    const main = page('<div><div class="article-header"><div><div>h</div></div></div><p>Intro</p></div><div><h2>Chapter</h2><p>Text</p></div>'
      + '<div><h3>Related Articles</h3><div class="related-articles"><div><div>x</div></div></div></div>');
    decorateTokenFree(main, { brand: '', path: '/de/en/articles/x' });
    const [, chapter, related] = main.querySelectorAll(':scope > div');
    assert.ok(chapter.firstElementChild.matches('p.spacer.divider'));
    assert.ok(!related.firstElementChild.matches('p.spacer'), 'Related Articles without a rule');
  });
});
