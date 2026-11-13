/* eslint-disable max-len */
/* Standing order 21, item 3: the Austrian homepage band rules (the brief after 593, styles/themes/austrian.css) waited for
   the footer-disclaimer patch (a link to /fragments/modals/ in the document), so that a homepage with www's dialog text
   inline was not changed before its patch. Eight roots never get that patch: their pages had no dialog text
   (reimport-591-austrian-home-disclaimer.txt "not listed": at/de, at/en, cn/zh, ge/en, gr/el, jp/ja, pt/en, xx/en), and
   www draws their bands as on every other root (austrian-parity-008 to -010 at 390: "Round trip" at 248, "Winter deals"
   at 1312, "Discover Austrian" at 2026 on fr/en, pt/en and xx/en alike). They now get the rules too: a page that opens
   with the flight search, the hero and the fare teaser (the homepage; 58 of the 64 roots, no other recorded page). The
   Canadian roots (dialog text inline, no fare teaser) stay as they are. The new branch is inside :where(), so the rules
   keep their weight. Measured (our host, the published documents, control = live): pt/en 390 -7.93 -> -2.80 %, 1440
   -8.86 -> -1.80 %; xx/en 390 -8.32 -> -5.69 %, 1440 -7.32 -> -4.46 %.
   Run: node --max-old-space-size=256 --test test/austrian-home-bands-so21.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8');
const start = css.indexOf('the homepage after its footer-disclaimer patch');
const end = css.indexOf('/* numbered steps', start);
const block = css.slice(css.indexOf('*/', start) + 2, end > 0 ? end : undefined).replace(/\/\*[\s\S]*?\*\//g, '');
const selectors = block.split('}').map((r) => r.replace(/^\s*@media[^{]*\{/, '').split('{')[0].trim()).filter((s) => s.startsWith('body.'));
const CONDITION = 'body.brand-austrian main:has(a[href*="/fragments/modals/"], :where(.section.flight-search-container:first-child + .section.hero-card-overlay-container + .section.fare-teaser-container))';

test('every band rule: the patched document or a homepage that never had the dialog text', () => {
  assert.equal(selectors.length, 15);
  selectors.forEach((s) => assert.ok(s.startsWith(CONDITION), s));
});

test('the new branch adds no weight (inside :where), the Canadian roots without a fare teaser stay out', () => {
  assert.ok(!block.includes(':has(:where('), 'the modal link keeps the condition\'s weight');
  assert.ok(CONDITION.includes(':where(.section.flight-search-container:first-child + .section.hero-card-overlay-container + .section.fare-teaser-container)'));
});
