/* eslint-disable max-len, import/extensions -- tests */
/* tap-markets.mjs keepUncovered (brief 468): a language document merged again from the roots' views keeps the existing
   document's sections for countries no root of that language covers (fr-fr promos: es, br, us and pt, whose sections an
   earlier import placed and which no French root's view decides now). A section listing such a country stays for it
   (into the merged section with the same text, else on its own for those countries); an existing exclusion of such a
   country is carried to the merged section that replaces it. Sections of every other market as merged.
   Run: node --max-old-space-size=256 --test test/tap-markets-keep-468.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { keepUncovered } from '../tools/importer/tap-markets.mjs';
import { sectionMarkets } from '../scripts/market-rules.js';

const md = (m) => `<div class="section-metadata"><div><div>Markets</div><div>${m}</div></div></div>`;
const sec = (text, m, cls = 'cards-teaser') => `<div><div class="${cls}"><div><div><p>${text}</p></div></div></div>${m ? md(m) : ''}</div>`;
const sections = (html) => html.split('\n').filter(Boolean);
const view = (html) => sections(html).map((s) => `${(s.match(/<p>([^<]*)<\/p>/) || [])[1]} [${sectionMarkets(s) ?? ''}]`);

// the fr-fr promos case, in short: DA's copy from the archives' import, the merge from fr-ca's view only
const existing = [
  '<div><h1>Promotions et Offres</h1></div>',
  sec('Noël à New York', 'at,be,ch,es,fr,lu'),
  sec('Votre voyage au Portugal', 'br,ca,us'),
  sec('Que vous réserve la nouvelle année', 'pt'),
  sec('Ajoutez Portugal (old text)', '-pt', 'cards-teaser three-up'),
].join('\n');
const merged = [
  '<div><h1>Promotions et Offres</h1></div>',
  sec('Noël à New York', 'at,be,ch,fr,lu'),
  sec('L’Islande', 'ca'),
  sec('Portugal Stopover (new text)', '-ca,-pt', 'cards-teaser three-up'),
  sec('Vous voyagez en Europe ?', 'ca', 'cards-teaser three-up'),
].join('\n');
const covered = ['fr', 'be', 'ch', 'lu', 'ca', 'at'];

test('fr-fr promos: es, br, us and pt keep what the existing document gives them; ca and the others as merged', () => {
  const r = keepUncovered(merged, existing, covered);
  assert.deepEqual(view(r.html), [
    'undefined []',
    'Noël à New York [at,be,ch,es,fr,lu]',
    'Votre voyage au Portugal [br,us]',
    'Que vous réserve la nouvelle année [pt]',
    'L’Islande [ca]',
    'Portugal Stopover (new text) [-ca,-pt]',
    'Vous voyagez en Europe ? [ca]',
  ]);
  assert.deepEqual(r.kept.map((k) => `${k.countries.join(',')}: ${k.how}`), ['es: added', 'br,us: section', 'pt: section']);
});

test('an existing exclusion of an uncovered country goes to the merged section that replaces it', () => {
  const ex = [sec('Stopover old', '-pt,-mz', 'cards-teaser three-up'), sec('Mozambique only', 'mz')].join('\n');
  const mg = [sec('Stopover new', '-pt', 'cards-teaser three-up')].join('\n');
  const r = keepUncovered(mg, ex, ['pt', 'ao']);
  assert.deepEqual(view(r.html), ['Stopover new [-mz,-pt]', 'Mozambique only [mz]']);
});

test('nothing to keep: the merged document as it is; no existing document: the same', () => {
  const r = keepUncovered(merged, merged, covered);
  assert.equal(r.html, merged);
  assert.deepEqual(r.kept, []);
  assert.equal(keepUncovered(merged, '', covered).html, merged);
});

test('the CLI keeps them when it writes a merged language document over a local copy', () => {
  const js = fs.readFileSync(new URL('../tools/importer/tap-markets.mjs', import.meta.url), 'utf8');
  // the existing copy: DA's as saved (--existing), else the local copy (standing order 8 of 2026-11-11)
  assert.match(js, /const f = \[\.\.\.files, localFile\]\.find\(\(x\) => fs\.existsSync\(x\)\);/);
  assert.match(js, /const prior = existingOf\(doc, localFile\);/);
  assert.match(js, /const covered = \[home, \.\.\.countries, \.\.\.vs\.map\(\(v\) => v\.country\)\];\n\s*const keep = keepUncovered\(html, prior\.html, covered\);/);
});
