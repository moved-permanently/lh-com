/* eslint-disable max-len, no-restricted-syntax */
/* The carousel dots of SWISS, Austrian, ITA, Brussels Airlines, Discover and Lufthansa Cargo
   (brief 374, from 370's WCAG 2.5.8 finding): each dot a 24 px target with www's 8 px dot drawn in
   its middle (its 1 px border and fill, the current one filled), as ema-test did for TAP
   (57a0a0a7, row 86). 24 px targets cannot sit closer than 24 px, so the dots stand 24 px apart
   instead of 16. Scoped to the six brands' body classes in the carousel files: TAP draws its own
   (tap.css), Air Dolomiti hides them, lh-com keeps its 8 px buttons (not asked).
   Run: node --max-old-space-size=512 --test test/carousel-dots-374.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\s+/g, ' ');
const BRANDS = 'body:is(.brand-swiss, .brand-austrian, .brand-ita, .brand-brussels, .brand-discover, .brand-cargo)';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

for (const [block, file] of [['carousel-cards', 'blocks/carousel-cards/carousel-cards.css'], ['carousel-images', 'blocks/carousel-images/carousel-images.css']]) {
  test(`${block}: the six brands' dots are 24 px targets with www's 8 px dot inside`, () => {
    const css = read(file);
    const sel = (rest) => esc(`${BRANDS} .${block} .${block}-${rest}`);
    assert.match(css, new RegExp(`${sel('dots')} \\{ gap: 0; \\}`), 'no gap: the targets touch');
    assert.match(css, new RegExp(`${sel('dot')} \\{[^}]*width: 24px; height: 24px;[^}]*border: 0;[^}]*background: none;`));
    assert.match(css, new RegExp(`${sel('dot')}::before \\{[^}]*box-sizing: border-box; width: 8px; height: 8px; border: 1px solid var\\(--lh-grey-7\\); border-radius: 50%; background-color: var\\(--lh-white\\);`), 'the drawn dot as the button was');
    assert.match(css, new RegExp(`${sel('dot')}\\[aria-current="true"\\]::before \\{ border-color: var\\(--lh-deepblue\\); background-color: var\\(--lh-deepblue\\); \\}`));
    // the base dot (lh-com, the other sites) unchanged
    assert.match(css, new RegExp(`${esc(`.${block} .${block}-dot`)} \\{ width: 8px; height: 8px; margin: 0; padding: 0; border: 1px solid var\\(--lh-grey-7\\); border-radius: 50%; background-color: var\\(--lh-white\\); cursor: pointer; \\}`));
    assert.doesNotMatch(css, /brand-tap|brand-airdolomiti/);
  });
}

test('the brands\' themes and TAP\'s rules are not where the dots are changed', () => {
  for (const theme of ['swiss', 'austrian', 'ita', 'brussels', 'discover']) {
    assert.doesNotMatch(read(`styles/themes/${theme}.css`), /carousel-(cards|images)-dot/, theme);
  }
});
