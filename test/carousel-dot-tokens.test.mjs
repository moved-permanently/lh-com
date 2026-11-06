/* eslint-disable max-len */
/* The carousel dots per brand by tokens (blocks/carousel-cards, blocks/carousel-images; Austrian
   parity row 16a, ITA row 7): the drawn dot of the six brands with 24 px targets (brief 374,
   87f5d985) reads its size, colours, corners and the current dot's colour and width from tokens
   whose defaults are the values before (www's 8 px dot, the current one --lh-deepblue). A brand's
   theme sets the tokens, never the dot rules (test/carousel-dots-374.test.mjs). lh-com's own 8 px
   buttons are not tokenised: Lufthansa as before.
   Austrian: the current dot Austrian red (#d81e05, www's os-red). ITA (ita-parity-001 rendered with
   www's CSS: swiper-pagination-bullet): 12 px rings, 1 px #0171cf on white; the current one a
   20 x 12 px #0171cf pill (6 px corners).
   Run: node --max-old-space-size=512 --test test/carousel-dot-tokens.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8').replace(/\s+/g, ' ');
const BRANDS = 'body:is(.brand-swiss, .brand-austrian, .brand-ita, .brand-brussels, .brand-discover, .brand-cargo, .brand-lufthansa, .brand-b2b)';
const rule = (css, selector) => {
  const at = css.indexOf(`${selector} {`);
  assert.ok(at >= 0, selector);
  return css.slice(at + selector.length + 2, css.indexOf('}', at)).trim();
};

for (const block of ['carousel-cards', 'carousel-images']) {
  test(`${block}: the drawn dot from tokens, the defaults as before`, () => {
    const css = read(`blocks/${block}/${block}.css`);
    const dot = rule(css, `${BRANDS} .${block} .${block}-dot::before`);
    assert.equal(dot, 'content: ""; box-sizing: border-box; width: var(--carousel-dot-size, 8px); height: var(--carousel-dot-size, 8px); border: 1px solid var(--carousel-dot-color, var(--lh-grey-7)); border-radius: var(--carousel-dot-radius, 50%); background-color: var(--carousel-dot-fill, var(--lh-white));');
    const current = rule(css, `${BRANDS} .${block} .${block}-dot[aria-current="true"]::before`);
    assert.equal(current, 'width: var(--carousel-dot-current-width, var(--carousel-dot-size, 8px)); border-color: var(--carousel-dot-current-color, var(--lh-deepblue)); background-color: var(--carousel-dot-current-color, var(--lh-deepblue));');
    // the targets stay 24 px (87f5d985)
    assert.match(rule(css, `${BRANDS} .${block} .${block}-dot`), /width: 24px; height: 24px;/);
    // lh-com's own dots: no tokens
    assert.equal(rule(css, `.${block} .${block}-dot`), 'width: 8px; height: 8px; margin: 0; padding: 0; border: 1px solid var(--lh-grey-7); border-radius: 50%; background-color: var(--lh-white); cursor: pointer;');
    assert.equal(rule(css, `.${block} .${block}-dot[aria-current="true"]`), 'border-color: var(--lh-deepblue); background-color: var(--lh-deepblue);');
  });
}

test('Austrian: the current dot red; ITA: rings and the pill; the other brands set none', () => {
  const austrian = read('styles/themes/austrian.css');
  assert.match(austrian, /--carousel-dot-current-color: #d81e05;/);
  const ita = read('styles/themes/ita.css');
  ['--carousel-dot-size: 12px;', '--carousel-dot-color: #0171cf;', '--carousel-dot-fill: #fff;', '--carousel-dot-radius: 6px;', '--carousel-dot-current-color: #0171cf;', '--carousel-dot-current-width: 20px;']
    .forEach((d) => assert.ok(ita.includes(d), d));
  for (const theme of ['swiss', 'brussels', 'discover']) {
    assert.ok(!read(`styles/themes/${theme}.css`).includes('--carousel-dot-'), theme);
  }
});
