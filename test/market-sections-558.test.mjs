/* eslint-disable max-len, import/extensions, newline-per-chained-call */
/* lufthansa.com's market steps for the importer (brief 558, tools/importer/market-sections.mjs), against documents the
   info bundle imports offline from the R2 drop's snapshots (test/fixtures/market-sections: /de/en/cash-and-miles from
   lh-snapshots-083, /gb/en/cash-and-miles from lh-snapshots-084: gb/en shows what the covered en roots show, without
   the version's "Promotion: Discover North America" band, the comparison's 10 version-only text runs; /de/en/hotel-offers
   from bd-snapshots).
   - mergeMarketVariant: the home market (de) sees the version document's text, a covered root (ae) the variant's,
     the page metadata once and outside any markets section.
   - withPageMarkets: a shared variant's group in the page metadata.
   - withTabsByMarket: the Flight Search's Tabs by market row for markets that hide tabs (hideCar, hideHotel).
   Run: node --max-old-space-size=256 --test test/market-sections-558.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  splitSections, sectionSignature, mergeMarketVariant, withPageMarkets, withTabsByMarket, withSectionMarkets,
  sectionMarketsValue, hiddenKinds, tabKind,
} from '../tools/importer/market-sections.mjs';
import { dropMarketSections } from '../scripts/market-rules.js';

const fx = (n) => fs.readFileSync(new URL(`./fixtures/market-sections/${n}.html`, import.meta.url), 'utf8');
const VERSION = fx('de-en-cash-and-miles');
const VARIANT = fx('gb-en-cash-and-miles');
const text = (html) => splitSections(html).map(sectionSignature).join('\n').replace(/^metadata[^#]*#/gm, '#').replace(/^#\n?/gm, '');
const PROMO = 'Promotion: Discover North America now';

test('sections: top-level divs; a signature without metadata and media addresses', () => {
  assert.equal(splitSections(VERSION).length, 6);
  const s = splitSections(VERSION)[0];
  assert.ok(sectionSignature(s).includes('Flexible flight bookings with Cash'));
  assert.ok(!sectionSignature(s).includes('.jpg'));
});

test('section markets: added to a section without metadata, replaced where there is one', () => {
  const s = withSectionMarkets('<div><p>x</p></div>', 'de');
  assert.equal(sectionMarketsValue(s), 'de');
  assert.equal(sectionMarketsValue(withSectionMarkets(s, '-de')), '-de');
  const styled = withSectionMarkets('<div><p>x</p><div class="section-metadata"><div><div>style</div><div>grey</div></div></div></div>', 'de');
  assert.equal(sectionMarketsValue(styled), 'de');
  assert.ok(styled.includes('<div>style</div><div>grey</div>'));
});

test('merge: de sees the version page, a covered root the variant, the page metadata once', () => {
  const { html, runs, unchanged } = mergeMarketVariant(VERSION, VARIANT, { home: 'de', others: '-de' });
  assert.equal(unchanged, false);
  assert.ok(runs.length >= 1);
  const de = dropMarketSections(html, 'de');
  const ae = dropMarketSections(html, 'ae');
  assert.ok(de.includes(PROMO));
  assert.ok(!ae.includes(PROMO));
  assert.equal(text(de), text(VERSION));
  assert.equal(text(ae), text(VARIANT));
  assert.equal((html.match(/<div class="metadata">/g) || []).length, 1);
  const metaSection = splitSections(html).find((s) => s.includes('<div class="metadata">'));
  assert.equal(sectionMarketsValue(metaSection), null);
});

test('merge: the same document twice changes nothing', () => {
  const r = mergeMarketVariant(VERSION, VERSION, { home: 'de', others: '-de' });
  assert.equal(r.unchanged, true);
  assert.equal(r.html, splitSections(VERSION).join('\n'));
});

test('merge: a version section with markets already is refused', () => {
  const marked = withSectionMarkets(splitSections(VERSION)[0], 'de') + splitSections(VERSION).slice(1).join('');
  assert.throws(() => mergeMarketVariant(marked, VARIANT, { home: 'de', others: '-de' }), /markets already/);
});

test('shared variant: the group in the page metadata (added, then replaced)', () => {
  const one = withPageMarkets(VARIANT, 'ae/en, cl/en, mx/en, ve/en');
  assert.ok(one.includes('<div><div>markets</div><div>ae/en, cl/en, mx/en, ve/en</div></div>'));
  const two = withPageMarkets(one, 'ae/en');
  assert.equal((two.match(/<div>markets<\/div>/g) || []).length, 1);
  assert.ok(two.includes('<div>markets</div><div>ae/en</div>'));
});

test('widget settings: hideCar and hideHotel as a Tabs by market row', () => {
  assert.deepEqual(hiddenKinds({ hideCar: true, hideHotel: true, hideHoliday: false }), ['car', 'hotel']);
  assert.equal(tabKind('Rental car'), 'car');
  assert.equal(tabKind('Flug & Hotel'), 'holiday');
  const { html, blocks } = withTabsByMarket(VERSION, [{ markets: 'cr/en, pa/en, pe/en, ec/en', hide: ['car', 'hotel'] }]);
  assert.equal(blocks, 1);
  assert.ok(html.includes('<div><div>Tabs by market</div><div><p>cr/en, pa/en, pe/en, ec/en = Flights</p></div></div>'));
  assert.equal(withTabsByMarket(html, [{ markets: 'cr/en', hide: ['car'] }]).blocks, 0, 'a block with the row keeps it');
});

// brief 582: www draws the widget empty there (lh-snapshots-090: am/en hotel-offers, hideHotel), so the group gets
// "none" (blocks/flight-search: the block goes); 558 wrote no row
test('widget settings: a group whose hidden tabs leave none (hotel-offers: Hotel only) gets "none"', () => {
  const { html, blocks } = withTabsByMarket(fx('de-en-hotel-offers'), [{ markets: 'am/en', hide: ['hotel'] }]);
  assert.equal(blocks, 1);
  assert.ok(html.includes('<div><div>Tabs by market</div><div><p>am/en = none</p></div></div>'));
});

test('market-steps: the list rows run on documents by path, missing inputs skipped', async () => {
  const { readList, runRow } = await import('../tools/importer/market-steps.mjs');
  const rows = readList('# note\nrow\taction\tdocument\tvariant\tmarkets\thide\n25\tmarkets-section\t/de/en/cash-and-miles\t/gb/en/cash-and-miles\tde|-de\t\n55\ttabs-by-market\t/de/en/cash-and-miles\t\tcr/en\tcar, hotel\n9\tmarkets-section\t/de/en/cash-and-miles\t/ae/en/cash-and-miles\tde|-de\t\n');
  const docs = { '/de/en/cash-and-miles': VERSION, '/gb/en/cash-and-miles': VARIANT };
  const read = (p) => docs[p] ?? null;
  assert.equal(rows.length, 3);
  assert.ok(dropMarketSections(runRow(rows[0], read).html, 'de').includes(PROMO));
  assert.ok(runRow(rows[1], read).html.includes('cr/en = Flights'));
  assert.match(runRow(rows[2], read).skip, /no variant/);
});
