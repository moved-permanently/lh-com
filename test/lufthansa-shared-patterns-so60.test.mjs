/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 60 item 2 (the switch branch): the shared patterns of plan 923 §13.4 that passed their gate (none of the
   page-widths a rule reaches more than 0.5 points further than the switched state before it, the sum down).
   C2: on phones a flow page's H3 right after text keeps no heading gap (security-check-time-slot 390 5.75 -> 4.40 %;
       11 page-widths 75.15 -> 72.12). From 768 px it moved child-in-businessclass 1440 0.55 further: phones only.
   D2: on phones a picture that ends its section right before a view that opens with text keeps its 40 px below, as R16b does
       before a view's heading (upgrades-at-online-check-in 390 8.29 -> 4.89 %; 9 page-widths 68.49 -> 60.26). From 768 px it
       moved first-class-personal-assistant 1440 1.12 further: phones only.
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
