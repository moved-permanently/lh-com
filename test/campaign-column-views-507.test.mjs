/* eslint-disable max-len */
/* Brief 507 item 1, /de/en/frankfurt-fair at 1440 (16.9 %): 9 of lufthansa.com's 21 campaign pages are one AEM section of
   column views (frankfurt-fair, munich-fair, take-off, the stopover partner pages, most-significant-route, both
   culinaryjourney pages): campaign-sections takes an AEM section only where a page has more than one, so these got no
   sections, and the cleanup marks column views only on info and fleet pages: www's 3.2rem around each view was lost
   (frankfurt-fair: text -> heading 88 px on www, 40 here; tiles -> text columns 80, 26). The campaign template now runs
   hub-column-views too, on a page without campaign sections only (campaign-sections' section breaks: hr with
   data-excat-section-source-style "campaign-section ..."); pages with campaign sections keep their own spacing.
   Run: node --max-old-space-size=256 --test test/campaign-column-views-507.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

globalThis.WebImporter = { Blocks: { createBlock: (document) => document.createElement('table') } };
const { default: hubColumnViews } = await import('../tools/importer/transformers/hub-column-views.js');

const view = (title) => `<div class="onecolumn column section"><div class="column-view flex-column"><div class="row"><div class="col-lg column-view-item"><div class="headline"><h2>${title}</h2></div><div class="text"><div class="richtext"><p>Text of ${title}</p></div></div></div></div></div></div>`;
const page = (breaks) => `<html><body><div class="container-content">${breaks}<div class="section"><div class="section-content container-fluid section-regular">${view('The benefits')}${view('Lufthansa Mobility')}</div></div></div></body></html>`;
const CAMPAIGN = { name: 'campaign', blocks: [] };
const marked = (html) => {
  const { document } = parseHTML(html);
  hubColumnViews('beforeTransform', document.body, { document, template: CAMPAIGN });
  return document.querySelectorAll('[data-lh-column]').length;
};

test('a campaign page without campaign sections: its column views are marked as on hub pages', () => {
  assert.equal(marked(page('')), 2);
});

test('on a campaign page a multi-column text view the import stacks is not marked (munich-fair: 13.2 -> 20.9 % with it)', () => {
  const two = '<div class="twocolumn column event"><div class="column-view flex-column"><div class="row"><div class="col-md-6 col-lg column-view-item"><div class="headline"><h2>Messe München events</h2></div></div><div class="col-md-6 col-lg column-view-item"><div class="headline"><h2>Lufthansa Mobility</h2></div></div></div></div></div>';
  assert.equal(marked(page('').replace('<div class="section-content container-fluid section-regular">', `<div class="section-content container-fluid section-regular">${two}`)), 2);
  const { document } = parseHTML(page('').replace('<div class="section-content container-fluid section-regular">', `<div class="section-content container-fluid section-regular">${two}`));
  hubColumnViews('beforeTransform', document.body, { document, template: CAMPAIGN });
  assert.equal(document.querySelector('.twocolumn').hasAttribute('data-lh-column'), false);
});

test('a campaign page with campaign sections keeps its own spacing (nothing marked)', () => {
  assert.equal(marked(page('<hr data-excat-section-break="" data-excat-section-source-style="campaign-section spaced">')), 0);
});

test('the campaign template runs hub-column-views (page-templates.json, import-campaign.js)', () => {
  const t = JSON.parse(fs.readFileSync('tools/importer/page-templates.json', 'utf8'));
  const campaign = (t.templates || t).find((x) => x.name === 'campaign');
  assert.ok(campaign.transformers.includes('hub-column-views'));
  assert.ok(/import hubColumnViewsTransformer from '\.\/transformers\/hub-column-views\.js';/.test(fs.readFileSync('tools/importer/import-campaign.js', 'utf8')));
});
