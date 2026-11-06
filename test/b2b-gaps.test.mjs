/* lh-b2b's small gaps against business.lufthansagroup.com (2026-11-02), B2B-only rules: the bar 61
   px below 1025 px and 81 px from 1025 px (blocks/header/header.css), the open menu item's fill
   #e6f2ff (www's menu snapshot), the copy at most 800 px (styles/styles.css); every rule
   under body.brand-b2b, so the other brands keep theirs.
   Run: node --max-old-space-size=512 --test test/b2b-gaps.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
// the rules of a stylesheet that name lh-b2b, with their declarations
const b2bRules = (css) => [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(([, sel, body]) => ({ sel: sel.trim(), body: body.trim() }))
  .filter((r) => r.sel.includes('brand-b2b'));

test('header.css: the bar padding and the open item\'s fill, only under body.brand-b2b', () => {
  const rules = b2bRules(read('blocks/header/header.css'));
  // (then brief 421's phone menu, test/b2b-parity-421.test.mjs)
  assert.deepEqual(rules.slice(0, 3).map((r) => r.body), [
    '--header-bar-padding: 10.5px 24px;',
    '--header-bar-padding: 16px 24px 17px;',
    'background-color: #e6f2ff;',
  ]);
  // (a comma inside :is() doesn't start a selector)
  rules.forEach((r) => r.sel.split(/,(?![^(]*\))/).forEach((s) => assert.ok(s.trim().startsWith('body.brand-b2b '), s)));
  assert.ok(read('blocks/header/header.css').includes('background-color: #e8eef9;'), 'the shared hover fill as before');
});

// since brief 418 every paragraph of the content (www's .b2b-neo p { max-width: 80rem }), not only
// the stage copy; one that holds a picture keeps the column (test/b2b-parity-418.test.mjs)
test('styles.css: the copy at most 800 px, only under body.brand-b2b', () => {
  const rules = b2bRules(read('styles/styles.css'));
  assert.equal(rules.length, 1);
  assert.equal(rules[0].sel, 'body.brand-b2b main p:not(:has(> picture))');
  assert.equal(rules[0].body, 'max-width: 800px;');
});
