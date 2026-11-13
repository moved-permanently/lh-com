/* eslint-disable max-len */
/* Air Dolomiti's destination band as www's HeroMiddleNotCta (the sweep after 556; airdolomiti-parity-001
   /destinations/bari at 1440: "Discover Bari", the photo 1260 px high, a marble box with the line and the title).
   The importer writes it as hero-campaign (narrow) with a line and an h2; the theme drew it as the page stages
   (hero-campaign narrow with the h1: www's HeroFirst): the window's height under a 50 % black veil, white text
   centred, 48 px above and 64 under it. www: 140vh, no veil, 100 px above and under it, a box of marble at 60 %
   across the band 25 px in (85 px from 930 px), the line 22/30 at 85 % (90 %), the title light 34/42 at 75 %
   (38/46 at 80 %). The stages (an h1) keep their rules.
   Run: node --test test/airdolomiti-band-557.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const base = css.replace(/@media[^{]*\{[\s\S]*?\n\}\n/g, '');
const B = 'body.brand-airdolomiti main > .section > .hero-campaign-wrapper > .hero-campaign.narrow:not(:has(.hero-campaign-content h1))';
const SEC = 'body.brand-airdolomiti main > .section.hero-campaign-container:has(> .hero-campaign-wrapper > .hero-campaign.narrow):not(:has(.hero-campaign-content h1))';
// the declarations of the rules whose selector list holds sel (in scope), merged
const decls = (scope, sel) => Object.fromEntries([...scope.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter((m) => m[1].replace(/@media[^{]*$/, '').split(/,\s*\n/).map((s) => s.replace(/^[\s\S]*\{/, '').trim()).includes(sel))
  .flatMap((m) => m[2].split(';').map((d) => d.trim()).filter(Boolean))
  .map((d) => { const [k, ...v] = d.split(':'); return [k.trim(), v.join(':').trim()]; }));
const media = (q) => css.split(`@media (${q}) {`).slice(1).map((p) => p.slice(0, p.indexOf('\n}\n'))).join('\n}\n');

test('the band 140vh without the veil, 100 px above and under it (no :has() inside :has())', () => {
  assert.equal(decls(base, B)['min-height'], '140vh');
  assert.equal(decls(base, `${B} .hero-campaign-media::after`).background, 'none');
  assert.deepEqual([decls(base, SEC)['margin-top'], decls(base, SEC)['margin-bottom']], ['100px', '100px']);
  assert.ok(!/:has\([^)]*:has\(/.test(SEC));
});

test('the marble box across the band, the line 22/30 and the title light 34/42', () => {
  assert.equal(decls(base, `${B} .hero-campaign-inner`).padding, '0 25px');
  const box = decls(base, `${B} .hero-campaign-content`);
  assert.deepEqual([box['background-color'], box.padding, box['border-radius'], box.width], ['hsl(26deg 26% 95% / 60%)', '10px', '10px', '100%']);
  const p = decls(base, `${B} .hero-campaign-content > p`);
  assert.deepEqual([p['font-size'], p['line-height'], p.width, p.margin], ['22px', '30px', '85%', '0 0 32px']);
  const h = decls(base, `${B} .hero-campaign-content > h2`);
  assert.deepEqual([h['font-size'], h['line-height'], h['font-weight'], h.width, h.margin], ['34px', '42px', '300', '75%', '0 0 68px']);
});

test('from 930 px: 85 px in, the line at 90 %, the title 38/46 at 80 %', () => {
  const wide = media('width >= 930px');
  assert.equal(decls(wide, `${B} .hero-campaign-inner`).padding, '0 85px');
  assert.deepEqual([decls(wide, `${B} .hero-campaign-content > p`).width, decls(wide, `${B} .hero-campaign-content > p`)['margin-bottom']], ['90%', '42px']);
  const h = decls(wide, `${B} .hero-campaign-content > h2`);
  assert.deepEqual([h['font-size'], h['line-height'], h.width, h['margin-bottom']], ['38px', '46px', '80%', '60px']);
});
