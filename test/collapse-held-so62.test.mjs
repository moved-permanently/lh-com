/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 62 item 2: the collapse on DA's source of the documents helper B held (plan 923 §16).
   - A block's title option draws every heading of the block in its level's choice, so it is not written when it would change
     a heading that asks for nothing: lhg-wifi's H2 over three H3 heading-small (36 -> 48 px); then a level-scoped option
     (h3-large) where every heading of that level asks for the same choice: first-class's sidebar H3 over an unmarked H4.
   - A split part no longer copies the section's padded or flush (the served form, with styles as classes, never did, and
     plan 923's gate measured that): free2move's DA copy drew three padded boxes (+166 px at 1440); digital-self-services'
     views split from their Spacer took its flush (14.67 % at 1440 against 3.65).
   Run: node --test test/collapse-held-so62.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { readBlockOptions, BLOCK_OPTIONS } from '../scripts/style-markers.js';

const FLOW = '<div><div class="metadata"><div><div>Theme</div><div>flow-spacing</div></div></div></div>';
const run = (html, path = '/de/en/x') => collapseHtml(html, {
  path, brand: 'lufthansa', parse: parseHTML, force: true,
}).html;
const cls = (html, name) => (html.match(new RegExp(`class="(${name}[^"]*)"`)) || [])[1];

test('a title option that would change an unmarked heading of another level: the level-scoped option instead', () => {
  // lhg-wifi: an H2, then three H3 heading-small (on a flow page H3 large = heading-small)
  const wifi = run(`<div><div class="columns-media"><div><div><h2>Wi-Fi</h2><h3>A {heading-small}</h3><h3>B {heading-small}</h3><h3>C {heading-small}</h3></div></div></div></div>${FLOW}`);
  assert.equal(cls(wifi, 'columns-media'), 'columns-media h3-large', wifi);
  // first-class: a sidebar with an H3 heading-small and an unmarked H4
  const side = run(`<div><div class="columns-media sidebar"><div><div><h3>Personal Assistants {heading-small}</h3><h4>Contact</h4></div></div></div></div>${FLOW}`);
  assert.equal(cls(side, 'columns-media'), 'columns-media sidebar h3-large', side);
  // a block whose headings all ask the same: the title option, as before
  const all = run(`<div><div class="columns-media padded"><div><div><h3>A {heading-small}</h3><h3>B {heading-small}</h3></div></div></div></div>${FLOW}`);
  assert.equal(cls(all, 'columns-media'), 'columns-media padded title-large', all);
  // an H4 the title option leaves alone (no H4 compact choice): the title option still
  const h4 = run(`<div><div class="columns-media"><div><div><h3>A {heading-copytext-large}</h3><h3>B {heading-copytext-large}</h3><h4>C</h4></div></div></div></div>${FLOW}`);
  assert.ok(!/h3-compact/.test(h4), h4);
  ['h2-large', 'h2-compact', 'h2-small', 'h3-large', 'h4-large'].forEach((o) => assert.ok(BLOCK_OPTIONS[o], o));
  assert.deepEqual(readBlockOptions(['h3-large']).headings, { h3: 'large' });
});

test('a view split from its Spacer block: the view part takes the section\'s styles but flush (as the served form)', () => {
  const meta = '<div class="section-metadata"><div><div>style</div><div>flush, column-view, padded</div></div></div>';
  const html = run(`<div><h1>T</h1><p>Intro</p></div><div><div class="spacer"><div><div></div></div></div><h2>A {column-start-outer}</h2><div class="cards-icon-text partner"><div><div>x</div></div></div><p>{column-end-outer}</p>${meta}</div>${FLOW}`);
  const { document } = parseHTML(`<html><body><main>${html}</main></body></html>`);
  const view = [...document.querySelector('main').children].find((s) => s.querySelector(':scope > h2'));
  const style = [...view.querySelectorAll(':scope > .section-metadata > div')].map((r) => r.children[1].textContent).join(', ');
  assert.ok(/column-view/.test(style) && !/flush/.test(style), html);
});

test('a split part takes the section\'s styles but padded (the box keeps one padding)', () => {
  const meta = '<div class="section-metadata"><div><div>style</div><div>padded, grey</div></div></div>';
  const html = run(`<div><h2>Terms</h2><p>Text</p><p>More text</p><p>* Small {copytext-small}</p><p>* Smaller {copytext-small}</p>${meta}</div><div><h2>Next</h2></div>`);
  const { document } = parseHTML(`<html><body><main>${html}</main></body></html>`);
  const styles = [...document.querySelectorAll('main > div')].map((s) => [...s.querySelectorAll(':scope > .section-metadata > div')]
    .filter((r) => /^style$/i.test(r.children[0].textContent.trim())).map((r) => r.children[1].textContent.trim()).join(' / '));
  const part = styles.find((s) => /small-print/.test(s));
  assert.ok(part && /grey/.test(part) && !/padded/.test(part), JSON.stringify(styles));
});

test('the site: the level-scoped block option draws its level only', async () => {
  const { document } = parseHTML('<html><head></head><body><main><div><div class="columns-media h3-large"><div><div><h2>W</h2><h3>A</h3></div></div></div></div></main></body></html>');
  globalThis.document = document;
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const main = document.querySelector('main');
  decorateTokenFree(main, { brand: 'lufthansa', path: '/de/en/x', read: (n) => (n === 'theme' ? 'flow-spacing' : '') });
  assert.ok(main.querySelector('h3').classList.contains('heading-small'), main.innerHTML);
  assert.ok(!/heading-/.test(main.querySelector('h2').className), main.innerHTML);
});
