/*
 * flash-teaser: the one-line strip of current travel information, alerts and promotions at the
 * top of the homepage content (live .dcep-flash-teaser), from the Message Center index
 * (scripts/message-center.js). One message per slide; several rotate every 7 s.
 */
import { getLocale } from '../../scripts/locale.js';
import {
  loadIndex, loadCtiPages, selectMessages, messageHref, readTypes, ICONS, iconOf,
} from '../../scripts/message-center.js';

const ROTATION_MS = 7000;

/** Built-in copies of the live bundle labels/flashteaser (recorded 2026-10-25). */
const LABELS = {
  en: {
    title: 'Current travel information, alerts and promotions',
    stepper: 'Message {CURRENT} of {TOTAL}',
    critical: 'Attention',
    promo: 'Promotion',
    previous: 'Previous message',
    next: 'Next message',
    start: 'Start slider rotation',
    stop: 'Stop slider rotation',
  },
  de: {
    title: 'Aktuelle Reiseinformationen, Warnmeldungen und Angebote',
    stepper: 'Meldung {CURRENT} von {TOTAL}',
    critical: 'Achtung',
    promo: 'Angebot',
    previous: 'Vorherige Meldung',
    next: 'Nächste Meldung',
    start: 'Automatischen Meldungswechsel starten',
    stop: 'Automatischen Meldungswechsel stoppen',
  },
  it: {
    title: 'Informazioni di viaggio aggiornate, avvisi e promozioni',
    stepper: 'Messaggio {CURRENT} di {TOTAL}',
    critical: 'Attenzione',
    promo: 'Promozione',
    previous: 'Messaggio precedente',
    next: 'Messaggio successivo',
    start: 'Avvia la rotazione',
    stop: 'Ferma la rotazione',
  },
  fr: {
    title: 'Informations voyage actuelles, alertes et promotions',
    stepper: 'Message {CURRENT} sur {TOTAL}',
    critical: 'Attention',
    promo: 'Promotion',
    previous: 'Message précédent',
    next: 'Message suivant',
    start: 'Démarrer le défilement',
    stop: 'Arrêter le défilement',
  },
  es: {
    title: 'Información de viaje actual, avisos y promociones',
    stepper: 'Mensaje {CURRENT} de {TOTAL}',
    critical: 'Atención',
    promo: 'Promoción',
    previous: 'Mensaje anterior',
    next: 'Mensaje siguiente',
    start: 'Iniciar la rotación',
    stop: 'Detener la rotación',
  },
  nl: {
    title: 'Actuele reisinformatie, meldingen en acties',
    stepper: 'Bericht {CURRENT} van {TOTAL}',
    critical: 'Let op',
    promo: 'Actie',
    previous: 'Vorig bericht',
    next: 'Volgend bericht',
    start: 'Rotatie starten',
    stop: 'Rotatie stoppen',
  },
  pt: {
    title: 'Informações de viagem atuais, alertas e promoções',
    stepper: 'Mensagem {CURRENT} de {TOTAL}',
    critical: 'Atenção',
    promo: 'Promoção',
    previous: 'Mensagem anterior',
    next: 'Próxima mensagem',
    start: 'Iniciar a rotação',
    stop: 'Parar a rotação',
  },
  el: {
    title: 'Τρέχουσες ταξιδιωτικές πληροφορίες, ειδοποιήσεις και προσφορές',
    stepper: 'Μήνυμα {CURRENT} από {TOTAL}',
    critical: 'Προσοχή',
    promo: 'Προσφορά',
    previous: 'Προηγούμενο μήνυμα',
    next: 'Επόμενο μήνυμα',
    start: 'Έναρξη εναλλαγής',
    stop: 'Διακοπή εναλλαγής',
  },
  ja: {
    title: '最新の運航情報・お知らせ・キャンペーン',
    stepper: 'メッセージ {CURRENT}/{TOTAL}',
    critical: 'ご注意',
    promo: 'キャンペーン',
    previous: '前のメッセージ',
    next: '次のメッセージ',
    start: '自動切り替えを開始',
    stop: '自動切り替えを停止',
  },
};
const LIVE_KEYS = {
  title: 'flashteaser.sr.labels.title',
  stepper: 'flashteaser.sr.labels.stepper',
  critical: 'flashteaser.sr.labels.critical',
  promo: 'flashteaser.sr.labels.promo',
  previous: 'flashteaser.sr.navigation.previousMessage',
  next: 'flashteaser.sr.navigation.nextMessage',
  start: 'flashteaser.sr.timer.startRotation',
  stop: 'flashteaser.sr.timer.stopRotation',
};

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const stepper = (labels, current, total) => labels.stepper
  .replace('{CURRENT}', current).replace('{TOTAL}', total);

