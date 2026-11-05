/* eslint-disable max-len, no-restricted-syntax */
/* Accessibility on six brand sites (brief 370: SWISS, Austrian, ITA, Brussels Airlines, Discover,
   Lufthansa Cargo; axe WCAG 2.0-2.2 A/AA at 390 and 1440 plus a keyboard pass; the findings and
   their owners: tools/reports/a11y/). What lies in shared code and these brands' themes:
   - the flight search's travellers panel closes when the focus leaves it (Tab past its last
     control), the focus stays where it went; a press elsewhere closes it as before;
   - the date fields' calendar stop (the native picker button over the field, invisible) shows the
     field's ring: the rule on the field's :focus-within, not the input's :focus;
   - www's skip links on the five airlines ("Go to navigation / main content / footer", each
     language's wording from www's pages, 2026-11-01 captures; Cargo's www has none, so neither do
     the replica, lh-com and TAP's own header);
   - the image carousel's slides are no list items (role group in a ul: axe list) and its track,
     which scrolls with the arrow keys, is a Tab stop;
   - a striped table that scrolls (its 840px box, a wide table at 390) is a Tab stop, one that fits
     none;
   - the alert strip's controls (pager "1/4", ring, chevrons) at 4.5:1 on its grey and its red
     tint on every brand (ITA's #0171cf 4.32, Brussels' #e5002b 4.22: theme guesses, no recorded
     www CSS); ITA's footer language button white as the rest of its footer (#ebebeb 4.13).
   Run: node --max-old-space-size=512 --test test/brand-a11y-370.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'discover.turnsthe.page', pathname: '/', search: '', hash: '', href: 'https://discover.turnsthe.page/', origin: 'https://discover.turnsthe.page', replace: () => {},
};
window.origin = 'https://discover.turnsthe.page';
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.Event = window.Event;
globalThis.NodeFilter = { SHOW_TEXT: 4 };
globalThis.requestAnimationFrame = (f) => setTimeout(f, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\s+/g, ' ');
const focusOut = (target, relatedTarget) => {
  const e = new window.Event('focusout', { bubbles: true });
  Object.defineProperty(e, 'relatedTarget', { value: relatedTarget });
  target.dispatchEvent(e);
};

const { createPassengerPicker, PASSENGER_LABELS } = await import('../blocks/flight-search/passenger-picker.js');
const { addSkipLinks, SKIP_LINK_TEXTS } = await import('../scripts/skip-links.js');
const { default: decorateTable, keepScrollFocusable } = await import('../blocks/table-striped/table-striped.js');
const { default: decorateCarousel } = await import('../blocks/carousel-images/carousel-images.js');
if (window.hlx) window.hlx.codeBasePath = '';

test('travellers panel: closes when the focus leaves it, stays while it moves inside or to nowhere', () => {
  const picker = createPassengerPicker({ labels: PASSENGER_LABELS.en, cabins: ['E', 'B'], value: { adults: 1, cabin: 'E' } });
  const after = document.createElement('input');
  document.body.append(picker.element, after);
  const opener = picker.element.querySelector('.flight-search-travellers');
  const panel = picker.element.querySelector('.flight-search-passengers-panel');
  const [first, second] = panel.querySelectorAll('button');
  opener.click();
  assert.equal(panel.hidden, false);
  focusOut(first, second);
  assert.equal(panel.hidden, false, 'inside the panel: open');
  focusOut(first, null);
  assert.equal(panel.hidden, false, 'a press on the panel\'s text (no new focus): open');
  let focused = false;
  opener.focus = () => { focused = true; };
  focusOut(second, after);
  assert.equal(panel.hidden, true, 'Tab past the panel: closed');
  assert.equal(opener.getAttribute('aria-expanded'), 'false');
  assert.equal(focused, false, 'the focus stays where it went');
  picker.element.remove();
  after.remove();
});

test('date fields: the ring on the field while its calendar stop has the focus (:focus-within)', () => {
  const css = read('blocks/flight-search/flight-search.css');
  assert.match(css, /\.flight-search \.airport-combobox input:focus, \.flight-search \.flight-search-date:focus-within input \{ outline: 2px solid var\(--flight-search-line\);/);
  assert.doesNotMatch(css, /\.flight-search-date input:focus[ ,{]/);
  assert.match(css, /\.flight-search \.flight-search-hotel-input:focus, \.flight-search :is\(\.flight-search-hotel-check-in, \.flight-search-hotel-check-out\):focus-within \.flight-search-hotel-input \{ outline: 2px solid var\(--flight-search-line\);/);
});

const page = () => {
  document.body.innerHTML = '<header><nav id="nav"></nav></header><main><div class="section"></div></main><footer></footer>';
  return document.body;
};

test('skip links: www\'s three, first in the body, in the page\'s language; main and footer their targets', () => {
  const body = page();
  const box = addSkipLinks(document, 'Swiss', 'de');
  assert.ok(box === body.firstElementChild);
  assert.equal(box.className, 'skip-links');
  const links = [...box.querySelectorAll('a')];
  assert.deepEqual(links.map((a) => [a.textContent, a.getAttribute('href')]), [['Zur Navigation', '#nav'], ['Zum Seiteninhalt', '#main'], ['Zum Footer', '#footer']]);
  const main = document.querySelector('main');
  assert.equal(main.id, 'main');
  assert.equal(main.hasAttribute('tabindex'), false, 'not focusable by a click on its text');
  links[1].click();
  assert.equal(main.getAttribute('tabindex'), '-1', 'its link: main takes the focus');
  main.dispatchEvent(new window.Event('blur'));
  assert.equal(main.hasAttribute('tabindex'), false, 'the focus moved on: as before');
  links[0].click();
  assert.equal(document.getElementById('nav').getAttribute('tabindex'), '-1');
  assert.equal(document.querySelector('footer').id, 'footer');
  assert.equal(addSkipLinks(document, 'swiss', 'de'), null, 'once per page');
  assert.equal(document.querySelectorAll('.skip-links').length, 1);
});

test('skip links: Austrian\'s own wording, a region tag\'s language, English for one www has none of', () => {
  page();
  const texts = (brand, lang) => [...addSkipLinks(document, brand, lang).querySelectorAll('a')].map((a) => a.textContent);
  assert.deepEqual(texts('austrian', 'en'), ['Go to navigation', 'Go to main content', 'Go to end of page']);
  page();
  assert.deepEqual(texts('brussels', 'fr-BE'), ['Allez à la navigation', 'Allez au menu principal', 'Allez au bas de page']);
  page();
  assert.deepEqual(texts('discover', 'sv'), ['Go to navigation', 'Go to main content', 'Go to footer']);
});

test('skip links: none on Cargo, Lufthansa, TAP (its header has its own), the B2B site and a page without main', () => {
  for (const brand of ['cargo', '', 'tap', 'b2b', 'airdolomiti']) {
    page();
    assert.equal(addSkipLinks(document, brand, 'en'), null, brand);
    assert.equal(document.querySelector('.skip-links'), null);
  }
  document.body.innerHTML = '<header></header>';
  assert.equal(addSkipLinks(document, 'ita', 'en'), null);
  assert.deepEqual(Object.keys(SKIP_LINK_TEXTS).sort(), ['austrian', 'brussels', 'discover', 'ita', 'swiss']);
  for (const [brand, langs] of Object.entries(SKIP_LINK_TEXTS)) {
    assert.ok(langs.en, `${brand} en`);
    Object.entries(langs).forEach(([lang, t]) => assert.equal(t.length === 3 && t.every((s) => typeof s === 'string' && s.trim()), true, `${brand} ${lang}`));
  }
});

test('skip links: an id main already has (or another element holds "main") stays, the link follows it', () => {
  document.body.innerHTML = '<header></header><main id="content"></main><div id="footer"></div><footer></footer>';
  const links = [...addSkipLinks(document, 'ita', 'it').querySelectorAll('a')];
  assert.deepEqual(links.map((a) => a.getAttribute('href')), ['#nav', '#content', '#footer-skip']);
  assert.equal(document.querySelector('footer').id, 'footer-skip');
});

test('skip links: out of sight until focused (styles.css, eager: no flash before lazy styles); scripts.js adds them on brand pages', () => {
  const css = read('styles/styles.css');
  assert.match(css, /\.skip-links \.skip-link \{ position: fixed; top: 8px; left: 8px; z-index: 1100;/);
  assert.match(css, /\.skip-links \.skip-link:not\(:focus\) \{ width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset\(50%\);/);
  assert.doesNotMatch(css, /\.skip-link[^{]*\{[^}]*transform/, 'not moved off the top, over the scrolled-away header');
  assert.match(css, /:is\(main, footer, #nav\)\[tabindex="-1"\]:focus \{ outline: none; \}/);
  const js = read('scripts/scripts.js');
  assert.match(js, /import\('\.\/skip-links\.js'\)\.then\(\(\{ addSkipLinks \}\) => addSkipLinks\(document, getMetadata\('brand'\), document\.documentElement\.lang\)\)/);
});

const slide = (n) => `<div><div><picture><img src="/media_${n}.jpg" alt="Slide ${n}" width="800" height="450"></picture></div></div>`;

test('image carousel: slides are groups in a plain track (no list), the track a Tab stop; one slide: no Tab stop', () => {
  const block = document.createElement('div');
  block.className = 'carousel-images block';
  block.innerHTML = slide(1) + slide(2) + slide(3);
  document.body.append(block);
  decorateCarousel(block);
  const track = block.querySelector('.carousel-images-track');
  assert.equal(track.tagName, 'DIV');
  assert.equal(track.getAttribute('tabindex'), '0');
  const slides = [...track.children];
  assert.equal(slides.length, 3);
  assert.equal(slides.every((s) => s.tagName === 'DIV' && s.getAttribute('role') === 'group' && s.getAttribute('aria-roledescription') === 'slide'), true);
  assert.equal(block.querySelector('ul'), null);
  assert.equal(block.querySelectorAll('ol.carousel-images-dots > li').length, 3, 'the dots stay a list');
  const one = document.createElement('div');
  one.className = 'carousel-images block';
  one.innerHTML = slide(4);
  document.body.append(one);
  decorateCarousel(one);
  assert.equal(one.querySelector('.carousel-images-track').hasAttribute('tabindex'), false);
  const css = read('blocks/carousel-images/carousel-images.css');
  assert.match(css, /\.carousel-images \.carousel-images-track:focus-visible \{ outline: 2px solid var\(--focus-color\); outline-offset: -2px; \}/);
});

test('striped table: a Tab stop while it scrolls, none when it fits', async () => {
  const box = document.createElement('div');
  const size = {
    scrollWidth: 900, clientWidth: 350, scrollHeight: 400, clientHeight: 400,
  };
  Object.keys(size).forEach((k) => Object.defineProperty(box, k, { get: () => size[k] }));
  keepScrollFocusable(box);
  assert.equal(box.getAttribute('tabindex'), '0');
  size.scrollWidth = 350;
  keepScrollFocusable(box);
  assert.equal(box.hasAttribute('tabindex'), false);
  size.scrollHeight = 1200;
  keepScrollFocusable(box);
  assert.equal(box.getAttribute('tabindex'), '0', 'taller than its 840px box');
  const block = document.createElement('div');
  block.className = 'table-striped block';
  block.innerHTML = '<div><div>Weight</div><div>8 kg</div></div>';
  await decorateTable(block);
  assert.equal(block.hasAttribute('tabindex'), false, 'not laid out (linkedom): fits');
  assert.match(read('blocks/table-striped/table-striped.css'), /\.table-striped:focus-visible \{ outline: 2px solid var\(--focus-color\); outline-offset: 2px; \}/);
});

// WCAG relative luminance and contrast
const lum = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const c = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const themeVar = (brand, name) => {
  const m = read(`styles/themes/${brand}.css`).match(new RegExp(`${name}: (#[0-9a-fA-F]{3,6})`));
  return m && m[1];
};

test('alert strip: the controls at 4.5:1 on its grey (#f5f5f5) and its red tint (#cc000012 on white: #fbeded) on every brand', () => {
  const css = read('blocks/flash-teaser/flash-teaser.css');
  const own = (brand) => {
    const m = css.match(new RegExp(`body\\.brand-${brand} \\.flash-teaser-strip \\{ --flash-teaser-control: (#[0-9a-fA-F]{3,6});`));
    return m && m[1];
  };
  assert.equal(own('ita'), '#01569d', 'ITA: its link hover blue');
  assert.equal(own('brussels'), '#ac0020', 'Brussels: its link hover red');
  for (const brand of ['swiss', 'austrian', 'ita', 'brussels', 'discover']) {
    const control = own(brand) || themeVar(brand, '--lh-whale-blue');
    for (const bg of ['#f5f5f5', '#fbeded']) {
      assert.ok(contrast(control, bg) >= 4.5, `${brand} ${control} on ${bg}: ${contrast(control, bg).toFixed(2)}`);
    }
  }
});

test('footer: the language button at 4.5:1 on the footers that show it (ITA white on its blue, Discover)', () => {
  assert.equal(themeVar('ita', '--footer-locale-color'), '#fff');
  // SWISS, Austrian and Brussels footers have no language button (checked on their hosts)
  for (const brand of ['ita', 'discover']) {
    const surface = themeVar(brand, '--footer-surface');
    const color = themeVar(brand, '--footer-locale-color') || '#ebebeb';
    if (surface) assert.ok(contrast(color, surface) >= 4.5, `${brand} ${color} on ${surface}: ${contrast(color, surface).toFixed(2)}`);
  }
});
