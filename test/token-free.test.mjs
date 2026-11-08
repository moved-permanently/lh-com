/* eslint-disable max-len, import/no-extraneous-dependencies, import/no-relative-packages -- dev tooling; linkedom is a dev dependency, lh-edge's parser for its nodes */
/* The brief after 488, item 4 (token-free styling, step 1 of 4): the theme defaults per brand and page type and the readers
   of the carriers that replace the markers, in one module (scripts/style-markers.js: the site and lh-edge read the same),
   and their site side (scripts/token-free.js, after the markers in decorateMain). Every carrier draws what the marker it
   replaces draws (the same separator paragraph, the same classes); a marker on an element wins; the theme's own rules stay
   off (live: false) until step 2 collapses a brand's documents, so nothing visible changes while documents carry markers.
   Run: node --max-old-space-size=256 --test test/token-free.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import {
  spaceOf, sizeSteps, themeFor, THEMES, pageTypeOf, readSectionStyle, readBlockOptions, videoFragment, readPurposeBlock,
  isDefaultChoice, isCheckedDefault, readNavRole, isCaptionParagraph, isImageParagraph, headingChoice,
} from '../scripts/style-markers.js';
import { parseHtml, elements } from '../tools/workers/lh-edge/src/html.js';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');

// the site side in a linkedom page (token-free.js creates elements with the global document)
const page = (mainHtml) => {
  const { document } = parseHTML(`<html><head></head><body><main>${mainHtml}</main></body></html>`);
  globalThis.document = document;
  return document.querySelector('main');
};
const { default: decorateTokenFree } = await import('../scripts/token-free.js');
const decorate = (mainHtml, opts = {}) => {
  const main = page(mainHtml);
  decorateTokenFree(main, opts);
  return main;
};
const PICTURE = '<picture><img src="/media_1.jpg" alt="A view"></picture>';
// an element as tag, sorted attributes and content (linkedom keeps the order attributes came in)
const shape = (el) => `${el.tagName.toLowerCase()}[${[...el.attributes].map((a) => `${a.name}=${a.value}`).sort().join(' ')}]${el.innerHTML}`;
const SEP = (px, divider = false) => `p[aria-hidden=true class=spacer${divider ? ' divider' : ''} style=--spacer-size:${px}px]`;

test('the collapse table and heading steps', () => {
  assert.deepEqual([0, 25, 30, 32, 60, 80, 90, 120, 150].map(spaceOf), ['none', 'none', 'none', 'm', 'm', 'm', 'l', 'l', 'l']);
  assert.equal(spaceOf(85), null, 'between M and L: by hand');
  assert.equal(spaceOf(200), null);
  assert.equal(sizeSteps('heading-medium', 'heading-small'), 1);
  assert.equal(sizeSteps('heading-medium', 'heading-large'), -1);
  assert.equal(sizeSteps('heading-medium', 'heading-copytext-large'), 2);
});

test('theme defaults per brand and page type; every theme off (live: false) in step 1', () => {
  const lh = themeFor('lufthansa', 'service');
  assert.equal(lh.headings.h2, 'heading-medium');
  assert.equal(lh.text.width, 'limited');
  assert.deepEqual(lh.separators, { m: 60, l: 120, divider: 25 });
  assert.equal(lh.columnViews.padding, 32);
  assert.deepEqual(themeFor('lufthansa', 'article').rules, ['rule-before-info-box', 'ruled-chapters']);
  assert.deepEqual(themeFor('lufthansa', '100-years').rules, ['sections-m']);
  assert.equal(themeFor('ita').text.width, 'full');
  assert.equal(themeFor('brussels', 'service').headings.h2, 'heading-small');
  assert.equal(themeFor('brussels', 'home').headings.h2, 'heading-medium');
  assert.deepEqual(themeFor('austrian').rules, ['intro-after-h1']);
  assert.equal(themeFor('unknown-brand').headings.h1, 'heading-large');
  [...Object.keys(THEMES), 'tap', 'swiss'].forEach((b) => ['service', 'article', 'flow', 'home', '100-years'].forEach((t) => assert.equal(themeFor(b, t).live, false, `${b} ${t}`)));
  assert.equal(headingChoice(lh, 2, 'large'), 'heading-large');
  assert.equal(headingChoice(lh, 2, 'compact'), 'heading-copytext-large');
  assert.equal(headingChoice(lh, 3, 'large'), 'heading-medium');
  assert.equal(headingChoice(lh, 4, 'large'), null);
});

test('page types', () => {
  assert.equal(pageTypeOf({ path: '/de/en/x', articleHeader: true }), 'article');
  assert.equal(pageTypeOf({ path: '/de/en/100-years/chronicle' }), '100-years');
  assert.equal(pageTypeOf({ path: '/de/en/baggage', themes: 'flow-spacing, digital-assistant' }), 'flow');
  assert.equal(pageTypeOf({ path: '/de/en/homepage' }), 'home');
  assert.equal(pageTypeOf({ path: '/pt-br' }), 'home');
  assert.equal(pageTypeOf({ path: '/' }), 'home');
  assert.equal(pageTypeOf({ path: '/be/en/plan-your-trip/travel-regulations' }), 'service');
});

test('section styles: class names and the friendly "Label=value" spelling', () => {
  assert.deepEqual(readSectionStyle(['grey', 'space-m', 'wide-text', 'h2-large']), {
    space: 'm', spaceBelow: null, divider: false, dividerBelow: false, width: 'full', size: null, headings: { h2: 'large' }, image: null, quote: null,
  });
  const friendly = readSectionStyle('Space=L, Small print, H3 large, Divider below');
  assert.equal(friendly.space, 'l');
  assert.equal(friendly.size, 'small');
  assert.deepEqual(friendly.headings, { h3: 'large' });
  assert.equal(friendly.dividerBelow, true);
  assert.deepEqual(readSectionStyle(['padded', 'grey']).headings, {});
});

test('block options, video fragments, purpose blocks, form defaults, nav roles', () => {
  assert.deepEqual(readBlockOptions(['columns-media', 'space-l', 'small-print', 'background-video']), {
    space: 'l', divider: false, size: 'small', title: null, video: 'background', picture: null,
  });
  assert.deepEqual(videoFragment('/media/a.mp4#background'), { href: '/media/a.mp4', background: true, size: null });
  assert.deepEqual(videoFragment('/media/a.mp4#t=10&background'), { href: '/media/a.mp4#t=10', background: true, size: null });
  assert.deepEqual(videoFragment('/media/a.mp4#t=10'), { href: '/media/a.mp4#t=10', background: false, size: null });
  assert.deepEqual(videoFragment('/media/a.mp4'), { href: '/media/a.mp4', background: false, size: null });
  assert.deepEqual(videoFragment('/media/a.mp4#t=5&size=1920x1080'), { href: '/media/a.mp4#t=5', background: false, size: [1920, 1080] });
  assert.deepEqual(readPurposeBlock('spacer', []), { kind: 'spacer', px: 60 });
  assert.deepEqual(readPurposeBlock('spacer', ['l']), { kind: 'spacer', px: 120 });
  assert.deepEqual(readPurposeBlock('divider'), { kind: 'divider', px: 25 });
  assert.deepEqual(readPurposeBlock('app-spacer', ['m-large', 'v2']), { kind: 'app-spacer', size: 'm-large', v2Only: true });
  assert.deepEqual(readPurposeBlock('app-text', ['small']), { kind: 'app-text', small: true });
  assert.equal(readPurposeBlock('columns'), null);
  assert.ok(isDefaultChoice({ value: 'mr', label: 'Mr' }, ['MR']));
  assert.ok(isDefaultChoice({ value: 'de', label: 'Germany' }, ['Germany']));
  assert.ok(!isDefaultChoice({ value: 'fr', label: 'France' }, ['Germany']));
  assert.ok(isCheckedDefault(['yes']) && isCheckedDefault(['X']) && !isCheckedDefault(['no']) && !isCheckedDefault([]));
  assert.equal(readNavRole('Cart'), 'cart');
  assert.equal(readNavRole('locale'), 'locale');
  assert.equal(readNavRole('anything'), null);
});

test('captions: an italic paragraph right after an image (DOM and lh-edge nodes alike)', () => {
  const { document } = parseHTML(`<div><p>${PICTURE}</p><p><em>Lisbon at dusk</em></p><p><em><a href="/x">More</a></em></p><p>${PICTURE}</p><p><em>Photo:</em> credit</p></div>`);
  const ps = [...document.querySelectorAll('p')];
  assert.ok(isImageParagraph(ps[0]));
  assert.ok(isCaptionParagraph(ps[1], ps[0]));
  assert.ok(!isCaptionParagraph(ps[2], ps[1]), 'not after an image');
  assert.ok(!isCaptionParagraph(ps[4], ps[3]), 'not all of it italic');
  const { document: d2 } = parseHTML(`<div><p>${PICTURE}</p><p><em><a href="/x">More</a></em></p></div>`);
  const [img, link] = [...d2.querySelectorAll('p')];
  assert.ok(!isCaptionParagraph(link, img), 'an italic link alone stays a secondary button');
  const edge = elements(parseHtml(`<div><p>${PICTURE}</p><p><em>Lisbon at dusk</em></p></div>`))[0];
  const [ep, ec] = elements(edge);
  assert.ok(isImageParagraph(ep) && isCaptionParagraph(ec, ep), 'lh-edge nodes');
});

test('purpose blocks: Spacer (L) and Divider draw the separator paragraphs of {spacer-120} and {divider-25}', () => {
  const main = decorate('<div><p>Text</p><div class="spacer l"><div><div></div></div></div><div class="divider"><div><div></div></div></div><h2>Next</h2></div>');
  const [spacer, divider] = main.querySelectorAll('p.spacer');
  assert.equal(shape(spacer), SEP(120));
  assert.equal(shape(divider), SEP(25, true));
  assert.equal(main.querySelector('div > div.spacer, div > div.divider'), null);
});

test('section styles on the section\'s own default content; a marker wins; blocks untouched', () => {
  const main = decorate(`<div class="h2-large wide-text small-print space-m divider-below"><h2>Own</h2><h2 class="heading-small">Marked</h2><p>Text</p><p class="copytext-medium limited-width">Marked text</p><p>${PICTURE}</p><div class="columns-media"><div><div><h2>In a block</h2><p>Cell</p></div></div></div></div>`);
  const section = main.querySelector(':scope > div');
  const [own, marked] = section.querySelectorAll(':scope > h2');
  assert.equal(own.className, 'heading-large');
  assert.equal(marked.className, 'heading-small');
  const [text, markedText] = section.querySelectorAll(':scope > p:not(.spacer)');
  assert.equal(text.className, 'full-width copytext-small');
  assert.equal(markedText.className, 'copytext-medium limited-width');
  assert.equal(section.querySelector(':scope > p:has(picture)').className, '');
  assert.equal(section.querySelector('.columns-media h2').className, '');
  assert.equal(section.querySelector('.columns-media p').className, '');
  assert.equal(shape(section.firstElementChild), SEP(60));
  assert.equal(shape(section.lastElementChild), SEP(25, true));
});

test('section styles parallax and narrow: the section\'s images and quotes get the markers\' classes (the brief after 493)', () => {
  const main = decorate(`<div class="parallax narrow"><p>${PICTURE}</p><p>Text</p><blockquote><p>Quote</p><p>Source</p></blockquote><div class="columns-media"><div><div><p>${PICTURE}</p></div></div></div></div>`);
  const section = main.querySelector(':scope > div');
  assert.equal(section.querySelector(':scope > p:has(picture)').className, 'parallax');
  assert.equal(section.querySelector(':scope > p:not(:has(picture))').className, '');
  assert.equal(section.querySelector('blockquote > p').className, 'narrow');
  assert.equal(section.querySelector('.columns-media p').className, '', 'not in a block');
});

test('media.js: a link\'s #size=WxH is the video\'s size, no settings the default player (controls, round play button)', () => {
  const js = read('../scripts/media.js').replace(/\s+/g, ' ');
  assert.match(js, /if \(fragment\.size && !sizedByMarker\) settings\.add\(`size-\$\{fragment\.size\[0\]\}x\$\{fragment\.size\[1\]\}`\);/);
  assert.match(js, /else if \(!marked\) \{ \/\/ the default player \(token-free styling\): controls and the round play button \['controls', 'round-play-button'\]\.forEach/);
  const header = read('../blocks/article-header/article-header.js').replace(/\s+/g, ' ');
  assert.match(header, /\|\| block\.classList\.contains\('mobile-video'\);/);
});

test('the page\'s Headings row; block options: spacing, small print, title size', () => {
  const main = decorate('<div><h2>A</h2><h3>B</h3><p>Text</p><div class="columns-media space-l small-print title-compact"><div><div><h2>T</h2><p>Small</p></div></div></div></div>', { read: (n) => (n === 'headings' ? 'H3 large' : '') });
  const section = main.querySelector(':scope > div');
  assert.equal(section.querySelector(':scope > h2').className, '');
  assert.equal(section.querySelector(':scope > h3').className, 'heading-medium');
  const block = section.querySelector('.columns-media');
  assert.equal(shape(block.previousElementSibling), SEP(120));
  assert.equal(block.querySelector('p').className, 'copytext-small');
  assert.equal(block.querySelector('h2').className, 'heading-copytext-large');
});

test('captions become a figure with the image paragraph and its figcaption; "{caption}" and buttons as before', () => {
  const main = decorate(`<div><p>${PICTURE}</p><p><em>Lisbon at <strong>dusk</strong></em></p><p>${PICTURE}</p><p class="caption">Marked</p><p>${PICTURE}</p><p><em><a href="/x">More</a></em></p></div>`);
  const figure = main.querySelector('figure.image-caption');
  assert.equal(figure.outerHTML, `<figure class="image-caption"><p>${PICTURE}</p><figcaption>Lisbon at <strong>dusk</strong></figcaption></figure>`);
  assert.equal(main.querySelectorAll('figure').length, 1);
  assert.ok(main.querySelector('p.caption'));
  assert.ok(main.querySelector('p > em > a'));
});

test('the nav document\'s Nav Tools table: the tools list with each item\'s role', () => {
  const main = decorate('<div><div class="nav-tools"><div><div><p><span class="icon icon-austrian-cart"></span> <a href="/cart">Your Cart</a></p></div><div>Cart</div></div><div><div><span class="icon icon-globe"></span> Austria | English<ul><li><a href="/de/de">Deutschland</a></li></ul></div><div>locale</div></div><div><div><span class="icon icon-help"></span> <a href="/help">Help</a></div><div></div></div></div></div>');
  const items = [...main.querySelectorAll(':scope > div > ul > li')];
  assert.equal(items.length, 3);
  assert.equal(items[0].dataset.role, 'cart');
  assert.equal(items[0].querySelector('a').textContent, 'Your Cart');
  assert.equal(items[1].dataset.role, 'locale');
  assert.equal(items[1].querySelector(':scope > ul a').textContent, 'Deutschland');
  assert.equal(items[2].dataset.role, undefined);
});

test('app screens: App Spacer, App Divider and App Text (small) as their markers\' paragraphs', () => {
  const main = decorate('<div><div class="app-spacer medium v2"><div><div></div></div></div><div class="app-divider"><div><div></div></div></div><div class="app-text small"><div><div><p>Fine print</p></div></div></div><p>Text</p></div>');
  const section = main.querySelector(':scope > div');
  assert.deepEqual([...section.children].map(shape), ['p[aria-hidden=true class=app-spacer app-spacer-medium]', 'p[aria-hidden=true class=app-divider]', 'p[class=app-small]Fine print', 'p[]Text']);
});

test('nothing changes on today\'s documents: markers only, the theme rules off', () => {
  // an Austrian page (intro after the title), an ITA one (running text), a Brussels service page (H2), a lufthansa.com
  // article (text before an info box, chapters): the rules would act, but every theme is off
  const docs = [
    ['austrian', '/at/en/x', '<div><h1>Title</h1><p>Intro</p><h2>Sub</h2><p>Text</p></div>'],
    ['ita', '/it/en/x', '<div><h2>Sub</h2><p>Text</p><ul><li>One</li></ul></div>'],
    ['brussels', '/be/en/plan-your-trip/x', '<div><h2>Sub</h2><p>Text</p></div>'],
    ['', '/de/en/articles/x', '<div><div class="article-header"><div><div>h</div></div></div><p>Text</p><div class="columns-media"><div><div>i</div></div></div></div><div><h3>Chapter</h3><p>Text</p></div>'],
    ['', '/de/en/100-years/x', '<div><h2>A</h2></div><div><h2>B</h2></div>'],
  ];
  docs.forEach(([brand, path, html]) => {
    const main = decorate(html, { brand, path });
    assert.equal(main.innerHTML, page(html).innerHTML, `${brand || 'lufthansa'} ${path}`);
  });
  // a lufthansa.com document of today (markers, separators, captions with the marker): unchanged after the markers
  const fixture = read('./fixtures/style-markers/swiss-sports-equipment-lists.html');
  const body = parseHTML(fixture).document.querySelector('main') || parseHTML(`<main>${fixture}</main>`).document.querySelector('main');
  const before = body.innerHTML;
  globalThis.document = body.ownerDocument;
  decorateTokenFree(body, { brand: 'swiss', path: '/ch/en/x' });
  assert.equal(body.innerHTML, before);
});

test('the brief after 500: a live lufthansa.com article rules an info box after a picture and a bold chapter; Columns Media\'s picture options', () => {
  THEMES.lufthansa.live = true;
  try {
    const main = decorate(`<div><div class="article-header"><div><div>h</div></div></div><p>${PICTURE}</p><div class="columns-media"><div><div>i</div></div></div></div><div><p><strong>About</strong></p><p>Text</p></div>`, { brand: '', path: '/de/en/articles/x' });
    const [one, two] = main.querySelectorAll(':scope > div');
    assert.ok(one.querySelector('.columns-media').previousElementSibling.matches('p.spacer.divider'));
    assert.ok(two.firstElementChild.matches('p.spacer.divider'));
  } finally {
    delete THEMES.lufthansa.live;
  }
  const js = read('../blocks/columns-media/columns-media.js').replace(/\s+/g, ' ');
  assert.match(js, /const narrow = \['half-start', 'half-end', 'three-quarters'\]\.find\(\(o\) => block\.classList\.contains\(`picture-\$\{o\}`\)\);/);
});

test('decorateMain runs it after the section metadata (section classes known) and before the sections are wrapped', () => {
  const js = read('../scripts/scripts.js').replace(/\s+/g, ' ');
  assert.match(js, /decorateSectionMetadata\(main\); \/\/ token-free styling[^]*?decorateTokenFree\(main, \{ brand: brandOf\(getMetadata\), path: window\.location\.pathname, read: getMetadata, \}\); dropOtherMarkets\(main\);[^]*?decorateSections\(main\);/);
});

test('styles.css: the figure adds no box of its own; the figcaption looks as p.caption', () => {
  const css = read('../styles/styles.css').replace(/\s+/g, ' ');
  assert.match(css, /main \.default-content-wrapper > figure\.image-caption \{ margin: 0; padding: 0; \}/);
  assert.match(css, /main \.default-content-wrapper > figure\.image-caption > p \{ margin-bottom: 10px; \}/);
  assert.match(css, /main \.default-content-wrapper > figure\.image-caption > figcaption \{ margin: 0 0 40px; font-size: var\(--body-font-size-xs\); font-weight: 700; line-height: 18px; \}/);
  assert.match(css, /main \.default-content-wrapper > p\.caption \{ margin-bottom: 40px; font-size: var\(--body-font-size-xs\); font-weight: 700; line-height: 18px; \}/);
});
