/* eslint-disable max-len */
/* Air Dolomiti's fleet text block's foot (the standing order of the night of 2026-11-10, item e; AD row 105;
   airdolomiti-parity-001 /flotta, /en/fleet, /de/flotte -3 % at 1440): www's TitleDescriptionTextCta under the fleet's
   stage ends as the destinations' (row 88): its button 43 px under the text (79 px from 930 px), the footer 100 px under
   the button (at 1440 the button 2223 against our 2182 from the title, the footer 2388 against 2296; at 390 44 / 99 px
   against our 38 / 48). The section after a campaign stage whose text (an H2 and its paragraphs) ends in a button gets
   row 88's foot; the destinations' rules unchanged.
   Run: node --test test/airdolomiti-fleet-text-foot-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const SEC = 'body.brand-airdolomiti main > .section.hero-campaign-container + .section:has(> .default-content-wrapper:first-child > h2:first-child ~ p ~ p.button-wrapper:last-child)';
const rules = (sel) => {
  const out = [];
  let i = css.indexOf(`${sel} {`);
  while (i >= 0) {
    out.push(css.slice(i, css.indexOf('}', i)));
    i = css.indexOf(`${sel} {`, i + 1);
  }
  assert.ok(out.length, `the rule ${sel}`);
  return out;
};

test('the footer or next section 100 px under the button', () => {
  assert.match(rules(SEC)[0], /margin-bottom: 100px;/);
});

test('the button 43 px under the text, 79 px from 930 px', () => {
  const r = rules(`${SEC} > .default-content-wrapper:first-child > p.button-wrapper:last-child`);
  assert.equal(r.length, 2);
  assert.match(r[0], /margin-top: 43px;/);
  assert.match(r[1], /margin-top: 79px;/);
  const i = css.indexOf(`${SEC} > .default-content-wrapper:first-child > p.button-wrapper:last-child {`, css.indexOf('@media (width >= 930px)', css.indexOf(r[0])));
  assert.ok(i > css.indexOf(r[0]), 'the 79 px in a 930 px query after the 43 px');
});
