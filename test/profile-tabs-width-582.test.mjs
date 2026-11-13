/* eslint-disable max-len */
/* Brief 582, rule 6: running text in a Profile Tabs panel is not limited to two thirds again (www's text fills the panel
   beside the sidebar: /de/en/lufthansa-am-flughafen-frankfurt 18.9 -> 14.0 % at 1440).
   Run: node --max-old-space-size=256 --test test/profile-tabs-width-582.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/profile-tabs/profile-tabs.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a Profile Tabs panel\'s limited-width text fills the panel (lufthansa.com)', () => {
  assert.ok(css.includes('body.brand-lufthansa .profile-tabs .profile-tabs-panel :is(p, ul, ol, h2, h3, h4).limited-width { max-width: none; }'));
});
