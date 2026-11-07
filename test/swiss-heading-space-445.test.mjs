/* eslint-disable max-len */
/* SWISS's headings' space below as www's (brief 445, item 6; the 60 swiss-parity-002 pages'
   captures): h2 (36 px, heading-medium) 40 px from 1025 px and 20 px below; heading-small (28 /
   22 px) 20 px at every width (lh-com's tokens: 32 px; the imprint 1.07 of www's height).
   Run: node --max-old-space-size=512 --test test/swiss-heading-space-445.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('the tokens: --heading-margin-xl 20 px, 40 px from 1025 px; --heading-margin-l 20 px', () => {
  const root = css.match(/:root \{([^}]*)\}/)[1];
  assert.match(root, /--heading-margin-xl: 20px;/);
  assert.match(root, /--heading-margin-l: 20px;/);
  assert.match(css, /@media \(width >= 1025px\) \{ :root \{[^}]*--heading-margin-xl: 40px;[^}]*\}/);
});
