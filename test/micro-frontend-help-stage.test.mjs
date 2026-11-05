/* The help app's stage photo across the page (blocks/micro-frontend, every brand with
   help-center-web: SWISS parity row 19, Austrian's and ITA's contact stage). The app's own CSS draws
   it as www does, calc(100vw - 15px) wide and centred (left 50%, translate -50%; swiss-parity-001
   ch/en contact at 1440: x 0, 1425 x 375; at 390: 375 x 210; ITA's help page the same), but
   styles/styles.css's `main img { max-width: 100% }` held it to the 1264 px column. The block
   lifts that cap for the stage image only; the rest of the app stays in the column, as on www.
   Run: node --max-old-space-size=512 --test test/micro-frontend-help-stage.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('blocks/micro-frontend/micro-frontend.css', 'utf8').replace(/\s+/g, ' ');

test('the stage image is not capped to the column', () => {
  assert.ok(css.includes('.micro-frontend help-center-web .topic-selection-image-container img { max-width: none; }'), 'max-width lifted');
});

test('only the stage: the column and the wrapper are not widened', () => {
  assert.ok(!/micro-frontend-wrapper:has\(help-center-web\)/.test(css), 'the wrapper keeps its column');
  assert.ok(!/help-center-web[^{]*\{[^}]*(width: 100vw|margin-inline: calc)/.test(css), 'no breakout of the app');
});

test('styles.css still caps images in main (the cap the rule lifts)', () => {
  const styles = fs.readFileSync('styles/styles.css', 'utf8').replace(/\s+/g, ' ');
  assert.ok(/main img \{[^}]*max-width: 100%;/.test(styles));
});
