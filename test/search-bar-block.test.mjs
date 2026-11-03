/* eslint-disable max-len */
/* The search-bar block (www's dcep-search-bar, SWISS's FAQ "Search for topic"): a link to the root's
   results page (its text the field's label and placeholder) becomes a search form whose submit
   opens that page with ?query=<term>; the button labelled in the page's language (a "Button label"
   row first); an empty term opens nothing. A linkedom page, no network.
   Run: timeout 60 node --max-old-space-size=256 --test test/search-bar-block.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="de"><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
const loc = {
  hostname: 'swiss.turnsthe.page', pathname: '/ch/de/customer-support/faq', search: '', hash: '', replace: () => {}, href: 'https://swiss.turnsthe.page/ch/de/customer-support/faq', origin: 'https://swiss.turnsthe.page',
};
window.location = loc;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { default: decorate, resultsUrl, LABELS } = await import('../blocks/search-bar/search-bar.js');

const blockOf = (rows) => {
  const block = document.createElement('div');
  block.className = 'search-bar';
  block.innerHTML = rows.map((cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`).join('');
  document.body.append(block);
  return block;
};

test('resultsUrl: the results page with ?query= (www\'s %q% or an empty parameter kept by name), same-origin path', () => {
  const base = 'https://swiss.turnsthe.page/ch/de/customer-support/faq';
  assert.equal(resultsUrl('/ch/de/search-results', 'Gepäck', base), '/ch/de/search-results?query=Gep%C3%A4ck');
  assert.equal(resultsUrl('https://swiss.turnsthe.page/ae/en/search-results', 'baggage', base), '/ae/en/search-results?query=baggage');
  assert.equal(resultsUrl('/ch/zh/search-results?query=%q%', '行李', base), '/ch/zh/search-results?query=%E8%A1%8C%E6%9D%8E');
  assert.equal(resultsUrl('/ch/de/search-results?q=', 'x', base), '/ch/de/search-results?q=x');
});

test('the block: a search form (label and placeholder the link\'s text, input name query, a submit button labelled in the page\'s language)', async () => {
  const block = blockOf([['<a href="/ch/de/search-results">Suche nach Thema</a>']]);
  await decorate(block);
  const form = block.querySelector('form');
  assert.equal(Boolean(form), true, 'a form');
  assert.equal(form.getAttribute('role'), 'search');
  assert.equal(form.getAttribute('action'), '/ch/de/search-results');
  const input = block.querySelector('input');
  assert.equal(input.getAttribute('name'), 'query');
  assert.equal(input.getAttribute('type'), 'search');
  assert.equal(input.getAttribute('placeholder'), 'Suche nach Thema');
  assert.equal(block.querySelector('label').textContent, 'Suche nach Thema');
  assert.equal(block.querySelector('label').getAttribute('for'), input.id);
  const button = block.querySelector('button');
  assert.equal(button.getAttribute('type'), 'submit');
  assert.equal(button.getAttribute('aria-label'), LABELS.de);
  assert.equal(block.querySelectorAll('a').length, 0, 'the link is gone');
});

test('submit: the results page with the term; an empty term stays (focus); a Button label row wins', async () => {
  const block = blockOf([['<a href="/ch/de/search-results">Suche nach Thema</a>'], ['Button label', 'Suche starten']]);
  await decorate(block);
  assert.equal(block.querySelector('button').getAttribute('aria-label'), 'Suche starten');
  const form = block.querySelector('form');
  const input = block.querySelector('input');
  let prevented = 0;
  const submit = () => form.dispatchEvent(Object.assign(new window.Event('submit', { cancelable: true }), { preventDefault() { prevented += 1; } }));
  loc.href = 'https://swiss.turnsthe.page/ch/de/customer-support/faq';
  input.value = '   ';
  submit();
  assert.equal(loc.href, 'https://swiss.turnsthe.page/ch/de/customer-support/faq', 'empty: no navigation');
  input.value = ' Gepäck ';
  submit();
  assert.equal(loc.href, '/ch/de/search-results?query=Gep%C3%A4ck');
  assert.equal(prevented, 2);
});

test('labels for every SWISS language; a block without a link is left as it is', async () => {
  ['en', 'de', 'fr', 'it', 'es', 'pt', 'zh', 'ja', 'el', 'ru', 'ko'].forEach((l) => assert.equal(Boolean(LABELS[l]), true, l));
  const block = blockOf([['Search for topic']]);
  await decorate(block);
  assert.equal(Boolean(block.querySelector('form')), false);
});
