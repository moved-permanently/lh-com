/* eslint-disable max-len */
/* lufthansa.com styles, brief 526 item 3 (the pass check's insights articles): with the theme live (body.theme-live,
   scripts/token-free.js) a ruled chapter is a section of its own that opens with the chapter's divider (ruled-chapters:
   p.spacer.divider prepended). On www the rule sits 24 px under the text before it (the paragraph's own margin); the
   collapsed render had a section gap there, 48 px: in-my-hood-chiswick-london +24 px at "About" and at "Chiswick,
   London – More Tips", be-picky-barcelona-insider-tips at "About" and "Selected Tips". The divider that opens a section
   after another one takes 24 px back (its negative top margin collapses with the section gap), live theme only.
   Run: node --max-old-space-size=256 --test test/ruled-chapter-gap-526.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa.theme-live main > .section + .section > .default-content-wrapper:first-child > p.spacer.divider:first-child';

test('a chapter divider that opens a section after another one: 24 px back, the live theme only', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i + SEL.length, css.indexOf('}', i)), /margin-top: -24px;/);
});

test('the published pages (theme off) keep their spacing: the rule needs body.theme-live', () => {
  assert.ok(SEL.includes('.theme-live'));
});
