/* eslint-disable max-len */
/* ITA's small print under a text (the standing order of the night of 2026-11-10, item e; ITA row 32; ita-parity-004
   /it/en/support/utilities/invoicing at 1440 and 390): www's "(*) The cost of the call may vary…" (copytext-small) is the
   last paragraph of the text's own richtext: 24 px under the text (the paragraphs' margin) and 42 px over the next
   component (its own 18 px margin and the component's 24). The import puts it in a section of its own (Style small-print),
   so it stood 48 px under the text and 48 px over the grey band: "Flight Certification" 29 px lower than www's (1303
   against 1274 at 1440). The ITA theme sets those two gaps when a text section is followed by a small-print section;
   other sections keep the 48 px.
   Run: node --test test/ita-small-print-gap-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, `the rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};

test('a text section followed by small print: 24 px between them, as www\'s paragraphs', () => {
  assert.match(rule('body.brand-ita main > .section:has(> .default-content-wrapper:last-child):has(+ .section.small-print)'), /margin-bottom: 24px;/);
});

test('that small print: 42 px over the next section, as www\'s', () => {
  assert.match(rule('body.brand-ita main > .section:has(> .default-content-wrapper:last-child) + .section.small-print'), /margin-bottom: 42px;/);
});
