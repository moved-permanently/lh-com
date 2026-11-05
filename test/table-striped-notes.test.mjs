/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop, import/extensions -- dev tooling */
/* table-striped: a cell's note behind an (i) after its text (brief 403, R4-1; www.flytap.com's
   comparison tables, the Club's on /pt-pt/miles-and-go/club). A cell ending in a line break and
   italic text (the TAP import's "text|note", tools/importer/tap-import.mjs tableParts) shows the
   text, then an (i) button (aria-label in the page's language) whose note is the block's tooltip
   (role tooltip, aria-describedby while shown): on hover, keyboard focus and a tap (a second tap
   closes it); Escape and a tap elsewhere close it. Row labels, values and column headings alike,
   with and without matrix. Italic text elsewhere in a cell stays as it is; a table without notes
   is as before, byte for byte (main's code at 4b56e3e). DOM nodes are compared with
   assert.ok(a === b) only. Run: node --max-old-space-size=512 --test test/table-striped-notes.test.mjs */
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

// the block before this change (its imports from the working tree)
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'table-striped-notes-'));
const old = execFileSync('git', ['show', '4b56e3e:blocks/table-striped/table-striped.js'], { encoding: 'utf8' })
  .replace("from '../../scripts/block-config.js'", `from '${path.resolve('scripts/block-config.js')}'`)
  .replace("import('./table-striped-matrix.js')", `import('${path.resolve('blocks/table-striped/table-striped-matrix.js')}')`);
fs.writeFileSync(path.join(dir, 'table-striped.mjs'), old);
const { default: before } = await import(path.join(dir, 'table-striped.mjs'));

const cell = (html) => `<div>${html}</div>`;
const row = (...cells) => `<div>${cells.map(cell).join('')}</div>`;
const CLUB = [
  row('', 'Club Basic<br>109 EUR / ano', 'Club Platinum+<br>1 189 EUR / ano<br><em>Oferta limitada</em>'),
  row('Embarque Premium<br><em>Para usufruir deste benefício, deverá adicionar o seu Número de Cliente.</em>', '✕', '✓'),
  row('Milhas Status por mês', '50', '500<br><em>Novo: antes 400</em>'),
  row('<p>Milhas Bónus<br><em>Bónus obtido após o crédito.</em></p>', '4.000', '15.000'),
].join('');
const PLAIN = [
  row('Weight', '<em>approx.</em> 20 kg'),
  row('Seats', '200 <em>in two classes</em>'),
  row('Range<br>long-haul', '<p>13,000 km</p><p><em>with reserves</em> and more</p>'),
].join('');

function page(classes, rows, lang = 'pt') {
  const { document } = parseHTML(`<!DOCTYPE html><html lang="${lang}"><head></head><body><main><div class="${classes}">${rows}</div><p id="elsewhere">Elsewhere</p></main></body></html>`);
  globalThis.document = document;
  return document;
}
const fire = (el, type, props = {}) => {
  const e = new window.Event(type, { bubbles: true, cancelable: true });
  Object.entries(props).forEach(([k, v]) => Object.defineProperty(e, k, { value: v }));
  el.dispatchEvent(e);
  return e;
};

test('a table without notes, and italic text that is no note: as before, byte for byte', async () => {
  for (const classes of ['table-striped header', 'table-striped', 'table-striped header matrix']) {
    let doc = page(`${classes} block`, PLAIN);
    await before(doc.querySelector('.table-striped'));
    const a = doc.querySelector('main').innerHTML;
    doc = page(`${classes} block`, PLAIN);
    await decorate(doc.querySelector('.table-striped'));
    assert.equal(doc.querySelector('main').innerHTML, a, classes);
  }
});

test('the notes: the text, then an (i) with the note; no line break or italics left', async () => {
  const doc = page('table-striped header block', CLUB);
  await decorate(doc.querySelector('.table-striped'));
  const buttons = [...doc.querySelectorAll('.table-striped .table-striped-info')];
  assert.deepEqual(buttons.map((b) => b.dataset.tooltip), ['Oferta limitada', 'Para usufruir deste benefício, deverá adicionar o seu Número de Cliente.', 'Novo: antes 400', 'Bónus obtido após o crédito.']);
  buttons.forEach((b) => {
    assert.equal(b.tagName, 'BUTTON');
    assert.equal(b.getAttribute('type'), 'button');
    assert.equal(b.getAttribute('aria-label'), 'Mais informações');
    assert.ok(b.parentElement.lastChild === b, 'after the text');
  });
  const [head, label, value, wrapped] = buttons.map((b) => b.closest('th, td'));
  assert.equal(head.tagName, 'TH');
  assert.ok(head.closest('thead'));
  assert.ok(head.innerHTML.startsWith('Club Platinum+<br>1 189 EUR / ano'), head.innerHTML);
  assert.equal(label.tagName, 'TH');
  assert.ok(label.closest('tbody'));
  assert.equal(value.tagName, 'TD');
  assert.ok(wrapped.querySelector('.table-striped-info'));
  [head, label, value, wrapped].forEach((c) => {
    assert.ok(c.querySelector('em, i') === null);
    assert.ok(!/<br>\s*<button/.test(c.innerHTML), c.innerHTML);
  });
  assert.equal(label.textContent, 'Embarque Premium');
  assert.equal(value.textContent, '500');
  // the tooltip: one per block, hidden until asked for
  const tips = doc.querySelectorAll('.table-striped .table-striped-tooltip');
  assert.equal(tips.length, 1);
  assert.equal(tips[0].getAttribute('role'), 'tooltip');
  assert.equal(tips[0].hidden, true);
});

