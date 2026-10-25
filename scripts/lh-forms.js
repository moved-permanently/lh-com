/*
 * The lh-forms worker (tools/workers/lh-forms/README.md) that the Form (core) block posts its
 * submissions to, and the form ids it knows.
 */

/** Origin of the deployed lh-forms worker; the block posts to `${origin}/submit`. */
export const FORMS_ENDPOINT = 'https://lh-forms.aem-poc-lab.workers.dev';

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

/** Form id of a page path (its last segment), '' when the page is not one of the forms. */
export function formIdFromPath(pathname = window.location.pathname) {
  const last = String(pathname).replace(/\/+$/, '').split('/').pop()
    .replace(/\.(plain\.)?html?$/, '');
  return FORM_IDS[last] || '';
}
