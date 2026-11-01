/* eslint-disable max-len */
/* The login and profile apps on the brand sites (widgets/lh-app): a page with `brand` metadata
   (austrian, discover, ita) gets its brand's entry of lh-app.json `brands` over Lufthansa's
   config: its Travel ID, login client and redirect URI (the gate's link equals the brand's www
   gate, captured 2026-11-01), its design system, portal and component versions. Only on the
   brand's own www domain (and its subdomains) does the page ask the brand's Travel ID whether
   the visitor is logged in; on every other host (aem.page, turnsthe.page, lufthansa.com) the
   brand pages show the logged-out state without any request to a Travel ID. Lufthansa's pages
   (no brand) as before.
   Run: node --max-old-space-size=512 --test test/lh-app-brands.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const JSON_TEXT = fs.readFileSync(new URL('../widgets/lh-app/lh-app.json', import.meta.url), 'utf8');
const LH_APP = JSON.parse(JSON_TEXT);
const WIDGET_HTML = fs.readFileSync(new URL('../widgets/lh-app/lh-app.html', import.meta.url), 'utf8');

// a first page so the shared scripts can be imported
const first = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
first.window.location = {
  hostname: 'localhost', pathname: '/de/en/homepage', search: '', href: 'http://localhost/de/en/homepage', origin: 'http://localhost',
};
first.window.origin = 'http://localhost';
globalThis.window = first.window;
globalThis.document = first.document;

let n = 0;
/**
 * Decorates one widget link on a page: brand metadata, host and path; every request the page
 * makes is recorded (lh-app.json answers from the repo, Travel ID 401 or, logged in, 200 with
 * the www profile, everything else fails).
 */
async function run({
  brand = '', host, path, app, params = {}, loggedIn = false,
}) {
  const meta = brand ? `<meta name="brand" content="${brand}">` : '';
  const { window, document } = parseHTML(`<!DOCTYPE html><html><head>${meta}</head><body><main><div><div class="widget lh-app"></div></div></main></body></html>`);
  window.location = {
    hostname: host, pathname: path, search: '', href: `https://${host}${path}`, origin: `https://${host}`,
  };
  window.origin = `https://${host}`;
  window.hlx = { codeBasePath: '' };
  const fetched = [];
  const fetchStub = async (url, init = {}) => {
    const u = String(url);
    fetched.push({ url: u, credentials: init.credentials });
    if (u === '/widgets/lh-app/lh-app.json') return { ok: true, status: 200, json: async () => JSON.parse(JSON_TEXT) };
    if (/travelid/.test(u)) return { ok: loggedIn, status: loggedIn ? 200 : 401, json: async () => ({}) };
    if (loggedIn && u === '/service/secured/api/core/user/profile') return { ok: true, status: 200, json: async () => ({ name: 'x' }) };
    throw new TypeError('Failed to fetch');
  };
  window.fetch = fetchStub;
  globalThis.window = window;
  globalThis.document = document;
  globalThis.fetch = fetchStub;
  globalThis.customElements = { whenDefined: () => new Promise(() => {}) };
  n += 1;
  const { default: decorate } = await import(`../widgets/lh-app/lh-app.js?run=${n}`);
  const widget = document.querySelector('.widget');
  widget.innerHTML = WIDGET_HTML;
  widget.dataset.app = app;
  Object.entries(params).forEach(([k, v]) => { widget.dataset[k] = v; });
  await decorate(widget);
  const loaded = [...document.head.querySelectorAll('script[src], link[href]')]
    .map((el) => el.getAttribute('src') || el.getAttribute('href'));
  return {
    widget, document, fetched: fetched.map((f) => f.url), requests: fetched, loaded,
  };
}

const { siteConfig, authorizeUrl, isLoginHost } = await import('../widgets/lh-app/lh-app.js');

