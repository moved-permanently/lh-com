/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 512, item 2: the carrier check of the lufthansa.com pass (tools/importer/carrier-check.mjs,
   harness-pass-lufthansa.md), and what it found in the workspace collapse: a column view followed only by a
   stray {column-end-outer} got flush and left the page metadata in a section of its own
   (/ir/en/tehran-frankfurt-restart).
   Run: node --max-old-space-size=512 --test test/carrier-check-508.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { carrierProblems, carriersOf } from '../tools/importer/carrier-check.mjs';
import { lossProblems } from '../tools/importer/collapse-loss-check.mjs';

const run = (html) => collapseHtml(html, {
  path: '/ir/en/x', brand: 'lufthansa', parse: parseHTML, force: true,
}).html;
const meta = '<div class="metadata"><div><div>Title</div><div>t</div></div></div>';
const sm = (style) => `<div class="section-metadata"><div><div>style</div><div>${style}</div></div></div>`;

test('the collapse: a stray column end after a column view is no "more follows"', () => {
  const doc = `<div><p>a</p></div><div><p>{column-start-outer}</p><p>x</p><h1>T</h1><p>y {column-end-outer}</p><p>{column-end-outer}</p>${meta}</div>`;
  const out = run(doc);
  const { document } = parseHTML(`<main>${out}</main>`);
  const sections = [...document.querySelectorAll('main > div')];
  assert.equal(sections.length, 2, out);
  assert.ok(sections[1].querySelector(':scope > .metadata'), 'the page metadata stays in the column view\'s section');
  assert.ok(!/flush/.test(out), out);
  assert.match(out, /column-view, padded/);
  assert.deepEqual(carrierProblems(doc, out), []);
  assert.deepEqual(lossProblems(doc, out), []);
  // content after it still makes it flush
  const more = run('<div><p>{column-start}</p><p>x</p><p>y {column-end}</p><p>{column-end}</p><p>after</p></div>');
  assert.match(more, /column-view, flush/);
});

test('the check: what the collapse gained, the importers\' own styles left alone', () => {
  const before = `<div><h2>A</h2><p>a</p>${sm('flush, column-view, grey')}</div><div><p>b</p>${sm('grey')}</div>`;
  // the importers' column view at the end and a grey section split in two: no problem
  assert.deepEqual(carrierProblems(before, `${before}<div><p>c</p>${sm('grey')}</div>`), []);
  assert.deepEqual(carrierProblems(before.replace('<p>b</p>', '<p>b</p><p>{spacer-60 from-768}</p>'), before.replace('<p>b</p>', '<p>b</p><div class="spacer from-768"><div><div></div></div></div>')), []);
  const bad = [
    [`<div><p>a</p>${sm('space-xl')}</div>`, /unknown section style: space-xl/],
    ['<div><p>a</p><div class="spacer xl"><div><div></div></div></div></div>', /unknown spacer option: xl/],
    [`<div><p>{spacer-60}</p>${sm('column-view')}</div><div><p>b</p></div>`, /a column view with no content/],
    [`<div><p>a</p>${sm('column-view, flush')}</div>${'<div>'}${meta}</div>`, /flush on the page's last section/],
    [`<div><p>a</p>${sm('flush')}</div><div><p>b</p></div>`, /flush on a section that is no column view/],
  ];
  bad.forEach(([after, want]) => assert.ok(carrierProblems('<div><p>a</p></div>', after).some((p) => want.test(p)), String(want)));
  assert.ok(carrierProblems('<div><p>a</p></div>', `<div><p>a</p>${sm('column-view')}</div><div><p>b</p></div>`, { never: ['column-view'] }).some((p) => /never gets: column-view/.test(p)));
  assert.ok(carrierProblems('<div><p>a</p></div>', `<div><p>a</p>${sm('wide-text, space-m')}</div>`, { max: 1 }).some((p) => /2 carriers gained/.test(p)));
  // a carrier without the marks it stands for
  const sources = [
    [`<div><p>a</p>${sm('column-view')}</div><div><p>b</p></div>`, /column-view without its marks/],
    ['<div><p>a</p><div class="spacer from-768"><div><div></div></div></div><p>b</p></div>', /spacer from-768 without its marks/],
    ['<div><div class="video background-video"><div><div>v</div></div></div></div>', /background-video without its marks/],
  ];
  sources.forEach(([after, want]) => {
    assert.ok(carrierProblems('<div><p>a</p></div>', after).some((p) => want.test(p)), String(want));
    assert.deepEqual(carrierProblems('<div><p>{column-start}</p><p>{spacer-60 from-768}</p><p>{autoplay muted loop}</p></div>', after).filter((p) => /without its marks/.test(p)), [], String(want));
  });
  assert.equal(carriersOf('<div><div class="cards space-m title-large"><div><div>x</div></div></div></div>').get('option title-large'), 1);
});
