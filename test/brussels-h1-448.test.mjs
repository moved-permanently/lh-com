/* eslint-disable max-len, import/extensions */
/* Brussels' page headings (tools/importer/brussels-import.mjs withPageH1), brief 448, item 1: every
   document gets one h1.
   - www's own heading where it has one: the market homepages' visually hidden h1 ("Brussels",
     www's header) as the first section's h1 with the section style hidden-heading (Discover's
     withHiddenH1).
   - Where www has none at all (brussels-parity-003 and the Studio captures: the economy and
     premium economy pages, heritage, the ski campaign, three legal and local pages), the page's
     first heading, an h2 (the stage's title on the class pages), becomes the h1, its text, id and
     size marker kept; the Brussels theme styles a stage's title the same at any level.
   - A page with no heading (the feedback forms, the destination search) gets its title (metadata
     Title, without " | Brussels Airlines") as a visually hidden h1.
   A document that has an h1 stays as it is.
   Run: node --max-old-space-size=512 --test test/brussels-h1-448.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { withPageH1 } from '../tools/importer/brussels-import.mjs';

const meta = (title) => `<div><div class="metadata"><div><div>Title</div><div>${title}</div></div></div></div>`;
const HIDDEN = '<div class="section-metadata"><div><div>Style</div><div>hidden-heading</div></div></div>';

test('a document with an h1 stays as it is', () => {
  const doc = `<div><div class="hero-campaign"><div><div><h1>Classe Business</h1></div></div></div></div>\n${meta('Business')}`;
  assert.equal(withPageH1(doc, '<html><body><h1 class="headline">Classe Business</h1></body></html>'), doc);
});

test('www\'s hidden h1 (the homepages): the first section\'s h1, hidden', () => {
  const doc = `<div><div class="flight-search"><div><div>x</div></div></div></div>\n<div><div class="hero-card-overlay"><div><div><h2>Up to 50% off for kids</h2></div></div></div></div>\n${meta('Home')}`;
  const out = withPageH1(doc, '<html><body><header><h1 class="heading-medium sr-only">Brussels</h1></header></body></html>');
  assert.ok(out.startsWith('<div><h1>Brussels</h1><div class="flight-search">'), out);
  assert.ok(out.includes(`${HIDDEN}</div>`));
  assert.ok(out.includes('<h2>Up to 50% off for kids</h2>'), 'the stage teaser keeps its h2');
});

test('no h1 on www: the first heading, an h2, becomes the h1 (id and size marker kept)', () => {
  const doc = `<div><div class="hero-campaign"><div><div><h2 id="economy-class">Economy Class</h2><p>Comfort</p></div></div></div></div>\n<div><h2 id="various">Various fares</h2></div>\n${meta('Economy Class | Brussels Airlines')}`;
  const out = withPageH1(doc, '<html><body><h2 class="headline">Economy Class</h2></body></html>');
  assert.ok(out.includes('<h1 id="economy-class">Economy Class</h1>'), out);
  assert.ok(out.includes('<h2 id="various">Various fares</h2>'), 'the other headings as they are');
  assert.equal((out.match(/<h1/g) || []).length, 1);
  const legal = withPageH1('<div><h2 id="x">Einreise in den „Schengen-Raum“ in Europa {heading-large limited-width}</h2><p>a</p></div>', '<html></html>');
  assert.ok(legal.startsWith('<div><h1 id="x">Einreise in den „Schengen-Raum“ in Europa {heading-large limited-width}</h1>'), legal);
});

test('no heading at all: the page\'s title as a hidden h1', () => {
  const doc = `<div><div class="form"><div><div>x</div></div></div></div>\n${meta('Feedback | Brussels Airlines')}`;
  const out = withPageH1(doc, '<html><body><h3>About us</h3></body></html>');
  assert.ok(out.startsWith('<div><h1>Feedback</h1><div class="form">'), out);
  assert.ok(out.includes(`${HIDDEN}</div>`));
  assert.equal(withPageH1('<div><p>x</p></div>', '<html></html>'), '<div><p>x</p></div>', 'no title, nothing to name it');
});
