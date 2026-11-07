/* eslint-disable max-len, import/extensions -- dev tooling */
/* Austrian's import (item 3 of the brief after 464, /at/en/sustainable-flying, read by dk/en and se/en too): www writes
   section headings as h1 (h1.headline.heading-copytext-large), so the version document had four h1 and the page four
   main headings; the page title is the one. withOneH1 keeps a document's first h1 and writes every later one as h2 with
   its size: the {heading-…} marker it has, else {heading-large} (an h1's own size), so the page looks as before.
   Run: node --max-old-space-size=256 --test test/austrian-one-h1.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { withOneH1 } from '../tools/importer/austrian-import.mjs';

test('the first h1 stays; later ones become h2 with their size marker, or the h1 size', () => {
  const doc = '<div><h1 id="fly">Fly more sustainably with us</h1><p>Intro</p></div>\n<div><h1 id="saf">Reduce your CO₂ {heading-copytext-large}</h1><p>A</p><h1 id="plain">Plain heading</h1></div>';
  assert.equal(withOneH1(doc), '<div><h1 id="fly">Fly more sustainably with us</h1><p>Intro</p></div>\n<div><h2 id="saf">Reduce your CO₂ {heading-copytext-large}</h2><p>A</p><h2 id="plain">Plain heading {heading-large}</h2></div>');
});

test('an h1 that ends in another marker gets the size inside it (scripts.js reads one trailing marker)', () => {
  assert.equal(
    withOneH1('<div><h1>FAQ</h1><h1 id="lounges">Lounges {column-start}</h1><h1>B {column-start heading-medium}</h1></div>'),
    '<div><h1>FAQ</h1><h2 id="lounges">Lounges {heading-large column-start}</h2><h2>B {column-start heading-medium}</h2></div>',
  );
});

test('a document with one h1 or none as it was', () => {
  const one = '<div><h1>Title</h1><h2>Section</h2></div>';
  assert.equal(withOneH1(one), one);
  assert.equal(withOneH1('<div><p>No title</p></div>'), '<div><p>No title</p></div>');
});

test('the import\'s post chain applies it', () => {
  const src = fs.readFileSync('tools/importer/austrian-import.mjs', 'utf8');
  assert.match(src, /const next = withOneH1\(withChatButton\(/);
});
