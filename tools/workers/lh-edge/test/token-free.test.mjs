/* eslint-disable max-len, import/extensions, import/no-relative-packages */
/* Token-free styling in lh-edge (the brief after 488, item 4, step 1): the app screens' App Spacer (size, v2), App Divider
   and App Text (small) blocks give the items their markers give ("{spacer: medium, v2}", "{divider}", "{small}"); on web
   pages the Spacer and Divider blocks and a section's Space / Divider styles give the separators' items, and an italic
   paragraph right after an image (its caption) is no part, as "{caption}". The readers are the site's
   (scripts/style-markers.js). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDocument, screenModel } from '../src/sdui.js';
import { webModel } from '../src/sdui-web.js';

const PIC = '<picture><img src="./media_1a2b3c.jpg" alt="View"></picture>';
const items = (main) => screenModel(readDocument(`<html><head></head><body><main>${main}</main></body></html>`)).sections.flatMap((s) => s.items);

test('app screens: the blocks give the markers\' items', () => {
  const marked = items('<div><p>{spacer: medium, v2}</p><p>{divider}</p><p>Fine print {small}</p><p>Text</p></div>');
  const blocks = items('<div><div class="app-spacer medium v2"><div><div></div></div></div><div class="app-divider"><div><div></div></div></div><div class="app-text small"><div><div><p>Fine print</p></div></div></div><p>Text</p></div>');
  assert.deepEqual(blocks, marked);
  assert.deepEqual(items('<div><div class="app-spacer"><div><div></div></div></div></div>'), [{ kind: 'spacer', size: 'MEDIUM', v2Only: false }]);
  assert.deepEqual(items('<div><div class="app-text"><div><div>Plain cell</div></div></div></div>'), [{ kind: 'text', html: 'Plain cell', small: false }]);
});

test('web pages: Spacer and Divider blocks and section styles as the separators; captions no part', () => {
  const page = '/de/en/articles/explore-the-world/x';
  const html = (body) => `<html><head></head><body><main>${body}</main></body></html>`;
  const marked = webModel(html(`<div><p>Text</p><p>{spacer-60}</p><p>${PIC}</p><p>Lisbon at dusk {caption}</p><p>{divider-25}</p><p>More</p></div>`), page).body;
  const free = webModel(html(`<div><p>Text</p><div class="spacer"><div><div></div></div></div><p>${PIC}</p><p><em>Lisbon at dusk</em></p><div class="divider"><div><div></div></div></div><p>More</p></div>`), page).body;
  assert.deepEqual(free, marked);
  const styled = webModel(html('<div><p>A</p></div><div><p>B</p><div class="section-metadata"><div><div>Style</div><div>Space=M, Divider below</div></div></div></div>'), page).body;
  assert.deepEqual(styled.map((i) => i.kind), ['text', 'web-spacer', 'text', 'divider']);
  // an italic paragraph that follows no image stays text; an italic link alone stays out (a button)
  const kept = webModel(html('<div><p><em>An italic line</em></p></div>'), page).body;
  assert.equal(kept.length, 1);
});
