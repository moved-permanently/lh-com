/* eslint-disable max-len */
/* Standing order 20, item 3: Austrian's grey bands. www's .container-gray is #e7e7e7 (its stylesheet; the bands of
   entryregulations and travel-id are rgb(231, 231, 231) in austrian-parity-015), ours were lufthansa.com's grey
   (--lh-grey-1, #f6f6f6). The outlined button on the band is www's .btn-secondary { background-color: transparent }:
   the band shows through it, ours was white. Colour only: no page changes height. Reads the theme CSS as written.
   Run: node --max-old-space-size=256 --test test/austrian-grey-band-so20.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('a grey band in www\'s container-gray, its outlined buttons without a fill', () => {
  const at = css.indexOf('body.brand-austrian main > .section.grey { ');
  assert.ok(at >= 0, 'no rule for the Austrian grey band');
  const rule = css.slice(at, css.indexOf('}', at));
  assert.match(rule, /background-color: var\(--lh-grey-2\);/);
  assert.match(rule, /--button-secondary-surface: transparent;/);
  assert.match(css, /--lh-grey-2: #e7e7e7;/);
});
