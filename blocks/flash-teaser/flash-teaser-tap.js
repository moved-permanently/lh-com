/*
 * flash-teaser's tap variant: www.flytap.com's alerts bar (tools/reports/tap/alerts-spec.md),
 * first on TAP's root homepages above the header (scripts/alerts-bar.js places the block). A
 * white 52 px strip: previous, the pager "1/8", next, the headline (a link to the alerts page
 * #<id>) and "Ver todos" (the alerts page). One alert per slide, looping: www's Swiper with a 5 s
 * autoplay and a 1.2 s horizontal slide, held while the pointer is on the alerts (and here while
 * the focus is in the bar), the arrows don't stop it; reduced motion: no autoplay, no slide.
 */
import { messageHref, ctiPagePath } from '../../scripts/message-center.js';

/** www's Swiper: autoplay delay and slide speed. */
export const AUTOPLAY_MS = 5000;
export const SLIDE_MS = 1200;

/** www's alerts/see-all per language. */
export const SEE_ALL = {
  pt: 'Ver todos',
  en: 'See all',
  es: 'Ver todo',
  fr: 'Voir tous',
  de: 'Alle anzeigen',
  it: 'Veda tutto',
  pl: 'Zobacz wszystkie',
};

/** Screen reader texts (the region, a slide n of N, the arrows), TAP's seven languages. */
const SR = {
  pt: {
    title: 'Alertas e informações', slide: '{CURRENT} de {TOTAL}', previous: 'Alerta anterior', next: 'Próximo alerta',
  },
  en: {
    title: 'Alerts and information', slide: '{CURRENT} of {TOTAL}', previous: 'Previous alert', next: 'Next alert',
  },
  es: {
    title: 'Avisos e información', slide: '{CURRENT} de {TOTAL}', previous: 'Aviso anterior', next: 'Aviso siguiente',
  },
  fr: {
    title: 'Alertes et informations', slide: '{CURRENT} sur {TOTAL}', previous: 'Alerte précédente', next: 'Alerte suivante',
  },
  de: {
    title: 'Warnmeldungen und Informationen', slide: '{CURRENT} von {TOTAL}', previous: 'Vorherige Meldung', next: 'Nächste Meldung',
  },
  it: {
    title: 'Avvisi e informazioni', slide: '{CURRENT} di {TOTAL}', previous: 'Avviso precedente', next: 'Avviso successivo',
  },
  pl: {
    title: 'Ostrzeżenia i informacje', slide: '{CURRENT} z {TOTAL}', previous: 'Poprzednie ostrzeżenie', next: 'Następne ostrzeżenie',
  },
};

// www's 16 x 16 chevrons
const CHEVRONS = {
  prev: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="m10 3-5 5 5 5"/></svg>',
  next: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="m6 3 5 5-5 5"/></svg>',
};

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const nth = (sr, current, total) => sr.slide.replace('{CURRENT}', current).replace('{TOTAL}', total);

/**
 * The bar for a list of messages (selectMessages' order).
 * @param {Object[]} messages
 * @param {Object[]} ctiRows rows of cti-pages.json
 * @param {Object} locale (lang, country)
 * @param {{setTimeout?: Function, clearTimeout?: Function, reducedMotion?: boolean}} [env] timers
 *   (tests inject their own) and whether the visitor prefers reduced motion
 * @param {string} [tenant] default: the site's
 * @returns {{region: Element}}
 */
