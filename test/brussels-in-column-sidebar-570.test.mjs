/* eslint-disable max-len */
/* The standing order after 570 item 2: the Brussels theme's spacing for columns-media's option in-column (a sidebar alone
   in a one-column view straight in the page container on www: the overview hubs' intro). www: the h1 44 px lower than
   our sidebar's at 1440 (20 at 390). The brief after 588: the text under the h1 is at the brand's gap on www (28 / 26 on
   the six hubs of brussels-parity-006); families-and-children's 72 / 66 is an empty line of that page, so the h1 rule
   of 2595ae36 (72 / 66) is gone. Measured with the rule added on the live hubs: the h1 at www's y and the text gap
   www's at both widths. No live document has the option before its re-import. Run: node --max-old-space-size=256 --test test/brussels-in-column-sidebar-570.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const WRAP = 'body\\.brand-brussels main > \\.section > \\.columns-media-wrapper:has\\(> \\.columns-media\\.sidebar\\.in-column\\)';
const H1 = 'body\\.brand-brussels \\.columns-media\\.sidebar\\.in-column > div:first-child > div:first-child > h1:first-child';

test('an in-column sidebar: 20 px more above it (390)', () => {
  assert.match(css, new RegExp(`${WRAP} \\{ margin-top: calc\\(var\\(--spacing-default\\) \\+ 20px\\); \\}`));
});

test('from 1025 px: 44 px more above it', () => {
  assert.match(css, new RegExp(`${WRAP} \\{ margin-top: calc\\(var\\(--spacing-default\\) \\+ 44px\\); \\}`));
});

test('the text under the h1 keeps the brand gap (the brief after 588: www 28 / 26 on the six hubs of brussels-parity-006)', () => {
  assert.ok(!new RegExp(H1).test(css));
});
