/**
 * Our own visit tracker for OF1 (not OF1's of1-tracker.js, which never loads on our hosts), only
 * with OneTrust C0004: the last visits in localStorage (VISITS_KEY), the interests and the intent
 * profile derived from them, and the answer to OF1's client when it asks for the profile on
 * /of1?personalize=1 (OF1_REQUEST_PROFILE -> OF1_PERSONALIZE). It writes no cookie (of1_profile
 * is the proxy's), reads none of Adobe's and sends no visitor id.
 */

export const VISITS_KEY = 'lh-of1-visits';
export const MAX_VISITS = 20;

/** OF1's intent stages. */
export const STAGES = ['exploring', 'researching', 'comparing', 'purchase', 'deal-seeking', 'support'];

const STAGE_TEXT = {
  exploring: ['Exploring', 'Browsing destinations and ideas, no plan yet'],
  researching: ['Researching', 'Reading up on travel details such as baggage, rules and services'],
  comparing: ['Comparing', 'Weighing travel classes, seats and fares'],
  purchase: ['Ready to book', 'On flight searches and booking pages'],
  'deal-seeking': ['Looking for deals', 'Following offers, promotions and miles deals'],
  support: ['Looking for help', 'On help, contact, claims and check-in pages'],
};

// a page's stage from its path and title (www's paths in English and German)
const STAGE_RULES = [
  ['support', /help|hilfe|contact|kontakt|faq|claim|compensation|entschaedigung|refund|erstattung|feedback|check-in|checkin|lost|fundsachen/i],
  ['deal-seeking', /offer|angebot|deal|promotion|black-friday|sale|cash-and-miles|local-page|aktion|rabatt/i],
  ['purchase', /flight-search|flugsuche|book-and-manage|booking|buchung|\/book(\/|$)|my-bookings/i],
  ['comparing', /business|first-class|premium-economy|economy|seat|sitz|travel-class|reiseklasse|allegris|compare|vergleich/i],
  ['researching', /baggage|gepaeck|gepäck|travel-information|reiseinformation|article|artikel|entry|einreise|service|info/i],
];

/** Whether a path's visits are recorded: never /of1, /deliverables/ or /galleries/. */
export function isTrackedPath(pathname) {
  const p = String(pathname || '');
  return !/^\/(of1(\/.*)?|deliverables(\/.*)?|galleries(\/.*)?)$/.test(p);
}

const clean = (text, max) => String(text || '').replace(/\s+/g, ' ').trim().slice(0, max);

/** A new visit of a page (OF1's pageVisits entry). */
export function visitOf(location, title, now = new Date()) {
  const url = new URL(location.href);
  return {
    url: `${url.origin}${url.pathname}`,
    path: location.pathname,
    title: clean(String(title || '').replace(/\s*[|–-]\s*Lufthansa\s*$/i, ''), 120),
    dwellTimeMs: 0,
    maxScrollDepth: 0,
    scrollDepth: 0,
    clickTargets: [],
    focusAreas: [],
    visitedAt: now.toISOString(),
  };
}

/** Counts a click on a target of the visit. */
export function recordClick(visit, { selector, text }) {
  const entry = { selector: clean(selector, 80), text: clean(text, 60) };
  const hit = visit.clickTargets
    .find((t) => t.selector === entry.selector && t.text === entry.text);
  if (hit) hit.count += 1;
  else if (visit.clickTargets.length < 20) visit.clickTargets.push({ ...entry, count: 1 });
}

/** The visits with one more, the last MAX_VISITS. */
export function addVisit(visits, visit) {
  return [...visits, visit].slice(-MAX_VISITS);
}

export function readVisits(storage) {
  try {
    const list = JSON.parse(storage.getItem(VISITS_KEY));
    return Array.isArray(list) ? list.filter((v) => v && typeof v.path === 'string') : [];
  } catch (e) {
    return [];
  }
}

export function writeVisits(storage, visits) {
  try {
    storage.setItem(VISITS_KEY, JSON.stringify(visits.slice(-MAX_VISITS)));
  } catch (e) {
    // storage full or off: nothing kept
  }
}

export function clearVisits(storage) {
  try {
    storage.removeItem(VISITS_KEY);
  } catch (e) {
    // nothing to clear
  }
}

const round = (n) => Math.round(n * 100) / 100;
const weightOf = (v) => 0.5 + 0.3 * Math.min(1, (Number(v.dwellTimeMs) || 0) / 60000)
  + 0.2 * Math.min(1, (Number(v.maxScrollDepth) || 0) / 100);

/** The interests: one per page title, scored by visits, dwell time and scroll depth (top 1). */
export function deriveInterests(visits) {
  const totals = new Map();
  visits.filter((v) => v.title)
    .forEach((v) => totals.set(v.title, (totals.get(v.title) || 0) + weightOf(v)));
  const max = Math.max(0, ...totals.values());
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, total]) => ({ topic, score: round(total / max), source: 'browsing' }));
}

const stageOf = (v) => (STAGE_RULES.find(([, re]) => re.test(`${v.path} ${v.title}`)) || ['exploring'])[0];

