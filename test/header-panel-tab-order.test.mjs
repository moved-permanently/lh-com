/* The menu's Tab order with a panel open (blocks/header/header.js buildFlyout, every brand; the
   parity passes of SWISS 380, Austrian 385 and ITA 391): at 1440 the open panel's links came after
   the other tabs and the menu's tools (DOM order: the main column, then the panels). As on www,
   Tab from the open tab goes into its panel, Tab from the panel's last link to the next tab, and
   Shift+Tab back the same way; the focus stays inside the menu (it wraps). Escape with a panel
   open closes the panel and returns the focus to its tab; Escape without one closes the menu, the
   focus on the Menu button, as before.
   Run: node --max-old-space-size=512 --test test/header-panel-tab-order.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { panelTabOrder, nextInOrder } = await import('../blocks/header/header-focus.js');

const { document } = parseHTML(`<div id="panel">
  <button id="close">Close</button>
  <ul><li><button id="t0">Book</button></li><li><button id="t1">Manage</button></li><li><button id="t2">World</button></li></ul>
  <ul><li><a id="x0" href="/help">Help</a></li><li><a id="x1" href="/cart">Cart</a></li></ul>
  <div id="s0"><a id="a0" href="/a">A</a></div>
  <div id="s1"><a id="b0" href="/b">B</a><a id="b1" href="/c">C</a></div>
</div>`);
const $ = (id) => document.getElementById(id);
const ids = (nodes) => nodes.map((n) => n.id);
const all = () => [...document.querySelectorAll('#panel button, #panel a')];

test('the open panel\'s links right after its tab, then the next tab and the tools', () => {
  assert.deepEqual(ids(panelTabOrder(all().filter((n) => n.id[0] !== 'a'), $('t1'), $('s1'))), ['close', 't0', 't1', 'b0', 'b1', 't2', 'x0', 'x1']);
  assert.deepEqual(ids(panelTabOrder(all().filter((n) => n.id[0] !== 'b'), $('t0'), $('s0'))), ['close', 't0', 'a0', 't1', 't2', 'x0', 'x1']);
});

test('no panel open, or its tab not shown (phones: the panel replaces the list): DOM order', () => {
  const nodes = all().filter((n) => n.id[0] !== 'a' && n.id[0] !== 'b');
  assert.deepEqual(ids(panelTabOrder(nodes, null, null)), ids(nodes));
  const phone = all().filter((n) => n.id[0] !== 't' && n.id[0] !== 'a' && n.id[0] !== 'x');
  assert.deepEqual(ids(panelTabOrder(phone, $('t1'), $('s1'))), ['close', 'b0', 'b1']);
});

test('Tab and Shift+Tab step through the order and wrap', () => {
  const order = panelTabOrder(all().filter((n) => n.id[0] !== 'a'), $('t1'), $('s1'));
  assert.equal(nextInOrder(order, $('t1'), false).id, 'b0', 'Tab from the tab: its first link');
  assert.equal(nextInOrder(order, $('b1'), false).id, 't2', 'Tab from the last link: the next tab');
  assert.equal(nextInOrder(order, $('b0'), true).id, 't1', 'Shift+Tab from the first link: its tab');
  assert.equal(nextInOrder(order, $('t2'), true).id, 'b1', 'Shift+Tab from the next tab: the last link');
  assert.equal(nextInOrder(order, $('x1'), false).id, 'close', 'wraps forward');
  assert.equal(nextInOrder(order, $('close'), true).id, 'x1', 'wraps back');
  assert.equal(nextInOrder(order, document.body, false).id, 'close', 'from outside: the first');
  assert.equal(nextInOrder(order, document.body, true).id, 'x1', 'from outside back: the last');
  assert.equal(nextInOrder([], $('t1'), false), null);
});

test('header.js: the flyout\'s Tab goes by panelTabOrder; Escape closes an open panel first, its tab focused', () => {
  const js = fs.readFileSync('blocks/header/header.js', 'utf8');
  assert.match(js, /import \{ panelTabOrder, nextInOrder \} from '\.\/header-focus\.js';/);
  const keydown = js.slice(js.indexOf('const onKeydown = '), js.indexOf('\n  };\n', js.indexOf('const onKeydown = ')));
  assert.match(keydown, /const \[tab, sub\] = active >= 0 \? \[buttons\[active\], subs\[active\]\] : \[null, null\];\n\s+const order = panelTabOrder\(focusables\(panel\), tab, sub\)/);
  assert.match(keydown, /nextInOrder\(order, document\.activeElement, e\.shiftKey\)/);
  const escape = keydown.slice(keydown.indexOf("e.key === 'Escape'"), keydown.indexOf("e.key === 'Tab'"));
  assert.ok(escape.indexOf('collapse()') > 0 && escape.indexOf('collapse()') < escape.indexOf('closeFlyout()'), 'an open panel first');
  assert.match(escape, /if \(active >= 0\)/);
});
