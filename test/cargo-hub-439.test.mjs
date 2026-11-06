/* eslint-disable max-len, import/extensions */
/* Lufthansa Cargo's importer (tools/importer/cargo-import.mjs), brief 439, item 4: the transport
   stories hub as www's, every story. www's grid renders its tiles as the visitor scrolls (a capture
   held 10 in English, 22 in es to pt); the page's script holds the whole list (var diaries = [...],
   100 stories). The hub's tiles now come from that list, in its order, each as www's tile: the
   headline linked, the text, "More". The picture: the teaser's own when lh-cargo's DA has it, else
   the story's first picture in DA (its imported document; for es to pt, whose stories are not
   ours, the English or German story of the same address), else none (the tile without one).
   Run: node --max-old-space-size=512 --test test/cargo-hub-439.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const entry = (slug, head, desc, img = '') => `{ filterText:"", teaserImage:"${img}", teaserTitle:"${head}", teaserHeadline:"${head}", teaserFreeField:"", teaserDescription:"<p>${desc}<\\/p>", partnerSearchTag:"", viewUrl:"https://www.lufthansa-cargo.com/en/-/${slug}", moreText:"More" }`;
const tile = (slug, head, desc, img) => `<div class="grid-item masonryItem"><div class=""><img src="${img}"></div><div class="storyTeaserBox"><div class="storyTeaserTile"><h2 class="storyTeaserHeadline storyContent"><a href="https://www.lufthansa-cargo.com/en/-/${slug}?cd=b">${head}</a></h2><div class="storyTeaserDetail storyContents"></div><br><p class="storyContent"></p><p>${desc}</p><a href="https://www.lufthansa-cargo.com/en/-/${slug}?cd=b"> More</a><p></p></div></div></div>`;
const hub = (entries, tiles) => `<!DOCTYPE html><html><head><title>Transport stories - Lufthansa Cargo</title></head><body><div id="main-content"><div class="journal-content-article"><h1>Transport stories</h1></div><script> var diaries = [ ${entries.join(' , ')} ]; </script><div class="grid">${tiles.join('')}</div></div></body></html>`;

test('diariesOf: www\'s story list from the page\'s script, in its order, the strings unescaped', async () => {
  const { diariesOf } = await import('../tools/importer/cargo-import.mjs');
  const { parseHTML } = await import('linkedom');
  const { document } = parseHTML(hub([entry('a-story', 'A \\"quoted\\" story', 'Text A.'), entry('b-story', 'B story', 'Text B.')], []));
  const list = diariesOf(document);
  assert.equal(list.length, 2);
  assert.equal(list[0].teaserHeadline, 'A "quoted" story');
  assert.equal(list[0].teaserDescription, '<p>Text A.</p>');
  assert.equal(list[1].viewUrl, 'https://www.lufthansa-cargo.com/en/-/b-story');
  assert.deepEqual(diariesOf(parseHTML('<html><body></body></html>').document), []);
});

test('the hub lists every story of www\'s list, not only the rendered tiles; each tile as www\'s', async () => {
  const { convert, useStoryDocs } = await import('../tools/importer/cargo-import.mjs');
  useStoryDocs(() => null);
  const html = hub(
    [entry('a-story', 'A story', 'Text A.', '/documents/20184/aaaa1111-2222-3333-4444-555566667777'), entry('b-story', 'B story', 'Text B.'), entry('c-story', 'C story', 'Text C.')],
    [tile('a-story', 'A story', 'Text A.', '/documents/20184/aaaa1111-2222-3333-4444-555566667777')],
  );
  const { html: doc } = convert(html, '/en/ci/transport-stories', 'en');
  const cards = doc.match(/<div class="cards-teaser three-up">[\s\S]*?<\/div><\/div><\/div>(?=<div class="(?:section-)?metadata">|<\/div>$)/);
  assert.ok(cards, doc);
  const titles = [...doc.matchAll(/<h3><a href="([^"]+)">([^<]+)<\/a><\/h3>/g)].map((m) => m[2]);
  assert.deepEqual(titles, ['A story', 'B story', 'C story']);
  assert.match(doc, /<h3><a href="[^"]*b-story">B story<\/a><\/h3><p>Text B\.<\/p><p><a href="[^"]*b-story">More<\/a><\/p>/);
  assert.doesNotMatch(doc, /\?cd=b/, 'www\'s tracking parameter left out');
});

test('a story www rendered keeps its tile\'s text (www\'s Portuguese page shows its tiles translated, its list is English)', async () => {
  const { convert, useStoryDocs } = await import('../tools/importer/cargo-import.mjs');
  useStoryDocs(() => null);
  const pt = (s) => s.replace(/\/en\/-\//g, '/pt/-/');
  const html = hub(
    [pt(entry('berggruen-1', 'The Berggruen collection on a world tour', 'Berggruen! A name that everyone knows.')), pt(entry('c-story', 'C story', 'Text C.'))],
    [pt(tile('berggruen-1', 'A coleção Berggruen em uma turnê mundial', 'Berggruen! Um nome que todos conhecem.', '/documents/20184/7885cdd6-e5e1-6c6b-2621-9f353c664ef2')).replace(' More</a>', ' Mais</a>')],
  );
  const { html: doc } = convert(html, '/pt/ci/transport-stories', 'pt');
  assert.match(doc, /<h3><a href="[^"]*berggruen-1">A coleção Berggruen em uma turnê mundial<\/a><\/h3><p>Berggruen! Um nome que todos conhecem\.<\/p><p><a href="[^"]*berggruen-1">Mais<\/a><\/p>/, doc);
  assert.doesNotMatch(doc, /The Berggruen collection/);
  assert.match(doc, /<h3><a href="[^"]*c-story">C story<\/a><\/h3><p>Text C\.<\/p><p><a href="[^"]*c-story">More<\/a><\/p>/, 'the rest from the list');
});

test('the tile picture: the teaser\'s own in DA, else the story\'s first picture in DA (the English story for another language), else none', async () => {
  const { convert, useStoryDocs } = await import('../tools/importer/cargo-import.mjs');
  const docs = {
    '/en/news/b-story': '<div><p>Intro.</p><p><picture><img src="/media-da/cargo/b-story-hero-12345678.jpg" alt="B"></picture></p></div>',
  };
  useStoryDocs((p) => docs[p] || null);
  const es = (slug, head) => entry(slug, head, `Text ${head}.`).replace('/en/-/', '/es/-/');
  const rendered = tile('b-story', 'B', 'Text B.', '/documents/20184/bbbb1111-2222-3333-4444-555566667777').replace(/\/en\/-\//g, '/es/-/');
  const { html: doc } = convert(hub([es('b-story', 'B'), es('c-story', 'C')], [rendered]), '/es/ci/transport-stories', 'es');
  assert.match(doc, /<div><div><picture><img src="\/media-da\/cargo\/b-story-hero-12345678\.jpg" alt=""><\/picture><\/div><div><h3><a href="[^"]*b-story">B<\/a><\/h3>/, doc);
  assert.match(doc, /<div><div><\/div><div><h3><a href="[^"]*c-story">C<\/a><\/h3>/, 'no picture anywhere: the tile without one');
  useStoryDocs(null);
});
