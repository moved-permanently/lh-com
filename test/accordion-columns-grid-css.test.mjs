/* The accordion-columns image grid's CSS: a faq accordion keeps its answers at 66% from 1025px
   (www's col-lg-8 text), but an item grid's items fill their columns (www: img.w-100, the item's
   text in its own column), so the 66% rule must not reach into .accordion-columns-grid-item
   (/de/de/handgepaeck, /de/en/carry-on-baggage: 189px images in 286px columns).
   Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/accordion-columns/accordion-columns.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');
const media = css.slice(css.indexOf('@media (width >= 1025px)'));
const ruleAt = (re) => {
  const m = re.exec(media);
  return m ? { index: m.index, body: media.slice(m.index, media.indexOf('}', m.index)) } : null;
};

test('faq answers keep 66%, grid items in a faq panel lift it, after the 66% rule', () => {
  const faq = ruleAt(/\.accordion-columns\.faq:not\(\.limited-width\) \.accordion-columns-panel :is\(p, ul, ol, h2, h3, h4, h5, h6\)\s*\{/);
  assert.ok(faq, 'the faq 66% rule');
  assert.match(faq.body, /max-width: 66%/);
  const grid = ruleAt(/\.accordion-columns\.faq \.accordion-columns-panel \.accordion-columns-grid-item :is\(p, ul, ol, h2, h3, h4, h5, h6\)\s*\{/);
  assert.ok(grid, 'a grid-item rule in the 1025px media block');
  assert.match(grid.body, /max-width: none/);
  assert.ok(grid.index > faq.index, 'same specificity as the 66% rule, so it must come after it');
});
