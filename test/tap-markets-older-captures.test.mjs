/* eslint-disable max-len, import/extensions -- tests */
/* tap-markets.mjs, the held TAP documents of 2026-11-11 (standing order 8): a merge from the drop's captures dropped DA's
   US sections. DA's /pt-pt/miles-and-go/promocoes holds a [us] American Express section ("Earn 40.000 Bonus Miles")
   from the market comparison's fetch of 2026-11-07 (461596e5); the drop's pt-us capture is of 2026-11-04
   (tap-snapshots-017), before that card, and keepUncovered counted every root's country as covered. keepStale gives
   every country no newer capture covers what DA's copy showed it; staleCountries names them. Also: mediaIndex reads the
   BySide capture as unpacked (tap-byside-001/byside), whose pictures the club pages' call-back cards lost.
   Fixtures: DA's copy (its main, 2026-11-08T00:00:53Z) and origin/main's merge of the page from the drop's captures.
   Run: node --max-old-space-size=256 --test test/tap-markets-older-captures.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { keepUncovered, keepStale, staleCountries } from '../tools/importer/tap-markets.mjs';
import { mediaIndex } from '../tools/importer/tap-import.mjs';
import { sectionMarkets, marketAllows } from '../scripts/market-rules.js';

const dir = new URL('./fixtures/tap-markets-older/', import.meta.url);
const da = fs.readFileSync(new URL('pt-pt-promocoes.da.html', dir), 'utf8');
const merged = fs.readFileSync(new URL('pt-pt-promocoes.merged.html', dir), 'utf8');
const DA_AT = '2026-11-08T00:00:53.000Z';
// the pt roots with the page (their sitemaps) and the drop's captures of it
const ROOTS = 'ao ar at be ca ch ci cl co cv cz de dk dz ee eg es fi fr gb gh gm gn gr gw hk hr hu ie il it lt lu lv ma ml mx mz nl no pa pl ro rs ru se sk sn st tg tn tr ua us uy ve za'.split(' ');
const VIEWS = [['de', '2026-11-04T01:11:05Z'], ['at', '2026-11-04T01:13:48Z'], ['es', '2026-11-04T01:26:11Z'], ['us', '2026-11-04T01:29:17Z']]
  .map(([country, at]) => ({ country, at }));

// a document's top-level sections (its <div>s)
const sections = (html) => {
  const out = [];
  let depth = 0;
  let start = 0;
  const re = /<div\b[^>]*>|<\/div>/g;
  let m = re.exec(html);
  while (m) {
    if (m[0] === '</div>') {
      depth -= 1;
      if (!depth) out.push(html.slice(start, re.lastIndex));
    } else {
      if (!depth) start = m.index;
      depth += 1;
    }
    m = re.exec(html);
  }
  return out;
};
// what a country sees: each section's own text (no section or page metadata), in order
const text = (s) => s.replace(/<div class="(section-metadata|metadata)">[\s\S]*$/, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const seenBy = (html, c) => sections(html).filter((s) => { const m = sectionMarkets(s); return m === null || marketAllows(m, c); }).map(text).filter(Boolean);
const AMEX = 'Earn 40.000 Bonus Miles';

test('the defect: the merge has no US card, and keepUncovered does not bring it back (us counts as covered)', () => {
  assert.ok(da.includes(AMEX));
  assert.ok(!merged.includes(AMEX));
  const r = keepUncovered(merged, da, ['pt', ...ROOTS]);
  assert.ok(!r.html.includes(AMEX));
});

test('staleCountries: every root no capture newer than DA covers, never the home market', () => {
  const stale = staleCountries({
    home: 'pt', roots: ROOTS, views: VIEWS, at: DA_AT,
  });
  assert.ok(stale.includes('us') && stale.includes('at') && stale.includes('mz'));
  assert.ok(!stale.includes('pt'));
  assert.equal(stale.length, ROOTS.length);
  // a capture newer than DA covers its country and its comparison group (pt-at of tap-snapshots-027)
  const fresh = staleCountries({
    home: 'pt', roots: ROOTS, views: [...VIEWS.filter((v) => v.country !== 'at'), { country: 'at', at: '2026-11-10T18:13:00Z' }], groups: [['at', 'be', 'ch']], at: DA_AT,
  });
  assert.ok(!fresh.includes('at') && !fresh.includes('be') && !fresh.includes('ch') && fresh.includes('us'));
  // without DA's time every capture counts as newer
  assert.ok(!staleCountries({ home: 'pt', views: VIEWS }).includes('us'));
});

test('pt-pt promocoes: every country sees what DA showed it; the US card back as a [us] section; the page metadata last', () => {
  const stale = staleCountries({
    home: 'pt', roots: ROOTS, views: VIEWS, at: DA_AT,
  });
  const r = keepStale(merged, da, stale, ['pt', ...ROOTS]);
  const amex = sections(r.html).find((s) => s.includes(AMEX));
  assert.ok(amex);
  assert.equal(sectionMarkets(amex), 'us');
  ['pt', 'us', 'ao', 'mz', 'gb', 'de', 'br'].forEach((c) => assert.deepEqual(seenBy(r.html, c), seenBy(da, c), c));
  const last = sections(r.html).pop();
  assert.ok(last.includes('<div class="metadata">') && sectionMarkets(last) === null);
  assert.deepEqual(r.kept.map((k) => `${k.how} ${k.countries.join(',')}`), ['section us']);
});

test('nothing stale, no existing copy: the merge unchanged', () => {
  assert.equal(keepStale(merged, da, []).html, merged);
  assert.equal(keepStale(merged, '', ['us']).html, merged);
});

test('mediaIndex: the BySide capture as unpacked (its byside folder) gives the call-back cards their pictures', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tap-byside-'));
  try {
    const url = 'https://bysa1.byside.com/files/B414516D6E/window/29964/bg_c2call_full_2.png';
    fs.mkdirSync(path.join(root, 'byside', 'pictures'), { recursive: true });
    fs.writeFileSync(path.join(root, 'byside', 'click-to-call.json'), JSON.stringify({ pictures: [{ url, path: 'pictures/bg_c2call_full_2.png' }] }));
    const idx = mediaIndex([root]);
    assert.equal(idx.get(url) && idx.get(url).local, path.join(root, 'byside', 'pictures', 'bg_c2call_full_2.png'));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
