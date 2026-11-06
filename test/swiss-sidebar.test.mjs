/* eslint-disable max-len, import/extensions -- dev tooling */
/* SWISS's info pages with www's sidebar component (brief 432, swiss-parity-002: www.swiss.com's
   airem-sidebar, sidebar-content beside sidebar-aside, 75 / 25 from 768 px on 25 of the 60 pages).
   lh-com's import writes it flattened at the full width; tools/importer/swiss-sidebar.mjs, guided by
   the page's snapshot, makes it www's: per sidebar the content a section of its own, then the aside
   a section with the section style sidebar-aside (beside it: scripts/section-aside.js; an empty
   aside keeps the content in the 3 / 4 column); the two-column views (heading, picture, text) the
   heading and a columns-media row. Fixtures: today's DA documents and the snapshots trimmed to their
   sidebars. Run: node --max-old-space-size=512 --test test/swiss-sidebar.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { withSwissSidebar, sidebarsOf } = await import('../tools/importer/swiss-sidebar.mjs');

const fixture = (name) => fs.readFileSync(new URL(`./fixtures/swiss-sidebar/${name}`, import.meta.url), 'utf8');
const sections = (doc) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body>${doc.match(/<main>([\s\S]*)<\/main>/)[1]}</body></html>`);
  return [...document.body.children];
};
// a heading's style marker ({heading-small}, DA's style token) is not its text
const text = (n) => (n ? n.textContent.replace(/\s*\{[a-z0-9 ,-]+\}\s*$/i, '').replace(/\s+/g, ' ').trim() : '');
const style = (s) => [...s.querySelectorAll(':scope > .section-metadata > div')].map((r) => [...r.children].map(text).join(': '));

test('Premium Economy: the intro above, the content beside the aside\'s teasers, eight picture | text rows', () => {
  const { doc, made, skipped } = withSwissSidebar(fixture('premium-economy-en.da.html'), fixture('premium-economy-en.snapshot.html'));
  assert.equal(made, 1);
  assert.deepEqual(skipped, []);
  const [intro, content, aside, rest] = sections(doc);
  assert.equal(text(intro.querySelector('h1')), 'SWISS Premium Economy');
  assert.ok(intro.querySelector('h2') === null, 'the H1 and its intro stay above the sidebar, as www');
  assert.equal(text(content.firstElementChild), 'New benchmarks on long-haul flights');
  const rows = [...content.querySelectorAll(':scope > .columns-media')];
  assert.equal(rows.length, 8);
  const [media, body] = rows[0].firstElementChild.children;
  assert.ok(media.querySelector('picture img') !== null && !text(media), 'the picture first, as www\'s image | text');
  assert.match(text(body), /^You will love the comfortable seat/);
  assert.equal(rows[0].previousElementSibling.tagName, 'H3');
  assert.equal(text(rows[0].previousElementSibling), 'Travel in comfort');
  assert.deepEqual(style(aside), ['Style: sidebar-aside']);
  const cards = aside.querySelectorAll(':scope > .cards-teaser');
  assert.equal(cards.length, 1, 'the aside\'s teasers one cards-teaser block');
  assert.deepEqual([...cards[0].children].map((r) => text(r.querySelector('h4'))), ['SWISS Premium Economy in detail', 'Explore SWISS Premium Economy', 'Upgrade to SWISS Premium Economy', 'More affordable lounge access', 'SWISS Business']);
  assert.ok(content.querySelector('h4') === null, 'no teaser left in the content');
  assert.ok(rest.querySelector('.metadata') !== null, 'the page metadata after the sidebar');
  assert.equal((doc.match(/<div class="metadata">/g) || []).length, 1);
});

test('online check-in: two sidebars, the first aside\'s text and teasers, the second aside empty (the content in the 3 / 4 column)', () => {
  const { doc, made } = withSwissSidebar(fixture('online-check-in-de.da.html'), fixture('online-check-in-de.snapshot.html'));
  assert.equal(made, 2);
  const all = sections(doc);
  const asides = all.filter((s) => style(s).includes('Style: sidebar-aside'));
  assert.equal(asides.length, 2);
  const [first, second] = asides;
  assert.equal(text(first.previousElementSibling.firstElementChild), 'So erhalten Sie Ihre Bordkarte');
  assert.match(text(first), /Optionen für das Self-Check-in/);
  assert.ok(first.previousElementSibling.querySelector('.booking-lookup') === null, 'the check-in form above the sidebar');
  assert.equal(second.children.length, 1, 'the second aside empty: its section metadata only');
  assert.equal(text(second.previousElementSibling.firstElementChild), 'Ihre Vorteile');
  assert.match(text(second.previousElementSibling), /Zusätzliche Fluggastdaten/);
  assert.match(text(second.nextElementSibling), /Geniessen Sie mit Travel ID/, 'what follows the sidebar after it');
});

test('again on its output, or a page without the sidebar: unchanged', () => {
  const once = withSwissSidebar(fixture('premium-economy-en.da.html'), fixture('premium-economy-en.snapshot.html')).doc;
  assert.equal(withSwissSidebar(once, fixture('premium-economy-en.snapshot.html')).doc, once);
  const plain = '<body><header></header><main><div><h1>Title</h1><p>x</p></div></main><footer></footer></body>';
  assert.equal(withSwissSidebar(plain, '<html><body><div class="contentpage"></div></body></html>').doc, plain);
});

test('a sidebar the document does not show in order is left as it is, and named', () => {
  const doc = '<body><header></header><main><div><h1>Title</h1><p>Some text here</p></div></main><footer></footer></body>';
  const html = '<html><body><div class="airem-sidebar d-md-flex"><div class="sidebar-content"><h2>Not in the document</h2><p>Some other text</p></div><div class="sidebar-aside"></div></div></body></html>';
  const r = withSwissSidebar(doc, html);
  assert.equal(r.made, 0);
  assert.equal(r.doc, doc);
  assert.match(r.skipped[0], /not found/);
  assert.equal(sidebarsOf(html)[0].first, 'not in the document');
});

test('swiss-import.mjs runs the step on every document with its snapshot', () => {
  const js = fs.readFileSync(new URL('../tools/importer/swiss-import.mjs', import.meta.url), 'utf8');
  assert.ok(js.includes("import { withSwissSidebar } from './swiss-sidebar.mjs';"));
  assert.ok(/withSwissSidebar\(/.test(js));
});

test('the import\'s .plain.html (the sections, no <main>): the same sections back', () => {
  const full = fixture('premium-economy-en.da.html');
  const plain = full.match(/<main>([\s\S]*)<\/main>/)[1];
  const r = withSwissSidebar(plain, fixture('premium-economy-en.snapshot.html'));
  assert.equal(r.made, 1);
  assert.ok(!r.doc.includes('<main>'));
  assert.equal(r.doc, withSwissSidebar(full, fixture('premium-economy-en.snapshot.html')).doc.match(/<main>([\s\S]*)<\/main>/)[1]);
});

/* a tab panel with a sidebar (swiss-business: Interkontinental and Europa, each a sidebar): the
   panel keeps its Tab metadata on the content section only, what comes before the sidebar stays in
   it, the aside follows (section-aside.js joins it into the panel before the tabs are built); with
   content after the sidebar in the same panel, the sidebar is left as it is */
