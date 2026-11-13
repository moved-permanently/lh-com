/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 9 (2026-11-12), item 1: www's stage text is either a tagline (.subheadline, LufthansaHead light, the
   block's subtitle) or body copy (.information .richtext, LufthansaText light). The parser wrote both as a plain
   paragraph after the heading, and the block takes such a paragraph of up to 100 characters as its subtitle: /de/en/32n
   and /de/en/boeing787 showed their body copy at 22 px (the heading face) instead of about 16 px at 390. A stage with
   body copy and no tagline now gets the option no-subtitle, and the block then leaves the paragraph body text.
   Inputs: the stages of the 32n and 100-years snapshots (test/fixtures/hero-no-subtitle-so9).
   Run: node --max-old-space-size=256 --test test/hero-campaign-no-subtitle-so9.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="language" content="en"></head><body class="brand-lufthansa"><main></main></body></html>');
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/de/en/32n', search: '', href: 'https://lufthansa.turnsthe.page/de/en/32n', origin: 'https://lufthansa.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://lufthansa.turnsthe.page', configurable: true });
window.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.ResizeObserver = function ResizeObserver() { return { observe() {} }; };
globalThis.requestAnimationFrame = (fn) => fn();
globalThis.cancelAnimationFrame = () => {};
// the parser's WebImporter: createBlock as the import framework writes a block table (name and options in the head)
globalThis.WebImporter = {
  Blocks: {
    createBlock: (doc, { name, variants = [], cells }) => {
      const t = doc.createElement('table');
      const head = doc.createElement('tr');
      head.innerHTML = `<th>${name}${variants.length ? ` (${variants.join(', ')})` : ''}</th>`;
      t.append(head);
      cells.forEach((row) => {
        const tr = doc.createElement('tr');
        row.forEach((cell) => { const td = doc.createElement('td'); (Array.isArray(cell) ? cell : [cell]).forEach((c) => td.append(c)); tr.append(td); });
        t.append(tr);
      });
      return t;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/hero-campaign.js');
const { default: decorate } = await import('../blocks/hero-campaign/hero-campaign.js');

const fixture = (name) => fs.readFileSync(new URL(`./fixtures/hero-no-subtitle-so9/${name}`, import.meta.url), 'utf8').replace(/^<!--.*-->\n/, '');
const parsed = (name, url = 'https://www.lufthansa.com/de/en/32n') => {
  const { document: doc } = parseHTML(`<html><body><main>${fixture(name)}</main></body></html>`);
  parse(doc.querySelector('.inspirationteaser'), { document: doc, url, params: { originalURL: url } });
  const t = doc.querySelector('table');
  return { head: t.querySelector('th').textContent, text: t.querySelectorAll('tr')[2]?.textContent || '' };
};

test('the parser: body copy and no tagline (32n) -> option no-subtitle; a tagline (100-years) -> no such option', () => {
  const fleet = parsed('32n-stage.html');
  assert.match(fleet.head, /^hero-campaign \(.*no-subtitle.*\)$/, fleet.head);
  assert.match(fleet.text, /Discover our modern short-haul aircraft/);
  const campaign = parsed('100-years-stage.html');
  assert.ok(!/no-subtitle/.test(campaign.head), campaign.head);
});

const stage = (text, options = '') => {
  const main = document.querySelector('main');
  main.replaceChildren();
  const s = document.createElement('div');
  s.className = 'section';
  main.append(s);
  const block = document.createElement('div');
  block.className = `hero-campaign ${options} block`;
  block.innerHTML = `<div><div><picture><img src="https://lufthansa.turnsthe.page/de/en/media_1.jpg?width=750" alt="" width="2560" height="1098"></picture></div></div><div><div>${text}</div></div>`;
  s.append(block);
  decorate(block);
  return block;
};

test('another brand\'s page: no option (its importer keeps its stages as tuned)', () => {
  assert.ok(!/no-subtitle/.test(parsed('32n-stage.html', 'https://www.austrian.com/at/de/x').head));
});

test('the block: with no-subtitle the paragraph after the heading stays body text; without it the subtitle as before', () => {
  const text = '<h2>Airbus A320neo</h2><p>Discover our modern short-haul aircraft – efficient, quiet and comfortable.</p>';
  assert.ok(stage(text, 'no-subtitle').querySelector('.hero-campaign-subtitle') === null, 'no subtitle with the option');
  assert.ok(stage(text).querySelector('.hero-campaign-subtitle'), 'a lone short paragraph without the option: the subtitle (100-years)');
});

test('the option is in the block\'s metadata and README', () => {
  const meta = JSON.parse(fs.readFileSync(new URL('../blocks/hero-campaign/metadata.json', import.meta.url), 'utf8'));
  assert.ok(meta.options.some((o) => o.class === 'no-subtitle'));
  assert.match(fs.readFileSync(new URL('../blocks/hero-campaign/README.md', import.meta.url), 'utf8'), /no-subtitle/);
});
