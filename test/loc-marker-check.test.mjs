/* eslint-disable max-len, import/extensions -- dev tooling */
/* The style marker check (tools/loc/marker-check.mjs): the site's patterns, changed, moved and
   vanished markers, merge marks, the DA reads (a fake DA, no network). Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import {
  collectMarkers, compareMarkers, checkPairs, runMarkerCheck, findingLine,
} from '../tools/loc/marker-check.mjs';
import { scopeRows } from '../tools/loc/regional-diff.mjs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const SOURCE = read('./fixtures/loc/marker-source.html');
const TRANSLATED = read('./fixtures/loc/marker-translated.html');

test('the check reads markers with the site\'s own patterns (scripts/scripts.js decorateTextStyles)', () => {
  const defs = (src) => src.split('\n').filter((l) => /^const (COLUMN_MARK|styleMarker|HEADING_STYLE|PARAGRAPH_STYLE|LIST_STYLE|SEPARATOR) =/.test(l));
  const site = defs(read('../scripts/scripts.js'));
  assert.equal(site.length, 6, 'the six pattern lines are in scripts.js');
  assert.deepEqual(defs(read('../tools/loc/marker-check.mjs')), site, 'copy them again into marker-check.mjs');
});

test('collectMarkers: what the site reads, at the end and exact; plain braces listed but not read', () => {
  const m = collectMarkers(SOURCE);
  assert.deepEqual(m.filter((c) => c.read).map((c) => `${c.read.kind}:${c.read.marker}`), [
    'heading:heading-small', 'paragraph:copytext-small', 'separator:divider-25', 'paragraph:caption', 'list:full-width',
    'heading:heading-medium', 'paragraph:copytext-small', 'separator:spacer-40 from-768', 'heading:heading-small', 'paragraph:copytext-large']);
  assert.deepEqual(m.filter((c) => !c.read).map((c) => c.raw), ['{curly}']);
  const t = collectMarkers(TRANSLATED);
  assert.ok(!t.some((c) => c.raw === '{heading-medium}'), 'the local merge block (da-diff-added) is left out');
  assert.equal(t.find((c) => c.raw === '{Überschrift-mittel}').ctx, 'incoming');
  assert.equal(t.find((c) => c.raw === '{caption}').read, null, 'at the start: not read');
});

test('compareMarkers: changed, not read, vanished (incoming merge block included), added; kept ones not listed', () => {
  const r = compareMarkers(SOURCE, TRANSLATED);
  assert.equal(r.markers, 10);
  assert.equal(r.kept, 5);
  assert.deepEqual(r.findings.map((f) => [f.status, f.marker, f.now || null, f.ctx || null]), [
    ['changed', '{copytext-small}', '{Copytext-klein}', 'page'],
    ['changed', '{divider-25}', '{Teiler-25}', 'page'],
    ['not-read', '{caption}', '{caption}', 'page'],
    ['vanished', '{full-width}', null, null],
    ['changed', '{heading-medium}', '{Überschrift-mittel}', 'incoming'],
    ['added', '{copytext-medium}', null, 'page'],
  ]);
  assert.equal(r.findings[0].text, 'Book your flight online. {copytext-small}');
  assert.equal(r.findings[4].nowText, 'Lounges {Überschrift-mittel}');
  assert.match(findingLine(r.findings[4]), /^changed {4}\{heading-medium\} \(heading\) of <h3> "Lounges \{heading-medium\}": changed to \{Überschrift-mittel\} in <h3> .*\(in an incoming merge block\)$/);
  assert.match(findingLine(r.findings[2]), /not where the site reads it \(exact, at the end of a <p>\)/);
  assert.match(findingLine(r.findings[3]), /^vanished/);
});

test('compareMarkers: an untouched translation has no findings; the same marker twice pairs in order', () => {
  assert.deepEqual(compareMarkers(SOURCE, SOURCE), { markers: 10, kept: 10, findings: [] });
  const src = '<main><div><p>A {copytext-small}</p><p>B {copytext-small}</p></div></main>';
  const tr = '<main><div><p>A {copytext-klein}</p><p>B {copytext-small}</p></div></main>';
  const r = compareMarkers(src, tr);
  assert.equal(r.kept, 1);
  assert.deepEqual(r.findings.map((f) => [f.status, f.text, f.now]), [['changed', 'A {copytext-small}', '{copytext-klein}']]);
  // a marker inside an incoming block of a list, the local side left out
  const merged = '<main><div><ul da-diff-added=""><li>x {full-width}</li></ul><da-diff-deleted><ul><li>x {volle-Breite}</li></ul></da-diff-deleted></div></main>';
  const m = compareMarkers('<main><div><ul><li>x {full-width}</li></ul></div></main>', merged);
  assert.deepEqual(m.findings.map((f) => [f.status, f.now, f.ctx]), [['changed', '{volle-Breite}', 'incoming']]);
});

/** An in-memory DA: path -> html; records the calls. */
function fakeDa(docs) {
  const calls = [];
  return {
    calls,
    get: async (p) => { calls.push(['GET', p]); return docs[p] ?? null; },
    put: async () => { throw new Error('the marker check never writes'); },
    remove: async () => { throw new Error('the marker check never deletes'); },
  };
}

test('runMarkerCheck: own German slug read at the translation copy first, then the German page; read only', async () => {
  const pairs = checkPairs(scopeRows(), ['/de/en/flight-search', '/de/en/homepage', '/de/en/baggage']);
  assert.deepEqual(pairs[0], { source: '/de/en/flight-search', targets: ['/de/de/flight-search', '/de/de/flugsuche'] });
  assert.deepEqual(pairs[1], { source: '/de/en/homepage', targets: ['/de/de/homepage'] });
  const da = fakeDa({
    '/drafts/loc-test/de/en/flight-search': SOURCE,
    '/drafts/loc-test/de/de/flugsuche': TRANSLATED,
    '/drafts/loc-test/de/en/homepage': SOURCE,
    '/drafts/loc-test/de/de/homepage': SOURCE,
  });
  const out = await runMarkerCheck({ pairs, da, rootDir: '/drafts/loc-test' });
  assert.equal(out[0].target, '/de/de/flugsuche');
  assert.equal(out[0].findings.length, 6);
  assert.deepEqual(out[1].findings, []);
  assert.equal(out[2].status, 'no English page in DA');
  assert.ok(da.calls.every(([m, p]) => m === 'GET' && p.startsWith('/drafts/loc-test/')));
  assert.ok(checkPairs(scopeRows()).length > 800, 'every /de/en page with a German page');
});

test('marker-check CLI: --apply is refused (read only)', () => {
  const r = spawnSync(process.execPath, [new URL('../tools/loc/marker-check.mjs', import.meta.url).pathname, '--apply'], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /read only/);
});
