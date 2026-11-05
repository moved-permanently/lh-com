/* eslint-disable max-len, import/extensions, no-restricted-syntax, no-await-in-loop */
/* The demo badge (brief 389, scripts/demo-badge.js): once the showcase notice is acknowledged, a
   small fixed label in the bottom right corner on every page, "DEMO" then "Not a <brand> website"
   (the brand's own name from scripts/brands.js, English on every locale). Behind the site flag
   demo-badge (/config/flags, on by default: no row, an unreadable sheet or any value but off /
   false is on). Where the showcase notice applies (demo hosts; not in authoring, in iframes or
   under /tools/); loaded in the delayed phase; fixed, no font of its own, not focusable; it moves
   up above fixed or sticky things at its corner (the cookie banner, a chat, a sticky bar, TAP's
   call-back button) and hides under a screen-high overlay.
   Run: node --max-old-space-size=512 --test test/demo-badge.test.mjs */
/* global globalThis */
import test, { beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="de"><head><meta name="brand" content="swiss"></head><body><header></header><main><div class="section"></div></main></body></html>');
window.hlx = { codeBasePath: '' };
const setLocation = (pathname, hostname = 'swiss.turnsthe.page', search = '') => {
  window.location = {
    hostname, pathname, search, hash: '', href: `https://${hostname}${pathname}${search}`, origin: `https://${hostname}`,
  };
};
setLocation('/ch/de/homepage');
Object.defineProperty(window, 'origin', { value: 'https://swiss.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
window.top = window;
window.self = window;
window.innerHeight = 800;
window.innerWidth = 390;

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const sheet = (data) => new Response(JSON.stringify({ total: data.length, data, ':type': 'sheet' }), { headers: { 'content-type': 'application/json' } });
let answer = () => new Response('', { status: 404 });
globalThis.fetch = async (url) => answer(url);

const { resetFlags, loadFlags } = await import('../scripts/flags.js');
const badge = await import('../scripts/demo-badge.js');
const { BRANDS } = await import('../scripts/brand.js');
const { STORAGE_KEY } = await import('../scripts/showcase-notice.js');

const noStyles = async () => {};
beforeEach(() => {
  resetFlags();
  badge.resetDemoBadge();
  document.querySelectorAll('.demo-badge, .demo-badge-sr').forEach((e) => e.remove());
  setLocation('/ch/de/homepage');
  window.top = window;
  answer = () => new Response('', { status: 404 });
});

after(() => badge.resetDemoBadge());

test('the texts: DEMO, then "Not a(n) <brand> website" with each brand\'s own name (an before a vowel: ITA, Austrian, Air Dolomiti); lh-com Lufthansa; a brand added later by its entry', () => {
  assert.equal(badge.BADGE_TAG, 'DEMO');
  const expected = {
    discover: 'Discover Airlines', ita: 'ITA Airways', austrian: 'Austrian Airlines', brussels: 'Brussels Airlines', swiss: 'SWISS', b2b: 'Lufthansa Group for Business', cargo: 'Lufthansa Cargo', airdolomiti: 'Air Dolomiti', tap: 'TAP Air Portugal',
  };
  Object.entries(expected).forEach(([key, name]) => assert.equal(BRANDS[key].name, name, key));
  const article = (name) => (/^[aeiou]/i.test(name) ? 'an' : 'a');
  Object.entries(BRANDS).forEach(([key, entry]) => assert.equal(badge.badgeText((n) => (n === 'brand' ? key : '')), `Not ${article(entry.name)} ${entry.name} website`, key));
  [['ita', 'Not an ITA Airways website'], ['austrian', 'Not an Austrian Airlines website'], ['airdolomiti', 'Not an Air Dolomiti website'], ['swiss', 'Not a SWISS website'], ['tap', 'Not a TAP Air Portugal website']]
    .forEach(([key, text]) => assert.equal(badge.badgeText((n) => (n === 'brand' ? key : '')), text, `${key}: "an" before a vowel`));
  assert.equal(badge.badgeText(() => ''), 'Not a Lufthansa website', 'lh-com');
});

test('the flag: no row, any other value or an empty one: on; off or false (any case, trimmed by flags.js): off', () => {
  assert.equal(badge.badgeFlagOn(new Map()), true);
  ['on', 'yes', '', 'true', 'aus'].forEach((v) => assert.equal(badge.badgeFlagOn(new Map([['demo-badge', v]])), true, v));
  ['off', 'false'].forEach((v) => assert.equal(badge.badgeFlagOn(new Map([['demo-badge', v]])), false, v));
  assert.equal(badge.badgeFlagOn(null), true);
});

test('the flag from the site\'s sheet: a missing sheet, an unreadable one or a failed fetch: on; a row OFF / False: off', async () => {
  for (const [label, reply, want] of [
    ['404', () => new Response('', { status: 404 }), true],
    ['not JSON', () => new Response('<html>', { status: 200 }), true],
    ['fetch fails', () => { throw new Error('offline'); }, true],
    ['other rows only', () => sheet([{ flag: 'live-chat', value: 'on' }]), true],
    ['row on', () => sheet([{ flag: 'demo-badge', value: 'on' }]), true],
    ['row OFF', () => sheet([{ flag: 'demo-badge', value: ' OFF ' }]), false],
    ['row False', () => sheet([{ flag: ' Demo-Badge ', value: 'False' }]), false],
  ]) {
    resetFlags();
    answer = reply;
    assert.equal(badge.badgeFlagOn(await loadFlags()), want, label);
  }
});

test('shown: fixed label with the two parts in English, aria-hidden, nothing focusable; the same words for screen readers before main; once per page', async () => {
  const el = await badge.default({ loadStyles: noStyles });
  assert.ok(el, 'shown');
  assert.equal(document.querySelectorAll('.demo-badge').length, 1);
  assert.equal(el.getAttribute('lang'), 'en');
  assert.equal(el.getAttribute('aria-hidden'), 'true');
  assert.equal(el.querySelector('.demo-badge-tag').textContent, 'DEMO');
  assert.equal(el.querySelector('.demo-badge-text').textContent, 'Not a SWISS website');
  assert.equal(el.querySelectorAll('a, button, input, [tabindex]').length, 0, 'not focusable');
  assert.equal(el.hasAttribute('tabindex'), false);
  const sr = document.querySelector('.demo-badge-sr');
  assert.ok(sr, 'screen reader text');
  assert.equal(sr.textContent, 'Demo: not a SWISS website.');
  assert.equal(sr.getAttribute('lang'), 'en');
  assert.equal(sr.nextElementSibling, document.querySelector('main'), 'right before main');
  assert.equal(await badge.default({ loadStyles: noStyles }), null, 'once');
  assert.equal(document.querySelectorAll('.demo-badge').length, 1);
});

test('flag off: no badge; the sheet unreadable: the badge', async () => {
  answer = () => sheet([{ flag: 'demo-badge', value: 'off' }]);
  assert.equal(await badge.default({ loadStyles: noStyles }), null);
  assert.equal(document.querySelector('.demo-badge'), null);
  badge.resetDemoBadge();
  resetFlags();
  answer = () => { throw new Error('offline'); };
  assert.ok(await badge.default({ loadStyles: noStyles }));
});

test('where the showcase notice does not apply: none (DA authoring, an iframe, /tools/)', async () => {
  setLocation('/ch/de/homepage', 'main--lh-swiss--moved-permanently.aem.page', '?dapreview=on');
  assert.equal(await badge.default({ loadStyles: noStyles }), null, 'dapreview');
  badge.resetDemoBadge();
  setLocation('/tools/sidekick/library.html');
  assert.equal(await badge.default({ loadStyles: noStyles }), null, '/tools/');
  badge.resetDemoBadge();
  setLocation('/ch/de/homepage');
  window.top = {};
  assert.equal(await badge.default({ loadStyles: noStyles }), null, 'iframe');
  window.top = window;
  badge.resetDemoBadge();
  assert.ok(await badge.default({ loadStyles: noStyles }), 'a page');
});

test('placement: nothing at the corner: 0; a bottom bar or banner: above it; a screen-high overlay: hidden', () => {
  const rect = {
    top: 764, bottom: 788, left: 170, right: 378,
  };
  assert.deepEqual(badge.placement(rect, 800, []), { lift: 0, hidden: false });
  assert.deepEqual(badge.placement(rect, 800, [{ top: 720, bottom: 800 }]), { lift: 800 - 720 + 8 - 12, hidden: false }, 'a sticky bar 80 px high');
  assert.deepEqual(badge.placement(rect, 800, [{ top: 740, bottom: 790 }, { top: 600, bottom: 800 }]), { lift: 800 - 600 + 8 - 12, hidden: false }, 'the highest');
  assert.equal(badge.placement(rect, 800, [{ top: 100, bottom: 800 }]).hidden, true, 'a menu over the screen');
});

test('obstacles: what is fixed or sticky under the badge\'s corner (the badge itself and the page\'s flow not)', () => {
  const doc = parseHTML('<html><body><div id="flow"><p id="p">x</p></div><div id="banner"><button id="ok">OK</button></div><div class="demo-badge" id="b"><span id="t">DEMO</span></div></body></html>').document;
  const pos = { banner: 'fixed' };
  doc.elementsFromPoint = () => [doc.getElementById('t'), doc.getElementById('b'), doc.getElementById('ok'), doc.getElementById('banner'), doc.getElementById('p'), doc.getElementById('flow'), doc.body, doc.documentElement];
  doc.getElementById('banner').getBoundingClientRect = () => ({ top: 650, bottom: 800 });
  const style = (el) => ({ position: pos[el.id] || 'static' });
  const found = badge.obstaclesAt({
    top: 764, bottom: 788, left: 170, right: 378,
  }, doc, doc.getElementById('b'), style);
  assert.deepEqual(found, [{ top: 650, bottom: 800 }]);
  pos.banner = 'static';
  assert.deepEqual(badge.obstaclesAt({
    top: 764, bottom: 788, left: 170, right: 378,
  }, doc, doc.getElementById('b'), style), []);
});

test('obstacles: an empty fixed backdrop (OneTrust\'s dark filter) is none, the badge stays over it; a chat frame or a bar with text is one', () => {
  const doc = parseHTML('<html><body><div id="filter"></div><div id="chat"><iframe title="chat"></iframe></div><div id="bar"><span id="price">CHF 763</span></div><div class="demo-badge" id="b"></div></body></html>').document;
  const ids = ['filter', 'chat', 'bar'];
  doc.elementsFromPoint = () => ids.map((id) => doc.getElementById(id));
  ids.forEach((id, i) => { doc.getElementById(id).getBoundingClientRect = () => ({ top: [0, 700, 720][i], bottom: 800 }); });
  const style = () => ({ position: 'fixed' });
  const rect = {
    top: 764, bottom: 788, left: 170, right: 378,
  };
  assert.deepEqual(badge.obstaclesAt(rect, doc, doc.getElementById('b'), style), [{ top: 700, bottom: 800 }, { top: 720, bottom: 800 }]);
});

test('the stylesheet: fixed, bottom right, lifted by --demo-badge-lift, no pointer events, the page\'s own font only, contrast colours', () => {
  const css = read('styles/demo-badge.css').replace(/\s+/g, ' ');
  assert.ok(/\.demo-badge \{[^}]*position: fixed;[^}]*right: 12px;[^}]*bottom: calc\(12px \+ var\(--demo-badge-lift, 0px\)\);/.test(css), 'fixed, bottom right');
  assert.ok(/\.demo-badge \{[^}]*pointer-events: none;/.test(css), 'never in the way of a click');
  assert.ok(!/@font-face|@import|url\(/.test(css), 'no font or file of its own');
  assert.ok([...css.matchAll(/font-family: ([^;]+);/g)].every((m) => m[1] === 'var(--body-font-family, sans-serif)'), 'the page\'s body font');
  assert.ok(/\.demo-badge-tag \{[^}]*background-color: #ffd400; color: #000;/.test(css), 'DEMO black on yellow (15:1)');
  assert.ok(/\.demo-badge-text \{[^}]*background-color: #1a1a1a; color: #fff;/.test(css), 'white on near black (17:1)');
  assert.ok(/\.demo-badge-sr \{[^}]*position: absolute;[^}]*clip-path: inset\(50%\);/.test(css), 'visually hidden');
  assert.ok(/prefers-reduced-motion: reduce/.test(css));
});

test('wiring: the delayed phase loads it on demo hosts where the notice was acknowledged (the notice\'s key), the notice\'s "I understand" shrinks into it', () => {
  const src = read('scripts/scripts.js');
  const delayed = src.slice(src.indexOf('function loadDelayed()'), src.indexOf('async function loadPage()'));
  assert.ok(delayed.indexOf('if (barePage) return;') < delayed.indexOf("import('./demo-badge.js')"), 'not on bare pages');
  assert.match(delayed, /if \(isDemoHost\(\) && showcaseAcknowledged\(\)\) \{\s*import\('\.\/demo-badge\.js'\)/);
  assert.ok(src.includes(`localStorage.getItem('${STORAGE_KEY}')`), 'the notice\'s storage key');
  assert.doesNotMatch(src.slice(0, src.indexOf('function loadDelayed()')), /demo-badge/, 'not before the delayed phase');
  const notice = read('scripts/showcase-notice.js');
  const click = notice.slice(notice.indexOf("button.addEventListener('click'"));
  assert.match(click, /const from = dialog\.getBoundingClientRect\(\);/);
  assert.match(click, /import\('\.\/demo-badge\.js'\)\.then\(\(\{ default: showDemoBadge \}\) => showDemoBadge\(\{ from \}\)\)/, 'also without storage: the badge for this page view');
  assert.match(read('scripts/showcase-scope.js'), /export function noticeApplies\(\)/, 'one rule for both');
  assert.match(notice, /import \{ noticeApplies \} from '\.\/showcase-scope\.js';/);
  assert.match(read('scripts/demo-badge.js'), /import \{ noticeApplies \} from '\.\/showcase-scope\.js';/);
  assert.match(notice, /return noticeApplies\(\) && !isAcknowledged\(\);/, 'the notice\'s own rules unchanged');
});