const CONTROL_ICONS = {
  previous: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M15.4 5.6 14 4.2 6.2 12l7.8 7.8 1.4-1.4L9 12z"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8.6 18.4 10 19.8l7.8-7.8L10 4.2 8.6 5.6 15 12z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>',
};

function buildSlide(msg, index, total, labels, ctiRows, locale) {
  const slide = el('div', 'flash-teaser-slide');
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', stepper(labels, index + 1, total));
  slide.dataset.type = msg.type;
  slide.dataset.criticality = msg.criticality;
  const href = messageHref(msg, ctiRows, locale);
  const link = el(href ? 'a' : 'span', 'flash-teaser-link');
  if (href) link.href = href;
  const icon = el('span', `flash-teaser-icon flash-teaser-icon-${iconOf(msg)}`);
  icon.innerHTML = ICONS[iconOf(msg)];
  const text = el('span', 'flash-teaser-text', msg.headline);
  // screen readers hear "Attention:" / "Promotion:" before the headline, as on live
  let prefix = null;
  if (msg.criticality === 'high' && msg.type !== 'promo') prefix = labels.critical;
  else if (msg.type === 'promo') prefix = labels.promo;
  if (prefix) {
    const sr = el('span', 'flash-teaser-sr-only', `${prefix}: `);
    sr.dataset.label = msg.type === 'promo' ? 'promo' : 'critical';
    link.append(icon, sr, text);
  } else {
    link.append(icon, text);
  }
  slide.append(link);
  return slide;
}

/** The "Attention:" / "Promotion:" prefixes of the slides in the current labels. */
function slidePrefixes(items, labels) {
  items.forEach((item) => {
    const sr = item.querySelector('.flash-teaser-sr-only');
    if (sr) sr.textContent = `${sr.dataset.label === 'promo' ? labels.promo : labels.critical}: `;
  });
}

