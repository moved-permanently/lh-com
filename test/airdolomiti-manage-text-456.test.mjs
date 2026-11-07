/* Air Dolomiti's manage booking text (parity row 40, brief 456): under the form, www's second
   TitleDescriptionPnr: 40px under the form, its paragraphs 19.44 / 33 px grey (#494949), centred,
   a blank line (33px, www's empty paragraphs) between them; the column as the title's (50vw from
   930px).
   Run: node --max-old-space-size=512 --test test/airdolomiti-manage-text-456.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/themes/airdolomiti.css', 'utf8');
const body = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, `rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};
const W = 'body.brand-airdolomiti main:has(.manage-booking) .manage-booking-wrapper ~ .default-content-wrapper';

test('the text 40px under the form (the form\'s own 48px margin off when text follows it)', () => {
  assert.match(body(W), /margin-top: 40px;/);
  assert.match(body('body.brand-airdolomiti main .manage-booking-wrapper:has(~ .default-content-wrapper) > .manage-booking'), /margin-bottom: 0;/);
});

test('its paragraphs 19.44 / 33 px grey, centred, a blank line between them', () => {
  const p = body(`${W} > p`);
  assert.match(p, /max-width: none;/);
  assert.match(p, /margin: 0 0 33px;/);
  assert.match(p, /color: #494949;/);
  assert.match(p, /font-size: 19\.44px;/);
  assert.match(p, /line-height: 33px;/);
  assert.match(p, /text-align: center;/);
});
