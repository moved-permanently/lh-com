/* eslint-disable max-len */
/* Standing order 8 (2026-11-12), item 3: the confirmation pages (contact-form, passenger-receipt, sports baggage, sporting
   firearm, the two animal registrations) and /de/en/refund end with a call to action (a button, or a link alone in its
   paragraph) and www's closing separator ({spacer-55} / {spacer-70}). The separator is the space to the footer; our
   last section added its 48 px section gap on top (contact-form-confirmation: the footer 48 px lower than www's).
   With no gap there (injected on our live host, % off www at 1440 / 390): contact-form-confirmation 10.1 / 10.2 ->
   1.0 / 4.1, passenger-receipt confirmation 10.6 / 10.7 -> 1.8 / 4.2, refund 5.7 / 5.9 -> 1.7 / 3.2, the four
   registration confirmations 8.6-9.7 / 9.5-9.6 -> 1.6-2.1 / 4.0-5.0. A page whose separator follows a block or a
   text paragraph keeps the gap: there the same rule made 18 recorded page-widths worse (forms, accordions, helvetic).
   Run: node --max-old-space-size=256 --test test/page-end-cta-spacer-so8.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa main > .section:not(.grey):is(:last-child, :has(+ .section.subpage-nav-container:last-child), :not(:has(~ .section:not(:empty)))):has(> .default-content-wrapper:last-child > :is(p.button-wrapper, p.link-wrapper) + p.spacer:last-child)';

test('the last section ending with a call to action and a separator: no section gap', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i + SEL.length, css.indexOf('}', i)), /margin-bottom: 0;/);
});

test('only after a button or a lone link, lufthansa.com only', () => {
  assert.ok(!css.includes('> .default-content-wrapper:last-child > p.spacer:last-child) {'), 'no rule for every closing separator');
  assert.ok(SEL.startsWith('body.brand-lufthansa '));
});
