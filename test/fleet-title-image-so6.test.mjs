/* eslint-disable max-len */
/* Standing order 6 (2026-11-12), item 1: the fleet pages after the so4 re-import. The image right below the page title
   ends the first section with 60 / 80 px (phones / from 768 px, "as on /de/en/359"), and since brief 461 the next
   section opens an outer column view whose own padding (20 / 40 px) comes on top: /de/en/359 and /de/en/744 put the
   first heading 40 px lower than www at 1440 (225 px of ink under the aircraft on www, 265 ours) and 19 px at 390. With
   40 px there (measured as injected CSS on our live host, % off www at 1440 / 390): 359 5.9 / 8.8 -> 3.7 / 7.6,
   744 7.7 / 12.4 -> 5.0 / 11.4; the six other recorded fleet pages unchanged (no such opening). 42 published documents
   have it.
   Run: node --max-old-space-size=256 --test test/fleet-title-image-so6.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa main > .section:has(+ .section > .default-content-wrapper:first-child > .column-start-outer:first-child) > .default-content-wrapper > h1 + p:has(> picture):last-child';
const BASE = 'main .default-content-wrapper > h1 + p:has(> picture):last-child';

test('the title image before an outer column view: 40 px below it', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i + SEL.length, css.indexOf('}', i)), /margin-bottom: 40px;/);
});

test('it wins over the 60 / 80 px rule at every width: higher specificity, not inside a media query, after it', () => {
  const i = css.indexOf(`${SEL} {`);
  const media = css.lastIndexOf('@media', i);
  assert.ok(media < 0 || css.indexOf('}', css.indexOf('{', media)) < i || css.slice(media, i).split('{').length === css.slice(media, i).split('}').length, 'top level');
  assert.ok(css.indexOf(`${BASE} {`) < i, 'after the base rule');
  assert.ok(!/:has\([^()]*:has\(/.test(SEL), 'one :has() level');
});
