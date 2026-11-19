/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 71 (2026-11-19), token-free.
   - Item 2: SWISS's FAQ headlines (THEMES.swiss rules 'accordion-headings': a flow page's H2 right before or right
     after an accordion in its section, not in a tab panel, gets heading-medium, as www's headline there), and the page
     title 30 px under its picture on phones (31 from 768 px, order 70).
   - Item 4: Group for Business below 768 px a tab set right after running text 20 px lower (meals-on-board), and from
     768 px a table shorter than its box filling the 840 px box (kuala-lumpur).
   Strings only in assertions (no DOM node goes into one).
   Run: node --max-old-space-size=256 --test test/swiss-b2b-so71.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { themeFor, THEMES } from '../scripts/style-markers.js';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const { default: decorateTokenFree } = await import('../scripts/token-free.js');

// the H2s' classes after the site's token-free pass on a SWISS flow page
const h2s = (mainHtml, brand = 'swiss') => {
  const { document } = parseHTML(`<html><head></head><body><main>${mainHtml}</main></body></html>`);
  globalThis.document = document;
  const main = document.querySelector('main');
  decorateTokenFree(main, { brand, path: '/ch/en/x', read: (k) => (k === 'theme' ? 'flow-spacing' : '') });
  return [...main.querySelectorAll('h2')].map((h) => `${h.textContent}:${h.className}`).join(' ');
};

const acc = '<div class="accordion-columns faq"><div><div>Q</div><div>A</div></div></div>';

test('accordion-headings: a SWISS theme rule only', () => {
  assert.ok(themeFor('swiss').rules.includes('accordion-headings'));
  Object.entries(THEMES).filter(([b]) => b !== 'swiss').forEach(([b]) => assert.ok(!themeFor(b).rules.includes('accordion-headings'), b));
});

test('accordion-headings: the H2 right before or after an accordion, not in a tab panel', () => {
  if (!THEMES.swiss.live) return;
  // refunds: the H2 over the accordion; payment-options: the H2 under it
  assert.equal(h2s(`<div><p>Intro</p><h2>Options</h2>${acc}</div>`), 'Options:heading-medium');
  assert.equal(h2s(`<div>${acc}<h2>At the airport</h2><p>Text</p></div>`), 'At the airport:heading-medium');
  // the section's metadata between them does not count
  assert.equal(h2s(`<div><h2>Options</h2><div class="section-metadata"><div><div>Style</div><div>padded</div></div></div>${acc}</div>`), 'Options:heading-medium');
  // other H2s stay the flow pages' heading-small: text after, a heading after, another block
  assert.equal(h2s('<div><h2>A</h2><p>Text</p><h2>B</h2><h3>Sub</h3></div>'), 'A:heading-small B:heading-small');
  assert.equal(h2s(`<div><h2>A</h2><p>Text</p>${acc}</div>`), 'A:heading-small');
  assert.equal(h2s('<div><h2>A</h2><div class="columns-media"><div><div>x</div></div></div></div>'), 'A:heading-small');
  // in a tab panel (baggage-irregularities) the H2 stays heading-small
  const tab = '<div class="section-metadata"><div><div>Tab</div><div>Delayed</div></div></div>';
  assert.equal(h2s(`<div><h2>FAQ</h2>${acc}${tab}</div>`), 'FAQ:heading-small');
  assert.equal(h2s(`<div data-tab="Delayed"><h2>FAQ</h2>${acc}</div>`), 'FAQ:heading-small');
  // a marker's size wins; H3s are not touched
  assert.equal(h2s(`<div><h2 class="heading-large">Big</h2>${acc}</div>`), 'Big:heading-large');
  // another brand keeps its own sizes
  assert.doesNotMatch(h2s(`<div><h2>Options</h2>${acc}</div>`, 'discover'), /heading-medium/);
});

test('swiss.css: the title 30 px under its picture on phones, 31 from 768', () => {
  const css = read('../styles/themes/swiss.css');
  assert.match(css, /\*\/\nbody\.brand-swiss main \.section > \.default-content-wrapper > p:has\(> picture\):has\(\+ h1\):not\(\.column-end\) \{\s*margin-bottom: 30px;\s*\}\n\n@media \(width >= 768px\) \{\s*\/\*[^*]*\*\/\s*body\.brand-swiss main \.section > \.default-content-wrapper > p:has\(> picture\):has\(\+ h1\):not\(\.column-end\) \{\s*margin-bottom: 31px;/);
});

test('b2b.css: the tab set after running text on phones, the short table in its box from 768', () => {
  const css = read('../styles/themes/b2b.css');
  assert.match(css, /@media \(width < 768px\) \{\s*body\.brand-b2b main > \.section:has\(> \.default-content-wrapper:last-child > p:last-child:not\(\[class\]\)\):not\(:has\(> \.default-content-wrapper:last-child > p:last-child > picture\)\) \+ \.section\.section-tabs \+ \.section\.section-tab-panel \{\s*padding-top: 20px;/);
  assert.match(css, /@media \(width >= 768px\) \{\s*body\.brand-b2b main \.table-striped:not\(\.beside, \.beside-end, \.columns, \.matrix\):has\(> table\) \{\s*height: 840px;\s*\}\s*body\.brand-b2b main \.table-striped:not\(\.beside, \.beside-end, \.columns, \.matrix\) > table \{\s*height: 100%;/);
  // nested :has is invalid CSS (the rule would be dropped): none in the new rules
  css.split('\n').filter((l) => l.includes('section-tabs + .section.section-tab-panel')).forEach((l) => assert.doesNotMatch(l, /:has\([^)]*:has\(/));
  const others = fs.readdirSync(new URL('../styles/themes/', import.meta.url)).filter((f) => !['swiss.css', 'b2b.css'].includes(f) && f.endsWith('.css'));
  others.forEach((f) => assert.doesNotMatch(read(`../styles/themes/${f}`), /standing order 71/, f));
});

test('swiss.css: the column 96 / 76 px under the lead when it opens with its H2; a text-only row\'s next heading 28 px from 1025', () => {
  const css = read('../styles/themes/swiss.css');
  const sel = 'body.brand-swiss main > .section:has(> .default-content-wrapper:last-child > h1 + p.copytext-large:last-child) + .section.with-aside:has(> .default-content-wrapper:first-child > h2:first-child)';
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.match(css, new RegExp(`\\*/\\n${esc(sel)} \\{\\s*margin-top: 76px;\\s*\\}\\n\\n@media \\(width >= 768px\\) \\{\\s*${esc(sel)} \\{\\s*margin-top: 96px;`));
  const row = 'body.brand-swiss main .columns-media-wrapper:has(> .columns-media:not(.padded)):not(:has(picture, img, video, iframe)) + .default-content-wrapper:has(> :is(h2, h3):first-child)';
  assert.match(css, new RegExp(`@media \\(width >= 1025px\\) \\{\\s*/\\*[^*]*\\*/\\s*${esc(row)} \\{\\s*margin-top: 28px;`));
  // the picture rows keep 48 / 64 px (test/swiss-row-headings.test.mjs)
  assert.ok(css.includes('@media (width >= 1025px) {\n  body.brand-swiss main .columns-media-wrapper + .default-content-wrapper:has(> :is(h2, h3):first-child) {\n    margin-top: 64px;\n  }\n}'));
});
