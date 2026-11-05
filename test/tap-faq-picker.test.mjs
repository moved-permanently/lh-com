/* eslint-disable max-len, import/extensions */
/* The FAQ's two-level picker on TAP (brief 368, tools/reports/tap/parity.md row 65), as
   www.flytap.com/<root>/help/frequently-asked-questions: the categories (the sections' H2) as pills
   under the title, the chosen one's title, then its subcategories (the H3 before each FAQ block):
   from 1024 px a list on the left (WAI-ARIA tabs, vertical), its questions on the right; on
   phones a select. One category and one subcategory at a time; a #hash of either picks it.
   blocks/accordion-columns/accordion-columns-tap.js buildFaqPicker.
   Run: node --max-old-space-size=512 --test test/tap-faq-picker.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

// www's categories in one section (as the FAQ page is imported) and in sections of their own
const PAGE = `<!DOCTYPE html><html lang="en"><head><meta name="brand" content="tap"></head><body><main>
<div class="section"><div class="default-content-wrapper"><h1 id="faq">Frequently asked questions</h1></div></div>
<div class="section"><div class="default-content-wrapper"><h2 id="before-the-flight">Before the flight</h2><h3 id="economy-prime">Economy Prime</h3></div>
<div class="accordion-columns-wrapper"><div class="accordion-columns faq block"><details><summary>What is Economy Prime?</summary></details></div></div>
<div class="default-content-wrapper"><h3 id="fares">Fares and Taxes</h3></div>
<div class="accordion-columns-wrapper"><div class="accordion-columns faq block"><details><summary>What fares?</summary></details></div></div>
<div class="default-content-wrapper"><h2 id="during-the-flight">During the flight</h2><h3 id="meals">Meals</h3></div>
<div class="accordion-columns-wrapper"><div class="accordion-columns faq block"><details><summary>Is there food?</summary></details></div></div></div>
<div class="section"><div class="default-content-wrapper"><h2 id="after-the-flight">After the flight</h2><h3 id="refunds">Refunds</h3></div>
<div class="accordion-columns-wrapper"><div class="accordion-columns faq block"><details><summary>A refund?</summary></details></div></div></div>
</main></body></html>`;

const load = async (hash = '') => {
  const { window, document } = parseHTML(PAGE);
  window.location = { hash, pathname: '/en-pt/help/frequently-asked-questions' };
  globalThis.window = window;
  globalThis.document = document;
  const mod = await import('../blocks/accordion-columns/accordion-columns-tap.js');
  return { window, document, mod };
};

test('the model: each category its H2 and section, each subcategory its H3 and its FAQ block', async () => {
  const { document, mod } = await load();
  const model = mod.faqModel(document.querySelector('main'));
  assert.deepEqual(model.map((c) => [c.heading.textContent, c.subs.map((s) => s.heading.textContent)]), [['Before the flight', ['Economy Prime', 'Fares and Taxes']], ['During the flight', ['Meals']], ['After the flight', ['Refunds']]]);
});

test('the picker: the pills under the title, one category and one subcategory shown, tabs and a select', async () => {
  const { window, document, mod } = await load();
  const main = document.querySelector('main');
  mod.buildFaqPicker(main);
  const nav = main.querySelector('.faq-picker-categories');
  assert.equal(Boolean(nav) && nav.nextElementSibling === main.querySelector('.faq-picker-category'), true, 'right before the first category, under the title');
  const pills = [...nav.querySelectorAll('button')];
  assert.deepEqual(pills.map((b) => [b.textContent, b.getAttribute('aria-pressed')]), [['Before the flight', 'true'], ['During the flight', 'false'], ['After the flight', 'false']]);
  const [first, second, third] = [...main.querySelectorAll('.faq-picker-category')];
  assert.equal(Boolean(third) && third.hidden, true);
  assert.equal(first.hidden, false);
  assert.equal(second.hidden, true);
  const tabs = [...first.querySelectorAll('[role="tablist"] [role="tab"]')];
  assert.deepEqual(tabs.map((t) => [t.textContent, t.getAttribute('aria-selected')]), [['Economy Prime', 'true'], ['Fares and Taxes', 'false']]);
  assert.equal(first.querySelector('[role="tablist"]').getAttribute('aria-orientation'), 'vertical');
  const panels = [...first.querySelectorAll('[role="tabpanel"]')];
  assert.deepEqual(panels.map((p) => p.hidden), [false, true]);
  assert.equal(panels[0].getAttribute('aria-labelledby'), tabs[0].id);
  const select = first.querySelector('select.faq-picker-select');
  assert.deepEqual([...select.querySelectorAll('option')].map((o) => o.textContent), ['Economy Prime', 'Fares and Taxes']);
  tabs[1].dispatchEvent(new window.Event('click'));
  assert.deepEqual(panels.map((p) => p.hidden), [true, false]);
  assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
  assert.equal(select.value, '1');
  select.querySelectorAll('option').forEach((o, i) => (i === 0 ? o.setAttribute('selected', '') : o.removeAttribute('selected')));
  select.dispatchEvent(new window.Event('change'));
  assert.deepEqual(panels.map((p) => p.hidden), [false, true]);
  pills[1].dispatchEvent(new window.Event('click'));
  assert.equal(first.hidden, true);
  assert.equal(second.hidden, false);
  assert.equal(pills[1].getAttribute('aria-pressed'), 'true');
  mod.buildFaqPicker(main);
  assert.equal(main.querySelectorAll('.faq-picker-categories').length, 1, 'once per page');
});

test('a #hash picks its category or subcategory (the help centre links to #before-the-flight)', async () => {
  const { document, mod } = await load('#fares');
  const main = document.querySelector('main');
  mod.buildFaqPicker(main);
  const tabs = [...main.querySelector('.faq-picker-category').querySelectorAll('[role="tab"]')];
  assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
  const again = await load('#during-the-flight');
  const main2 = again.document.querySelector('main');
  again.mod.buildFaqPicker(main2);
  const cats = [...main2.querySelectorAll('.faq-picker-category')];
  assert.deepEqual(cats.map((c) => c.hidden), [true, false, true]);
});

test('accordion-columns.js hands a TAP page\'s FAQ to the picker; the look in styles/themes/tap.css', () => {
  const src = fs.readFileSync(new URL('../blocks/accordion-columns/accordion-columns.js', import.meta.url), 'utf8');
  assert.match(src, /import\('\.\/accordion-columns-tap\.js'\)/);
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  assert.match(css, /body\.brand-tap \.faq-picker-categories button\[aria-pressed="true"\] \{[^}]*background-color: #65c922;/);
  assert.match(css, /body\.brand-tap \.faq-picker-tab\[aria-selected="true"\] \{\s*background-color: #65c922;/);
  assert.match(css, /@media \(width >= 1024px\) \{[^@]*body\.brand-tap \.faq-picker-body \{\s*display: grid;\s*grid-template-columns: 398px minmax\(0, 1fr\);/);
});

test('only on the FAQ page (its slug in each of TAP\'s languages): other pages\' FAQ blocks stay as they are', async () => {
  const { mod } = await load();
  ['/en-pt/help/frequently-asked-questions', '/pt-pt/ajuda/perguntas-frequentes', '/pt-br/ajuda/perguntas-frequentes', '/es-es/ayuda/preguntas-frecuentes', '/fr-fr/aide/questions-frequentes', '/de-de/hilfe/haufige-gestellte-fragen', '/it-it/assistenza/domande-frequenti', '/pl-pl/pomoc/czesto-zadawane-pytania', '/de-ch/hilfe/haufige-gestellte-fragen/'].forEach((p) => assert.equal(mod.isFaqPage(p), true, p));
  ['/en-pt/check-in-information', '/en-pt/help', '/en-pt/miles-and-go'].forEach((p) => assert.equal(mod.isFaqPage(p), false, p));
});

test('the Miles&Go partners page too (brief 386, the same CategoryAccordion on www: category pills, partners on the left, their accordion on the right), in every version; not Stopover\'s partners', async () => {
  const { mod } = await load();
  ['/pt-pt/miles-and-go/parceiros', '/en-pt/miles-and-go/partners', '/es-es/miles-and-go/socios', '/fr-fr/miles-and-go/partenaires', '/de-de/miles-and-go/partner', '/pt-br/miles-and-go/parceiros/'].forEach((p) => assert.equal(mod.isPickerPage(p), true, p));
  ['/pt-pt/stopover/parceiros', '/en-pt/miles-and-go', '/en-pt/miles-and-go/partners/avis', '/en-pt/help'].forEach((p) => assert.equal(mod.isPickerPage(p), false, p));
  assert.equal(mod.isPickerPage('/fr-fr/aide/questions-frequentes'), true, 'the FAQ page still');
});

test('a picker built in a fragment (a market\'s categories: loadFragment decorates them in a main of its own) names its pills after the page\'s title', async () => {
  const { document, mod } = await load();
  const frag = document.createElement('main');
  frag.innerHTML = '<div class="section"><div class="default-content-wrapper"><h2 id="hotels">Hotels</h2><h3 id="airbnb">Airbnb</h3></div><div class="accordion-columns-wrapper"><div class="accordion-columns faq block"><details><summary>Earn miles</summary></details></div></div></div>';
  mod.buildFaqPicker(frag);
  assert.equal(frag.querySelector('.faq-picker-categories').getAttribute('aria-label'), 'Frequently asked questions');
  assert.equal(frag.querySelectorAll('.faq-picker-tab').length, 1);
});
