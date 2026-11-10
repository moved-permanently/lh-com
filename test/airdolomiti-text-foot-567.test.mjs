/* eslint-disable max-len */
/* Air Dolomiti's destination text block's foot as www's TitleDescriptionTextCta (the brief after 566; airdolomiti-parity-004
   /reiseziele/bari-de): the button 43 px under the text on phones, 79 px from 930 px (www: the rich text's 40 / 25 px and,
   from 930 px, the empty small text's 50 px), the next section's title 100 px under the button (www's margin-bottom 90 px
   and the button's line). Ours: 37.4 px (the paragraphs' blank line) and the sections' 48 px: the block 94 px short at 1440.
   Run: node --test test/airdolomiti-text-foot-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const base = css.replace(/@media[^{]*\{[\s\S]*?\n\}\n/g, '');
const SEC = 'body.brand-airdolomiti main > .section.hero-card-overlay-container:has(.hero-card-overlay.destination h1) + .section';
const D = `${SEC} > .default-content-wrapper:first-child`;
// the declarations of the rules whose selector list holds sel (in scope), merged
const decls = (scope, sel) => Object.fromEntries([...scope.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter((m) => m[1].replace(/@media[^{]*$/, '').split(/,\s*\n/).map((s) => s.replace(/^[\s\S]*\{/, '').trim()).includes(sel))
  .flatMap((m) => m[2].split(';').map((d) => d.trim()).filter(Boolean))
  .map((d) => { const [k, ...v] = d.split(':'); return [k.trim(), v.join(':').trim()]; }));
const media = (q) => css.split(`@media (${q}) {`).slice(1).map((p) => p.slice(0, p.indexOf('\n}\n'))).join('\n}\n');

test('the button 43 px under the text, 79 px from 930 px', () => {
  assert.equal(decls(base, `${D} > p.button-wrapper`)['margin-top'], '43px');
  assert.equal(decls(media('width >= 930px'), `${D} > p.button-wrapper`)['margin-top'], '79px');
});

test('the next section 100 px under the block', () => {
  assert.equal(decls(base, SEC)['margin-bottom'], '100px');
});
