/* eslint-disable max-len */
/* The destination finder's footer in www's DOM order, every brand (Brussels accessibility row A4;
   the parity captures of Brussels, SWISS, Austrian, ITA and Discover: the "All offers &
   destinations" maui-button-link comes before .recommender-footer-conditional-content, the
   disclaimer and Conditions): the controls and the link first, then the notes, so the Tab order
   follows what phones show (the link above the notes); from 768 px the notes drawn first (CSS
   order), as www's reversed .recommender-footer (the notes left, the controls and the link right).
   No CSS order moves the link any more. Run: node --max-old-space-size=256 --test test/destination-finder-footer-order.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync(new URL('../blocks/destination-finder/destination-finder.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../blocks/destination-finder/destination-finder.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('the slider\'s footer: the controls and the link before the notes', () => {
  assert.ok(js.includes('  footer.append(controls);\n  if (cta) footer.append(cta);\n  if (notes.children.length) footer.append(notes);'), 'controls, link, notes');
  assert.equal(js.includes('  if (notes.children.length) footer.append(notes);\n  footer.append(controls);'), false, 'not the notes first');
});

test('the CSS keeps the DOM order on phones and draws the notes first from 768 px', () => {
  assert.equal(/\.destination-finder \.destination-finder-cta \{ order: -1; \}/.test(css), false, 'no order -1 on the link');
  assert.ok(/@media \(width >= 768px\) \{[^@]*\.destination-finder \.destination-finder-notes \{ flex: 1 1 auto; order: -1;/.test(css), 'the notes drawn first from 768 px');
});
