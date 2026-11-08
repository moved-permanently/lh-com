/* eslint-disable max-len */
/* Lufthansa Cargo, the company pages' stages (brief 503, Cargo row 38; the sweep after 501 on
   preview against cargo-parity-001): www's LCAGCP header sits right under the site header (ours
   25 px lower, styles.css's space above a page's first section), and below 992 px a video header is
   the video across the screen at its own 16:9 (219 px at 390) with its title in a white box under it
   (16 px in, 24/29 navy, the link row under it; 97 px with a title, 58 without), where ours drew a
   320 px video with the navy title on it. From 992 px the 900 px stage as before. Cargo's theme only
   (styles/themes/cargo.css). Run: node --max-old-space-size=512 --test test/cargo-video-stage-503.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const cargo = () => read('styles/themes/cargo.css');
const has = (css, re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));
const V = 'body\\.brand-cargo \\.hero-campaign\\.narrow:has\\(> \\.hero-campaign-media video\\)';

test('row 38: a company page\'s stage right under the header (no first-section space), as www\'s', () => {
  has(cargo(), /body\.brand-cargo main > \.section\.hero-campaign-container:first-of-type:has\(\.hero-campaign\.narrow\) \{ margin-top: 0; \}/);
});

test('row 38: below 992 px a video stage is the video at 16:9 with its title in a white box under it', () => {
  const css = cargo();
  const phone = css.split('@media (width < 992px)').slice(1).join(' ');
  assert.ok(phone, 'a block below 992 px (www\'s LCAGCP header: 100vh from 992 px)');
  has(phone, new RegExp(`${V} \\{[^}]*display: block;[^}]*min-height: 0;[^}]*padding-bottom: 0;[^}]*color: #05164d;`));
  has(phone, new RegExp(`${V} > \\.hero-campaign-media \\{[^}]*position: relative;[^}]*aspect-ratio: 16 / 9;`), 'the video in the flow at its own ratio (the three are 16:9)');
  has(phone, new RegExp(`${V} > \\.hero-campaign-inner \\{[^}]*padding: 26px 16px 32px;[^}]*background-color: #fff;`), 'www\'s text box: 16 px in, the title 10 px lower, the link row of 16 px');
  has(phone, new RegExp(`${V} h1 \\{[^}]*margin: 0 0 10px;[^}]*color: #05164d;[^}]*font-weight: 500;`));
  has(phone, new RegExp(`${V} > \\.hero-campaign-toggle \\{[^}]*top: calc\\(100vw \\* 9 / 16 - 57px\\);[^}]*bottom: auto;`), 'the play/pause toggle stays on the video');
});

test('row 38: a picture stage (What\'s up now) keeps its phone height, the video rules need the video', () => {
  const css = cargo();
  has(css, /body\.brand-cargo \.hero-campaign\.narrow \{[^}]*min-height: 320px;/);
  const phone = css.split('@media (width < 992px)').slice(1).join(' ');
  assert.ok(!/body\.brand-cargo \.hero-campaign\.narrow \{/.test(phone.split('@media')[0]), 'no rule for every narrow stage below 992 px');
});
