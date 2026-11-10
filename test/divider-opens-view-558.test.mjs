/* eslint-disable max-len */
/* lufthansa.com: a divider that opens a padded campaign section right after a campaign column view (brief 558 item 4,
   /gb/en/miles-and-more's "This might also interest you", all four roots): www draws the line 53 px under the button
   above it and the heading's ink 63 px under the line at 390 and 1440 (lh-parity-004a), ours 21 and 30. The
   divider there keeps the column view's 32 px above and below it.
   Run: node --max-old-space-size=256 --test test/divider-opens-view-558.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('the divider opening the view after a campaign column view: 32 px above, 33 px below', () => {
  const sel = 'body.brand-lufthansa main > .section.campaign-section.column-view + .section.campaign-section.padded > .default-content-wrapper:first-child > p.spacer.divider:first-child';
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, 'rule');
  const body = css.slice(i, css.indexOf('}', i));
  assert.match(body, /margin-top: 32px;/);
  assert.match(body, /margin-bottom: 33px;/);
});
