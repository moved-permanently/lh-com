/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 5 (2026-11-12), item 2: the info-page switch.
   1. A column view inside a column view (www's .column-view in a .column-view; 247 nested starts in 193 of the 1,862
      published column-mark documents) kept no padding of its own after the collapse: the collapse made one view of the
      outermost marks, and /de/en/lufthansa-express-rail's "Your benefits" cards sat 64 px closer to their title than on
      www. Now the outer view's part before the inner view, the inner view and the outer view's rest are views of their
      own, each with its view's padding. A part with nothing but mark paragraphs and separators (two starts in a row)
      is no view.
   2. styles.css: a flush grey column band (more of its AEM section follows) keeps its section gap before a view
      (rail-and-fly: www 130 px of ink under the band, ours 38). The lounges rule (a band of its own, no gap) is unchanged.
   The 12-page sample (logs/b597, % off www at 1440 / 390, main -> this): express-rail 20.4 -> 11.9 / 8.5 -> 8.0, rail-and-fly
   8.0 -> 5.0 / 12.1 -> 9.1, the other ten unchanged.
   Run: node --max-old-space-size=512 --test test/nested-column-views-so5.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { lossProblems } from '../tools/importer/collapse-loss-check.mjs';

const run = (html) => collapseHtml(html, { path: '/de/en/lufthansa-express-rail', brand: 'lufthansa', parse: parseHTML, force: true });
const sections = (html) => {
  const { document } = parseHTML(`<main>${html}</main>`);
  return [...document.querySelectorAll('main > div')].map((d) => {
    const meta = d.querySelector(':scope > div.section-metadata');
    const style = meta ? [...meta.children].find((r) => /^style$/i.test(r.firstElementChild?.textContent.trim()))?.lastElementChild.textContent.trim() || '' : '';
    if (meta) meta.remove();
    return `${d.textContent.replace(/\s+/g, '')}${style ? ` [${style}]` : ''}`;
  });
};
const checked = (html) => {
  const r = run(html);
  assert.deepEqual(lossProblems(html, r.html), [], 'nothing lost, nothing moved');
  return r;
};
const cards = '<div class="columns-media"><div><div><h4>Card</h4></div></div></div>';

test('express-rail\'s shape: a block in a view of its own inside the outer view: three views', () => {
  const r = checked(`<div><p>Intro</p><h2>Your benefits {column-start}</h2><p>{column-start}</p>${cards}<p>{column-end}</p><p>Note {copytext-small column-end}</p><h2>Book {column-start}</h2><p>Text {column-end}</p></div>`);
  assert.deepEqual(sections(r.html), ['Intro', 'Yourbenefits [column-view, flush]', 'Card [column-view, flush]', 'Note [column-view, flush, small-print]', 'BookText [column-view]']);
});

test('rail-and-fly\'s shape: two starts in a row (a mark paragraph, then the heading) open one view, no empty one', () => {
  const r = checked(`<div><p>{column-start}</p><h2>Book Rail&amp;Fly {column-start}</h2>${cards}<p>{column-end}</p><p>Then {column-end}</p></div>`);
  const s = sections(r.html);
  assert.deepEqual(s, ['BookRail&FlyCard [column-view, flush]', 'Then [column-view]']);
  assert.ok(s.every((x) => !/^\[/.test(x)), 'no view without content');
});

test('a separator before the inner view: no view of its own (advance-seat-reservation\'s divider), the separator opens the next view', () => {
  const r = checked(`<div><p>{column-start}</p><p>{divider-25}</p><p>{column-start}</p>${cards}<p>{column-end}</p><p>Rest {column-end}</p></div>`);
  const s = sections(r.html);
  assert.ok(s.every((x) => !/^\[/.test(x)), `no empty view: ${s.join(' | ')}`);
  assert.ok(s.some((x) => /^Card \[.*column-view/.test(x)));
});

test('no nesting: as before (one view per group)', () => {
  const r = checked('<div><h2>A {column-start}</h2><p>T {column-end}</p><h2>B {column-start}</h2><p>U {column-end}</p></div>');
  assert.deepEqual(sections(r.html), ['AT [column-view, flush]', 'BU [column-view]']);
});

test('styles.css: the band-before-view rule leaves a flush band its section gap', () => {
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('body.brand-lufthansa main > .section.grey.column-band:not(.flush):has(+ .section.column-view) { margin-bottom: 0; }'));
  assert.ok(!css.includes('body.brand-lufthansa main > .section.grey.column-band:has(+ .section.column-view)'), 'the old selector is gone');
});