test('a tab panel: its label on the content section only, the aside after it', () => {
  const doc = '<body><header></header><main><div><h1>T</h1></div><div><p>Intro text of the tab</p><h2>Comfort on board</h2><p>Long text about comfort on board</p><h4>Teaser title</h4><p>Teaser text here</p><div class="section-metadata"><div><div>Tab</div><div>One</div></div><div><div>Tabs</div><div>1</div></div></div></div><div><h2>Second tab heading</h2><p>Second tab text</p><div class="section-metadata"><div><div>Tab</div><div>Two</div></div><div><div>Tabs</div><div>1</div></div></div></div></main><footer></footer></body>';
  const html = '<html><body><div class="airem-sidebar"><div class="sidebar-content"><h2>Comfort on board</h2><p>Long text about comfort on board</p></div><div class="sidebar-aside"><h4>Teaser title</h4><p>Teaser text here</p></div></div></body></html>';
  const { doc: out, made } = withSwissSidebar(doc, html);
  assert.equal(made, 1);
  const all = sections(out);
  const tabs = all.map((s) => style(s).filter((r) => r.startsWith('Tab:')).join(''));
  assert.deepEqual(tabs, ['', 'Tab: One', '', 'Tab: Two'], 'one panel per tab, the aside between them without a label');
  assert.match(text(all[1]), /^Intro text of the tab/, 'what comes before the sidebar stays in the panel');
  assert.deepEqual(style(all[2]), ['Style: sidebar-aside']);
  const after = doc.replace('<p>Teaser text here</p>', '<p>Teaser text here</p><p>More text after the sidebar in this tab</p>');
  const r = withSwissSidebar(after, html);
  assert.equal(r.made, 0);
  assert.match(r.skipped[0], /tab/);
});

