/* eslint-disable max-len */
/* Cargo's notification overview as www draws it in cargo-parity-001 (/en and /de/notification-overview at 1440 and 390;
   the page's own <style> and the theme's .greyBgBox / .notificationPageSection rules): the filter and the list on one
   #f5f5f5 band the screen's width, 40 px in from 1025 px (20 px below), the band down to the footer; each notification
   856 px wide at most, the date 12 / 14 px, the headline 30 px over the text (www's 20 and the floated text's 10), the text 18 / 24 px clamped to five
   lines (-webkit-line-clamp: 5), 30 px over Read more (18 / 24 px, #52627c, the arrow after it),
   30 px under that the item's rule (1 px #ccc), 40 px between items. Ours had the list on a grey card in the column,
   the text 14 / 18 px cut at 72 px, and the section's 48 px under it: 1440 -9.8 %, 390 -2.5 / -3.2 % (standing order 23).
   Run: node --test test/cargo-notifications-band-so23.test.mjs */
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

const css = read('blocks/notifications/notifications.css');
const WIDE = '(width >= 1025px)';

test('the band: #f5f5f5 the screen\'s width, 20 px in on phones and 40 px from 1025 px, 40 px under the title there', () => {
  const b = decls(css, '.notifications');
  assert.equal(b['background-color'], '#f5f5f5');
  assert.equal(b['box-shadow'], '0 0 0 100vmax #f5f5f5');
  assert.equal(b['clip-path'], 'inset(0 -100vmax)');
  assert.equal(b.padding, '20px 0');
  const w = decls(css, '.notifications', WIDE);
  assert.deepEqual([w.padding, w['margin-top']], ['40px 0', '40px']);
});

test('the filter: the label 12 / 14 px, the select 40 px (42 from 1025 px), 30 px over the list', () => {
  const f = decls(css, '.notifications .notifications-filter');
  assert.deepEqual([f.margin, f.gap], ['0 0 30px', '4px']);
  const l = decls(css, '.notifications .notifications-filter label');
  assert.deepEqual([l['font-size'], l['line-height'], l['margin-top']], ['12px', '14px', '2px']);
  assert.equal(decls(css, '.notifications .notifications-filter select').height, '40px');
  assert.equal(decls(css, '.notifications .notifications-filter select', WIDE).height, '42px');
});

test('the list has no card of its own; each item 856 px at most, 30 px over its rule, 40 px between items', () => {
  const ul = decls(css, '.notifications .notifications-list');
  assert.equal(ul.padding, '0');
  assert.equal(ul['background-color'], undefined);
  assert.equal(decls(css, '.notifications .notifications-list', WIDE).padding, undefined, 'no padding from 1025 px either');
  const li = decls(css, '.notifications .notifications-item');
  assert.deepEqual([li['max-width'], li.padding, li.margin, li['border-bottom']], ['856px', '0 0 30px', '0 0 40px', '1px solid #ccc']);
  const last = decls(css, '.notifications .notifications-item:last-child');
  assert.equal(last['margin-bottom'], '0');
  assert.equal(last['border-bottom'], undefined, 'the last item keeps its rule, as www\'s');
});

test('the date 12 / 14 px, the headline 30 px over the text (www\'s 20 and the floated text\'s 10)', () => {
  const d = decls(css, '.notifications .notifications-date');
  assert.deepEqual([d['font-size'], d['line-height'], d.margin], ['12px', '14px', '0 0 10px']);
  assert.equal(decls(css, '.notifications .notifications-headline').margin, '0 0 30px');
});

test('the text 18 / 24 px, clamped to five lines while closed, whole when open', () => {
  const t = decls(css, '.notifications .notifications-detail');
  assert.deepEqual([t['font-size'], t['line-height'], t.margin], ['18px', '24px', '0 0 30px']);
  const shut = decls(css, '.notifications .notifications-item:has(.notifications-more) .notifications-detail');
  assert.deepEqual([shut.display, shut['-webkit-box-orient'], shut['-webkit-line-clamp'], shut.overflow], ['-webkit-box', 'vertical', '5', 'hidden']);
  assert.equal(shut['max-height'], undefined, 'no pixel cut');
  const open = decls(css, '.notifications .notifications-item.is-open .notifications-detail');
  assert.deepEqual([open.display, open['-webkit-line-clamp']], ['block', 'unset']);
  assert.equal(decls(css, '.notifications .notifications-detail > :last-child')['margin-bottom'], '0');
});

test('Read more 18 / 24 px in #52627c, its arrow after the text', () => {
  const m = decls(css, '.notifications .notifications-more');
  assert.deepEqual([m['font-size'], m['line-height'], m.color, m.margin], ['18px', '24px', '#52627c', '0']);
  assert.equal(decls(css, '.notifications .notifications-more::before').content, undefined);
  const a = decls(css, '.notifications .notifications-more::after');
  assert.deepEqual([a.content, a['margin-left']], ['"\\2193"', '8px']);
});

test('the band reaches the footer: the section has no space under it', () => {
  const s = decls(read('styles/themes/cargo.css'), 'body.brand-cargo main > .section.notifications-container');
  assert.equal(s['margin-bottom'], '0');
});

test('from 1025 px the title 100 px under the breadcrumb\'s top, as www\'s: the breadcrumb 66 px over it', () => {
  const theme = read('styles/themes/cargo.css');
  const sel = 'body.brand-cargo main > .section.notifications-container > .breadcrumb-wrapper';
  assert.equal(decls(theme, sel, WIDE)['margin-bottom'], '66px');
  assert.equal(decls(theme, sel)['margin-bottom'], undefined, 'below 1025 px www\'s 76 px are ours already');
});
