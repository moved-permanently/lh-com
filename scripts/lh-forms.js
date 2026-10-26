/*
 * The lh-forms worker (tools/workers/lh-forms/README.md) that the Form (core) block posts its
 * submissions to, and the form ids it knows.
 */

/**
 * Public address of the lh-forms worker (custom domain, attached in the Cloudflare dashboard;
 * the worker also answers on https://lh-forms.aem-poc-lab.workers.dev); the block posts to
 * `${origin}/submit`.
 */
export const FORMS_ENDPOINT = 'https://lhforms.bbird.live';

/** Where the block goes when a submission fails (live: origin + "/error.html"). */
export const DEFAULT_ERROR_PAGE = '/error.html';

/**
 * Worker form id per live page name (last path segment). The German page names of
 * special-needs and add-sports-baggage map to the English ids.
 */
export const FORM_IDS = {
  'anmeldung-tiere-frachtraum': 'anmeldung-tiere-frachtraum',
  'refund-form': 'refund-form',
  'feedback-past-flight': 'feedback-past-flight',
  'register-ammunition': 'register-ammunition',
  'register-animal-cabin': 'register-animal-cabin',
  'special-needs': 'special-needs',
  betreuungsbedarf: 'special-needs',
  'add-sports-baggage': 'add-sports-baggage',
  'sportgepaeck-hinzufuegen': 'add-sports-baggage',
  'group-travel': 'group-travel',
  'passenger-receipt-90': 'passenger-receipt-90',
};

/** Worker origin; localStorage "lh-forms" lets a tester point a page at another worker. */
export function formsEndpoint() {
  try {
    return (window.localStorage.getItem('lh-forms') || FORMS_ENDPOINT).replace(/\/+$/, '');
  } catch (e) {
    return FORMS_ENDPOINT;
  }
}

/** Cloudflare Turnstile, the bot check of lh-forms (its README): rendered explicitly. */
export const TURNSTILE_API = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/** The submission part with the widget's token (the name the widget gives its input). */
export const BOT_TOKEN_FIELD = 'cf-turnstile-response';

const CONFIG_OFF = { botCheck: 'off', turnstileSiteKey: '' };
let configRequest;

/**
 * The worker's form configuration (GET /config): {botCheck: 'on'|'off', turnstileSiteKey}, read
 * once per page. When it cannot be read: no site key (the worker decides at submit).
 */
export function formsConfig() {
  if (!configRequest) {
    configRequest = fetch(`${formsEndpoint()}/config`, { credentials: 'omit' })
      .then((res) => (res.ok ? res.json() : CONFIG_OFF))
      .then((c) => ({
        botCheck: c && c.botCheck === 'on' ? 'on' : 'off',
        turnstileSiteKey: String((c && c.turnstileSiteKey) || '').trim(),
      }))
      .catch(() => CONFIG_OFF);
  }
  return configRequest;
}

/** Forgets the configuration read (tests). */
export function resetFormsConfig() {
  configRequest = undefined;
}

/**
 * The site key the widget renders with: localStorage "lh-forms-sitekey" when set (a tester's
 * Cloudflare test key, e.g. 1x00000000000000000000AA, on branch previews and localhost, where the
 * real key cannot render), else the configuration's.
 */
export function turnstileSiteKey(config) {
  let override = '';
  try {
    override = (window.localStorage.getItem('lh-forms-sitekey') || '').trim();
  } catch (e) {
    override = '';
  }
  return override || String((config && config.turnstileSiteKey) || '');
}

/** Form id of a page path (its last segment), '' when the page is not one of the forms. */
export function formIdFromPath(pathname = window.location.pathname) {
  const last = String(pathname).replace(/\/+$/, '').split('/').pop()
    .replace(/\.(plain\.)?html?$/, '');
  return FORM_IDS[last] || '';
}
