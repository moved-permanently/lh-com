/* Discover's buttons as www.discover-airlines.com draws them (maui-button / maui-button-link on
   /de/en/homepage, measured 2026-11-01): fully rounded (99999px), 48px high, primary #002554 text
   on sunny yellow, secondary sky blue #1e73af. styles/themes/discover.css sets the button tokens
   styles.css reads (--button-radius, --button-min-height, --button-primary-text,
   --button-secondary-color), as ITA's and Air Dolomiti's themes do; other brands keep theirs.
   Run: node --max-old-space-size=512 --test test/discover-buttons.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const tokens = (key) => {
  const css = fs.readFileSync(new URL(`../styles/themes/${key}.css`, import.meta.url), 'utf8');
  const root = (css.match(/^:root \{([\s\S]*?)^\}/m) || [])[1] || '';
  return Object.fromEntries([...root.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
};

test('Discover: www\'s pill buttons', () => {
  const t = tokens('discover');
  assert.equal(t['--button-radius'], '99999px');
  assert.equal(t['--button-min-height'], '48px');
  assert.equal(t['--button-primary-text'], '#002554');
  assert.equal(t['--button-secondary-color'], '#1e73af');
});

test('the other themes keep their buttons', () => {
  assert.equal(tokens('ita')['--button-radius'], '8px');
  assert.equal(tokens('airdolomiti')['--button-radius'], '10px');
  // Brussels: maui-button sn's 6px (brussels-parity-001, 2026-11-05; brief 378)
  assert.equal(tokens('brussels')['--button-radius'], '6px');
  assert.equal(tokens('austrian')['--button-radius'], undefined);
});
