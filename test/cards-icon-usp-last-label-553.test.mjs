/* eslint-disable max-len */
/* cards-icon option usp on phones (brief 553, lh-parity-004a/b's additional-services on /de/de, /at/de, /gb/en at 390):
   the last tile's label kept its 10 px margin, so each of the page's five tile bands ended 10 px lower than www's (47
   px from the last label's ink to the next section, www 37; +43 px by the fifth band). www's column view drops its last
   item's last margin (as the rule from 1025 px already does for every label); below 768 px the last tile does the same,
   lufthansa.com only (the brands' usp tiles keep theirs).
   Run: node --max-old-space-size=256 --test test/cards-icon-usp-last-label-553.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/cards-icon/cards-icon.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa .cards-icon.usp > ul > li:last-child .cards-icon-label';

test('below 768 px the last usp tile\'s label has no margin below', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i + SEL.length, css.indexOf('}', i)), /margin-bottom: 0;/);
  const before = css.slice(0, i);
  const media = before.slice(before.lastIndexOf('@media'));
  assert.ok(media.startsWith('@media (width < 768px) {'), 'phones only');
  assert.equal((media.match(/\{/g) || []).length - (media.match(/\}/g) || []).length, 1, 'inside that block');
});

test('the other labels keep their 10 px below 1025 px', () => {
  const i = css.indexOf('.cards-icon.usp .cards-icon-label {');
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-bottom: 10px;/);
});
