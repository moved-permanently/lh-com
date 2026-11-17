/* Standing order 66 (Group for Business, B2B theme): two grey bands in a row where the first is a picture-and-text row.
   www's two column views meet with their own paddings, 40 px between the rows' ink on phones and 80 from 768 px; ours had
   12 to 18 and 72 (celebrating-shared-stories, b2b-parity-001). The rule gives such a band 28 px under it on phones and
   8 from 768 px, against the next band's -48 px; bands of text cells only keep their 0.
   Run: node --test test/b2b-grey-media-band-so66.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-b2b main > .section.grey:has(> .columns-media-wrapper .columns-media-media):has(> .default-content-wrapper:last-child > p.column-mark.column-end-outer:last-child):has(+ .section.grey)';
const bodies = () => {
  const out = [];
  let i = css.indexOf(`${SEL} {`);
  while (i >= 0) {
    out.push([i, css.slice(i + SEL.length + 2, css.indexOf('}', i))]);
    i = css.indexOf(`${SEL} {`, i + 1);
  }
  return out;
};

test('B2B: a grey picture-and-text band before a grey band keeps 28 px on phones, 8 px from 768 px', () => {
  const b = bodies();
  assert.equal(b.length, 2, 'the rule and its 768 px step');
  assert.match(b[0][1], /margin-bottom: 28px;/);
  assert.match(b[1][1], /margin-bottom: 8px;/);
  const media = css.lastIndexOf('@media (width >= 768px) {', b[1][0]);
  assert.ok(media > b[0][0], 'the 8 px inside a 768 px media query after the phone rule');
});

test('it comes after the column-end rule that takes the band\'s margin away (the same property, more weight)', () => {
  const zero = css.indexOf('body.brand-b2b main > .section:has(> .default-content-wrapper:last-child > p.column-mark.column-end-outer:last-child):has(+ .section.grey),');
  assert.ok(zero >= 0, 'the column-end rule');
  assert.ok(zero < bodies()[0][0]);
});

test('bands of text cells only are not reached (no media cell in the selector, no other grey-to-grey margin)', () => {
  assert.ok(SEL.includes('.columns-media-media'));
  assert.equal(css.split('.section.grey:has(> .default-content-wrapper:last-child > p.column-mark.column-end-outer:last-child):has(+ .section.grey) {').length, 1);
});
