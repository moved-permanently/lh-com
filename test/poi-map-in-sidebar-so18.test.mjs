/* eslint-disable max-len */
/* Standing order 18 of 2026-11-13, item 2: the stopover detail pages (/<market>/<lang>/book-and-manage/stopover/
   zugspitze and ten more, 168 documents) author www's sidebar view as a Columns Media sidebar block and the map that
   www draws in its main column as a poi-map right after it. www: the map in the text column under the text (1440:
   940 px wide, beside the aside; 390: between the text and the aside's logo); ours put it under the whole block, full
   width, 46 to 57 px lower at 1440. intoSidebar: a poi-map whose wrapper directly follows a Columns Media sidebar's
   wrapper goes to the end of the sidebar's first cell (its last row's), the sidebar takes the class with-map, and the
   map's empty wrapper goes; any other poi-map stays where it is. with-map's spacing (www's, measured on the three
   recorded pages): the map 27 px under the text; on phones 72 px above the aside and 45 px from the aside to the next
   section; from 768 px 43 px from the map to the next section. lufthansa.com only (body.brand-lufthansa).
   Run: node --max-old-space-size=256 --test test/poi-map-in-sidebar-so18.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.live', pathname: '/de/en/book-and-manage/stopover/zugspitze', search: '', href: 'https://main--lh-com--moved-permanently.aem.live/de/en/book-and-manage/stopover/zugspitze', origin: 'https://main--lh-com--moved-permanently.aem.live',
};
Object.defineProperty(window, 'origin', { value: 'https://main--lh-com--moved-permanently.aem.live', configurable: true });
globalThis.window = window;
globalThis.document = document;
document.body.classList.add('brand-lufthansa');
const { intoSidebar } = await import('../blocks/poi-map/poi-map.js');

const section = (before) => {
  const s = document.createElement('div');
  s.className = 'section';
  s.innerHTML = `${before}<div class="poi-map-wrapper"><div class="poi-map block"><div><div>Source</div><div>/x</div></div></div></div>`;
  document.body.append(s);
  return s;
};
const sidebar = '<div class="columns-media-wrapper"><div class="columns-media sidebar block"><div class="columns-media-row"><div class="columns-media-text"><p>Arrival</p></div><div class="columns-media-text"><p>Aside</p></div></div></div></div>';

test('after a Columns Media sidebar: the map at the end of its first cell, its wrapper gone', () => {
  const s = section(sidebar);
  const block = s.querySelector('.poi-map');
  assert.equal(intoSidebar(block), true);
  const first = s.querySelector('.columns-media-row > div:first-child');
  assert.ok(first.lastElementChild === block);
  assert.ok(first.firstElementChild.textContent === 'Arrival');
  assert.ok(s.querySelector('.poi-map-wrapper') === null);
  assert.ok(s.querySelector('.columns-media').classList.contains('with-map'));
  assert.ok(s.querySelector('.columns-media-row > div:last-child').textContent === 'Aside');
});

test('other neighbours: the map stays in its wrapper', () => {
  [
    '<div class="columns-media-wrapper"><div class="columns-media padded block"><div><div><p>T</p></div><div></div></div></div></div>',
    '<div class="default-content-wrapper"><p>Text</p></div>',
    '',
  ].forEach((before) => {
    const s = section(before);
    const block = s.querySelector('.poi-map');
    assert.equal(intoSidebar(block), false);
    assert.ok(block.parentElement.classList.contains('poi-map-wrapper'));
    assert.ok(!s.querySelector('.with-map'));
  });
});

test('a sidebar of several rows: the last row\'s first cell', () => {
  const s = section('<div class="columns-media-wrapper"><div class="columns-media sidebar block"><div><div><p>One</p></div><div></div></div><div><div><p>Two</p></div><div><p>Aside</p></div></div></div></div>');
  const block = s.querySelector('.poi-map');
  assert.equal(intoSidebar(block), true);
  assert.ok(s.querySelector('.columns-media > div:last-child > div:first-child').lastElementChild === block);
});

const css = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('with-map: the sidebar without its bottom padding, from 768 px its first cell without margin; the map 32 px above the aside on phones, none from 768 px', () => {
  const cm = css('../blocks/columns-media/columns-media.css');
  assert.ok(cm.includes('body.brand-lufthansa .columns-media.sidebar.with-map { padding-bottom: 0; }'));
  assert.ok(cm.includes('@media (width >= 768px) { body.brand-lufthansa .columns-media.sidebar.with-map .columns-media-row > div:not(:last-child) { margin-bottom: 0; } }'));
  const pm = css('../blocks/poi-map/poi-map.css');
  assert.ok(pm.includes('body.brand-lufthansa .columns-media.sidebar .poi-map .poi-map-view { margin-bottom: 32px; }'));
  assert.ok(pm.includes('@media (width >= 768px) { body.brand-lufthansa .columns-media.sidebar .poi-map .poi-map-view { margin-bottom: 0; } }'));
});

test('another brand: the map stays where its document has it', () => {
  document.body.classList.replace('brand-lufthansa', 'brand-austrian');
  const s = section(sidebar);
  const block = s.querySelector('.poi-map');
  assert.equal(intoSidebar(block), false);
  assert.ok(block.parentElement.classList.contains('poi-map-wrapper'));
  document.body.classList.replace('brand-austrian', 'brand-lufthansa');
});
