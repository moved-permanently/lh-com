/**
 * Login and profile apps of lufthansa.com (widget, see README.md): one widget link per app,
 * `/widgets/lh-app/lh-app.html?app=<name>`. Mounts the app's web component the way the live
 * page's dcep app does, renders the logged-out gate, or renders nothing, depending on the host
 * and the visitor's Travel ID session. Apps, versions and hosts are in lh-app.json; a brand
 * site (page metadata `brand`) gets its entry of `brands` there over Lufthansa's config.
 *
 * Hosts: only on lufthansa.com (or a subdomain, config.loginHosts; a brand's own www domain on
 * its site) does the page ask Travel ID whether the visitor is logged in. Everywhere else the
 * visitor counts as logged out without any request to Travel ID, and only apps that make no
 * Travel ID call while logged out are mounted (loggedOut: "public").
 */
import { loadCSS, loadScript } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import { fetchLabels } from '../../scripts/lh-api.js';
import { brandOf } from '../../scripts/brand.js';

const GATE_TEXT = 'common.misc.loader.forcedOneIdLoginText';
const GATE_BUTTON = 'common.misc.loader.forcedOneIdLoginButton';
const LOADER = 'common.misc.loader.label';

/** Keys the dcep wrapper sets as attributes (live: addPropertiesAndAttributes allow-list). */
const WRAPPER_ATTRIBUTES = ['class', 'data-api-gateway', 'data-translation-labels',
  'data-configuration', 'data-themes', 'data-public-endpoint', 'options'];

let configPromise;
let sessionPromise;
let labelsPromise;
const promptLabels = {};

/**
 * The config of the page's site: Lufthansa's (no brand, or one without an entry in `brands`),
 * else the brand's entry over it (its hosts, Travel ID, login client, design system, portal,
 * labels by language) and its app entries over Lufthansa's, without Lufthansa's per-locale
 * overrides (their keys are lufthansa.com's roots).
 */
export function siteConfig(json, brand = '') {
  const entry = brand && json.brands && json.brands[brand];
  if (!entry) return { ...json.config, apps: json.apps };
  const { apps: own = {}, ...config } = entry;
  const apps = {};
  Object.keys({ ...json.apps, ...own }).forEach((name) => {
    const { locales, ...base } = json.apps[name] || {};
    const over = own[name] || {};
    apps[name] = { ...base, ...over };
    if (base.attributes || over.attributes) {
      apps[name].attributes = { ...base.attributes, ...over.attributes };
    }
  });
  const labels = { ...json.config.labels };
  Object.entries(config.labels || {}).forEach(([lang, texts]) => {
    labels[lang] = { ...json.config.labels[lang], ...texts };
  });
  return {
    ...json.config,
    ...config,
    authorize: { ...json.config.authorize, ...config.authorize },
    maui: { ...json.config.maui, ...config.maui },
    portal: { ...json.config.portal, ...config.portal },
    labels,
    apps,
  };
}

/**
 * A brand's ownScriptHosts (hosts that route /digitalhangar/ to its www: lh-edge's
 * swiss.turnsthe.page): there its apps and design system load from the page's own host
 * (scriptOrigin ''), so no visitor's browser asks its www; elsewhere from its www, as before.
 */
export function ownScripts(config, hostname) {
  return (config.ownScriptHosts || []).includes(hostname) ? { ...config, scriptOrigin: '' } : config;
}

function loadConfig() {
  if (!configPromise) {
    configPromise = fetch(`${window.hlx.codeBasePath}/widgets/lh-app/lh-app.json`)
      .then((resp) => resp.json())
      .then((json) => ownScripts(siteConfig(json, brandOf()), window.location.hostname));
  }
  return configPromise;
}

/**
 * Replaces {travelIdApi} and {scriptOrigin} with their config values, {languageCountry} with
 * the locale's language and country (en-at).
 */
function fill(value, config, locale) {
  return String(value).replace(/\{(travelIdApi|scriptOrigin|languageCountry)\}/g, (m, key) => {
    if (key !== 'languageCountry') return config[key];
    return locale ? `${locale.lang}-${locale.country}` : m;
  });
}

