/* eslint-disable max-len */
/* Standing order 14 (2026-11-12): Austrian online-check-in's last gap against austrian-parity-017 (its full-page
   screenshots scanned row by row; the offline render cannot rebuild the maui components). The App part is www's since
   standing order 8 (test/austrian-app-part-so8.test.mjs). Below "Is there anything you are still unsure about?":
   - its FAQ button to "Experience a seamless travel experience with Travel ID": www 84 px, ours 34 (the H2's 32 px
     over the button's 24): the H2 82 px under the button at every width;
   - the Travel ID row to the divider line: www 140 px at 1440, 122 at 390, ours 48 / 51 (the section's 48 px): the
     divider section 140 px under it from 1025 px, 119 below.
   Only on pages with option steps (online-check-in's nine documents: the steps row, the App part, the FAQ button, the
   Travel ID row and the divider section in that order); no nested :has (the browser drops such a rule). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8');
const start = css.indexOf('/* the end of online-check-in');
const part = css.slice(start, css.indexOf('/* the app part under the numbered steps'));
const SECTION = 'body.brand-austrian main > .section:has(.columns-media.steps)';
const rule = (sel, from = part) => {
  const at = from.indexOf(`${sel} {`);
  return at < 0 ? null : from.slice(at, from.indexOf('}', at));
};

test('the FAQ button 82 px over the Travel ID heading, every width', () => {
  assert.ok(start >= 0 && part.length > 0, 'the part, before the app part (whose test reads to the end of the file)');
  assert.match(rule(`${SECTION} .accordion-columns-wrapper + .default-content-wrapper > .button-wrapper + h2`) || '', /margin-top: 82px;/);
});

test('the divider section after the steps section: 119 px under it, 140 from 1025 px', () => {
  assert.match(rule(`${SECTION} + .section.divider`) || '', /margin-top: 119px;/);
  const wide = part.slice(part.indexOf('@media (width >= 1025px)'));
  assert.match(rule(`  ${SECTION} + .section.divider`, wide) || '', /margin-top: 140px;/);
});

test('every selector names the steps option and nests no :has', () => {
  const selectors = [...part.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/^\s*([^@{}/][^{}]*?)\s*\{/gm)].map((m) => m[1].trim()).filter((s) => !s.startsWith('@'));
  assert.equal(selectors.length, 3);
  selectors.forEach((s) => {
    assert.ok(s.startsWith(SECTION), s);
    assert.doesNotMatch(s, /:has\([^)]*:has\(/);
  });
});