/* the aside's teasers (www's teaser cards: an image or a video, the title, the text, the link with
   its triangle under a rule) one cards-teaser row each: the picture in the first cell, the title,
   the text and the link in the second; the title and the text without the card's link (on www the
   whole card is the link), a card without its own link keeps it on the title (the video card) */
test('Premium Economy: the aside\'s five teasers as cards-teaser rows', () => {
  const { doc } = withSwissSidebar(fixture('premium-economy-en.da.html'), fixture('premium-economy-en.snapshot.html'));
  const aside = sections(doc)[2];
  const rows = [...aside.querySelector(':scope > .cards-teaser').children];
  assert.equal(rows.length, 5);
  const [video, explore] = rows;
  const [vMedia, vBody] = video.children;
  assert.equal(vMedia.children.length, 0, 'the video card: no picture');
  assert.equal(vBody.querySelector('h4 a').getAttribute('href'), 'https://www.youtube.com/watch?v=JMEaiuOKtyQ', 'its title keeps the link');
  const [media, body] = explore.children;
  assert.ok(media.querySelector('picture img') !== null && !text(media));
  assert.deepEqual([...body.children].map((el) => el.tagName), ['H4', 'P', 'P']);
  const [title, desc, cta] = body.children;
  assert.ok(title.querySelector('a') === null && desc.querySelector('a') === null, 'the title and the text without the card\'s link');
  assert.match(text(desc), /^Experience our new SWISS Premium Economy from your own living room/);
  assert.equal(text(cta), 'Explore SWISS Premium Economy');
  assert.equal(cta.querySelector('a').getAttribute('href'), '/ch/en/fly/on-board/travel-classes/swiss-premium-economy/discover-premium-economy');
  assert.ok([...aside.children].every((el) => el.tagName !== 'P'), 'no picture or text of a teaser left beside the block');
  assert.deepEqual(sidebarsOf(fixture('premium-economy-en.snapshot.html'))[0].teasers.map((t) => [t.image, t.video]), [[false, true], [true, false], [true, false], [true, false], [true, false]]);
});

/* an aside whose picture comes after its last text (recraft's Design tab: "From aircraft part to
   furniture or accessory" over its artwork): the picture stays with the aside, so nothing follows
   the sidebar in the tab */
test('a picture under the aside\'s last text belongs to the aside', () => {
  const pic = '<p><picture><img src="https://content.da.live/x/artwork.png" alt=""></picture></p>';
  const doc = `<body><header></header><main><div><h1>T</h1></div><div><h2>Unique and minimalist design</h2><p>Text of the design tab</p><h4>From aircraft part to furniture</h4>${pic}<div class="section-metadata"><div><div>Tab</div><div>Design</div></div><div><div>Tabs</div><div>1</div></div></div></div></main><footer></footer></body>`;
  const html = '<html><body><div class="airem-sidebar"><div class="sidebar-content"><h2>Unique and minimalist design</h2><p>Text of the design tab</p></div><div class="sidebar-aside"><div class="headline"><h4>From aircraft part to furniture</h4></div><div class="image"><img src="/a.png"></div></div></div></body></html>';
  const r = withSwissSidebar(doc, html);
  assert.equal(r.made, 1, r.skipped.join('; '));
  const aside = sections(r.doc)[2];
  assert.deepEqual(style(aside), ['Style: sidebar-aside']);
  assert.ok(aside.querySelector('picture img[src$="artwork.png"]') !== null);
  const twoPics = withSwissSidebar(doc.replace(pic, pic + pic.replace('artwork', 'other')), html);
  assert.equal(twoPics.made, 0, 'one picture under the text on www: a second one is the panel\'s, after the sidebar');
});

