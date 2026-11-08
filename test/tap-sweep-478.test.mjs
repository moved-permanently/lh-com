/* eslint-disable max-len, import/extensions */
/* TAP's visual sweep (brief 478, tools/reports/parity-2026-11-08/sweep-tap.md; parity.md rows 113 and 114):
   - a card list www shows as a swiper on phones (mobileType slider: the promos' News & Highlights, the Miles Store's
     and the partners' lists, payment methods; 22 lists on pt-pt and en-pt) gets cards-teaser's option phone-slider,
     one card a view and a dot each below 1025 px; a grid on phones stays a grid;
   - the picture above an inner page's title right under the trail (bagagem, info-legal) starts where a first title
     would (24 px under the trail on phones, 64 from 1025 px: www's 226 and 266 px), the title under it 32 px on
     phones, 64 from 1025 px (www's).
   Run: node --max-old-space-size=512 --test test/tap-sweep-478.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { convertPage } from '../tools/importer/tap-import.mjs';

const t = (value) => ({ nodeType: 'text', value });
const para = (...content) => ({ nodeType: 'paragraph', content });
const img = { __typename: 'ImageRef', _path: '/content/dam/tap/x.jpg', _dynamicUrl: '/adobe/dynamicmedia/deliver/dm-aid--bd6d1ad2-88c0-4ed9-9cc2-91a83509e5dc/x.jpg' };
const list = (o) => ({
  __typename: 'ComponentGenericCardListModel',
  itemsPerRow: 3,
  ...o,
  items: [{
    __typename: 'GenericCard1Model', title: o.title || 'Card', genericCard1Description: { json: [para(t('Texto.'))] }, image: img,
  }],
});

test('a card list www swipes on phones (mobileType slider) gets the option phone-slider; a grid stays a grid', () => {
  const nd = {
    props: {
      pageProps: {
        page: {
          title: 'Promoções',
          sections: [{ __typename: 'ComponentHeadingModel', title: 'Promoções e Ofertas' },
            list({ desktopType: 'grid', mobileType: 'grid', title: 'Grelha' }),
            list({ desktopType: 'grid', mobileType: 'slider', title: 'Novidades' }),
            list({ desktopType: 'slider', mobileType: 'slider', title: 'Ambos' })],
        },
      },
    },
  };
  const r = convertPage(nd, { url: 'https://www.flytap.com/pt-pt/promos', scope: new Set(), media: () => null });
  const { document } = parseHTML(`<html><body>${r.html}</body></html>`);
  assert.deepEqual([...document.querySelectorAll('.cards-teaser')].map((b) => b.className), [
    'cards-teaser three-up', 'cards-teaser three-up phone-slider', 'cards-teaser three-up slider phone-slider',
  ]);
});

test('the picture above an inner page\'s title: where a first title starts, the title 32 / 64 px under it', () => {
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  const part = css.slice(css.indexOf('the picture above an inner page\'s title right under the trail (brief 478'));
  assert.ok(part.length > 100);
  assert.match(part, /body\.brand-tap main > \.section > \.breadcrumb-wrapper \+ \.default-content-wrapper > p:first-child:has\(> picture:only-child\):has\(\+ h1\) \{\s+margin-top: 24px;/);
  assert.match(part, /body\.brand-tap main > \.section:not\(\.hidden-heading\) \.default-content-wrapper > p:has\(> picture:only-child\) \+ h1 \{\s+margin-top: 32px;/);
  assert.match(part, /@media \(width >= 1025px\) \{\s+body\.brand-tap main > \.section > \.breadcrumb-wrapper \+ \.default-content-wrapper > p:first-child:has\(> picture:only-child\):has\(\+ h1\) \{\s+margin-top: 64px;\s+\}\s+body\.brand-tap main > \.section:not\(\.hidden-heading\) \.default-content-wrapper > p:has\(> picture:only-child\) \+ h1 \{\s+margin-top: 64px;/);
});

test('the phone swiper\'s dots in TAP\'s look (the carousels\' green ring, the current one a 20 px green pill)', () => {
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  assert.match(css, /body\.brand-tap \.cards-teaser\.phone-slider \{\s+--carousel-dot-color: var\(--lh-yellow\);\s+--carousel-dot-fill: transparent;\s+--carousel-dot-radius: 9999px;\s+--carousel-dot-current-width: 20px;\s+--carousel-dot-current-color: var\(--lh-yellow\);\s+\}/);
});

test('a heading closing its section above a FAQ panel: 32 px to the panel from 1025 px (www\'s heading md:-mb-8; brief 480, row 118)', () => {
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  assert.match(css, /@media \(width >= 1025px\) \{\s+body\.brand-tap main > \.section:has\(> \.default-content-wrapper:last-child > :is\(h2, h3\):last-child\):has\(\+ \.section > \.accordion-columns-wrapper:first-child > \.accordion-columns\.faq\) \{\s+margin-bottom: 32px;/);
});

test('a TAP homepage whose stage is its first section: no 25 px above it (www\'s stage under the alerts bar; brief 480, row 119)', () => {
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  assert.match(css, /body\.brand-tap header\.tap-home ~ main > \.section:first-of-type:not\(\.breadcrumb-container\):has\(> \.hero-campaign-wrapper\) \{\s+margin-top: 0;/);
});

test('two-up text cards 24 px apart from 768 px, as www\'s gap-6 (promos\' offers: the second row 43 px lower before; brief 480, row 120)', () => {
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  // brief 483: on phones too (www's cards one under the other 24 px further apart than ours)
  assert.match(css, /\n\/\* two to a row[^*]*\*\/\nbody\.brand-tap \.cards-teaser:not\(\.three-up, \.four-up, \.phone-slider\) > ul:has\(> li > \.cards-teaser-body > p:not\(\.cards-teaser-cta\)\) \{\s+row-gap: 24px;/);
});
