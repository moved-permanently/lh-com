/* eslint-disable max-len */
/* Standing order 47, item 2 (place 63): from 768 px, Cargo's second plain card row starts 41 px under the first row's last
   line, as www's fleet page (gate-so47-cargo-card-rows.txt); below 768 px row 39's rule (no margin) stays.
   Run: node --max-old-space-size=256 --test test/cargo-card-rows-gap-so47.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8');
const NOT = ':not(.three-up, .four-up, .overlay, .mosaic, .boxed)';
const SEL = `body.brand-cargo .cards-teaser-wrapper:has(> .cards-teaser${NOT}) + .cards-teaser-wrapper > .cards-teaser${NOT} {`;

test('the rule: 41 px from 768 px, plain card rows after plain card rows only', () => {
  const i = css.indexOf(SEL);
  assert.ok(i > 0, 'the rule is there');
  assert.equal(css.indexOf(SEL, i + 1), -1, 'once');
  const media = css.lastIndexOf('@media', i);
  assert.equal(css.slice(media, css.indexOf('{', media)).trim(), '@media (width >= 768px)');
  assert.equal(css.slice(i + SEL.length, css.indexOf('}', i)).trim(), 'margin-top: 41px;');
});

test('the phone rule (row 39) is unchanged', () => {
  const p = css.indexOf(`body.brand-cargo .cards-teaser-wrapper + .cards-teaser-wrapper > .cards-teaser${NOT} {`);
  assert.ok(p > 0);
  assert.equal(css.slice(p, css.indexOf('}', p)).split('{')[1].trim(), 'margin-top: 0;');
  assert.ok(p < css.indexOf(SEL), 'before the new rule');
});
