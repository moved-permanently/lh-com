/* eslint-disable max-len, import/extensions */
/* Lufthansa Cargo's transport stories, brief 442, item 4: www keeps some passages only in a story
   module's phone copy (d-block d-sm-none; /en/news/theculture: Kai Nissen's quote, the art trucks,
   the SCHIRN opening; night-shift-in-chicago-44: the photo credit). The importer left every phone
   copy out (its text is mostly the desktop copy's again: brief 417). Now a phone copy's paragraphs
   whose sentences the page's desktop copy lacks are kept, after the module: a paragraph none of whose
   sentences is on the desktop as it is, one partly there with only its missing sentences; the rest
   (the duplicates) still left out, each kept passage once.
   Run: node --max-old-space-size=512 --test test/cargo-story-phone-442.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const module = (desktop, phone) => `<div class="row-fluid module--story"><div class="d-none d-sm-block"><div class="story-imageWrap"><img src="/documents/20184/1/story.jpg/abc"></div><div class="story-textWrap"><div class="story-text-background"><h2 class="story-headline">${desktop.head || ''}</h2><div class="row"><div class="col-md-12">${desktop.body}</div></div></div></div></div><div class="d-block d-sm-none"><div class="story-textWrap-noimage"><div class="row"><div class="col-md-12"><div class="story-text-background"><h2 class="story-headline"> </h2><div class="row"><div class="col-md-12">${phone}</div></div></div></div></div></div></div></div>`;
const page = (mods) => `<!DOCTYPE html><html><head><title>The Culture - Lufthansa Cargo</title></head><body><div id="main-content"><div class="newssectiondetail">${mods.join('')}</div></div></body></html>`;

test('a phone copy\'s passages the desktop lacks are kept after the module; its duplicates are not', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const html = page([
    module({ head: 'The Culture.', body: '<p>To celebrate its 50th anniversary, the SCHIRN is dedicating a large exhibition. More than one hundred artworks are on display.</p>' },
      '<p>To celebrate its 50th anniversary, the SCHIRN is dedicating a large exhibition.</p><p>"Lufthansa Cargo offers us two main advantages: The experts and the network." says Kai Nissen.</p><p>More than one hundred artworks are on display. There are special trucks for transporting art.</p>'),
    module({ body: '<p>The artwork has been transported via our hub in Chicago to Frankfurt.</p>' }, '<p>Photos: SCHIRN KUNSTHALLE, Oliver Rösler, Lufthansa Cargo 03/2024</p><p>The artwork has been transported via our hub in Chicago to Frankfurt.</p>'),
  ]);
  const { html: doc } = convert(html, '/en/news/theculture', 'en');
  const once = (re, msg) => assert.equal((doc.match(re) || []).length, 1, `${msg}: ${doc}`);
  once(/To celebrate its 50th anniversary/g, 'the desktop paragraph once (its phone duplicate left out)');
  once(/<p>"Lufthansa Cargo offers us two main advantages: The experts and the network\." says Kai Nissen\.<\/p>/g, 'a phone-only paragraph as it is');
  once(/<p>There are special trucks for transporting art\.<\/p>/g, 'a partly phone-only paragraph: its missing sentence');
  once(/More than one hundred artworks are on display/g, 'the sentence the desktop has, once');
  once(/<p>Photos: SCHIRN KUNSTHALLE, Oliver Rösler, Lufthansa Cargo 03\/2024<\/p>/g, 'the phone-only photo credit');
  once(/transported via our hub in Chicago/g, 'the second module\'s duplicate left out');
  assert.ok(doc.indexOf('two main advantages') < doc.indexOf('transported via our hub'), 'kept after its own module');
});

test('the phone copy\'s older wording of a desktop sentence is no phone-only passage (a word or two apart, another order)', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const html = page([module(
    { head: 'Engine Mission.', body: '<p>To achieve this, Kuehne+Nagel works with specialized aerospace teams and regularly audited services. No structures may be used that could disturb or even injure birds during migration.</p>' },
    '<p>To achieve this, Kühne+Nagel works with specialized aerospace teams and regularly audited services.</p><p>No structures may be used that could injure or even disturb birds during migration.</p>',
  )]);
  const { html: doc } = convert(html, '/en/news/engine-mission', 'en');
  assert.doesNotMatch(doc, /Kühne/, doc);
  assert.equal((doc.match(/birds during migration/g) || []).length, 1, doc);
});

test('a desktop word with www\'s bullet glyph glued to it ("uCare/td") still matches the phone copy\'s', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const html = page([module(
    { head: 'Die Chemie stimmt.', body: '<ul><li><p>uEmergency.Solutions – macht das Unmögliche möglich</p></li><li><p>uCare/td – für Gefahrgut</p></li></ul>' },
    '<ul><li><p>Emergency.Solutions – macht das Unmögliche möglich</p></li><li><p>Care/td – für Gefahrgut</p></li></ul>',
  )]);
  const { html: doc } = convert(html, '/de/news/die-chemie-stimmt-31', 'de');
  assert.doesNotMatch(doc, /<p>Care\/td – für Gefahrgut<\/p>/, doc);
});

test('a phone passage in the other language (www\'s English phone copy of a German story) is not kept', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const html = page([module(
    { head: 'Schneller, weiter, schwerer.', body: '<p>Lufthansa Cargo macht Geschäfte mit der Öl- und Gasindustrie, die für ihre Projekte schwere Ausrüstung braucht.</p>' },
    '<p>Lufthansa Cargo is making business with the oil and gas industry, which needs heavy equipment for its projects.</p><p>Fotos: Cornelia Garmann, Natalia Pekhanova</p>',
  )]);
  const { html: doc } = convert(html, '/de/news/schneller-weiter-schwerer-2', 'de');
  assert.doesNotMatch(doc, /is making business/, doc);
  assert.match(doc, /<p>Fotos: Cornelia Garmann, Natalia Pekhanova<\/p>/, 'a phone-only passage in the page\'s language kept');
});

test('a story without phone-only text imports as before (no phone duplicates)', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const html = page([module({ head: 'Story.', body: '<p>All of the text is on the desktop copy as well.</p>' }, '<p>All of the text is on the desktop copy as well.</p>')]);
  const { html: doc } = convert(html, '/en/news/story', 'en');
  assert.equal((doc.match(/All of the text is on the desktop copy as well\./g) || []).length, 1, doc);
});
