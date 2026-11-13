/* eslint-disable max-len */
/* Cargo's newsroom with Mynewsdesk's app as www's (the standing order of 2026-11-10, item 5; cargo-parity-001
   /en/ci/newsroom and /de/ci/newsroom at 1440 and 390): www shows the app right under the header (its own "Latest
   news" its first heading) and the footer 23 px under it. Ours put the page's "Newsroom" title (48 px and 20 under it)
   and the section's 25 px above the app and 48 px under it: 118 px more at 1440 and 390 (4556 against 4430). The title
   stays for screen readers (visually hidden); without the app (the site flag off, no consent: the link) nothing changes.
   Run: node --test test/cargo-newsroom-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const S = 'body.brand-cargo main > .section.newsroom-container:has(#mnd-iframe)';
// the declarations of the rules whose selector list holds sel, merged
const decls = (sel) => Object.fromEntries([...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter((m) => m[1].split(/,\s*\n/).map((s) => s.replace(/^[\s\S]*\{/, '').trim()).includes(sel))
  .flatMap((m) => m[2].split(';').map((d) => d.trim()).filter(Boolean))
  .map((d) => { const [k, ...v] = d.split(':'); return [k.trim(), v.join(':').trim()]; }));

test('with the app: the section right under the header, 23 px over the footer', () => {
  assert.deepEqual([decls(S)['margin-top'], decls(S)['margin-bottom']], ['0', '23px']);
});

test('the page title for screen readers only, and only while the app is there', () => {
  const h = decls(`${S} > .default-content-wrapper > h1`);
  assert.deepEqual([h.position, h.width, h.height, h.overflow, h['clip-path']], ['absolute', '1px', '1px', 'hidden', 'inset(50%)']);
  assert.equal(h.display, undefined);
  assert.ok(!/\.newsroom-container(?!:has\(#mnd-iframe\))[^{]*>\s*h1\s*\{/.test(css), 'no rule on the title without the app');
});
