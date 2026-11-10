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

test('an h2 without a size marker keeps the h2 size as the h1: {heading-medium} (in its marker group, or added)', () => {
  // (an unmarked h1 is the page title's size: 42 px light capitals on B2B; an unmarked h2 is
  // heading-medium)
  const plain = withPageHeading('<div><h2 id="dangerous-goods">Gefährliche Gegenstände</h2><p>Text</p></div>');
  assert.ok(plain.includes('<h1 id="dangerous-goods">Gefährliche Gegenstände {heading-medium}</h1>'), plain);
  const grouped = withPageHeading('<div><h2>Route network {column-start-outer}</h2></div>');
  assert.ok(grouped.includes('<h1>Route network {heading-medium column-start-outer}</h1>'), grouped);
  const sized = withPageHeading('<div><h2>Airlines at a Glance {heading-large}</h2></div>');
  assert.ok(sized.includes('<h1>Airlines at a Glance {heading-large}</h1>'), sized);
});

test('a marker the import\'s collapse dropped: the size of www\'s heading of that text', () => {
  // the standing order of 2026-11-10 evening, decision 3: the import collapses in the browser
  // before this step, so the airline pages' {heading-small} was gone and the title grew to
  // heading-large
  const html = '<div class="column-view"><div><h2 class="heading-small ">&nbsp;Air Dolomiti&nbsp;Produkte &amp; Services</h2></div><h4 class="heading-copytext-large teaser-heading">Reiseklassen</h4></div>';
  const out = withPageHeading('<div><h2 id="t">Air Dolomiti Produkte &#x26; Services</h2><h2>Reiseklassen</h2></div>', html);
  assert.ok(out.includes('<h1 id="t">Air Dolomiti Produkte &#x26; Services {heading-small}</h1>'), out);
  const other = withPageHeading('<div><h2>Another title</h2></div>', html);
  assert.ok(other.includes('<h1>Another title {heading-medium}</h1>'), 'no www heading of that text: heading-medium as before');
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