// the brands' www gate links (dcep-forced-login, logged out), captured 2026-11-01
const WWW_GATE = {
  austrian: 'https://api.travelid.austrian.com/oauth2/authorize?client_id=dFquxAQT637lrYALS9UKBMieeibyGaVQ&response_type=code&redirect_uri=https://www.austrian.com&scope=AUTHENTICATED%20IDENTIFIED%20urn:milesandmore:tech:background:v1:active%20urn:milesandmore:oauth:multifactorauthentication&state=/at/en/profile/travel-cockpit&principal_type=EMAIL&reduced_state=NONE&view=login&prompt=login&country=AT&lang=en',
  discover: 'https://api.travelid.discover-airlines.com/oauth2/authorize?client_id=NqkvGG8MB6OeCkb66a02D0ORHOFhQWJ4&response_type=code&redirect_uri=https://www.discover-airlines.com&scope=AUTHENTICATED%20IDENTIFIED%20urn:milesandmore:tech:background:v1:active%20urn:milesandmore:oauth:multifactorauthentication&state=/de/en/profile/travel-cockpit&principal_type=EMAIL&reduced_state=NONE&view=login&prompt=login&country=DE&lang=en',
  ita: 'https://api.travelid.ita-airways.com/oauth2/authorize?client_id=14eKnYUwomcAimITtmaa2GqBM5mhO8kAS3GjTyE6RDsFaWrI&response_type=code&redirect_uri=https://www.ita-airways.com&scope=AUTHENTICATED%20IDENTIFIED%20urn:milesandmore:tech:background:v1:active%20urn:milesandmore:oauth:multifactorauthentication&state=/it/en/profile/travel-cockpit&principal_type=EMAIL&reduced_state=NONE&view=login&prompt=login&country=IT&lang=en',
};
const BRAND = {
  austrian: {
    domain: 'austrian.com', www: 'www.austrian.com', root: 'at/en', country: 'at', travelId: 'https://api.travelid.austrian.com', portal: 'OS', line: 'g', theme: 'maui-theme-os', css: 'austrian.css',
  },
  discover: {
    domain: 'discover-airlines.com', www: 'www.discover-airlines.com', root: 'de/en', country: 'de', travelId: 'https://api.travelid.discover-airlines.com', portal: 'FOUR_Y', line: 'g', theme: 'maui-theme-four_y', css: 'discover.css',
  },
  ita: {
    domain: 'ita-airways.com', www: 'www.ita-airways.com', root: 'it/en', country: 'it', travelId: 'https://api.travelid.ita-airways.com', portal: 'ITA', line: 'b', theme: 'maui-theme-az', css: 'ita.css',
  },
};

test('Lufthansa (no brand, a brand without an entry, an unknown one): the config as before', () => {
  const before = { ...LH_APP.config, apps: LH_APP.apps };
  assert.deepEqual(siteConfig(LH_APP, ''), before);
  assert.deepEqual(siteConfig(LH_APP), before);
  assert.deepEqual(siteConfig(LH_APP, 'cargo'), before);
  assert.deepEqual(siteConfig(LH_APP, 'nowhere'), before);
});

test('Lufthansa\'s pages: every app on every host, locale and login state exactly as before the brands', async () => {
  // recorded with the same pages from lh-app at 04601cc (before the brands): widget, head, body class, requests
  const before = fs.readFileSync(new URL('./fixtures/lh-app/lufthansa-04601cc.ndjson', import.meta.url), 'utf8')
    .trim().split('\n').map((line) => JSON.parse(line));
  assert.equal(before.length, 156);
  /* eslint-disable no-restricted-syntax, no-await-in-loop */
  for (const [key, was] of before) {
    const [host, login, root, app, params] = key.match(/^(\S+) (in|out) \/(\S+) (\S+) (.*)$/).slice(1);
    const r = await run({
      host, path: `/${root}/profile/travel-cockpit`, app, params: JSON.parse(params), loggedIn: login === 'in',
    });
    const now = {
      widget: r.widget.outerHTML,
      head: r.document.head.innerHTML,
      body: r.document.body.className,
      fetched: r.requests.map((q) => `${q.url} ${q.credentials || ''}`.trim()),
    };
    assert.deepEqual(now, was, key);
  }
  /* eslint-enable no-restricted-syntax, no-await-in-loop */
});

