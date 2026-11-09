/* eslint-disable max-len, import/extensions */
/* SWISS homepages, the fares conditions once, in the destination finder's Conditions row (the brief
   after 514, item 2; ema-cashub's sweep-swiss-cashub.md rows 10, 12 and 34). swiss-import.mjs
   withFinderConditions, after the import:
   - /us/en/homepage (our re-import of its snapshot with import-homepage.bundle.js): the parser put
     the winter sports offer's dialog into the finder's Conditions row (the fare teasers before it
     were blocks already, so its place among the components with conditions shifted); the general
     conditions were nowhere on the page. The finder's own dialog, read from the untouched snapshot,
     takes the row.
   - /de/de/homepage as published (imported before the footer disclaimer became a link to its dialog
     document, 75c9418e): the dialog's text also as page text after the block, 612 px at 390. Its
     paragraph leaves the page flow; the note and the label stay (www shows them).
   Fixtures: trimmed from the recorded homepages' snapshots (brief 503's swiss-snapshots) and our documents.
   Run: node --max-old-space-size=512 --test test/swiss-conditions-copy-518.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { withFinderConditions } from '../tools/importer/swiss-import.mjs';

const read = (f) => fs.readFileSync(new URL(`./fixtures/swiss-conditions/${f}`, import.meta.url), 'utf8');
const count = (s, n) => s.split(n).length - 1;
// where a text is: the finder's Conditions row, another block, or the page flow
const places = (doc, needle) => {
  const { document } = parseHTML(`<main>${doc}</main>`);
  return [...document.querySelectorAll('p')].filter((p) => p.textContent.includes(needle)).map((p) => {
    const block = p.closest('main > div > div[class]');
    if (!block) return 'page flow';
    const row = [...block.children].find((r) => r.contains(p));
    return `${block.className.split(' ')[0]} ${row.children[0].textContent.trim()}`;
  });
};

const US = { doc: read('us-en-homepage-reimport.plain.html'), snap: read('us-en-homepage-snapshot.html') };
const DE = { doc: read('de-de-homepage.plain.html'), snap: read('de-de-homepage-snapshot.html') };
const GENERAL_EN = 'The prices displayed may vary and should serve as a guide for your selected journey';
const WINTER = 'Passengers are entitled to one piece of winter sports equipment';
const GENERAL_DE = 'Die angezeigten Preise können abweichen und dienen als Orientierungshilfe';

test('/us/en/homepage re-imported: the finder\'s Conditions row held another offer\'s dialog', () => {
  assert.deepEqual(places(US.doc, GENERAL_EN), []);
  assert.deepEqual(places(US.doc, WINTER), ['destination-finder Conditions']);
});

test('/us/en/homepage: the general conditions once, in the finder\'s Conditions row, and nowhere else', () => {
  const { doc, made } = withFinderConditions(US.doc, US.snap);
  assert.equal(made, 1);
  assert.deepEqual(places(doc, GENERAL_EN), ['destination-finder Conditions']);
  assert.deepEqual(places(doc, WINTER), []);
  // the trigger's label first; the footer disclaimer's note and its link to the dialog document as they were
  assert.match(doc, /<div>Conditions<\/div>\s*<div><p><strong>Conditions<\/strong><\/p><p>The prices displayed may vary/);
  assert.equal(count(doc, '<a href="/us/en/fragments/modals/general-conditions">General Conditions</a>'), 1);
  assert.equal(count(doc, '*The prices incl. all taxes'), count(US.doc, '*The prices incl. all taxes'));
});

test('/de/de/homepage as published: the conditions once, in the finder\'s Conditions row, and nowhere else', () => {
  assert.deepEqual(places(DE.doc, GENERAL_DE), ['destination-finder Conditions', 'page flow']);
  const { doc, made } = withFinderConditions(DE.doc, DE.snap);
  assert.equal(made, 1);
  assert.deepEqual(places(doc, GENERAL_DE), ['destination-finder Conditions']);
  // only that paragraph left the page: the note and the label stay, the next section as it was
  const flat = (s) => s.replace(/&(?:#x26|amp);/g, '&').replace(/\s+/g, '');
  assert.equal(flat(doc), flat(DE.doc.replace(/\s*<p>Die angezeigten Preise[^<]*\{full-width\}<\/p>/, '')));
});

test('as they are: a document already right, a page without the finder, a snapshot without its dialog', () => {
  const right = withFinderConditions(US.doc, US.snap).doc;
  assert.deepEqual(withFinderConditions(right, US.snap), { doc: right, made: 0 });
  const noFinder = '<div><h2>Looking for more than just a flight?</h2><p>The prices displayed may vary and should serve as a guide for your selected journey.</p></div>';
  assert.equal(withFinderConditions(noFinder, US.snap).doc, noFinder);
  const noDialogs = US.snap.replace(/<maui-modal[^>]*class="modal-size-l"[\s\S]*?<\/maui-modal>/g, '');
  assert.equal(withFinderConditions(US.doc, noDialogs).doc, US.doc);
});
