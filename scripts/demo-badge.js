/**
 * Demo badge (brief 389): once a visitor has acknowledged the showcase notice
 * (scripts/showcase-notice.js), a small label fixed in the bottom right corner of every page says
 * it on: "DEMO", then "Not a <brand> website" (the brand's own name, scripts/brands.js; Lufthansa
 * on lh-com), in English on every locale.
 *
 * - Started in the delayed phase (scripts/scripts.js loadDelayed) on demo hosts when the notice's
 *   acknowledgement is stored, and by the notice's "I understand" (it shrinks from the dialog into
 *   the corner; without storage the badge stays for that page view). Where the notice applies only
 *   (noticeApplies: not in DA authoring contexts, inside iframes or under /tools/).
 * - Site flag demo-badge (scripts/flags.js, the site's /config/flags sheet): on by default; only a
 *   row with off or false turns it off. A missing or unreadable sheet: on.
 * - Layout: position fixed (nothing shifts), the page's body font (no font of its own), about
 *   24 px high, no pointer events. It moves up above whatever is fixed or sticky at its corner
 *   (the cookie banner, a chat button, a sticky booking bar, TAP's call-back button), looked at
 *   on resize, scroll and once a second; under an overlay that covers most of the screen (an open
 *   menu) it hides until that closes.
 * - Accessibility: the label is aria-hidden (it moves, and its two parts would read apart); the
 *   same words, "Demo: not a <brand> website.", are a visually hidden paragraph right before
 *   <main>, read once in the page's order. Nothing in it is focusable.
 */
import { loadCSS } from './aem.js';
import { brandName } from './brand.js';
import { loadFlags } from './flags.js';
import { noticeApplies } from './showcase-scope.js';

export const FLAG = 'demo-badge';
export const BADGE_TAG = 'DEMO';

/** The 12 px the stylesheet keeps from the viewport's edges, and the gap above an obstacle. */
const EDGE = 12;
const GAP = 8;
/** An obstacle reaching above this share of the viewport hides the badge. */
const OVERLAY = 0.4;

const metadata = (name) => {
  const meta = document.head && document.head.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  return meta ? meta.content : '';
};

/** "Not a <brand> website". */
export const badgeText = (read = metadata) => `Not a ${brandName(read)} website`;

/**
 * Whether the site's flags leave the badge on: no row or any value but off / false.
 * @param {Map<string, string>|null} flags (scripts/flags.js: names and values trimmed, lower case)
 */
export function badgeFlagOn(flags) {
  const value = flags && flags.get(FLAG);
  return value !== 'off' && value !== 'false';
}

/**
 * Where the badge goes: lifted above the highest obstacle at its corner, hidden under one that
 * reaches over most of the viewport.
 * @param {{top: number, bottom: number}} rect the badge's rectangle at its place
 * @param {number} viewportHeight
 * @param {Array<{top: number}>} obstacles fixed or sticky boxes under that rectangle
 * @returns {{lift: number, hidden: boolean}}
 */
export function placement(rect, viewportHeight, obstacles) {
  if (!obstacles.length) return { lift: 0, hidden: false };
  const top = Math.min(...obstacles.map((o) => o.top));
  if (top < viewportHeight * OVERLAY) return { lift: 0, hidden: true };
  return { lift: Math.max(0, Math.round(viewportHeight - top + GAP - EDGE)), hidden: false };
}

/** Something to read or use: text, a control, a frame or a picture. */
const CONTENT = 'a[href], button, input, select, textarea, iframe, img, svg, video, [tabindex], [role="button"]';
const isEmptyLayer = (el) => !el.textContent.trim() && !el.querySelector(CONTENT);

/**
 * The fixed or sticky boxes under a rectangle (its corners and centre), outside the badge.
 * @param {{top: number, bottom: number, left: number, right: number}} rect
 * @param {Document} doc
 * @param {Element} self the badge
 * @param {Function} [style] getComputedStyle
 */
export function obstaclesAt(rect, doc, self, style = (el) => window.getComputedStyle(el)) {
  const points = [
    [rect.left + 2, rect.top + 2], [rect.right - 2, rect.top + 2], [rect.left + 2, rect.bottom - 2],
    [rect.right - 2, rect.bottom - 2], [(rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2],
  ];
  const found = new Set();
  points.forEach(([x, y]) => {
    (doc.elementsFromPoint ? doc.elementsFromPoint(x, y) : []).forEach((hit) => {
      if (self && self.contains(hit)) return;
      const top = [doc.body, doc.documentElement];
      for (let el = hit; el && !top.includes(el); el = el.parentElement) {
        const { position } = style(el);
        if (position === 'fixed' || position === 'sticky') {
          // an empty backdrop (OneTrust's dark filter) hides nothing the badge could cover
          if (!isEmptyLayer(el)) found.add(el);
          return;
        }
      }
    });
  });
  return [...found].map((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom };
  });
}

