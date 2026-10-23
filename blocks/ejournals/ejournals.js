import { getLocale, LIVE_ORIGIN } from '../../scripts/locale.js';
import {
  readConfigRows, pick, resolveLabels, toConfigKey,
} from '../../scripts/block-config.js';
import { fetchLabels, pickLabels } from '../../scripts/lh-api.js';
import { markSource } from '../../scripts/lh-data.js';

/* ---------------------------------------------------------------------------------------------
 * The live eJournals component (.ejournals > .dcep-ejournals, chunk 2d00a8ef) shows a logged-out
 * visitor the booking selection container of the dcep apps (as on online-check-in): an info
 * notification "Log in with your profile to select a booking." with "Go to login" (Travel ID
 * login, back to the live page), the field "Booking code or ticket number" and the button
 * "To free download", which looks the booking up (POST /service/api/ejournals) and lists the
 * eJournals of its flights. This block renders that view as content: the login link and the
 * button lead to the live page; nothing is sent (the field has no name).
 * Texts: authored rows, then the live labels (labels/common, labels/ejournals), then the
 * built-in copies.
 * ------------------------------------------------------------------------------------------- */

const DEFAULT_LABELS = {
  en: {
    'notice label': 'Log in with your profile to select a booking.',
    'login label': 'Go to login',
    'field label': 'Booking code or ticket number',
    'submit label': 'To free download',
  },
  de: {
    'notice label': 'Melden Sie sich mit Ihrem Profil an, um eine Buchung auszuwählen.',
    'login label': 'Zum Login',
    'field label': 'Buchungscode oder Ticketnummer',
    'submit label': 'Zum kostenlosen Download',
  },
};

/** Live label keys: the booking selection container (common) and the search mask (ejournals). */
const LIVE_LABEL_KEYS = {
  'notice label': 'common.bookingcodeselection.container.messageBoxTitle',
  'login label': 'common.bookingcodeselection.container.loginLinkText',
  'field label': 'ejournals.searchmask.default.pnrOrTicketNumber.label',
  'submit label': 'ejournals.searchmask.default.submitSearch',
};

/** Travel ID login of the live header and booking selection (returns to `state` on live). */
const LOGIN_URL = 'https://api.travelid.lufthansa.com/oauth2/authorize';
const LOGIN_PARAMS = {
  client_id: 'yA8iz2C5BnAIf2GKKdkAlgPPW9y6wjLO',
  response_type: 'code',
  redirect_uri: 'https://www.lufthansa.com',
  scope: 'AUTHENTICATED IDENTIFIED urn:milesandmore:tech:background:v1:active urn:milesandmore:oauth:multifactorauthentication',
};

let instanceCount = 0;

/** Page path without the local dev server's /content prefix. */
const livePath = (pathname) => pathname.replace(/^\/content(?=\/)/, '').replace(/\.html$/, '');

/**
 * The live "Go to login" link of a page: Travel ID with state = the page path (as on live).
 * @param {string} path live page path, e.g. /de/en/unterhaltung-an-bord
 * @param {Object} locale result of getLocale()
 */
export function loginUrl(path, locale) {
  const params = new URLSearchParams({
    ...LOGIN_PARAMS,
    state: path,
    principal_type: 'EMAIL',
    reduced_state: 'NONE',
    view: 'login',
    prompt: 'login',
    country: locale.country.toUpperCase(),
    lang: locale.lang,
  });
  // the live link writes the spaces of the scope as %20 and keeps / and : as they are
  return `${LOGIN_URL}?${params.toString().replace(/\+/g, '%20').replace(/%2F/g, '/').replace(/%3A/g, ':')}`;
}

/** Settings of an authored block: the live page (form action) and the login link. */
export function readEjournalsSettings(config, locale, pathname = window.location.pathname) {
  const path = livePath(pathname);
  const href = (row) => {
    if (!row) return '';
    const value = (row.link && row.link.getAttribute('href')) || row.text;
    return /^https:\/\//.test(value) ? value : '';
  };
  return {
    liveUrl: href(pick(config, 'live-page', 'fallback-link')) || `${LIVE_ORIGIN}${path}#login`,
    loginUrl: href(pick(config, 'login-link', 'login-url')) || loginUrl(path, locale),
  };
}

function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.append(content);
  return node;
}

/**
 * eJournals download, logged-out view (render-only).
 * @param {Element} block
 * @returns {Promise<void>} resolves when the live labels are applied
 */
export default async function decorate(block) {
  instanceCount += 1;
  const locale = getLocale();
  const config = readConfigRows(block);
  const settings = readEjournalsSettings(config, locale);
  const defaults = resolveLabels(DEFAULT_LABELS, {}, locale.lang);
  const authored = (key) => {
    const row = config[toConfigKey(key)];
    return row && row.text ? row.text : '';
  };

  const notice = el('div', 'ejournals-notice');
  notice.setAttribute('role', 'note');
  const copy = el('p', 'ejournals-notice-copy');
  const login = el('a', 'ejournals-login');
  login.href = settings.loginUrl;
  notice.append(copy, login);

  const form = el('form', 'ejournals-form');
  form.setAttribute('action', settings.liveUrl);
  form.setAttribute('method', 'get');
  form.noValidate = true;
  const id = `ejournals-reference-${instanceCount}`;
  const field = el('div', 'ejournals-field');
  const label = el('label');
  label.setAttribute('for', id);
  // no name: the live page asks again, nothing typed here is sent
  const input = el('input');
  input.id = id;
  input.type = 'text';
  input.autocomplete = 'off';
  input.maxLength = 13;
  input.spellcheck = false;
  field.append(label, input);
  const submit = el('button', 'ejournals-submit button primary');
  submit.type = 'submit';
  form.append(field, el('div', 'ejournals-actions', submit));

  const apply = (live) => {
    const text = (key) => authored(key) || live[key] || defaults[key];
    copy.textContent = text('notice label');
    login.textContent = text('login label');
    label.textContent = text('field label');
    input.placeholder = text('field label');
    submit.textContent = text('submit label');
  };
  apply({});
  block.replaceChildren(notice, form);

  const { labels, sources } = await fetchLabels(['common', 'ejournals'], locale);
  apply(pickLabels(labels, LIVE_LABEL_KEYS));
  markSource(block, {
    'labels/common': sources.common,
    'labels/ejournals': sources.ejournals,
  }, ['labels/common', 'labels/ejournals']);
}
