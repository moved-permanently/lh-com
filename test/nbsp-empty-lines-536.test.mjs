/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 530, item 1 (the empty lines, decided by numbers): www keeps empty lines as a paragraph holding only a
   no-break space (<p>&nbsp;</p>). The ones at the top of a text or in a sidebar show on www: about 40 px a line on Brussels
   (families-and-children 1440 -50 / 390 -39 px at each, our-fleet -50 / -30, travel-regulations -44 / -40), 48 on Austrian
   (extra-services -48 / -60): 1 % of the page or more on four recorded pages. The ones inside a tab or accordion panel
   show nothing at 1440 (business, gesundes-reisen). The framework drops every such paragraph and a document in DA must not
   carry empty paragraphs that stand in for spacing, so the brand importers write the spacing marker the collapse turns
   into a Spacer block instead: emptyLineSpacers (nbsp-guard.mjs) on the snapshot, before the import, a run of n visible
   empty lines as one {spacer-(n x size)} paragraph. A <p>&nbsp;</p> left (in a panel, or anywhere on lufthansa.com) is
   still dropped by the framework, as test/nbsp-guard-530.test.mjs proves.
   Markup: the recordings of www.brusselsairlines.com/be/fr/special-care/families-and-children and travel-classes/business
   (brief 497), trimmed. Run: node --max-old-space-size=256 --test test/nbsp-empty-lines-536.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { emptyLineSpacers, guardNbsp } from '../tools/importer/nbsp-guard.mjs';

const NB = String.fromCharCode(0xa0);
const sidebar = '<div class="sidebar event"><div class="airem-sidebar"><div class="sidebar-content"><div class="text section"><div class="richtext  "><p>&nbsp;</p><p class="copytext-large">Prendre l’avion avec des enfants peut s’avérer fastidieux.</p><p>&nbsp;</p></div></div></div></div></div>';
const tabs = '<div class="tabs"><maui-tab-control-panel-responsive><div class="column-view-item"><div class="text section"><div class="richtext"><p>Votre siège se transforme en lit.</p><p>&nbsp;</p></div></div></div></maui-tab-control-panel-responsive></div>';
const accordion = '<div class="accordion"><maui-collapsible-item><div class="accordionitem"><div class="richtext"><ul><li>Gips</li></ul><p>&nbsp;</p></div></div></maui-collapsible-item></div>';
const run2 = '<div class="text section"><div class="richtext"><p>Intro.</p><p>&nbsp;</p><p>&nbsp;</p><p>Weiter.</p></div></div>';
const page = (inner) => `<html><body><main>${inner}</main></body></html>`;

test('a visible empty line (top of a text, a sidebar) becomes one spacer marker of the brand\'s size', () => {
  const out = emptyLineSpacers(page(sidebar), { parse: parseHTML, size: 40 });
  assert.equal((out.match(/<p>\{spacer-40\}<\/p>/g) || []).length, 2);
  assert.ok(!out.includes('<p>&nbsp;</p>'));
  assert.ok(out.includes('<p class="copytext-large">Prendre l’avion avec des enfants peut s’avérer fastidieux.</p>'), 'the rest as it was');
});

test('a run of empty lines is one marker of their sum; the Austrian size 48', () => {
  const out = emptyLineSpacers(page(run2), { parse: parseHTML, size: 48 });
  assert.match(out, /<p>Intro\.<\/p><p>\{spacer-96\}<\/p><p>Weiter\.<\/p>/);
});

test('inside a tab or accordion panel the empty line shows nothing on www: left as it is (the framework drops it)', () => {
  [tabs, accordion].forEach((html) => assert.equal(emptyLineSpacers(page(html), { parse: parseHTML, size: 40 }), page(html)));
});

test('a document without empty lines comes back byte for byte; the guard leaves the marker alone', () => {
  const plain = page('<div class="richtext"><p>Six&nbsp;773&nbsp;km</p></div>');
  assert.equal(emptyLineSpacers(plain, { parse: parseHTML, size: 40 }), plain);
  const { document } = parseHTML(emptyLineSpacers(page(sidebar), { parse: parseHTML, size: 40 }));
  guardNbsp(document.body);
  assert.equal(document.querySelectorAll('p').length, 3);
  assert.equal(document.querySelectorAll('p')[0].textContent, '{spacer-40}');
  assert.ok(!document.body.innerHTML.includes(NB));
});

test('the wiring: Austrian\'s mapped snapshot (48 px) and Brussels\' (40 px)', () => {
  const read = (f) => fs.readFileSync(new URL(`../tools/importer/${f}`, import.meta.url), 'utf8');
  // Austrian's on www's snapshot as captured (scripts stripped), before the panels are rewritten (test/austrian-teaser-cards.test.mjs pins the outer steps)
  assert.match(read('austrian-import.mjs'), /withPlaceholder\(withEmptyLineSpacers\(stripScripts\(html\)\)\)/);
  assert.match(read('austrian-import.mjs'), /const withEmptyLineSpacers = \(html\) => emptyLineSpacers\(html, \{ parse: parseHTML, size: 48 \}\);/);
  assert.match(read('brussels-import.mjs').match(/const mapped = (.*)/)[1], /^withEmptyLineSpacers\(/);
  assert.match(read('brussels-import.mjs'), /const withEmptyLineSpacers = \(html\) => emptyLineSpacers\(html, \{ parse: parseHTML, size: 40 \}\);/);
});