/* www's image | image views (Miles & More: two pictures side by side; recraft's design process: two
   items of two photos each, two by two): found by their files (DA's names are www's in lower case
   with dashes), a columns-media row of a picture cell per item; an item's photos one under the other
   (option stacked) */
test('an image | image view: a picture cell per item, its photos stacked', () => {
  const pic = (f) => `<p><picture><img src="https://content.da.live/moved-permanently/lh-swiss/content/dam/lx/images/recraft/${f.toLowerCase().replace(/[._]/g, '-')}.jpeg" alt=""></picture></p>`;
  const img = (f) => `<div class="image"><img src="/content/dam/lx/images/recraft/${f}.jpeg.transform/lh-dcep-transform-width-1440/img.jpg"></div>`;
  const view = (a, b) => `<div class="twocolumn"><div class="column-view-item">${a.map(img).join('')}</div><div class="column-view-item">${b.map(img).join('')}</div></div>`;
  const doc = `<body><header></header><main><div><h2>The design process</h2><p>The collection comprises</p>${['A', 'B', 'C_1', 'D.Still2', 'E', 'F'].map(pic).join('')}<p>In order to preserve</p></div></main><footer></footer></body>`;
  const r = withSwissSidebar(doc, `<html><body>${view(['A', 'B'], ['C_1', 'D.Still2'])}${view(['E'], ['F'])}</body></html>`);
  assert.equal(r.rows, 2);
  const [sec] = sections(r.doc);
  const blocks = [...sec.querySelectorAll(':scope > .columns-media')];
  assert.deepEqual(blocks.map((b) => b.className), ['columns-media stacked', 'columns-media']);
  const files = (b) => [...b.firstElementChild.children].map((c) => [...c.querySelectorAll('img')].map((i) => i.getAttribute('src').split('/').pop()));
  assert.deepEqual(files(blocks[0]), [['a.jpeg', 'b.jpeg'], ['c-1.jpeg', 'd-still2.jpeg']]);
  assert.deepEqual(files(blocks[1]), [['e.jpeg'], ['f.jpeg']]);
  assert.deepEqual([...sec.children].map((el) => el.tagName), ['H2', 'P', 'DIV', 'DIV', 'P']);
});

/* a tab whose panel the import left empty, its content the next section (animals travelling: the
   General provisions tab, then a "flush, grey" section): the tab's rows join that section, so the
   panel holds its content and the sidebar in it */
test('an empty tab section: its Tab rows on the section that follows', () => {
  const doc = '<body><header></header><main><div><h1>T</h1></div><div><div class="section-metadata"><div><div>Tab</div><div>General</div></div><div><div>Tabs</div><div>1</div></div></div></div><div><h2>New entry regulations</h2><p>Text of the first tab</p><div class="section-metadata"><div><div>style</div><div>flush, grey</div></div></div></div><div><h2>Second tab heading</h2><div class="section-metadata"><div><div>Tab</div><div>Two</div></div><div><div>Tabs</div><div>1</div></div></div></div></main><footer></footer></body>';
  const html = '<html><body><div class="contentpage"></div></body></html>';
  const { doc: out } = withSwissSidebar(doc, html);
  const all = sections(out);
  assert.equal(all.length, 3);
  assert.deepEqual(style(all[1]), ['style: flush, grey', 'Tab: General', 'Tabs: 1']);
  assert.match(text(all[1]), /^New entry regulations/);
});

/* sections the import split off a tab (entertainment's eJournals tab: its "Hinweis" box a flush grey
   section, its login and titles another, both under the tab set, so on every tab): when www's tab
   panel holds their text, they join the tab's section */
