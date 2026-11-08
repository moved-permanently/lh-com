/* eslint-disable max-len */
/* Brief 500 item 2, /de/en/articles/tags/allegris (29.8 % at 1440, 27.0 at 390 as a draft): the list cards' tag chips
   are www's maui tags, 40 px tall at 1440 and 390 ("Team Stories" 121 px wide: 16 px text on a 24 px line, 7 / 15 px
   padding inside a 1 px border); ours 26 px (14 / 18, 3 / 11 px), 14 px short per card. lufthansa.com only (the SWISS
   magazine and the other brands keep theirs).
   Run: node --test test/blog-overview-tag-chips-500.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('blocks/blog-overview/blog-overview.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('lufthansa.com: tag chips 40 px tall, 16 / 24 px text, 7 / 15 px padding', () => {
  assert.ok(css.includes('body.brand-lufthansa .blog-overview .blog-overview-tags > li { padding: 7px 15px; font-size: 16px; line-height: 24px; }'));
  assert.ok(css.includes('.blog-overview .blog-overview-tags > li { margin: 0; padding: 3px 11px;'), 'the default chip stays');
});
