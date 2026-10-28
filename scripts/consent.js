/**
 * Cookie consent: Lufthansa's OneTrust banner as on www.lufthansa.com, with a visually
 * identical fallback (consent-banner.js) when OneTrust does not show up.
 *
 * - Nothing is loaded when the page renders inside DA (preview pane, quick edit,
 *   Universal Editor); see isAuthoringContext().
 * - OneTrust is configured for lufthansa.com and writes its cookies with
 *   domain=.lufthansa.com, which browsers drop on any other host. The choice is therefore
 *   also kept in localStorage; once a choice is stored and OneTrust cannot read its own
 *   cookie, OneTrust is not loaded again on page load (it would show its banner again).
 * - Every change is announced with the 'consent.update' event,
 *   detail { consented, groups, source }. 'consent.preferences' (footer link
 *   "Change Privacy Settings") reopens OneTrust's preference center or the fallback.
 * - Tagging is scripts/martech.js's (the tag manager and www's data layer, waiting for a choice
 *   here): off by default, on only for a host in MARTECH_HOSTS below; consented.js stays an
 *   empty hook.
 */

import { loadCSS } from './aem.js';
import { isDemoHost } from './demo.js';

const ONETRUST_STUB = 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js';
const ONETRUST_DOMAIN_SCRIPT = '01994cb2-af99-7dbe-8fb0-56427773e54e';
const STORAGE_KEY = 'lh-consent';
const FALLBACK_DELAY = 5000;

/**
 * The tag manager's hosts (scripts/martech.js): one row per hostname,
 * { mode: 'live', tealium: { account: '<TEALIUM_ACCOUNT>', profile: '<TEALIUM_PROFILE>',
 * env: '<TEALIUM_ENV>' } }. Empty: martech is off on every host. Kept here, in a module the page
 * loads anyway, so scripts.js can tell without loading martech.js (no request) that a host has
 * none.
 */
export const MARTECH_HOSTS = {};

/** Whether the page loads scripts/martech.js: its host has a row, or the page asks ?martech=dry. */
export function martechWanted(location = window.location, hosts = MARTECH_HOSTS) {
  return Object.prototype.hasOwnProperty.call(hosts, location.hostname)
    || new URLSearchParams(location.search).getAll('martech').includes('dry');
}

/** OneTrust category ids: strictly necessary first */
export const NECESSARY = 'C0001';
export const ALL_GROUPS = ['C0001', 'C0002', 'C0004', 'C0005'];

/** DA preview pane, DA quick edit, Universal Editor (also stage-* and da.page variants) */
const AUTHORING_HOST = /\.(stage-)?(preview|ue)\.da\.(live|page)$/;
const AUTHORING_PARAMS = ['dapreview', 'quick-edit', 'controller', 'daexperiment'];
const ADOBE_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(da\.live|da\.page|adobe\.com|adobe\.io)$/i;
const QUICK_EDIT = '#quick-edit-iframe, iframe[src*="quick-edit="]';

const state = {
  started: false,
  suppressed: false,
  oneTrust: 'idle', // idle | loading | ready | failed
  wrapperCalls: 0,
  fallback: null, // fallback banner module once shown
  timer: 0,
  consentedLoaded: false,
};

/**
 * Whether the page renders inside an authoring tool, where no banner must ever be loaded.
 * @returns {boolean}
 */
