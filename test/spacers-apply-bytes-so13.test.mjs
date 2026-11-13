/* eslint-disable max-len, import/extensions */
/* Standing order 13 of 2026-11-13, item 1: text-spacers-apply.mjs and b2b-view-spacers-apply.mjs wrote the document
   again from linkedom's tree, so DA's escaping changed wherever a marker went in (an href's `&amp;` became a bare `&`,
   `&ndash;` the character, `&nbsp;` `&#160;`), as heading-size-marks-apply.mjs did before 22852472. Both find their
   place with linkedom as before and insert the marker into DA's own text: the rest of the document byte for byte.
   source-elements.mjs maps a section's own children to their place in the text; where the text and linkedom's tree
   disagree, nothing changes (result "not found in the source").
   Run: node --test test/spacers-apply-bytes-so13.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyTextSpacers } from '../tools/importer/text-spacers-apply.mjs';
import { applyViewSpacers } from '../tools/importer/b2b-view-spacers-apply.mjs';
import { sectionChildren } from '../tools/importer/source-elements.mjs';

const src = fs.readFileSync(new URL('./fixtures/spacers-bytes-so13/doc.plain.html', import.meta.url), 'utf8');

test('the fixture holds DA\'s escaping: an href with &amp;, &quot;, &nbsp;, &ndash;, &gt;, &lt; in an alt, a comment', () => {
  ['href="/de/en/x?a=1&amp;b=2"', '&quot;fees&quot;', 'fees&nbsp;page', '&ndash;', '&gt; first.', 'alt="A &lt;b&gt; tag"', '<!-- DA keeps comments -->', '&#x26;'].forEach((s) => assert.ok(src.includes(s), s));
});

test('text-spacers-apply: only the marker after the paragraph, the rest byte for byte', () => {
  const { html, results } = applyTextSpacers(src, [{
    kind: 'nbsp', after: 'Second line > first.', before: 'Second paragraph', gap1440: 64, gap390: 56,
  }]);
  assert.deepEqual(results.map((r) => r.result), ['{spacer-41}']);
  assert.equal(html, src.replace('first.</p>\n  <!--', 'first.</p><p>{spacer-41}</p>\n  <!--'));
});

test('text-spacers-apply: two rows, one between a paragraph and an H2; a second run changes nothing', () => {
  const rows = [
    { kind: 'nbsp', after: 'see fees page', before: 'INTRODUCTION', gap1440: 64, gap390: 56 },
    { kind: 'nbsp', after: 'Second line > first.', before: 'Second paragraph', gap1440: 52, gap390: 42 },
  ];
  const { html, results } = applyTextSpacers(src, rows);
  assert.deepEqual(results.map((r) => r.result), ['{spacer-41}', '{spacer-28}']);
  assert.equal(html, src.replace('fees&nbsp;page</a></p>', 'fees&nbsp;page</a></p><p>{spacer-41}</p>').replace('first.</p>\n  <!--', 'first.</p><p>{spacer-28}</p>\n  <!--'));
  // a second run finds the marker where the next text was (as the tools always did: "not found"), and changes nothing
  const again = applyTextSpacers(html, rows);
  assert.ok(again.results.every((r) => !r.result.startsWith('{spacer-')));
  assert.equal(again.html, html);
});

test('b2b-view-spacers-apply: only the marker before the view, the rest byte for byte', () => {
  const { html, results } = applyViewSpacers(src, [{ px: 25, next: { start: 'For companiesPartnerPlusBenefit' }, prev: { end: 'offerings & more.' } }]);
  assert.deepEqual(results.map((r) => r.result), ['{spacer-25}']);
  assert.equal(html, src.replace('  <div class="columns-media">', '  <p>{spacer-25}</p><div class="columns-media">'));
  const from768 = applyViewSpacers(src, [{ px: 25, from768: true, next: { start: 'For companies' }, prev: { end: '' } }]);
  assert.equal(from768.html, src.replace('  <div class="columns-media">', '  <p>{spacer-25 from-768}</p><div class="columns-media">'));
});

test('sectionChildren: a section\'s own children with their place in the text; comments and void elements skipped', () => {
  const kids = sectionChildren(src);
  assert.deepEqual(kids.map((k) => k.tag), ['h1', 'p', 'h2', 'p', 'p', 'p', 'h2', 'p', 'div']);
  kids.forEach((k) => assert.ok(src.slice(k.start).toLowerCase().startsWith(`<${k.tag}`) && src.slice(0, k.end).toLowerCase().endsWith(`</${k.tag}>`), k.tag));
  // an attribute value holding ">" does not end the tag
  assert.deepEqual(sectionChildren('<div><p title="a > b">x</p><p>y</p></div>').map((k) => [k.tag, k.start, k.end]), [['p', 5, 27], ['p', 27, 35]]);
  // text that does not close what it opens: no places at all (the tools then change nothing)
  assert.equal(sectionChildren('<div><p>x</div>'), null);
});

test('where the text and linkedom\'s tree disagree nothing changes', () => {
  const odd = '<div><p>One.</p><p>Two.</p></div><div><p>unclosed</div>';
  const t = applyTextSpacers(odd, [{ kind: 'nbsp', after: 'One.', before: 'Two.', gap1440: 64, gap390: 56 }]);
  assert.deepEqual(t.results.map((r) => r.result), ['not found in the source']);
  assert.equal(t.html, odd);
  const v = applyViewSpacers(odd, [{ px: 25, next: { start: 'Two.' }, prev: { end: 'One.' } }]);
  assert.deepEqual(v.results.map((r) => r.result), ['not found in the source']);
  assert.equal(v.html, odd);
});