test('sections of www\'s tab panel after the tab section join it', () => {
  const tab = (label, body) => `<div>${body}<div class="section-metadata"><div><div>Tab</div><div>${label}</div></div><div><div>Tabs</div><div>1</div></div></div></div>`;
  const doc = `<body><header></header><main><div><h1>T</h1></div>${tab('One', '<h2>First tab heading</h2><p>First tab text</p>')}${tab('eJournals', '<h2>eJournals heading</h2><p>eJournals text</p>')}<div><h2>Hinweis</h2><p>Not available at the moment</p><div class="section-metadata"><div><div>style</div><div>flush, grey</div></div></div></div><div><h3>Login</h3><p>Log in with your profile</p></div><div><div class="metadata"><div><div>nav</div><div>/ch/de/nav</div></div></div></div></main><footer></footer></body>`;
  const panel = (body) => `<maui-tab-control-panel-responsive>${body}</maui-tab-control-panel-responsive>`;
  const html = `<html><body><maui-tab-control-responsive>${panel('<h2>First tab heading</h2><p>First tab text</p>')}${panel('<h2>eJournals heading</h2><p>eJournals text</p><h2>Hinweis</h2><p>Not available at the moment</p><h3>Login</h3><p>Log in with your profile</p>')}</maui-tab-control-responsive></body></html>`;
  const { doc: out } = withSwissSidebar(doc, html);
  const all = sections(out);
  assert.equal(all.length, 4, 'the two split-off sections in the tab\'s');
  assert.deepEqual([...all[2].children].filter((el) => !el.classList.contains('section-metadata')).map((el) => text(el)), ['eJournals heading', 'eJournals text', 'Hinweis', 'Not available at the moment', 'Login', 'Log in with your profile']);
  assert.deepEqual(style(all[2]), ['Tab: eJournals', 'Tabs: 1']);
  assert.ok(all[3].querySelector('.metadata') !== null, 'the page metadata stays after the tabs');
});

/* a sidebar whose content opens with a picture (new destinations' Toulouse: the photo, the text and
   its button beside the magazine card): the picture right before the content's first text is the
   content's, not the page's above the sidebar */
test('a picture opening the sidebar\'s content is part of the content', () => {
  const pic = '<p><picture><img src="https://content.da.live/x/toulouse.jpg" alt=""></picture></p>';
  const doc = `<body><header></header><main><div><h2>Ihr nächstes Reiseziel: Toulouse</h2>${pic}<p>Toulouse begeistert mit rosafarbenen Fassaden</p><h4>Bengaluru in all seinen Farben</h4><p>Farbenprächtige Blumenmärkte</p></div></main><footer></footer></body>`;
  const html = '<html><body><h2>Ihr nächstes Reiseziel: Toulouse</h2><div class="airem-sidebar"><div class="sidebar-content"><div class="image"><img src="/t.jpg"></div><p>Toulouse begeistert mit rosafarbenen Fassaden</p></div><div class="sidebar-aside"><h4>Bengaluru in all seinen Farben</h4><p>Farbenprächtige Blumenmärkte</p></div></div></body></html>';
  const r = withSwissSidebar(doc, html);
  assert.equal(r.made, 1, r.skipped.join('; '));
  const [before, content] = sections(r.doc);
  assert.ok(before.querySelector('picture') === null, 'the picture not above the sidebar');
  assert.ok(content.firstElementChild.querySelector('picture img[src$="toulouse.jpg"]') !== null, 'the content opens with it');
  assert.ok(sidebarsOf(html)[0].imagesBefore === 1);
});

/* www's words for screen readers inside a link (maui-screen-reader-label, .sr-only) are not in the
   document: they are not the snapshot's text (animals travelling de: its aside's last link) */
test('screen-reader words in www\'s links are not the text to find', () => {
  const doc = '<body><header></header><main><div><h2>Neue Bestimmungen</h2><p>Text des Inhalts hier</p><h2>Quick Links</h2><ul><li><a href="/x.pdf">Checkliste (PDF)</a></li></ul></div></main><footer></footer></body>';
  const html = '<html><body><div class="airem-sidebar"><div class="sidebar-content"><h2>Neue Bestimmungen</h2><p>Text des Inhalts hier</p></div><div class="sidebar-aside"><h2>Quick Links</h2><ul><li><maui-navigation-link>Checkliste (PDF)<span class="sr-only">Der Link wird in einem neuen Browser-Tab geöffnet</span><maui-screen-reader-label>&nbsp;, Dieser Link führt Sie auf eine externe Website.</maui-screen-reader-label></maui-navigation-link></li></ul></div></div></body></html>';
  const r = withSwissSidebar(doc, html);
  assert.equal(r.made, 1, r.skipped.join('; '));
  assert.deepEqual(sidebarsOf(html)[0].aside, ['quick links', 'checkliste (pdf)']);
});