let shown = false;
let stopWatching = () => {};

/** Forgets the page's badge and stops watching its corner (tests). */
export function resetDemoBadge() {
  stopWatching();
  stopWatching = () => {};
  shown = false;
}

function build(read) {
  const badge = document.createElement('div');
  badge.className = 'demo-badge';
  badge.lang = 'en';
  badge.setAttribute('lang', 'en');
  badge.setAttribute('aria-hidden', 'true');
  const tag = document.createElement('span');
  tag.className = 'demo-badge-tag';
  tag.textContent = BADGE_TAG;
  const text = document.createElement('span');
  text.className = 'demo-badge-text';
  text.textContent = badgeText(read);
  badge.append(tag, text);

  const sr = document.createElement('p');
  sr.className = 'demo-badge-sr';
  sr.setAttribute('lang', 'en');
  sr.textContent = `Demo: not a ${brandName(read)} website.`;
  return { badge, sr };
}

/** Keeps the badge clear of what is fixed or sticky at its corner. */
function watch(badge) {
  let frame = 0;
  let size = null;
  let current = { lift: -1, hidden: false };
  const place = () => {
    frame = 0;
    if (!size) {
      const r = badge.getBoundingClientRect ? badge.getBoundingClientRect() : { width: 0 };
      if (!r.width) return;
      size = { width: r.width, height: r.height };
    }
    // the badge's resting place (from the viewport, so neither its lift nor its transition count)
    const bottom = window.innerHeight - EDGE;
    const right = document.documentElement.clientWidth - EDGE;
    const rest = {
      top: bottom - size.height, bottom, left: right - size.width, right,
    };
    let next = { lift: 0, hidden: false };
    // a lifted badge can meet the next obstacle (a chat button above the cookie banner)
    for (let i = 0; i < 3; i += 1) {
      const at = {
        ...rest, top: rest.top - next.lift, bottom: rest.bottom - next.lift,
      };
      const found = placement(at, window.innerHeight, obstaclesAt(at, document, badge));
      if (found.hidden) {
        next = found;
        break;
      }
      if (found.lift <= next.lift) break;
      next = found;
    }
    if (next.lift === current.lift && next.hidden === current.hidden) return;
    current = next;
    badge.hidden = next.hidden;
    badge.style.setProperty('--demo-badge-lift', `${next.lift}px`);
  };
  const soon = () => {
    if (!frame) frame = window.requestAnimationFrame(place);
  };
  if (!window.requestAnimationFrame) return;
  window.addEventListener('resize', soon, { passive: true });
  window.addEventListener('scroll', soon, { passive: true });
  const timer = window.setInterval(() => {
    if (document.visibilityState !== 'hidden') soon();
  }, 1000);
  stopWatching = () => {
    window.clearInterval(timer);
    window.removeEventListener('resize', soon);
    window.removeEventListener('scroll', soon);
  };
  place();
}

/** From the notice's dialog into the corner (not with reduced motion). */
function shrinkFrom(badge, from) {
  if (!from || !badge.animate || !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const to = badge.getBoundingClientRect();
  if (!to.width || !to.height) return;
  const dx = (from.left + from.width / 2) - (to.left + to.width / 2);
  const dy = (from.top + from.height / 2) - (to.top + to.height / 2);
  const scale = Math.min(4, Math.max(1, from.width / to.width));
  badge.animate([
    { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.2 },
    { transform: 'none', opacity: 1 },
  ], { duration: 450, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
}

/**
 * Shows the badge once per page view, where the notice applies and the site's flag is on.
 * @param {{from?: DOMRect, loadStyles?: Function, read?: Function}} [options] from: the notice's
 *   dialog, to shrink from; loadStyles and read: tests
 * @returns {Promise<Element|null>} the badge, or null
 */
export default async function showDemoBadge({
  from = null, loadStyles = loadCSS, read = metadata,
} = {}) {
  if (shown || !noticeApplies()) return null;
  shown = true;
  if (!badgeFlagOn(await loadFlags())) return null;
  await loadStyles(`${window.hlx.codeBasePath}/styles/demo-badge.css`);
  const { badge, sr } = build(read);
  const main = document.querySelector('main');
  if (main) main.before(sr);
  else document.body.prepend(sr);
  document.body.append(badge);
  watch(badge);
  shrinkFrom(badge, from);
  return badge;
}
