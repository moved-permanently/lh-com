/* eslint-disable max-len, import/no-extraneous-dependencies -- linkedom: dev tool dependency */
/* Page check (AMS rest A11): the nine checks and the scores. Run: node --test test/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import {
  runChecks, scores, scoreOf, labelOf, sitePathOf, mediaUrlOf, CHECKS,
} from '../tools/page-check/checks.js';
import { edsDamPath } from '../scripts/dam-path.js';

const ORIGIN = 'https://main--lh-com--moved-permanently.aem.page';
const parse = (html) => parseHTML(`<!doctype html><html><body>${html}</body></html>`).document;
const BIG = 'https://www.lufthansa.com/content/dam/lh/images/frontify_variations/3/c-1563370428-52369522.jpg';
const sections = (n) => Array.from({ length: n }, (_, i) => `<div><p>Section ${i + 1}</p></div>`).join('');
// one issue of each kind (and nothing else)
const TEST_PAGE = `<div><h3>Starts too deep</h3><p>First paragraph.</p>
<p><picture><img src="${BIG}" alt="A large photo"></picture></p>
<p><picture><img src="./media_123.jpg" alt=""></picture></p>
<p><a href="/de/en/does-not-exist">a broken link</a> and <a href="/de/en/baggage">a good one</a></p>
<div class="columns"><div><div>Text</div><div></div></div></div>
</div>${sections(40)}`;

const head = async (url) => {
  if (url === `${ORIGIN}${edsDamPath('/content/dam/lh/images/frontify_variations/3/c-1563370428-52369522.jpg')}`) return { ok: true, size: 2215789 };
  if (url.endsWith('/media_123.jpg')) return { ok: true, size: 40000 };
  if (url.endsWith('/de/en/does-not-exist')) return { ok: false, size: 0 };
  return { ok: true, size: 100 };
};
const base = {
  path: '/drafts/page-check/test-page', origin: ORIGIN, sitePaths: new Set(['/de/en/baggage']), redirects: [{ Source: '/drafts/page-check/short', Destination: '/drafts/page-check/test-page' }], head, damName: edsDamPath,
};

test('page check: a page with one issue of each kind shows all nine', async () => {
  const issues = await runChecks({ ...base, doc: parse(TEST_PAGE), meta: { source: true } });
  assert.deepEqual([...new Set(issues.map((i) => i.check))].sort(), CHECKS.map((c) => c.id).sort());
  assert.equal(issues.length, 9, JSON.stringify(issues.map((i) => i.message), null, 1));
  const by = Object.fromEntries(issues.map((i) => [i.check, i]));
  assert.match(by['large-image'].message, /2\.1 MB/);
  assert.match(by['broken-link'].message, /\/de\/en\/does-not-exist/);
  assert.match(by['too-many-parts'].message, /41 sections and 1 blocks/);
  assert.match(by['short-url'].message, /\/drafts\/page-check\/short/);
  assert.match(by['heading-order'].message, /first heading is an H3/);
  assert.equal(by['broken-link'].text, 'a broken link', 'the place: the link text');
});

test('page check: a clean page has no issues; checks switched off are skipped', async () => {
  const clean = '<div><h1>Baggage</h1><p>Text.</p><h2>More</h2><p><picture><img src="./media_1.jpg" alt="Bag"></picture></p><p><a href="/de/en/baggage">ok</a></p></div>';
  assert.deepEqual(await runChecks({
    ...base, path: '/de/en/other', doc: parse(clean), meta: { source: true, title: 'Baggage', description: 'All about baggage.' },
  }), []);
  const off = await runChecks({
    ...base, doc: parse(TEST_PAGE), meta: { source: true }, disabled: new Set(['title', 'description', 'heading-order']),
  });
  assert.equal(off.length, 6);
});

test('page check outside DA: the preview head stands in for the metadata', async () => {
  const doc = parse('<div><h1>Title</h1><p>First paragraph.</p></div>');
  const fallback = await runChecks({
    ...base, path: '/x', doc, headTitle: 'Title', headDescription: 'First paragraph.',
  });
  assert.ok(fallback.some((i) => i.check === 'description'), 'a description that is the first paragraph is Edge Delivery\'s fallback: missing');
  const own = await runChecks({
    ...base, path: '/x', doc, headTitle: 'Title', headDescription: 'An own description.',
  });
  assert.ok(!own.some((i) => i.check === 'description'));
});

test('page check scores: 15 / 8 / 3 points per high / medium / low issue, labels at 80 and 60, never below 0', () => {
  assert.equal(scoreOf([]), 100);
  assert.equal(scoreOf([{ severity: 'high' }, { severity: 'medium' }, { severity: 'low' }]), 74);
  assert.equal(scoreOf(Array.from({ length: 8 }, () => ({ severity: 'high' }))), 0);
  assert.deepEqual([labelOf(80), labelOf(79), labelOf(60), labelOf(59)], ['Good', 'Warning', 'Warning', 'Poor']);
  const s = scores([{ severity: 'high', group: 'Media' }, { severity: 'medium', group: 'Accessibility' }]);
  assert.deepEqual(s.overall, { score: 77, label: 'Warning' });
  assert.deepEqual(s.groups.Media, { score: 85, label: 'Good' });
  assert.deepEqual(s.groups.Performance, { score: 100, label: 'Good' });
});

test('page check links and media: the site\'s own hosts, anchors and queries ignored, files skipped', () => {
  const page = `${ORIGIN}/de/en/baggage`;
  assert.equal(sitePathOf('/de/en/x#top', page), '/de/en/x');
  assert.equal(sitePathOf('https://lhcom.bbird.live/de/de/gepaeck?a=1', page), '/de/de/gepaeck');
  assert.equal(sitePathOf('https://www.lufthansa.com/de/en/x', page), null);
  assert.equal(sitePathOf('#anchor', page), null);
  assert.equal(sitePathOf('/content/dam/lh/x.pdf', page), null);
  assert.equal(sitePathOf('mailto:x@example.com', page), null);
  assert.equal(mediaUrlOf('./media_1.jpg?width=750', `${ORIGIN}/de/en/`), `${ORIGIN}/de/en/media_1.jpg`);
  assert.equal(mediaUrlOf('https://www.lufthansa.com/content/dam/lh/images/A_B.jpg.transform/lh-dcep-transform-width-2560/img.jpg', ORIGIN, edsDamPath), `${ORIGIN}${edsDamPath('/content/dam/lh/images/A_B.jpg')}`);
  assert.equal(mediaUrlOf('https://example.com/x.jpg', ORIGIN, edsDamPath), null);
});

test('page check outside DA: a head title that is only the first heading counts as missing', async () => {
  const doc = parse('<div><h3>Starts deep</h3><p>Text.</p></div>');
  assert.ok((await runChecks({
    ...base, path: '/x', doc, headTitle: 'Starts deep', headDescription: 'Own.',
  })).some((i) => i.check === 'title'));
  assert.ok(!(await runChecks({
    ...base, path: '/x', doc, headTitle: 'An own title', headDescription: 'Own.',
  })).some((i) => i.check === 'title'));
});

test('page check empty content: icon tokens are content; a block without any content is empty on purpose', async () => {
  const doc = parse('<div><h1>T</h1><div class="cards-icon"><div><div><span class="icon icon-hotel"></span></div><div><a href="/de/en/baggage">Hotels</a></div></div></div><div class="flash-teaser"><div><div></div></div></div></div>');
  assert.deepEqual((await runChecks({
    ...base, path: '/x', doc, meta: { source: true, title: 'T', description: 'D' },
  })).filter((i) => i.check === 'empty'), []);
});
