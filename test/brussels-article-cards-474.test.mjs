/* Brussels' article lists (brief 474; ema-test's sweep of Brussels, rows 10-11): www's
   /be/en/articles and /be/fr/articles cards are 40 px padded above and below, the title 20/22 px bold
   with 30 px under it (24/26.4 from 768 px), the date / reading time / author line 20/22 px bold (18/19.8
   from 768 px) and 20 px over the teaser, the teaser 18/24 px with 10 px under it, "Read article" in
   the regular weight (brussels-parity-003, www's CSS rendered from the capture). Ours ran lh-com's
   card: 30 px apart, title 22 / 28 px, the line 16/27, the teaser 16/24 (each card 57-84 px shorter
   at 390, about 85 px at 1440).
   Run: node --max-old-space-size=256 --test test/brussels-article-cards-474.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const B = 'body.brand-brussels .blog-overview:not(.grid)';

test('cards 40 px padded, nothing between them', () => {
  assert.ok(css.includes(`${B} .blog-overview-list { gap: 0; }`));
  assert.ok(css.includes(`${B} .blog-overview-card { padding: 40px 0; }`));
});

test('phones: title 20/22, the line 20/22 and 20 px over the teaser, the teaser 18/24', () => {
  assert.ok(css.includes(`${B} .blog-overview-title { margin-bottom: 30px; font-size: 20px; font-weight: 700; line-height: 22px; }`));
  assert.ok(css.includes(`${B} .blog-overview-info { margin-bottom: 20px; font-size: 20px; line-height: 22px; }`));
  assert.ok(css.includes(`${B} .blog-overview-description { margin-bottom: 10px; font-size: 18px; line-height: 24px; }`));
  assert.ok(css.includes(`${B} .blog-overview-more a:any-link { font-weight: 400; }`));
});

test('the picture cropped to 16:9 as www\'s (575 x 323 at 1440, 331 x 186 at 390), whatever the file\'s shape', () => {
  assert.ok(css.includes(`${B} .blog-overview-image img { aspect-ratio: 16 / 9; object-fit: cover; }`));
});

test('from 768 px: title 24/26.4, the line 18/19.8', () => {
  assert.match(css, /@media \(width >= 768px\) \{ body\.brand-brussels \.blog-overview:not\(\.grid\) \.blog-overview-title \{ font-size: 24px; line-height: 26\.4px; \} body\.brand-brussels \.blog-overview:not\(\.grid\) \.blog-overview-info \{ font-size: 18px; line-height: 19\.8px; \} \}/);
});
