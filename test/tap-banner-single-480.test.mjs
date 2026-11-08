/* eslint-disable max-len, import/extensions */
/* TAP's banner carousel with one slide (brief 480, tools/reports/tap/parity.md row 117; sweep 2026-11-08): www draws
   ComponentBannerCarouselModel the same with one slide as with several (/fr-fr, /de-de, /es-es miles-and-go: one slide,
   1,176 x 404 px at 1440 with the green wedge, 358 x 259 at 390, as en-pt's three), only without the controls. The
   importer wrote one slide as a plain narrow banner (1,120 x 305, no wedge). Now always the option slider; the TAP
   slider draws one slide without controls (hero-campaign-tap.js hero-campaign-single).
   Run: node --max-old-space-size=256 --test test/tap-banner-single-480.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { convertPage } from '../tools/importer/tap-import.mjs';

const slide = (title) => ({
  __typename: 'BannerSlideModel', title, buttonLabel: 'Adhérer maintenant', buttonUrl: '/inscription', description: { json: [{ nodeType: 'paragraph', content: [{ nodeType: 'text', value: 'Rejoignez gratuitement.' }] }] }, image: { _path: '/content/dam/tap/x.jpg' },
});
const page = (slides) => ({
  props: {
    pageProps: {
      page: {
        title: 'TAP Miles&Go',
        topSections: [{ __typename: 'ComponentBannerCarouselModel', size: 'default', slides }],
        sections: [{ __typename: 'ComponentHeadingModel', title: 'TAP Miles&Go' }],
      },
    },
  },
});
const blocks = (nd) => {
  const r = convertPage(nd, { url: 'https://www.flytap.com/fr-fr/miles-and-go', scope: new Set(), media: () => null });
  return [...parseHTML(`<html><body>${r.html}</body></html>`).document.querySelectorAll('.hero-campaign')].map((b) => b.className);
};

test('a banner carousel of one slide: the slider, as with several', () => {
  assert.deepEqual(blocks(page([slide('TAP Miles&Go')])), ['hero-campaign slider narrow']);
  assert.deepEqual(blocks(page([slide('One'), slide('Two')])), ['hero-campaign slider narrow']);
});
