/* eslint-disable max-len */
/* TAP button labels wrap (standing order 61, item 5): lh-com's buttons keep one line and cut a longer label with an
   ellipsis ("Entdecken Sie die verfügbaren Extras und …" at 390, the refund pages' "Pedir ou consultar o estado de um
   reembo…"); www's TAP buttons wrap (white-space normal). A label that fits stays one line.
   Run: node --test test/tap-button-label-wrap-so61.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

test('TAP link buttons wrap their label instead of cutting it', () => {
  const m = css.match(/(?:^|\})\s*body\.brand-tap a\.button:any-link \{([^}]*white-space[^}]*)\}/);
  assert.ok(m, 'rule found');
  assert.match(m[1], /white-space: normal;/);
  assert.match(m[1], /text-overflow: clip;/);
});
