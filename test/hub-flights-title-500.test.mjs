/* eslint-disable max-len */
/* Brief 500 item 1, /de/en/flights (hub; www's destination finder in a padded AEM section, its title
   "Best offers" inside the finder): the importer takes the title out as the page's H1 before the
   Destination Finder (grid) block. Against lh-parity-002 at 1440 the title was 40 px higher than
   www's (80 px under the breadcrumb, ours 40) and the filter another 54 px higher (144 px under the
   title's top, ours 90); at 390 the title 19 px higher. The title's wrapper takes the section's padding
   above it, from 768 px the title the finder's space under it. The finder's own layout at 390 and its
   offers (live data) are not part of this.
   Run: node --test test/hub-flights-title-500.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa main > .section > .default-content-wrapper:has(> h1:last-child):has(+ .destination-finder-wrapper > .destination-finder.grid)';

test('the destination finder\'s title: 20 px more above it on phones', () => {
  assert.ok(css.includes(`${SEL} { padding-top: 20px; }`));
});

test('from 768 px: 40 px more above, the finder 94 px under the title (its 40 and the finder\'s 54)', () => {
  assert.ok(css.includes(`@media (width >= 768px) { ${SEL} { padding-top: 40px; } ${SEL} > h1 { margin-bottom: 94px; } }`));
});
