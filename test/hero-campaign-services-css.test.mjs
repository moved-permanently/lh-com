/* eslint-disable max-len */
/* hero-campaign option services, layout rules (brief 300, measured on Air Dolomiti's homepages):
   dock is one row only where the widest language fits (the bar's overflow cut its last segment
   from 1025 to 1105px, the Italian label took 3 lines up to 1185px): 2 x 2 below 1200px; band's
   buttons 8px side padding ("Gestione Prenotazione" needs 205px, 1.3fr gave 198); band's grid
   rows stretch, so the buttons of a row are equally high (390: 76 vs 92px). Read from the
   stylesheet. Run: node --max-old-space-size=512 --test test/hero-campaign-services-css.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('blocks/hero-campaign/hero-campaign.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** Top-level rules and @media blocks: [{ media, selector, body }] (media '' outside any query). */
function rules(text) {
  const out = [];
  const walk = (src, media) => {
    let i = 0;
    while (i < src.length) {
      const open = src.indexOf('{', i);
      if (open < 0) break;
      const head = src.slice(i, open).trim();
      let depth = 1;
      let j = open + 1;
      for (; j < src.length && depth; j += 1) {
        if (src[j] === '{') depth += 1;
        else if (src[j] === '}') depth -= 1;
      }
      const body = src.slice(open + 1, j - 1);
      if (head.startsWith('@media')) walk(body, head.replace(/^@media\s*/, ''));
      else out.push({ media, selector: head.replace(/\s+/g, ' '), body });
      i = j;
    }
  };
  walk(text, '');
  return out;
}
const all = rules(css);
const find = (selector, media) => all.filter((r) => r.selector.split(',').map((s) => s.trim()).includes(selector) && (media === undefined || r.media === media));
const prop = (body, name) => (body.match(new RegExp(`(?:^|;|\\s)${name}\\s*:\\s*([^;]+)`)) || [])[1]?.trim();
const DOCK = '.hero-campaign.hero-campaign-services[data-services="dock"]';
const BAND = '.hero-campaign.hero-campaign-services[data-services="band"]';

test('dock: its 2 x 2 layout below 1200px, not only below 1025px', () => {
  [
    [`${DOCK} .hero-campaign-content`, 'grid-template-columns'],
    [`${DOCK} .hero-campaign-services-label`, 'grid-column'],
    [`${DOCK} .hero-campaign-content > .hero-campaign-cta:nth-child(odd of .hero-campaign-cta)`, 'border-left'],
    [`${DOCK} .hero-campaign-content > .hero-campaign-cta:nth-child(n + 3 of .hero-campaign-cta)`, 'border-top'],
  ].forEach(([selector, name]) => {
    const r = find(selector, '(width < 1200px)').find((x) => prop(x.body, name));
    assert.ok(r, `${selector} { ${name} } under (width < 1200px)`);
    assert.ok(!find(selector, '(width < 1025px)').some((x) => prop(x.body, name)), `${selector} { ${name} } not under (width < 1025px) any more`);
  });
  const grid = find(`${DOCK} .hero-campaign-content`, '(width < 1200px)').find((x) => prop(x.body, 'display'));
  assert.equal(prop(grid.body, 'display'), 'grid');
});

test('band: 8px side padding on the buttons from 768px (the phone rule as before)', () => {
  const r = find(`${BAND} .hero-campaign-content > .hero-campaign-cta a.button`, '').find((x) => prop(x.body, 'padding'));
  assert.equal(prop(r.body, 'padding'), '10px 8px');
  const phone = find(`${BAND} .hero-campaign-content > .hero-campaign-cta a.button`, '(width < 768px)').find((x) => prop(x.body, 'padding'));
  assert.equal(prop(phone.body, 'padding'), '10px 8px');
});

test('band: the grid rows stretch, the shortcuts fill their cell', () => {
  const grid = find(`${BAND} .hero-campaign-content`, '').find((x) => prop(x.body, 'display') === 'grid');
  assert.equal(prop(grid.body, 'align-items'), 'stretch');
  const cell = find(`${BAND} .hero-campaign-content > .hero-campaign-cta`, '').find((x) => prop(x.body, 'display'));
  assert.ok(cell, 'the shortcut paragraph is a flex container (its button stretches to the row height)');
  assert.equal(prop(cell.body, 'display'), 'flex');
});

test('the other looks keep their breakpoints: band 2 x 2 below 1025px, tiles 2 x 2 below 768px', () => {
  assert.ok(find(`${BAND} .hero-campaign-services-label`, '(width < 1025px)').some((x) => prop(x.body, 'grid-column')));
  assert.ok(find('.hero-campaign.hero-campaign-services[data-services="tiles"] .hero-campaign-content', '(width < 768px)').some((x) => prop(x.body, 'grid-template-columns')));
});
