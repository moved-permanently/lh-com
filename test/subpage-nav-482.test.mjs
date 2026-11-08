/* The sub-page navigation from 768 px (blocks/subpage-nav; brief 482, lufthansa.com's
   /de/en/secure-flight against www): www's .container-subnav is out of the flow (absolute) and
   nothing keeps the page as long as it, so on a short page it runs into the footer, drawn over it;
   ours set main's min-height to the nav's foot, which pushed the footer down. The page's length is
   its content's again, the nav over the footer where it is longer.
   Run: node --max-old-space-size=256 --test test/subpage-nav-482.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync(new URL('../blocks/subpage-nav/subpage-nav.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../blocks/subpage-nav/subpage-nav.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('the nav no longer sets the page\'s minimum height', () => {
  assert.ok(!/minHeight|min-height/.test(js), 'no min-height on main');
});

test('from 768 px the nav\'s section is drawn over what follows (the footer), as www\'s', () => {
  const wide = css.slice(css.indexOf('@media (width >= 768px)'));
  assert.match(wide, /main > \.section\.subpage-nav-container \{ position: absolute; top: var\(--subpage-nav-top, 0\); right: 0; left: 0; z-index: 1;/);
});
