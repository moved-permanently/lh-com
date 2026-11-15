/* eslint-disable max-len */
/* Standing order 27 (2026-11-15), item 3: /de/en/lufthansa-am-flughafen-frankfurt. In its tab panels a link alone in its
   paragraph ("To online check-in") is www's large navigation link with lh-arrow-right and 82px to the next heading at
   1440; ours had no arrow and 58px. A lufthansa.com panel link paragraph gets the arrow, and 48px under it before a
   heading. Census (published copies): the fifteen am-flughafen-frankfurt documents. Gate (injected, then working-copy
   code, against lh-parity): 14.0 / 16.5 -> 7.4 / 9.7 % at 1440 / 390; onboard-delights and payment-options-at-the-airport
   the same.
   Run: node --test test/profile-tabs-panel-links-so27.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/profile-tabs/profile-tabs.css', import.meta.url), 'utf8');
const body = (sel) => {
  const at = css.indexOf(`${sel} {`);
  assert.ok(at > 0, sel);
  return css.slice(at, css.indexOf('}', at));
};

test('a panel link paragraph: the arrow, and 48px under it before a heading', () => {
  assert.match(body('body.brand-lufthansa .profile-tabs .profile-tabs-panel p.link-wrapper a:any-link'), /display: inline-flex;/);
  const before = body('body.brand-lufthansa .profile-tabs .profile-tabs-panel p.link-wrapper a:any-link::before');
  assert.match(before, /width: 19px;/);
  assert.match(before, /mask: url\(/);
  assert.match(body('body.brand-lufthansa .profile-tabs .profile-tabs-panel p.link-wrapper:has(+ :is(h2, h3, h4))'), /margin-bottom: 48px;/);
});
