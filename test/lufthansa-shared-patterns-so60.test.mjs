/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 60 item 2 (the switch branch): the shared patterns of plan 923 §13.4 that passed their gate (none of the
   page-widths a rule reaches more than 0.5 points further than the switched state before it, the sum down).
   C2: on phones a flow page's H3 right after text keeps no heading gap (security-check-time-slot 390 5.75 -> 4.40 %;
       11 page-widths 75.15 -> 72.12). From 768 px it moved child-in-businessclass 1440 0.55 further: phones only.
   D2: on phones a picture that ends its section right before a view that opens with text keeps its 40 px below, as R16b does
       before a view's heading (upgrades-at-online-check-in 390 8.29 -> 4.89 %; 9 page-widths 67.88 -> 60.26 with C2). From 768 px it
       moved first-class-personal-assistant 1440 1.12 further: phones only.
   G: an article's chapter right after a section that ends with a block gets no chapter rule (scripts/token-free.js; its
       tests: test/chapter-rule-teaser-532.test.mjs, test/token-free.test.mjs).
   I: inside a column view an H2 or H3 right after text keeps no heading gap, at every width (get-your-guide 390 8.86 ->
       7.27 %; 34 page-widths 490.36 -> 485.96).
   Run: node --test test/lufthansa-shared-patterns-so60.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');
const media = (rule) => {
  // the rule's text and the @media block it stands in
  const at = css.indexOf(rule);
  assert.ok(at > 0, rule);
  const open = css.lastIndexOf('@media', at);
  return css.slice(open, css.indexOf('{', open)).trim();
};

test('C2: a flow page\'s H3 after text, no heading gap, on phones only and with the live theme', () => {
  const rule = 'body.theme-live.brand-lufthansa.flow-spacing main .default-content-wrapper > :is(p:not(.spacer), ul, ol) + h3 {\n    margin-top: 0;';
  assert.equal(media(rule), '@media (width < 768px)');
});

test('D2: a picture before a view that opens with text keeps 40 px, on phones only and with the live theme', () => {
  const rule = 'body.theme-live.brand-lufthansa main > .section:not(.grey, .column-view):has(+ .section.column-view:not(.grey) > .default-content-wrapper:first-child > p:first-child:not(.spacer, .button-wrapper)):has(> .default-content-wrapper:last-child > p:last-child > picture, > .default-content-wrapper:last-child > p:last-child > a > picture) {\n    margin-bottom: 40px;';
  assert.equal(media(rule), '@media (width < 768px)');
  // no :has() inside :has() (dropped silently by the browsers: test/styles-no-nested-has.test.mjs)
  assert.ok(!/:has\([^()]*:has\(/.test(rule));
});

test('I: an H2 / H3 after text inside a column view, no heading gap, at every width, with the live theme', () => {
  const rule = 'body.theme-live.brand-lufthansa.flow-spacing main > .section.column-view > .default-content-wrapper > :is(p:not(.spacer), ul, ol) + :is(h2, h3) {\n  margin-top: 0;';
  const at = css.indexOf(rule);
  assert.ok(at > 0);
  // not inside an @media block: the last @media before it is closed before the rule
  const open = css.lastIndexOf('@media', at);
  const block = css.slice(open, at);
  assert.equal((block.match(/\{/g) || []).length, (block.match(/\}/g) || []).length);
});

test('B2 (standing order 61): on phones a padded column view right before the Subpage Nav keeps no gap, with the live theme', () => {
  const rule = 'body.theme-live.brand-lufthansa main > .section.column-view.padded:not(.grey):has(+ .section.subpage-nav-container) {\n    margin-bottom: 0;';
  assert.equal(media(rule), '@media (width < 768px)');
});
