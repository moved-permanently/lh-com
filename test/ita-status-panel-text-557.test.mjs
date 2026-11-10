/* eslint-disable max-len */
/* ITA's Miles & More status panels' text as www's column view (the sweep after 556; ita-parity-004
   /it/en/profile/miles-and-more at 390: ours 5286 px with both re-imports applied, www 5759). www's headline is
   heading-small (clamp(22px, 22px + 6 * (100vw - 375px) / 1065, 28px), 1.1: 22.08px at 390, 28px at 1440); the
   benefits a rich-text list 40 px in, its bullets outside, the items 10 px apart; the text the column's full width
   (442 px at 1440); the picture and the benefits 56 px under the line from 768 px; on phones the picture 45 px under
   the line and 40 px over the heading. Ours: 20/22 and 24/26.4, the bullets inside, no gap, the panels' 66 % width
   (291 px at 1440), the picture right under the line and on the heading.
   Run: node --test test/ita-status-panel-text-557.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const base = css.replace(/@media[^{]*\{[\s\S]*?\n\}\n/g, '');
const P = 'body.brand-ita .accordion-columns .accordion-columns-intro:has(> h3):has(> p:last-child > picture)';
// the declarations of the rules whose selector list holds sel (in scope), merged
const decls = (scope, sel) => Object.fromEntries([...scope.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter((m) => m[1].replace(/@media[^{]*$/, '').split(/,\s*\n/).map((s) => s.replace(/^[\s\S]*\{/, '').trim()).includes(sel))
  .flatMap((m) => m[2].split(';').map((d) => d.trim()).filter(Boolean))
  .map((d) => { const [k, ...v] = d.split(':'); return [k.trim(), v.join(':').trim()]; }));
const media = (q) => css.split(`@media (${q}) {`).slice(1).map((p) => p.slice(0, p.indexOf('\n}\n'))).join('\n}\n');

test('the heading www\'s heading-small, the text the column\'s width', () => {
  const h = decls(base, `${P} > h3`);
  assert.deepEqual([h['font-size'], h['line-height']], ['clamp(22px, calc(22px + 6 * (100vw - 375px) / 1065), 28px)', '1.1']);
  assert.equal(decls(base, `${P} > *`)['max-width'], 'none');
});

test('the benefits 40 px in, the bullets outside, the items 10 px apart', () => {
  const ul = decls(base, `${P} > ul`);
  assert.deepEqual([ul['padding-left'], ul['list-style-position']], ['40px', 'outside']);
  assert.equal(decls(base, `${P} > ul > li + li`)['margin-top'], '10px');
});

test('the picture 56 px under the line from 768 px; on phones 45 px under it and 40 px over the heading', () => {
  assert.equal(decls(media('width >= 768px'), `${P} > p:first-of-type`)['margin-bottom'], '56px');
  assert.equal(decls(media('width < 768px'), `${P} > p:last-child`).margin, '45px 0 40px');
});
