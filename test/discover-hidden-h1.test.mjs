/* eslint-disable max-len, import/extensions */
/* lh-discover's homepages: www's visually hidden H1 (tools/importer/discover-import.mjs
   withHiddenH1) as the first section's H1 with the section style hidden-heading, which
   styles/styles.css hides as .sr-only. Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { withHiddenH1 } from '../tools/importer/discover-import.mjs';

const SNAP = '<html><body><header><h1 class="heading-medium sr-only">Discover </h1></header><main></main></body></html>';
const HOME = '<div><div class="flash-teaser"></div><div class="flight-search"><div><div>Tabs</div><div>Flights</div></div></div></div>\n<div><div class="hero-card-overlay"><div><div>x</div></div></div></div>\n<div><div class="metadata"><div><div>Title</div><div>Home</div></div></div></div>';

test('withHiddenH1: www\'s hidden H1 first in the first section, the section style hidden-heading', () => {
  const out = withHiddenH1(HOME, SNAP);
  assert.equal(out, '<div><h1>Discover</h1><div class="flash-teaser"></div><div class="flight-search"><div><div>Tabs</div><div>Flights</div></div></div><div class="section-metadata"><div><div>Style</div><div>hidden-heading</div></div></div></div>\n<div><div class="hero-card-overlay"><div><div>x</div></div></div></div>\n<div><div class="metadata"><div><div>Title</div><div>Home</div></div></div></div>');
  assert.equal(withHiddenH1(out, SNAP), out, 'once');
  assert.equal(withHiddenH1(HOME, '<h1 class="heading-large">Visible</h1>'), HOME, 'a visible H1 on www: nothing');
  assert.equal(withHiddenH1('<div><h1>Own</h1></div>', SNAP), '<div><h1>Own</h1></div>', 'the document has an H1');
});

test('styles.css: the section style hidden-heading hides its H1 as .sr-only', () => {
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.sr-only,\s*main \.section\.hidden-heading \.default-content-wrapper h1 \{\s*position: absolute;/);
});