/** Whether a host is one of the login hosts or a subdomain of one. */
export function isLoginHost(hostname, hosts) {
  return hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

/**
 * The Travel ID login URL the live page builds on the server (state = the page to return to;
 * parameters in live's order, state and scope colons unencoded as there).
 */
export function authorizeUrl(config, locale, path) {
  const a = config.authorize;
  return `${fill(a.url, config)}?client_id=${a.clientId}&response_type=code`
    + `&redirect_uri=${a.redirectUri}&scope=${a.scope.replace(/ /g, '%20')}`
    + `&state=${encodeURI(path)}&${a.extra}`
    + `&country=${locale.country.toUpperCase()}&lang=${locale.lang}`;
}

/**
 * One login check per page view: { loggedIn, state }. Off the login hosts: logged out, no
 * request. On a login host: Travel ID loginstatus (cookie session), then the profile the
 * apps get as `state`, as the live page does.
 * UNTESTED: needs a lufthansa.com host; the profile route answers only on www.lufthansa.com
 * (cookie dcep.user) and live maps it through its ProfilePPL selector first.
 */
function loginSession(config, loginHost) {
  if (!sessionPromise) {
    if (!loginHost) {
      sessionPromise = Promise.resolve({ loggedIn: false });
    } else {
      sessionPromise = fetch(`${config.travelIdApi}${config.loginStatusPath}`, { credentials: 'include' })
        .then(async (resp) => {
          if (!resp.ok) return { loggedIn: false };
          const profile = await fetch(config.profileApi, { credentials: 'include' })
            .then((r) => (r.ok ? r.json() : undefined))
            .catch(() => undefined);
          return { loggedIn: true, state: profile };
        })
        .catch(() => ({ loggedIn: false }));
    }
  }
  return sessionPromise;
}

/** Gate labels: live (or recorded) common labels, the config's texts as fallback. */
function gateLabels(config, locale) {
  if (!labelsPromise) {
    const fallback = config.labels[locale.lang] || config.labels.en;
    labelsPromise = fetchLabels(['common'], locale)
      .then(({ labels }) => ({ ...fallback, ...labels }))
      .catch(() => fallback);
  }
  return labelsPromise;
}

/**
 * The app's entry with the locale's overrides and the link's class, id and version (a version
 * number replaces the one in the script's file name).
 */
export function resolveApp(config, name, locale, params = {}) {
  const base = config.apps[name];
  if (!base) return null;
  const over = (base.locales && base.locales[locale.key]) || {};
  const app = { ...base, ...over };
  const attributes = { ...base.attributes, ...over.attributes };
  if (params.class) attributes.class = params.class;
  if (params.id) app.id = params.id;
  if (app.script && /^\d+\.\d+\.\d+$/.test(params.version || '')) {
    app.script = app.script.replace(/-\d+\.\d+\.\d+\.js$/, `-${params.version}.js`);
  }
  app.attributes = Object.fromEntries(Object.entries(attributes)
    .map(([key, value]) => [key, fill(value, config, locale)]));
  return app;
}

/** Whether to load and mount an app's web component. */
export function shouldMount(app, loginHost, loggedIn) {
  if (!app.tag) return false;
  if (app.loggedOut === 'public') return true;
  if (app.loggedOut === 'lufthansa-host') return loginHost;
  return loginHost && loggedIn;
}

/** Page meta tags and body class the web components read market and language from. */
function preparePage(config, locale) {
  const meta = {
    ...config.portal,
    'X-Portal-Site': locale.country.toUpperCase(),
    'X-Portal-Language': locale.lang,
  };
  Object.entries(meta).forEach(([name, content]) => {
    if (document.head.querySelector(`meta[name="${name}"]`)) return;
    const tag = document.createElement('meta');
    tag.name = name;
    tag.content = content;
    document.head.append(tag);
  });
  document.body.classList.add(config.themeClass || 'maui-theme-lh');
}

/**
 * Creates the app's element. Wrapper apps (live: div.dcep-react-wrapper) get the allow-listed
 * keys as attributes, data-public-endpoint only when no login is required, and, once the
 * element is defined, every key it has a property for (state, schema, id, data-api-gateway).
 */
function mount(app, container, config, session) {
  const el = document.createElement(app.tag);
  if (app.wrapper) {
    const props = {
      ...app.attributes,
      'data-public-endpoint': !app.loginRequired,
      schema: app.schema,
      state: session.state,
    };
    Object.entries(props).forEach(([key, value]) => {
      if (!WRAPPER_ATTRIBUTES.includes(key) || value === '' || value === false) return;
      el.setAttribute(key, value === true ? '' : value);
    });
    if (app.id) el.id = app.id;
    customElements.whenDefined(app.tag).then(() => {
      Object.entries(props).forEach(([key, value]) => {
        if (value !== undefined && key in el && el[key] !== value) el[key] = value;
      });
    });
  } else {
    Object.entries(app.attributes).forEach(([key, value]) => el.setAttribute(key, value));
  }
  container.append(el);
  if (app.maui) {
    loadCSS(`${config.scriptOrigin}${config.maui.css}`);
    loadScript(`${config.scriptOrigin}${config.maui.js}`, { type: 'module' }).catch(() => {});
  }
  loadScript(`${config.scriptOrigin}${app.script}`, app.module ? { type: 'module' } : undefined)
    .catch(() => {});
}

/** Prompt texts (an app's own label bundle), the config's texts by language as fallback. */
function promptTexts(config, locale, bundle) {
  if (!promptLabels[bundle]) {
    const fallback = config.labels[locale.lang] || config.labels.en;
    promptLabels[bundle] = fetchLabels([bundle], locale)
      .then(({ labels }) => ({ ...fallback, ...labels }))
      .catch(() => fallback);
  }
  return promptLabels[bundle];
}

/**
 * A logged-out prompt of a dcep app (live's best price alerts, full view): headline, text and a
 * secondary button to the Travel ID login.
 */
function showPrompt(widget, prompt, labels, href) {
  const box = document.createElement('div');
  box.className = 'lh-app-prompt';
  const headline = document.createElement('h1');
  headline.textContent = labels[prompt.headline] || '';
  const text = document.createElement('p');
  text.textContent = labels[prompt.text] || '';
  const action = document.createElement('p');
  const button = document.createElement('a');
  button.className = 'button secondary';
  button.target = '_self';
  button.href = href;
  button.textContent = labels[prompt.button] || '';
  action.append(button);
  box.append(headline, text, action);
  widget.prepend(box);
}

function showGate(gate, labels, href) {
  gate.querySelector('.lh-app-gate-text').textContent = labels[GATE_TEXT];
  const button = gate.querySelector('a');
  button.textContent = labels[GATE_BUTTON];
  button.href = href;
  gate.hidden = false;
}

export default async function decorate(widget) {
  const config = await loadConfig();
  const locale = getLocale();
  const loginHost = isLoginHost(window.location.hostname, config.loginHosts);
  const name = widget.dataset.app;
  const app = resolveApp(config, name, locale, widget.dataset);
  const gate = widget.querySelector('.lh-app-gate');
  const loader = widget.querySelector('.lh-app-loader');
  const container = widget.querySelector('.lh-app-mount');
  if (name) widget.classList.add(`lh-app-${name}`);

  if (app && app.view === 'gate' && loginHost) {
    // live shows its loader until the login check is done
    loader.textContent = (config.labels[locale.lang] || config.labels.en)[LOADER];
    loader.hidden = false;
  }
  const session = await loginSession(config, loginHost);

  if (app && app.view === 'gate' && !session.loggedIn) {
    const labels = await gateLabels(config, locale);
    showGate(gate, labels, authorizeUrl(config, locale, window.location.pathname));
  }
  if (app && app.view === 'prompt' && app.prompt && !session.loggedIn) {
    const labels = await promptTexts(config, locale, app.prompt.bundle);
    showPrompt(widget, app.prompt, labels, authorizeUrl(config, locale, window.location.pathname));
  }
  // logged in, account-statement and fare-alert-overview render nothing: their live views come
  // from the dcep bundle (not loadable on its own) and need a rebuild
  if (app && shouldMount(app, loginHost, session.loggedIn)) {
    preparePage(config, locale);
    mount(app, container, config, session);
  }

  loader.remove();
  if (gate.hidden) gate.remove();
  if (!container.children.length) container.remove();
  if (!widget.children.length) widget.classList.add('lh-app-empty');
}
