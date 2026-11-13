/* eslint-disable max-len */
/* Cargo's footer as www draws it in cargo-parity-001 (standing order 24; the recordings' 390 and 1440 screenshots and
   their offline renders, relative to the footer's top). Below 768 px: the search field at 48 px, 38 px tall, the menu
   panels from 125 px, 50 px apart between #ccc rules (one on top), 30 px under them the legal links centred (20 px
   rows, 20 px apart), then the social icons centred (10 px apart, 20 px above and below), no rule between them; the
   logo strip from 430 px (en) / 470 px (de). From 768 px: the field at 54 px, the column titles at 122 px (24 px lines,
   10 px to their rule, 10 px to the links), the rule 11 px under the last link's 11 px gap (www's 20 px), the
   legal row 64 px, the strip at 417 px. Ours: 574 / 603 / 485 px against www's 559 / 598 / 477.
   And the English and German notification overview at 390 (the same commit: the shorter footer would have taken
   /en from +0.08 to -1.06 % and /de from -0.66 to -1.2 %): www's banner picture across the screen (125 px), the
   breadcrumb straight under it, 56 px with its 17 / 20 px padding and #ccc rule, each notification's date 4 px under
   the item's top. Ours: the picture 358 px wide (115 px), 20 px over a 34 px breadcrumb without a rule.
   Run: node --test test/cargo-footer-so24.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** The declarations of every rule whose selector list holds sel, merged in order; media '' is outside any @media. */
function decls(cssText, sel, media = '') {
  const out = {};
  let start = 0;
  const stack = [];
  for (let i = 0; i < cssText.length; i += 1) {
    const c = cssText[i];
    if (c === '{') {
      const head = cssText.slice(start, i).trim();
      if (head.startsWith('@')) {
        stack.push(head);
        start = i + 1;
      } else {
        const end = cssText.indexOf('}', i);
        const here = stack.map((s) => s.replace(/^@media\s*/, '')).join(' ');
        if (here === media && head.split(',').map((s) => s.trim()).includes(sel)) {
          cssText.slice(i + 1, end).split(';').map((d) => d.trim()).filter(Boolean)
            .forEach((d) => {
              const [k, ...v] = d.split(':');
              out[k.trim()] = v.join(':').trim();
            });
        }
        i = end;
        start = end + 1;
      }
    } else if (c === '}') {
      // a rule's own brace is skipped above: this one closes an @media
      stack.pop();
      start = i + 1;
    }
  }
  return out;
}


const theme = read('styles/themes/cargo.css');
const PHONE = '(width < 768px)';
const WIDE = '(width >= 768px)';
const BELOW = '(width < 1025px)';
const F = 'body.brand-cargo .footer';

test('the panels\' rules #ccc, as www\'s', () => {
  assert.equal(decls(theme, ':root')['--footer-toggle-line'], '#ccc');
});

test('below 768 px: the field 8 px under the footer\'s 40 px, 38 px tall with its line, 39 px over the panels', () => {
  assert.equal(decls(theme, `${F} .footer-search`, PHONE).margin, '8px 0 39px');
  assert.equal(decls(theme, `${F} .footer-search input`).height, '36px');
});

test('below 768 px: each panel 49 px and its rule, a rule on the first, 30 px under the last', () => {
  assert.equal(decls(theme, `${F} .footer-column-heading`, PHONE)['line-height'], '24px');
  assert.equal(decls(theme, `${F} .footer-column-toggle`, PHONE).padding, '13px 20px 12px');
  assert.equal(decls(theme, `${F} .footer-column:first-child .footer-column-toggle`, PHONE)['border-top'], '1px solid var(--footer-toggle-line)');
  assert.equal(decls(theme, `${F} .footer-columns`, PHONE)['margin-bottom'], '30px');
});

test('below 768 px: the legal links before the icons, without the rule between them', () => {
  const g = decls(theme, `${F} .footer-inner.has-extras`, PHONE)['grid-template-areas'];
  assert.match(g, /'columns'\s*'legal'\s*'badges'/);
  assert.equal(decls(theme, `${F} .footer-divider`, PHONE).display, 'none');
});

test('below 768 px: the legal links centred, 20 px rows 20 px apart', () => {
  const l = decls(theme, `${F} .footer-legal`, PHONE);
  assert.deepEqual([l['justify-content'], l.gap, l.padding], ['center', '20px', '0']);
  const li = decls(theme, `${F} .footer-legal li`, PHONE);
  assert.deepEqual([li.height, li['padding-top']], ['20px', '2px']);
  assert.equal(decls(theme, `${F} .footer-legal .footer-link`, PHONE)['margin-bottom'], '0');
});

test('below 768 px: the icons centred, 10 px apart, 20 px above and below, no rule over them', () => {
  const b = decls(theme, `${F} .footer-badges`, PHONE);
  assert.deepEqual([b['justify-content'], b.padding, b['border-top']], ['center', '20px 0', '0']);
  assert.equal(decls(theme, `${F} .footer-badges ul`, PHONE).gap, '10px');
});

test('from 768 px: the field 14 px under the footer\'s 40 px, the titles 30 px under it', () => {
  assert.equal(decls(theme, `${F} .footer-search`, WIDE).margin, '14px 0 30px');
});

test('from 768 px: the titles 24 px lines, 10 px to their rule and 10 px to the links; the rule 11 px under the last link\'s gap; the legal row 64 px', () => {
  const t = decls(theme, `${F} .footer-column-title`, WIDE);
  assert.deepEqual([t['line-height'], t['padding-bottom'], t['margin-bottom']], ['24px', '10px', '10px']);
  assert.equal(decls(theme, `${F} .footer-columns`, WIDE)['padding-bottom'], '11px');
  assert.equal(decls(theme, `${F} .footer-legal`, WIDE).padding, '20px 0 15px');
});

const N = 'body.brand-cargo main > .section.notifications-container';

test('the notification overview below 1025 px: the banner across the screen, the breadcrumb under it with www\'s padding and rule', () => {
  assert.equal(decls(theme, `${N} > .default-content-wrapper:first-child:has(> p > picture)`, BELOW)['padding-inline'], '0');
  assert.equal(decls(theme, `${N} > .breadcrumb-wrapper`, BELOW)['margin-top'], '0');
  const nav = decls(theme, `${N} > .breadcrumb-wrapper .breadcrumb nav`, BELOW);
  assert.deepEqual([nav.padding, nav['border-bottom']], ['17px 0 20px', '1px solid #ccc']);
});

test('the notification overview below 1025 px: each date 4 px under its item\'s top', () => {
  assert.equal(decls(theme, `${N} .notifications .notifications-item`, BELOW)['padding-top'], '4px');
});
