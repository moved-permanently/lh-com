/* eslint-disable max-len */
/* TAP row 149, its second half: a heading section's description at most 790 px wide, as www's (the description is in
   the heading's max-w-[790px] container: lounges' "TAP Premium Lounges in Lisbon", "Free access to Lounges", credit
   cards' "Acumule milhas ...", auctions' "Leilões disponíveis", the help centre's "Requests and complaints"). The
   documents mark a heading with its description by ending its section after it, style heading-section (row 139), so
   tap.css caps what follows a heading-section's last H2 in its last wrapper (a description of one paragraph or more);
   a rich text's first paragraph after a separate heading (1120 px on www) is not marked and keeps its width.
   Run: node --test test/tap-heading-description-790-588.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');

test('a heading section\'s description of brand tap at most 790 px wide, as its heading', () => {
  const m = css.match(/body\.brand-tap main > \.section\.heading-section:not\(([^{]*)\) > \.default-content-wrapper:last-child > h2:not\(h1 \+ h2\):last-of-type ~ \* \{\s*max-width: 790px;\s*\}/);
  assert.ok(m, 'the rule');
  assert.match(m[1], /\.section-tab-panel/, 'a tab panel\'s centred title excluded, as row 149\'s heading rule');
});

test('only a marked description: no cap on a paragraph after any H2', () => {
  assert.doesNotMatch(css, /\.default-content-wrapper[^{,]*> h2[^{,]*\+ p\s*\{\s*max-width: 790px/);
});
