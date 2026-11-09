/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The footer disclaimer's dialog document name (the brief after 518, item 2): the importer links
   "General Conditions" to /{cc}/{ll}/fragments/modals/{name}, the name the label's slug
   (footer-disclaimer.js slugify; its copy in transformers/lufthansa-cleanup.js, a plain script).
   A label without Latin letters or digits (SWISS's el, ja, ru, zh: "Γενικοί όροι", "一般ご利用条件",
   "Общие условия", "条件") gave an empty name, /ch/ja/fragments/modals/. Such a label now gives the
   root's language (/ch/ja/fragments/modals/ja): never empty, the same however www words the label,
   no table to keep in two copies. Every label with a slug keeps it: lufthansa.com's ("General
   Conditions", "Allgemeine Bedingungen") and the Latin ones of SWISS's snapshots.
   Run: node --max-old-space-size=256 --test test/footer-dialog-names-522.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
/* global globalThis */
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';
import { dialogPath, readFooterDisclaimer } from '../tools/importer/footer-disclaimer.js';

globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (document) => document.createElement('table') } };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const box = (label) => `<div class="footerdisclaimer section"><div class="footer-disclaimer"><div class="disclaimer-text"><span>*Note.</span></div><div class="pt-3"><maui-link-button as="button" variant="dialog" data-target="#cond-modal-footerdisclaimer"><span>${label}</span></maui-link-button><maui-modal class="richtext" id="cond-modal-footerdisclaimer" label="${esc(label)}"><p>The conditions.</p></maui-modal></div></div></div>`;
// the link the import writes (lufthansa-cleanup) and the document general-conditions-dialogs.mjs writes (footer-disclaimer.js)
const both = (host, root, label) => {
  const url = `https://${host}/${root}/homepage`;
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="section">${box(label)}</div></main></body></html>`);
  const payload = { document, url, params: { originalURL: url } };
  const snapshot = parseHTML(`<html><body>${box(label)}</body></html>`).document;
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  return { link: document.querySelector('a[href*="/fragments/modals/"]')?.getAttribute('href'), doc: dialogPath(readFooterDisclaimer(snapshot), `/${root}/homepage`) };
};
// the rule before this change (both copies): the label's slug, empty when nothing is left
const before = (label) => label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

test('lufthansa.com: every label it uses today keeps its name (the link and the document)', () => {
  [['de/en', 'General Conditions'], ['de/de', 'Allgemeine Bedingungen']].forEach(([root, label]) => {
    const want = `/${root}/fragments/modals/${before(label)}`;
    assert.ok(before(label));
    assert.deepEqual(both('www.lufthansa.com', root, label), { link: want, doc: want });
  });
});

test('SWISS: the Latin labels of its snapshots keep their names', () => {
  [['us/en', 'General Conditions'], ['de/de', 'Allgemeine Bedingungen'], ['ch/fr', 'Conditions générales'], ['ch/it', 'Condizioni generali'], ['ch/es', 'Condiciones generales'], ['ch/pt', 'Condições gerais']].forEach(([root, label]) => {
    const want = `/${root}/fragments/modals/${before(label)}`;
    assert.deepEqual(both('www.swiss.com', root, label), { link: want, doc: want });
  });
});

test('SWISS: the ten labels without Latin letters get the root\'s language, the link and the document alike', () => {
  const ten = [['ch/el', 'Γενικοί όροι'], ['ch/ja', '一般ご利用条件'], ['ch/ru', 'Общие условия'], ['ch/zh', '条件'], ['cn/zh', '条件'], ['gr/el', 'Γενικοί όροι'], ['hk/zh', '条件'], ['jp/ja', '一般ご利用条件'], ['ru/ru', 'Общие условия'], ['sg/zh', '条件']];
  ten.forEach(([root, label]) => {
    assert.equal(before(label), '', `${root} was empty`);
    const want = `/${root}/fragments/modals/${root.split('/')[1]}`;
    assert.deepEqual(both('www.swiss.com', root, label), { link: want, doc: want });
  });
  // stable: another wording of the label, the same name
  assert.equal(both('www.swiss.com', 'ch/ja', 'ご利用条件').link, '/ch/ja/fragments/modals/ja');
});
