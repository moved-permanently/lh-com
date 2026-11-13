/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 582 item c, the token-free switch plan's B3: lufthansa.com's page titles in heading-medium (168 of the 6,826 census
   documents' first H1s, 85 later H1s) are one size step from the H1 default, so the collapse took them to heading-large
   (+61 px on /gb/en/lufthansa-travel-classes: 7.2 -> 33.8 % at 390 after the switch). The lufthansa theme keeps that
   step as a choice (nearChoices h1 heading-medium -> compact, headingChoices.h1.compact heading-medium): the collapse
   writes the section style "H1 compact" (h1-compact) and drops the marker; the site gives such a section's H1
   heading-medium once the theme is live. Measured with the theme on: travel-classes 33.8 -> 5.8 % (390), 15.0 -> 2.7
   (1440); food-and-beverages 28.2 -> 22.0, 21.3 -> 17.2. Other brands as before (no nearChoices).
   Run: node --max-old-space-size=256 --test test/h1-compact-582.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { readSectionStyle, headingChoice, themeFor } from '../scripts/style-markers.js';

const DOC = '<div><h1 id="find-your-favourite-place-heading-medium">Find your favourite place {heading-medium}</h1><p>Text.</p></div><div><h2 id="x">Classes</h2><p>More.</p></div>';
const run = (brand) => collapseHtml(DOC, { brand, force: true, path: '/gb/en/lufthansa-travel-classes', parse: (h) => parseHTML(h) });

test('lufthansa.com: an H1 marked heading-medium becomes the section style H1 compact, the marker goes', () => {
  const { html } = run('lufthansa');
  assert.ok(!html.includes('{heading-medium}'));
  assert.match(html, /<h1[^>]*>Find your favourite place<\/h1>/);
  assert.match(html, /<div class="section-metadata"><div><div>Style<\/div><div>[^<]*h1-compact[^<]*<\/div><\/div><\/div>/i);
});

test('another brand (no nearChoices): the one-step H1 marker takes the default, as before', () => {
  const { html } = run('swiss');
  assert.ok(!html.includes('{heading-medium}'));
  assert.ok(!/h1-compact/i.test(html));
});

test('the site: H1 compact is a section style, heading-medium in the lufthansa theme', () => {
  assert.equal(readSectionStyle('H1 compact').headings.h1, 'compact');
  assert.equal(headingChoice(themeFor('lufthansa'), 1, 'compact'), 'heading-medium');
  assert.equal(headingChoice(themeFor('swiss'), 1, 'compact'), null);
});
