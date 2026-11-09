/* eslint-disable max-len */
/* Air Dolomiti's booking strip on its destination hub sticks at the top as www's (the brief after 531, item 1;
   airdolomiti-parity-002 /destinations at 1440 and 390, stuck and unstuck). www's DisplayBookingWidget: from 1025 px
   its widget is fixed under the header (its trip tab row behind the header's lower 50 px, the fields band from the
   header's bottom, the breadcrumb under it), on phones a navy band (#05164d, 202 px: 58 px over the "Book your flight"
   pill, 44 under it) after the breadcrumb that sticks under the 80 px header. Ours scrolled away with the page.
   The strip's section joins main's flow (display: contents), so its wrapper can stick past the section's end.
   Run: node --max-old-space-size=512 --test test/airdolomiti-sticky-strip-535.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const SECTION = 'body.brand-airdolomiti main > .section.breadcrumb-container:has(> .flight-search-wrapper > .flight-search.airdolomiti.strip)';
const STRIP = 'body.brand-airdolomiti main > .section > .breadcrumb-wrapper + .flight-search-wrapper:has(> .flight-search.airdolomiti.strip)';

// the declarations of a selector's rule, inside a media query when one is given
const rule = (selector, media) => {
  let scope = css;
  if (media) {
    // the media block whose first rule is the selector's
    const at = css.indexOf(`@media ${media} {\n  ${selector} {`);
    assert.ok(at >= 0, `${selector} in @media ${media}`);
    scope = css.slice(at + `@media ${media} {\n  `.length);
  }
  const i = scope.indexOf(`${selector} {`);
  assert.ok(i >= 0, selector);
  const body = scope.slice(i + selector.length + 2, scope.indexOf('}', i));
  return Object.fromEntries(body.split(';').map((d) => d.trim()).filter(Boolean).map((d) => d.split(/:\s*/)));
};

test('the strip\'s section joins main\'s flow, so the strip sticks past it', () => {
  assert.equal(rule(SECTION).display, 'contents');
});

test('phones: a navy band after the breadcrumb that sticks under the 80 px header', () => {
  const r = rule(STRIP);
  assert.equal(r.position, 'sticky');
  assert.equal(r.top, '80px');
  assert.equal(r['background-color'], '#05164d');
  assert.equal(r.padding, '58px var(--layout-margin) 44px', 'the pill 20 px in (5vw)');
  assert.equal(r['margin-bottom'], '20px', 'www\'s h1 20 px under the band');
  assert.ok(Number(r['z-index']) > 0);
});

test('from 1025 px: fixed under the 120 px header as www\'s, its trip tab row behind the header, over the breadcrumb', () => {
  const r = rule(STRIP, '(width >= 1025px)');
  assert.equal(r.top, '70px');
  assert.equal(r['margin-top'], '-92px', 'the 42 px breadcrumb and 50 px into the header');
  assert.equal(r['background-color'], '#fff');
  assert.equal(r['margin-bottom'], '34px', 'www\'s h1 31 px under its fields band, 3 px taller than ours');
  assert.equal(r.padding, '0 var(--layout-margin)');
  assert.equal(r['box-shadow'], '0 0 0 100vmax #fff', 'white across a wider screen');
});

test('the header stays at the top on a page with the strip, as www\'s (it hid while scrolling down)', () => {
  assert.equal(rule('body.brand-airdolomiti header:has(~ main .breadcrumb-wrapper + .flight-search-wrapper > .flight-search.airdolomiti.strip) .header .nav-wrapper.is-hidden').transform, 'none');
});