/* www's column views whose items all hold text (baggage irregularities' four steps: a number
   image, a heading, text and links per item; three text columns; text | text): a columns-media
   row of a cell per item, the item's picture and texts in it; only where the document has the
   items one right after the other */
test('a column view of text items: a columns-media row of a cell per item', () => {
  const pic = (n) => `<p><picture><img src="https://content.da.live/x/number-${n}.svg" alt=""></picture></p>`;
  const item = (n) => `<div class="column-view-item"><div class="image"><img src="/content/dam/lx/number-${n}.svg"></div><h3>Step ${n} heading</h3><p>Step ${n} text here</p><maui-navigation-link>Step ${n} link</maui-navigation-link></div>`;
  const html = `<html><body><h2>What happens</h2><div class="fourcolumn"><div class="row">${[1, 2, 3, 4].map(item).join('')}</div></div><div class="twocolumn"><div class="column-view-item"><p>Left column text</p></div><div class="column-view-item"><p>Right column text</p></div></div></body></html>`;
  const steps = [1, 2, 3, 4].map((n) => `${pic(n)}<h3>Step ${n} heading</h3><p>Step ${n} text here</p><p><a href="/s${n}">Step ${n} link</a></p>`).join('');
  const doc = `<body><header></header><main><div><h2>What happens</h2>${steps}<h2>More</h2><p>Left column text</p><p>Right column text</p></div></main><footer></footer></body>`;
  const r = withSwissSidebar(doc, html);
  assert.equal(r.rows, 2);
  const [sec] = sections(r.doc);
  const blocks = [...sec.querySelectorAll(':scope > .columns-media')];
  assert.equal(blocks.length, 2);
  const cells = [...blocks[0].firstElementChild.children];
  assert.equal(cells.length, 4);
  assert.deepEqual([...cells[2].children].map((el) => el.tagName), ['P', 'H3', 'P', 'P']);
  assert.ok(cells[2].firstElementChild.querySelector('img[src$="number-3.svg"]') !== null);
  assert.deepEqual([...blocks[1].firstElementChild.children].map(text), ['Left column text', 'Right column text']);
  assert.deepEqual([...sec.children].map((el) => el.tagName), ['H2', 'DIV', 'H2', 'DIV']);
  const apart = doc.replace('<h3>Step 3 heading</h3>', '<p>Something else between</p><h3>Step 3 heading</h3>');
  assert.equal(withSwissSidebar(apart, html).rows, 1, 'items not one after the other: left as they are');
});

/* the image | text views outside the sidebar too (advance seat reservation: the seat types in the
   travel classes' tab panels, the heading inside the text item beside the picture, 23 views) */
test('advance seat reservation: the 23 seat views beside their pictures, the heading in the text', () => {
  const { doc, made, rows } = withSwissSidebar(fixture('advance-seat-reservation-en.da.html'), fixture('advance-seat-reservation-en.snapshot.html'));
  assert.equal(made, 1);
  assert.equal(rows, 23);
  const blocks = sections(doc).flatMap((s) => [...s.querySelectorAll(':scope > .columns-media')]);
  assert.equal(blocks.length, 23);
  const [media, body] = blocks[0].firstElementChild.children;
  assert.ok(media.querySelector('picture img') !== null && !text(media));
  assert.equal(text(body.firstElementChild), 'Classic seat');
  assert.match(text(body), /free of charge for HON Circle Members/);
  assert.ok(sections(doc).every((s) => [...s.children].every((el) => !(el.tagName === 'P' && el.querySelector('picture') && el.nextElementSibling && /^Classic seat/.test(text(el.nextElementSibling))))), 'no picture left above a seat\'s text');
});
