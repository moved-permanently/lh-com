/* eslint-disable max-len */
/* The ch roots' and sub-sites' links to www pages lh-swiss serves made relative
   (tools/importer/swiss-relink.mjs relinkedTo): a www page link whose target answers 200 on
   swiss.turnsthe.page becomes that path (its query and fragment kept; a target our host
   redirects to one of its pages: the page it redirects to), a www DAM link whose copy is in DA its
   Edge Delivery path; every other www link as it is. Each change counted by kind.
   Run: node --max-old-space-size=512 --test test/swiss-relink.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
// eslint-disable-next-line import/extensions
import { relinkedTo, targetOf } from '../tools/importer/swiss-relink.mjs';

const W = 'https://www.swiss.com';
const pages = new Map([
  ['/ch/fr/competitions/swiss-ice-hockey-games-2025/conditions-de-participation---swiss-ice-hockey-games-2024', '/ch/fr/competitions/swiss-ice-hockey-games-2025/conditions-de-participation-swiss-ice-hockey-games-2024'],
  ['/ch/de/fly/check-in.html', '/ch/de/fly/check-in'],
  ['/xx/de/homepage', '/ch/de/homepage'],
]);
const dam = new Map([['/content/dam/lufthansa-group/pdfs/lhg-power-of-attorney-form-en.pdf', '/content/dam/lufthansa-group/pdfs/lhg-power-of-attorney-form-en.pdf']]);

test('relinkedTo: the served pages and the DAM copies relative, query and fragment kept; other www links as they are', () => {
  const doc = `<p><a href="${W}/ch/fr/competitions/swiss-ice-hockey-games-2025/conditions-de-participation---swiss-ice-hockey-games-2024">conditions</a> <a href="${W}/ch/de/fly/check-in.html?x=1#top">Check-in</a> <a href="${W}/xx/de/homepage">Home</a> <a href="${W}/content/dam/lufthansa-group/pdfs/lhg-power-of-attorney-form-en.pdf#page=2">PDF</a> <a href="${W}/ch/de/not-ours">other</a> <a href="${W}/lhg/ch/de">LHG</a> <a href="https://shop.swiss.com/ch/de/fly/check-in">shop</a></p>`;
  const { doc: out, kinds } = relinkedTo(doc, { pages, dam });
  assert.equal(out, `<p><a href="/ch/fr/competitions/swiss-ice-hockey-games-2025/conditions-de-participation-swiss-ice-hockey-games-2024">conditions</a> <a href="/ch/de/fly/check-in?x=1#top">Check-in</a> <a href="/ch/de/homepage">Home</a> <a href="/content/dam/lufthansa-group/pdfs/lhg-power-of-attorney-form-en.pdf#page=2">PDF</a> <a href="${W}/ch/de/not-ours">other</a> <a href="${W}/lhg/ch/de">LHG</a> <a href="https://shop.swiss.com/ch/de/fly/check-in">shop</a></p>`);
  assert.deepEqual(kinds, { page: 3, dam: 1 });
  assert.deepEqual(relinkedTo(out, { pages, dam }).kinds, { page: 0, dam: 0 }, 'done twice: as it is');
});

test('targetOf: a 200 is the site path; a redirect to our host\'s own page that answers 200 is that page; anything else none', () => {
  assert.equal(targetOf({ site: '/ch/de/a', status: 200 }), '/ch/de/a');
  assert.equal(targetOf({ site: '/xx/de/homepage', status: 302, location: '/ch/de/homepage' }, (p) => p === '/ch/de/homepage'), '/ch/de/homepage');
  assert.equal(targetOf({ site: '/xx/de/homepage', status: 302, location: 'https://swiss.turnsthe.page/ch/de/homepage' }, () => true), '/ch/de/homepage');
  assert.equal(targetOf({ site: '/a', status: 301, location: 'https://www.swiss.com/a' }, () => true), null, 'a redirect to www: none');
  assert.equal(targetOf({ site: '/a', status: 302, location: '/b' }, () => false), null, 'a redirect to a page that does not answer 200: none');
  assert.equal(targetOf({ site: '/a', status: 404 }), null);
});
