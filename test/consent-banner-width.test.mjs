/* OneTrust's centred banner (#onetrust-banner-sdk.otCenterRounded) on screens up to 425px: its
   own inline CSS sets width 95%, max-width min(650px, 100vw - 2em) and padding 10px 15px
   !important on a content-box element, so at 390 it is 362 + 30 = 392px wide (left 0): 2px wider
   than the screen
   (de, en, every root; www has it too), and a mobile browser keeps the page that wide after it
   closes. styles/consent-banner.css makes it border-box there: 362px inside OneTrust's 1em margins
   (checked on lufthansa.turnsthe.page/at/de at 390: 14 to 376; at 1440 unchanged, 402 to 1052).
   Run: node --max-old-space-size=512 --test test/consent-banner-width.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/consent-banner.css', import.meta.url), 'utf8');

test('the banner is border-box up to 425px only (OneTrust\'s own breakpoint), nowhere else', () => {
  const media = css.match(/@media \(width <= 425px\) \{([\s\S]*?)\n\}/);
  assert.ok(media, 'a (width <= 425px) block');
  assert.match(media[1], /#onetrust-consent-sdk #onetrust-banner-sdk\.otCenterRounded \{\s*box-sizing: border-box;\s*\}/);
  const outside = css.replace(media[0], '');
  assert.ok(!/otCenterRounded[^{]*\{[^}]*box-sizing/.test(outside), 'no box-sizing for the banner at other widths');
});
