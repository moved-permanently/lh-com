/* eslint-disable max-len */
/* Cargo's transport stories, brief 439: the story picture modules (hero-card-overlay (light),
   styles/themes/cargo.css row 14) on phones. The block is a grid with one column; sized by its
   content, the column grew to the card's longest word (a 33 px title word such as "UNACCOMPANIED"
   plus the card's 68 px sides) and the picture with it: 123-flying-horses 83 px and from-above-48
   54 px wider than a 390 px screen (sideways scroll). www's .module--story is block flow, its text
   box 68 px in from both sides whatever the words. Now the column is the block's width (a
   word's break-word, set for every heading in styles.css, does not narrow an auto column).
   Run: node --test test/cargo-stories-439.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

test('the story module\'s one grid column is the block\'s width, not its longest word\'s', () => {
  has(/body\.brand-cargo \.hero-card-overlay\.light \{[^}]*display: grid;[^}]*grid-template-columns: minmax\(0, 1fr\);/);
});

test('a title word too long for the text box breaks (styles.css: every heading, at every width; a theme sets no wrapping)', () => {
  const base = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');
  assert.match(base, /h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6 \{[^}]*overflow-wrap: break-word;/);
  assert.doesNotMatch(css, /overflow-wrap/);
});