test('a brand\'s config: its hosts, Travel ID, login client, design system, portal and theme', () => {
  Object.entries(BRAND).forEach(([brand, b]) => {
    const config = siteConfig(LH_APP, brand);
    assert.deepEqual(config.loginHosts, [b.domain], brand);
    assert.equal(config.scriptOrigin, `https://${b.www}`, brand);
    assert.equal(config.travelIdApi, b.travelId, brand);
    assert.equal(config.authorize.redirectUri, `https://${b.www}`, brand);
    assert.equal(config.authorize.scope, LH_APP.config.authorize.scope, `${brand}: Lufthansa's scope`);
    assert.equal(config.authorize.extra, LH_APP.config.authorize.extra, `${brand}: Lufthansa's fixed parameters`);
    assert.equal(config.maui.css, `/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/css/${b.css}`, brand);
    assert.equal(config.maui.js, '/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/packages/maui-design-system.js', brand);
    assert.deepEqual(config.portal, { 'X-Portal': b.portal, 'X-Line': b.line }, brand);
    assert.equal(config.themeClass, b.theme, brand);
    assert.equal(config.loginStatusPath, LH_APP.config.loginStatusPath, brand);
  });
});

test('authorizeUrl: the brand\'s gate link equals its www gate; Lufthansa\'s as before', () => {
  Object.entries(BRAND).forEach(([brand, b]) => {
    const [country, lang] = b.root.split('/');
    assert.equal(authorizeUrl(siteConfig(LH_APP, brand), { country, lang }, `/${b.root}/profile/travel-cockpit`), WWW_GATE[brand], brand);
  });
  assert.equal(
    authorizeUrl(siteConfig(LH_APP, 'austrian'), { country: 'at', lang: 'de' }, '/at/de/profile/travel-cockpit'),
    WWW_GATE.austrian.replace('state=/at/en/', 'state=/at/de/').replace('lang=en', 'lang=de'),
  );
  assert.equal(
    authorizeUrl(siteConfig(LH_APP, ''), { country: 'de', lang: 'en' }, '/de/en/profile/my-account/cug-verification'),
    'https://api.travelid.lufthansa.com/oauth2/authorize?client_id=yA8iz2C5BnAIf2GKKdkAlgPPW9y6wjLO&response_type=code&redirect_uri=https://www.lufthansa.com&scope=AUTHENTICATED%20IDENTIFIED%20urn:milesandmore:tech:background:v1:active%20urn:milesandmore:oauth:multifactorauthentication&state=/de/en/profile/my-account/cug-verification&principal_type=EMAIL&reduced_state=NONE&view=login&prompt=login&country=DE&lang=en',
  );
});

test('login hosts: only the brand\'s own www domain and its subdomains', () => {
  Object.entries(BRAND).forEach(([brand, b]) => {
    const hosts = siteConfig(LH_APP, brand).loginHosts;
    assert.ok(isLoginHost(b.www, hosts), b.www);
    assert.ok(isLoginHost(b.domain, hosts), b.domain);
    [`${brand}.turnsthe.page`, `main--lh-${brand}--moved-permanently.aem.page`, `main--lh-${brand}--moved-permanently.aem.live`,
      'www.lufthansa.com', 'lufthansa.turnsthe.page', `${b.domain}.example.com`, `x${b.domain}`, 'localhost']
      .forEach((host) => assert.ok(!isLoginHost(host, hosts), `${brand} on ${host}`));
  });
  assert.ok(isLoginHost('www.lufthansa.com', siteConfig(LH_APP, '').loginHosts));
  assert.ok(!isLoginHost('www.austrian.com', siteConfig(LH_APP, '').loginHosts));
});

test('every app on a brand\'s preview and demo hosts: logged out, not one request to a Travel ID', async () => {
  const names = Object.keys(siteConfig(LH_APP, 'austrian').apps);
  assert.ok(names.length >= 20, 'every app, the new ones too');
  /* eslint-disable no-restricted-syntax, no-await-in-loop */
  for (const [brand, b] of Object.entries(BRAND)) {
    for (const host of [`main--lh-${brand}--moved-permanently.aem.page`, `${brand}.turnsthe.page`]) {
      for (const app of names) {
        const r = await run({
          brand, host, path: `/${b.root}/profile/travel-cockpit`, app,
        });
        const travelId = [...r.fetched, ...r.loaded].filter((u) => /travelid/i.test(u));
        assert.deepEqual(travelId, [], `${brand} ${app} on ${host}`);
        const gate = r.widget.querySelector('.lh-app-gate a');
        if (gate) assert.ok(gate.href.startsWith(`${b.travelId}/oauth2/authorize?`), `${brand} ${app}: the brand's login`);
      }
    }
  }
  /* eslint-enable no-restricted-syntax, no-await-in-loop */
});

