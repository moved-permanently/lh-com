/* eslint-disable max-len */
/* TAP's copyright bar as www's (the standing order of the night of 2026-11-10, decision 2; TAP row 132, tap-parity-002):
   www sets "© 2026, TAP." in bold before "All rights reserved."; the footer document has it bold too, but the shared
   footer builds its note from the paragraphs' text. footer-tap.js sets the leading "© <year>, TAP." of the note in
   <strong> (TAP only; other brands' notes as before).
   Run: node --test test/tap-footer-note-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
globalThis.document = document;
const { default: layoutTapFooter, boldCopyright } = await import('../blocks/footer/footer-tap.js');

const footer = (note) => {
  const block = document.createElement('div');
  block.innerHTML = `<div class="footer-inner"><div class="footer-note"><p>${note}</p></div></div>`;
  layoutTapFooter(block);
  return block.querySelector('.footer-tap-bar .footer-note p');
};

test('"© 2026, TAP." in bold, the rest as it was', () => {
  const p = footer('© 2026, TAP. All rights reserved.');
  assert.equal(p.innerHTML, '<strong>© 2026, TAP.</strong> All rights reserved.');
});

test('other notes and a note already bold stay as they are', () => {
  assert.equal(footer('All rights reserved.').innerHTML, 'All rights reserved.');
  const p = document.createElement('p');
  p.innerHTML = '<strong>© 2026, TAP.</strong> All rights reserved.';
  boldCopyright(p);
  assert.equal(p.innerHTML, '<strong>© 2026, TAP.</strong> All rights reserved.');
});
