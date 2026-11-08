/* eslint-disable max-len */
/* Brief 505 item 1, /de/en/articles/tags/munich (insights-flow, brief 488): before a grey band ("Highlights to Listen
   to") www has only the text component's 2.4rem under the intro; ours the 48 px section gap, 24 px more at 1440 and 390.
   On insights-flow pages a section right before a grey band keeps 24 px; not before an in-column grey box (tags/allegris:
   the gap stays, 23.2 -> 25.0 % with it).
   Run: node --test test/insights-flow-grey-505.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('insights-flow: a section before a grey band, 24 px', () => {
  assert.ok(css.includes('body.brand-lufthansa.insights-flow main > .section:not(.grey):has(+ .section.grey:not(.in-column)) { margin-bottom: 24px; }'));
});
