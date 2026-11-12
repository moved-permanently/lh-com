/* eslint-disable max-len -- the rules' selectors */
/* Standing order 5 of 2026-11-11, item 2 (the B2B ranking, worst first): hygiene-and-safety's Travel Briefing grid
   (de/de, de/en, xx/de, xx/en; 52 % at 1440 against b2b-parity-006). DA holds www's heading as the first cell of a
   Columns Media stage block with two teaser cells, and two more such blocks after it; from 768 px www draws the
   heading over the row, the teasers two-up and 91 px between the rows. Measured with the rules: 1440 52.4 -> 3.7 %,
   390 unchanged (the rules are from 768 px only). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8');
const block = (() => {
  const at = css.indexOf('/* stage teasers under a heading in the block\'s first cell');
  const start = css.indexOf('@media (width >= 768px) {', at);
  let depth = 0;
  for (let i = start; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    if (css[i] === '}') { depth -= 1; if (!depth) return css.slice(start, i + 1); }
  }
  return '';
})();
const rule = (sel) => {
  const i = block.indexOf(`${sel} {`);
  return i < 0 ? '' : block.slice(i, block.indexOf('}', i) + 1);
};

test('from 768 px: a heading-only first cell over the row, the stage teasers two-up', () => {
  assert.equal(Boolean(block), true, 'the media block after its comment');
  assert.match(rule('body.brand-b2b .columns-media.stage .columns-media-row:has(> .columns-media-text:first-child > :is(h2, h3):only-child)'), /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  const cell = rule('body.brand-b2b .columns-media.stage .columns-media-row > .columns-media-text:first-child:has(> :is(h2, h3):only-child)');
  assert.match(cell, /grid-column: 1 \/ -1;/);
  assert.match(cell, /margin-bottom: 35px;/);
});

test('from 768 px: 91 px between two stage blocks in a row (the view edge between them)', () => {
  assert.match(rule('body.brand-b2b main .columns-media-wrapper:has(> .columns-media.stage) + .default-content-wrapper:has(+ .columns-media-wrapper > .columns-media.stage) > p.column-mark.column-end-outer:only-child'), /padding-bottom: 91px;/);
});

test('no :has() inside a :has() in these rules (it would drop the rule silently)', () => {
  block.split('{').map((s) => s.trim()).filter((s) => s.includes(':has(')).forEach((sel) => {
    sel.split(/,(?![^(]*\))/).forEach((part) => {
      let depth = 0;
      let inHas = 0;
      for (let i = 0; i < part.length; i += 1) {
        if (part.startsWith(':has(', i)) {
          assert.equal(inHas, 0, `nested :has() in ${part}`);
          inHas = depth + 1;
        }
        if (part[i] === '(') depth += 1;
        if (part[i] === ')') { if (depth === inHas) inHas = 0; depth -= 1; }
      }
    });
  });
});

test('below 768 px: a tab\'s label and its open content 20 px inside, as lufthansa.com\'s', () => {
  const at = css.indexOf('/* www\'s collapsible insets a tab\'s label and its open content 20 px');
  const media = css.lastIndexOf('@media (width < 768px) {', at);
  const between = css.slice(media, at);
  assert.equal(at > 0 && media > 0 && between.split('{').length - between.split('}').length === 1, true, 'inside the phone media block');
  const after = css.slice(at);
  assert.match(after, /body\.brand-b2b main > \.section\.section-tab-panel > \.section-tab-toggle \{\n {4}padding-right: 20px;\n {4}padding-left: 20px;\n {2}\}/);
  assert.match(after, /body\.brand-b2b main > \.section:is\(\.section-tab-panel, \.section-tab-part\) > div:not\(\.section-tab-toggle\) \{\n {4}padding-right: calc\(var\(--layout-margin, 22px\) \+ 20px\);\n {4}padding-left: calc\(var\(--layout-margin, 22px\) \+ 20px\);/);
});

test('below 768 px: no section space between a section and the tab set after it', () => {
  const at = css.indexOf('/* and no section space of its own there (space-below-m');
  const media = css.lastIndexOf('@media (width < 768px) {', at);
  const between = css.slice(media, at);
  assert.equal(at > 0 && media > 0 && between.split('{').length - between.split('}').length === 1, true, 'inside the phone media block');
  assert.match(css.slice(at), /body\.brand-b2b main > \.section:has\(\+ \.section\.section-tabs\) > \.default-content-wrapper:last-child > p\.spacer:last-child \{\n {4}display: none;\n {2}\}/);
});

test('from 1025 px: a teaser grid mixing cards with and without a picture keeps three columns', () => {
  const at = css.indexOf('/* a teaser grid that mixes cards with and without a picture');
  assert.equal(at > 0, true);
  assert.match(css.slice(at), /@media \(width >= 1025px\) \{\n {2}body\.brand-b2b \.carousel-cards\.grid:not\(\.two-up, \.four-up\) \.carousel-cards-track:has\(> \.carousel-cards-text-only\):has\(> :not\(\.carousel-cards-text-only\)\) \{\n {4}grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
});

test('from 768 px: a teaser grid right under a heading has only the heading\'s margin above it', () => {
  const at = css.indexOf('/* right under a heading the grid is in that heading\'s column view on www');
  const media = css.lastIndexOf('@media (width >= 768px) {', at);
  const between = css.slice(media, at);
  assert.equal(at > 0 && media > 0 && between.split('{').length - between.split('}').length === 1, true, 'inside the 768 px media block');
  assert.match(css.slice(at), /body\.brand-b2b main > \.section:not\(\.grey\) \.default-content-wrapper:has\(> :is\(h1, h2, h3, h4, h5, h6\):last-child\) \+ \.carousel-cards-wrapper \{\n {4}margin-top: 0;\n {2}\}/);
  // the general 64 px rule comes first, so this one wins at equal specificity plus its :has()
  assert.equal(css.indexOf('.default-content-wrapper + .carousel-cards-wrapper {\n    margin-top: 64px;') < at, true);
});
