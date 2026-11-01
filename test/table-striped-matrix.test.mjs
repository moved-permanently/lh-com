/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop */
/* table-striped (matrix): wide comparison tables (the functions table, /migration-status/
   functions): the first column's cells stay in place while the table scrolls sideways (class
   table-striped-sticky); the cells' links show their title in a styled tooltip (role tooltip,
   aria-describedby while shown) on hover, keyboard focus and a first tap; a second tap on the same
   link follows it; Escape and a tap elsewhere close it; the title moves into the tooltip (no
   browser tooltip as well), the link's accessible name unchanged. Without matrix the block is as
   before, byte for byte (the code of HEAD at 8a40005b). DOM nodes are compared with assert.ok(a === b)
   only. Run: node --max-old-space-size=512 --test test/table-striped-matrix.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
globalThis.Event = window.Event;
globalThis.NodeFilter = { SHOW_TEXT: 4 };
window.innerWidth = 390;
window.innerHeight = 800;
const { default: decorate } = await import('../blocks/table-striped/table-striped.js');

// the block before this change (its one import from the working tree)
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'table-striped-'));
const old = execFileSync('git', ['show', '8a40005b:blocks/table-striped/table-striped.js'], { encoding: 'utf8' })
  .replace("from '../../scripts/block-config.js'", `from '${path.resolve('scripts/block-config.js')}'`);
fs.writeFileSync(path.join(dir, 'table-striped.mjs'), old);
const { default: before } = await import(path.join(dir, 'table-striped.mjs'));

const cell = (html) => `<div>${html}</div>`;
const row = (...cells) => `<div>${cells.map(cell).join('')}</div>`;
const link = (href, title, text) => `<a href="${href}" title="${title}">${text}</a>`;
const TABLE = [
  row('Function', link('#lufthansa', 'The lufthansa.com replica.', 'Lufthansa'), link('#discover', 'The Discover Airlines replica.', 'Discover')),
  row(link('#functions', 'The search form on the homepage.', 'Flight search'), link('#lufthansa', 'Shop hand-off as www.', '✅'), link('#discover', 'Planned.', '🪏')),
  row(link('#functions', 'Flight status by number, route and airport.', 'Flight status'), link('#lufthansa', 'Same parameters as www.', '✅'), '<a href="#discover" title="An icon only link."><span class="icon icon-landing"></span></a>'),
].join('');

function page(classes) {
  const { document } = parseHTML(`<!DOCTYPE html><html><head></head><body><main><div class="${classes}">${TABLE}</div><p id="elsewhere">Elsewhere</p></main></body></html>`);
  globalThis.document = document;
  return document;
}
const fire = (el, type, props = {}) => {
  const e = new window.Event(type, { bubbles: true, cancelable: true });
  Object.entries(props).forEach(([k, v]) => Object.defineProperty(e, k, { value: v }));
  el.dispatchEvent(e);
  return e;
};

test('without matrix: the block as before, byte for byte (header and plain tables)', async () => {
  for (const classes of ['table-striped header', 'table-striped']) {
    let doc = page(`${classes} block`);
    before(doc.querySelector('.table-striped'));
    const a = doc.querySelector('main').innerHTML;
    doc = page(`${classes} block`);
    await decorate(doc.querySelector('.table-striped'));
    assert.equal(doc.querySelector('main').innerHTML, a, classes);
    assert.ok(!doc.querySelector('[role="tooltip"]'));
    assert.equal(doc.querySelectorAll('a[title]').length, 8, 'the titles stay');
  }
});

test('matrix: the first column\'s cells are sticky, the titles move into the tooltip, the names stay', async () => {
  const doc = page('table-striped header matrix block');
  const block = doc.querySelector('.table-striped');
  await decorate(block);
  const firsts = [...block.querySelectorAll('tr')].map((tr) => tr.firstElementChild);
  assert.equal(firsts.length, 3);
  firsts.forEach((c) => assert.ok(c.classList.contains('table-striped-sticky'), c.outerHTML.slice(0, 60)));
  assert.equal(block.querySelectorAll('.table-striped-sticky').length, 3, 'only the first column');
  assert.equal(block.querySelector('table').style.getPropertyValue('--matrix-columns'), '3', 'the column count for the table\'s least width');
  const tip = block.querySelector('[role="tooltip"]');
  assert.ok(tip, 'one tooltip in the block (inside the scrolling area)');
  assert.ok(tip.hidden);
  assert.ok(tip.id);
  assert.equal(block.querySelectorAll('a[title]').length, 0, 'no browser tooltip as well');
  assert.equal(block.querySelectorAll('a[data-tooltip]').length, 8);
  const lufthansa = block.querySelector('thead a');
  assert.equal(lufthansa.textContent, 'Lufthansa');
  assert.ok(!lufthansa.hasAttribute('aria-label'), 'a link with text keeps its name');
  const icon = block.querySelector('a[href="#discover"] .icon').closest('a');
  assert.equal(icon.getAttribute('aria-label'), 'An icon only link.', 'a link without text keeps its title as its name');
});

test('matrix: hover and focus show the title; leaving, blur and Escape close it', async () => {
  const doc = page('table-striped header matrix block');
  const block = doc.querySelector('.table-striped');
  await decorate(block);
  const tip = block.querySelector('[role="tooltip"]');
  const a = [...block.querySelectorAll('a')].find((x) => x.textContent === 'Flight status');
  fire(a, 'pointerenter', { pointerType: 'mouse' });
  assert.equal(tip.hidden, false);
  assert.equal(tip.querySelector('.table-striped-tooltip-text').textContent, 'Flight status by number, route and airport.');
  assert.equal(a.getAttribute('aria-describedby'), tip.id);
  fire(a, 'pointerleave', { pointerType: 'mouse' });
  assert.ok(tip.hidden);
  assert.ok(!a.hasAttribute('aria-describedby'));
  fire(a, 'focusin');
  assert.equal(tip.hidden, false);
  assert.equal(a.getAttribute('aria-describedby'), tip.id);
  fire(a, 'keydown', { key: 'Escape' });
  assert.ok(tip.hidden, 'Escape closes it');
  fire(a, 'focusin');
  fire(a, 'focusout');
  assert.ok(tip.hidden, 'blur closes it');
  // a mouse click follows the link at once
  fire(a, 'pointerdown', { pointerType: 'mouse' });
  assert.equal(fire(a, 'click').defaultPrevented, false);
});

test('matrix: no hover tooltip on devices without hover (a phone\'s emulated hover while scrolling)', async () => {
  const doc = page('table-striped header matrix block');
  window.matchMedia = (q) => ({ matches: q === '(hover: none)' });
  try {
    const block = doc.querySelector('.table-striped');
    await decorate(block);
    const a = [...block.querySelectorAll('a')].find((x) => x.textContent === 'Flight status');
    fire(a, 'pointerenter', { pointerType: 'mouse' });
    assert.ok(block.querySelector('[role="tooltip"]').hidden);
    fire(a, 'focusin');
    assert.equal(block.querySelector('[role="tooltip"]').hidden, false, 'focus still shows it');
  } finally {
    delete window.matchMedia;
  }
});

test('matrix: the tooltip keeps its own width (up to 28rem or the table area) and is shifted, not squeezed, at the edge', async () => {
  const doc = page('table-striped header matrix block');
  const block = doc.querySelector('.table-striped');
  await decorate(block);
  Object.defineProperty(block, 'clientWidth', { value: 346, configurable: true });
  const tip = block.querySelector('[role="tooltip"]');
  const a = [...block.querySelectorAll('a')].find((x) => x.textContent === 'Flight status');
  fire(a, 'focusin');
  assert.equal(tip.style.maxWidth, `${346 - 16}px`, 'the table area less the gaps');
  fire(a, 'focusout');
  Object.defineProperty(block, 'clientWidth', { value: 1264, configurable: true });
  fire(a, 'focusin');
  assert.equal(tip.style.maxWidth, '448px', '28rem');
});

test('matrix on touch: the first tap shows, the second follows, a tap elsewhere closes', async () => {
  const doc = page('table-striped header matrix block');
  const block = doc.querySelector('.table-striped');
  await decorate(block);
  const tip = block.querySelector('[role="tooltip"]');
  const [first, second] = [...block.querySelectorAll('tbody a')].filter((x) => x.textContent === '✅');
  fire(first, 'pointerdown', { pointerType: 'touch' });
  fire(first, 'focusin');
  assert.equal(fire(first, 'click').defaultPrevented, true, 'first tap: no navigation');
  assert.equal(tip.hidden, false);
  assert.equal(tip.querySelector('.table-striped-tooltip-text').textContent, 'Shop hand-off as www.');
  fire(first, 'pointerdown', { pointerType: 'touch' });
  assert.equal(fire(first, 'click').defaultPrevented, false, 'second tap on the same link: follows it');
  // another link: its own first tap
  fire(second, 'pointerdown', { pointerType: 'touch' });
  assert.equal(fire(second, 'click').defaultPrevented, true);
  assert.equal(tip.querySelector('.table-striped-tooltip-text').textContent, 'Same parameters as www.');
  // a tap elsewhere closes it, and the next tap on the link shows it again
  fire(doc.getElementById('elsewhere'), 'pointerdown', { pointerType: 'touch' });
  assert.ok(tip.hidden);
  fire(second, 'pointerdown', { pointerType: 'touch' });
  assert.equal(fire(second, 'click').defaultPrevented, true);
});

test('matrix CSS: the column headings never break inside a word (390: "Lufthansa", not "Lufthan|sa")', () => {
  const css = fs.readFileSync(new URL('../blocks/table-striped/table-striped.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = (selector) => {
    const m = css.match(new RegExp(`(^|\\})\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`));
    return m ? m[2] : '';
  };
  const head = rule('.table-striped.matrix thead th');
  assert.match(head, /overflow-wrap:\s*normal/);
  assert.match(head, /padding:\s*20px 16px 30px/);
  // the columns: 8.5rem below 768px (the headings' longest word at 20px plus 32px of padding), 7.5rem from 768px
  assert.match(rule('.table-striped.matrix'), /--matrix-col:\s*8\.5rem/);
  assert.match(css, /@media \(width >= 768px\)\s*\{\s*\.table-striped\.matrix\s*\{[^}]*--matrix-col:\s*7\.5rem/);
  assert.match(rule('.table-striped.matrix table'), /min-width:\s*calc\(var\(--matrix-first\) \+ \(var\(--matrix-columns, 1\) - 1\) \* var\(--matrix-col\)\)/);
});
