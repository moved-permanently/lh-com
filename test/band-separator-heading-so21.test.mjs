/* eslint-disable max-len */
/* Standing order 21 (2026-11-14), item 2 (from ema-test's order 18 ranking): order 18's separator-wrapper rule (-24px for a
   wrapper of separator paragraphs after a padded Columns Media, before a grey column band; measured on
   /de/en/childrens-menus-on-board, where the band is an AEM section of its own that opens with the card view) took 47 px
   off www's spacing on /de/en/baggage. There the grey view is a component of the same AEM section and opens with its own
   title, a heading at the top of our band. The rule now leaves bands that open with a heading.
   Census of the 9,912 published copies (logs/b613/bag-census.py): the rule reaches 39 documents; 4 have a band that opens
   with a heading (de/en and gb/en baggage, de/de and at/de gepaeck); the other 35 (childrens-menus-on-board,
   kindermenues-an-bord, first-class, 100-years/cabin-design) keep the rule. With working-copy code: baggage 10.2 / 7.1 -> 5.0 / 1.7 % at 390 / 1440, as tall as www's;
   childrens-menus-on-board 5.9 / 0.7 unchanged.
   Run: node --test test/band-separator-heading-so21.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');

test('the separator wrapper before a grey column band moves up 24px, not when the band opens with a heading', () => {
  const sel = 'body.brand-lufthansa main > .section:has(+ .section.grey.column-band):not(:has(+ .section > .default-content-wrapper:first-child > :is(h2, h3, h4):first-child)) > .columns-media-wrapper:has(> .columns-media.padded) + .default-content-wrapper:last-child:not(:has(> :not(p.spacer))) {';
  const at = css.indexOf(sel);
  assert.ok(at > 0, 'the narrowed rule');
  assert.match(css.slice(at, css.indexOf('}', at)), /margin-top: -24px;/);
  assert.equal(css.split('.section:has(+ .section.grey.column-band) > .columns-media-wrapper:has(> .columns-media.padded)').length, 1, 'no unnarrowed copy left');
});
