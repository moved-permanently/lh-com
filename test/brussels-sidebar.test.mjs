/* eslint-disable max-len, import/extensions */
/* Brussels' sidebar pages (brief 441, item 3: /be/en/plan-your-trip/travel-regulations): www's
   .airem-sidebar keeps its content in a column 75% wide (938 px at 1440) beside an aside; inside it,
   "Current Travel Regulations" is a grey column view (.column-view.container-gray.full-width-bg).
   A sidebar whose content holds column views is no columns-media sidebar (the info template's
   selector excludes it), so its content came in as one full-width section, and lh-com's section
   transformer made all of it grey (the grey's region climbs to the sidebar component). The
   Brussels importer now marks such a sidebar before the import (withSidebarContent): its content
   column gets a col- class, where the transformer's grey region stops (so the grey column view is a
   section of its own; the sidebar stays, so do the template's other section breaks), and two marker
   paragraphs at its start and end; after the import the sections from the one with the start marker
   to the one with the end marker get the section style sidebar (withSidebarSections; the Brussels
   theme's 75% column), the markers removed (the cleanup may have added a style token to them).
   Run: node --test test/brussels-sidebar.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  withSidebarContent, withSidebarSections, SIDEBAR_START, SIDEBAR_END,
} from '../tools/importer/brussels-import.mjs';

const twocolumn = '<div class="twocolumn column event section"><div class="column-view flex-column container-gray full-width-bg"><div><h2>Current Travel Regulations</h2></div><div class="row"><div class="col-md-6 col-lg column-view-item"><div class="text section"><div class="richtext"><p>Entry regulations may change.</p></div></div></div></div></div></div>';
const sidebar = (content, aside = '') => `<div class="sidebar event section"><div class="airem-sidebar d-md-flex"><div class="sidebar-content">${content}</div><div class="sidebar-aside">${aside}</div></div></div>`;
const marker = (t) => `<div class="text section"><div class="richtext"><p>${t}</p></div></div>`;

test('a sidebar with column views: its content column a col- column, between two markers', () => {
  const html = `<div class="section-content"><div class="headline section"><h2>Before</h2></div>${sidebar(`<div class="headline section"><h1>Travel and entry requirements</h1></div>${twocolumn}`, '<div class="headline section"><h2>Related topics</h2></div>')}</div>`;
  assert.equal(withSidebarContent(html), `<div class="section-content"><div class="headline section"><h2>Before</h2></div><div class="sidebar event section"><div class="airem-sidebar d-md-flex"><div class="sidebar-content col-sidebar-content">${marker(SIDEBAR_START)}<div class="headline section"><h1>Travel and entry requirements</h1></div>${twocolumn}${marker(SIDEBAR_END)}</div><div class="sidebar-aside"><div class="headline section"><h2>Related topics</h2></div></div></div></div></div>`);
});

test('a sidebar without column views (a columns-media sidebar) stays as it is', () => {
  const html = `<div class="section-content">${sidebar('<div class="headline section"><h1>Invoice request</h1></div><div class="text section"><div class="richtext"><p>Text</p></div></div>', '<div class="text section"><div class="richtext"><p>Aside</p></div></div>')}</div>`;
  assert.equal(withSidebarContent(html), html);
});

const meta = (s) => `<div class="section-metadata"><div><div>style</div><div>${s}</div></div></div>`;

test('the sections between the markers get the style sidebar, the markers go', () => {
  const doc = [
    '<div><p>Hero</p></div>',
    `<div><p>${SIDEBAR_START} {full-width}</p><h1>Travel and entry requirements</h1><p>Intro</p></div>`,
    `<div><h2>Current Travel Regulations</h2><p>Entry regulations may change.</p>${meta('grey, column-band')}</div>`,
    `<div><h2>FAQ</h2><p>${SIDEBAR_END} {full-width}</p></div>`,
    '<div><h2>Related topics</h2></div>',
  ].join('\n');
  assert.equal(withSidebarSections(doc), [
    '<div><p>Hero</p></div>',
    `<div><h1>Travel and entry requirements</h1><p>Intro</p>${meta('sidebar')}</div>`,
    `<div><h2>Current Travel Regulations</h2><p>Entry regulations may change.</p>${meta('grey, column-band, sidebar')}</div>`,
    `<div><h2>FAQ</h2>${meta('sidebar')}</div>`,
    '<div><h2>Related topics</h2></div>',
  ].join('\n'));
});

test('a document without markers as it is', () => {
  const doc = '<div><p>Text</p></div>\n<div><h2>More</h2></div>';
  assert.equal(withSidebarSections(doc), doc);
});

test('a marker inside a section splits it: what is before the start and after the end is no sidebar', () => {
  const doc = [
    `<div><p>Hero</p><p>${SIDEBAR_START} {full-width}</p><h1>Travel and entry requirements</h1></div>`,
    `<div><h2>Current Travel Regulations</h2>${meta('flush, grey')}</div>`,
    `<div><h2>FAQ</h2><p>${SIDEBAR_END}</p><p>{spacer-30}</p><h2>Related topics</h2>${meta('padded')}</div>`,
  ].join('\n');
  assert.equal(withSidebarSections(doc), [
    '<div><p>Hero</p></div>',
    `<div><h1>Travel and entry requirements</h1>${meta('sidebar')}</div>`,
    `<div><h2>Current Travel Regulations</h2>${meta('flush, grey, sidebar')}</div>`,
    `<div><h2>FAQ</h2>${meta('padded, sidebar')}</div>`,
    `<div><p>{spacer-30}</p><h2>Related topics</h2>${meta('padded')}</div>`,
  ].join('\n'));
});