export function buildTapBar(messages, ctiRows, locale, env = {}, tenant = undefined) {
  const later = env.setTimeout || ((fn, ms) => window.setTimeout(fn, ms));
  const cancel = env.clearTimeout || ((id) => window.clearTimeout(id));
  const reducedMotion = env.reducedMotion !== undefined ? env.reducedMotion
    : Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const sr = SR[locale.lang] || SR.en;
  const total = messages.length;

  const region = el('div', 'flash-teaser-tap-strip');
  region.setAttribute('role', 'region');
  region.setAttribute('aria-roledescription', 'carousel');
  region.setAttribute('aria-label', sr.title);
  const bar = el('div', 'flash-teaser-tap-bar');
  const slides = el('div', 'flash-teaser-tap-slides');
  const items = messages.map((msg, i) => {
    const slide = el('div', 'flash-teaser-tap-slide');
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', nth(sr, i + 1, total));
    const href = messageHref(msg, ctiRows, locale, tenant);
    const link = el(href ? 'a' : 'span', 'flash-teaser-tap-link', msg.headline);
    if (href) link.href = href;
    slide.append(link);
    slide.hidden = i > 0;
    if (i === 0) slide.classList.add('is-active');
    return slide;
  });
  slides.append(...items);
  const page = ctiPagePath(ctiRows, locale, tenant);
  const all = el(page ? 'a' : 'span', 'flash-teaser-tap-all', SEE_ALL[locale.lang] || SEE_ALL.en);
  if (page) all.href = page;
  region.append(bar);
  if (total < 2) {
    slides.setAttribute('aria-live', 'polite');
    bar.append(slides, all);
    return { region };
  }

  const button = (name, label) => {
    const b = el('button', `flash-teaser-tap-${name}`);
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.innerHTML = CHEVRONS[name];
    return b;
  };
  const prev = button('prev', sr.previous);
  const next = button('next', sr.next);
  const pager = el('span', 'flash-teaser-tap-pager', `1/${total}`);
  pager.setAttribute('aria-hidden', 'true');
  // no announcements while it rotates by itself; the arrows' moves are announced
  slides.setAttribute('aria-live', 'off');
  const status = el('div', 'flash-teaser-tap-sr-only');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  bar.append(prev, pager, next, slides, all);
  region.append(status);

  let current = 0;
  let timer = null;
  let leave = null;
  let leaving = null;
  let hover = false;
  let focus = false;

  const settle = () => {
    if (leave !== null) cancel(leave);
    leave = null;
    if (leaving) {
      leaving.hidden = true;
      leaving.classList.remove('is-leaving');
      leaving.style.removeProperty('transform');
      leaving = null;
    }
  };
  const go = (i, dir) => {
    settle();
    const from = items[current];
    current = (i + total) % total;
    const to = items[current];
    from.classList.remove('is-active');
    to.classList.add('is-active');
    to.hidden = false;
    pager.textContent = `${current + 1}/${total}`;
    if (reducedMotion) {
      from.hidden = true;
      return;
    }
    // www's slide: the new alert comes in from the side it is on, the old one goes out the other
    to.classList.add('is-entering');
    to.style.transform = `translateX(${dir * 100}%)`;
    // eslint-disable-next-line no-unused-expressions
    to.offsetWidth;
    to.classList.remove('is-entering');
    to.style.transform = 'translateX(0)';
    from.classList.add('is-leaving');
    from.style.transform = `translateX(${-dir * 100}%)`;
    leaving = from;
    leave = later(settle, SLIDE_MS);
  };
  const schedule = (delay) => {
    if (timer !== null) cancel(timer);
    timer = null;
    if (reducedMotion || hover || focus) return;
    timer = later(() => {
      timer = null;
      go(current + 1, 1);
      schedule(SLIDE_MS + AUTOPLAY_MS);
    }, delay);
  };
  const announce = () => {
    status.textContent = `${nth(sr, current + 1, total)}. ${items[current].textContent.trim()}`;
  };
  prev.addEventListener('click', () => { go(current - 1, -1); announce(); schedule(SLIDE_MS + AUTOPLAY_MS); });
  next.addEventListener('click', () => { go(current + 1, 1); announce(); schedule(SLIDE_MS + AUTOPLAY_MS); });
  slides.addEventListener('mouseenter', () => { hover = true; schedule(); });
  slides.addEventListener('mouseleave', () => { hover = false; schedule(AUTOPLAY_MS); });
  region.addEventListener('focusin', () => { focus = true; schedule(); });
  region.addEventListener('focusout', (e) => {
    if (e.relatedTarget && region.contains(e.relatedTarget)) return;
    focus = false;
    schedule(AUTOPLAY_MS);
  });
  schedule(AUTOPLAY_MS);
  return { region };
}

/**
 * The fixed header bar (blocks/header: position fixed, --header-bar-inset from the top) starts
 * below the alerts bar while that is in view, as on www, and moves up as the bar scrolls away:
 * --alerts-bar-offset on the root, the bar's bottom edge (flash-teaser.css reads it).
 * @param {Element} wrapper the bar's wrapper (scripts/alerts-bar.js)
 */
export function keepHeaderBelow(wrapper) {
  const root = document.documentElement;
  let frame = null;
  const update = () => {
    frame = null;
    const bottom = Math.max(0, Math.round(wrapper.getBoundingClientRect().bottom));
    root.style.setProperty('--alerts-bar-offset', `${bottom}px`);
  };
  const later = () => {
    if (frame === null) frame = window.requestAnimationFrame(update);
  };
  document.body.classList.add('has-alerts-bar');
  update();
  window.addEventListener('scroll', later, { passive: true });
  window.addEventListener('resize', later);
}
