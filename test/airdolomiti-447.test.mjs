/* eslint-disable max-len */
/* Air Dolomiti's theme (styles/themes/airdolomiti.css), brief 447 (airdolomiti-parity-001: 48 pages
   at 1440 and 390, www's own stylesheets; tools/reports/airdolomiti/parity.md, pass 2):
   - the page's width as www's (TitleMargin_margin, Title_h2_headline and the others: 90vw below
     930 px, 95vw from 930 px, at most 1440 px from 1450 px): our layout margin 5vw, 2.5vw from
     930 px (36 px at 1440, 20 px at 390), the content at most 1440 px wide;
   - page titles (www's TitleMargin_title and TitleDescriptionTextCta's headline, 3.5185rem and
     3.8889rem of its 10.8 px root): light 38 / 46 px, 42 / 50 px from 930 px.
   Run: node --test test/airdolomiti-447.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

test('the page\'s width as www\'s: 5vw either side, 2.5vw from 930 px, at most 1440 px of content', () => {
  has(/body\.brand-airdolomiti \{[^}]*--layout-margin: 5vw;/);
  has(/@media \(width >= 930px\) \{[^@]*body\.brand-airdolomiti \{[^}]*--layout-margin: 2\.5vw;[^}]*--content-max-width: calc\(1440px \+ 5vw\);/);
  // the wide margin after the default in the file, or the default wins (same selector)
  const wide = css.search(/@media \(width >= 930px\) \{ body\.brand-airdolomiti \{ --layout-margin: 2\.5vw;/);
  const narrow = css.search(/body\.brand-airdolomiti \{[^}]*--layout-margin: 5vw;/);
  assert.ok(wide > narrow, '2.5vw after 5vw');
});

test('page titles light 38 / 46 px, 42 / 50 px from 930 px', () => {
  has(/body\.brand-airdolomiti main \.default-content-wrapper h1 \{[^}]*font-size: 38px;[^}]*font-weight: 300;[^}]*line-height: 46px;/);
  has(/@media \(width >= 930px\) \{[^@]*body\.brand-airdolomiti main \.default-content-wrapper h1 \{[^}]*font-size: 42px;[^}]*line-height: 50px;/);
});