/** The intent profile in OF1's stages: every stage with its share of the visits, top first. */
export function deriveIntentProfile(visits, now = new Date()) {
  const weights = Object.fromEntries(STAGES.map((s) => [s, 0]));
  const signals = Object.fromEntries(STAGES.map((s) => [s, []]));
  visits.forEach((v) => {
    const stage = stageOf(v);
    weights[stage] += weightOf(v);
    if (signals[stage].length < 5) signals[stage].push(`visited ${v.path}`);
  });
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const intents = STAGES.map((category) => ({
    category,
    score: total ? round(weights[category] / total) : 0,
    label: STAGE_TEXT[category][0],
    description: STAGE_TEXT[category][1],
    signals: signals[category],
  })).sort((a, b) => b.score - a.score || STAGES.indexOf(a.category) - STAGES.indexOf(b.category));
  return {
    intents,
    topIntent: total ? intents[0].category : 'exploring',
    topScore: intents[0].score,
    updatedAt: now.toISOString(),
  };
}

/** A short summary of the visits (the button's q and the payload's query). */
export function visitSummary(visits) {
  const titles = deriveInterests(visits).slice(0, 3).map((i) => i.topic);
  if (!titles.length) return '';
  const text = `Pages I looked at: ${titles.join(', ')}`;
  return text.length > 120 ? `${text.slice(0, 119)}…` : text;
}

/** What OF1's client gets on OF1_REQUEST_PROFILE. */
export function profilePayload(visits, now = new Date()) {
  return {
    pageVisits: visits,
    interests: deriveInterests(visits),
    intentProfile: deriveIntentProfile(visits, now),
    query: visitSummary(visits),
  };
}

/**
 * Answers OF1's OF1_REQUEST_PROFILE (our window, our origin) with OF1_PERSONALIZE to our origin.
 * @param {Window} win
 * @param {Function} getPayload the payload, or null (no answer: no consent)
 * @returns {Function} stops answering
 */
export function answerProfileRequests(win, getPayload) {
  const onMessage = (event) => {
    if (event.source !== win || event.origin !== win.location.origin) return;
    if (!event.data || event.data.type !== 'OF1_REQUEST_PROFILE') return;
    const payload = getPayload();
    if (payload) win.postMessage({ type: 'OF1_PERSONALIZE', payload }, win.location.origin);
  };
  win.addEventListener('message', onMessage);
  return () => win.removeEventListener('message', onMessage);
}

/** A click target's selector: tag, first class, its block. */
function selectorOf(el) {
  const block = el.closest('[data-block-name]');
  const cls = typeof el.className === 'string' && el.className.trim() ? `.${el.className.trim().split(/\s+/)[0]}` : '';
  return `${block ? `.${block.dataset.blockName} ` : ''}${el.tagName.toLowerCase()}${cls}`;
}

/**
 * Records this page's visit (dwell time while visible, scroll depth, clicks), saved when the page
 * is hidden or left.
 * @returns {Function} stops recording (the visit stays as saved)
 */
export function trackVisit(win = window, doc = document, storage = win.localStorage) {
  if (!isTrackedPath(win.location.pathname)) return () => {};
  const visit = visitOf(win.location, doc.title || (doc.querySelector('h1') || {}).textContent);
  let visibleSince = doc.visibilityState === 'hidden' ? 0 : Date.now();
  const save = () => {
    if (visibleSince) {
      visit.dwellTimeMs += Date.now() - visibleSince;
      visibleSince = doc.visibilityState === 'hidden' ? 0 : Date.now();
    }
    const visits = readVisits(storage);
    const at = visits.findIndex((v) => v.visitedAt === visit.visitedAt && v.path === visit.path);
    if (at >= 0) visits[at] = visit;
    writeVisits(storage, at >= 0 ? visits : addVisit(visits, visit));
  };
  const onScroll = () => {
    const height = doc.documentElement.scrollHeight - win.innerHeight;
    const depth = height > 0 ? Math.min(100, Math.round((win.scrollY / height) * 100)) : 100;
    if (depth > visit.maxScrollDepth) {
      visit.maxScrollDepth = depth;
      visit.scrollDepth = depth;
    }
  };
  const onClick = (e) => {
    const el = e.target && e.target.closest && e.target.closest('a, button');
    if (el) recordClick(visit, { selector: selectorOf(el), text: el.textContent });
  };
  const onVisibility = () => {
    if (doc.visibilityState === 'hidden') save();
    else if (!visibleSince) visibleSince = Date.now();
  };
  win.addEventListener('scroll', onScroll, { passive: true });
  doc.addEventListener('click', onClick, true);
  doc.addEventListener('visibilitychange', onVisibility);
  win.addEventListener('pagehide', save);
  onScroll();
  save();
  return () => {
    win.removeEventListener('scroll', onScroll);
    doc.removeEventListener('click', onClick, true);
    doc.removeEventListener('visibilitychange', onVisibility);
    win.removeEventListener('pagehide', save);
  };
}
