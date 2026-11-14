/* eslint-disable max-len */
/* Standing order 20 (2026-11-14), item 1: the general grey-band rule (ranking-so12's column-band-plain, held since order
   13): a grey column band before an unstyled section that opens with default content has no section gap, as www's band
   ends with its own padding there. It skips bands before a padded AEM section on www (before-padded: ana), bands that end
   with a list, and next sections that open with their own column-start paragraph or the sub-page navigation. Gate, live
   on our host with this order's rows as drafts (stacked jump links, empty lines, before-padded), 51 page-widths: 21
   better, none worse by more than 0.5, about -90 points (entryprocesses 28.6 / 17.0 -> 16.4 / 6.3 at 390 / 1440).
   It waited on branch so20-grey-band-rule for the rows that need it (delta-so20-grey-band-and-info-pages-lh-com.txt),
   merged by the owner as a9d5a50.
   Run: node --test test/grey-band-rule-so20.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');

test('the general band rule: no section gap under a grey column band before a plain section, before-padded skipped', () => {
  const at = css.indexOf('body.brand-lufthansa main > .section.grey.column-band:not(:has(> .default-content-wrapper:last-child > :is(ul, ol):last-child)):has(+ .section:not(.grey, .padded, .stage, .spaced, .flush, .column-view, .column-band, .campaign-section, .gap) > .default-content-wrapper:first-child)');
  assert.ok(at > 0, 'the rule');
  const rule = css.slice(at, css.indexOf('}', at));
  assert.match(rule, /:not\(:has\(\+ \.section > \.default-content-wrapper:first-child > p\.column-start:first-child\), :has\(\+ \.section > \.subpage-nav-wrapper\), \.before-padded,/);
  assert.match(rule, /margin-bottom: 0;/);
});

/* After the merge (a9d5a50), live: entry-exit-system 10.6 / 16.3 against the predicted 9.7 / 15.3 (not a gate page): its
   band is spaced (the importer's 24px before a headline or text) and the next section opens with the FAQ title. A spaced
   band before a heading keeps its 24px; before a paragraph (online-check-in, 10.7 at 1440 with 0, 14.2 with 24) the rule
   still applies. Census of the published copies: these two pages (and their language versions) have spaced bands; none of
   the gate's pages. With --local: entry-exit-system 9.7 / 15.3, online-check-in 10.7 unchanged. */
test('the general band rule skips a spaced band whose next section opens with a heading', () => {
  const at = css.indexOf('body.brand-lufthansa main > .section.grey.column-band:not(:has(> .default-content-wrapper:last-child > :is(ul, ol):last-child))');
  const rule = css.slice(at, css.indexOf('}', at));
  const skips = rule.slice(rule.lastIndexOf(':not('));
  assert.match(skips, /\.spaced:has\(\+ \.section > \.default-content-wrapper:first-child > :is\(h2, h3, h4\):first-child\)\) \{/);
  assert.ok(!/\.spaced[,)]/.test(skips), 'only spaced bands before a heading are skipped, not every spaced band');
});
