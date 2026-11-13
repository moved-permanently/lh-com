/* eslint-disable max-len -- tests */
/* TAP row 138: text cards one a row (cards one-up, www's itemsPerRow 1: time-to-think's steps in eight languages) as
   www's: the title 24 / 28.8 px, 500, 8 px over the text; 32 px under the heading over the cards; without a button the
   empty button row's 48 px under the text (the card body's 24 px margin under it). tap.css only, TAP only, one-up only.
   Run: node --test test/tap-one-up-cards-138.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const at = css.indexOf('/* TAP row 138');
const body = css.slice(css.indexOf('*/', at) + 2);
const rule = (sel) => {
  const i = body.indexOf(`${sel} {`);
  return i < 0 ? null : body.slice(i, body.indexOf('}', i));
};

test('the one-up cards: title, gap under the heading, the foot without a button', () => {
  assert.ok(at > 0);
  assert.match(rule('body.brand-tap main .default-content-wrapper:has(> :is(h2, h3):last-child) + .cards-wrapper:has(> .cards.one-up)'), /margin-top: 32px;/);
  const title = rule('body.brand-tap .cards.one-up .cards-card-body > :is(h2, h3, h4):first-child');
  ['margin-bottom: 8px;', 'font-size: 24px;', 'font-weight: 500;', 'line-height: 1.2;'].forEach((d) => assert.ok(title.includes(d), d));
  assert.match(rule('body.brand-tap .cards-wrapper > .cards.one-up > ul > li:not(:has(a)) > .cards-card-body'), /padding-bottom: 48px;/);
  assert.match(rule('body.brand-tap .cards-wrapper > .cards.one-up > ul > li:not(:has(a)) > .cards-card-body > :last-child'), /margin-bottom: 0;/);
});

test('every selector of the part is TAP\'s and one-up\'s, none nests :has', () => {
  const part = body.slice(0, body.search(/\n\/\*|$/) > 0 ? body.search(/\n\/\*/) : body.length);
  const sels = [...part.matchAll(/^(body[^{]+)\{/gm)].map((m) => m[1].trim());
  assert.equal(sels.length, 4);
  sels.forEach((s) => {
    assert.ok(s.startsWith('body.brand-tap ') && s.includes('.cards.one-up'), s);
    assert.doesNotMatch(s, /:has\([^)]*:has\(/);
  });
});
