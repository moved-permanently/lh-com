/* eslint-disable max-len */
/* Air Dolomiti's pages with a destination stage on phones as www's top (the brief after 566, the user's decision;
   airdolomiti-parity-004 /reiseziele/bari-de at 390 x 844): no search strip and no visible breadcrumb above the stage,
   the stage 90 px under the 80 px header (y 170; ours 368). www's breadcrumb is in its markup (nav "Navigationspfad",
   white on white): ours visually hidden, not display: none, so screen readers keep it. The search strip stays in the
   page with no room and without its card, so the header's plane button still opens its panel (checked on the host:
   the panel over the whole window, the focus on its close button and back on the plane).
   Run: node --test test/airdolomiti-phone-top-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const M = 'body.brand-airdolomiti main:has(> .section.hero-card-overlay-container .hero-card-overlay.destination) > .section:has(> .flight-search-wrapper > .flight-search.airdolomiti.strip)';
// the declarations of the rules whose selector list holds sel (in scope), merged
const decls = (scope, sel) => Object.fromEntries([...scope.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter((m) => m[1].replace(/@media[^{]*$/, '').split(/,\s*\n/).map((s) => s.replace(/^[\s\S]*\{/, '').trim()).includes(sel))
  .flatMap((m) => m[2].split(';').map((d) => d.trim()).filter(Boolean))
  .map((d) => { const [k, ...v] = d.split(':'); return [k.trim(), v.join(':').trim()]; }));
const phone = css.split('@media (width < 530px) {').slice(1).map((p) => p.slice(0, p.indexOf('\n}\n'))).join('\n}\n');

test('the breadcrumb visually hidden, still there for screen readers', () => {
  const b = decls(phone, `${M} > .breadcrumb-wrapper`);
  assert.deepEqual([b.position, b.width, b.height, b.overflow, b['clip-path']], ['absolute', '1px', '1px', 'hidden', 'inset(50%)']);
  assert.notEqual(b.display, 'none');
  assert.notEqual(b.visibility, 'hidden');
});

test('the search strip without room or card, still rendered for the plane button\'s panel', () => {
  const s = decls(phone, `${M} > .flight-search-wrapper`);
  assert.deepEqual([s.position, s.margin, s.padding, s.display], ['static', '0', '0', undefined]);
  assert.equal(decls(phone, `${M} > .flight-search-wrapper > .flight-search.airdolomiti.strip .flight-search-open`).display, 'none');
});

test('the stage 90 px under the header', () => {
  assert.equal(decls(phone, `${M} + .section.hero-card-overlay-container`)['margin-top'], '90px');
});
