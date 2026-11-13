/* eslint-disable max-len */
/* lufthansa.com: one row of jump links that ends its section, the next section opening with a separator (brief 557,
   /gb/en and /de/de digital-self-services: www's link list, a .separator with its own 60 px, the column view with
   the heading; 99 px of ink from the last link to the heading at 390, ours 146). The list's 31 px (it stands for
   the default separator a list usually has after it) and the 24 px section gap came on top of the separator: there
   the list has no bottom padding and the section 5 px below it.
   Run: node --max-old-space-size=256 --test test/jump-links-section-end-separator-557.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const NEXT = ':has(+ .section > .default-content-wrapper:first-child > p.spacer:first-child)';

const body = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, sel);
  return css.slice(i + sel.length, css.indexOf('}', i));
};

test('the section that ends with the jump links: 5 px under it', () => {
  assert.match(body(`body.brand-lufthansa main > .section:has(> .jump-links-wrapper:last-child > .jump-links:not(.columns))${NEXT}`), /margin-bottom: 5px;/);
});

test('its list: no bottom padding', () => {
  assert.match(body(`body.brand-lufthansa main > .section${NEXT} > .jump-links-wrapper:last-child > .jump-links:not(.columns) .jump-links-list`), /padding-bottom: 0;/);
});
