/* eslint-disable max-len */
/* The micro-frontend block's apps (blocks/micro-frontend mountPlan): trip-management as before;
   help-center-web (ITA's and Austrian's contact pages) and culinary-hub (Austrian's culinary
   journey) from the brand's www with the brand's design system (www.austrian.com's capture:
   mausy-v1.40.1, austrian.css; www.ita-airways.com serves the same files, ita.css), rows after the
   app's name as the element's data- attributes, and for both the page's X-Portal, X-Portal-Site
   and X-Portal-Language meta tags they read (else the help center runs as Lufthansa's, the
   culinary hub without a theme).
   Run: node --max-old-space-size=512 --test test/micro-frontend-apps.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
// the block's imports load scripts.js: on a demo host's / it only redirects (stubbed)
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/', search: '', replace: () => {}, href: 'https://main--lh-com--moved-permanently.aem.page/', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const {
  mountPlan, appOf, DESIGN_SYSTEM_CSS, DESIGN_SYSTEM_JS,
} = await import('../blocks/micro-frontend/micro-frontend.js');
const { BRANDS } = await import('../scripts/brands.js');

const blockOf = (rows) => {
  const block = document.createElement('div');
  block.className = 'micro-frontend';
  block.innerHTML = rows.map((cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`).join('');
  return block;
};

test('trip-management: as before (www.lufthansa.com, its design system, its classes)', () => {
  const plan = mountPlan(blockOf([['trip-management']]), null, { country: 'de', lang: 'en' });
  assert.deepEqual(plan, {
    tag: 'trip-management',
    className: 'full-width-bg px-0 pb-5',
    css: DESIGN_SYSTEM_CSS,
    scripts: [{ src: DESIGN_SYSTEM_JS, module: true }, { src: 'https://www.lufthansa.com/digitalhangar/trip-management/trip-management/trip-management-latest.js', module: false }],
    attributes: {},
    meta: {},
  });
  assert.equal(appOf(blockOf([['']])).tag, 'trip-management', 'no name: the default');
});

test('help-center-web on Austrian\'s and ITA\'s pages: their www, design system, the X-Portal meta', () => {
  const aua = mountPlan(blockOf([['help-center-web']]), BRANDS.austrian, { country: 'at', lang: 'en', brand: 'austrian' });
  assert.equal(aua.tag, 'help-center-web');
  // from austrian.turnsthe.page since brief 397 (test/micro-frontend-austrian-help.test.mjs)
  assert.equal(aua.css, 'https://austrian.turnsthe.page/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/css/austrian.css');
  assert.deepEqual(aua.scripts, [
    { src: 'https://austrian.turnsthe.page/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/packages/maui-design-system.js', module: true },
    { src: 'https://austrian.turnsthe.page/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.2.js', module: true },
  ]);
  assert.deepEqual(aua.attributes, { 'data-public-endpoint': '' });
  assert.deepEqual(aua.meta, {
    'X-Portal': 'OS', 'X-Portal-Site': 'AT', 'X-Portal-Language': 'en', 'X-Line': 'b',
  });
  const ita = mountPlan(blockOf([['help-center-web']]), BRANDS.ita, { country: 'it', lang: 'it', brand: 'ita' });
  assert.equal(ita.css, 'https://ita.turnsthe.page/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/css/ita.css', 'from its turnsthe.page host (brief 391)');
  // and www's X-Line (test/micro-frontend-ita-help.test.mjs)
  assert.deepEqual(ita.meta, {
    'X-Portal': 'ITA', 'X-Portal-Site': 'IT', 'X-Portal-Language': 'it', 'X-Line': 'b',
  });
});

test('culinary-hub: the rows after its name as data- attributes (Austrian\'s configuration and gateway)', () => {
  const plan = mountPlan(blockOf([['culinary-hub'], ['Configuration', 'apiKey:abc;tmc:13806'], ['API gateway', 'https://api.travelid.austrian.com/one-catering/v1']]), BRANDS.austrian, { country: 'at', lang: 'de', brand: 'austrian' });
  assert.equal(plan.tag, 'culinary-hub');
  assert.deepEqual(plan.scripts[1], { src: 'https://austrian.turnsthe.page/digitalhangar/onecatering/culinary-hub/culinary-hub-latest.js', module: false });
  assert.deepEqual(plan.attributes, {
    'data-public-endpoint': '', 'data-configuration': 'apiKey:abc;tmc:13806', 'data-api-gateway': 'https://api.travelid.austrian.com/one-catering/v1',
  });
  // its theme from X-Portal (www's body maui-theme-os; without the meta maui-theme-undefined) and
  // www's classes
  assert.deepEqual(plan.meta, {
    'X-Portal': 'OS', 'X-Portal-Site': 'AT', 'X-Portal-Language': 'de', 'X-Line': 'b',
  });
  assert.equal(plan.className, 'full-width-bg px-0');
  assert.ok(appOf(blockOf([['no-such-app']])) === null);
});

// DA turns ":https:" of a configuration ("dmc:https://www…") into an icon (<span class="icon
// icon-https"></span>): Austrian's /at/en/culinaryjourney on preview (2026-11-01) read
// "dmc//www.austrian.com/…". The block reads an icon span back as its :name: text.
test('a row value with DA\'s icon span reads as its :name: text (culinary-hub configurations with dmc:https://)', () => {
  const plan = mountPlan(blockOf([['culinary-hub'], ['Configuration', 'apiKey:abc;dmc<span class="icon icon-https"></span>//www.austrian.com/at/en/fly/on-board/menu-card.html;tmc:13806']]), BRANDS.austrian, { country: 'at', lang: 'en', brand: 'austrian' });
  assert.equal(plan.attributes['data-configuration'], 'apiKey:abc;dmc:https://www.austrian.com/at/en/fly/on-board/menu-card.html;tmc:13806');
});

// Discover's /de/en/culinaryjourney (www, 2026-10-27): <culinary-hub data-configuration
// data-api-gateway class="full-width-bg px-0 maui-theme-four_y">, its design system v1.38.0
// discover.css (200 from www.discover-airlines.com, as maui-design-system.js and
// culinary-hub-latest.js), X-Portal FOUR_Y
test('culinary-hub on Discover: www.discover-airlines.com, its design system v1.38.0 (discover.css), X-Portal FOUR_Y', () => {
  const plan = mountPlan(blockOf([['culinary-hub'], ['Configuration', 'apiKey:k;tmc:13806'], ['API gateway', 'https://api.travelid.lufthansa.com/one-catering/v1']]), BRANDS.discover, { country: 'de', lang: 'en', brand: 'discover' });
  assert.equal(plan.css, 'https://www.discover-airlines.com/digitalhangar/design-system/releases/v1.38.0/standalone/css/discover.css');
  assert.deepEqual(plan.scripts, [
    { src: 'https://www.discover-airlines.com/digitalhangar/design-system/releases/v1.38.0/standalone/packages/maui-design-system.js', module: true },
    { src: 'https://www.discover-airlines.com/digitalhangar/onecatering/culinary-hub/culinary-hub-latest.js', module: false },
  ]);
  assert.equal(plan.meta['X-Portal'], 'FOUR_Y');
  assert.equal(plan.attributes['data-api-gateway'], 'https://api.travelid.lufthansa.com/one-catering/v1');
});

// www.lufthansa.com/de/en/support/fast-compensation/compensation-flight-disruptions (2026-11-01):
// <claim-form-entry id="undefined" data-public-endpoint=""> in a dcep-react-wrapper, the module
// script claim-automation/production/claim-form-entry/claim-form-entry-0.11.16.js (its chunks
// next to it), design system mausy-v1.40.1 with lufthansa.css
const CLAIM = '/digitalhangar/claim-automation/production/claim-form-entry/claim-form-entry-0.11.16.js';
const MAUSY = 'https://www.lufthansa.com/digitalhangar/design-system/releases/mausy-v1.40.1/standalone';

test('claim-form-entry (lufthansa.com\'s compensation claim): its module script, www\'s design system release', () => {
  const plan = mountPlan(blockOf([['claim-form-entry']]), null, { country: 'de', lang: 'en' }, 'main--lh-com--moved-permanently.aem.page');
  assert.deepEqual(plan, {
    tag: 'claim-form-entry',
    className: '',
    css: `${MAUSY}/css/lufthansa.css`,
    scripts: [{ src: `${MAUSY}/packages/maui-design-system.js`, module: true }, { src: `https://www.lufthansa.com${CLAIM}`, module: true }],
    attributes: { 'data-public-endpoint': '' },
    meta: {},
  });
});

test('lufthansa.com\'s module apps from the page\'s own /digitalhangar/ where the host serves it (lh-edge, www itself)', () => {
  // www.lufthansa.com sends no Access-Control-Allow-Origin for these scripts: a module from there is
  // refused on our hosts; lufthansa.turnsthe.page (lh-edge) serves the same files at /digitalhangar/
  const edge = mountPlan(blockOf([['claim-form-entry']]), null, { country: 'de', lang: 'en' }, 'lufthansa.turnsthe.page');
  assert.equal(edge.scripts[1].src, `https://lufthansa.turnsthe.page${CLAIM}`);
  const hc = mountPlan(blockOf([['help-center-web']]), null, { country: 'de', lang: 'en' }, 'lufthansa-edge.turnsthe.page');
  // www's release of lufthansa.com's help app, 4.3.2 (the brief after 505: micro-frontend-lh-help-506)
  assert.equal(hc.scripts[1].src, 'https://lufthansa-edge.turnsthe.page/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.2.js');
  const own = mountPlan(blockOf([['claim-form-entry']]), null, { country: 'de', lang: 'en' }, 'www.lufthansa.com');
  assert.equal(own.scripts[1].src, `https://www.lufthansa.com${CLAIM}`);
  // the design system stays www's (its files allow every origin), classic scripts as before
  assert.equal(edge.scripts[0].src, `${MAUSY}/packages/maui-design-system.js`);
  const trip = mountPlan(blockOf([['trip-management']]), null, { country: 'de', lang: 'en' }, 'lufthansa.turnsthe.page');
  assert.equal(trip.scripts[1].src, 'https://www.lufthansa.com/digitalhangar/trip-management/trip-management/trip-management-latest.js');
  const cul = mountPlan(blockOf([['culinary-hub']]), null, { country: 'de', lang: 'en' }, 'lufthansa.turnsthe.page');
  assert.equal(cul.scripts[1].src, 'https://www.lufthansa.com/digitalhangar/onecatering/culinary-hub/culinary-hub-latest.js');
  // a brand's pages as before: its www
  const aua = mountPlan(blockOf([['help-center-web']]), BRANDS.austrian, { country: 'at', lang: 'en', brand: 'austrian' }, 'austrian.turnsthe.page');
  assert.equal(aua.scripts[1].src, 'https://austrian.turnsthe.page/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.2.js');
  // without a host: the page's (main--lh-com…aem.page here, which serves no /digitalhangar/)
  assert.equal(mountPlan(blockOf([['claim-form-entry']]), null, { country: 'de', lang: 'en' }).scripts[1].src, `https://www.lufthansa.com${CLAIM}`);
});

// brief 264: SWISS's apps (help center, culinary hub) and their design system from the page's own
// /digitalhangar/ where the host serves it (lh-edge answers it from www.swiss.com): no visitor's
// browser asks www.swiss.com; SWISS's release and theme as its www's app pages (mausy-v1.40.1,
// swiss.css). The other brands as before.
test('SWISS\'s apps and design system from the page\'s own /digitalhangar/ (swiss.turnsthe.page)', () => {
  const locale = { country: 'ch', lang: 'en', brand: 'swiss' };
  const hc = mountPlan(blockOf([['help-center-web']]), BRANDS.swiss, locale, 'swiss.turnsthe.page');
  assert.equal(hc.css, 'https://swiss.turnsthe.page/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/css/swiss.css');
  assert.deepEqual(hc.scripts, [
    { src: 'https://swiss.turnsthe.page/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/packages/maui-design-system.js', module: true },
    { src: 'https://swiss.turnsthe.page/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.1.js', module: true },
  ]);
  const cul = mountPlan(blockOf([['culinary-hub']]), BRANDS.swiss, { ...locale, lang: 'de' }, 'swiss.turnsthe.page');
  assert.equal(cul.scripts[1].src, 'https://swiss.turnsthe.page/digitalhangar/onecatering/culinary-hub/culinary-hub-latest.js');
  assert.equal(cul.css, 'https://swiss.turnsthe.page/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/css/swiss.css');
  assert.ok([...hc.scripts, ...cul.scripts].every((s) => !s.src.includes('www.swiss.com')), 'nothing from www.swiss.com');
  const aua = mountPlan(blockOf([['help-center-web']]), BRANDS.austrian, { country: 'at', lang: 'en', brand: 'austrian' }, 'austrian.turnsthe.page');
  assert.equal(aua.scripts[1].src, 'https://austrian.turnsthe.page/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.2.js', 'Austrian from its own host (brief 397)');
});

// brief 293: on the hosts that serve no /digitalhangar/ (aem.page, aem.live, localhost) SWISS's
// apps and design system from its turnsthe.page host (lh-edge's route there), not www.swiss.com;
// on www.swiss.com itself its own; the other brands as before
test('SWISS on aem.page, aem.live and localhost: its apps and design system from swiss.turnsthe.page, never www.swiss.com', () => {
  const locale = { country: 'ch', lang: 'en', brand: 'swiss' };
  ['main--lh-swiss--moved-permanently.aem.page', 'main--lh-swiss--moved-permanently.aem.live', 'localhost'].forEach((host) => {
    const hc = mountPlan(blockOf([['help-center-web']]), BRANDS.swiss, locale, host);
    assert.equal(hc.css, 'https://swiss.turnsthe.page/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/css/swiss.css', host);
    assert.deepEqual(hc.scripts, [
      { src: 'https://swiss.turnsthe.page/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/packages/maui-design-system.js', module: true },
      { src: 'https://swiss.turnsthe.page/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.1.js', module: true },
    ], host);
    const cul = mountPlan(blockOf([['culinary-hub']]), BRANDS.swiss, locale, host);
    assert.equal(cul.scripts[1].src, 'https://swiss.turnsthe.page/digitalhangar/onecatering/culinary-hub/culinary-hub-latest.js', host);
  });
  const www = mountPlan(blockOf([['culinary-hub']]), BRANDS.swiss, locale, 'www.swiss.com');
  assert.equal(www.scripts[1].src, 'https://www.swiss.com/digitalhangar/onecatering/culinary-hub/culinary-hub-latest.js', 'www.swiss.com: its own');
  const aua = mountPlan(blockOf([['culinary-hub']]), BRANDS.austrian, { country: 'at', lang: 'en', brand: 'austrian' }, 'main--lh-austrian--moved-permanently.aem.page');
  assert.equal(aua.scripts[1].src, 'https://austrian.turnsthe.page/digitalhangar/onecatering/culinary-hub/culinary-hub-latest.js', 'Austrian from its own host (brief 397)');
});

// brief 300: SWISS's claim apps (swiss-snapshots-claims-20, kr/ko's capture): /<root>/fast-compensation
// <claim-form-entry data-public-endpoint=""> (0.11.16; ch/ru 0.11.9), /<root>/baggage-reimbursement
// <baggage-form-entry data-public-endpoint=""> (claim-automation/baggage-form-entry/
// baggage-form-entry-latest.js, its chunks in assets/ next to it), both modules on mausy-v1.40.1
// with swiss.css; they read X-Portal, X-Portal-Site and X-Portal-Language (else Lufthansa's tenant)
const BAGGAGE = '/digitalhangar/claim-automation/baggage-form-entry/baggage-form-entry-latest.js';
const LX = 'https://swiss.turnsthe.page/digitalhangar/design-system/releases/mausy-v1.40.1/standalone';

test('baggage-form-entry and claim-form-entry on SWISS: modules from the page\'s own /digitalhangar/, SWISS\'s design system, its X-Portal meta', () => {
  const locale = { country: 'ch', lang: 'en', brand: 'swiss' };
  const bag = mountPlan(blockOf([['baggage-form-entry']]), BRANDS.swiss, locale, 'swiss.turnsthe.page');
  assert.deepEqual(bag, {
    tag: 'baggage-form-entry',
    className: '',
    css: `${LX}/css/swiss.css`,
    scripts: [{ src: `${LX}/packages/maui-design-system.js`, module: true }, { src: `https://swiss.turnsthe.page${BAGGAGE}`, module: true }],
    attributes: { 'data-public-endpoint': '' },
    meta: {
      'X-Portal': 'LX', 'X-Portal-Site': 'CH', 'X-Portal-Language': 'en', 'X-Line': 'b',
    },
    themeClass: 'maui-theme-lx',
  });
  const claim = mountPlan(blockOf([['claim-form-entry']]), BRANDS.swiss, { ...locale, country: 'kr', lang: 'ko' }, 'swiss.turnsthe.page');
  assert.equal(claim.scripts[1].src, `https://swiss.turnsthe.page${CLAIM}`);
  assert.equal(claim.css, `${LX}/css/swiss.css`);
  assert.deepEqual(claim.meta, {
    'X-Portal': 'LX', 'X-Portal-Site': 'KR', 'X-Portal-Language': 'ko', 'X-Line': 'b',
  });
  // the preview hosts: from swiss.turnsthe.page, never www.swiss.com
  const preview = mountPlan(blockOf([['baggage-form-entry']]), BRANDS.swiss, locale, 'main--lh-swiss--moved-permanently.aem.page');
  assert.equal(preview.scripts[1].src, `https://swiss.turnsthe.page${BAGGAGE}`);
  assert.ok([...bag.scripts, ...claim.scripts, ...preview.scripts].every((s) => !s.src.includes('www.swiss.com')));
  assert.equal(appOf(blockOf([['baggage-form-entry']])).tag, 'baggage-form-entry');
});

test('a Version row: the app\'s script of that version (ch/ru: claim-form-entry-0.11.9.js), not an attribute; an odd value ignored', () => {
  const locale = { country: 'ch', lang: 'ru', brand: 'swiss' };
  const ru = mountPlan(blockOf([['claim-form-entry'], ['Version', '0.11.9']]), BRANDS.swiss, locale, 'swiss.turnsthe.page');
  assert.equal(ru.scripts[1].src, 'https://swiss.turnsthe.page/digitalhangar/claim-automation/production/claim-form-entry/claim-form-entry-0.11.9.js');
  assert.deepEqual(ru.attributes, { 'data-public-endpoint': '' });
  const latest = mountPlan(blockOf([['baggage-form-entry'], ['Version', 'latest']]), BRANDS.swiss, locale, 'swiss.turnsthe.page');
  assert.equal(latest.scripts[1].src, `https://swiss.turnsthe.page${BAGGAGE}`);
  const odd = mountPlan(blockOf([['claim-form-entry'], ['Version', '../../x']]), BRANDS.swiss, locale, 'swiss.turnsthe.page');
  assert.equal(odd.scripts[1].src, `https://swiss.turnsthe.page${CLAIM}`);
});

// brief 304: the design system's components take their theme from the nearest .maui-theme-<tenant>
// ancestor (else lh); www.swiss.com's body has class maui-theme-lx, which claim-form-entry needs
// (baggage-form-entry sets it on its own root): on SWISS's pages the plan names it and the block
// puts it on the body before the app's scripts load; other brands and lufthansa.com as before
test('SWISS\'s apps: the theme class maui-theme-lx, on the body before the scripts; other brands and lufthansa.com none', async () => {
  const locale = { country: 'ch', lang: 'en', brand: 'swiss' };
  ['claim-form-entry', 'baggage-form-entry', 'help-center-web', 'culinary-hub'].forEach((app) => {
    assert.equal(mountPlan(blockOf([[app]]), BRANDS.swiss, locale, 'swiss.turnsthe.page').themeClass, 'maui-theme-lx', app);
  });
  assert.equal('themeClass' in mountPlan(blockOf([['claim-form-entry']]), null, { country: 'de', lang: 'en' }, 'lufthansa.turnsthe.page'), false, 'lufthansa.com: no theme class');
  assert.equal(mountPlan(blockOf([['help-center-web']]), BRANDS.austrian, { country: 'at', lang: 'en', brand: 'austrian' }, 'austrian.turnsthe.page').themeClass, 'maui-theme-os', 'Austrian since brief 397');
  const { pagePrepare } = await import('../blocks/micro-frontend/micro-frontend.js');
  const plan = mountPlan(blockOf([['claim-form-entry']]), BRANDS.swiss, locale, 'swiss.turnsthe.page');
  pagePrepare(plan, document);
  assert.equal(document.body.classList.contains('maui-theme-lx'), true);
  assert.equal(document.head.querySelector('meta[name="X-Portal"]').getAttribute('content'), 'LX');
  document.body.classList.remove('maui-theme-lx');
  pagePrepare(mountPlan(blockOf([['claim-form-entry']]), null, { country: 'de', lang: 'en' }, 'lufthansa.turnsthe.page'), document);
  assert.equal([...document.body.classList].some((c) => c.startsWith('maui-theme-')), false, 'lufthansa.com: the body as it is');
});

test('lufthansa.com\'s claim page as before: no X-Portal meta, lufthansa.css from www', () => {
  const plan = mountPlan(blockOf([['claim-form-entry']]), null, { country: 'gb', lang: 'en' }, 'lufthansa.turnsthe.page');
  assert.deepEqual(plan.meta, {});
  assert.equal(plan.css, `${MAUSY}/css/lufthansa.css`);
  assert.equal(plan.scripts[1].src, `https://lufthansa.turnsthe.page${CLAIM}`);
});

// brief 358: Brussels Airlines' help center (/be/en/contact, /be/fr/contact) as www's: the app and
// its design system from the page's own /digitalhangar/ where the host serves it (lh-edge answers
// it from www.lufthansa.com; the feature and translation files from the code's copies), else
// from brussels.turnsthe.page; www's release and theme (mausy-v1.40.1, brussels.css, the body's
// maui-theme-sn); its pages' Version row: www's help-center-web 4.3.2 (SWISS keeps 4.3.1)
test('Brussels: the help center from the page\'s own /digitalhangar/ (brussels.turnsthe.page), brussels.css, maui-theme-sn, its Version row', () => {
  const locale = { country: 'be', lang: 'fr', brand: 'brussels' };
  const plan = mountPlan(blockOf([['help-center-web'], ['Version', '4.3.2']]), BRANDS.brussels, locale, 'brussels.turnsthe.page');
  assert.equal(plan.css, 'https://brussels.turnsthe.page/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/css/brussels.css');
  assert.deepEqual(plan.scripts, [
    { src: 'https://brussels.turnsthe.page/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/packages/maui-design-system.js', module: true },
    { src: 'https://brussels.turnsthe.page/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.2.js', module: true },
  ]);
  assert.equal(plan.themeClass, 'maui-theme-sn');
  assert.deepEqual(plan.meta, { 'X-Portal': 'SN', 'X-Portal-Site': 'BE', 'X-Portal-Language': 'fr' });
  ['main--lh-brussels--moved-permanently.aem.page', 'localhost'].forEach((host) => {
    const other = mountPlan(blockOf([['help-center-web'], ['Version', '4.3.2']]), BRANDS.brussels, locale, host);
    assert.ok(other.scripts.every((x) => x.src.startsWith('https://brussels.turnsthe.page/')), host);
    assert.ok([other.css, ...other.scripts.map((x) => x.src)].every((u) => !u.includes('www.brusselsairlines.com')), host);
  });
  const swiss = mountPlan(blockOf([['help-center-web']]), BRANDS.swiss, { country: 'ch', lang: 'en', brand: 'swiss' }, 'swiss.turnsthe.page');
  assert.equal(swiss.scripts[1].src, 'https://swiss.turnsthe.page/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.1.js', 'SWISS as before');
});

// brief 391: ITA's help center the same way (lh-edge answers ita.turnsthe.page/digitalhangar/ from
// www.ita-airways.com, which sends its module without Access-Control-Allow-Origin: refused from
// our hosts); on aem.page and localhost from ita.turnsthe.page; Austrian as before
test('ITA\'s apps and design system from the page\'s own /digitalhangar/ (ita.turnsthe.page), never www.ita-airways.com', () => {
  const locale = { country: 'it', lang: 'en', brand: 'ita' };
  ['ita.turnsthe.page', 'main--lh-ita--moved-permanently.aem.page', 'localhost'].forEach((host) => {
    const hc = mountPlan(blockOf([['help-center-web']]), BRANDS.ita, locale, host);
    assert.equal(hc.css, 'https://ita.turnsthe.page/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/css/ita.css', host);
    assert.deepEqual(hc.scripts, [
      { src: 'https://ita.turnsthe.page/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/packages/maui-design-system.js', module: true },
      // www's release on ITA's pages (test/micro-frontend-ita-help.test.mjs)
      { src: 'https://ita.turnsthe.page/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.2.js', module: true },
    ], host);
    assert.deepEqual(hc.meta, {
      'X-Portal': 'ITA', 'X-Portal-Site': 'IT', 'X-Portal-Language': 'en', 'X-Line': 'b',
    }, host);
  });
  const aua = mountPlan(blockOf([['help-center-web']]), BRANDS.austrian, { country: 'at', lang: 'en', brand: 'austrian' }, 'austrian.turnsthe.page');
  assert.equal(aua.scripts[1].src, 'https://austrian.turnsthe.page/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.2.js', 'Austrian from its own host (brief 397)');
});
