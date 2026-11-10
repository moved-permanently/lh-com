/* eslint-disable max-len */
/* Air Dolomiti's post title as www's BlogLayout (the standing order of the night of 2026-11-10, item c, decision 1;
   AD row 99; airdolomiti-parity-001, the Adriatic article in de, en and it). www's title is at 170 at 1440 (the trail
   right under the bar) and at 150 at 390; ours sat at 206 / 196: lh-com's 25 px over a post's trail (styles.css), the
   breadcrumb's 16 px and the header's 19 px. The theme takes the 25 px out at every width, from 1025 px the
   breadcrumb's 16 px too with 24 px over the header, below 768 px the header's 19 px.
   Run: node --test test/airdolomiti-post-title-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const TRAIL = 'body.brand-airdolomiti main > .section:first-of-type > .breadcrumb-wrapper:has(+ .article-header-wrapper)';
const HEADER = 'body.brand-airdolomiti main > .section > .breadcrumb-wrapper + .article-header-wrapper';
// every rule with this selector: [media query or '', declarations]
const rules = (sel) => {
  const out = [];
  const re = /(@media[^{]*\{)|([^{}]+)\{([^{}]*)\}|(\})/g;
  let m;
  let media = '';
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(css))) {
    if (m[1]) media = m[1].replace(/\s*\{$/, '').trim();
    else if (m[4]) media = '';
    else if (m[2].trim() === sel) out.push([media, m[3]]);
  }
  return out;
};

test('no space over a post\'s trail at any width, and from 1025 px none in the breadcrumb either', () => {
  const r = rules(TRAIL);
  assert.ok(r.some(([m, d]) => !m && /padding-top: 0;/.test(d)), 'every width');
  assert.ok(r.some(([m, d]) => /width >= 1025px/.test(m) && /--breadcrumb-top: 0;/.test(d)), 'from 1025 px');
});

test('the post header 24 px under the trail from 1025 px, 28 px under the one-line trail below 768 px', () => {
  const r = rules(HEADER);
  assert.ok(r.some(([m, d]) => /width >= 1025px/.test(m) && /margin-top: 24px;/.test(d)));
  assert.ok(r.some(([m, d]) => /width < 768px/.test(m) && /margin-top: 28px;/.test(d)), 'below 768 px 28 px under the one-line trail (row 100)');
});