function strip(messages, labels, ctiRows, locale) {
  const region = el('div', 'flash-teaser-strip');
  region.setAttribute('role', 'region');
  region.setAttribute('aria-roledescription', 'carousel');
  region.setAttribute('aria-label', labels.title);
  const container = el('div', 'flash-teaser-bar');
  const slides = el('div', 'flash-teaser-slides');
  // WAI carousel: no announcements while it rotates by itself, polite when the visitor moves it
  slides.setAttribute('aria-live', messages.length > 1 ? 'off' : 'polite');
  const items = messages.map((m, i) => buildSlide(m, i, messages.length, labels, ctiRows, locale));
  slides.append(...items);
  container.append(slides);
  region.append(container);

  let current = 0;
  const setStyle = () => {
    const msg = messages[current];
    region.dataset.type = msg.type;
    region.dataset.criticality = msg.criticality;
  };
  const show = (i) => {
    items.forEach((item, n) => {
      const active = n === i;
      item.classList.toggle('is-active', active);
      item.hidden = !active;
      item.querySelectorAll('a').forEach((a) => { a.tabIndex = active ? 0 : -1; });
    });
    current = i;
    setStyle();
  };
  show(0);
  if (messages.length < 2) return { region, labels: () => {} };

  // controls: pager "n / total", previous / next (from 1025px), start / stop rotation
  const controls = el('div', 'flash-teaser-controls');
  const pager = el('span', 'flash-teaser-pager');
  pager.setAttribute('aria-hidden', 'true');
  const button = (name) => {
    const b = el('button', `flash-teaser-button flash-teaser-${name}`);
    b.type = 'button';
    b.innerHTML = CONTROL_ICONS[name];
    return b;
  };
  const prev = button('previous');
  const next = button('next');
  const toggle = button('pause');
  const status = el('div', 'flash-teaser-sr-only flash-teaser-status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  controls.append(pager, prev, next, toggle);
  container.append(controls);
  region.append(status);

  let timer = null;
  let stopped = false;
  let hovered = false;
  let focused = false;
  let lbl = labels;
  const updatePager = () => { pager.textContent = `${current + 1} / ${messages.length}`; };
  const go = (i, announce) => {
    // the focused slide is hidden by the change: focus moves to the link of the new one (keys
    // keep working; the buttons keep their own focus)
    const slideFocused = slides.contains(document.activeElement);
    show((i + messages.length) % messages.length);
    if (slideFocused) items[current].querySelector('a')?.focus({ preventScroll: true });
    updatePager();
    if (announce) {
      const msg = items[current].textContent.trim();
      status.textContent = `${stepper(lbl, current + 1, messages.length)}. ${msg}`;
    }
  };
  const halt = () => { clearInterval(timer); timer = null; };
  const run = () => {
    halt();
    if (!stopped && !hovered && !focused) {
      timer = setInterval(() => go(current + 1, false), ROTATION_MS);
    }
    slides.setAttribute('aria-live', timer ? 'off' : 'polite');
  };
  const setToggle = () => {
    toggle.innerHTML = CONTROL_ICONS[stopped ? 'play' : 'pause'];
    toggle.setAttribute('aria-label', stopped ? lbl.start : lbl.stop);
  };
  const setLabels = (l) => {
    lbl = l;
    region.setAttribute('aria-label', l.title);
    prev.setAttribute('aria-label', l.previous);
    next.setAttribute('aria-label', l.next);
    items.forEach((item, i) => item.setAttribute('aria-label', stepper(l, i + 1, messages.length)));
    slidePrefixes(items, l);
    setToggle();
  };
  prev.addEventListener('click', () => { go(current - 1, true); run(); });
  next.addEventListener('click', () => { go(current + 1, true); run(); });
  toggle.addEventListener('click', () => {
    stopped = !stopped;
    setToggle();
    status.textContent = stopped ? lbl.stop : lbl.start;
    run();
  });
  region.addEventListener('mouseenter', () => { hovered = true; run(); });
  region.addEventListener('mouseleave', () => { hovered = false; run(); });
  region.addEventListener('focusin', () => { focused = true; run(); });
  region.addEventListener('focusout', (e) => {
    if (!region.contains(e.relatedTarget)) { focused = false; run(); }
  });
  region.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(current - 1, true); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(current + 1, true); }
  });
  let touchX = null;
  region.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  region.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) { go(current + (dx < 0 ? 1 : -1), true); run(); }
  }, { passive: true });
  // the rotation stops for visitors who ask for less motion (they can start it)
  stopped = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setLabels(labels);
  updatePager();
  run();
  return { region, labels: setLabels };
}

export default async function decorate(block) {
  const locale = getLocale();
  const types = readTypes(block);
  block.textContent = '';
  const [rows, ctiRows] = await Promise.all([loadIndex(), loadCtiPages()]);
  const messages = selectMessages(rows, { market: locale.country, lang: locale.lang, types });
  if (!messages.length) {
    // nothing to show: no strip, no space
    block.closest('.flash-teaser-wrapper')?.classList.add('flash-teaser-empty');
    block.dataset.messages = '0';
    return;
  }
  block.dataset.messages = String(messages.length);
  const labels = { ...(LABELS[locale.lang] || LABELS.en) };
  const view = strip(messages, labels, ctiRows, locale);
  block.append(view.region);
  // the live label bundle (the built-in copies are the same texts; only screen reader labels):
  // scripts/lh-api.js loaded here, not with the block, so the visible strip doesn't wait for it
  import('../../scripts/lh-api.js').then(({ fetchLabels }) => fetchLabels(['flashteaser'], locale)).then((live) => {
    const picked = Object.fromEntries(Object.entries(LIVE_KEYS)
      .filter(([, k]) => live.labels[k]).map(([key, k]) => [key, live.labels[k]]));
    if (Object.keys(picked).length) {
      const merged = { ...labels, ...picked };
      view.labels(merged);
      view.region.setAttribute('aria-label', merged.title);
      const slides = [...view.region.querySelectorAll('.flash-teaser-slide')];
      if (messages.length < 2) slidePrefixes(slides, merged);
    }
  }).catch(() => {});
}
