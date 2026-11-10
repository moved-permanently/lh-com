/* eslint-disable max-len */
/* Air Dolomiti's destination pages: the text block under the stage as www's TitleDescriptionTextCta (the sweep after 556,
   airdolomiti-parity-001 /destinations/bari at 390: ours 6862 px against www's 8130; /de/reiseziele/bari-de, Munich).
   www draws the description at 22px / 37.4px (TitleDescriptionTextCta_paragraph__large, its h2s too) and from 930 px in a
   centred 70vw column, the title 38/46 and 42/50; the theme gave that to the hubs and the fleet (parity row 35) but not to
   the block after a destination stage (hero-card-overlay destination, the city as its H1), so ours was 16px / 27.2px.
   The articles' stage (an h2, www's HtmlContent under it at 16px) stays as it is.
   Run: node --test test/airdolomiti-destination-text-557.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const base = css.replace(/@media[^{]*\{[\s\S]*?\n\}\n/g, '');
const D = 'body.brand-airdolomiti main > .section.hero-card-overlay-container:has(.hero-card-overlay.destination h1) + .section > .default-content-wrapper:first-child';
// the declarations of the rules whose selector list holds sel (in scope), merged
const decls = (scope, sel) => {
  const out = {};
  for (const m of scope.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sels = m[1].replace(/@media[^{]*$/, '').split(/,\s*\n/).map((s) => s.replace(/^[\s\S]*\{/, '').trim());
    if (!sels.includes(sel)) continue;
    m[2].split(';').map((d) => d.trim()).filter(Boolean).forEach((d) => { const [k, ...v] = d.split(':'); out[k.trim()] = v.join(':').trim(); });
  }
  return out;
};
const media = (q) => {
  const parts = css.split(`@media (${q}) {`).slice(1);
  return parts.map((p) => p.slice(0, p.indexOf('\n}\n'))).join('\n}\n');
};

test('the text, its lists and its inner headings 22px / 37.4px, a blank line under each', () => {
  for (const sel of [`${D} > p:not(.button-wrapper)`, `${D} > :is(ul, ol)`, `${D} > h2:not(:first-child)`]) {
    const d = decls(base, sel);
    assert.deepEqual([d['font-size'], d['line-height'], d.margin], ['22px', '37.4px', '0 0 37.4px'], sel);
  }
  assert.equal(decls(base, `${D} > h2:first-child`)['margin-bottom'], '37.4px');
});

test('the title a size up, from 930 px the block a centred 70vw column', () => {
  const t = decls(base, `${D} > h2:first-child`);
  assert.deepEqual([t['font-size'], t['line-height']], ['38px', '46px']);
  const wide = media('width >= 930px');
  const w = decls(wide, `${D} > h2:first-child`);
  assert.deepEqual([w['font-size'], w['line-height']], ['42px', '50px']);
  // as specific as the text's margin above (p:not(.button-wrapper)), so that it wins
  assert.equal(decls(wide, `${D} > :is(h2, ul, ol, p:not(.button-wrapper), p.button-wrapper)`)['margin-inline'], 'calc((100% - 70vw) / 2)');
});

test('the articles\' stage (no H1 in it) is not matched', () => {
  assert.ok(!/hero-card-overlay-container(?!:has\(\.hero-card-overlay\.destination h1\)) \+ \.section > \.default-content-wrapper:first-child/.test(css));
});
