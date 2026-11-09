/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 506, items 3 and 4: the harness's loss check of a collapsed document (tools/importer/collapse-loss-check.mjs)
   and the marker families the census counts (tools/importer/marker-families.mjs).
   Run: node --max-old-space-size=512 --test test/collapse-loss-check.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { lossProblems } from '../tools/importer/collapse-loss-check.mjs';
import { countMarkers, stripMarkers, familyOf } from '../tools/importer/marker-families.mjs';

const DOC = `<div>
  <h1 id="t">Title</h1>
  <p>{spacer-60}</p>
  <h2 id="a-heading-small">About {heading-small}</h2>
  <p>Text with a <a href="/de/en/x">link</a> {full-width}</p>
  <p><picture><img src="./media_1.jpg" alt="A view"></picture></p>
  <p><em>The view</em> {caption}</p>
  <p>{column-start-outer}</p>
  <div class="columns-media"><div><div><p>Inside {copytext-small}</p></div></div></div>
  <p>{column-end-outer}</p>
  <p>1. First step {indent-40}</p>
  <p>2. Second step {indent-40}</p>
  <p>Fares from {origin} {limited-width}</p>
  <div class="metadata"><div><div>Template</div><div>info</div></div></div>
</div>`;

test('a collapsed document loses nothing: only markers go and carriers come', () => {
  const after = collapseHtml(DOC, {
    path: '/de/en/x', brand: 'lufthansa', parse: parseHTML, force: true,
  }).html;
  assert.notEqual(after, DOC);
  assert.deepEqual(lossProblems(DOC, after), []);
  // the DA source shape too
  const da = `<body><header></header><main>${DOC}</main><footer></footer></body>`;
  assert.deepEqual(lossProblems(da, collapseHtml(da, {
    path: '/de/en/x', brand: 'lufthansa', parse: parseHTML, force: true,
  }).html), []);
});

test('an article\'s chapters split into sections of their own keep the order (two splits in one section)', () => {
  const article = '<div><div class="article-header"><div><div>h</div></div></div><p>Intro</p><p>{divider-25}</p><p><strong>About</strong></p><p>One</p>'
    + '<p>{divider-25}</p><p><strong>Tip</strong></p><p>Two</p><p>{spacer-60}</p><p>Three</p></div>';
  const after = collapseHtml(article, {
    path: '/de/en/articles/x', brand: 'lufthansa', parse: parseHTML, force: true,
  }).html;
  assert.deepEqual(lossProblems(article, after), []);
  const { document } = parseHTML(`<main>${after}</main>`);
  assert.deepEqual([...document.querySelectorAll('main > div')].map((d) => d.textContent.replace(/\s+/g, '')), ['hIntro', 'AboutOne', 'TipTwoThree']);
});

test('the loss check finds what the collapse must never do', () => {
  const after = collapseHtml(DOC, {
    path: '/de/en/x', brand: 'lufthansa', parse: parseHTML, force: true,
  }).html;
  const kinds = (html) => lossProblems(DOC, html).map((p) => p.split(':')[0]);
  assert.deepEqual(kinds(after.replace('Text with a', 'Text a')), ['text']);
  assert.deepEqual(kinds(after.replace('href="/de/en/x"', 'href="/de/en/y"')), ['links']);
  assert.deepEqual(kinds(after.replace('./media_1.jpg', './media_2.jpg')), ['images']);
  assert.deepEqual(kinds(after.replace('class="columns-media', 'class="cards-teaser')), ['blocks']);
  assert.deepEqual(kinds(after.replace(/<h2([^>]*)>About<\/h2>/, '<h3$1>About</h3>')), ['headings per level']);
  assert.deepEqual(kinds(after.replace(/<h2([^>]*)>About<\/h2>/, '<h1$1>About</h1>')), ['headings per level', 'h1']);
  assert.deepEqual(kinds(after.replace('Fares from {origin}', 'Fares from {origin} {heading-small}')), ['markers left']);
});

test('marker families: every token in a brace group must be a marker; placeholders and app tokens apart', () => {
  assert.deepEqual(countMarkers('A {heading-small} B {full-width column-end} C {spacer-30 from-768}'), {
    heading: 1, 'text-width': 1, column: 1, separator: 2,
  });
  assert.deepEqual(countMarkers('Fares from {origin} for {COUNT} {1,3} days'), {});
  assert.deepEqual(countMarkers('<p>{spacer: medium}</p><p>{spacer: medium, v2}</p><p>Fine {small}</p>'), { 'app spacer': 2, 'app small': 1 });
  assert.deepEqual(countMarkers('{autoplay muted loop size-1920x1080} {selected} {cart}'), { video: 4, form: 1, 'nav-role': 1 });
  assert.equal(stripMarkers('About {heading-small} from {origin}'), 'About  from {origin}');
  assert.equal(familyOf('cell-half-start'), 'cell');
  assert.equal(familyOf('origin'), null);
});
