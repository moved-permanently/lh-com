/* eslint-disable max-len */
/* The standing order after 570 item 2: the Brussels theme's spacing for columns-media's option in-column (a sidebar alone
   in a one-column view straight in the page container on www: the overview hubs' intro). www: the h1 44 px lower than
   our sidebar's at 1440 (20 at 390), the text 72 px under the h1 (66 at 390). Measured with the option and the rule added
   on the live /be/fr/special-care/families-and-children: the h1 at www's y at both widths, the text gap 72 / 66 (www
   72 / 66), the page -9.1 -> -4.4 % at 1440, -3.7 -> -2.1 % at 390. No live document has the option before its
   re-import. Run: node --max-old-space-size=256 --test test/brussels-in-column-sidebar-570.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const WRAP = 'body\\.brand-brussels main > \\.section > \\.columns-media-wrapper:has\\(> \\.columns-media\\.sidebar\\.in-column\\)';
const H1 = 'body\\.brand-brussels \\.columns-media\\.sidebar\\.in-column > div:first-child > div:first-child > h1:first-child';

test('an in-column sidebar: 20 px more above it, its h1 66 px over the text (390)', () => {
  assert.match(css, new RegExp(`${WRAP} \\{ margin-top: calc\\(var\\(--spacing-default\\) \\+ 20px\\); \\}`));
  assert.match(css, new RegExp(`${H1} \\{ margin-bottom: 66px; \\}`));
});

test('from 1025 px: 44 px more above it, the h1 72 px over the text', () => {
  assert.match(css, new RegExp(`${WRAP} \\{ margin-top: calc\\(var\\(--spacing-default\\) \\+ 44px\\); \\}`));
  assert.match(css, new RegExp(`${H1} \\{ margin-bottom: 72px; \\}`));
});
