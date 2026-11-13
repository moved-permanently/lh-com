/* eslint-disable max-len */
/* ITA's column-view headings (the standing order of 2026-11-10 evening, item a; ITA row 31): www's headings in a two-column
   view are heading-small (28 px at 1440, 22 at 375; 12 of 13 on ita-parity-004 and -003). The import's collapse turns the
   one-step size into the level's default (decision D of the token-free pass), so a Columns Media heading rendered 36 px
   (/it/en/support/utilities/invoicing "Flight Certification"). The ITA theme sets an unmarked H2 in a Columns Media
   block's text in heading-small's size; a marked heading (a heading-* class) keeps its own, and so do the blocks whose
   title option sets the size (title-large, title-compact), and the sidebar layout (its text column holds the page's own headings).
   Run: node --test test/ita-column-view-headings-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const SEL = 'body.brand-ita main .columns-media:not(.title-large, .title-compact, .sidebar) .columns-media-text h2:not([class*="heading-"])';

test('an unmarked Columns Media heading in heading-small\'s size (22 to 28 px), 110 % lines', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  const rule = css.slice(i, css.indexOf('}', i));
  assert.match(rule, /font-size: var\(--heading-font-size-l\);/);
  assert.match(rule, /line-height: 1\.1;/);
});

test('heading-small\'s size is 22 px at 375 to 28 px from 1440 (styles.css)', () => {
  const styles = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');
  assert.match(styles, /--heading-font-size-l: calc\(22px \+ 6 \* \(100vw - 375px\) \/ 1065\);/);
  assert.match(styles, /--heading-font-size-l: 28px;/);
});
