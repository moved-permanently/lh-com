/* www's data layer (scripts/data-layer.js) and its technical names (data/aem-page-ids.json,
   tools/importer/build-aem-page-ids.js). The fixture rows were read on www on 2026-10-27; the
   market root rows follow the rule (derived, not read on www). Run: node --test test/*.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  buildLhgData, technicalNameOf, pageLhgData, resetPageIds, registerComponent,
} from '../scripts/data-layer.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IDS = JSON.parse(fs.readFileSync(path.join(root, 'data/aem-page-ids.json'), 'utf8'));
const lhg = (pathname, title = 'x | Lufthansa') => {
  const [, country, language] = pathname.match(/^\/([a-z]{2})\/([a-z]{2})/);
  return buildLhgData({
    pathname, title, technicalName: technicalNameOf(pathname, IDS), country, language,
  });
};

// section 4: public path, technical name, pageId (the page name is the last segment)
const FIXTURE = [
  ['/de/en/homepage', 'homepage', 'homepage_de_en'],
  ['/de/de/homepage', 'homepage', 'homepage_de_de'],
  ['/de/en/carry-on-baggage', 'prepare-for-your-trip/baggage/carry-on-baggage', 'prepare-for-your-trip/baggage/carry-on-baggage_de_en'],
  ['/de/de/handgepaeck', 'prepare-for-your-trip/baggage/carry-on-baggage', 'prepare-for-your-trip/baggage/carry-on-baggage_de_de'],
  ['/de/en/articles/explore-flying/aircraft-lights-explained', 'articles/explore-flying/aircraft-lights-explained', 'articles/explore-flying/aircraft-lights-explained_de_en'],
  ['/de/de/articles/explore-flying/aircraft-lights-explained', 'articles/explore-flying/aircraft-lights-explained', 'articles/explore-flying/aircraft-lights-explained_de_de'],
  ['/de/en/register-animal-cabin', 'prepare-for-your-trip/baggage/travelling-with-animals/register-animal', 'prepare-for-your-trip/baggage/travelling-with-animals/register-animal_de_en'],
  ['/de/de/register-animal-cabin', 'prepare-for-your-trip/baggage/travelling-with-animals/register-animal', 'prepare-for-your-trip/baggage/travelling-with-animals/register-animal_de_de'],
  ['/de/en/feedback', 'support/feedback', 'support/feedback_de_en'],
  ['/de/en/book-and-manage/destination?origin=FRA&destination=JFK', 'book-and-manage/destination', 'book-and-manage/destination_de_en'],
  ['/de/de/book-and-manage/destination', 'book-and-manage/destination', 'book-and-manage/destination_de_de'],
  ['/de/en/cookie-policy', 'common/privacy-statement/cookie-policy', 'common/privacy-statement/cookie-policy_de_en'],
  ['/de/en/data-protection-information', 'common/privacy-statement/info', 'common/privacy-statement/info_de_en'],
];

test('every fixture row: technical name, pageId, pageName and the categories', () => {
  FIXTURE.forEach(([p, name, pageId]) => {
    const { page } = lhg(p);
    const parts = name.split('/');
    assert.equal(technicalNameOf(p, IDS), name, p);
    assert.equal(page.pageInfo.pageId, pageId, p);
    assert.equal(page.pageInfo.pageName, parts[parts.length - 1], p);
    assert.deepEqual(page.pageInfo.country + page.pageInfo.language, p.slice(1, 3) + p.slice(4, 6), p);
    assert.deepEqual(Object.values(page.category), [0, 1, 2, 3, 4].map((i) => parts[i] || ''), p);
  });
});

test('the whole object: the homepage (www\'s title without the suffix, logged out, no components)', () => {
  assert.deepEqual(lhg('/de/en/homepage', 'Book your flight now - travel with Lufthansa to over 200 destinations | Lufthansa'), {
    page: {
      attributes: { htmlTitle: 'Book your flight now - travel with Lufthansa to over 200 destinations' },
      category: {
        category1: 'homepage', category2: '', category3: '', category4: '', category5: '',
      },
      pageInfo: {
        country: 'de', language: 'en', pageId: 'homepage_de_en', pageName: 'homepage',
      },
    },
    user: {
      profile: {
        address: {}, profileInfo: { permissions: '' }, preference: {}, loginPersistence: false, loginStatus: false, membership: { status: 'none' },
      },
    },
    marketing: {},
  });
  // register-animal: four levels, category5 empty
  assert.deepEqual(lhg('/de/de/register-animal-cabin').page.category, {
    category1: 'prepare-for-your-trip', category2: 'baggage', category3: 'travelling-with-animals', category4: 'register-animal', category5: '',
  });
  // the recorded head of /de/en/group-travel (tools/source-export/heads): its page part as www's
  assert.deepEqual(lhg('/de/en/group-travel', 'Group travel | Lufthansa').page, {
    attributes: { htmlTitle: 'Group travel' },
    category: {
      category1: 'book-and-manage', category2: 'group-travel', category3: '', category4: '', category5: '',
    },
    pageInfo: {
      country: 'de', language: 'en', pageId: 'book-and-manage/group-travel_de_en', pageName: 'group-travel',
    },
  });
});

test('market roots (derived from the rule): the language document\'s name, the URL\'s country and language', () => {
  // ch on lhcom: /ch/de/handgepaeck is de/de's document
  assert.equal(lhg('/ch/de/handgepaeck').page.pageInfo.pageId, 'prepare-for-your-trip/baggage/carry-on-baggage_ch_de');
  assert.deepEqual([lhg('/ch/en/homepage').page.pageInfo.pageId, lhg('/ch/en/homepage').page.pageInfo.country], ['homepage_ch_en', 'ch']);
  // a pilot root on lhedge: /hu/en/register-animal-cabin is de/en's document
  assert.equal(lhg('/hu/en/register-animal-cabin').page.pageInfo.pageId, 'prepare-for-your-trip/baggage/travelling-with-animals/register-animal_hu_en');
  // a pilot root's own document (not in the ids): its own path
  assert.equal(lhg('/kw/en/local-page/jarallah').page.pageInfo.pageId, 'local-page/jarallah_kw_en');
  // the ids file has no market root entries
  assert.ok(Object.keys(IDS).every((k) => /^\/(de\/en|de\/de|at\/de|gb\/en)\//.test(k)));
});

test('the ids file is the generator\'s output (one public path per technical name, live roots only, no /lhg/)', () => {
  execFileSync('node', [path.join(root, 'tools/importer/build-aem-page-ids.js'), '--check'], { stdio: 'pipe' });
  assert.equal(Object.keys(IDS).length, 729);
  assert.ok(!Object.keys(IDS).some((k) => k.includes('/lhg/')));
});

test('the page wrapper: document.title, the URL\'s locale, lh-page-id first, components when registered', async () => {
  const meta = {};
  globalThis.window = { location: { pathname: '/ch/de/handgepaeck' }, hlx: { codeBasePath: '' } };
  globalThis.document = { title: 'Handgepäck | Lufthansa', querySelector: (sel) => (sel.includes('lh-page-id') && meta.id ? { content: meta.id } : null) };
  const asked = [];
  const fetchImpl = async (url) => { asked.push(url); return new Response(JSON.stringify(IDS)); };
  resetPageIds();
  const a = await pageLhgData({ fetchImpl });
  assert.equal(a.page.attributes.htmlTitle, 'Handgepäck');
  assert.equal(a.page.pageInfo.pageId, 'prepare-for-your-trip/baggage/carry-on-baggage_ch_de');
  assert.deepEqual(asked, ['/data/aem-page-ids.json']);
  meta.id = 'campaigns/winter-sale';
  registerComponent({ componentId: 'x', componentName: 'mainStageTeaser', displayed: true });
  const b = await pageLhgData({ fetchImpl });
  assert.equal(b.page.pageInfo.pageId, 'campaigns/winter-sale_ch_de');
  assert.deepEqual(b.components, [{ componentId: 'x', componentName: 'mainStageTeaser', displayed: true }]);
  assert.equal(asked.length, 1, 'the ids are read once');
});
