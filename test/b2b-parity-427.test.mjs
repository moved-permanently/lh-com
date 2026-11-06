/* eslint-disable max-len -- dev tooling */
/* B2B round 3 (brief 427, tools/reports/b2b/parity.md rows 25-28): B2B-scoped rules against the
   capture b2b-parity-001 and www's column views (every component in a .column-view: 2rem above,
   1rem below and the items' 1rem, doubled from 768 px; the views stacked without a gap):
   - row 25: blocks one after the other 40 px apart (80 from 768 px), the news lists' rows too; a
     heading opening the view after a column 20 (40) under the column end; no section gap between a
     column end and a grey band, nor before a section a separator opens after a band; an article's
     "Back to News" 8 px above the footer
   - row 26: a video beside text 16:9 (www's player), a full-width stage video as its poster
   - row 27: the cards' copy 18 / 24 regular, the partner tiles' title 18 / 24
   - row 28: a stage outside a column (hero-card-overlay: de/de and xx/de contact) as www's
     .stage: in the content's width, 1264 / 404, the title 18 / 24 bold and a small outlined button
     on its top left over www's dark gradient, no navy card
   Run: node --max-old-space-size=512 --test test/b2b-parity-427.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const theme = () => fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const part = () => { const css = theme(); const i = css.indexOf('/* round 3 (brief 427)'); assert.ok(i > 0, 'the round 3 part'); return css.slice(i); };

test('row 25: www\'s column-view rhythm between blocks, after a column end, at grey bands and the article\'s end', () => {
  const css = part();
  assert.match(css, /body\.brand-b2b main > \.section > div:not\(\.default-content-wrapper\) \+ div:not\(\.default-content-wrapper\) \{ margin-top: 40px; \}/);
  assert.match(css, /body\.brand-b2b main \.carousel-cards-wrapper \+ \.carousel-cards-wrapper > \.carousel-cards\.grid \{ margin-top: 0; \}/);
  assert.match(css, /body\.brand-b2b main \.default-content-wrapper > p\.column-mark\.column-end-outer \+ :is\(h1, h2, h3, h4, h5, h6\) \{ margin-top: 20px; \}/);
  assert.match(css, /@media \(width >= 768px\) \{ body\.brand-b2b main > \.section > div:not\(\.default-content-wrapper\) \+ div:not\(\.default-content-wrapper\) \{ margin-top: 80px; \} body\.brand-b2b main \.default-content-wrapper > p\.column-mark\.column-end-outer \+ :is\(h1, h2, h3, h4, h5, h6\) \{ margin-top: 40px; \}/);
  assert.match(css, /body\.brand-b2b main > \.section:has\(> \.default-content-wrapper:last-child > p\.column-mark\.column-end-outer:last-child\):has\(\+ \.section\.grey\), body\.brand-b2b main > \.section:has\(> \.default-content-wrapper:last-child > p\.column-mark\.column-end-outer \+ p\.spacer:last-child\):has\(\+ \.section\.grey\), body\.brand-b2b main > \.section:has\(> \.default-content-wrapper:last-child > p\.column-mark\.column-end-outer \+ p\.spacer \+ p\.spacer:last-child\):has\(\+ \.section\.grey\), body\.brand-b2b main > \.section\.grey:has\(\+ \.section > \.default-content-wrapper:first-child > p\.spacer:first-child \+ p:not\(\.spacer, \.column-mark\)\) \{ margin-bottom: 0; \}/);
  assert.match(css, /body\.brand-b2b main > \.section:last-child:has\(> \.hero-card-overlay-wrapper:last-child\), body\.brand-b2b main > \.section:last-child:has\(> \.default-content-wrapper:last-child > p\.link-wrapper:last-child\) \{ margin-bottom: 8px; \}/);
});

test('the theme has no :has() inside :has() (unforgiving: the whole rule would be dropped)', () => {
  const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = css.split('{').map((sel) => sel.split('}').pop().trim()).filter(Boolean);
  const nested = selectors.filter((sel) => {
    const stack = [];
    for (let i = 0; i < sel.length; i += 1) {
      if (sel.startsWith(':has(', i)) {
        if (stack.includes(true)) return true;
        stack.push(true);
        i += 4;
      } else if (sel[i] === '(') stack.push(false);
      else if (sel[i] === ')') stack.pop();
    }
    return false;
  });
  assert.deepEqual(nested, []);
});

test('row 25: a heading after a divider opens a column view: 20 px above it, 40 from 768 px (contact\'s "Passenger Receipts", www 72 px under the line)', () => {
  const css = part();
  assert.match(css, /body\.brand-b2b main \.default-content-wrapper > p\.spacer\.divider \+ :is\(h1, h2, h3, h4, h5, h6\) \{ margin-top: 20px; \}/);
  assert.match(css, /@media \(width >= 768px\) \{[^@]*body\.brand-b2b main \.default-content-wrapper > p\.spacer\.divider \+ :is\(h1, h2, h3, h4, h5, h6\) \{ margin-top: 40px; \}/);
});

test('row 26: a video beside text 16:9, the full-width one as its poster', () => {
  const css = part();
  assert.match(css, /body\.brand-b2b \.columns-media \.columns-media-row:has\(> \.columns-media-text\) \.media-video \{ aspect-ratio: 16 \/ 9; \}/);
  assert.match(css, /body\.brand-b2b \.columns-media \.columns-media-row:has\(> \.columns-media-text\) \.media-video :is\(picture, img\) \{ width: 100%; height: 100%; object-fit: cover; \}/);
});

test('row 27: the cards\' copy and the partner tiles\' title as www\'s', () => {
  const css = part();
  assert.match(css, /body\.brand-b2b \.cards-icon-text\.stacked \.cards-icon-text-body > p:not\(\.cards-icon-text-link\) \{ font-size: 18px; font-weight: 400; line-height: 24px; \}/);
  assert.match(css, /body\.brand-b2b \.cards-icon-text\.partner \.cards-icon-text-card \.cards-icon-text-body > \.cards-icon-text-title \{ font-size: 18px; line-height: 24px; \}/);
});

test('row 28: a stage outside a column as www\'s small stage, not the full-width navy card', () => {
  const css = part();
  const s = String.raw`body\.brand-b2b \.hero-card-overlay`;
  assert.match(css, /body\.brand-b2b main > \.section > \.hero-card-overlay-wrapper \{ max-width: var\(--content-max-width\); padding: 0 var\(--layout-margin\); \}/);
  assert.match(css, new RegExp(`${s} \\{ aspect-ratio: 1264 \\/ 404; min-height: 0; \\}`));
  assert.match(css, new RegExp(`${s} \\.hero-card-overlay-media \\{ position: absolute; inset: 0; aspect-ratio: auto; \\}`));
  assert.match(css, new RegExp(`${s} \\.hero-card-overlay-media::after \\{ position: absolute; inset: 0; background: linear-gradient\\(90deg, #0009 0, #0000 66%\\); content: ""; \\}`));
  assert.match(css, new RegExp(`${s} \\.hero-card-overlay-card \\{ position: absolute; top: 20px; left: 20px; width: auto; max-width: calc\\(100% - 40px\\); margin: 0; padding: 0; border-radius: 0; background: none; \\}`));
  assert.match(css, new RegExp(`${s} \\.hero-card-overlay-card h2 \\{ margin: 0 0 10px; color: #f5f5f5; font-size: 18px; font-weight: 700; line-height: 24px; \\}`));
  assert.match(css, new RegExp(`${s} \\.hero-card-overlay-card \\.button \\{ min-height: 30px; padding: 5px 30px; border-color: #f5f5f5; color: #f5f5f5; font-size: 14px; line-height: 18px; \\}`));
  assert.match(css, new RegExp(`@media \\(width >= 768px\\) \\{ ${s} \\.hero-card-overlay-card \\{ top: 40px; left: 40px; max-width: calc\\(100% - 80px\\); \\} \\}`));
});

test('row 29: the inspirational stage (hero-campaign; celebrating-shared-stories) as www\'s promo-hero: in the content\'s width, the picture a 450 px panel, the teal gradient beside it, the text 88 px in; stacked below 1025 px', () => {
  const css = part();
  const h = String.raw`body\.brand-b2b \.hero-campaign`;
  assert.match(css, new RegExp(`${h} \\{ width: auto; min-height: 450px; margin-inline: 0; overflow: hidden; border-radius: 4px; background: linear-gradient\\(170deg, #199ca2 0%, #045064 100%\\); \\}`));
  assert.match(css, new RegExp(`${h} \\.hero-campaign-media::after \\{ display: none; \\}`));
  assert.match(css, new RegExp(`${h} \\.hero-campaign-content :is\\(h1, h2, h3, h4, h5, h6\\) \\{ margin-bottom: 32px; font-size: 32px; font-weight: 400; line-height: 38px; \\}`));
  assert.match(css, new RegExp(`${h} \\.hero-campaign-cta a\\.button:any-link \\{ min-height: 52px; padding: 12px 28px; border: 2px solid #fff; border-radius: 4px; background: #fff; color: #000; font-size: 16px; font-weight: 600; \\}`));
  assert.match(css, new RegExp(`@media \\(width >= 1025px\\) \\{ ${h} \\.hero-campaign-media \\{ inset: 0 auto 0 0; width: 450px; height: auto; \\} ${h} \\.hero-campaign-inner \\{ max-width: none; margin: 0 0 0 450px; padding: 88px; \\}`));
  assert.match(css, /body\.brand-b2b main > \.section\.hero-campaign-container \{ margin-bottom: var\(--section-gap\); \}/);
});
