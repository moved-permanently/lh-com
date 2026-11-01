/**
 * OF1 on the de/en homepage after a few tracked visits (scripts/of1/index.js):
 * - the button: a section in the site's design (heading, text, button) to /of1?personalize=1
 *   with a short summary of the visit as q; our own markup, built from text (OF1's inject_cta
 *   HTML is never inserted);
 * - the in-place rewrite: POST /api/personalize (same origin, lh-edge forwards to OF1) with the
 *   hero's headline, subhead and call to action and the next section headings (T0 to T5) and the
 *   behaviour profile; of the NDJSON answer only `mutation` lines of ids we sent are applied, as
 *   text (a link's first text node), never to prices, links' targets or form fields, and only
 *   when the answer is complete within BUDGET_MS: on any error, timeout or empty answer the
 *   published text stays.
 */

export const TENANT = 'moved-permanently/lh-com';
export const MAX_ELEMENTS = 6;
export const BUDGET_MS = 2500;
const MAX_TEXT = 300;

// a price or an amount: never sent, never written
const PRICE = /[€$£¥]|\b(EUR|USD|GBP|CHF)\b|\d+[.,]?\d*\s*(€|EUR)|\bmiles?\b\s*\d|\d\s*(meilen|miles)/i;
// blocks whose texts are data, prices or forms
const SKIP = '.of1-notice, form, .flight-search, .fare-teaser, .destination-finder, .destination-offer, .price, [class*="price"], [data-lh-source]';
// the hero blocks: their headline, eyebrow (subhead) and call to action
const HERO = '.hero-card-overlay, .hero, .stage, .stage-promotions, .teaser-hero';

const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
const usable = (el) => el && !el.closest(SKIP) && text(el)
  && text(el).length <= MAX_TEXT && !PRICE.test(text(el));

/**
 * The elements to personalise, in order: the first hero's headline, subhead and call to action,
 * then the headings of the sections' own content; at most MAX_ELEMENTS, ids T0..T5.
 * @param {Element} main
 * @returns {{id: string, el: Element, tag: string, text: string}[]}
 */
export function pickElements(main) {
  const picked = [];
  const hero = [...main.querySelectorAll(HERO)].find((b) => !b.closest(SKIP));
  if (hero) {
    picked.push(hero.querySelector('h1, h2, h3'));
    picked.push(hero.querySelector('[class$="-eyebrow"], h1 + p, h2 + p, h3 + p'));
    picked.push(hero.querySelector('a.button, p.link-wrapper a, .button-container a'));
  }
  main.querySelectorAll('.default-content-wrapper h1, .default-content-wrapper h2, .default-content-wrapper h3')
    .forEach((h) => picked.push(h));
  return picked.filter((el, i) => usable(el) && picked.indexOf(el) === i)
    .slice(0, MAX_ELEMENTS)
    .map((el, i) => ({
      id: `T${i}`, el, tag: el.tagName.toLowerCase(), text: text(el),
    }));
}

/** OF1's /api/personalize body for the elements and the visitor's profile. */
export function personalizeBody(elements, payload) {
  const profile = payload.intentProfile || { intents: [], topIntent: 'exploring' };
  return {
    id: TENANT,
    index: 'publish',
    elements: Object.fromEntries(elements.map((e) => [e.id, { tag: e.tag, text: e.text }])),
    behaviorProfile: {
      interests: (payload.interests || []).map(({ topic, score }) => ({ topic, score })),
      intent: profile.topIntent,
      intentScores: (profile.intents || []).slice(0, 3)
        .map(({ category, score }) => ({ category, score })),
    },
  };
}

/** The mutations to apply: `mutation` lines of ids we sent, a plain text without prices. */
export function mutationsFrom(lines, ids) {
  return lines
    .filter((l) => l && l.type === 'mutation' && ids.includes(l.id) && typeof l.new === 'string')
    .map((l) => ({ id: l.id, text: l.new.replace(/\s+/g, ' ').trim() }))
    .filter((m) => m.text && m.text.length <= MAX_TEXT && !PRICE.test(m.text));
}

