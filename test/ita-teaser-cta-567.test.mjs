/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA's teaser cards keep their link line (the standing order of 2026-11-10, item 6; ITA row 29, ita-parity-004:
   /it/en/manage-my-bookings/extra-services/travel-insurance, "Related"). www's .teaser .teaser-link-text is display:block
   ("→ Learn More About Choosing Your Seat", 16 px bold at the card's foot); lh-com's carousel-cards parser leaves it out
   unless the card is marked data-import-cta (as Austrian's import does), so ITA's cards had no link line.
   tools/importer/ita-import.mjs withTeaserCta marks them; mappedOf applies it.
   Run: node --max-old-space-size=512 --test test/ita-teaser-cta-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { withTeaserCta, mappedOf } = await import('../tools/importer/ita-import.mjs');

const card = (n) => `<div class="teaser event section"><a href="https://www.ita-airways.com/it/en/x${n}" class="teaser card " data-identifier-track="teaser_click_x${n}" data-qm-allow="true"><div class="card-content"><h3 class="heading-copytext-large teaser-heading">Card ${n}</h3><div class="teaser-description "><p class="desc-inline">Text ${n}</p></div></div><div class="teaser-link-text"><span class="btn-link mb-0"><span>Learn more ${n}</span></span></div></a></div>`;

test('every teaser card is marked data-import-cta, once', () => {
  const out = withTeaserCta(card(1) + card(2));
  assert.equal(out.split('data-import-cta=""').length - 1, 2);
  assert.equal(withTeaserCta(out), out, 'a marked card stays as it is');
  assert.match(out, /<a href="[^"]+" class="teaser card " data-import-cta=""/);
});

test('other links and teasers stay as they are', () => {
  const other = '<a class="teaser-link" href="/y">Y</a><a href="/z" class="teaser partner">Z</a>';
  assert.equal(withTeaserCta(other), other);
});

test('the snapshot as the import reads it has the marks', () => {
  const html = `<html><head></head><body>${card(1)}</body></html>`;
  assert.match(mappedOf(html, '/it/en/x'), /class="teaser card " data-import-cta=""/);
});

test('the info import\'s carousel-cards parser reads the mark (the link line after the description)', () => {
  const bundle = fs.readFileSync(new URL('../tools/importer/import-info.bundle.js', import.meta.url), 'utf8');
  assert.match(bundle, /card\.hasAttribute\("data-import-cta"\) && visibleText\(card\.querySelector\("\.teaser-link-text"\)\)/);
});
