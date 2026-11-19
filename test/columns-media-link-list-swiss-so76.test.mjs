/* Standing order 76 (2026-11-19), the SWISS no-breakage sweep: Columns Media's option link-list drew its icon
   headings 18px at every width, while the column's other h3 / h4 take www's .heading-copytext-large (16px below
   1025px, 18px from 1025: .link-list .heading-default { font-size: 1.8rem } in www's recorded stylesheet). On phones
   /ch/<lang>/prepare/baggage/hand-baggage drew "1 personal item" 18px beside "Economy Basic" 16px. SWISS's icon
   headings are 16px below 1025px; the shared 18px and lufthansa.com's variable stay.
   Run: node --test test/columns-media-link-list-swiss-so76.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8');

test('SWISS link-list icon headings: 16px below 1025px', () => {
  const m = css.match(/@media \(width < 1025px\) \{\s*body\.brand-swiss \.columns-media\.link-list \.columns-media-row > \.columns-media-text :is\(h3, h4\):has\(> picture\) \{([^}]*)\}/);
  assert.ok(m, 'the SWISS rule below 1025px');
  assert.match(m[1], /font-size: 16px;/);
});

test('the shared 18px and lufthansa.com\'s size are unchanged', () => {
  assert.match(css, /\n\.columns-media\.link-list \.columns-media-row > \.columns-media-text :is\(h3, h4\):has\(> picture\) \{[^}]*font-size: 18px;/);
  assert.match(css, /body\.brand-lufthansa \.columns-media\.link-list \.columns-media-row > \.columns-media-text :is\(h3, h4\):has\(> picture\) \{\s*font-size: var\(--heading-font-size-m\);/);
});