/**
 * Writes the texts: the element's own text, or its first text node when it holds elements.
 * @param {Array} [undo] gets [text node, published text] per change
 */
export function applyMutations(elements, mutations, undo = []) {
  let applied = 0;
  mutations.forEach(({ id, text: value }) => {
    const target = elements.find((e) => e.id === id);
    if (!target) return;
    const { el } = target;
    const walker = el.ownerDocument.createTreeWalker(el, 4 /* NodeFilter.SHOW_TEXT */);
    let node = walker.nextNode();
    while (node && !node.textContent.trim()) node = walker.nextNode();
    if (!el.children.length) {
      // the element's text: one text node (a published text split over several stays whole)
      if (!node) return;
      undo.push([node, node.textContent]);
      el.replaceChildren(node);
    } else if (!node) {
      return;
    } else {
      undo.push([node, node.textContent]);
    }
    node.textContent = value;
    applied += 1;
  });
  return applied;
}

/** Reads an NDJSON stream into objects (unreadable lines skipped). */
async function readLines(body, signal) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const lines = [];
  let rest = '';
  const take = (chunk) => chunk.split('\n').forEach((l) => {
    if (!l.trim()) return;
    try {
      lines.push(JSON.parse(l));
    } catch (e) {
      // not a JSON line
    }
  });
  const onAbort = () => reader.cancel().catch(() => {});
  signal.addEventListener('abort', onAbort);
  try {
    for (;;) {
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();
      if (signal.aborted) throw new Error('timeout');
      if (done) break;
      rest += decoder.decode(value, { stream: true });
      const cut = rest.lastIndexOf('\n');
      if (cut >= 0) {
        take(rest.slice(0, cut));
        rest = rest.slice(cut + 1);
      }
      if (lines.some((l) => l && l.type === 'done')) break;
    }
  } finally {
    signal.removeEventListener('abort', onAbort);
  }
  take(rest);
  return lines;
}

/**
 * Rewrites the page's texts in place for the visitor's profile.
 * @returns {Promise<{applied: number, error?: string, undo: Function}>} undo: the published
 *   texts back
 */
export async function personalizeInPlace({
  main, payload, fetchImpl = (...a) => fetch(...a), budgetMs = BUDGET_MS,
}) {
  const elements = pickElements(main);
  const changes = [];
  const undo = () => changes.splice(0).forEach(([node, value]) => { node.textContent = value; });
  if (!elements.length) return { applied: 0, error: 'no elements', undo };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), budgetMs);
  try {
    const resp = await fetchImpl('/api/personalize', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(personalizeBody(elements, payload)),
      credentials: 'same-origin',
      signal: controller.signal,
    });
    if (!resp.ok || !resp.body) return { applied: 0, error: `status ${resp.status}`, undo };
    const lines = await readLines(resp.body, controller.signal);
    if (controller.signal.aborted) return { applied: 0, error: 'timeout', undo };
    const mutations = mutationsFrom(lines, elements.map((e) => e.id));
    return { applied: applyMutations(elements, mutations, changes), undo };
  } catch (e) {
    return { applied: 0, error: controller.signal.aborted ? 'timeout' : e.message, undo };
  } finally {
    clearTimeout(timer);
  }
}

const el = (tag, className, value) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
};

/**
 * The button's section: a heading, a line of text and a button to /of1?personalize=1 (q: the
 * visit's summary), in the site's default content and button styles.
 */
export function buildButton(payload) {
  const section = el('div', 'section grey of1-notice-container');
  const wrapper = el('div', 'default-content-wrapper of1-notice');
  const href = new URL('/of1', 'https://x.invalid');
  href.searchParams.set('personalize', '1');
  if (payload.query) href.searchParams.set('q', payload.query);
  const link = el('a', 'button primary', 'Show my page');
  link.href = `${href.pathname}${href.search}`;
  const action = el('p', 'button-container');
  action.append(link);
  wrapper.append(
    el('h2', '', 'A page for what you looked at'),
    el('p', '', 'We can put together a page from the pages you visited on this site, just for you.'),
    action,
  );
  section.append(wrapper);
  section.dataset.sectionStatus = 'loaded';
  return section;
}