test('on the brand\'s own www: one loginstatus call to its own Travel ID, never Lufthansa\'s', async () => {
  const r = await run({
    brand: 'austrian', host: 'www.austrian.com', path: '/at/en/profile/my-account', app: 'login-gate',
  });
  const travelId = r.requests.filter((q) => /travelid/.test(q.url));
  assert.deepEqual(travelId.map((q) => q.url), ['https://api.travelid.austrian.com/v1/user/me/loginstatus']);
  assert.equal(travelId[0].credentials, 'include');
  assert.equal(r.widget.querySelector('.lh-app-gate a').href, WWW_GATE.austrian.replace('travel-cockpit', 'my-account'));
});

test('the brand\'s component versions and gateways, without Lufthansa\'s per-locale overrides', async () => {
  const cockpit = async (brand, root, app, params) => {
    const r = await run({
      brand, host: `${brand}.turnsthe.page`, path: `/${root}/profile/travel-cockpit`, app, params,
    });
    return r;
  };
  const wss = await cockpit('austrian', 'at/de', 'web-self-service');
  assert.ok(wss.loaded.includes('https://www.austrian.com/digitalhangar/customer-cockpit/web-self-service/web-self-service-2.0.3.js'), wss.loaded.join(' '));
  assert.ok(wss.widget.querySelector('web-self-service'), 'mounted');
  assert.ok(wss.document.body.classList.contains('maui-theme-os'));
  assert.equal(wss.document.head.querySelector('meta[name="X-Portal"]').content, 'OS');
  assert.equal(wss.document.head.querySelector('meta[name="X-Portal-Site"]').content, 'AT');
  assert.equal(wss.document.head.querySelector('meta[name="X-Portal-Language"]').content, 'de');
  const lh = await run({
    host: 'lufthansa.turnsthe.page', path: '/de/en/profile/travel-cockpit', app: 'web-self-service',
  });
  assert.ok(lh.loaded.includes('https://www.lufthansa.com/digitalhangar/customer-cockpit/web-self-service/web-self-service-2.0.0.js'));
  assert.ok(lh.document.body.classList.contains('maui-theme-lh'));
});

test('resolved apps on a brand: scripts, gateways, the statement\'s language and country', async () => {
  const { resolveApp } = await import('../widgets/lh-app/lh-app.js');
  const at = siteConfig(LH_APP, 'austrian');
  const atEn = { key: 'at/en', country: 'at', lang: 'en' };
  const atDe = { key: 'at/de', country: 'at', lang: 'de' };
  assert.equal(resolveApp(at, 'hero-banner', atEn).script, '/digitalhangar/customer-cockpit/hero-banner-react/hero-banner-react-2.0.2.js');
  assert.equal(resolveApp(at, 'my-trips', atEn).script, '/digitalhangar/travel-insights/my-trips/my-trips-0.17.10.js');
  assert.equal(resolveApp(at, 'my-trips', atEn).attributes['data-api-gateway'], 'https://api.travelid.austrian.com');
  assert.equal(resolveApp(at, 'airport-services', atDe).script, '/digitalhangar/redemption-program/airport-services/airport-services-1.0.22.js', 'not Lufthansa\'s at/de override');
  assert.equal(resolveApp(at, 'sdui-profile', atEn).attributes['data-translation-labels'], 'https://www.austrian.com/service/api/labels/common');
  assert.equal(resolveApp(at, 'sdui-profile', atEn).attributes['data-api-gateway'], 'https://api.travelid.austrian.com/ui-services/v1/me/profile');
  assert.equal(resolveApp(at, 'sdui-statement', atEn).attributes.options, '{"customerHeaders":{"X-Language-Country":"en-at"}}');
  assert.equal(resolveApp(at, 'sdui-statement', atDe).attributes.options, '{"customerHeaders":{"X-Language-Country":"de-at"}}');
  assert.equal(resolveApp(at, 'sdui-statement', { key: 'de/en', country: 'de', lang: 'en' }).attributes.options, '{"customerHeaders":{"X-Language-Country":"en-de"}}', 'a market root');
  const it = siteConfig(LH_APP, 'ita');
  assert.equal(resolveApp(it, 'sdui-statement', { key: 'it/en', country: 'it', lang: 'en' }).attributes.options, '{"customerHeaders":{"X-Language-Country":"en-it"}}');
  assert.equal(resolveApp(it, 'upgrade-alert', { key: 'it/en', country: 'it', lang: 'en' }, { version: '3.0.19' }).script, '/digitalhangar/redemption-program/upgrade-alert/upgrade-alert-3.0.19.js', 'the link\'s version');
  assert.equal(resolveApp(it, 'upgrade-alert', { key: 'it/en', country: 'it', lang: 'en' }, { version: '../x' }).script, '/digitalhangar/redemption-program/upgrade-alert/upgrade-alert-3.0.18.js', 'only a version number');
  // Lufthansa as before
  const lh = siteConfig(LH_APP, '');
  assert.equal(resolveApp(lh, 'airport-services', { key: 'at/de', country: 'at', lang: 'de' }).script, '/digitalhangar/redemption-program/airport-services/airport-services-1.1.1.js');
  assert.equal(resolveApp(lh, 'sdui-statement', { key: 'gb/en', country: 'gb', lang: 'en' }).attributes.options, '{"customerHeaders":{"X-Language-Country":"en-gb"}}');
  assert.equal(resolveApp(lh, 'sdui-statement', { key: 'de/en', country: 'de', lang: 'en' }).id, 'test6');
});

