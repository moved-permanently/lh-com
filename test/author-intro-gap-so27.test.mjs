/* eslint-disable max-len */
/* Standing order 27 (2026-11-15), item 3: the Insights author pages. From 768px www has 96px from the bio's last line
   to the divider before "All articles from ..." (/de/en/articles/authors/florian-tomberg at 1440), ours 72. The
   lufthansa.com author section has 36px padding under it from 768px (12px before). Census (published copies): the 20
   author documents. Gate (injected, then working-copy code, against lh-parity): florian-tomberg 13.5 -> 11.3 % at 1440,
   390 the same (the 24px there made it worse, 7.8 -> 8.8).
   Run: node --test test/author-intro-gap-so27.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');

test('from 768px 36px under the author intro; 12px below 768px as before', () => {
  const sel = 'body.brand-lufthansa main > .section.author';
  const at = css.indexOf(`${sel} {`);
  assert.ok(at > 0, 'the rule');
  const media = css.slice(css.lastIndexOf('@media', at), css.indexOf('{', css.lastIndexOf('@media', at))).trim();
  assert.equal(media, '@media (width >= 768px)');
  assert.match(css.slice(at, css.indexOf('}', at)), /padding-bottom: 36px;/);
  assert.match(css, /main > \.section\.author \{\n {2}padding: 12px 0;\n\}/);
});
