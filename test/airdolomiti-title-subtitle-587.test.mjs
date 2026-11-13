/* eslint-disable max-len */
/* Air Dolomiti's page title from www's Title (standing order 4 of 2026-11-11, item 4; AD row 113; airdolomiti-parity-001
   /orario-voli at 1440 and 390, row 111's remainder): www's Title h1 has 20 px over it (Title_h2_headline: margin 20px
   0, so 44 px under the trail with the text's 24) and its subtitle (Title_subtitle) is a 16 / 22 px line across the page. Ours: the title 20 px higher, the line the
   lead paragraph (22 / 30 px, 66 % wide: two lines). The theme sets www's for a section with the style compact-title
   (the importer's for www's Title as the page's H1).
   Run: node --test test/airdolomiti-title-subtitle-587.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i > 0, `the rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};

test('www\'s Title: 20 px lower than a page title (the text 44 px under the trail), 20 px under it; a hidden title stays', () => {
  assert.match(rule('body.brand-airdolomiti main > .section.compact-title:not(.hidden-heading) > .breadcrumb-wrapper + .default-content-wrapper:has(> h1:first-child)'), /margin-top: 44px;/);
  assert.match(rule('body.brand-airdolomiti main > .section.compact-title .default-content-wrapper > h1:first-child'), /margin-bottom: 20px;/);
});

test('its subtitle a 16 / 22 px line across the page', () => {
  const r = rule('body.brand-airdolomiti main > .section.compact-title .default-content-wrapper > h1:first-child + p');
  assert.match(r, /max-width: none;/);
  assert.match(r, /font-size: 16px;/);
  assert.match(r, /line-height: 22px;/);
});
