/* eslint-disable max-len */
/* SWISS's sidebar pages as www draws them (brief 432, swiss-parity-002 of 2026-11-06, ch/en
   Premium Economy and the other sidebar pages at 390, 768, 1024, 1025, 1280 and 1440; the rows:
   tools/reports/swiss/parity.md). In SWISS's theme only (styles/themes/swiss.css): the content
   two thirds beside the aside (www's sidebar-content col-md-8, the aside col-md-4 with 40 px
   padding-left, from 768 px; lh-com's section-aside 3 / 4 and a 20 px gap); the text's h3 and h4
   www's heading-copytext-large; a link alone in its paragraph www's maui-navigation-link (variant
   hyper, size medium, warm grey with its triangle); the aside's teaser cards (cards-teaser rows from
   tools/importer/swiss-sidebar.mjs) framed as www's a.teaser.card.
   Run: node --max-old-space-size=512 --test test/swiss-sidebar-look.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\s+/g, ' ');
const swiss = () => read('styles/themes/swiss.css');
// assert.match prints the whole stylesheet on a miss: the pattern only
const has = (css, re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

test('the sidebar: the content two thirds, the aside a third with 40 px in, no gap, from 768 px', () => {
  const css = swiss();
  has(css, /@media \(width >= 768px\) \{ body\.brand-swiss main > \.section\.with-aside \{ grid-template-columns: minmax\(0, 2fr\) minmax\(0, 1fr\); column-gap: 0; \} body\.brand-swiss main > \.section\.with-aside > \.section-aside \{ padding-left: 40px; \} \}/);
});

test('the text\'s h3 and h4: 16 / 17.6 px bold, 18 / 19.8 px from 1025 px, 20 px to the text', () => {
  const css = swiss();
  has(css, /body\.brand-swiss main :is\(\.default-content-wrapper, \.columns-media-text\) > :is\(h3, h4\):not\(\[class\*="heading-"\]\), body\.brand-swiss main :is\(\.default-content-wrapper, \.columns-media-text\) > :is\(h3, h4, h5, h6\)\.heading-copytext-large \{ margin-bottom: 20px; font-size: 16px; \}/);
  has(css, /@media \(width >= 1025px\) \{ body\.brand-swiss main :is\(\.default-content-wrapper, \.columns-media-text\) > :is\(h3, h4\):not\(\[class\*="heading-"\]\), body\.brand-swiss main :is\(\.default-content-wrapper, \.columns-media-text\) > :is\(h3, h4, h5, h6\)\.heading-copytext-large \{ font-size: 18px; \} \}/);
});

test('a link alone in its paragraph: warm grey 16 / 22 px regular, the triangle 16 px wide and 5 px to the text; up-right off-site, down in-page', () => {
  const css = swiss();
  const link = 'body\\.brand-swiss main :is\\(\\.default-content-wrapper, \\.columns-media-text\\) p\\.link-wrapper a:any-link';
  const cta = 'body\\.brand-swiss main \\.section-aside \\.cards-teaser \\.cards-teaser-cta-link:any-link';
  has(css, new RegExp(`${link}, ${cta} \\{ display: inline-flex; align-items: flex-start; gap: 5px; color: #6f6660; font-size: 16px; font-weight: 400; line-height: 22px; vertical-align: top; \\}`), 'on the line\'s top: the paragraph 22 px (the box\'s baseline made it 27)');
  has(css, /body\.brand-swiss main :is\(\.default-content-wrapper, \.columns-media-text\) p\.link-wrapper \{ line-height: 22px; \}/);
  has(css, new RegExp(`${link}:hover, ${cta}:hover \\{ color: #554e49; text-decoration: none; \\}`), 'pine grey on hover');
  has(css, new RegExp(`${link}::before, ${cta}::before \\{ content: ""; flex: 0 0 auto; align-self: flex-start; width: 16px; height: 16px; margin-top: 3px; background-color: currentcolor; mask: url\\("[^"]*m10 8-4 4V4z[^"]*"\\) center / contain no-repeat; \\}`), 'www\'s arrow-right: the triangle');
  has(css, new RegExp(`${link}\\[target="_blank"\\]:not\\(\\[href\\*="//www\\.swiss\\.com"\\]\\)::before, ${cta}\\[target="_blank"\\]:not\\(\\[href\\*="//www\\.swiss\\.com"\\], \\.cards-teaser-cta-own\\)::before \\{ mask-image: url\\("[^"]*M13 3v5\\.981h-2V6\\.414L4\\.112 13\\.3[^"]*"\\); \\}`), 'arrow-up-right');
  has(css, new RegExp(`${link}\\[href\\^="#"\\]::before \\{ mask-image: url\\("[^"]*m12 7-4 4-4-4z[^"]*"\\); \\}`), 'arrow-down');
});

test('the aside\'s teaser cards: one column 20 px apart (40 px from 768 px), a 1 px #ccc frame, the body 20 px in, the title 20 / 22 px (24 / 26.4 px from 1025 px), the link under a rule', () => {
  const css = swiss();
  has(css, /body\.brand-swiss main \.section-aside \.cards-teaser > ul \{ grid-template-columns: minmax\(0, 1fr\); gap: 20px; \}/, 'one column at every width (lh-com\'s two from 768 px)');
  has(css, /body\.brand-swiss main \.section-aside \.cards-teaser > ul > li:nth-child\(n\) \{ margin-top: 0; border: 1px solid #ccc; background-color: #fff; \}/);
  has(css, /body\.brand-swiss main \.section-aside \.cards-teaser \.cards-teaser-image \{ margin-bottom: 0; \}/);
  has(css, /body\.brand-swiss main \.section-aside \.cards-teaser \.cards-teaser-body \{ padding: 20px 20px 40px; \}/);
  has(css, /body\.brand-swiss main \.section-aside \.cards-teaser \.cards-teaser-body:has\(> \.cards-teaser-cta\) \{ padding-bottom: 10px; \}/);
  has(css, /body\.brand-swiss main \.section-aside \.cards-teaser \.cards-teaser-body > \* \{ margin: 0; \}/);
  has(css, /body\.brand-swiss main \.section-aside \.cards-teaser \.cards-teaser-body > \.cards-teaser-title \{ margin-bottom: 15px; color: #101010; font-size: 20px; font-weight: 700; line-height: 1\.1; letter-spacing: 0\.3px; \}/);
  has(css, /body\.brand-swiss main \.section-aside \.cards-teaser \.cards-teaser-title a:any-link \{ color: inherit; \}/, 'a card without a link line keeps the link on its title: black as www\'s title');
  has(css, /body\.brand-swiss main \.section-aside \.cards-teaser \.cards-teaser-body > \.cards-teaser-cta \{ margin-top: 40px; padding-top: 10px; border-top: 1px solid #ccc; line-height: 22px; \}/);
  has(css, /@media \(width >= 768px\) \{ body\.brand-swiss main \.section-aside \.cards-teaser > ul \{ gap: 40px; \} \}/);
  has(css, /@media \(width >= 1025px\) \{ body\.brand-swiss main \.section-aside \.cards-teaser \.cards-teaser-body > \.cards-teaser-title \{ font-size: 24px; \} \}/);
});

/* brief 437: the aside's link lists ("More about Miles & More", "Quick links": www's ul of
   maui-navigation-link, no bullets, each item 27 px, warm grey 16 / 22 regular with the link's icon,
   up-right off-site), not lh-com's red bold links with the small arrow */
test('the aside\'s link lists: no bullets, 27 px items, the links as the standalone ones', () => {
  const css = swiss();
  const list = 'body\\.brand-swiss main \\.section-aside \\.default-content-wrapper :is\\(ul, ol\\)';
  has(css, new RegExp(`${list} \\{ padding-left: 0; list-style: none; \\}`));
  has(css, new RegExp(`${list} > li \\{ margin: 0; padding: 0 0 5px; \\}`));
  has(css, new RegExp(`${list} > li > a:any-link, body\\.brand-swiss main :is\\(\\.default-content-wrapper, \\.columns-media-text\\) p\\.link-wrapper a:any-link, `), 'the standalone link\'s look');
  has(css, new RegExp(`${list} > li > a:any-link\\[href\\^="http"\\]:not\\(\\[href\\*="//www\\.swiss\\.com"\\]\\)::before, `), 'up-right off-site');
});
