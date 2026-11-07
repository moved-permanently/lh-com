/* eslint-disable max-len */
/* Air Dolomiti's text blocks' button (parity row 56, brief 456): www's TitleDescriptionTextCta
   ends in its outline button (style_btn_outline: a 1 px teal ring, no fill, the label 16 / 22 px
   500, 18px 40px, the arrow 28 px 16 px after it; 9 of 9 in the archive: assistance, the fleet's
   "Learn more about Air Dolomiti", the destinations' airport links), so the importer writes it as
   the secondary button (<em>) and the theme gives the secondary button in the text www's ring.
   lazyblock/title-description-cta (not in the archive) keeps the primary button. Offline: the
   homepage fixture of airdolomiti-herohome.test.mjs with the text blocks in its blocks.
   Run: node --max-old-space-size=512 --test test/airdolomiti-cta-outline-456.test.mjs */
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
const HOME = 'https://www.airdolomiti.eu/';
const rendered = readFileSync(path.join(FIXTURE, 'snapshots/www.airdolomiti.eu/index.html'), 'utf8');
const NEXT = /(<script id="__NEXT_DATA__" type="application\/json"[^>]*>)([\s\S]*?)(<\/script>)/;
const FORM = 'https://hda_s_form.airdolomiti.it/CustomerPortal_Forms/#/Page/SVC_CATALOG@item-5--8';
const withBlocks = (blocks) => rendered.replace(NEXT, (m, open, json, close) => {
  const data = JSON.parse(json);
  data.props.pageProps.post.blocks.push(...blocks);
  return `${open}${JSON.stringify(data)}${close}`;
});

test('lazyblock/title-description-text-cta: the title, its text, then the button as the secondary (outline) button', () => {
  const { html } = convert(withBlocks([{ name: 'lazyblock/title-description-text-cta', attributes: { tag: 'h2', title: 'Assistance for persons with disabilities', description: '<p>Request assistance at least 48 hours before departure.</p>', url: FORM, ctaText: 'Request assistance' } }]), HOME);
  assert.match(html, /<h2[^>]*>Assistance for persons with disabilities<\/h2><p>Request assistance at least 48 hours before departure\.<\/p><p><em><a href="https:\/\/hda_s_form\.airdolomiti\.it\/[^"]*">Request assistance<\/a><\/em><\/p>/);
  assert.ok(!/<strong><a [^>]*>Request assistance/.test(html), 'not the primary button');
});

test('lazyblock/title-description-cta keeps the primary button', () => {
  const { html } = convert(withBlocks([{ name: 'lazyblock/title-description-cta', attributes: { tag: 'h2', title: 'Our network', subTitle: 'Flights across Europe.', ctaUrl: FORM, textCta: 'Discover our network' } }]), HOME);
  assert.match(html, /<p><strong><a href="[^"]+">Discover our network<\/a><\/strong><\/p>/);
});

const css = readFileSync('styles/themes/airdolomiti.css', 'utf8');
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, `rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};
const BTN = 'body.brand-airdolomiti main .default-content-wrapper a.button.secondary';

test('the secondary button in the text: www\'s outline button (a 1 px teal ring, no fill, 16 / 22 px 500, 18px 40px)', () => {
  const r = rule(BTN);
  assert.match(r, /gap: 16px;/);
  assert.match(r, /border-width: 1px;/);
  assert.match(r, /background-color: transparent;/);
  assert.match(r, /padding: 18px 40px;/);
  assert.match(r, /font-size: 16px;/);
  assert.match(r, /font-weight: 500;/);
  assert.match(r, /line-height: 22px;/);
});

test('its arrow 28 px after the label, and on hover the lighter teal ring and text with no fill', () => {
  const a = rule(`${BTN}::after`);
  assert.match(a, /width: 28px;/);
  assert.match(a, /height: 28px;/);
  assert.match(a, /mask: url\("data:image\/svg\+xml/);
  const h = rule(`${BTN}:is(:hover, :focus-visible)`);
  assert.match(h, /border-color: #0093a8;/);
  assert.match(h, /background-color: transparent;/);
  assert.match(h, /color: #0093a8;/);
});
