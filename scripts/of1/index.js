/**
 * OF1's "the site notices you" on lh-com (off unless the site flag `of1` is on; scripts/of1/gate.js
 * says where it runs): our consent becomes OF1's consent API and cookie (consent-adapter.js),
 * with OneTrust C0004 our own tracker keeps the visits and answers OF1's profile request on
 * /of1?personalize=1 (tracker.js), and the de/en homepage gets the button to /of1 and its texts
 * rewritten for the visitor (homepage.js). Without C0004 nothing is recorded, no profile is
 * answered and no personalisation call is made; a withdrawal deletes the visits, of1_consent and
 * of1_profile and puts the homepage back as published.
 * scripts.js starts it in the delayed phase; the of1 block waits for it (of1Ready) so the consent
 * API and the profile answer are there before OF1's client starts.
 */
import { loadCSS } from '../aem.js';
import { getStoredConsent, isAuthoringContext } from '../consent.js';
import { isFlagOn } from '../flags.js';
import { isDemoHost } from '../demo.js';
import { brandEntry } from '../locale.js';
import { getChannel } from '../channel.js';
import {
  of1Applies, of1SwitchedOn, consentApiWanted, TESTER_KEY,
} from './gate.js';
import {
  createConsentAdapter, regionOf, consentCookieValue, consentCookie, withdrawalCookies,
  C_PERSONALISATION,
} from './consent-adapter.js';
import {
  trackVisit, readVisits, clearVisits, profilePayload, answerProfileRequests,
} from './tracker.js';

export const HOMEPAGE = '/de/en/homepage';
export const MIN_VISITS = 3;

let started = null;

const storage = () => {
  try {
    return window.localStorage;
  } catch (e) {
    return null;
  }
};

async function switchedOn() {
  let tester = '';
  try {
    tester = window.localStorage.getItem(TESTER_KEY);
  } catch (e) {
    // no storage: the flag only
  }
  if (of1SwitchedOn({ flag: false, demo: isDemoHost(), tester })) return true;
  return isFlagOn('of1');
}

const groupsNow = () => (getStoredConsent() || { groups: ['C0001'] }).groups;
const hasOf1Cookie = () => /(?:^|;\s*)of1_(consent|profile)=/.test(document.cookie);

/** The homepage's button and rewrite, for the visits before this page view. */
async function personaliseHomepage(prior, state) {
  if (prior.length < MIN_VISITS) return;
  const { buildButton, personalizeInPlace } = await import('./homepage.js');
  const main = document.querySelector('main');
  if (!main || !state.granted()) return;
  const payload = profilePayload(prior);
  // the published texts first (the rewrite never reads the button's own texts)
  const result = await personalizeInPlace({ main, payload });
  state.undo = result.undo;
  if (!state.granted()) {
    state.restore();
    return;
  }
  loadCSS(`${window.hlx.codeBasePath}/styles/of1-notice.css`);
  const button = buildButton(payload);
  const hero = main.querySelector(':scope > .section .hero-card-overlay, :scope > .section .hero');
  const after = hero ? hero.closest('main > .section') : main.querySelector(':scope > .section');
  if (after) after.after(button);
  else main.prepend(button);
  state.button = button;
}

async function run() {
  const applies = of1Applies({
    hostname: window.location.hostname,
    channel: getChannel(),
    authoring: isAuthoringContext(),
    brand: brandEntry(),
  });
  if (!applies || !(await switchedOn())) return false;
  const store = storage();
  const { pathname } = window.location;
  let groups = groupsNow();
  const adapter = createConsentAdapter({ groups, region: regionOf(document.cookie) });
  const api = { region: adapter.region, has: adapter.has, on: adapter.on };
  const prior = store ? readVisits(store) : [];
  const state = {
    granted: () => groups.includes(C_PERSONALISATION),
    undo: null,
    button: null,
    restore() {
      if (this.undo) this.undo();
      this.undo = null;
      if (this.button) this.button.remove();
      this.button = null;
    },
  };
  let stopTracking = null;
  let stopAnswering = null;
  let homepageStarted = false;

  const expose = () => {
    if (consentApiWanted(pathname, groups)) window.of1Consent = api;
    else delete window.of1Consent;
  };
  const withdraw = () => {
    if (store) clearVisits(store);
    withdrawalCookies().forEach((c) => { document.cookie = c; });
    state.restore();
  };
  const apply = (wasGranted) => {
    if (state.granted()) {
      const stored = getStoredConsent();
      const timestamp = (stored && stored.date) || new Date().toISOString();
      document.cookie = consentCookie(consentCookieValue(groups, adapter.region, timestamp));
      if (!stopTracking && store) stopTracking = trackVisit(window, document, store);
      if (!stopAnswering) {
        const payload = () => (state.granted() && store ? profilePayload(readVisits(store)) : null);
        stopAnswering = answerProfileRequests(window, payload);
      }
      if (!homepageStarted && pathname === HOMEPAGE) {
        homepageStarted = true;
        personaliseHomepage(prior, state);
      }
      return;
    }
    if (stopTracking) stopTracking();
    if (stopAnswering) stopAnswering();
    stopTracking = null;
    stopAnswering = null;
    if (wasGranted || prior.length || hasOf1Cookie()) withdraw();
  };

  expose();
  apply(false);
  window.addEventListener('consent.update', (e) => {
    const wasGranted = state.granted();
    groups = (e.detail && Array.isArray(e.detail.groups)) ? e.detail.groups : ['C0001'];
    adapter.update(groups);
    expose();
    apply(wasGranted);
  });
  return true;
}

/** Starts the features once per page; resolves when the consent API and answers are set up. */
export default function startOf1() {
  if (!started) started = run().catch(() => false);
  return started;
}

/** For the of1 block: resolves once OF1's consent API and the profile answer are in place. */
export const of1Ready = startOf1;
