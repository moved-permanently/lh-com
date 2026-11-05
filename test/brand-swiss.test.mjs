/* eslint-disable max-len */
/* SWISS (lh-swiss, brand `swiss`) as a brand: the values of www.swiss.com's ch/en and ch/de
   homepages (the snapshots of 2026-11-02: OneTrust's data-domain-script, meta X-Portal LX, the
   footer's privacy statement and imprint under /terms-conditions) and the group design system's
   swiss.css (mausy-v1.40.1, theme maui-theme-lx): its CH Sans faces (SwissHead 300/400/700,
   SwissText 400/700, .woff only), lx-red #c00 for actions and links, berry-red #900 their
   hover, warm-grey #6f6660 for the secondary button, the quick actions and the footer's links,
   square buttons, a white header and a white footer. The shared tokens this needs keep today's
   values as their defaults.
   Run: node --max-old-space-size=512 --test test/brand-swiss.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'main--lh-swiss--moved-permanently.aem.page', pathname: '/ch/en/homepage', search: '', href: 'https://main--lh-swiss--moved-permanently.aem.page/ch/en/homepage', origin: 'https://main--lh-swiss--moved-permanently.aem.page',
};
window.hlx = { codeBasePath: '' };
Object.defineProperty(window, 'origin', { value: 'https://main--lh-swiss--moved-permanently.aem.page', configurable: true });
globalThis.window = window;
const {
  BRANDS, brandOf, brandName, oneTrustId, brandWwwHost, isOwnWwwHost, isSitePreviewHost, siteTitleSuffix,
} = await import('../scripts/brand.js');
const { bannerLinks } = await import('../scripts/consent-banner.js');

const meta = (values) => (name) => values[name] || '';
const lx = meta({ brand: 'swiss' });
const W = 'https://www.swiss.com';
const FONTS = '/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/swiss';
const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

function onPage(values, fn) {
  const rows = Object.entries(values).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  const { document } = parseHTML(`<!DOCTYPE html><html><head>${rows}</head><body></body></html>`);
  globalThis.document = document;
  try {
    return fn();
  } finally {
    delete globalThis.document;
  }
}

test('the entry: name, OneTrust, Message Center tenant, www, portal, airline, hub', () => {
  assert.equal(brandOf(lx), 'swiss');
  assert.equal(brandName(lx), 'SWISS');
  assert.ok(siteTitleSuffix(lx).test('Book flights | SWISS'));
  assert.equal(oneTrustId(lx), '01994cb2-f461-7489-80cc-e1ce655a86bc');
  assert.equal(BRANDS.swiss.messageCenter, 'lx');
  assert.equal(brandWwwHost(lx), 'www.swiss.com');
  assert.ok(isOwnWwwHost('www.swiss.com', lx));
  assert.ok(!isOwnWwwHost('www.swiss.com', meta({})), 'not on lh-com');
  assert.ok(isSitePreviewHost('main--lh-swiss--moved-permanently.aem.page', lx));
  assert.equal(BRANDS.swiss.portal, 'LX');
  assert.equal(BRANDS.swiss.airline, 'LX');
  assert.equal(BRANDS.swiss.hub, 'ZRH');
});

test('the cookie banner\'s links: the privacy statement and the imprint under /terms-conditions', () => {
  assert.deepEqual(onPage({ brand: 'swiss' }, () => bannerLinks('en')).map(([, h]) => h), [`${W}/ch/en/terms-conditions/privacy-statement`, `${W}/ch/en/terms-conditions/imprint`]);
  assert.deepEqual(onPage({ brand: 'swiss' }, () => bannerLinks('de')).map(([, h]) => h), [`${W}/ch/de/terms-conditions/privacy-statement`, `${W}/ch/de/terms-conditions/imprint`]);
});

test('the theme: CH Sans at www\'s font path (own host first, www second), .woff only', () => {
  const css = read('styles/themes/swiss.css');
  [['SwissHead', '300', 'chsans-light-webfont.woff'], ['SwissHead', '400', 'chsans-regular-webfont.woff'], ['SwissHead', '700', 'chsans-bold-webfont.woff'], ['SwissText', '400', 'chsans-regular-webfont.woff'], ['SwissText', '700', 'chsans-bold-webfont.woff']].forEach(([family, weight, file]) => {
    const face = css.split('@font-face').find((f) => f.includes(`font-family: ${family};`) && f.includes(`font-weight: ${weight};`));
    assert.ok(face, `${family} ${weight}`);
    const own = face.indexOf(`url('${FONTS}/${file}') format('woff')`);
    const www = face.indexOf(`url('${W}${FONTS}/${file}') format('woff')`);
    assert.ok(own > 0 && www > own, `${family} ${weight}: own host, then www`);
  });
  assert.ok(!/woff2|\.ttf|\.otf/.test(css), '.woff only');
});

test('the theme: SWISS\'s colours, type, buttons, header and footer on lh-com\'s token names', () => {
  const css = read('styles/themes/swiss.css');
  const token = (name) => (css.match(new RegExp(`^\\s*${name}:\\s*([^;]+);`, 'm')) || [])[1];
  const expect = {
    '--text-color': '#101010',
    '--heading-color': '#101010',
    '--lh-deepblue': '#101010',
    '--lh-yellow': '#c00',
    '--lh-sunglow-yellow': '#900',
    '--link-color': '#c00',
    '--link-hover-color': '#900',
    '--lh-marble-blue': '#c00',
    '--brand-color': '#c00',
    '--focus-color': '#0968f6',
    '--lh-electric-blue': '#0968f6',
    '--lh-red': '#ab3b35',
    '--lh-green': '#477c00',
    '--lh-grey-1': '#f2f2f2',
    '--lh-grey-8': '#101010',
    '--body-font-size-m': '16px',
    '--body-line-height': '1.375',
    '--body-letter-spacing': '0.6px',
    '--heading-letter-spacing': '0.7px',
    '--heading-light-weight': '700',
    '--heading-line-height': '1.1',
    '--button-radius': '0',
    '--button-font-size': '18px',
    '--button-padding': '8px 30px',
    '--button-min-height': '50px',
    '--button-primary-text': '#fff',
    '--button-accent-color': '#6f6660',
    '--button-accent-hover': '#554e49',
    '--button-secondary-color': '#6f6660',
    '--button-secondary-hover': '#554e49',
    '--header-bar-surface': '#fff',
    '--header-bar-text': '#6f6660',
    '--header-bar-text-hover': '#554e49',
    '--header-bar-line': '#ccc',
    '--header-bar-shadow': '0 1px 0 #ccc',
    '--nav-logo-height': '28px',
    '--nav-logo-height-wide': '34px', // www 147 x 34 from 1281 px (brief 380)
    '--footer-surface': '#fff',
    '--footer-text-color': '#101010',
    '--footer-link-color': '#6f6660',
    '--footer-link-hover-color': '#554e49',
    '--footer-top-line': '1px solid #ccc',
    '--footer-heading-size': '16px', // the accordion rows on phones; 18 px from 768 px (brief 380)
    '--footer-link-size': '16px',
    '--footer-link-weight': '400',
    '--footer-logo-home-height': '18.5px', // www's logo 80 px wide (brief 380)
  };
  Object.entries(expect).forEach(([name, value]) => assert.equal(token(name), value, name));
  assert.match(token('--body-font-family'), /^swisstext,/);
  assert.match(token('--heading-font-family'), /^swisshead,/);
});

test('the shared tokens: today\'s values as their defaults', () => {
  const styles = read('styles/styles.css').replace(/\s+/g, ' ');
  assert.ok(styles.includes('font-size: var(--button-font-size, var(--body-font-size-m));'), 'button size: the body size');
  assert.ok(styles.includes('padding: var(--button-padding, 11px 30px);'), 'button padding as before');
  assert.ok(styles.includes('border-radius: var(--button-radius, var(--radius-s));'), 'button radius as before');
  // a var() without a fallback that is not set: the property is unset, letter-spacing inherits as before
  assert.ok(/body \{[^}]*letter-spacing: var\(--body-letter-spacing\);/.test(styles), 'body letter-spacing: unset unless a theme sets it');
  assert.ok(/h6 \{[^}]*letter-spacing: var\(--heading-letter-spacing\);/.test(styles), 'headings: unset (inherited) unless a theme sets it');
  const footer = read('blocks/footer/footer.css').replace(/\s+/g, ' ');
  assert.ok(footer.includes('--footer-text: var(--footer-text-color, #fff);'), 'footer text white as before');
  assert.ok(footer.includes('color: var(--footer-link-color, var(--footer-text));'), 'footer links the footer text as before');
  assert.ok(footer.includes('border-top: var(--footer-top-line, none);'), 'no rule above the footer as before');
  assert.ok(footer.includes('color: var(--footer-locale-color, #ebebeb);'), 'the locale button as before');
  assert.ok(footer.includes('color: var(--footer-locale-hover-color, #fff);'), 'its hover as before');
});

test('"Change Privacy Settings" stays in SWISS\'s footer: the brand has a consent tool', async () => {
  const { document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="swiss"></head><body><ul><li><a href="#privacy-settings">Change Privacy Settings</a></li></ul></body></html>');
  globalThis.document = document;
  try {
    const { hidePrivacySettings } = await import('../scripts/consent.js');
    assert.equal(hidePrivacySettings(document.body), 0);
    assert.ok(document.querySelector('a[href="#privacy-settings"]'));
  } finally {
    delete globalThis.document;
  }
});

test('favicon, manifest and logo: www\'s files at www\'s paths, copies in the code', async () => {
  const { brandIcons } = await import('../scripts/brand.js');
  assert.deepEqual(brandIcons(lx), { icon: '/etc/designs/lx/favicon.ico', type: 'image/ico', manifest: '/etc/designs/lx/manifest.json' });
  const json = JSON.parse(read('etc/designs/lx/manifest.json'));
  assert.equal(json.name, 'SWISS');
  assert.equal(json.short_name, 'LX');
  json.icons.forEach((icon) => assert.ok(fs.existsSync(new URL(`..${icon.src}`, import.meta.url)), icon.src));
  ['etc/designs/lx/favicon.ico', 'etc/designs/lx/clientlib-all/vite/img/swiss-logo.svg'].forEach((f) => assert.ok(fs.existsSync(new URL(`../${f}`, import.meta.url)), f));
  assert.ok(!/<script|javascript:/i.test(read('etc/designs/lx/clientlib-all/vite/img/swiss-logo.svg')), 'the logo is a plain SVG');
});

test('the roots: the pilot\'s ch/en and ch/de, ch/fr and ch/it (brief 272), ch/es and ch/pt (brief 279), ch/zh and ch/ja (brief 282), ch/el and ch/ru (2026-11-03) with their own documents, www\'s dialog names, their airports', async () => {
  const { BRAND_SITES } = await import('../scripts/brands.js');
  const site = BRAND_SITES.swiss;
  // the market roots (SWISS_MARKETS_LIVE, test/swiss-markets-switch.test.mjs) come after ch's ten
  assert.deepEqual(Object.keys(site.rows).slice(0, 10), ['ch/en', 'ch/de', 'ch/fr', 'ch/it', 'ch/es', 'ch/pt', 'ch/zh', 'ch/ja', 'ch/el', 'ch/ru']);
  // and kr/ko, the own root with its own documents in Korean (SWISS_OWN_ROOTS_LIVE, test/swiss-korea.test.mjs)
  assert.deepEqual(Object.keys(site.rows).filter((r) => site.rows[r].documents === 'own'), ['ch/en', 'ch/de', 'ch/fr', 'ch/it', 'ch/es', 'ch/pt', 'ch/zh', 'ch/ja', 'ch/el', 'ch/ru', 'kr/ko']);
  assert.deepEqual(Object.keys(site.rows).slice(0, 10).map((r) => site.rows[r].hreflang), ['en-CH', 'de-CH', 'fr-CH', 'it-CH', 'es-CH', 'pt-CH', 'zh-CH', 'ja-CH', 'el-CH', 'ru-CH']);
  assert.deepEqual(site.versions, {
    en: 'ch/en', de: 'ch/de', fr: 'ch/fr', it: 'ch/it', es: 'ch/es', pt: 'ch/pt', zh: 'ch/zh', ja: 'ch/ja', el: 'ch/el', ru: 'ch/ru',
  });
  // the homepages' country and language line (.country-language-text): ch/de's says Switzerland
  // too, ch/it's Suisse
  const ch = (map) => Object.fromEntries(Object.entries(map).filter(([r]) => r.startsWith('ch/')));
  assert.deepEqual(ch(site.names), {
    'ch/en': 'Switzerland | English', 'ch/de': 'Switzerland | Deutsch', 'ch/fr': 'Suisse | Français', 'ch/it': 'Suisse | Italiano', 'ch/es': 'Suiza | Español', 'ch/pt': 'Suiça | Português', 'ch/zh': '瑞士 (Switzerland) | 简体中文', 'ch/ja': 'Switzerland | 日本語', 'ch/el': 'Ελβετία | Ελληνικά', 'ch/ru': 'Switzerland | Русский',
  });
  // the homepages' flight search origin: Geneva on ch/fr, Zurich on the others
  assert.deepEqual(ch(site.airports), {
    'ch/en': 'ZRH', 'ch/de': 'ZRH', 'ch/fr': 'GVA', 'ch/it': 'ZRH', 'ch/es': 'ZRH', 'ch/pt': 'ZRH', 'ch/zh': 'ZRH', 'ch/ja': 'ZRH', 'ch/el': 'ZRH', 'ch/ru': 'ZRH',
  });
});

test('the country dialog: the ten roots, kr/ko and the 216 market roots; every other root links to its homepage on www.swiss.com', async () => {
  const {
    ownRoots, getHomepageUrl, rootRedirectPath, siteLocales,
  } = await import('../scripts/locale.js');
  onPage({ brand: 'swiss' }, () => {
    assert.deepEqual(ownRoots().slice(0, 10), ['ch/en', 'ch/de', 'ch/fr', 'ch/it', 'ch/es', 'ch/pt', 'ch/zh', 'ch/ja', 'ch/el', 'ch/ru']);
    assert.equal(ownRoots().length, 227, 'ch\'s ten, kr/ko (SWISS_OWN_ROOTS_LIVE) and the market roots (SWISS_MARKETS_LIVE)');
    assert.equal(getHomepageUrl('ch', 'en'), '/ch/en/homepage');
    assert.equal(getHomepageUrl('CH', 'DE'), '/ch/de/homepage');
    assert.equal(getHomepageUrl('ch', 'fr'), '/ch/fr/homepage');
    assert.equal(getHomepageUrl('ch', 'it'), '/ch/it/homepage');
    assert.equal(getHomepageUrl('ch', 'es'), '/ch/es/homepage');
    assert.equal(getHomepageUrl('ch', 'pt'), '/ch/pt/homepage');
    assert.equal(getHomepageUrl('ch', 'zh'), '/ch/zh/homepage');
    assert.equal(getHomepageUrl('ch', 'ja'), '/ch/ja/homepage');
    assert.equal(getHomepageUrl('ch', 'el'), '/ch/el/homepage');
    assert.equal(getHomepageUrl('ch', 'ru'), '/ch/ru/homepage');
    assert.equal(getHomepageUrl('ch', 'ko'), `${W}/ch/ko/homepage`, 'a language SWISS has no ch root for (Korean only on kr/ko): www');
    assert.equal(getHomepageUrl('kr', 'ko'), '/kr/ko/homepage', 'kr/ko (SWISS_OWN_ROOTS_LIVE, 2026-11-03)');
    assert.equal(getHomepageUrl('de', 'de'), '/de/de/homepage', 'a market root: its homepage here');
    // es and pt's market roots (SWISS_MARKET_LANGUAGES_LIVE, 2026-11-03)
    [['ar', 'es'], ['br', 'es'], ['es', 'es'], ['us', 'es'], ['br', 'pt'], ['pt', 'pt']].forEach(([cc, ll]) => assert.equal(getHomepageUrl(cc, ll), `/${cc}/${ll}/homepage`, `${cc}/${ll}`));
    // zh and ja's market roots (SWISS_MARKET_LANGUAGES_LIVE, 2026-11-03)
    [['cn', 'zh'], ['hk', 'zh'], ['sg', 'zh'], ['jp', 'ja']].forEach(([cc, ll]) => assert.equal(getHomepageUrl(cc, ll), `/${cc}/${ll}/homepage`, `${cc}/${ll}`));
    // el and ru's market roots (SWISS_MARKET_LANGUAGES_LIVE, 2026-11-03)
    [['gr', 'el'], ['ru', 'ru']].forEach(([cc, ll]) => assert.equal(getHomepageUrl(cc, ll), `/${cc}/${ll}/homepage`, `${cc}/${ll}`));
    assert.equal(rootRedirectPath(), '/ch/en/homepage');
    assert.equal(siteLocales()['ch/de'].homeAirport, 'ZRH');
    assert.equal(siteLocales()['ch/de'].name, 'Switzerland | Deutsch');
  });
});
