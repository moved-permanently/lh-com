/* eslint-disable max-len */
/* Standing order 27, item 4: a picture in an Austrian full-bleed section fills the width, as www's
   .image-wrapper.full-width-bg does. /at/en/fly/on-board/culinary-services' media is 1,277 px wide and was drawn at that
   width at 1440 (459 px high; www 1,440 x 518): 1440 -1.34 -> -0.64 %. On the 121 recorded Austrian pages only that
   page-width moves; at 390 every such picture already fills the width.
   Run: node --max-old-space-size=256 --test test/austrian-full-bleed-picture-so27.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const SEL = 'body.brand-austrian main > .section.full-bleed > .default-content-wrapper > p > picture > img';
const rule = () => {
  const at = css.indexOf(`${SEL} {`);
  return at < 0 ? '' : css.slice(at, css.indexOf('}', at));
};

test('a full-bleed picture is as wide as the section, its height from its own ratio', () => {
  const r = rule();
  assert.match(r, /width: 100%;/);
  assert.match(r, /height: auto;/);
});

test('only in full-bleed sections and only on Austrian pages', () => {
  assert.ok(!css.includes('.section > .default-content-wrapper > p > picture > img { width: 100%'));
  assert.ok(!fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').includes(`${SEL.replace('body.brand-austrian ', '')} {`));
});