test('the new apps: Travel ID components mount only logged in on a login host; dcep pages show the gate', async () => {
  const { resolveApp, shouldMount } = await import('../widgets/lh-app/lh-app.js');
  const it = siteConfig(LH_APP, 'ita');
  const loc = { key: 'it/en', country: 'it', lang: 'en' };
  [
    // live: dcep-react-wrapper web components on the Travel ID gateway
    ['web-student-verification-cug', '/digitalhangar/customer-cockpit/web-student-verification-cug/web-student-verification-cug-1.118.5.js', true],
    ['personal-documents', '/digitalhangar/doc-at-profile/personal-documents/personal-documents-2.99.0.js', true],
    // live: a plain <star-alliance data-login-required> with a module script
    ['star-alliance', '/digitalhangar/redemption-program/star-alliance/star-alliance-1.1.6.js', false],
  ].forEach(([name, script, wrapper]) => {
    const app = resolveApp(it, name, loc);
    assert.equal(app.script, script, name);
    assert.equal(app.tag, name, name);
    assert.ok(app.loginRequired, name);
    if (wrapper) {
      assert.ok(app.wrapper, name);
      assert.equal(app.attributes['data-api-gateway'], 'https://api.travelid.ita-airways.com', name);
    } else {
      assert.ok(!app.wrapper && app.module, name);
      assert.deepEqual(app.attributes, { 'data-login-required': '' }, name);
    }
    assert.ok(!shouldMount(app, false, false), `${name}: not off the login host`);
    assert.ok(!shouldMount(app, true, false), `${name}: not logged out`);
    assert.ok(shouldMount(app, true, true), `${name}: logged in on the login host`);
  });
  ['personal-information', 'communication-settings', 'flight-preferences', 'frequent-flyer-program', 'mfa-security', 'payment-methods', 'travel-partners']
    .forEach((name) => assert.equal(LH_APP.apps[name].view, 'gate', name));
  const r = await run({
    brand: 'ita', host: 'ita.turnsthe.page', path: '/it/it/profile/my-account/wallet', app: 'payment-methods',
  });
  assert.ok(r.widget.querySelector('.lh-app-gate a').href.endsWith('state=/it/it/profile/my-account/wallet&principal_type=EMAIL&reduced_state=NONE&view=login&prompt=login&country=IT&lang=it'));
});

