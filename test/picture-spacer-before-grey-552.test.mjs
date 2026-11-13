/* eslint-disable max-len */
/* lufthansa.com styles, brief 552 (lh-parity-004a, the four lounges roots): a section that ends with a picture and
   www's separator ("{spacer-25}", kept by the hub import since this brief), right before a grey band (the lounge finder).
   www: the picture's 40 px margin and the 26 px separator, then the band (66 px). The separator's own margin takes the
   section gap back (it collapses with the section's 48 px), so the picture, the separator and the band add up to
   www's 66 px instead of 114. lufthansa.com only; one :has() per element (a nested one drops the rule).
   Run: node --max-old-space-size=256 --test test/picture-spacer-before-grey-552.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa main > .section:not(.campaign-section):has(+ .section.grey) > .default-content-wrapper:last-child > p:has(> picture) + p.spacer:last-child';

test('a picture and a separator ending a section before a grey band: the section gap taken back', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i + SEL.length, css.indexOf('}', i)), /margin-bottom: -48px;/);
});

test('no :has() nested in another :has()', () => {
  assert.ok(!/:has\([^()]*:has\(/.test(SEL));
});