export function isAuthoringContext() {
  const { hostname, search } = window.location;
  if (AUTHORING_HOST.test(hostname)) return true;

  const params = new URLSearchParams(search);
  if (AUTHORING_PARAMS.some((param) => params.has(param))) return true;
  if (params.get('consent') === 'disabled' || params.get('martech') === 'off') return true;

  if (document.querySelector('meta[name^="urn:adobe:aue:"], [data-aue-resource]')) return true;

  if (window.self !== window.top) {
    const origins = [...(window.location.ancestorOrigins || [])];
    try {
      if (document.referrer) origins.push(new URL(document.referrer).origin);
    } catch (e) {
      // no usable referrer
    }
    if (origins.some((origin) => ADOBE_ORIGIN.test(origin))) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ storage + events -- */

/**
 * The stored consent choice.
 * @returns {{groups: string[], source: string, date: string}|null}
 */
export function getStoredConsent() {
  try {
    const choice = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return choice && Array.isArray(choice.groups) ? choice : null;
  } catch (e) {
    return null;
  }
}

function storeConsent(groups, source) {
  try {
    const choice = { groups, source, date: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
  } catch (e) {
    // storage unavailable: the choice holds for this page view only
  }
}

function announce(groups, source) {
  const consented = groups.some((group) => group !== NECESSARY);
  window.dispatchEvent(new CustomEvent('consent.update', { detail: { consented, groups, source } }));
  if (consented && !state.consentedLoaded) {
    state.consentedLoaded = true;
    import('./consented.js');
  }
}

/**
 * Records a choice made in OneTrust or the fallback banner.
 * @param {string[]} groups accepted OneTrust categories
 * @param {string} source 'onetrust' or 'fallback'
 */
function choose(groups, source) {
  const unique = [...new Set([NECESSARY, ...groups])];
  storeConsent(unique, source);
  announce(unique, source);
}

function oneTrustGroups() {
  return String(window.OnetrustActiveGroups || '').split(',').filter(Boolean);
}

function oneTrustCookie() {
  return /(?:^|;\s*)OptanonAlertBoxClosed=/.test(document.cookie);
}

/* --------------------------------------------------------------------------- fallback -- */

function oneTrustVisible() {
  const el = document.querySelector('#onetrust-banner-sdk, #onetrust-pc-sdk');
  return Boolean(el && el.offsetHeight > 0 && getComputedStyle(el).visibility !== 'hidden');
}

async function showFallback(view = 'banner') {
  // the look-alike banner exists because OneTrust's .lufthansa.com cookies don't work on the
  // demo's hosts: demo hosts only
  if (state.suppressed || !isDemoHost()) return;
  window.clearTimeout(state.timer);
  document.documentElement.classList.add('lh-consent-fallback');
  if (!state.fallback) state.fallback = await import('./consent-banner.js');
  if (state.suppressed) return;
  const stored = getStoredConsent();
  state.fallback.showConsentBanner({
    view,
    groups: stored ? stored.groups : [NECESSARY],
    onChoice: (groups) => choose(groups, 'fallback'),
  });
}

/* --------------------------------------------------------------------------- OneTrust -- */

function onOneTrustReady(onReady) {
  state.wrapperCalls += 1;
  if (state.wrapperCalls === 1) {
    // first call: OneTrust initialised
    state.oneTrust = 'ready';
    if (state.suppressed) return;
    if (window.OneTrust && window.OneTrust.IsAlertBoxClosed && window.OneTrust.IsAlertBoxClosed()) {
      window.clearTimeout(state.timer);
      choose(oneTrustGroups(), 'onetrust');
    }
    if (onReady) onReady();
    return;
  }
  // every later call is a choice made in OneTrust's banner or preference center
  if (!document.documentElement.classList.contains('lh-consent-fallback')) {
    choose(oneTrustGroups(), 'onetrust');
  }
}

/**
 * Loads OneTrust exactly like www.lufthansa.com and shows the fallback when OneTrust
 * fails or stays invisible.
 * @param {Object} [options]
 * @param {Function} [options.onReady] called once OneTrust is initialised
 * @param {string} [options.fallbackView] fallback view when OneTrust does not show
 */
function loadOneTrust({ onReady, fallbackView = 'banner' } = {}) {
  if (state.oneTrust !== 'idle') return;
  state.oneTrust = 'loading';
  loadCSS(`${window.hlx.codeBasePath}/styles/consent-banner.css`);

  const previous = window.OptanonWrapper;
  window.OptanonWrapper = () => {
    if (typeof previous === 'function') previous();
    onOneTrustReady(onReady);
  };

  const script = document.createElement('script');
  script.src = ONETRUST_STUB;
  script.type = 'text/javascript';
  script.dataset.domainScript = ONETRUST_DOMAIN_SCRIPT;
  script.dataset.documentLanguage = 'true';
  script.async = true;
  script.addEventListener('error', () => {
    state.oneTrust = 'failed';
    showFallback(fallbackView);
  });
  document.head.append(script);

  state.timer = window.setTimeout(() => {
    if (state.suppressed || oneTrustVisible()) return;
    const closed = window.OneTrust && window.OneTrust.IsAlertBoxClosed
      && window.OneTrust.IsAlertBoxClosed();
    if (fallbackView === 'banner' && (closed || getStoredConsent())) return;
    if (state.oneTrust !== 'ready') state.oneTrust = 'failed';
    showFallback(fallbackView);
  }, FALLBACK_DELAY);
}

/* ------------------------------------------------------------------- preferences link -- */

function openPreferences() {
  if (state.suppressed || isAuthoringContext()) return;
  const usingFallback = document.documentElement.classList.contains('lh-consent-fallback');
  const stored = getStoredConsent();
  if (usingFallback || state.oneTrust === 'failed' || (stored && stored.source === 'fallback' && state.oneTrust === 'idle')) {
    showFallback('preferences');
    return;
  }
  if (state.oneTrust === 'ready' && window.OneTrust && window.OneTrust.ToggleInfoDisplay) {
    window.OneTrust.ToggleInfoDisplay();
    return;
  }
  // OneTrust was not needed on this page view: load it now and open its preference center
  loadOneTrust({
    fallbackView: 'preferences',
    onReady: () => {
      window.clearTimeout(state.timer);
      if (window.OneTrust && window.OneTrust.ToggleInfoDisplay) window.OneTrust.ToggleInfoDisplay();
    },
  });
}

/* ------------------------------------------------------------ authoring overlay watch -- */

/** Removes every banner for good, e.g. when DA quick edit opens over the page. */
function suppress() {
  if (state.suppressed) return;
  state.suppressed = true;
  window.clearTimeout(state.timer);
  document.documentElement.classList.add('lh-consent-suppressed');
  // the stylesheet keeps a OneTrust banner that renders later hidden as well
  if (state.oneTrust !== 'idle') loadCSS(`${window.hlx.codeBasePath}/styles/consent-banner.css`);
  const sdk = document.getElementById('onetrust-consent-sdk');
  if (sdk) sdk.style.setProperty('display', 'none', 'important');
  if (state.fallback) state.fallback.removeConsentBanner();
}

function watchQuickEdit() {
  if (document.querySelector(QUICK_EDIT)) {
    suppress();
    return;
  }
  const hit = (node) => node.nodeType === Node.ELEMENT_NODE
    && (node.matches(QUICK_EDIT) || node.querySelector(QUICK_EDIT));
  const observer = new MutationObserver((records) => {
    if (records.some((record) => [...record.addedNodes].some(hit))) {
      observer.disconnect();
      suppress();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

/* ------------------------------------------------------------------------------- init -- */

/**
 * Starts consent handling once per page (safe to call again when loadPage re-runs).
 */
export function initConsent() {
  if (state.started) return;
  state.started = true;
  if (isAuthoringContext()) {
    state.suppressed = true;
    announce([NECESSARY], 'authoring');
    return;
  }

  window.addEventListener('consent.preferences', openPreferences);
  watchQuickEdit();

  const stored = getStoredConsent();
  announce(stored ? stored.groups : [NECESSARY], stored ? stored.source : 'default');
  // OneTrust runs when no choice is stored, or when it can read its own cookie (lufthansa.com)
  if (!stored || oneTrustCookie()) loadOneTrust();
}
