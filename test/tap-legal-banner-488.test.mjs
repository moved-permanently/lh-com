/* eslint-disable max-len, import/extensions */
/* TAP's picture-only banner above an inner page's title (brief 488, tools/reports/tap/parity.md row 125; bagagem,
   info-legal and 52 more documents): www's ComponentHeroCardModel without text shows its phone picture (imageMobile)
   below 728 px. The importer wrote the picture alone in the content (one picture a paragraph, no phone one); now the
   page's first such card is a one-row hero-campaign narrow of both pictures (hero-campaign takes the second as the
   phone one on brand tap) in a section of its own, the title in the next. A later picture-only card stays a picture
   in the content.
   Run: node --max-old-space-size=256 --test test/tap-legal-banner-488.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { convertPage } from '../tools/importer/tap-import.mjs';

const ref = (name) => ({ __typename: 'ImageRef', _path: `/content/dam/tap/${name}.jpg`, _dynamicUrl: `/adobe/dynamicmedia/deliver/dm-aid--${name}/${name}.jpg` });
const card = (n) => ({
  __typename: 'ComponentHeroCardModel', title: null, heroCardDescription: { json: [] }, image: ref(`desk${n}`), imageMobile: ref(`phone${n}`),
});
const site = {
  url: 'https://www.flytap.com/en-pt/legal-info', scope: new Set(), phonePictures: true, media: (key) => (/\/(desk|phone)\d/.test(key) ? { eds: `/media-da/tap/${key.split('/').pop()}` } : null),
};

test('the first picture-only hero card: a one-row hero-campaign narrow of the desktop and the phone picture, the title in the next section', () => {
  const nd = { props: { pageProps: { page: { title: 'Legal Information Center', topSections: [card(1)], sections: [{ __typename: 'ComponentHeadingModel', title: 'Legal Information Center' }, card(2)] } } } };
  const { html } = convertPage(nd, site);
  const { document } = parseHTML(`<html><body><main>${html}</main></body></html>`);
  const banner = document.querySelector('.hero-campaign');
  assert.ok(banner, 'the banner block');
  assert.equal(banner.className, 'hero-campaign narrow');
  assert.equal(banner.children.length, 1, 'one row');
  assert.deepEqual([...banner.querySelectorAll('img')].map((i) => i.getAttribute('src')), ['/media-da/tap/desk1.jpg', '/media-da/tap/phone1.jpg']);
  const sections = [...document.querySelector('main').children];
  const bannerSection = sections.findIndex((s) => s.contains(banner));
  assert.ok(!sections[bannerSection].querySelector('h1'), 'no title in the banner\'s section');
  assert.ok(sections[bannerSection + 1].querySelector('h1'), 'the title in the next');
  assert.equal(document.querySelectorAll('.hero-campaign').length, 1, 'a later picture-only card: no banner');
  assert.ok([...document.querySelectorAll('p > img')].some((i) => i.getAttribute('src') === '/media-da/tap/desk2.jpg'), 'it stays a picture in the content');
});
