/* eslint-disable max-len */
/* Standing order 20 (2026-11-14), item 1: the general grey-band rule (ranking-so12's column-band-plain, held since order
   13): a grey column band before an unstyled section that opens with default content has no section gap, as www's band
   ends with its own padding there. It skips bands before a padded AEM section on www (before-padded: ana), bands that end
   with a list, and next sections that open with their own column-start paragraph or the sub-page navigation. Gate, live
   on our host with this order's rows as drafts (stacked jump links, empty lines, before-padded), 51 page-widths: 21
   better, none worse by more than 0.5, about -90 points (entryprocesses 28.6 / 17.0 -> 16.4 / 6.3 at 390 / 1440).
   It waits on branch so20-grey-band-rule for the rows that need it (delta-so20-grey-band-and-info-pages-lh-com.txt).
   Run: node --test test/grey-band-rule-so20.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');

test('the general band rule: no section gap under a grey column band before a plain section, before-padded skipped', () => {
  const at = css.indexOf('body.brand-lufthansa main > .section.grey.column-band:not(:has(> .default-content-wrapper:last-child > :is(ul, ol):last-child)):has(+ .section:not(.grey, .padded, .stage, .spaced, .flush, .column-view, .column-band, .campaign-section, .gap) > .default-content-wrapper:first-child)');
  assert.ok(at > 0, 'the rule');
  const rule = css.slice(at, css.indexOf('}', at));
  assert.match(rule, /:not\(:has\(\+ \.section > \.default-content-wrapper:first-child > p\.column-start:first-child\), :has\(\+ \.section > \.subpage-nav-wrapper\), \.before-padded\) \{/);
  assert.match(rule, /margin-bottom: 0;/);
});
