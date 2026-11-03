/* SWISS's FAQ topic icons (www: a.teaser.usp > h3.teaser-heading > img.icon.icon-svg + the title;
   the replica: an SVG picture first in a heading's link, default content): DCEP's .icon-svg size,
   4.8rem square, above the title, on SWISS's pages only (styles/styles.css, body.brand-swiss); no
   other brand's rule changes. Run: timeout 60 node --test test/swiss-faq-icons.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sel: m[1].trim(), body: m[2] }));
const icon = rules.filter((r) => r.sel.startsWith('body.brand-swiss main .default-content-wrapper > '));

test('the icon: 48px square, a block above the title, SVG pictures only, SWISS only', () => {
  const img = icon.find((r) => /\) img$/.test(r.sel));
  assert.equal(Boolean(img), true, 'a rule for the icon image');
  assert.match(img.body, /width:\s*48px/);
  assert.match(img.body, /height:\s*48px/);
  const pic = icon.find((r) => /\)$/.test(r.sel));
  assert.equal(Boolean(pic), true, 'a rule for the picture');
  assert.match(pic.body, /display:\s*block/);
  assert.equal(icon.length, 2);
  icon.forEach((r) => {
    assert.match(r.sel, /^body\.brand-swiss main \.default-content-wrapper > :is\(h2, h3, h4\) > a > picture:first-child:has\(img\[src\*="\.svg"\]\)( img)?$/, r.sel);
  });
});
