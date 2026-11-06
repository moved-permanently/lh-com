/* eslint-disable max-len */
/* Cargo's theme (styles/themes/cargo.css), brief 439: the photos of cargo-media-002 as www draws them
   (cargo-parity-001's screenshots and stylesheets; the importer writes them, test/cargo-import-439):
   - key facts (section key-facts): the band across the screen, the photo covering it behind the
     slides (www's .parallax-bg, background-size cover), the phone photo below 768 px (www's
     LCAGCP-lcagMobileFactsSlider), the slides the screen's width, "Key Facts" over them 20 px down
     and 16 px in (www's LCAGCP-FSTextContainer);
   - the timeline (section timeline): www's photo covering the band behind the cards at every width
     (the grey stays where there is none);
   - "Contact us" (section contact): from 768 px the photo the box's right half (16:9, as tall as the
     box: the text in the left half, centred up and down), on phones under the text across the box;
     the box's corners 4 px.
   Run: node --test test/cargo-media-439.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
// :has() inside :has() is invalid CSS (the browser drops the rule): none in the theme
test('no :has() inside :has()', () => {
  assert.doesNotMatch(css, /:has\([^)]*:has\(/);
});

const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));
const P = 'p:has\\(> picture\\)';

test('key facts: the band full width, the photo behind it, the phone photo on phones, the heading over the slides', () => {
  has(/body\.brand-cargo main > \.section\.key-facts \{[^}]*position: relative;/);
  has(/body\.brand-cargo main > \.section\.key-facts > div \{[^}]*max-width: none;[^}]*padding: 0;/);
  has(new RegExp(`body\\.brand-cargo main > \\.section:is\\(\\.key-facts, \\.timeline\\) > \\.default-content-wrapper > ${P} \\{[^}]*position: absolute;[^}]*inset: 0;[^}]*margin: 0;`));
  has(new RegExp(`body\\.brand-cargo main > \\.section:is\\(\\.key-facts, \\.timeline\\) > \\.default-content-wrapper > ${P} img \\{[^}]*width: 100%;[^}]*height: 100%;[^}]*object-fit: cover;`));
  has(new RegExp(`body\\.brand-cargo main > \\.section\\.key-facts > \\.default-content-wrapper > ${P}:has\\(\\+ p > picture\\) \\{[^}]*display: none;`), 'phones: the desktop photo hidden when a phone photo follows');
  has(new RegExp(`@media \\(width >= 768px\\) \\{[^@]*body\\.brand-cargo main > \\.section\\.key-facts > \\.default-content-wrapper > ${P}:has\\(\\+ p > picture\\) \\{[^}]*display: block;[^}]*\\}[^@]*body\\.brand-cargo main > \\.section\\.key-facts > \\.default-content-wrapper > ${P} \\+ ${P} \\{[^}]*display: none;`), 'from 768 px the desktop photo, not the phone one');
  has(new RegExp(`body\\.brand-cargo main > \\.section:is\\(\\.key-facts, \\.timeline\\) > \\.default-content-wrapper > ${P} picture \\{[^}]*display: block;[^}]*height: 100%;`), 'the picture as tall as the band (else the photo keeps its own proportions)');
  has(/body\.brand-cargo main > \.section\.key-facts > \.default-content-wrapper > h2 \{[^}]*position: relative;[^}]*z-index: 2;[^}]*margin: 0;[^}]*padding: 16px 16px 0;/, 'phones: the heading above the slides');
  has(/@media \(width >= 768px\) \{[^@]*body\.brand-cargo main > \.section\.key-facts > \.default-content-wrapper > h2 \{[^}]*position: absolute;[^}]*top: 20px;[^}]*left: 16px;[^}]*padding: 0;/, 'from 768 px over the slides');
  has(/body\.brand-cargo main > \.section:is\(\.key-facts, \.timeline\) > div:not\(\.default-content-wrapper\) \{[^}]*position: relative;[^}]*z-index: 1;[^}]*margin-top: 0;/);
});

test('key facts: one slide the band\'s width (no bleed into the page margin, no next slide peeking), the arrows inside the band, the dots over the slide\'s foot', () => {
  const K = 'body\\.brand-cargo main > \\.section\\.key-facts \\.carousel-images';
  has(new RegExp(`${K} \\{[^}]*margin-bottom: 0;`));
  has(new RegExp(`${K} \\.carousel-images-viewport \\{[^}]*--carousel-images-slide: 100cqw;`));
  has(new RegExp(`${K} \\.carousel-images-track \\{[^}]*gap: 0;[^}]*margin: 0;[^}]*padding: 0;`));
  has(new RegExp(`${K} \\.carousel-images-prev \\{[^}]*left: 0;`));
  has(new RegExp(`${K} \\.carousel-images-next \\{[^}]*right: 0;`));
  has(new RegExp(`${K} \\.carousel-images-dots \\{[^}]*position: absolute;[^}]*right: 0;[^}]*bottom: 20px;[^}]*left: 0;[^}]*margin: 0;`));
});

test('the timeline: the photo covering the band (the section a containing block)', () => {
  has(/body\.brand-cargo main > \.section\.timeline \{[^}]*position: relative;/);
});

test('"Contact us": the photo beside the text from 768 px, under it on phones; 4 px corners', () => {
  has(/body\.brand-cargo main > \.section\.contact > \.default-content-wrapper \{[^}]*overflow: hidden;[^}]*border-radius: 4px;/);
  has(new RegExp(`body\\.brand-cargo main > \\.section\\.contact > \\.default-content-wrapper:has\\(> p > picture\\) \\{[^}]*padding-top: 40px;[^}]*padding-bottom: 0;`), 'phones: www\'s text 40 px down, the photo at the foot');
  has(new RegExp(`body\\.brand-cargo main > \\.section\\.contact > \\.default-content-wrapper > ${P} \\{[^}]*margin: 40px -24px 0;`));
  has(new RegExp(`body\\.brand-cargo main > \\.section\\.contact > \\.default-content-wrapper > ${P} img \\{[^}]*display: block;[^}]*width: 100%;[^}]*aspect-ratio: 16 / 9;[^}]*object-fit: cover;`));
  has(new RegExp(`@media \\(width >= 768px\\) \\{[^@]*body\\.brand-cargo main > \\.section\\.contact > \\.default-content-wrapper:has\\(> p > picture\\) \\{[^}]*position: relative;[^}]*display: flex;[^}]*flex-direction: column;[^}]*justify-content: center;[^}]*aspect-ratio: 32 / 9;[^}]*padding: 24px calc\\(50% \\+ 24px\\) 24px 24px;`), 'the box two 16:9 halves high (taller when the text needs it), the text centred in the left half');
  has(new RegExp(`@media \\(width >= 768px\\) \\{[^@]*body\\.brand-cargo main > \\.section\\.contact > \\.default-content-wrapper > ${P} \\{[^}]*position: absolute;[^}]*inset: 0 0 0 50%;[^}]*margin: 0;`));
  has(new RegExp(`@media \\(width >= 768px\\) \\{[^@]*body\\.brand-cargo main > \\.section\\.contact > \\.default-content-wrapper > ${P} img \\{[^}]*height: 100%;[^}]*aspect-ratio: auto;`));
});
