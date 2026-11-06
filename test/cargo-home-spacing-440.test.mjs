/* eslint-disable max-len */
/* Brief 440, item 1: Cargo's homepage spacing per component, as www.lufthansa-cargo.com
   (cargo-parity-001 en and de at 1440 and 390). www's homepage components are boxes 40 px above and
   below their content (.whiteBgBox padding-block 40px, 20px below 1025px), one after the other, so
   every boundary between two components is 40 px from 1025 px, 20 px below; ours had lh-com's 20 px
   wrapper gap and its 48 px section gap. Each component's rule in its block's CSS, Cargo's homepage
   only (main:has(.news-feed)); the shared --spacing-default stays 20 px (ema-lufthansa's).
   On phones (www below 767.5px) the Infrastructure band's counters are www's 24 / 28 px (ours 28 /
   32 px: the labels wrapped, 86 px rows for www's 61).
   Run: node --max-old-space-size=512 --test test/cargo-home-spacing-440.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\s+/g, ' ');
const has = (css, re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));
const HOME = 'body\\.brand-cargo main:has\\(\\.news-feed\\)';

test('the news: 40 px under the booking strip from 1025 px, 20 px below (news-feed.css)', () => {
  const css = read('blocks/news-feed/news-feed.css');
  has(css, new RegExp(`${HOME} > \\.section:has\\(\\+ \\.section > \\.news-feed-wrapper\\) \\{ margin-bottom: 20px; \\}`));
  has(css, new RegExp(`@media \\(width >= 1025px\\) \\{ ${HOME} > \\.section:has\\(\\+ \\.section > \\.news-feed-wrapper\\) \\{ margin-bottom: 40px; \\} \\}`));
});

test('the bands 40 px below the component before them, About 40 px above the footer (columns-media.css)', () => {
  const css = read('blocks/columns-media/columns-media.css');
  has(css, new RegExp(`${HOME} > \\.section:has\\(> \\.columns-media-wrapper:last-child > \\.columns-media\\.band\\.facts\\) \\{ margin-bottom: 20px; \\}`));
  has(css, new RegExp(`@media \\(width >= 1025px\\) \\{ ${HOME} > \\.section > \\.columns-media-wrapper:has\\(> \\.columns-media\\.band\\) \\{ margin-top: 40px; \\} ${HOME} > \\.section:has\\(> \\.columns-media-wrapper:last-child > \\.columns-media\\.band\\.facts\\) \\{ margin-bottom: 40px; \\} \\}`));
});

test('on phones the Infrastructure counters www\'s 24 / 28 px (columns-media.css)', () => {
  const css = read('blocks/columns-media/columns-media.css');
  has(css, new RegExp(`@media \\(width < 768px\\) \\{ ${HOME} \\.columns-media\\.stats \\.columns-media-text > ul:first-of-type > li, ${HOME} \\.columns-media\\.stats \\.columns-media-text li > strong \\{ font-size: 24px; line-height: 28px; \\}`));
});

test('the fleet\'s and eServices\' headings and the ULD teaser 40 px below the component before them from 1025 px', () => {
  has(read('blocks/cards-teaser/cards-teaser.css'), new RegExp(`@media \\(width >= 1025px\\) \\{ ${HOME} > \\.section > \\.default-content-wrapper:has\\(\\+ \\.cards-teaser-wrapper > \\.cards-teaser\\.overlay\\.fleet\\) \\{ margin-top: 40px; \\} \\}`));
  has(read('blocks/carousel-cards/carousel-cards.css'), new RegExp(`@media \\(width >= 1025px\\) \\{ ${HOME} > \\.section > \\.default-content-wrapper:has\\(\\+ \\.carousel-cards-wrapper > \\.carousel-cards\\.slides\\) \\{ margin-top: 40px; \\} \\}`));
  has(read('blocks/hero-card-overlay/hero-card-overlay.css'), new RegExp(`@media \\(width >= 1025px\\) \\{ ${HOME} > \\.section > \\.hero-card-overlay-wrapper:has\\(> \\.hero-card-overlay\\.plain\\) \\{ margin-top: 40px; \\} \\}`));
});

/* the Infrastructure band below 1025 px: www's box 20 px above and below (ours 40); on phones its
   rows 61 px as www's (the counters' row at least the 40 px icon, the regions 12 px above and below
   their two-line labels, no gap between them: lh-com's lists 10 px) and 20 px from the stats to the map (ours 36) */
test('the Infrastructure band on tablets and phones as www\'s box and rows (columns-media.css)', () => {
  const css = read('blocks/columns-media/columns-media.css');
  has(css, new RegExp(`@media \\(width < 1025px\\) \\{ ${HOME} \\.columns-media\\.band\\.gradient \\{ padding-block: 20px; \\} \\}`));
  has(css, new RegExp(`${HOME} \\.columns-media\\.stats\\.icons \\.columns-media-text > ul:first-of-type > li \\{ min-height: 40px; margin-bottom: 0; align-items: center; \\}`));
  has(css, new RegExp(`${HOME} \\.columns-media\\.stats\\.icons \\.columns-media-text > ul:nth-of-type\\(2\\) > li \\{ margin-bottom: 0; padding-top: 12px; padding-bottom: 12px; \\}`));
  has(css, new RegExp(`${HOME} \\.columns-media\\.band\\.gradient \\.columns-media-row > \\.columns-media-text:not\\(:last-child\\) \\{ margin-bottom: 20px; \\}`));
});