test('best price alert (logged out): headline, text and the login link, in the brand\'s words', async () => {
  const r = await run({
    brand: 'discover', host: 'discover.turnsthe.page', path: '/de/en/profile/best-price-alert', app: 'best-price-alert',
  });
  const prompt = r.widget.querySelector('.lh-app-prompt');
  assert.ok(prompt, 'the prompt');
  assert.equal(prompt.querySelector('h1').textContent, 'Best price alerts');
  assert.equal(prompt.querySelector('p').textContent, 'Please login or register to overview and manage Best price alerts.');
  const a = prompt.querySelector('a.button.secondary');
  assert.equal(a.textContent, 'Login & Registration');
  assert.equal(a.href, WWW_GATE.discover.replace('travel-cockpit', 'best-price-alert'));
  const ita = await run({
    brand: 'ita', host: 'ita.turnsthe.page', path: '/it/en/profile/best-price-alert', app: 'best-price-alert',
  });
  assert.equal(ita.widget.querySelector('.lh-app-prompt h1').textContent, 'Your Best price alerts');
  const travelId = [...r.fetched, ...ita.fetched].filter((u) => /travelid/i.test(u));
  assert.deepEqual(travelId, []);
});

test('the brands\' other languages: the gate and the best price alert in www\'s words', async () => {
  // www's label bundles and rendered pages of 2026-11-01; the best price alert's button is the common bundle's
  // loginAndRegistration there (ITA fr, de, nl: not the farealert bundle's); br/pt and jp/ja have no best price alert
  const words = (brand, lang) => Object.values(siteConfig(LH_APP, brand).labels[lang]);
  assert.deepEqual(words('discover', 'fr'), ['Veuillez vous connecter pour consulter cette page', 'Se connecter maintenant', 'Chargement en cours…', 'Best price alerts', 'Veuillez vous identifier ou vous inscrire pour consulter et gérer les Best price alerts.', 'Connexion & Inscription']);
  assert.deepEqual(words('ita', 'fr'), ['Please log in to view this page', 'Log in now', 'Chargement en cours…', 'Best price alerts', 'Veuillez vous identifier ou vous inscrire pour consulter et gérer les Best price alerts.', 'Login & Registration']);
  assert.deepEqual(words('ita', 'es'), ['Please log in to view this page', 'Log in now', 'Cargando…', 'Your Best price alerts', 'Please login or register to overview and manage Best price alerts.', 'Login & Registration']);
  assert.deepEqual(words('ita', 'pt'), ['Please log in to view this page', 'Log in now', 'A carregar…']);
  assert.deepEqual(words('ita', 'de'), ['Bitte loggen Sie sich ein.', 'Jetzt einloggen', 'Wird geladen...', 'Best price alerts', 'Bitte melden Sie sich an oder registrieren Sie sich, um eine Übersicht zu erhalten und den Best price alerts zu verwalten.', 'Login & Registration']);
  assert.deepEqual(words('ita', 'nl'), ['Log in om deze pagina te bekijken', 'Log nu in', 'Aan het laden …', 'Best price alerts', 'Log in of registreer je voor een overzicht en beheer van Best price alerts.', 'Inloggen en registreren']);
  assert.deepEqual(words('ita', 'el'), ['Please log in to view this page', 'Log in now', 'Φορτώνει…', 'Your Best price alerts', 'Please login or register to overview and manage Best price alerts.', 'Login & Registration']);
  assert.deepEqual(words('ita', 'ja'), ['Please log in to view this page', 'Log in now', '読み込み中です・・・']);
  const gate = await run({
    brand: 'ita', host: 'ita.turnsthe.page', path: '/nl/nl/profile/my-account/wallet', app: 'payment-methods',
  });
  assert.equal(gate.widget.querySelector('.lh-app-gate-text').textContent, 'Log in om deze pagina te bekijken');
  assert.equal(gate.widget.querySelector('.lh-app-gate a').textContent, 'Log nu in');
  const bpa = await run({
    brand: 'discover', host: 'discover.turnsthe.page', path: '/xx/fr/profile/best-price-alert', app: 'best-price-alert',
  });
  const prompt = bpa.widget.querySelector('.lh-app-prompt');
  assert.equal(prompt.querySelector('h1').textContent, 'Best price alerts');
  assert.equal(prompt.querySelector('p').textContent, 'Veuillez vous identifier ou vous inscrire pour consulter et gérer les Best price alerts.');
  assert.equal(prompt.querySelector('a.button.secondary').textContent, 'Connexion & Inscription');
  const travelId = [...gate.fetched, ...bpa.fetched].filter((u) => /travelid/i.test(u));
  assert.deepEqual(travelId, []);
});
