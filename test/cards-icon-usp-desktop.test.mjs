/* eslint-disable max-len */
/* Row 22 of tools/reports/lufthansa/parity.md (brief 407): additional-services' icon tiles
   (cards-icon usp) 130 px tall at 1440 where www's are 120 (the capture lufthansa-parity-001: 6 px
   above, the 88 px icon, the 26 px label). www's label keeps .teaser.usp .teaser-heading's 1rem
   below it on phones, but from 1025 px dcep's column view drops the last element's bottom margin
   (.column-view > .row > .column-view-item > :last-child > :last-child > :last-child
   { margin-bottom: 0 }, every dcep brand): brand-neutral, the label without its 10 px from 1025 px.
   Run: node --test test/cards-icon-usp-desktop.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/cards-icon/cards-icon.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('cards-icon usp: the label 10 px above the next row on phones, none from 1025 px (www\'s column view)', () => {
  assert.match(css, /\.cards-icon\.usp \.cards-icon-label \{ margin-bottom: 10px;/);
  const wide = css.slice(css.indexOf('@media (width >= 1025px) { .cards-icon.usp > ul'));
  assert.ok(wide.length < css.length, 'the 1025 px part');
  assert.match(wide.slice(0, wide.indexOf('@media (width >= 1281px)')), /\.cards-icon\.usp \.cards-icon-label \{ margin-bottom: 0; \}/);
});
