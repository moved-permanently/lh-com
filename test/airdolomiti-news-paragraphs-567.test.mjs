/* eslint-disable max-len */
/* Air Dolomiti's lead text (columns-media news, www's DescritionNews; the standing order of 2026-11-10, item 6, AD row 96;
   airdolomiti-parity-001, the in-flight entertainment pages): www's paragraphs have no margin, but its authors start them
   with line breaks (en: <p><br>…, <p><br><br>…) or put an &nbsp; paragraph between (it), so a blank line or two (33 px each)
   sits between them; the import trims a paragraph's leading breaks and drops empty paragraphs (a blank line at a
   paragraph's start does not survive Edge Delivery either). The brand's text default (row 35: a blank line between the
   paragraphs) is given to the lead's text: one line (33 px) between two paragraphs.
   Run: node --test test/airdolomiti-news-paragraphs-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

test('a blank line (33 px, the text\'s line) between two of the lead\'s paragraphs', () => {
  const sel = 'body.brand-airdolomiti .columns-media.news .columns-media-text p + p';
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-top: 33px;/);
});

test('the lead\'s text keeps 33 px lines and no margin of its own', () => {
  const i = css.indexOf('body.brand-airdolomiti .columns-media.news .columns-media-text p {');
  const rule = css.slice(i, css.indexOf('}', i));
  assert.match(rule, /margin: 0;/);
  assert.match(rule, /line-height: 33px;/);
});
