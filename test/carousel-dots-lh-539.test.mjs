/* eslint-disable max-len */
/* The brief after 539, item 1 (lufthansa.com parity, campaign and insights against lh-parity-004a/b): www draws the
   carousel's dots 58 px under the last slide's image or caption, on every recorded carousel (crane, destinations,
   san-diego). Ours drew them 65 px under an image and 77 px under a caption. The 56 px margin plus the 24 px target's
   8 px above the drawn 8 px dot (brief 404) made the 65, and the caption's 10 px bottom padding the rest. On
   lufthansa.com only, from 768 px: the dots 50 px under the slide (the drawn dot at 58), no padding under the caption.
   Run: node --test test/carousel-dots-lh-539.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/carousel-images/carousel-images.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  return i < 0 ? null : css.slice(i + sel.length + 2, css.indexOf('}', i)).trim();
};

test('lufthansa.com: the dots 50 px under the slide, the caption without its bottom padding', () => {
  assert.match(rule('body.brand-lufthansa .carousel-images .carousel-images-dots') || '', /margin-top: 50px;/);
  assert.match(rule('body.brand-lufthansa .carousel-images .carousel-images-caption') || '', /padding-bottom: 0;/);
  assert.ok(css.includes('@media (width >= 768px) { body.brand-lufthansa .carousel-images .carousel-images-dots {'), 'from 768 px only');
});

test('the other brands keep theirs', () => {
  assert.match(rule('.carousel-images .carousel-images-dots'), /margin: 56px 0 0;/);
  assert.match(rule('.carousel-images .carousel-images-caption'), /padding-bottom: 10px;/);
});
