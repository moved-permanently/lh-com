/* eslint-disable max-len */
/* Standing order 55, item 1: Air Dolomiti's accordion text template (a text box with a title and at least two
   paragraphs right before an Accordion Columns block: the assistance, FAQ, dangerous goods, digital services and
   basic fare pages) as www's rich text, as one change: the lists' .5em, the bold-only lead-ins run into their answers
   (scripts/bold-leads.js), 151 / 185 px into the accordion, 110 / 120 px under it before the closing picture, the
   title 44 px lower below 930 px. Every rule is scoped to that text box, so no other page type is reached.
   Run: node --max-old-space-size=256 --test test/airdolomiti-accordion-text-stack-so55.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import markBoldLeads from '../scripts/bold-leads.js';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const X = 'body.brand-airdolomiti main > .section > .default-content-wrapper:has(> h1 ~ p ~ p):has(+ .accordion-columns-wrapper)';
const UNDER = 'body.brand-airdolomiti main > .section > .default-content-wrapper:has(> h1 ~ p ~ p) + .accordion-columns-wrapper + .default-content-wrapper:has(> p:only-child > picture:only-child)';
const body = (sel, from = 0) => {
  const i = css.indexOf(`${sel} {`, from);
  return i < 0 ? null : css.slice(i + sel.length + 2, css.indexOf('}', i)).trim();
};

test('the lists and the paragraph before one, in the template\'s text box only', () => {
  assert.equal(body(`${X} > :is(ul, ol):not(h2 ~ *)`), 'margin-block: 11px;');
  assert.equal(body(`${X} > p:not(.button-wrapper, h2 ~ p):has(+ :is(ul, ol))`), 'margin-bottom: 0;');
});

test('a bold-only lead-in runs into its answer', () => {
  assert.equal(body(`${X} > p.bold-lead:not(.button-wrapper, h2 ~ p):has(+ :is(p:not(.button-wrapper), ul, ol))`), 'margin-bottom: 0;');
});

test('into and under the accordion: 151 / 110 px, 185 / 120 from 930 px', () => {
  assert.equal(body(X), 'margin-bottom: 151px;');
  assert.equal(body(UNDER), 'margin-top: 110px;');
  const wide = css.indexOf('@media (width >= 930px) { body.brand-airdolomiti main > .section > .default-content-wrapper:has(> h1 ~ p ~ p):has(+ .accordion-columns-wrapper) {');
  assert.ok(wide > 0);
  assert.equal(body(X, wide), 'margin-bottom: 185px;');
  assert.equal(body(UNDER, wide), 'margin-top: 120px;');
});

test('the title 44 px lower below 930 px, in a breadcrumb section', () => {
  const narrow = css.indexOf('@media (width < 930px) { body.brand-airdolomiti main > .section.breadcrumb-container > .default-content-wrapper:has(> h1 ~ p ~ p):has(+ .accordion-columns-wrapper) { margin-top: 68px; } }');
  assert.ok(narrow > 0);
});

test('no rule reads p.bold-lead outside the template\'s text box', () => {
  const sels = [...css.matchAll(/([^{}]+)\{[^{}]*\}/g)].map((m) => m[1].trim()).filter((s) => s.includes('bold-lead'));
  assert.equal(sels.length, 1);
  assert.ok(sels[0].startsWith(`${X} > p.bold-lead`));
  ['styles/styles.css', 'styles/themes/austrian.css', 'styles/themes/cargo.css']
    .filter((f) => fs.existsSync(new URL(`../${f}`, import.meta.url)))
    .forEach((f) => assert.ok(!fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').includes('bold-lead'), f));
});

test('bold-leads.js marks bold-only paragraphs, not a bold label before plain text', () => {
  const { document } = parseHTML(`<html><body><main><div>
    <h1>Assistance</h1>
    <p><strong>Why request it in advance?</strong></p>
    <p>Because the service is arranged before the flight.</p>
    <p><strong>E-mail:</strong> assistance@example.com</p>
    <p><b>Phone</b> <strong>line</strong></p>
    <p><strong><a href="/x">Linked lead</a></strong></p>
    <p></p>
  </div></main></body></html>`);
  const main = document.querySelector('main');
  markBoldLeads(main);
  const marks = [...main.querySelectorAll('p')].map((p) => (p.classList.contains('bold-lead') ? '1' : '0')).join('');
  assert.equal(marks, '100110');
});
