/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 484, item B: a list whose last item ends with a text size ("{copytext-medium}") showed the marker as text:
   SWISS's /ch/en/prepare/baggage/sports-equipment and its other languages (44 markers). The list markers
   (scripts/style-markers.js LIST_STYLE, read by scripts.js decorateTextStyles) take the text sizes as paragraphs do, the
   list gets the same class, and styles.css sizes lists with it as paragraphs. Fixture: that page's lists.
   Run: node --max-old-space-size=256 --test test/style-markers-lists.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { LIST_STYLE, PARAGRAPH_STYLE } from '../scripts/style-markers.js';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');

test('the SWISS lists: the last item\'s "{copytext-medium}" is read as the list\'s style', () => {
  const { document } = parseHTML(read('./fixtures/style-markers/swiss-sports-equipment-lists.html'));
  const lists = [...document.querySelectorAll('ul')];
  assert.ok(lists.length >= 3, String(lists.length));
  lists.forEach((ul) => {
    const last = [...ul.children].filter((li) => li.tagName === 'LI').pop();
    const m = last.textContent.match(LIST_STYLE);
    assert.ok(m, last.textContent.slice(-60));
    assert.equal(m[1], 'copytext-medium');
  });
  ['copytext-small', 'copytext-large', 'copytext-small full-width', 'full-width', 'column-end'].forEach((t) => assert.match(`Item {${t}}`, LIST_STYLE, t));
  assert.doesNotMatch('Item {caption}', LIST_STYLE, 'paragraph-only markers stay paragraph-only');
  assert.match('Text {copytext-medium}', PARAGRAPH_STYLE);
});

test('styles.css: the text sizes on lists as on paragraphs', () => {
  const css = read('../styles/styles.css').replace(/\s+/g, ' ');
  ['small', 'medium', 'large'].forEach((size) => assert.match(css, new RegExp(`main :is\\(p, ul, ol\\)\\.copytext-${size} \\{`), size));
});

test('scripts.js reads the shared lists (no copy of its own)', () => {
  const js = read('../scripts/scripts.js');
  assert.match(js, /import \{\s*HEADING_STYLE, PARAGRAPH_STYLE, LIST_STYLE, SEPARATOR,(?: BLANK_LINE,)?\s*\} from '\.\/style-markers\.js';/);
  assert.ok(!/const LIST_STYLE =/.test(js));
});
