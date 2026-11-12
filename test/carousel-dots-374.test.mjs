/* eslint-disable max-len, no-restricted-syntax */
/* The carousel dots of SWISS, Austrian, ITA, Brussels Airlines, Discover and Lufthansa Cargo
   (brief 374, from 370's WCAG 2.5.8 finding): each dot a 24 px target with www's 8 px dot drawn in
   its middle (its 1 px border and fill, the current one filled), as ema-test did for TAP
   (57a0a0a7, row 86). 24 px targets cannot sit closer than 24 px, so the dots stand 24 px apart
   instead of 16. Scoped to the brands' body classes in the carousel files: TAP draws its own
   (tap.css), Air Dolomiti hides them; lh-com (body.brand-lufthansa) since brief 404, the user's
   decision on its parity row A1 (www's dots are the same 8 px, 16 px apart).
   Run: node --max-old-space-size=512 --test test/carousel-dots-374.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\s+/g, ' ');
const BRANDS = 'body:is(.brand-swiss, .brand-austrian, .brand-ita, .brand-brussels, .brand-discover, .brand-cargo, .brand-lufthansa, .brand-b2b)';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

for (const [block, file] of [['carousel-cards', 'blocks/carousel-cards/carousel-cards.css'], ['carousel-images', 'blocks/carousel-images/carousel-images.css']]) {
  test(`${block}: the brands' and lh-com's dots are 24 px targets with www's 8 px dot inside`, () => {
    const css = read(file);
    const sel = (rest) => esc(`${BRANDS} .${block} .${block}-${rest}`);
    assert.match(css, new RegExp(`${sel('dots')} \\{ gap: 0; \\}`), 'no gap: the targets touch');
    assert.match(css, new RegExp(`${sel('dot')} \\{[^}]*width: 24px; height: 24px;[^}]*border: 0;[^}]*background: none;`));
    assert.match(css, new RegExp(`${sel('dot')}::before \\{[^}]*box-sizing: border-box; width: var\\(--carousel-dot-size, 8px\\); height: var\\(--carousel-dot-size, 8px\\); border: 1px solid var\\(--carousel-dot-color, var\\(--lh-grey-7\\)\\); border-radius: var\\(--carousel-dot-radius, 50%\\); background-color: var\\(--carousel-dot-fill, var\\(--lh-white\\)\\);`), 'the drawn dot as the button was (by default: tokens, test/carousel-dot-tokens.test.mjs)');
    assert.match(css, new RegExp(`${sel('dot')}\\[aria-current="true"\\]::before \\{ width: var\\(--carousel-dot-current-width, var\\(--carousel-dot-size, 8px\\)\\); border-color: var\\(--carousel-dot-current-color, var\\(--lh-deepblue\\)\\); background-color: var\\(--carousel-dot-current-color, var\\(--lh-deepblue\\)\\); \\}`));
    // the base dot (the other sites) unchanged
    assert.match(css, new RegExp(`${esc(`.${block} .${block}-dot`)} \\{ width: 8px; height: 8px; margin: 0; padding: 0; border: 1px solid var\\(--lh-grey-7\\); border-radius: 50%; background-color: var\\(--lh-white\\); cursor: pointer; \\}`));
    assert.doesNotMatch(css, /brand-tap|brand-airdolomiti/);
  });
}

test('the brands\' themes and TAP\'s rules are not where the dots are changed', () => {
  for (const theme of ['swiss', 'austrian', 'ita', 'brussels', 'discover']) {
    assert.doesNotMatch(read(`styles/themes/${theme}.css`), /carousel-(cards|images)-dot/, theme);
  }
});
