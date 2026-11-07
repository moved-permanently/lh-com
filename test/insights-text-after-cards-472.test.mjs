/* Insights article text after the "This may also be of interest to you" cards (brief 472 sweep):
   www keeps an article's running text at two thirds of the content width (843 px at 1440) all
   the way down, and only that heading lines up with its cards (83.333%, 1053 px). The import puts
   the cards and the text after them into one section, and the old rules gave every text in a
   section with cards the cards' 83.333% (and none of the two thirds): /de/en/articles/
   explore-the-world/a-perfect-day-barcelona-in-one-day ran its last 2,500 px of text 210 px
   wider, so shorter than www's (-108 px, then -196 px at its picture rows).
   Now: the two thirds (and the 83.333% for pictures and captions) in every article section except
   one with another kind of carousel-cards; the 83.333% only for the heading right before the
   article cards. CSS only, no documents.
   Run: node --max-old-space-size=256 --test test/insights-text-after-cards-472.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const ARTICLE = 'main:has(.article-header) > .section:not(.related-articles-container, :has(> .carousel-cards-wrapper > .carousel-cards:not(.article)))';

test('article text: two thirds in sections with the article cards too', () => {
  assert.ok(css.includes(`${ARTICLE} > .default-content-wrapper > :is(p, ul, ol, h2, h3, h4, h5, h6) { box-sizing: border-box; max-width: 66.667%; margin-inline: auto; }`));
});

test('pictures and captions: the article card (83.333%) there as well', () => {
  assert.ok(css.includes(`${ARTICLE} > .default-content-wrapper > p:is(:has(> picture), :has(> a > picture), .caption),`));
});

test('the 83.333% of the cards only for the heading right before them', () => {
  assert.ok(css.includes('main:has(.article-header) > .section > .default-content-wrapper:has(+ .carousel-cards-wrapper > .carousel-cards.article) > :is(h2, h3, h4):last-child { box-sizing: border-box; max-width: 83.333%; margin-inline: auto; }'));
  assert.ok(!css.includes('.section:has(> .carousel-cards-wrapper > .carousel-cards.article) > .default-content-wrapper > *'), 'no longer every text of the section');
});

test('no :has() nested in another :has() (a whole rule would be dropped)', () => {
  const rules = css.split('}').filter((r) => r.includes('.article-header') && r.includes('carousel-cards'));
  rules.forEach((r) => {
    const sel = r.split('{')[0];
    let depth = 0;
    let nested = false;
    for (let i = 0; i < sel.length; i += 1) {
      if (sel.startsWith(':has(', i)) { if (depth > 0) nested = true; depth += 1; i += 4; } else if (sel[i] === '(' && depth > 0) depth += 1;
      else if (sel[i] === ')' && depth > 0) depth -= 1;
    }
    assert.ok(!nested, sel);
  });
});
