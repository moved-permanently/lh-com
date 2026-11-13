/* Standing order 19 (2026-11-13), item 3: a page that ends with a grey band and an empty last section (a document's
   empty trailing div). The rule for a last section of separators only after a grey band (brief 521: it takes the band's
   48px back) matched the empty section too, so the band touched the footer. On www that is right after a band whose
   AEM section has no .mb-default (style flush: 11 of the 15 recorded documents with that ending); after one with
   .mb-default (grey without flush) www keeps the gap: /de/en/book-and-manage/flights/wetlease-hub 13.4 / 17.4 ->
   10.3 / 14.9 % off www at 1440 / 390. After such a whole grey section an empty last section takes nothing back now;
   after a grey column band or view as before (/de/en/group-travel: www's band touches the footer, 4.9 -> 5.5 with it).
   Run: node --test test/grey-end-empty-section-so19.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');

test('after a whole grey AEM section with .mb-default an empty last section keeps the gaps (not after a grey column band or view)', () => {
  const at = css.indexOf('body.brand-lufthansa main > .section.grey:not(.flush, .column-band, .column-view) + .section:last-child:not(:has(> *), :has(> .default-content-wrapper > :not(p.spacer))) {');
  assert.ok(at > 0, 'the rule');
  const body = css.slice(at, css.indexOf('}', at));
  assert.match(body, /margin-top: 0;/);
  assert.match(body, /margin-bottom: var\(--section-gap\);/);
  // after the separators rule it overrides (its specificity higher, and later)
  assert.ok(at > css.indexOf('body.brand-lufthansa main > .section.grey + .section:last-child:not(:has(> .carousel-cards-wrapper), :has(> .default-content-wrapper > :not(p.spacer))) {'));
});
