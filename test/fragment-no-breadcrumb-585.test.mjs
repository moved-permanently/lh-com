/* eslint-disable max-len */
/* A fragment shows no breadcrumb of the page's (the standing order of the night of 2026-11-10, item e; TAP row 135):
   scripts.js buildBreadcrumb added the page's trail (from its Parent metadata) to the first section of every main it
   decorated, and fragment.js decorates each fragment's own main, so TAP's inspiration page drafted with its categories
   as tabs showed the page's trail at the top of all 14 fragment panels (15 trails on the page, measured on
   tap.turnsthe.page with the local code; 1 with the guard). Now only the page's own main gets the trail: a main that is
   not the document's (a fragment's, decorated before it is placed) is skipped.
   Run: node --test test/fragment-no-breadcrumb-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../scripts/scripts.js', import.meta.url), 'utf8');
const body = src.slice(src.indexOf('function buildBreadcrumb(main) {'), src.indexOf('\n}\n', src.indexOf('function buildBreadcrumb(main) {')));

test('buildBreadcrumb leaves a main that is not the page\'s own (a fragment\'s)', () => {
  assert.ok(body.length > 0, 'the function');
  assert.match(body, /if \(main\.isConnected && main !== document\.querySelector\('main'\)\) return;/);
  assert.match(body, /if \(!main\.isConnected && document\.querySelector\('main'\)\) return;/);
  const guard = body.indexOf("document.querySelector('main')");
  assert.ok(guard > 0 && guard < body.indexOf("buildBlock('breadcrumb'"), 'before the trail is built');
});

test('fragment.js decorates a main of its own (the case the guard is for)', () => {
  const frag = fs.readFileSync(new URL('../blocks/fragment/fragment.js', import.meta.url), 'utf8');
  assert.match(frag, /const main = document\.createElement\('main'\);[\s\S]*?decorateMain\(main\);/);
});
