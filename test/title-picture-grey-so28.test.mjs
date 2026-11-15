/* eslint-disable max-len */
/* Standing order 28 (2026-11-15), item 4: /de/en/exclusive-charter. The picture right below the page title ends its
   section; a grey band follows. www has the image component's 4rem there, then the band (40px at 1440), ours 82 (the
   picture's 80px for a heading after it). Such a picture before a grey section has 40px under it. Census (published
   copies): the fifteen exclusive-charter documents. Gate (injected, then working-copy code, against lh-parity):
   11.5 / 14.7 -> 4.9 / 8.7 % at 1440 / 390.
   Run: node --test test/title-picture-grey-so28.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');

test('40px under the title picture that ends its section before a grey band; 60 / 80px otherwise', () => {
  const sel = 'body.brand-lufthansa main > .section:has(+ .section.grey) > .default-content-wrapper > h1 + p:has(> picture):last-child';
  const at = css.indexOf(`${sel} {`);
  assert.ok(at > 0, 'the rule');
  assert.match(css.slice(at, css.indexOf('}', at)), /margin-bottom: 40px;/);
  assert.match(css, /main \.default-content-wrapper > h1 \+ p:has\(> picture\):last-child \{\n {2}margin-bottom: 60px;/);
  assert.match(css, /main \.default-content-wrapper > h1 \+ p:has\(> picture\):last-child \{\n {4}margin-bottom: 80px;/);
});