test('the (i)\'s name in the page\'s language, English for others', async () => {
  for (const [lang, name] of [['en', 'More information'], ['de', 'Weitere Informationen'], ['es', 'Más información'], ['fr', 'Plus d’informations'], ['it', 'Maggiori informazioni'], ['pl', 'Więcej informacji'], ['nl', 'More information']]) {
    const doc = page('table-striped block', CLUB, lang);
    await decorate(doc.querySelector('.table-striped'));
    assert.equal(doc.querySelector('.table-striped-info').getAttribute('aria-label'), name, lang);
  }
});

test('hover and focus show the note; leaving, blur and Escape close it', async () => {
  const doc = page('table-striped header block', CLUB);
  await decorate(doc.querySelector('.table-striped'));
  const tip = doc.querySelector('.table-striped-tooltip');
  const [, label, value] = doc.querySelectorAll('.table-striped-info');
  fire(label, 'pointerenter', { pointerType: 'mouse' });
  assert.equal(tip.hidden, false);
  assert.equal(tip.textContent, 'Para usufruir deste benefício, deverá adicionar o seu Número de Cliente.');
  assert.equal(label.getAttribute('aria-describedby'), tip.id);
  fire(label, 'pointerleave', { pointerType: 'mouse' });
  assert.equal(tip.hidden, true);
  assert.equal(label.getAttribute('aria-describedby'), null);
  fire(value, 'focusin');
  assert.equal(tip.hidden, false);
  assert.equal(tip.textContent, 'Novo: antes 400');
  fire(value, 'keydown', { key: 'Escape' });
  assert.equal(tip.hidden, true);
  fire(value, 'focusin');
  fire(value, 'focusout');
  assert.equal(tip.hidden, true);
});

test('on touch: a tap shows the note, a second tap on it closes it, a tap elsewhere closes it', async () => {
  const doc = page('table-striped block', CLUB);
  await decorate(doc.querySelector('.table-striped'));
  const tip = doc.querySelector('.table-striped-tooltip');
  const [, label] = doc.querySelectorAll('.table-striped-info');
  fire(label, 'pointerdown', { pointerType: 'touch' });
  fire(label, 'click');
  assert.equal(tip.hidden, false);
  fire(label, 'pointerdown', { pointerType: 'touch' });
  fire(label, 'click');
  assert.equal(tip.hidden, true);
  fire(label, 'pointerdown', { pointerType: 'touch' });
  fire(label, 'click');
  assert.equal(tip.hidden, false);
  fire(doc.getElementById('elsewhere'), 'pointerdown', { pointerType: 'touch' });
  assert.equal(tip.hidden, true);
});

test('matrix: the notes and the link titles share the one tooltip', async () => {
  const rows = `${CLUB}${row('<a href="#x" title="A link title.">Partners</a>', '1', '2')}`;
  const doc = page('table-striped header matrix block', rows);
  await decorate(doc.querySelector('.table-striped'));
  assert.equal(doc.querySelectorAll('.table-striped-tooltip').length, 1);
  const tip = doc.querySelector('.table-striped-tooltip');
  const a = doc.querySelector('a[data-tooltip]');
  fire(a, 'focusin');
  assert.equal(tip.textContent, 'A link title.');
  const info = doc.querySelectorAll('.table-striped-info')[2];
  fire(info, 'focusin');
  assert.equal(tip.textContent, 'Novo: antes 400');
  assert.equal(a.getAttribute('aria-describedby'), null);
  assert.equal(info.getAttribute('aria-describedby'), tip.id);
});

test('CSS: the (i) 24px, 8px after the text; the block a box for the tooltip', () => {
  const css = fs.readFileSync('blocks/table-striped/table-striped.css', 'utf8');
  const rule = (sel) => (css.match(new RegExp(`(?:^|\\n)${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`)) || [])[1] || '';
  const info = rule('.table-striped .table-striped-info');
  assert.match(info, /width: 24px;/);
  assert.match(info, /height: 24px;/);
  assert.match(info, /margin-left: 8px;/);
  assert.match(info, /vertical-align: middle;/);
  assert.match(rule('.table-striped .table-striped-info::before'), /mask: var\(--table-striped-info\)/);
  assert.match(rule('.table-striped .table-striped-info:focus-visible'), /outline: 2px solid var\(--focus-color\)/);
  assert.match(rule('.table-striped:has(> .table-striped-tooltip)'), /position: relative;/);
});

test('CSS: a column heading\'s (i) at the cell\'s top right beside the heading, room kept for it (brief 406: www keeps it beside "Club Platinum+")', () => {
  const css = fs.readFileSync('blocks/table-striped/table-striped.css', 'utf8');
  const rule = (sel) => (css.match(new RegExp(`(?:^|\\n)${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`)) || [])[1] || '';
  const heading = rule('.table-striped thead th:has(> .table-striped-info)');
  assert.match(heading, /position: relative;/);
  assert.ok(!/padding/.test(heading), 'the lines under the first keep the cell\'s width');
  const room = rule('.table-striped thead th:has(> .table-striped-info)::before');
  assert.match(room, /float: right;/);
  assert.match(room, /width: 24px;/);
  const info = rule('.table-striped thead .table-striped-info');
  assert.match(info, /position: absolute;/);
  assert.match(info, /top: 23px;/);
  assert.match(info, /right: 8px;/);
  assert.match(info, /margin: 0;/);
  // after option matrix's heading padding, so it wins there too
  assert.ok(css.indexOf('.table-striped thead th:has(> .table-striped-info)') > css.indexOf('.table-striped.matrix thead th {'));
});
