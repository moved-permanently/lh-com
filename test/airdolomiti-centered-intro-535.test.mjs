/* eslint-disable max-len */
/* Air Dolomiti's destination article lists (/<root>/destinations/<city>/what-to-see, what-to-do, what-to-eat: the
   breadcrumb, the title and its text over the article cards, cards-teaser three-up) as www's (the brief after 531,
   item 2; airdolomiti-parity-002 /destinations/florence/what-to-see at 1440): www's TitleDescriptionCta draws a
   CenteredBlock, the title 38 / 46 px light centred 10 px over the text, the text 16 / 27.2 px justified in a 936 px
   column (65 % of the screen) in the middle, the cards 179 px under it. Ours: the page title left (42 px) over 22 / 30 px text across
   the column, the cards 44 px under it (the page -15.7 % to the footer). From 930 px (the recording's width; phones
   as before).
   Run: node --max-old-space-size=512 --test test/airdolomiti-centered-intro-535.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const W = 'body.brand-airdolomiti main > .section.breadcrumb-container.cards-teaser-container > .default-content-wrapper:has(> h1:first-child + p:last-child):has(+ .cards-teaser-wrapper > .cards-teaser.three-up)';

const block = (media) => {
  const at = css.indexOf(`@media ${media} {\n  ${W} {`);
  assert.ok(at >= 0, `the intro's rules in @media ${media}`);
  let depth = 0;
  let end = css.indexOf('{', at);
  for (; end < css.length; end += 1) {
    if (css[end] === '{') depth += 1;
    if (css[end] === '}') { depth -= 1; if (!depth) break; }
  }
  return css.slice(at, end);
};
const decl = (scope, selector) => {
  const i = scope.indexOf(`${selector} {`);
  assert.ok(i >= 0, selector);
  const body = scope.slice(i + selector.length + 2, scope.indexOf('}', i));
  return Object.fromEntries(body.split(';').map((d) => d.trim()).filter(Boolean).map((d) => d.split(/:\s*/)));
};

test('from 930 px: the intro centred, the text in the middle 65 % of the screen, the cards 179 px under it', () => {
  const b = block('(width >= 930px)');
  assert.equal(decl(b, W)['margin-bottom'], '179px');
  const h1 = decl(b, `${W} > h1`);
  assert.deepEqual([h1['text-align'], h1['font-size'], h1['line-height'], h1['font-weight'], h1['margin-bottom']], ['center', '38px', '46px', '300', '10px']);
  const p = decl(b, `${W} > p`);
  assert.deepEqual([p['max-width'], p['margin-inline'], p['font-size'], p['line-height'], p['text-align']], ['65vw', 'auto', '16px', '27.2px', 'justify']);
});
