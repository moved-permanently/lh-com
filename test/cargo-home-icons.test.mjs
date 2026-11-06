/* eslint-disable max-len, import/extensions */
/* Lufthansa Cargo's homepage icons and band artwork (brief 429, cargo row 12; cargo-media-001: www's
   own SVGs in lh-cargo's DA under /documents/, the site serves them; cargo-parity-001 at 1440 and 390):
   - the products, speeds and add-on services: each item's 88 px icon over its label, cut from
     www's sprites at www's positions (the inline <style> of www's homepage: .icon.iconCargo
     -201px -105px ...), the item known by its link (/<ll>/general-cargo ...; the same in every
     language); 88 px wide items 22 px apart, 103 px on phones;
   - the counters: the 40 px icons of www's infra sprite (www's .Earth_A, .icon-airport, .Map_*
     object-positions), in the importer's order (www's): the two big counters, then North America,
     South America, Europe, Africa, Asia; the region's label on two lines as www's spans;
   - the products band: www's OurProduct-BG.svg across the screen (#05164d, 75% / cover), behind
     the column: a layer as wide as the layout (columns-media sets --columns-media-viewport on its
     band blocks from documentElement.clientWidth, as hero-campaign: no sideways scroll);
   - the icons only with the block option icons (columns-media (band, ..., icons)): the importer
     writes it, so the published documents keep their look until the files and then the new
     documents are published.
   Cargo only (body.brand-cargo), in the block's CSS. Run:
   node --max-old-space-size=512 --test test/cargo-home-icons.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const rules = (sel) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...css.matchAll(new RegExp(`(?:^|[}\\s,])${esc} \\{([^}]*)\\}`, 'g'))].map((m) => m[1]).join(' ');
};
const after = (marker) => css.slice(css.indexOf(marker));

const SPRITE = {
  product: '/documents/sprite-product-2-34a548.svg',
  speed: '/documents/sprite-product-speed-c94f8d.svg',
  aos: '/documents/sprite-product-aos-0ce801.svg',
  infra: '/documents/sprite-infra-homepage-1-c6f447.svg',
};
// www's homepage: the item's link, its sprite and the icon's background-position
const ITEMS = [
  ['general-cargo', 'product', '-201px -105px'], ['dangerous-goods', 'product', '-202px -6px'],
  ['active-temp-control', 'product', '-104px -7px'], ['passive-temp-support', 'product', '-104px -203px'],
  ['perishables', 'product', '-201px -203px'], ['live-animals', 'product', '-6px -203px'],
  ['valuables', 'product', '-300px -7px'], ['vulnerables', 'product', '-299px -105px'],
  ['airmail', 'product', '-6px -104px'], ['products/customer-owned-tracker', 'product', '-103px -104px'],
  ['speed-pro', 'speed', '-103px -5px'], ['speed-flash', 'speed', '-5px -5px'], ['speed-zoom', 'speed', '-5px -104px'],
  ['emergency', 'aos', '-5px -6px'], ['add-on-services/sustainable-choice', 'aos', '-199px -6px'],
  ['add-on-services/todoor', 'aos', '-199px -104px'], ['add-on-services/personal-supervision', 'aos', '-1px -104px'],
  ['add-on-services/insurance', 'aos', '-101px -6px'], ['add-on-services/smartuld', 'aos', '-101px -104px'],
];
const F = 'body.appear.brand-cargo main .columns-media.features.icons .columns-media-text > ul > li > a';

test('products: an 88 px icon over each label, the band\'s items as www\'s', () => {
  assert.match(rules(`${F}:any-link::before`), /content: ""; display: block; width: 88px; height: 88px; margin: 0 auto 4px; background-color: transparent; background-repeat: no-repeat; mask: none;/, 'not the running text links\' arrow (its mask and colour)');
  assert.match(rules('body.brand-cargo .columns-media.features.icons .columns-media-text > ul'), /margin-right: -1px;/, 'eight to a row at 1440 as www\'s (858 px in 857)');
  ITEMS.forEach(([href, sprite, pos]) => {
    const r = rules(`${F}[href$="/${href}"]::before`);
    assert.ok(r.includes(`background-image: url("${SPRITE[sprite]}");`), `${href}: ${sprite} sprite (${r})`);
    assert.ok(r.includes(`background-position: ${pos};`), `${href}: ${pos}`);
  });
  assert.match(rules('body.brand-cargo .columns-media.features.icons .columns-media-text > ul > li'), /width: 103px;/, 'on phones 103 px, as www\'s min-width');
  assert.match(rules('body.brand-cargo .columns-media.features.icons .columns-media-text > ul'), /gap: 20px 16px;/);
  const wide = after("@media (width >= 768px) { /* www's rows of items without a gap");
  assert.match(wide.slice(0, 600), /gap: 0 22px;/, 'no row gap from 768 px, as www\'s');
  assert.match(wide.slice(0, 600), /width: 88px;/);
  assert.match(rules('body.brand-cargo .columns-media.features.icons .columns-media-text > ul > li > a:any-link'), /font-family: var\(--body-font-family\); font-weight: 400;/);
});

test('counters: www\'s 40 px infra icons in its order, beside the text', () => {
  const S = 'body.brand-cargo .columns-media.stats.icons .columns-media-text';
  assert.match(rules(`${S} > ul > li::before`), new RegExp(`content: ""; position: absolute; top: 50%; left: 0; width: 40px; height: 40px; margin-top: -20px; background: url\\("${SPRITE.infra}"\\) no-repeat;`));
  [['ul:first-of-type > li:nth-child(1)', '-5px -5px'], ['ul:first-of-type > li:nth-child(2)', '-2px -106px'],
    ['ul:nth-of-type(2) > li:nth-child(1)', '-105px -6px'], ['ul:nth-of-type(2) > li:nth-child(2)', '-105px -54px'],
    ['ul:nth-of-type(2) > li:nth-child(3)', '-56px -56px'], ['ul:nth-of-type(2) > li:nth-child(4)', '-55px -4px'],
    ['ul:nth-of-type(2) > li:nth-child(5)', '-5px -55px']].forEach(([li, pos]) => {
    assert.match(rules(`${S} > ${li}::before`), new RegExp(`background-position: ${pos};`), li);
  });
  assert.match(rules(`${S} > ul > li`), /position: relative; padding-left: 56px;/);
  assert.match(rules(`${S} > ul > li > strong`), /display: inline-block; width: 64px;/, 'phones: the figure in a 64 px column');
});

test('the products band: www\'s artwork across the screen behind the column', () => {
  const B = 'body.brand-cargo .columns-media.band.dark.features';
  assert.match(rules(B), /position: relative; isolation: isolate;/);
  assert.match(rules(`${B}::before`), /content: ""; position: absolute; z-index: -1; inset-block: 0; left: calc\(50% - var\(--columns-media-viewport, 100%\) \/ 2\); width: var\(--columns-media-viewport, 100%\); background: #05164d url\("\/documents\/ourproduct-bg-97be05\.svg"\) no-repeat 75% \/ cover;/);
});

test('columns-media sets the layout\'s width on its band blocks (resize too), not on others', async () => {
  const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
  window.hlx = { codeBasePath: '' };
  window.location = {
    hostname: 'main--lh-cargo--moved-permanently.aem.page', pathname: '/', search: '', replace: () => {}, href: 'https://main--lh-cargo--moved-permanently.aem.page/', origin: 'https://main--lh-cargo--moved-permanently.aem.page',
  };
  window.origin = window.location.origin;
  window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
  let width = 1425;
  Object.defineProperty(document.documentElement, 'clientWidth', { get: () => width, configurable: true });
  globalThis.window = window;
  globalThis.document = document;
  const { default: decorate } = await import('../blocks/columns-media/columns-media.js');
  const make = (cls) => {
    const block = document.createElement('div');
    block.className = `columns-media ${cls}`;
    block.innerHTML = '<div><div><h2>Products</h2></div><div><ul><li>x</li></ul></div></div>';
    document.body.append(block);
    return block;
  };
  const band = make('band dark features');
  await decorate(band);
  assert.equal(band.style.getPropertyValue('--columns-media-viewport'), '1425px');
  width = 1265;
  window.dispatchEvent(new window.Event('resize'));
  assert.equal(band.style.getPropertyValue('--columns-media-viewport'), '1265px');
  const plain = make('sidebar');
  await decorate(plain);
  assert.equal(plain.style.getPropertyValue('--columns-media-viewport'), '');
});

test('the importer: the icons option on the counters and the features, the region\'s label on two lines', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const page = `<!DOCTYPE html><html lang="en-US"><head><title>Home - Lufthansa Cargo</title></head><body><div id="content" class="container pagebody">
<div class="journal-content-article"><div class="infraWrapper"><div class="whiteBgBox"><div class="infraInner"><h2 class="infraEyebrow">Infrastructure</h2></div>
<div class="contentMapWrapper"><div class="infraStatSection"><div class="infraStatsMain"><div class="infraStat"><img class="infraStatIcon Earth_A" src="/documents/20184/0/sprite.svg/x"><div class="infraStatText"><h3 class="infraStatValue">350+</h3><h3 class="infraStatLabel">Stations worldwide</h3></div></div></div>
<div class="infraRegions"><div class="infraRow"><div class="infraRegion"><img class="infraRegionIcon Map_North_America" src="/documents/20184/0/sprite.svg/x"><div class="infraRegionTop"><h3 class="infraRegionValue">60+</h3><div class="infraRegionLabel"><span class="labelPrefix smallText m-0">Stations in</span> <span class="labelPrefix smallText m-0 bold">North America</span></div></div></div></div></div></div></div></div></div></div>
<div class="journal-content-article"><div class="ourProducts"><div class="whiteBgBox"><h2>Our Products</h2><div class="productBlock"><div class="info"><h2>Products</h2></div><div class="features"><ul><li><a href="/en/general-cargo"><span class="icon iconCargo"></span><small>General Cargo</small></a></li></ul></div></div></div></div></div>
</div></body></html>`;
  const { html } = convert(page, '/en/home', 'en');
  assert.match(html, /<div class="columns-media band gradient stats icons">/);
  assert.match(html, /<div class="columns-media band dark features icons">/);
  assert.match(html, /<li><strong>60\+<\/strong> Stations in<br>North America<\/li>/);
  assert.match(html, /<li><strong>350\+<\/strong> Stations worldwide<\/li>/);
});
