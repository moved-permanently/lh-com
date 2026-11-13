/* eslint-disable max-len */
/* Air Dolomiti's German in-flight entertainment page (standing order 4 of 2026-11-11, item 1; AD row 108;
   airdolomiti-parity-005 /dienstleistungen-an-bord/unterhaltung-an-bord at 1440 and 390): www.airdolomiti.de puts a
   TitleDescriptionTextCta with a title only (no text, no button) before its DescritionNews lead and draws that title
   behind the fixed bar (y 20): no title on screen, the trail in a row of its own, the picture at 235 (1440) / 242 (390).
   Ours showed the title as a visible H1 in that gap (and 40 px more at 390). The importer now writes such a title as the
   page's H1 with the section styles hidden-heading (screen readers keep it) and lead-under-trail; the theme leaves row
   95's pull under the bar out for lead-under-trail and puts the picture 94 px (73 from 930 px) under the trail.
   en and it (a DescritionNews alone, row 95) unchanged.
   Offline: a trimmed copy of the recording (test/fixtures/airdolomiti-ife-de) and the site data of the herohome fixture.
   Run: node --max-old-space-size=512 --test test/airdolomiti-german-lead-587.test.mjs */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURE = fileURLToPath(new URL('./fixtures/airdolomiti-herohome/', import.meta.url));
const SITE = fileURLToPath(new URL('../content-sites/lh-airdolomiti/', import.meta.url));
const EXISTS = JSON.parse(fs.readFileSync(path.join(FIXTURE, 'exists.json'), 'utf8'));
const { readFileSync, existsSync, openSync } = fs;
const siteFile = (p) => (typeof p === 'string' && p.startsWith(SITE) ? path.relative(SITE, p) : null);
fs.readFileSync = (p, ...rest) => (siteFile(p) === null ? readFileSync(p, ...rest) : readFileSync(path.join(FIXTURE, siteFile(p)), ...rest));
fs.existsSync = (p) => (siteFile(p) === null ? existsSync(p) : EXISTS[siteFile(p)] === true);
fs.openSync = (p, ...rest) => (siteFile(p) === null ? openSync(p, ...rest) : openSync(path.join(FIXTURE, siteFile(p)), ...rest));
after(() => {
  fs.readFileSync = readFileSync;
  fs.existsSync = existsSync;
  fs.openSync = openSync;
});

// eslint-disable-next-line import/extensions
const { convert } = await import('../tools/importer/airdolomiti-import.mjs');
const rendered = readFileSync(fileURLToPath(new URL('./fixtures/airdolomiti-ife-de/unterhaltung-an-bord.html', import.meta.url)), 'utf8');
const { html } = convert(rendered, 'https://www.airdolomiti.de/dienstleistungen-an-bord/unterhaltung-an-bord');
const css = readFileSync(fileURLToPath(new URL('../styles/themes/airdolomiti.css', import.meta.url)), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

test('the title-only text before the lead: the page\'s H1, the section hidden-heading and lead-under-trail', () => {
  assert.match(html, /^<div><h1>Unterhaltung an Bord<\/h1><div class="columns-media news">/);
  assert.equal((html.match(/<h1>/g) || []).length, 1);
  assert.match(html, /<div class="section-metadata"><div><div>Style<\/div><div>hidden-heading, lead-under-trail<\/div><\/div><\/div>/);
  assert.match(html, /<h3>Unterhaltung an Bord<\/h3>/, 'the lead keeps its own title');
});

test('the theme: row 95\'s pull not for lead-under-trail; the picture 94 px under the trail, 73 from 930 px', () => {
  assert.ok(css.includes('main > .section.hidden-heading:not(.lead-under-trail):first-child > .breadcrumb-wrapper:first-child ~ .columns-media-wrapper:has(> .columns-media.news) {'));
  assert.ok(!css.includes('main > .section.hidden-heading:first-child > .breadcrumb-wrapper:first-child ~ .columns-media-wrapper'), 'no pull rule without the exclusion');
  const sel = 'body.brand-airdolomiti main > .section.hidden-heading.lead-under-trail > .breadcrumb-wrapper ~ .columns-media-wrapper:has(> .columns-media.news) {';
  const first = css.indexOf(sel);
  const second = css.indexOf(sel, first + 1);
  assert.ok(first > 0 && second > first);
  assert.match(css.slice(first, css.indexOf('}', first)), /margin-top: 94px;/);
  assert.match(css.slice(second, css.indexOf('}', second)), /margin-top: 73px;/);
  assert.ok(css.lastIndexOf('@media (width >= 930px)', second) > first, 'the 73 px from 930 px');
});
