/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* cards-teaser's option routes on phones (parity row 58, the brief after 456): under the sideways
   row of route cards, www's two arrows (MiniCardSlider: "previous page", "next page", 40px circles,
   10px apart, on the right; the previous one disabled at the start, the next one at the end); an
   arrow scrolls the row by one card. The theme hides them from 930px (the grid). One card: none.
   www's count beside them ("undefined (17)", a bug on www) is left out. Labels in the page's
   language (it, en, de as the pager's; English otherwise).
   Run: node --max-old-space-size=256 --test test/cards-teaser-routes.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="de"><head></head><body><main></main></body></html>');
window.location = {
  hostname: 'main--lh-airdolomiti--moved-permanently.aem.page', pathname: '/de/fluege-in-europa', search: '', href: 'https://main--lh-airdolomiti--moved-permanently.aem.page/de/fluege-in-europa', origin: 'https://main--lh-airdolomiti--moved-permanently.aem.page',
};
Object.defineProperty(window, 'origin', { value: 'https://main--lh-airdolomiti--moved-permanently.aem.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
globalThis.requestAnimationFrame = (f) => f();
// the row is laid out after the block (its section shows later): a ResizeObserver tells the arrows
const observed = [];
globalThis.ResizeObserver = class {
  constructor(cb) { this.cb = cb; }

  observe(el) { observed.push([el, this.cb]); }
};
const { default: decorate } = await import('../blocks/cards-teaser/cards-teaser.js');

const block = async (classes, n) => {
  const b = document.createElement('div');
  b.className = `cards-teaser ${classes}`;
  b.innerHTML = Array.from({ length: n }, (_, i) => `<div><div><p>No picture</p></div><div><h3>Frankfurt - City ${i + 1}</h3><p><a href="/de/routen/r${i + 1}">Frankfurt - City ${i + 1}</a></p></div></div>`).join('');
  document.querySelector('main').replaceChildren(b);
  await decorate(b);
  return b;
};
const click = (el) => el.dispatchEvent(new window.Event('click', { bubbles: true }));
// linkedom has no layout: the row's scroll position and the cards' places by hand
const layout = (ul, {
  left = 0, width = 351, scroll = 2000, step = 260,
} = {}) => {
  Object.defineProperty(ul, 'scrollLeft', { value: left, configurable: true, writable: true });
  Object.defineProperty(ul, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(ul, 'scrollWidth', { value: scroll, configurable: true });
  [...ul.children].forEach((li, i) => Object.defineProperty(li, 'offsetLeft', { value: 20 + i * step, configurable: true }));
};

test('routes: two arrows under the row, the previous one disabled at the start', async () => {
  const b = await block('three-up routes', 17);
  const nav = b.querySelector(':scope > nav.cards-teaser-routes-nav');
  assert.ok(nav, 'the arrows');
  const ul = b.querySelector(':scope > ul');
  const buttons = [...nav.querySelectorAll('button')];
  assert.deepEqual(buttons.map((x) => x.getAttribute('aria-label')), ['Vorherige Seite', 'Nächste Seite']);
  assert.ok(buttons.every((x) => x.type === 'button' && x.getAttribute('aria-controls') === ul.id));
  layout(ul);
  ul.dispatchEvent(new window.Event('scroll'));
  assert.equal(buttons[0].disabled, true);
  assert.equal(buttons[1].disabled, false);
});

test('an arrow scrolls the row by one card; at the end the next one is disabled', async () => {
  const b = await block('three-up routes', 17);
  const ul = b.querySelector(':scope > ul');
  const [previous, next] = [...b.querySelectorAll('nav.cards-teaser-routes-nav button')];
  layout(ul);
  const moves = [];
  ul.scrollBy = (o) => moves.push(o.left);
  click(next);
  click(previous);
  assert.deepEqual(moves, [260, -260]);
  layout(ul, { left: 1649 });
  ul.dispatchEvent(new window.Event('scroll'));
  assert.equal(next.disabled, true);
  assert.equal(previous.disabled, false);
});

test('one card, or without the option: no arrows', async () => {
  assert.equal((await block('three-up routes', 1)).querySelector('nav.cards-teaser-routes-nav'), null);
  assert.equal((await block('three-up', 6)).querySelector('nav.cards-teaser-routes-nav'), null);
});

test('the theme: 40px white circles 10px apart on the right, under the row; hidden from 930px', () => {
  const css = fs.readFileSync('styles/themes/airdolomiti.css', 'utf8');
  const N = 'body.brand-airdolomiti .cards-teaser.three-up.routes .cards-teaser-routes-nav';
  const rule = (sel, from = 0) => {
    const i = css.indexOf(`${sel} {`, from);
    assert.ok(i >= 0, `rule ${sel}`);
    return css.slice(i, css.indexOf('}', i));
  };
  assert.match(rule(N), /display: flex;/);
  assert.match(rule(N), /justify-content: flex-end;/);
  assert.match(rule(N), /gap: 10px;/);
  const btn = rule(`${N} button`);
  assert.match(btn, /width: 40px;/);
  assert.match(btn, /height: 40px;/);
  assert.match(btn, /border-radius: 50%;/);
  assert.match(btn, /background-color: #fff;/);
  const m = css.indexOf('@media (width >= 930px) {\n  /* www\'s grid 60px above the next heading */');
  assert.ok(m >= 0, 'the routes 930px block');
  assert.match(rule(N, m), /display: none;/);
});

test('the states follow the row once it is laid out (a section shown after the block)', async () => {
  const b = await block('three-up routes', 17);
  const ul = b.querySelector(':scope > ul');
  const [, next] = [...b.querySelectorAll('nav.cards-teaser-routes-nav button')];
  layout(ul, { width: 0, scroll: 0 });
  ul.dispatchEvent(new window.Event('scroll'));
  assert.equal(next.disabled, true, 'not laid out yet');
  const entry = observed.find(([el]) => el === ul);
  assert.ok(entry, 'the row observed');
  layout(ul);
  entry[1]([]);
  assert.equal(next.disabled, false);
});
