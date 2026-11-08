/* eslint-disable max-len, import/extensions -- dev tooling */
/* B2B round 2, row 11 (brief 421, tools/reports/b2b/parity.md): a stage inside a two-column view
   (www's .stage > .stage-teaser: partner-plus-benefit's "Save while flying" | text and text |
   BusinessToGo, eXperts' and hygiene-and-safety's two stages side by side) stays in its half as
   www shows it: the picture, the headline (18/24 bold) and subheadline (28/32) over it on a white
   (or, for .stage-teaser-link-light, black) gradient from the left, a small outlined button (not on
   phones), the whole picture the link; not a full-width hero-card-overlay with a navy card.
   - b2b-import.mjs: such a column view between two marker paragraphs (withStageColumnMarkers, the
     variant in the opening one), after the import the run between them one columns-media block of
     option stage (light) with a cell per stage and per run of text (withStageColumns);
   - styles/themes/b2b.css: the option's look.
   Run: node --max-old-space-size=512 --test test/b2b-stage-columns.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { withStageColumnMarkers, withStageColumns } from '../tools/importer/b2b-import.mjs';

const stage = (headline, sub, light = false) => `<div class="stage event section"><div class="stage-teaser"><a class="stage-teaser-link ${light ? 'stage-teaser-link-light' : ''}" href="https://example.com/x"><div class="image-wrapper"><img src="/content/dam/x.jpg"></div><div class="gradient ${light ? 'gradient-black-horizontal' : 'gradient-white-horizontal'}"></div><div class="stage-teaser-overlay"><h2 class="stage-teaser-headline">${headline}</h2><h3 class="stage-teaser-subheadline">${sub}</h3></div></a></div></div>`;
const twocol = (items) => `<div class="twocolumn column event"><div class="column-view flex-column"><div class="row">${items.map((i) => `<div class="col-md-6 col-lg column-view-item">${i}</div>`).join('')}</div></div></div>`;

test('withStageColumnMarkers: a column view holding a stage between two markers, the variant named; other column views as they are', () => {
  const ppb = twocol([stage('Save while flying', 'with PartnerPlusBenefit'), '<div class="text"><div class="richtext"><p>Have you started</p></div></div>']);
  const out = withStageColumnMarkers(`<div class="container-content">${ppb}</div>`);
  assert.match(out, /^<div class="container-content"><div class="text section"><div class="richtext"><p>@@stage-columns@@default@@<\/p><\/div><\/div><div class="twocolumn column event">/);
  assert.match(out, /<\/div><div class="text section"><div class="richtext"><p>@@stage-columns-end@@<\/p><\/div><\/div><\/div>$/);
  const experts = withStageColumnMarkers(twocol([stage('Modern airline retailing', 'NDC Partner Program', true), stage('Current flight information', 'Help', true)]));
  assert.match(experts, /@@stage-columns@@light@@/);
  const plain = twocol(['<div class="text"><p>a</p></div>', '<div class="image"><img src="/b.jpg"></div>']);
  assert.equal(withStageColumnMarkers(plain), plain);
  // a stage of its own (not in a column view) stays the page stage
  const top = `<div class="container-content">${stage('Top', 'Sub')}</div>`;
  assert.equal(withStageColumnMarkers(top), top);
});

const hero = (h, sub, href, btn) => `<div class="hero-card-overlay"><div><div><picture><img src="./media_1.jpg" alt=""></picture></div></div><div><div><h2 id="x">${h}</h2><p>${sub}</p><p><em><a href="${href}">${btn}</a></em></p></div></div></div>`;

test('withStageColumns: the run between the markers one columns-media stage block: a cell per stage (the picture linked to its target, the headline, the subheadline as an h3, the button), a cell per run of text; the column markers inside go', () => {
  const doc = `<div><h1>Score and benefit</h1><p>@@stage-columns@@default@@</p><p>{column-start-outer}</p>${hero('Save while flying', 'with PartnerPlusBenefit', 'https://www.partnerplusbenefit.com', 'Register now')}<p>Have you started your own business?</p><p>PartnerPlusBenefit is free. {column-end-outer}</p><p>@@stage-columns-end@@</p><h2>Next</h2></div>`;
  const out = withStageColumns(doc);
  assert.equal(out, '<div><h1>Score and benefit</h1><div class="columns-media stage"><div><div><p><a href="https://www.partnerplusbenefit.com"><picture><img src="./media_1.jpg" alt=""></picture></a></p><h2 id="x">Save while flying</h2><h3>with PartnerPlusBenefit</h3><p><em><a href="https://www.partnerplusbenefit.com">Register now</a></em></p></div><div><p>Have you started your own business?</p><p>PartnerPlusBenefit is free.</p></div></div></div><h2>Next</h2></div>');
  // two light stages side by side; text | stage keeps its order
  const two = withStageColumns(`<div><p>@@stage-columns@@light@@</p>${hero('Modern airline retailing', 'NDC Partner Program', '/a', 'Learn More')}${hero('Current flight information', 'Help', '/b', 'Learn More')}<p>@@stage-columns-end@@</p></div>`);
  assert.match(two, /^<div><div class="columns-media stage light"><div><div><p><a href="\/a">.*<\/div><div><p><a href="\/b">.*<\/div><\/div><\/div><\/div>$/);
  const textFirst = withStageColumns(`<div><p>@@stage-columns@@default@@</p><h2>New: BusinessToGo {column-start-outer}</h2><p>In partnership with Navan.</p>${hero('Lufthansa Group', 'BusinessToGo', '/btg', 'Learn more')}<p>{column-end-outer}</p><p>@@stage-columns-end@@</p></div>`);
  assert.match(textFirst, /^<div><div class="columns-media stage"><div><div><h2>New: BusinessToGo<\/h2><p>In partnership with Navan.<\/p><\/div><div><p><a href="\/btg"><picture>/);
  // a merged marker keeps its other tokens
  assert.match(withStageColumns(`<div><p>@@stage-columns@@default@@</p><h2>T {heading-small column-start-outer}</h2>${hero('A', 'B', '/c', 'Go')}<p>@@stage-columns-end@@</p></div>`), /<h2>T \{heading-small\}<\/h2>/);
  // the import's cleanup may write a text style after a marker ("@@stage-columns@@light@@ {full-width}")
  assert.match(withStageColumns(`<div><p>@@stage-columns@@light@@ {full-width}</p>${hero('A', 'B', '/c', 'Go')}<p>@@stage-columns-end@@ {full-width}</p></div>`), /^<div><div class="columns-media stage light">/);
  assert.equal(withStageColumns('<div><p>x</p></div>'), '<div><p>x</p></div>');
  assert.equal(withStageColumns(out), out, 'idempotent');
});

test('b2b-import.mjs: the markers before the import, the blocks after it', () => {
  const src = fs.readFileSync(new URL('../tools/importer/b2b-import.mjs', import.meta.url), 'utf8');
  assert.match(src, /withStageColumnMarkers\(withTabMarkers\(withB2bComponents\(/);
  assert.match(src, /withStageColumns\(withTabPanels\(splitTabSections\(doc\)\)\)/);
});

test('b2b.css: the stage cell as www\'s stage teaser in a column', () => {
  const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  const cell = 'body.brand-b2b .columns-media.stage .columns-media-text:has(> p:first-child > a > picture)';
  const at = css.indexOf(`${cell} {`);
  assert.ok(at > 0, 'the stage cell rule');
  assert.match(css.slice(at), /^[^}]*display: grid;[^}]*grid-template-rows: auto auto auto 1fr;/);
  assert.match(css, /> p:first-child \{ grid-area: 1 \/ 1 \/ -1 \/ 2;/);
  // the texts on the picture's rows (auto-placed they would go under it): headline 1, subheadline 2,
  // the button 3
  assert.match(css, /> p:has\(> em > a, > a\.button\) \{ grid-row: 3;/);
  assert.match(css, /> h2 \{ grid-row: 1;/);
  assert.match(css, /> h3 \{ grid-row: 2;/);
  assert.match(css, /linear-gradient\(90deg, rgb\(255 255 255 \/ 85%\) 0, transparent 66%\)/);
  assert.match(css, /\.columns-media\.stage\.light [^{]*::after \{ background-image: linear-gradient\(90deg, rgb\(0 0 0 \/ 60%\) 0, transparent 66%\); \}/);
  // headline 18/24 bold, subheadline 24/28 (28/32 from 1281 px), the button small (on phones too since
  // the brief after 505: b2b-stage-button-phones-506)
  assert.match(css, /> h2 \{[^}]*font-size: 18px;[^}]*line-height: 24px;[^}]*font-weight: 700;/);
  assert.match(css, /> h3 \{[^}]*font-size: 24px;[^}]*line-height: 28px;[^}]*font-weight: 400;/);
});
