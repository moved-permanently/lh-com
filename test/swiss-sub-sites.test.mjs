/* eslint-disable max-len */
/* SWISS's sub-sites on lh-swiss (www.swiss.com's corporate site /corporate/<ll>/, en de fr, and
   medical services /medicalservices/<ll>/, en de; the capture of 2026-11-02, swiss-snapshots-025
   to 027): scripts/site-languages.js SUB_SITES. A sub-site page takes its language from its path,
   its base (nav, footer, the logo's fallback) is the sub-site's language (/corporate/de), the
   header switches between the sub-site's languages (the same slugs) and has the sub-site's style
   (the menu in the bar, a search button on corporate, the language list in the bar as www's "EN"
   with the globe). The main site's ch/en and ch/de pages, the other brands and lh-com as before.
   Run: node --max-old-space-size=512 --test test/swiss-sub-sites.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { getLocale } from '../scripts/locale.js';
import {
  SUB_SITES, subSiteOf, languageSwitch, counterpartPath, languageOfPath,
} from '../scripts/site-languages.js';

const withPage = (metas, fn) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><head>${Object.entries(metas).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('')}</head><body></body></html>`);
  const saved = globalThis.document;
  globalThis.document = document;
  try {
    return fn();
  } finally {
    globalThis.document = saved;
  }
};
const pick = (l) => ({
  lang: l.lang, key: l.key, base: l.base, sub: l.subSite ? l.subSite.name : null,
});

test('SUB_SITES: SWISS\'s corporate (en, de, fr) and medical services (en, de), their homepages and names as www\'s language selector', () => {
  assert.deepEqual(Object.keys(SUB_SITES), ['swiss']);
  const [corporate, medical] = SUB_SITES.swiss;
  assert.equal(corporate.name, 'corporate');
  assert.deepEqual(corporate.languages, [
    {
      lang: 'en', path: '/corporate/en/', home: '/corporate/en/homepage', name: 'English',
    },
    {
      lang: 'de', path: '/corporate/de/', home: '/corporate/de/homepage', name: 'Deutsch',
    },
    {
      lang: 'fr', path: '/corporate/fr/', home: '/corporate/fr/homepage', name: 'Français',
    },
  ]);
  assert.equal(medical.name, 'medicalservices');
  assert.deepEqual(medical.languages.map((l) => [l.lang, l.home]), [['en', '/medicalservices/en/homepage'], ['de', '/medicalservices/de/homepage']]);
  assert.deepEqual(corporate.header, { menu: 'bar', search: 'button', languages: 'bar' });
  assert.deepEqual(medical.header, { menu: 'bar', languages: 'bar' }, 'no search: www\'s medical search has no results page');
  assert.equal(subSiteOf('swiss', '/corporate/de/careers').name, 'corporate');
  assert.equal(subSiteOf('swiss', '/corporate').name, 'corporate');
  assert.equal(subSiteOf('swiss', '/medicalservices/en/health').name, 'medicalservices');
  assert.equal(subSiteOf('swiss', '/ch/en/corporate'), null);
  assert.equal(subSiteOf('swiss', '/corporatex/en'), null);
  assert.equal(subSiteOf('austrian', '/corporate/en/homepage'), null);
  assert.equal(subSiteOf('', '/corporate/en/homepage'), null);
});

test('a sub-site page: the language of its path, the main site\'s root of that language (else its first), the sub-site\'s base and languages', () => {
  withPage({ brand: 'swiss' }, () => {
    assert.deepEqual(pick(getLocale('/corporate/de/careers/job-vacancies')), {
      lang: 'de', key: 'ch/de', base: '/corporate/de', sub: 'corporate',
    });
    assert.deepEqual(pick(getLocale('/corporate/en/homepage')), {
      lang: 'en', key: 'ch/en', base: '/corporate/en', sub: 'corporate',
    });
    // French: lh-swiss's ch/fr since brief 276 (before it, ch/en's rest with French texts)
    assert.deepEqual(pick(getLocale('/corporate/fr/media')), {
      lang: 'fr', key: 'ch/fr', base: '/corporate/fr', sub: 'corporate',
    });
    assert.deepEqual(pick(getLocale('/medicalservices/de/aviation/after-the-flight')), {
      lang: 'de', key: 'ch/de', base: '/medicalservices/de', sub: 'medicalservices',
    });
    // the sub-site without a language: its first
    assert.deepEqual(pick(getLocale('/corporate')), {
      lang: 'en', key: 'ch/en', base: '/corporate/en', sub: 'corporate',
    });
    const loc = getLocale('/corporate/de/careers');
    assert.deepEqual(loc.siteLanguages.map((l) => l.lang), ['en', 'de', 'fr']);
    assert.deepEqual(loc.subSite.header, { menu: 'bar', search: 'button', languages: 'bar' });
    assert.equal(loc.brand, 'swiss');
    assert.equal(loc.homeAirport, 'ZRH');
    // the local dev server's /content prefix
    assert.equal(getLocale('/content/corporate/de/careers').base, '/content/corporate/de');
  });
});

test('the main site\'s pages, the other brands and lh-com as before', () => {
  withPage({ brand: 'swiss' }, () => {
    const de = getLocale('/ch/de/homepage');
    assert.deepEqual(pick(de), {
      lang: 'de', key: 'ch/de', base: '/ch/de', sub: null,
    });
    assert.equal(de.siteLanguages, undefined);
    assert.deepEqual(pick(getLocale('/en/homepage')), {
      lang: 'en', key: 'ch/en', base: '/ch/en', sub: null,
    });
  });
  withPage({ brand: 'austrian' }, () => assert.equal(getLocale('/corporate/de/careers').subSite, undefined));
  withPage({}, () => {
    const l = getLocale('/corporate/de/careers');
    assert.equal(l.subSite, undefined);
    assert.equal(l.siteLanguages, undefined);
  });
});

test('the language switch: the same path in the other languages (the sub-sites share their slugs), homepages to homepages', () => {
  const { languages } = SUB_SITES.swiss[0];
  assert.equal(languageOfPath('/corporate/fr/media', languages).lang, 'fr');
  assert.equal(counterpartPath('/corporate/de/careers/job-vacancies', languages[1], languages[0]), '/corporate/en/careers/job-vacancies');
  assert.equal(counterpartPath('/corporate/de/homepage', languages[1], languages[2]), '/corporate/fr/homepage');
  const { links, tools } = languageSwitch([{ href: '/corporate/de/search-results', label: 'Suche', role: 'search' }], '/corporate/de/careers', 'de', languages);
  assert.deepEqual(links.map((l) => [l.lang, l.label, l.counterpart]), [['en', 'English', '/corporate/en/careers'], ['fr', 'Français', '/corporate/fr/careers']]);
  assert.equal(tools.length, 1, 'the search tool stays');
});

test('header.js: the sub-site\'s style before the brand\'s; the language list in the bar on a site switch with header.languages \'bar\'', () => {
  const js = fs.readFileSync('blocks/header/header.js', 'utf8');
  assert.match(js, /const subSiteHeader = locale\.subSite && locale\.subSite\.header;\n {2}const headerStyle = subSiteHeader \|\| \(pageBrand && pageBrand\.header\) \|\| \{\};/);
  assert.match(js, /siteSwitch && headerStyle\.languages === 'bar'/);
  assert.match(js, /import\('\.\/header-languages\.js'\)/);
});

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
const click = (t) => t.dispatchEvent(new window.Event('click', { bubbles: true }));
const keydown = (t, k) => {
  const e = new window.Event('keydown', { bubbles: true });
  e.key = k;
  t.dispatchEvent(e);
};

test('header-languages.js: www\'s "EN" with the globe in the bar, a list of the other languages, one click opens it, Escape, a click outside or a second click closes it', async () => {
  globalThis.window = window;
  globalThis.document = document;
  let focused = null;
  window.HTMLElement.prototype.focus = function focus() { focused = this; };
  const { default: buildLanguages } = await import('../blocks/header/header-languages.js');
  const icon = document.createElement('span');
  icon.className = 'icon-globe';
  const list = buildLanguages({
    current: 'de',
    label: 'Derzeit ausgewählte Sprache:',
    links: [{ lang: 'en', label: 'English', home: '/corporate/en/homepage' }, { lang: 'fr', label: 'Français', home: '/corporate/fr/homepage' }],
    icon,
  });
  document.body.replaceChildren(list.root, document.createElement('main'));
  const { button } = list;
  assert.equal(list.root.className, 'nav-languages');
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.ok(button.querySelector('.icon-globe'), 'the globe');
  assert.equal(button.querySelector('.nav-languages-current').textContent, 'DE');
  assert.equal(button.querySelector('.nav-languages-label').textContent, 'Derzeit ausgewählte Sprache:');
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  assert.ok(panel.hidden === true);
  const anchors = [...panel.querySelectorAll('a')];
  assert.deepEqual(anchors.map((x) => [x.getAttribute('href'), x.textContent, x.getAttribute('lang'), x.getAttribute('hreflang')]), [['/corporate/en/homepage', 'English', 'en', 'en'], ['/corporate/fr/homepage', 'Français', 'fr', 'fr']]);
  assert.ok(list.anchors.length === 2 && list.anchors[0] === anchors[0], 'the anchors for their counterparts');
  click(button);
  assert.ok(button.getAttribute('aria-expanded') === 'true' && panel.hidden === false);
  click(button);
  assert.ok(button.getAttribute('aria-expanded') === 'false' && panel.hidden === true, 'a second click closes it');
  click(button);
  keydown(anchors[1], 'Escape');
  assert.ok(panel.hidden === true && focused === button, 'Escape: closed, the focus on the button');
  click(button);
  click(document.querySelector('main'));
  assert.ok(panel.hidden === true, 'a click outside closes');
  list.open();
  assert.ok(panel.hidden === false, 'open() (the footer\'s language button)');
  list.close();
  assert.ok(panel.hidden === true);
});
