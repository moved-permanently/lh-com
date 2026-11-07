/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* cards-teaser's option paged (blocks/cards-teaser/cards-teaser-pager.js, brief 448: Air Dolomiti's
   destinations hubs, www's GridTreNews in airdolomiti-parity-001: 9 cards a page, under them
   "previous page", the page numbers, "next page"; the current number aria-current="page", the
   arrows disabled at the ends). Only the current page's cards show; a number or an arrow shows
   its page. paged-N: N cards a page. One page: a lone "1" between disabled arrows (as www, brief 452). The labels in the page's
   language (www's it, en, de; English otherwise). Without the option nothing changes.
   Run: node --max-old-space-size=256 --test test/cards-teaser-paged-448.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head></head><body><main></main></body></html>');
window.location = {
  hostname: 'main--lh-airdolomiti--moved-permanently.aem.page', pathname: '/en/destinations', search: '', href: 'https://main--lh-airdolomiti--moved-permanently.aem.page/en/destinations', origin: 'https://main--lh-airdolomiti--moved-permanently.aem.page',
};
Object.defineProperty(window, 'origin', { value: 'https://main--lh-airdolomiti--moved-permanently.aem.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
const { default: decorate } = await import('../blocks/cards-teaser/cards-teaser.js');

const block = async (classes, n) => {
  const b = document.createElement('div');
  b.className = `cards-teaser ${classes}`;
  b.innerHTML = Array.from({ length: n }, (_, i) => `<div><div><p>No picture</p></div><div><h3>City ${i + 1}</h3><p>Discover</p><p><a href="/en/destinations/c${i + 1}">City ${i + 1}</a></p></div></div>`).join('');
  document.querySelector('main').replaceChildren(b);
  await decorate(b);
  return b;
};
const shown = (b) => [...b.querySelectorAll(':scope > ul > li')].filter((li) => !li.hidden).map((li) => li.querySelector('h3').textContent);
const click = (el) => el.dispatchEvent(new window.Event('click', { bubbles: true }));

test('paged: 9 cards a page, www\'s controls under them', async () => {
  const b = await block('three-up paged', 24);
  assert.deepEqual(shown(b), Array.from({ length: 9 }, (_, i) => `City ${i + 1}`));
  const nav = b.querySelector(':scope > nav.cards-teaser-pager');
  assert.ok(nav, 'the controls');
  const ul = b.querySelector(':scope > ul');
  const buttons = [...nav.querySelectorAll('button')];
  assert.deepEqual(buttons.map((x) => x.getAttribute('aria-label') || x.textContent), ['Previous page', '1', '2', '3', 'Next page']);
  assert.ok(buttons.every((x) => x.getAttribute('aria-controls') === ul.id));
  assert.equal(buttons[1].getAttribute('aria-current'), 'page');
  assert.equal(buttons[0].disabled, true, 'no previous page on the first');
  assert.equal(buttons[4].disabled, false);
  click(buttons[3]);
  assert.deepEqual(shown(b), ['City 19', 'City 20', 'City 21', 'City 22', 'City 23', 'City 24']);
  assert.equal(buttons[3].getAttribute('aria-current'), 'page');
  assert.equal(buttons[1].getAttribute('aria-current'), null);
  assert.equal(buttons[4].disabled, true, 'no next page on the last');
  click(buttons[0]);
  assert.deepEqual(shown(b)[0], 'City 10', 'previous: the second page');
});

test('paged-N: N a page; one page: a lone 1 between disabled arrows (www\'s /destinazioni, brief 452); no option: nothing changes', async () => {
  const b = await block('three-up paged-4', 10);
  assert.equal(shown(b).length, 4);
  assert.equal(b.querySelectorAll('nav.cards-teaser-pager button').length, 5, 'previous, 1 to 3, next');
  const one = await block('three-up paged', 2);
  assert.equal(shown(one).length, 2);
  const lone = [...one.querySelectorAll('nav.cards-teaser-pager button')];
  assert.deepEqual(lone.map((x) => x.getAttribute('aria-label') || x.textContent), ['Previous page', '1', 'Next page']);
  assert.equal(lone[1].getAttribute('aria-current'), 'page');
  assert.ok(lone[0].disabled && lone[2].disabled, 'both arrows disabled');
  assert.equal((await block('three-up paged', 0)).querySelector('nav.cards-teaser-pager'), null, 'no cards, no controls');
  const plain = await block('three-up', 24);
  assert.equal(shown(plain).length, 24);
  assert.equal(plain.querySelector('nav.cards-teaser-pager'), null);
});

test('the labels in the page\'s language (www\'s Italian and German)', async () => {
  document.documentElement.lang = 'it';
  window.location.pathname = '/destinazioni';
  const it = await block('three-up paged', 12);
  const its = [...it.querySelectorAll('nav.cards-teaser-pager button')].map((x) => x.getAttribute('aria-label')).filter(Boolean);
  assert.deepEqual(its, ['Pagina precedente', 'Pagina successiva']);
  document.documentElement.lang = 'de';
  window.location.pathname = '/de/reiseziele';
  const de = await block('three-up paged', 12);
  assert.deepEqual([...de.querySelectorAll('nav.cards-teaser-pager button')].map((x) => x.getAttribute('aria-label')).filter(Boolean), ['Vorherige Seite', 'Nächste Seite']);
  document.documentElement.lang = 'en';
});
