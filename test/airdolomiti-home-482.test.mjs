/* Air Dolomiti's homepage blocks as www draws them now (brief 482, from ema-adobe 477; the
   capture airdolomiti-parity-001 at 1440 and 390, it, en and de): www kept its blocks and data
   and changed the drawing, so the theme changes the blocks, not the document.
   - The two-up cards (gridtwocolumns: cards-teaser without an option; eSIM and Miles & More,
     Leisure and Business) are www's CardDefault picture tiles: 330 px high (a 90vw square below
     530 px), the picture under a dark veil, the title and line in a light marble box at the top,
     a white button at the bottom.
   - The download row (gridtwocolumnsdownloadpdf: a picture card and a text-only one) is www's
     GridTwoColumnsDownload: the picture tile beside a marble box (its text's width, at most
     300 px, 400 px from 1230 px), its title centred and bold over a teal download button; the
     box is gone below 530 px.
   - The Lufthansa Group strip (cardfullwidth: hero-card-overlay without an option, an h2 card,
     in a section of its own) is www's CardFullWidth: a marble text box beside its picture,
     500 px high from 930 px; above it below 930 px. The articles' stage (the same block, in the
     h1's section) is not it.
   Run: node --max-old-space-size=256 --test test/airdolomiti-home-482.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// every declaration block of the selector (in any media query)
const rules = (sel) => (css.match(new RegExp(`(?:^|[}{,] ?)${esc(sel)} \\{[^}]*\\}`, 'g')) || []).join(' ');
// every @media block with the query, joined (walked by braces)
const media = (q) => {
  const out = [];
  for (let i = css.indexOf(`@media ${q} {`); i >= 0; i = css.indexOf(`@media ${q} {`, i + 1)) {
    let depth = 0;
    let k = css.indexOf('{', i);
    const start = k;
    for (; k < css.length; k += 1) {
      if (css[k] === '{') depth += 1;
      else if (css[k] === '}') { depth -= 1; if (!depth) break; }
    }
    out.push(css.slice(start + 1, k));
  }
  return out.join(' ');
};

const G = 'body.brand-airdolomiti .cards-teaser:not(.three-up) > ul';
const TILE = `${G} > li:has(> .cards-teaser-image)`;
const BOX = `${G} > li.cards-teaser-text-only`;
const S = 'body.brand-airdolomiti main > .section.hero-card-overlay-container:not(:has(h1, .article-header)) .hero-card-overlay:not(.destination):has(> .hero-card-overlay-card > h2:first-child)';

test('the two-up cards are picture tiles: the picture fills the tile under a veil', () => {
  assert.match(rules(TILE), /position: relative;[^}]*overflow: hidden;[^}]*height: 90vw;[^}]*border-radius: 10px;[^}]*color: #fff;/);
  assert.match(rules(`${TILE} > .cards-teaser-image`), /position: absolute; inset: 0;[^}]*margin: 0;/);
  assert.match(rules(`${TILE} > .cards-teaser-image img`), /height: 100%;[^}]*object-fit: cover;/);
  assert.match(rules(`${TILE} > .cards-teaser-image picture`), /height: 100%;/);
  assert.match(rules(`${TILE} > .cards-teaser-body`), /background-image: linear-gradient\(rgb\(0 0 0 \/ 50%\), rgb\(0 0 0 \/ 50%\)\);[^}]*padding: 20px 12px 28px;/);
  assert.match(media('(width >= 530px)'), /> li:has\(> \.cards-teaser-image\) \{ height: 330px; \}/);
  assert.match(media('(width >= 930px)'), /> li:has\(> \.cards-teaser-image\) > \.cards-teaser-body \{ background-image: linear-gradient\(rgb\(0 0 0 \/ 10%\), rgb\(0 0 0 \/ 10%\)\); padding: 24px; \}/);
});

test('the title and line sit in one marble box at the top, the button at the bottom', () => {
  assert.match(rules(`${TILE} > .cards-teaser-body`), /display: grid;[^}]*grid-template-rows: auto auto 1fr;[^}]*grid-template-columns: fit-content\(100%\);/);
  assert.match(rules(`${TILE} > .cards-teaser-body::before`), /grid-area: 1 \/ 1 \/ 3 \/ 2;[^}]*border-radius: 10px;[^}]*background-color: rgb\(245 241 238 \/ 60%\);/);
  assert.match(rules(`${TILE} .cards-teaser-title`), /grid-area: 1 \/ 1;[^}]*color: #002e54;[^}]*font-size: 26px;[^}]*line-height: 34px;/);
  assert.match(rules(`${TILE} .cards-teaser-body > p:not(.cards-teaser-cta)`), /grid-area: 2 \/ 1;[^}]*padding: 8px 10px 10px;[^}]*font-size: 16px;[^}]*line-height: 22px;/);
  assert.match(rules(`${TILE} .cards-teaser-cta`), /grid-area: 3 \/ 1;[^}]*place-self: end start;/);
  assert.match(media('(width >= 930px)'), /> li:has\(> \.cards-teaser-image\) \.cards-teaser-title \{ font-size: 30px; line-height: 38px; \}/);
});

test('the tiles\' button is www\'s white one with its teal arrow', () => {
  const b = rules(`${TILE} .cards-teaser-cta-link:any-link`);
  assert.match(b, /display: inline-flex;[^}]*gap: 16px;[^}]*border-radius: 10px;[^}]*background-color: #fff;[^}]*padding: 18px 40px;[^}]*color: #00798a;[^}]*font-weight: 500;/);
  assert.match(rules(`${TILE} .cards-teaser-cta-link::before`), /display: none;/);
  assert.match(rules(`${TILE} .cards-teaser-cta-link::after`), /width: 28px; height: 28px;[^}]*M26\.73 13\.33H13\.53L2 0h13\.2zM2 28h13\.2l11\.53-13\.33H13\.53z/);
});

test('two tiles a row from 530 px, 20 px apart; one a row below', () => {
  assert.match(rules(G), /gap: 20px;/);
  assert.match(rules(`${G} > li + li`), /margin-top: 0;/);
  assert.match(media('(width >= 530px)'), new RegExp(`${esc(G)} \\{ grid-template-columns: repeat\\(2, minmax\\(0, 1fr\\)\\); \\}`));
});

test('the download row: the picture tile beside the marble box, the box gone on phones', () => {
  const row = `${G}:has(> li.cards-teaser-text-only)`;
  assert.match(rules(BOX), /display: none;/);
  const m = media('(width >= 530px)');
  assert.match(m, new RegExp(`${esc(row)} \\{ display: flex; height: 500px; \\}`));
  assert.match(m, new RegExp(`${esc(row)} > li:has\\(> \\.cards-teaser-image\\) \\{ flex: 1 1 0; height: auto; \\}`));
  assert.match(m, new RegExp(`${esc(BOX)} \\{ display: flex;[^}]*flex: 0 0 auto; width: max-content; max-width: 300px;[^}]*justify-content: space-between;[^}]*border-radius: 10px;[^}]*background-color: rgb\\(246 242 239 / 80%\\);[^}]*padding: 40px 24px 60px;[^}]*text-align: center;`));
  assert.match(media('(width >= 1230px)'), new RegExp(`${esc(BOX)} \\{ max-width: 400px; padding: 60px; \\}`));
  assert.match(rules(`${BOX} .cards-teaser-title`), /font-weight: 700;/);
  assert.match(rules(`${BOX} .cards-teaser-cta-link:any-link`), /background-color: #00798a;[^}]*color: #fff;/);
});

test('the download row\'s picture tile: its title in the brighter box, a white outline button', () => {
  const t = `${G}:has(> li.cards-teaser-text-only) > li:has(> .cards-teaser-image)`;
  assert.match(rules(`${t} > .cards-teaser-body::before`), /background-color: rgb\(246 242 239 \/ 80%\);/);
  assert.match(rules(`${t} .cards-teaser-cta-link:any-link`), /border: 1px solid #fff;[^}]*background-color: transparent;[^}]*padding: 20px 30px;[^}]*color: #fff;[^}]*font-weight: 700;/);
});

test('the Lufthansa Group strip: a marble box beside its picture from 930 px, above it below', () => {
  assert.match(rules(S), /flex-direction: column-reverse;[^}]*width: 90vw;[^}]*margin: 0 auto 70px;[^}]*aspect-ratio: auto;/);
  assert.match(rules(`${S} .hero-card-overlay-card`), /min-height: 250px;[^}]*padding: 60px 25px;[^}]*background-color: #f5f1ee;[^}]*color: #002e54;/);
  assert.match(rules(`${S} .hero-card-overlay-media`), /position: relative;[^}]*height: 250px;[^}]*aspect-ratio: auto;[^}]*border-radius: 0 0 10px 10px;/);
  assert.match(rules(`${S} .hero-card-overlay-card h2`), /color: #002e54;[^}]*font-size: 23.76px;[^}]*font-weight: 600;[^}]*line-height: 30px;/);
  const m = media('(width >= 930px)');
  assert.match(m, new RegExp(`${esc(S)} \\{ flex-direction: row-reverse;[^}]*width: min\\(95vw, 1440px\\);[^}]*height: 500px;[^}]*margin-bottom: 100px;`));
  assert.match(m, new RegExp(`${esc(S)} \\.hero-card-overlay-card \\{ width: 50%;[^}]*padding: 50px;`));
  assert.match(m, new RegExp(`${esc(S)} \\.hero-card-overlay-media \\{ width: 50%; height: 100%; border-radius: 0 10px 10px 0; \\}`));
  assert.match(m, new RegExp(`${esc(S)} \\.hero-card-overlay-card h2 \\{ font-size: 37.8px; line-height: 40px; \\}`));
});

test('the strip\'s button is the white one, 240 px, 33 px under the text', () => {
  const b = rules(`${S} .hero-card-overlay-cta a.button`);
  assert.match(b, /display: inline-flex;[^}]*border-radius: 10px;[^}]*background-color: #fff;[^}]*padding: 18px 40px;[^}]*color: #00798a;/);
  assert.match(media('(width >= 930px)'), new RegExp(`${esc(S)} \\.hero-card-overlay-cta \\{ margin-top: 33px; \\}`));
  assert.match(media('(width >= 930px)'), new RegExp(`${esc(S)} \\.hero-card-overlay-cta a\\.button \\{ width: 240px; \\}`));
});

test('the gaps: the grids 20 px from their heading, each other and the strip; 80 px (84 px) after the download row', () => {
  const W = 'body.brand-airdolomiti main .default-content-wrapper:has(+ .cards-teaser-wrapper > .cards-teaser:not(.three-up))';
  assert.match(rules(`${W} > h2:last-child`), /margin-bottom: 20px;/);
  assert.match(rules('body.brand-airdolomiti main .cards-teaser-wrapper + .cards-teaser-wrapper > .cards-teaser:not(.three-up)'), /margin-top: 0;/);
  assert.match(rules('body.brand-airdolomiti main .cards-teaser-wrapper:has(> .cards-teaser:not(.three-up)) + .cards-teaser-wrapper:has(> .cards-teaser:not(.three-up))'), /margin-top: 20px;/);
  assert.match(rules('body.brand-airdolomiti main .cards-teaser-wrapper:has(> .cards-teaser:not(.three-up) > ul > li.cards-teaser-text-only):not(:last-child)'), /margin-bottom: 80px;/);
  assert.match(media('(width >= 930px)'), /li\.cards-teaser-text-only\):not\(:last-child\) \{ margin-bottom: 84px; \}/);
  assert.match(rules('body.brand-airdolomiti main > .section:has(> .cards-teaser-wrapper:last-child > .cards-teaser:not(.three-up)):has(+ .section.hero-card-overlay-container)'), /margin-bottom: 20px;/);
});

test('the strip\'s text: the line 35 px (36 px) under the title, the button box 77 px', () => {
  assert.match(rules(`${S} .hero-card-overlay-card h2`), /margin: 0;/);
  assert.match(rules(`${S} .hero-card-overlay-card > p:not(.hero-card-overlay-cta)`), /margin: 35px 0 0;/);
  assert.match(media('(width >= 930px)'), new RegExp(`${esc(S)} \\.hero-card-overlay-card > p:not\\(\\.hero-card-overlay-cta\\) \\{ margin-top: 36px;`));
  assert.match(rules(`${S} .hero-card-overlay-cta`), /padding-bottom: 13px;/);
});

test('the offers: 250 px cards 2.5vw apart on phones, three to the row 36 px apart from 1025 px', () => {
  const T = 'body.brand-airdolomiti .carousel-cards.promo .carousel-cards-track';
  assert.match(rules(T), /gap: 2\.5vw;/);
  assert.match(rules('body.brand-airdolomiti .carousel-cards.promo .carousel-cards-slide'), /flex-basis: 250px;/);
  const m = media('(width >= 1025px)');
  assert.match(m, new RegExp(`${esc(T)} \\{ gap: 36px; \\}`));
  assert.match(m, /\.carousel-cards\.promo \.carousel-cards-slide \{ flex-direction: row; flex-basis: calc\(\(100% - 72px\) \/ 3\);/);
  const U = 'body.brand-airdolomiti main > .section:has(.carousel-cards.promo) > .cards-teaser-wrapper:has(> .cards-teaser:not(.three-up))';
  assert.match(rules(U), /margin-top: 113px;/);
  assert.match(m, new RegExp(`${esc(U)} \\{ margin-top: 92px; \\}`));
});

test('the offers\' heading 20 px above the cards, 34 px from 1025 px', () => {
  const H = 'body.brand-airdolomiti main .default-content-wrapper:has(+ .carousel-cards-wrapper > .carousel-cards.promo) > h2:last-child';
  assert.match(rules(H), /margin-bottom: 15px;/);
  assert.match(media('(width >= 1025px)'), new RegExp(`${esc(H)} \\{ margin-bottom: 29px; \\}`));
});

test('the download row\'s picture keeps the 50% veil from 930 px', () => {
  const D = `${G}:has(> li.cards-teaser-text-only) > li:has(> .cards-teaser-image) > .cards-teaser-body`;
  assert.match(media('(width >= 930px)'), new RegExp(`${esc(D)} \\{ background-image: linear-gradient\\(rgb\\(0 0 0 / 50%\\), rgb\\(0 0 0 / 50%\\)\\); \\}`));
});
