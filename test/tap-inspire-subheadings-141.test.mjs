/* eslint-disable max-len -- tests */
/* TAP row 141: the inspiration categories' country headings under the picker. accordion-columns-tap.js marks the
   headings it turns into the picker's tabs (faq-picker-sub-heading) and their sections (faq-picker-section); in an
   inspiration category those sections are a fragment's, whose class does not reach the page, so the theme's rule
   (scoped to faq-picker-section) missed the 13 headings: 56 px each under the picker at 1440. The rule now hides every
   heading with the class, which only the picker gives. Run: node --test test/tap-inspire-subheadings-141.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../blocks/accordion-columns/accordion-columns-tap.js', import.meta.url), 'utf8');

test('every heading the picker took over is for assistive tech only, wherever its section came from', () => {
  const at = css.indexOf('body.brand-tap main .faq-picker-sub-heading {');
  assert.ok(at > 0);
  const rule = css.slice(at, css.indexOf('}', at));
  ['position: absolute;', 'width: 1px;', 'height: 1px;', 'clip-path: inset(50%);'].forEach((d) => assert.ok(rule.includes(d), d));
  assert.ok(!css.includes('.faq-picker-section .faq-picker-sub-heading {'));
});

test('only the picker gives the class (so the rule cannot hide another heading)', () => {
  const sets = [...js.matchAll(/classList\.add\('faq-picker-sub-heading'\)/g)].length;
  assert.equal(sets, 2);
  const elsewhere = fs.readdirSync(new URL('../blocks/', import.meta.url), { recursive: true }).filter((f) => f.endsWith('.js'))
    .filter((f) => !f.endsWith('accordion-columns-tap.js'))
    .filter((f) => fs.readFileSync(new URL(`../blocks/${f}`, import.meta.url), 'utf8').includes('faq-picker-sub-heading'));
  assert.deepEqual(elsewhere, []);
});
