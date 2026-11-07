/* Lufthansa Group for Business' importer (tools/importer/b2b-import.mjs withPageHeading, the brief
   after 463, item 2): a document without an h1 (the airlines-at-a-glance pages: the stage's logo,
   then "<Airline> Products & Services" as an h2) gets its first h2 as the page's h1, its id and its
   size marker ({heading-small …}) kept, so it looks as before; a document with an h1 or without an
   h2 as it is. The importer runs it on every document.
   Run: node --max-old-space-size=384 --test test/b2b-page-heading.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// eslint-disable-next-line import/extensions
const { withPageHeading } = await import('../tools/importer/b2b-import.mjs');

test('no h1: the first h2 becomes the h1, its attributes and markers kept; the others stay h2', () => {
  const doc = '<div><p>{column-start-outer}</p><div class="columns-media"><div><div><picture><img src="logo.png" alt=""></picture></div></div></div></div><div><h2 id="discover-airlines-products--services">Discover Airlines Products &#x26; Services {heading-small column-start-outer}</h2><p>Text</p><h2>More</h2></div>';
  const out = withPageHeading(doc);
  assert.ok(out.includes('<h1 id="discover-airlines-products--services">Discover Airlines Products &#x26; Services {heading-small column-start-outer}</h1>'), out);
  assert.ok(out.includes('<h2>More</h2>'), 'the next h2 stays');
  assert.equal((out.match(/<h1[\s>]/g) || []).length, 1);
});

test('an h1 already, or no h2: as it is', () => {
  const withH1 = '<div><h1>Welcome to eXperts</h1><h2>News</h2></div>';
  assert.equal(withPageHeading(withH1), withH1);
  const none = '<div><p>Only text</p><h3>Small</h3></div>';
  assert.equal(withPageHeading(none), none);
});

test('the importer runs it on every document, after the other passes', () => {
  const js = fs.readFileSync('tools/importer/b2b-import.mjs', 'utf8');
  assert.match(js, /const next = withPageHeading\(withEndSpacer\(/);
});
