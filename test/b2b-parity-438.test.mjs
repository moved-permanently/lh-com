/* eslint-disable max-len -- dev tooling */
/* B2B (brief 438 item 3, tools/reports/b2b/parity.md): the news overview at 390 against b2b-parity-001
   (+88 px). Below 768 px www's tab set (Product & Services, Connections, Our Partner News) is an accordion of
   50 px rows on white, 30 px under the heading before it, and the footer right after the last row; ours kept
   the (hidden) tab list's 48 px section gap, each closed panel's grey band (20 px above and below) and the
   last panel's 48 px gap. B2B-scoped, below 768 px, closed panels only (an open one keeps its band); no
   :has() inside a :has() (test/b2b-parity-427.test.mjs guards that).
   Run: node --max-old-space-size=512 --test test/b2b-parity-438.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const theme = () => fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('the news tab set below 768 px as www\'s accordion: 30 px under the heading, closed rows on white, no gap before the footer', () => {
  const css = theme();
  const i = css.indexOf('/* brief 438: the tab set below 768 px');
  assert.ok(i > 0, 'the brief 438 part');
  const part = css.slice(i);
  assert.match(part, /@media \(width < 768px\) \{ body\.brand-b2b main > \.section:has\(\+ \.section\.section-tabs\) \{ margin-bottom: 30px; \}/);
  assert.match(part, /body\.brand-b2b main > \.section\.section-tab-panel:not\(:has\(> \.section-tab-toggle\[aria-expanded="true"\]\)\) \{ margin-top: 0; padding-top: 0; padding-bottom: 0; background-color: transparent; \}/);
  assert.match(part, /body\.brand-b2b main > \.section\.section-tab-panel:not\(:has\(> \.section-tab-toggle\[aria-expanded="true"\]\), :has\(~ \.section-tab-panel, ~ \.section-tab-part, ~ \.section > \*\)\) \{ margin-bottom: 0; \}/);
  assert.match(part, /body\.brand-b2b main > \.section\.section-tab-panel ~ \.section:not\(:has\(\*\)\) \{ display: none; \} \}/);
});

test('the airlines page below 768 px: a stacked text cell that ends with its link line 14 px above the picture, as www (36 px before: +22 px an airline)', () => {
  const css = theme();
  const part = css.slice(css.indexOf('/* brief 438: the tab set below 768 px'));
  assert.match(part, /@media \(width < 768px\) \{ body\.brand-b2b \.columns-media \.columns-media-row > \.columns-media-text:not\(:last-child\):has\(> p\.link-wrapper:last-child\) \{ margin-bottom: 14px; \}/);
  // the rows of such cells 42 px apart (the link line 45 px above the next row's picture on www, 71 before)
  assert.match(part, /body\.brand-b2b \.columns-media:has\(> \.columns-media-row > \.columns-media-text:last-child > p\.link-wrapper:last-child\) \{ gap: 42px; \} \}/);
});
