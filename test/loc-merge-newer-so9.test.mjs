/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 9 (2026-11-12), item 2: /gb/en/business-class holds the page twice. The rollout "business-class-update"
   (2026-11-04 05:32, /gc/en saved 05:28) merged into gb/en's own copy (the import of 2026-10-22 to 10-26): DA kept both
   sides of each of the 25 differing blocks, the incoming (upstream, newer) one as <da-diff-deleted>, gb/en's own as the
   element after it with da-diff-added (tools/loc/README.md "What merge does"). The published page shows both. Only the
   stage's words differ (the newer "privacy and more space for you", the body copy and "Book Business Class"); the other
   24 blocks differ by their links alone (/gc/en against /gb/en).
   tools/loc/merge-newer.mjs keeps per pair the newer version's words: the local block where the words are the same (its
   links and pictures), else the upstream block with its links made the market's (link-lib.mjs, as the link step).
   Input: DA's current copy (GET 2026-11-12, test/fixtures/da-merge-newer-so9).
   Run: node --max-old-space-size=256 --test test/loc-merge-newer-so9.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { keepNewer } from '../tools/loc/merge-newer.mjs';

const da = fs.readFileSync(new URL('./fixtures/da-merge-newer-so9/gb-en-business-class.da.html', import.meta.url), 'utf8');
const doc = (html) => parseHTML(`<html>${html}</html>`).document;
const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
const before = doc(da);
const r = keepNewer(da, { from: 'gc/en', to: 'gb/en', newer: 'upstream' });
const after = doc(r.html);

test('no marks left, one H1 (the newer stage title), every H2 once', () => {
  assert.equal(after.querySelectorAll('da-diff-deleted, [da-diff-added]').length, 0);
  const h1 = [...after.querySelectorAll('h1')].map((h) => norm(h.textContent));
  assert.deepEqual(h1, ['Lufthansa Business Class: privacy and more space for you']);
  const h2 = [...after.querySelectorAll('h2')].map((h) => norm(h.textContent));
  assert.equal(new Set(h2).size, h2.length, h2.join(' | '));
  const localH2 = [...before.querySelectorAll('[da-diff-added] h2, h2[da-diff-added]')].map((h) => norm(h.textContent));
  assert.deepEqual(h2, localH2);
  assert.equal(r.pairs, 25);
  assert.deepEqual(r.upstream, [1], 'only the stage takes the upstream version');
});

test('the words: per pair the newer version\'s; the stage with its body copy and call to action', () => {
  // gb/en's own text with the stage's words the upstream's (the only pair whose words differ)
  const b = doc(da);
  const localStage = b.querySelector('[da-diff-added].hero-campaign');
  const upStage = localStage.previousElementSibling.firstElementChild;
  localStage.replaceWith(upStage);
  b.querySelectorAll('da-diff-deleted').forEach((d) => d.remove());
  assert.equal(norm(after.querySelector('main').textContent), norm(b.querySelector('main').textContent));
  assert.match(norm(after.querySelector('.hero-campaign').textContent), /Welcome to Business Class\..*Book Business Class$/);
});

test('links: the market\'s, as gb/en has them, and the newer stage\'s call to action as the market\'s page', () => {
  // gb/en's links today: every link outside the incoming marks, in document order
  const local = [...before.querySelectorAll('a[href]')].filter((a) => !a.closest('da-diff-deleted')).map((a) => a.getAttribute('href'));
  const links = [...after.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
  // the stage comes right after the profile navigation (its five links): there the newer version's one link
  const nav = before.querySelector('[da-diff-added].profile-nav').querySelectorAll('a[href]').length;
  assert.deepEqual(links, [...local.slice(0, nav), '/gb/en/flight-search', ...local.slice(nav)]);
  assert.ok(!links.some((h) => /^\/gc\//.test(h)), 'no /gc link');
  const book = [...after.querySelector('.hero-campaign').querySelectorAll('a')].map((a) => a.getAttribute('href'));
  assert.deepEqual(book, ['/gb/en/flight-search']);
});

test('pictures unchanged: the same image sources in the same order as gb/en\'s own side', () => {
  const src = (root, sel) => [...root.querySelectorAll(sel)].map((i) => i.getAttribute('src'));
  assert.deepEqual(src(after, 'img'), src(before, '[da-diff-added] img'));
});

test('everything outside the pairs stays as it is; a mark without its local side changes nothing', () => {
  const sections = (d) => d.querySelectorAll('main > div').length;
  assert.equal(sections(after), sections(before));
  const odd = '<body><header></header><main><div><da-diff-deleted><p>a</p></da-diff-deleted><p>b</p></div></main><footer></footer></body>';
  const o = keepNewer(odd, { from: 'gc/en', to: 'gb/en', newer: 'upstream' });
  assert.equal(o.html, odd);
  assert.deepEqual(o.refused, [0]);
  assert.throws(() => keepNewer(da, { from: 'gc/en', to: 'gb/en' }), /--newer/);
});
