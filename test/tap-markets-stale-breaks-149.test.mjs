/* eslint-disable max-len, import/extensions -- tests */
/* tap-markets.mjs keepStale and a section break (TAP row 149, standing order 13): row 139 / 149 end a heading's section
   after its description, so a fresh merge holds one of DA's sections as two. keepStale compared the sections a stale
   country sees one by one, so neither half matched DA's whole section: both were hidden from the stale countries and
   DA's section came back for them, the body twice in the document (/fr-fr/miles-and-go: the 12 countries of fr-ca's
   group, tap-snapshots-016 older than DA's copy of 2026-11-08). A stale country that sees the same text, in the same
   order, in the merge as in DA's copy only sees the sections cut elsewhere: it keeps the merge.
   Run: node --max-old-space-size=256 --test test/tap-markets-stale-breaks-149.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { keepStale } from '../tools/importer/tap-markets.mjs';

const md = '<div class="metadata"><div><div>Title</div><div>TAP Miles&amp;Go</div></div></div>';
const hero = '<div><div class="hero-campaign"><div><div><h2>TAP Miles&amp;Go</h2></div></div></div><div class="section-metadata"><div><div>Markets</div><div>-br</div></div></div></div>';
const DA = `${hero}
<div><h2>Explorez TAP Miles&amp;Go</h2><p>Plus de 100 partenaires.</p><div class="cards-icon"><div><div>Tous</div></div></div>${md}</div>
`;
const SPLIT = `${hero}
<div><h2>Explorez TAP Miles&amp;Go</h2><p>Plus de 100 partenaires.</p><div class="section-metadata"><div><div>Style</div><div>heading-section</div></div></div></div>
<div><div class="cards-icon"><div><div>Tous</div></div></div>${md}</div>
`;
const STALE = ['be', 'ca', 'ch'];

test('a stale country that sees DA\'s text cut into two sections keeps the merge', () => {
  const r = keepStale(SPLIT, DA, STALE, ['fr', ...STALE]);
  assert.deepEqual(r.kept, []);
  assert.equal(r.html, SPLIT);
});

test('a stale country whose text differs still gets DA\'s view (the merge lacks a sentence DA has)', () => {
  const changed = SPLIT.replace('<p>Plus de 100 partenaires.</p>', '');
  const r = keepStale(changed, DA, STALE, ['fr', ...STALE]);
  assert.ok(r.kept.length > 0);
  assert.ok(r.html.includes('Plus de 100 partenaires.'), 'DA\'s sentence back for them');
});

test('only the countries whose text is unchanged are spared: the others still get DA\'s view', () => {
  // DA shows be a section of its own that the merge lacks
  const da = DA.replace(md, '').replace(/\n$/, `\n<div><p>Belgique seulement</p><div class="section-metadata"><div><div>Markets</div><div>be</div></div></div></div>\n<div>${md}</div>\n`);
  const r = keepStale(SPLIT, da, STALE, ['fr', ...STALE]);
  assert.ok(r.kept.some((k) => k.how === 'section' && k.countries.join(',') === 'be'), 'be\'s own section back');
  assert.deepEqual([...new Set(r.kept.flatMap((k) => k.countries))], ['be'], 'ca and ch keep the merge');
  assert.ok(r.html.includes('Belgique seulement'));
});

// keepUncovered, the same cut (/fr-fr/miles-and-go/partenaires: DA's [ca,us] partners one section, the merge's four
// category sections, row 134): us (no root of fr covers it) got DA's section as one of its own besides the four
const PARTS = ['<h3>Location de Voiture</h3><p>Avis</p>', '<h3>Hôtels</h3><p>Accor</p>'];
const mk = (v) => `<div class="section-metadata"><div><div>Markets</div><div>${v}</div></div></div>`;
const DA_CAUS = `<div><h2>Partenaires</h2></div>\n<div>${PARTS.join('')}${mk('ca,us')}</div>\n<div><p>Fin</p>${md}</div>\n`;
const CUT = `<div><h2>Partenaires</h2></div>\n${PARTS.map((x) => `<div>${x}${mk('ca,us')}</div>`).join('\n')}\n<div><p>Fin</p>${md}</div>\n`;

test('keepUncovered: an uncovered country that sees DA\'s text cut into sections keeps the merge', async () => {
  const { keepUncovered } = await import('../tools/importer/tap-markets.mjs');
  const r = keepUncovered(CUT, DA_CAUS, ['fr', 'ca']);
  assert.deepEqual(r.kept, []);
  assert.equal(r.html, CUT);
  // a merge without the us view: DA's section comes back for us
  const noUs = CUT.replaceAll(mk('ca,us'), mk('ca'));
  const r2 = keepUncovered(noUs, DA_CAUS, ['fr', 'ca']);
  assert.deepEqual(r2.kept.map((k) => `${k.how} ${k.countries.join(',')}`), ['section us']);
});

test('a no-break space as DA writes it (&#160;) and as the importer does (the character) is the same text', async () => {
  const { keepUncovered } = await import('../tools/importer/tap-markets.mjs');
  const da = DA_CAUS.replace('<p>Avis</p>', '<p>Avis&#160;: fin</p>');
  const cut = CUT.replace('<p>Avis</p>', '<p>Avis\u00a0: fin</p>');
  const r = keepUncovered(cut, da, ['fr', 'ca']);
  assert.deepEqual(r.kept, []);
  const r2 = keepStale(cut, da, ['us'], ['fr', 'ca', 'us']);
  assert.deepEqual(r2.kept, []);
});

test('keepExisting: the merge compared as written (collapsed, as DA\'s copies are): a {blank} line is no other text', async () => {
  const { keepExisting } = await import('../tools/importer/tap-markets.mjs');
  const cut = CUT.replace('<p>Avis</p>', '<p>Avis</p><p><sub>{blank}</sub></p><p>Hertz</p>');
  const da = DA_CAUS.replace('<p>Avis</p>', '<p>Avis</p><p>Hertz</p>');
  const r = keepExisting(cut, da, { doc: '/fr-fr/miles-and-go/partenaires', covered: ['fr', 'ca'], stale: ['ca'] });
  assert.deepEqual([r.kept, r.keptStale], [[], []]);
  assert.ok(!r.html.includes('{blank}'), 'collapsed');
  assert.equal((r.html.match(/Location de Voiture/g) || []).length, 1, 'no second copy for us');
});
