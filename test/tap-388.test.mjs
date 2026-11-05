/* eslint-disable max-len */
/* Brief 388, TAP (tools/reports/tap/parity.md), hand baggage at 390 (161 px short of www after
   2620d755) and 1440 kept:
   - the text cards (row 31's cards-teaser cards with text; not one-up, row 98's): www's rich text
     without gaps between its paragraphs, 24 px to the button row, 48 px under the text of a card
     without a button (www's empty button row, pb-6); www's empty paragraphs (24 px lines) stay
     out: the pipeline drops an empty paragraph, a word joiner's alone too;
   - the feature card's text (round 3's FeatureCard): its list items without gaps, 40 px from the
     list to the button, 24 px under the text column (www's pb-6);
   - www's heading component (a heading and its description, one paragraph; hand baggage's
     "Bagagem especial de cabina"): the description 16 px under an H2 (an H1's already), and from
     728 px 32 px to the next component (www's box 32 px shorter than its content, as a heading on
     its own, 2620d755), in a section or at its end;
   - an inner slider opening its own section (a market's: the partners page): from 728 px www's
     rounded frame around its swiper, 32 px above and below (as row 68's after the breadcrumb);
   - the two-level picker (row 65, the FAQ and partners pages): the category's title 28 / 33.6 as
     www's at every width; on phones 24 px from it to the select and 24 px from the select to the
     first question (the questions' card under the select);
   Run: node --max-old-space-size=512 --test test/tap-388.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const card = 'body\\.brand-tap \\.cards-teaser:not\\(\\.one-up\\) li:has\\(> \\.cards-teaser-body > p:not\\(\\.cards-teaser-cta\\)\\)';
const fc = 'body\\.brand-tap \\.columns-media:not\\(\\.stack\\):has\\(\\.columns-media-text > h3:first-child\\)';

test('the text cards as www\'s: no gap between paragraphs, 24 px to the button, 48 px under the text without one', () => {
  assert.match(css, new RegExp(`${card} \\.cards-teaser-body > p:not\\(\\.cards-teaser-cta\\) \\{\\s*margin-bottom: 0;\\s*\\}`));
  assert.match(css, new RegExp(`${card} \\.cards-teaser-cta \\{\\s*padding-top: 24px;\\s*\\}`));
  assert.match(css, new RegExp(`${card}:not\\(:has\\(\\.cards-teaser-cta\\)\\) \\.cards-teaser-body \\{\\s*padding-bottom: 48px;\\s*\\}`));
  // row 98's one-up cards keep theirs (40 px under the text)
  assert.match(css, /body\.brand-tap \.cards-teaser\.one-up li:has\(> \.cards-teaser-body > p:not\(\.cards-teaser-cta\)\) \.cards-teaser-body \{\s*padding-bottom: 40px;/);
});

test('the feature card\'s text as www\'s: list items without gaps, 40 px from the list to the button, 24 px under the column', () => {
  assert.match(css, new RegExp(`${fc} \\.columns-media-text li \\{\\s*margin-bottom: 0;\\s*\\}`));
  assert.match(css, new RegExp(`${fc} \\.columns-media-text > ul \\+ \\.button-wrapper \\{\\s*padding-top: 16px;\\s*\\}`));
  assert.match(css, new RegExp(`${fc} \\.columns-media-text \\{\\s*margin-bottom: 0;\\s*padding-bottom: 24px;\\s*\\}`));
});

test('www\'s heading component: the description 16 px under an H2, 32 px to the next component from 728 px', () => {
  const inner = 'body\\.brand-tap :where\\(header:not\\(\\.tap-home\\)\\) ~ main';
  assert.match(css, new RegExp(`${inner} \\.default-content-wrapper > h2:first-child:has\\(\\+ p:last-child\\) \\{\\s*margin-bottom: 16px;\\s*\\}`));
  const md = css.slice(css.indexOf('/* www\'s heading component (a heading and its description'));
  assert.match(md, new RegExp(`${inner} > \\.section > \\.default-content-wrapper:has\\(> :is\\(h1, h2\\):first-child \\+ p:last-child\\) \\+ div \\{\\s*margin-top: 32px;\\s*\\}`));
  assert.match(md, new RegExp(`${inner} > \\.section:has\\(> \\.default-content-wrapper:last-child > :is\\(h1, h2\\):first-child \\+ p:last-child\\) \\{\\s*margin-bottom: 32px;\\s*\\}`));
});

test('an inner slider opening its own section: www\'s frame, 32 px above and below from 728 px', () => {
  const md = css.slice(css.indexOf('/* an inner slider opening its own section'));
  assert.match(md, /body\.brand-tap :where\(header:not\(\.tap-home\)\) ~ main > \.section > \.hero-campaign-wrapper:first-child:has\(> \.hero-campaign\.slider\.narrow\) \{\s*padding-block: 32px;\s*\}/);
});

test('the picker\'s category title 28 / 33.6 as www\'s; on phones 24 px to the select and from it to the first question', () => {
  assert.match(css, /body\.brand-tap main \.faq-picker-category > \.default-content-wrapper > h2 \{\s*margin-top: 64px;\s*font-size: calc\(28px \* var\(--a11y-scale, 1\)\);\s*line-height: 1\.2;\s*text-align: center;\s*\}/);
  const phone = css.slice(css.indexOf('@media (width < 1024px) {\n  /* the picker on phones'));
  assert.ok(phone.length < css.length, 'the phones block');
  assert.match(phone, /body\.brand-tap main \.faq-picker-category > \.default-content-wrapper > h2 \{\s*margin-bottom: 24px;\s*\}/);
  assert.match(phone, /body\.brand-tap \.faq-picker-body \{\s*margin-top: 0;\s*\}/);
  assert.match(phone, /body\.brand-tap \.faq-picker-questions \{\s*margin-top: 0;\s*\}/);
});
