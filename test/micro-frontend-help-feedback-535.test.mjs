/* eslint-disable max-len */
/* The help app's feedback question in its place (the brief after 531, item 1: swiss-parity-003 /ch/en/help-center,
   ita-parity-003 /it/en/help-and-contact): www's help-center-web renders the questionnaire ("Is there a topic missing?")
   in its own div.feedback-form-container, between the topic list and the FAQs card (light DOM, Tealium loads
   feedback-questionnaire into it). On our hosts the questionnaire stays empty (the Travel ID service refuses them) and
   the page's feedback block (the importer's copy of the rendered questionnaire) came after the whole app, under the
   FAQs card. The block moves the feedback block that follows it in its section into that container once the app has
   drawn it (placeInSlots, the app's slots); without the container or the block nothing moves.
   Run: node --max-old-space-size=512 --test test/micro-frontend-help-feedback-535.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'ita.turnsthe.page', pathname: '/', search: '', replace: () => {}, href: 'https://ita.turnsthe.page/', origin: 'https://ita.turnsthe.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { APPS, placeInSlots } = await import('../blocks/micro-frontend/micro-frontend.js');

// the section as the page has it once the app has drawn its topic selection (ITA's help-and-contact)
const sectionOf = ({ slot = true, feedback = true } = {}) => {
  const main = document.createElement('main');
  main.innerHTML = `<div class="section"><div class="micro-frontend-wrapper"><div class="micro-frontend"><help-center-web><div id="help-center-web"><div class="help-center-container topic-selection"><div class="topic-selection-topic-list-container"></div>${slot ? '<div class="feedback-form-container" data-qm-block="true"><feedback-questionnaire class="maui-theme-az"></feedback-questionnaire></div>' : ''}<div class="topic-selection-info-cards-container full-width-bg"></div></div></div></help-center-web></div></div>${feedback ? '<div class="feedback-wrapper"><div class="feedback"><div class="feedback-label">Is there a topic missing?</div></div></div>' : ''}</div><div class="section"><div class="feedback-wrapper"><div class="feedback"></div></div></div>`;
  return main;
};

test('help-center-web names its feedback slot', () => {
  assert.deepEqual(APPS['help-center-web'].slots, [{ block: 'feedback', slot: '.feedback-form-container' }]);
});

test('the feedback block after the app goes into the app\'s feedback container, before the FAQs card', () => {
  const main = sectionOf();
  const block = main.querySelector('.micro-frontend');
  const app = main.querySelector('help-center-web');
  assert.equal(placeInSlots(app, block, APPS['help-center-web'].slots), 1);
  const slot = app.querySelector('.feedback-form-container');
  assert.ok(slot.querySelector(':scope > .feedback-wrapper > .feedback'), 'in the container');
  assert.equal(slot.nextElementSibling.className, 'topic-selection-info-cards-container full-width-bg', 'before the FAQs card');
  const first = main.querySelector('.section');
  assert.equal(first.querySelectorAll(':scope > .feedback-wrapper').length, 0, 'not after the app any more');
  assert.equal(main.querySelectorAll('.section')[1].querySelectorAll('.feedback').length, 1, 'another section\'s block stays');
  assert.equal(placeInSlots(app, block, APPS['help-center-web'].slots), 0, 'once');
});

test('nothing moves without the container (the app has not drawn it yet) or without a feedback block', () => {
  let main = sectionOf({ slot: false });
  assert.equal(placeInSlots(main.querySelector('help-center-web'), main.querySelector('.micro-frontend'), APPS['help-center-web'].slots), 0);
  assert.equal(main.querySelector('.section').querySelectorAll(':scope > .feedback-wrapper').length, 1);
  main = sectionOf({ feedback: false });
  assert.equal(placeInSlots(main.querySelector('help-center-web'), main.querySelector('.micro-frontend'), APPS['help-center-web'].slots), 0);
  assert.equal(main.querySelector('.feedback-form-container .feedback'), null);
  assert.equal(placeInSlots(null, main.querySelector('.micro-frontend'), APPS['help-center-web'].slots), 0, 'no element');
  assert.equal(placeInSlots(main.querySelector('help-center-web'), main.querySelector('.micro-frontend'), undefined), 0, 'an app without slots');
});
