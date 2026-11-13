/* eslint-disable max-len */
/* The brief after 588, item 3: the Brussels theme's list of links in a sidebar (three or more link paragraphs in a row
   in a columns-media sidebar cell: /contact/feedback's ten concern links, www's maui-navigation-link medium hyper):
   www's 16 px regular, 44 px apart, the space of www's empty line over the list, www's gap from the list's end to the
   footer. Measured on our host against brussels-parity-006 / -004: be/fr contact/feedback 1440 +3.9 -> -0.2 %, 390
   +6.4 -> -1.2 %; be/en 1440 +4.2 -> 0.0 %, 390 +4.4 -> -1.2 %; chase-the-sun, contact, contact-form-error and
   feedback/general/other unchanged (single link paragraphs: not a list). The rule tried in the brief after 584 (every
   Brussels link paragraph) made contact/feedback and chase-the-sun worse.
   Run: node --max-old-space-size=256 --test test/brussels-concern-links-588.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RUN = ':is(:has(+ p.link-wrapper + p.link-wrapper), p.link-wrapper + p.link-wrapper:has(+ p.link-wrapper), p.link-wrapper + p.link-wrapper + p.link-wrapper)';
const CELL = 'body.brand-brussels .columns-media.sidebar > div > div';

test('a run of three or more link paragraphs in a sidebar cell: 16 px regular, 20 px under each but the last', () => {
  assert.ok(css.includes(`${CELL} > p.link-wrapper${RUN} { margin-bottom: 20px; }`));
  assert.ok(css.includes(`${CELL} > p.link-wrapper${RUN}:last-child { margin-bottom: 0; }`));
  assert.ok(css.includes(`${CELL} > p.link-wrapper${RUN} > a { font-size: var(--body-font-size-s, 16px); font-weight: 400; }`));
});

test('the space over the list: 22 px, 69 from 1025 px', () => {
  const first = `${CELL} > :not(p.link-wrapper) + p.link-wrapper:has(+ p.link-wrapper + p.link-wrapper)`;
  assert.match(css, new RegExp(`${esc(first)} \\{ margin-top: 22px; \\}`));
  assert.match(css, new RegExp(`@media \\(width >= 1025px\\) \\{ ${esc(first)} \\{ margin-top: 69px; \\}`));
});

test('a list that ends the sidebar: no block padding under it, the section 49 px (39 from 1025 px) over the footer', () => {
  const end = 'p.link-wrapper + p.link-wrapper + p.link-wrapper:last-child';
  assert.ok(css.includes(`body.brand-brussels .columns-media.sidebar:has(> div > div > ${end}) { padding-bottom: 0; }`));
  const sec = `body.brand-brussels main > .section:has(> .columns-media-wrapper:last-child > .columns-media.sidebar > div > div > ${end})`;
  assert.ok(css.includes(`${sec} { margin-bottom: 49px; }`));
  assert.ok(css.includes(`${sec} { margin-bottom: 39px; }`));
  assert.ok(css.includes(`${CELL}:has(> ${end}) { padding-bottom: 0; }`));
});

test('no rule for a single link paragraph (the brief after 584\'s, which moved chase-the-sun)', () => {
  assert.ok(!/body\.brand-brussels [^{]*p\.link-wrapper > a \{/.test(css.replace(`${CELL} > p.link-wrapper${RUN} > a {`, '')));
});
