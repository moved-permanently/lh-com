/* eslint-disable max-len */
/* lufthansa.com styles, brief 539 item 4 (lh-parity-004a, /de/de/lufthansa-reiseklassen at 390): the rule for a page
   that ends with a section of separators only right after a grey band (brief 521: the section takes the band's gap back,
   margin-top -48px) also matched a last section with no default content at all, a block only (the travel classes'
   card carousel): `:not(:has(> .default-content-wrapper > :not(p.spacer)))` is true without any wrapper. The cards sat
   4 px under the band, www's 50. A last section with a card carousel now keeps its gap; the last
   sub-page navigation of the info pages (upgrade-first-class, upgrade-to-business-class) stays as it was (measured:
   narrowing the rule to separators only made upgrade-first-class worse at 390, 5.4 -> 8.6 %).
   Run: node --max-old-space-size=256 --test test/grey-last-block-section-539.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const OLD = 'body.brand-lufthansa main > .section.grey + .section:last-child:not(:has(> .default-content-wrapper > :not(p.spacer))) {';
const NEW = 'body.brand-lufthansa main > .section.grey + .section:last-child:not(:has(> .carousel-cards-wrapper), :has(> .default-content-wrapper > :not(p.spacer))) {';

test('the separators-only last section after a grey band: not a last section with a card carousel', () => {
  assert.ok(!css.includes(OLD), 'the old selector (any section without text) is gone');
  const i = css.indexOf(NEW);
  assert.ok(i >= 0, 'the rule');
  const body = css.slice(i + NEW.length, css.indexOf('}', i));
  assert.match(body, /margin-top: -48px;/);
  assert.match(body, /margin-bottom: 0;/);
});

test('no :has() nested in another :has() (a browser drops such a rule)', () => {
  assert.ok(!/:has\([^()]*:has\(/.test(NEW));
});
