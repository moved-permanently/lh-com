/* eslint-disable max-len */
/* Air Dolomiti's destination price bar pinned to the window's foot as www's HeroSecond (the brief after 566;
   airdolomiti-parity-004 /reiseziele/bari-de, scroll-log.json: fixed at every sampled offset 0, 600, 1500, the middle,
   the foot; opacity 1, no transform). From 530 px: the white bar 15vh high across the window (y 765 to 900 at 1440 x 900),
   the price and the button in it; on phones www's button card (HeroSecond_btn_solid_diferent_wrapper, y 782 to 828 of
   844): white, 90vw wide, 16 px over the window's foot, the price and the arrow, the whole card the booking link; the
   body 165 / 140 px longer (www's padding on every page whose HeroSecond has the box: the destinations' and the
   articles' "Fly with us"). Ours sat at the stage's foot in the page (135 px from 530 px), 48 px over the text (www 100).
   Run: node --test test/airdolomiti-price-bar-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const base = css.replace(/@media[^{]*\{[\s\S]*?\n\}\n/g, '');
const S = 'body.brand-airdolomiti main > .section.hero-card-overlay-container .hero-card-overlay.destination';
// (www's body padding; the brand's rules start at its body class: the footer's padding here)
// only where the stage has its card (and so the bar): the flights-to-Europe hubs' ReachMonaco stage has neither, and www
// keeps no room under their footer (AD row 107 c, airdolomiti-parity-001 /voli-europa, /en/flights-europe, /de/fluege-in-europa)
const BODY = 'body.brand-airdolomiti main:has(> .section.hero-card-overlay-container .hero-card-overlay.destination .hero-card-overlay-card) ~ footer';
const PRICE = `${S} .hero-card-overlay-card > p:not(.hero-card-overlay-eyebrow, .hero-card-overlay-cta)`;
// the declarations of the rules whose selector list holds sel (in scope), merged
const decls = (scope, sel) => Object.fromEntries([...scope.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter((m) => m[1].replace(/@media[^{]*$/, '').split(/,\s*\n/).map((s) => s.replace(/^[\s\S]*\{/, '').trim()).includes(sel))
  .flatMap((m) => m[2].split(';').map((d) => d.trim()).filter(Boolean))
  .map((d) => { const [k, ...v] = d.split(':'); return [k.trim(), v.join(':').trim()]; }));
const media = (q) => css.split(`@media (${q}) {`).slice(1).map((p) => p.slice(0, p.indexOf('\n}\n'))).join('\n}\n');

test('the destination stage 100 px over the next section, a layer over the sections after it', () => {
  assert.equal(decls(base, 'body.brand-airdolomiti main > .section.hero-card-overlay-container:has(.hero-card-overlay.destination)')['margin-bottom'], '100px');
  assert.equal(decls(base, S)['z-index'], '4');
});

test('from 530 px: the bar fixed at the window\'s foot, 15vh, the price and the button on it, the stage without it', () => {
  const wide = media('width >= 530px');
  assert.equal(decls(wide, S)['padding-bottom'], undefined, 'the stage keeps no room for the bar');
  assert.equal(decls(wide, BODY)['padding-bottom'], 'calc(15vh + 30px)');
  assert.equal(decls(base, BODY)['padding-bottom'], '140px');
  assert.ok(!css.includes('main:has(> .section.hero-card-overlay-container .hero-card-overlay.destination) ~ footer'), 'no room without the card');
  // the footer's box down to the company line under the band (it was outside it: the room would start 38 px early)
  assert.equal(decls(media('width >= 930px'), 'body.brand-airdolomiti footer .footer .footer-logos')['margin-bottom'], '38px');
  assert.deepEqual([decls(wide, `${S}::after`).position, decls(wide, `${S}::after`).height], ['fixed', '15vh']);
  assert.equal(decls(wide, PRICE).position, 'fixed');
  assert.equal(decls(wide, `${S} .hero-card-overlay-cta`).position, 'fixed');
});

test('phones: the price a fixed white card 16 px over the foot, 90vw; the button the whole card', () => {
  const phone = media('width < 530px');
  const p = decls(phone, PRICE);
  assert.deepEqual([p.position, p.bottom, p.left, p.right, p['background-color'], p['font-size']], ['fixed', '16px', '5vw', '5vw', '#fff', '28.08px']);
  const a = decls(phone, `${S} .hero-card-overlay-cta a:any-link`);
  assert.deepEqual([a.position, a.bottom, a.left, a.right, a.height, a['font-size']], ['fixed', '16px', '5vw', '5vw', p.height, '0']);
});
