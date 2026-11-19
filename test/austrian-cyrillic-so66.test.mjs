/* Austrian's Cyrillic text in Arial's metrics on every machine (standing order 66, item 1): Liberation Sans (SIL OFL 1.1, metric-
   compatible with Arial) served from our own hosts for the Cyrillic ranges only, named right after Portada and CoreSans in the two
   stacks, so a Russian page no longer depends on the machine's Arial. Run: node --test test/austrian-cyrillic-so66.test.mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const css = readFileSync('styles/themes/austrian.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const faces = [...css.matchAll(/@font-face \{([^}]*)\}/g)].map((m) => m[1]).filter((b) => b.includes('"Austrian Cyrillic"'));

test('two Cyrillic-only faces from our own hosts, the files and their licence in the repository', () => {
  assert.equal(faces.length, 2);
  assert.ok(faces[0].includes("src: url('/fonts/austrian/liberation-sans-regular.ttf') format('truetype');"));
  assert.ok(faces[0].includes('font-weight: 100 500;'));
  assert.ok(faces[1].includes("src: url('/fonts/austrian/liberation-sans-bold.ttf') format('truetype');"));
  assert.ok(faces[1].includes('font-weight: 600 900;'));
  faces.forEach((f) => assert.ok(f.includes('unicode-range: U+0400-04FF, U+0500-052F'), 'Cyrillic only'));
  ['liberation-sans-regular.ttf', 'liberation-sans-bold.ttf', 'liberation-sans-OFL.txt'].forEach((f) => assert.ok(existsSync(`fonts/austrian/${f}`), f));
  assert.ok(readFileSync('fonts/austrian/liberation-sans-OFL.txt', 'utf8').includes('SIL OPEN FONT LICENSE Version 1.1'));
});

test('the face right after Portada and CoreSans, before Arial', () => {
  assert.ok(css.includes('--body-font-family: coresans, "austrian cyrillic", arial, helvetica, mammilessymbol, sans-serif;'));
  assert.ok(css.includes('--heading-font-family: portada, "austrian cyrillic", arial, helvetica, mammilessymbol, sans-serif;'));
});
