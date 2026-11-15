/* eslint-disable max-len */
/* Standing order 26 (2026-11-14), item 4: /de/en/first-class. www's author quote "In Lufthansa First Class, a world
   awaits you..." sits alone in its AEM section (.mb-default) before a stage; its .author-quote margin, the section's
   .mb-default and the quote's empty subline put 99 / 122 px between the quote's last line and the stage at 390 / 1440,
   ours 67 / 88. A lufthansa.com author quote alone in its section before a stage section has 92px under it (112px from
   768px) instead of the quotes' 60 / 80. Census (published copies): the fifteen first-class documents. Gate (injected,
   then working-copy code against lh-parity-002a): first-class 25.9 / 20.2 -> 22.2 / 15.0 % at 390 / 1440.
   Run: node --test test/quote-before-stage-so26.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');
const SEL = 'body.brand-lufthansa main > .section:not(.campaign-section):has(+ .section.stage) > .default-content-wrapper:only-child > blockquote:only-child';

test('a quote alone in its section before a stage: 92px under it, 112px from 768px', () => {
  const first = css.indexOf(`${SEL} {`);
  assert.ok(first > 0, 'the rule');
  assert.match(css.slice(first, css.indexOf('}', first)), /margin-bottom: 92px;/);
  const second = css.indexOf(`${SEL} {`, first + 1);
  assert.ok(second > first, 'the wide rule');
  const media = css.slice(css.lastIndexOf('@media', second), css.indexOf('{', css.lastIndexOf('@media', second))).trim();
  assert.equal(media, '@media (width >= 768px)');
  assert.match(css.slice(second, css.indexOf('}', second)), /margin-bottom: 112px;/);
});

test('the quotes outside articles as before: 60px, 80px from 768px', () => {
  assert.match(css, /main:not\(:has\(\.article-header\)\) \.default-content-wrapper > blockquote \{\n {2}box-sizing: border-box;\n {2}max-width: 622px;\n {2}margin: 60px 0;/);
  assert.match(css, /@media \(width >= 768px\) \{\n {2}main:not\(:has\(\.article-header\)\) \.default-content-wrapper > blockquote \{\n {4}margin-top: 80px;\n {4}margin-bottom: 80px;/);
});

// the wide picture after a desktop spacer (first-class at 1440)
test('from 768px a picture after a desktop spacer: 28px above, 62px under it', () => {
  const sel = 'body.brand-lufthansa main .default-content-wrapper > p.spacer.from-768 + p:has(> picture):not(:last-child)';
  const at = css.indexOf(`${sel} {`);
  assert.ok(at > 0, 'the rule');
  const media = css.slice(css.lastIndexOf('@media', at), css.indexOf('{', css.lastIndexOf('@media', at))).trim();
  assert.equal(media, '@media (width >= 768px)');
  const body = css.slice(at, css.indexOf('}', at));
  assert.match(body, /margin-top: 28px;/);
  assert.match(body, /margin-bottom: 62px;/);
});
