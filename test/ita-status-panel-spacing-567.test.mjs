/* eslint-disable max-len */
/* ITA's Miles & More status panels on the live document (the standing order of 2026-11-10, item 6; ITA row 28,
   ita-parity-004 at 1440 and 390). Two things after row 26:
   - the panels' text the column's full width (row 23) lost to the block's own rule from 1025 px (accordion-columns.css
     .accordion-columns.faq:not(.limited-width) .accordion-columns-panel :is(p, ul, ...) { max-width: 66% }, 0,4,1 against
     0,3,4): the two-line headings ran to three lines; a selector through the panel counts more (0,4,4);
   - the spacing as www's column view (its light DOM, measured offline): 18 px over the line (ours 10), the heading 32 px
     over the list (24), the link 16 / 24 px in a 31 px box (18 / 27), 49 px under it (20): each panel 46 px short.
   Run: node --test test/ita-status-panel-spacing-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const Q = 'body.brand-ita .accordion-columns .accordion-columns-panel > .accordion-columns-intro:has(> h3):has(> p > picture)';
// the declarations of the rules whose selector list holds sel, merged
const decls = (sel) => Object.fromEntries([...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter((m) => m[1].replace(/@media[^{]*$/, '').split(/,\s*\n/).map((s) => s.replace(/^[\s\S]*\{/, '').trim()).includes(sel))
  .flatMap((m) => m[2].split(';').map((d) => d.trim()).filter(Boolean))
  .map((d) => { const [k, ...v] = d.split(':'); return [k.trim(), v.join(':').trim()]; }));

test('the text the column\'s full width through the panel (over the block\'s 66 % from 1025 px)', () => {
  assert.equal(decls(`${Q} > *`)['max-width'], 'none');
});

test('the spacing as www\'s: 18 over the line, 32 under the heading, the link 31 px, 49 under it', () => {
  assert.equal(decls(Q)['margin-block'], '8px 29px');
  assert.equal(decls(`${Q} > h3`)['margin-bottom'], '32px');
  const link = decls(`${Q} > p:last-child:not(:has(> picture))`);
  assert.deepEqual([link['padding-block'], link['font-size'], link['line-height'], link['margin-bottom']], ['3.5px', '16px', '24px', '0']);
});
