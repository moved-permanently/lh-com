/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 551c item 2 (the ranking): Brussels /be/en/local-page/student-fares, +18.9 % at 1440 on our host against
   brussels-parity-004 (+1,024 px at "Fly, collect and redeem"). www's grey row there is a two-column view in a one-column
   view: the picture | the heading, the text and a nested two-column view of the two app links ("Download for iOS" |
   "Download for Android"). columns-media's selectors leave out a view with a nested column view, so the row came in as
   default content: the 2,497 x 1,879 picture full width, the text under it. The info template (and Austrian's three
   built from it) now takes such a view when its nested views hold links only; the parser flattens nested views into their
   cell. A copy of the published document with that row as columns-media: 1440 -869 px (+18.9 -> about +2.0 %), 390
   +26 px (-0.8 -> about -0.5 %). Of the 883 lufthansa.com snapshots, the 17 Brussels ones and both recording sets
   (Austrian -003, Brussels -004) only student-fares has the structure.
   Run: node --max-old-space-size=256 --test test/columns-media-nested-links-557.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const templates = JSON.parse(fs.readFileSync('tools/importer/page-templates.json', 'utf8'));
const list = Array.isArray(templates) ? templates : templates.templates;
const instances = (name) => list.find((t) => t.name === name).blocks.find((b) => b.name === 'columns-media').instances;

const item = (inner) => `<div class="col-md-6 col-lg column-view-item">${inner}</div>`;
const view = (cls, items, extra = '') => `<div class="${cls} column event section"><div class="column-view flex-column ${extra}"><div class="row">${items.join('')}</div></div></div>`;
const link = (t) => `<div class="link section"><maui-link><a href="https://apps.example/${t}">${t}</a></maui-link></div>`;
const IMAGE = '<div class="image parbase section"><div class="image-wrapper"><img src="/content/dam/x.jpg" alt=""></div></div>';
const TEXT = '<div class="headline section"><h1 class="headline heading-medium">Fly, collect and redeem</h1></div><div class="text section"><div class="richtext"><p>Turn your student fare flights into rewards.</p></div></div>';
const page = (nested, first = IMAGE) => `<html><body><div class="container-content"><div class="section"><div class="section-content container-fluid section-regular">
  ${view('onecolumn', [item(view('twocolumn', [item(first), item(`${TEXT}${nested}`)], 'container-gray full-width-bg'))])}
</div></div></div></body></html>`;
const LINKS = view('twocolumn', [item(link('Download for iOS')), item(link('Download for Android'))]);

const taken = (html, name = 'info') => {
  const { document } = parseHTML(html);
  const outer = document.querySelector('.onecolumn .twocolumn');
  return instances(name).filter((s) => outer.matches(s)).length;
};

test('student-fares\' row (picture | text and a nested view of two app links) is columns-media on info and Austrian\'s three', () => {
  ['info', 'austrian-checkin', 'austrian-flight-status', 'austrian-hero-banner'].forEach((name) => {
    assert.equal(taken(page(LINKS), name), 1, name);
  });
});

test('not when the nested view holds more than links, nor without a picture, nor with a deeper or a three-column view', () => {
  assert.equal(taken(page(view('twocolumn', [item(link('iOS')), item('<div class="text section"><p>More</p></div>')]))), 0);
  assert.equal(taken(page(LINKS, '<div class="text section"><p>No picture</p></div>')), 0);
  assert.equal(taken(page(view('twocolumn', [item(view('twocolumn', [item(link('a')), item(link('b'))])), item(link('c'))]))), 0);
  assert.equal(taken(page(view('threecolumn', [item(link('a')), item(link('b')), item(link('c'))]))), 0);
  assert.equal(taken(page(`${LINKS}<div class="accordion section"><p>Q</p></div>`)), 0);
});

test('a view without a nested one is taken as before (one selector)', () => {
  assert.equal(taken(page('')), 1);
});

test('the generated import scripts carry it', () => {
  const sel = instances('info').find((s) => s.includes(':has(> .column-view > .row > .column-view-item > .twocolumn)'));
  assert.ok(sel);
  ['import-info.js', 'import-info.bundle.js', 'import-austrian-checkin.bundle.js', 'import-austrian-flight-status.bundle.js', 'import-austrian-hero-banner.bundle.js'].forEach((f) => {
    const src = fs.readFileSync(`tools/importer/${f}`, 'utf8');
    assert.ok(src.includes(sel) || src.includes(JSON.stringify(sel).slice(1, -1)), f);
  });
});
