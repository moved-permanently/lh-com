/* The header's menu flyout out of the Tab order while it closes (blocks/header/header.js
   buildFlyout, every brand): it was hidden only after its 0.8 s slide-out, so a Tab right after
   Escape or the close button landed on its close button and items, off-screen (WCAG 2.4.3, 2.4.7;
   brief 378 A2, seen on Brussels and Lufthansa). The flyout is inert from the moment it starts
   closing and not inert when it opens; its hidden attribute after the transition as before.
   Run: node --max-old-space-size=512 --test test/header-flyout-inert.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync('blocks/header/header.js', 'utf8');
const body = (name) => {
  const start = js.indexOf(`const ${name} = `);
  assert.ok(start > 0, `${name} found`);
  return js.slice(start, js.indexOf('\n  };\n', start));
};

test('closing: inert at once, before the slide-out; hidden after it as before', () => {
  const close = body('closeFlyout');
  const inert = close.indexOf('flyout.inert = true;');
  assert.ok(inert > 0, 'inert set');
  assert.ok(inert < close.indexOf('closeTimer = window.setTimeout'), 'before the timer');
  assert.match(close, /flyout\.hidden = true;/);
});

test('opening: not inert', () => {
  const open = body('openFlyout');
  const inert = open.indexOf('flyout.inert = false;');
  assert.ok(inert > 0, 'inert lifted');
  assert.ok(inert < open.indexOf('first.focus('), 'before the focus moves in');
});
