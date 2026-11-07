/* eslint-disable max-len, import/extensions */
/* SWISS row 30's last sidebars (brief 445, item 4), tools/importer/swiss-sidebar.mjs:
   - www's first heading not an h1: the document's h1 (the page title) is not the sidebar's start
     (children at the airport, excess baggage: the title opens with the sidebar's heading);
   - the sidebar's first text inside a block (an FAQ accordion's first answer, the booking login's
     text): the content starts at that block;
   - lh-com's columns-media sidebar block whose content cell is text alone: a paragraph, the block
     flattened, also when the search found the block itself;
   - a sidebar without an aside ends before the next sidebar's start (both end with the same link)
     and at its last text the document has, with the text-less blocks after it (a fare teaser);
   - www's video player's controls ("Subtitles off, selected") are no aside text;
   - a document with nothing but its title gets the sidebar's accordions after it (withSwissAccordions),
     and the sidebar starts at its first text the document has (www's live notices are none).
   Run: node --max-old-space-size=512 --test test/swiss-sidebar-445.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { withSwissSidebar, withSwissAccordions } from '../tools/importer/swiss-sidebar.mjs';

const snap = (...sidebars) => `<html><body><div class="contentpage">${sidebars.map(([content, aside = '']) => `<div class="airem-sidebar"><div class="sidebar-content">${content}</div><div class="sidebar-aside">${aside}</div></div>`).join('')}</div></body></html>`;
const sections = (doc) => {
  const { document } = parseHTML(`<main>${doc.match(/<main>([\s\S]*)<\/main>/)[1]}</main>`);
  return [...document.querySelector('main').children].map((s) => [...s.children].map((c) => (c.className ? `${c.className}${c.className === 'section-metadata' ? `:${c.textContent}` : ''}` : `${c.tagName.toLowerCase()}:${c.textContent.slice(0, 16)}`)));
};
const doc = (...secs) => `<body><header></header><main>${secs.map((s) => `<div>${s}</div>`).join('')}</main><footer></footer></body>`;

test('www\'s first heading an h2: the document\'s h1 is not the start', () => {
  const html = snap(['<h2>At the airport</h2><p>Go exploring with your children to help pass the time.</p>', '<h3>Travelling with children</h3><ul><li><a href="/x">Overview of travelling</a></li></ul>']);
  const r = withSwissSidebar(doc('<h1>At the airport with children</h1><h2>At the airport {heading-small}</h2><p>Go exploring with your children to help pass the time.</p><h2>Travelling with children {heading-copytext-large}</h2><ul><li><a href="/x">Overview of travelling</a></li></ul>'), html);
  assert.equal(r.made, 1, r.skipped.join());
  const s = sections(r.doc);
  assert.deepEqual(s[0], ['h1:At the airport w']);
  assert.equal(s[1][0], 'h2:At the airport {');
  assert.ok(s[2].includes('section-metadata:Stylesidebar-aside'));
});

test('the first text inside a block (an FAQ accordion\'s first answer): the content starts at the block', () => {
  const html = snap(['<maui-collapsible><maui-collapsible-item headline="Which cards?"><div class="richtext"><p>It is especially easy to pay with your credit card online.</p></div></maui-collapsible-item></maui-collapsible><p><a href="/y">Visit payment options at the airport</a></p>']);
  const r = withSwissSidebar(doc('<h1>Payment options</h1><div class="accordion-columns faq"><div><div>Which cards?</div><div><p>It is especially easy to pay with your credit card online.</p></div></div></div><p><a href="/y">Visit payment options at the airport</a></p>'), html);
  assert.equal(r.made, 1, r.skipped.join());
  const s = sections(r.doc);
  assert.deepEqual(s[0], ['h1:Payment options']);
  assert.deepEqual(s[1].slice(0, 2), ['accordion-columns faq', 'p:Visit payment op']);
});

test('lh-com\'s columns-media sidebar block with a text-only content cell: flattened, the text a paragraph', () => {
  const fares = 'Fares apply for one return ticket flight, SWISS Business from Geneva, all taxes included.';
  const html = snap([`<div class="richtext"><p>${fares}</p></div>`, '<h2>SWISS Business</h2><p>An exclusive service awaits you on board.</p>']);
  const r = withSwissSidebar(doc(`<h1>Offer 6</h1><div class="columns-media sidebar"><div><div>${fares}</div><div><h2>SWISS Business {heading-small}</h2><p>An exclusive service awaits you on board.</p></div></div></div>`), html);
  assert.equal(r.made, 1, r.skipped.join());
  const s = sections(r.doc);
  assert.deepEqual(s[1], ['p:Fares apply for ']);
  assert.deepEqual(s[2].slice(0, 2), ['h2:SWISS Business {', 'p:An exclusive ser']);
  assert.ok(r.doc.includes(`<p>${fares}</p>`));
});

test('two sidebars without an aside ending with the same link: the first ends before the second\'s start', () => {
  const link = '<p><a href="https://www.iatatravelcentre.com/">Visit the IATA Travel Centre website</a></p>';
  const html = snap([`<p>The Schengen agreement regulates freedom of movement.</p>${link}`], [`<p>List of current Schengen member states:</p><ul><li>Austria</li></ul>${link}`]);
  const r = withSwissSidebar(doc(`<h1>Schengen</h1><p>The Schengen agreement regulates freedom of movement.</p>${link}<p>List of current Schengen member states:</p><ul><li>Austria</li></ul>${link}`), html);
  assert.equal(r.made, 2, r.skipped.join());
  const s = sections(r.doc).filter((x) => !x.includes('section-metadata:Stylesidebar-aside'));
  assert.ok(s.some((x) => x[0] === 'p:The Schengen agr' && x.length === 2), JSON.stringify(s));
  assert.ok(s.some((x) => x[0] === 'p:List of current '), JSON.stringify(s));
});

test('a sidebar ending with www\'s price teaser: its last text the document has, the fare-teaser block after it with it', () => {
  const html = snap(['<h2>The efficient</h2><p>When you go on a trip, organisation matters most.</p><div class="fareteaser"><p>GenevaMalaga</p></div>']);
  const r = withSwissSidebar(doc('<h1>Traveller profile</h1><h2>The efficient {heading-small}</h2><p>When you go on a trip, organisation matters most.</p><div class="fare-teaser"><div><div>origin</div><div></div></div></div><p>Next part of the page</p>'), html);
  assert.equal(r.made, 1, r.skipped.join());
  const s = sections(r.doc);
  assert.deepEqual(s[1], ['h2:The efficient {h', 'p:When you go on a', 'fare-teaser']);
});

test('www\'s video player controls are no aside text', () => {
  const html = snap(['<h2>More seats</h2><p>Both lounges extend over an entire floor.</p>', '<div class="video-js"><div class="vjs-control-bar"><span class="vjs-control-text">Subtitles off, selected</span></div></div><h3>A look behind the scenes</h3><p><a href="/v">To the mini video series</a></p>']);
  const r = withSwissSidebar(doc('<h1>New lounges</h1><h2>More seats</h2><p>Both lounges extend over an entire floor.</p><h3>A look behind the scenes</h3><p><a href="/v">To the mini video series</a></p>'), html);
  assert.equal(r.made, 1, r.skipped.join());
  assert.deepEqual(sections(r.doc)[2].slice(0, 2), ['h3:A look behind th', 'p:To the mini vide']);
});

test('a document with only its title: the sidebar\'s accordion after it (after the message center), the sidebar from its first text the document has', () => {
  const html = snap(['<div class="messagecenterwrapper"><maui-collapsible-item class="mcm-critically-high"><div class="richtext"><p>In light of the current situation flights to Dubai are postponed.</p></div></maui-collapsible-item></div>'
    + '<div class="accordion"><maui-collapsible><div class="accordionitem"><maui-collapsible-item headline="Important information for guests with baggage irregularities"><div><div class="text"><div class="richtext"><p>For guests with current baggage delivery irregularities, see "<a href="/ch/en/prepare/baggage/baggage-irregularities"><em class="lh lh-arrow-right">​</em>​Problems with your baggage</a>".</p></div></div></div></maui-collapsible-item></div>'
    + '<div class="accordionitem"><maui-collapsible-item headline="Fast assistance in case of flight irregularities"><div><div class="richtext"><p>We have summarized the most important issues: "<a href="https://www.swiss.com/ch/en/fly/flight-information/flight-irregularities" target="_blank"><em class="lh lh-arrow-right">​</em>Fast assistance<span class="sr-only">The link will be opened in a new browser tab</span></a>"</p></div></div></maui-collapsible-item></div></maui-collapsible></div>']);
  const page = doc('<h1>Current information</h1><div class="message-center"></div>', '<div class="metadata"><div><div>markets</div><div>ae/en</div></div></div>');
  const a = withSwissAccordions(page, html);
  assert.equal(a.made, 1);
  assert.ok(a.doc.includes('<h1>Current information</h1><div class="message-center"></div><div class="accordion-columns"><div><div>Important information for guests with baggage irregularities</div><div><p>For guests with current baggage delivery irregularities, see "<a href="/ch/en/prepare/baggage/baggage-irregularities">Problems with your baggage</a>".</p></div></div><div><div>Fast assistance in case of flight irregularities</div><div><p>We have summarized the most important issues: "<a href="/ch/en/fly/flight-information/flight-irregularities">Fast assistance</a>"</p></div></div></div>'), a.doc);
  assert.equal(withSwissAccordions(a.doc, html).made, 0, 'once');
  const r = withSwissSidebar(a.doc, html);
  assert.equal(r.made, 1, r.skipped.join());
  const s = sections(r.doc);
  // the message center in the content's column, its first (brief 455: www's content opens with it)
  assert.deepEqual(s[0], ['h1:Current informat']);
  assert.deepEqual(s[1], ['message-center', 'accordion-columns']);
  assert.ok(r.doc.includes('<div>markets</div><div>ae/en</div>'), 'the metadata kept');
});

test('a document with more than its title: an accordion it lacks entirely is not added', () => {
  const html = snap(['<div class="accordion"><maui-collapsible><div class="accordionitem"><maui-collapsible-item headline="Q"><div class="richtext"><p>An answer the document does not have at all.</p></div></maui-collapsible-item></div></maui-collapsible></div>']);
  const page = doc('<h1>Title</h1><p>Some text of the page.</p>');
  const a = withSwissAccordions(page, html);
  assert.equal(a.made, 0);
  assert.equal(a.doc, page);
});
