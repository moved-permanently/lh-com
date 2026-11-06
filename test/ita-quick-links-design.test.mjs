/* eslint-disable max-len */
/* ITA's Quick Links box as www's (brief 416, ITA row 15; ita-parity-001 carry-on baggage at 1440 and
   390, measured in the capture): the box's heading 24 / 26.4 bold (20 / 22 below 768 px), 24 px over
   the cards; the cards one under the other 20 px apart, white, a 1 px #f8f8f9 line, 4 px corners,
   www's shadow 0 3px 6px rgb(11 35 64 / 10%); the picture 3:2 with the card's top corners; the body
   20 px in; the title 28 / 30.8 bold (22 / 24.3 below 768 px) 10 px over the text; the text 16 / 24;
   the link 18 / 27 bold in ITA blue with its arrow. ITA only (styles/themes/ita.css). Run:
   node --test test/ita-quick-links-design.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const rule = (sel, src = css) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...src.matchAll(new RegExp(`(?:^|[}\\s])${esc} \\{([^}]*)\\}`, 'g'))].map((m) => m[1]).join(' ');
};
const ASIDE = 'body.brand-ita main .section-aside';
const wide = css.slice(css.indexOf('@media (width >= 768px) { body.brand-ita main .section-aside'));

test('the heading and the cards\' column', () => {
  assert.match(rule(`${ASIDE} h4`), /font-size: 20px; line-height: 22px; font-weight: 700; margin: 0 0 24px;/);
  assert.match(rule(`${ASIDE} .cards-teaser > ul`), /grid-template-columns: minmax\(0, 1fr\); gap: 20px;/);
  assert.match(rule(`${ASIDE} h4`, wide), /font-size: 24px; line-height: 26.4px;/);
  assert.match(rule(`${ASIDE} .cards-teaser > ul`, wide), /grid-template-columns: minmax\(0, 1fr\);/);
});

test('the card: white, the line, the corners, www\'s shadow; the picture 3:2', () => {
  const card = rule(`${ASIDE} .cards-teaser > ul > li`);
  assert.match(card, /border: 1px solid #f8f8f9;/);
  assert.match(card, /border-radius: 4px;/);
  assert.match(card, /box-shadow: 0 3px 6px rgb\(11 35 64 \/ 10%\);/);
  assert.match(card, /background: #fff;/);
  assert.match(rule(`${ASIDE} .cards-teaser .cards-teaser-image img`), /aspect-ratio: 3 \/ 2;/);
  assert.match(rule(`${ASIDE} .cards-teaser .cards-teaser-image`), /margin: 0;/, 'the body right under the picture');
});

test('the body, title, text and link', () => {
  assert.match(rule(`${ASIDE} .cards-teaser .cards-teaser-body`), /padding: 20px;/);
  assert.match(rule(`${ASIDE} .cards-teaser .cards-teaser-title`), /font-size: 22px; line-height: 24.3px; font-weight: 700; margin: 0 0 10px;/);
  assert.match(rule(`${ASIDE} .cards-teaser .cards-teaser-title`, wide), /font-size: 28px; line-height: 30.8px;/);
  assert.match(rule(`${ASIDE} .cards-teaser .cards-teaser-body > p`), /font-size: 16px; line-height: 24px;/);
  assert.match(rule(`${ASIDE} .cards-teaser .cards-teaser-cta-link`), /font-size: 18px; line-height: 27px; font-weight: 700; color: #0171cf;/);
});
