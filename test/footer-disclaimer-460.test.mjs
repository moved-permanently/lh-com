/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* www's footer disclaimer (brief 460; .footerdisclaimer, new at the end of www's de/en homepage on
   2026-11-06): the importer makes the note small print and the "General Conditions" button a link
   to the locale's dialog document /de/en/fragments/modals/general-conditions (scripts/fragment-dialog.js
   opens it as a dialog, as www its maui-modal); the conditions leave the page and become that
   document (the label as its H2), which the fragment auto-block leaves to fragment-dialog.js.
   lufthansa.com's look: the link 14 px bold with www's dialog icon.
   Run: node --max-old-space-size=256 --test test/footer-disclaimer-460.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
/* global globalThis */
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';
import {
  dialogDocument, dialogPath, localeBase, readFooterDisclaimer, slugify,
} from '../tools/importer/footer-disclaimer.js';

const fixture = fs.readFileSync(new URL('./fixtures/footer-disclaimer/de-en-homepage.html', import.meta.url), 'utf8');
const NOTE = '*The prices incl. all taxes, fees, carrier surcharges may vary and serve as a guide for your selection.';
const doc = (html) => parseHTML(`<html><body><main>${html}</main></body></html>`).document;

// the page metadata (afterTransform) only needs a table
globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (document) => document.createElement('table') } };
const URL_DE_EN = 'https://www.lufthansa.com/de/en/homepage';
const page = (html) => parseHTML(`<html><head><title>T | Lufthansa</title></head><body><main><div class="section">${html}</div></main></body></html>`).document;
const cleanup = (html) => {
  const document = page(html);
  const payload = { document, url: URL_DE_EN, params: { originalURL: URL_DE_EN } };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  return document;
};

test('the page (lufthansa-cleanup): the note as small print, the button a link to the dialog document', () => {
  const document = cleanup(fixture);
  const ps = [...document.querySelectorAll('p')].filter((p) => p.textContent.trim());
  assert.equal(ps.length, 2);
  assert.equal(ps[0].textContent, `${NOTE} {copytext-small}`);
  const a = ps[1].querySelector('a');
  assert.ok(ps[1].children.length === 1 && a.textContent === 'General Conditions' && ps[1].textContent === 'General Conditions');
  assert.equal(a.getAttribute('href'), '/de/en/fragments/modals/general-conditions');
  assert.equal(a.getAttribute('href'), dialogPath(readFooterDisclaimer(doc(fixture)), '/de/en/homepage'));
  assert.ok(!document.querySelector('.footerdisclaimer, maui-modal, maui-link-button'));
  assert.ok(!document.body.textContent.includes('The prices displayed may vary'));
});

test('the dialog document: the label as H2, the conditions as paragraphs', () => {
  const html = dialogDocument(doc(fixture));
  assert.ok(html.startsWith('<div><h2>General Conditions</h2><p>The prices displayed may vary and should serve as a guide for your selected journey. '));
  assert.ok(html.endsWith('Minimum stay/maximum stay and/or advanced purchase might apply.</p></div>\n'));
  assert.equal((html.match(/<p>/g) || []).length, 1);
});

test('no disclaimer, no locale, no modal', () => {
  assert.equal(dialogDocument(doc('<p>x</p>')), null);
  assert.equal(readFooterDisclaimer(doc('<p>x</p>')), null);
  assert.equal(localeBase('/content/lh/markets/de/en/homepage'), null);
  assert.equal(localeBase('/gb/en'), '/gb/en');
  assert.equal(dialogPath(readFooterDisclaimer(doc(fixture)), '/lhg/x'), null);
  const bare = cleanup('<div class="footerdisclaimer section"><div class="footer-disclaimer"><div class="disclaimer-text"><span>Only the note.</span></div></div></div>');
  assert.deepEqual([...bare.querySelectorAll('p')].map((p) => p.textContent), ['Only the note. {copytext-small}']);
  assert.equal(slugify('Allgemeine Geschäftsbedingungen'), 'allgemeine-geschaftsbedingungen');
});

test('lufthansa.com: a dialog link alone in its paragraph, 14 px bold with the dialog icon', () => {
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const A = 'body.brand-lufthansa main .default-content-wrapper p.link-wrapper a:any-link[href*="/modals/"]';
  assert.ok(css.includes(`${A} { gap: 6px; color: var(--link-color); font-size: var(--body-font-size-xs); font-weight: 700; line-height: 1.5; }`));
  assert.ok(css.includes(`${A}::before { width: 12px; height: 12px; mask-image: url(`));
});

test('a dialog link under /fragments/ is not loaded into the page as a fragment', () => {
  const js = fs.readFileSync(new URL('../scripts/scripts.js', import.meta.url), 'utf8');
  assert.ok(js.includes(".filter((f) => !f.closest('.fragment, .stage-promotions') && !/\\/modals\\//.test(f.pathname));"));
});

test('lufthansa.com: the disclaimer spaced as www\'s (73 / 53 px above, 6 px between, 24 px to the footer)', () => {
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const D = 'p.copytext-small + p.link-wrapper:last-child a[href*="/modals/"]';
  assert.ok(css.includes(`body.brand-lufthansa main > .section:last-child:has(> .default-content-wrapper:last-child > ${D}) { margin-bottom: 24px; }`));
  assert.ok(css.includes(`body.brand-lufthansa main > .section:last-child > div + .default-content-wrapper:last-child:has(> ${D}) { margin-top: 53px; }`));
  assert.ok(css.includes('body.brand-lufthansa main > .section:last-child > .default-content-wrapper:last-child > p.copytext-small:has(+ p.link-wrapper:last-child a[href*="/modals/"]) { margin-bottom: 6px; }'));
  assert.ok(css.includes(`@media (width >= 768px) { body.brand-lufthansa main > .section:last-child > div + .default-content-wrapper:last-child:has(> ${D}) { margin-top: 73px; } }`));
});
