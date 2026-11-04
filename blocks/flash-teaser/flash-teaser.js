/*
 * flash-teaser: the one-line strip of current travel information, alerts and promotions at the
 * top of the homepage content (live .dcep-flash-teaser), from the Message Center index
 * (scripts/message-center.js). One message per slide; several rotate every 7 s, with www's
 * countdown ring around play/pause. The tap variant (flash-teaser tap, placed by
 * scripts/alerts-bar.js above TAP's header): www.flytap.com's alerts bar, flash-teaser-tap.js.
 */
import {
  messageLocale, loadIndex, loadCtiPages, selectMessages, messageHref, readTypes, ICONS, iconOf,
} from '../../scripts/message-center.js';

/** A message stays up 7 s (www); the countdown ring fills over this time. */
export const ROTATION_MS = 7000;

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
  ru: {
    title: 'Актуальная информация о поездке, уведомления и акции',
    stepper: 'Сообщение {CURRENT} из {TOTAL}',
    critical: 'Внимание',
    promo: 'Акция',
    previous: 'Предыдущее сообщение',
    next: 'Следующее сообщение',
    start: 'Запустить прокрутку',
    stop: 'Остановить прокрутку',
  },
  zh: {
    title: '最新出行信息、提醒和优惠',
    stepper: '第 {CURRENT} 条，共 {TOTAL} 条',
    critical: '注意',
    promo: '优惠',
    previous: '上一条消息',
    next: '下一条消息',
    start: '开始轮播',
    stop: '停止轮播',
  },
  pl: {
    title: 'Aktualne informacje o podróży, komunikaty i promocje',
    stepper: 'Wiadomość {CURRENT} z {TOTAL}',
    critical: 'Uwaga',
    promo: 'Promocja',
    previous: 'Poprzednia wiadomość',
    next: 'Następna wiadomość',
    start: 'Uruchom przewijanie',
    stop: 'Zatrzymaj przewijanie',
  },
  // Korean (kr/ko; the wording of www where it has one, the capture of 2026-11-03)
  ko: {
    title: '최신 여행 정보, 알림 및 프로모션',
    stepper: '메시지 {CURRENT}/{TOTAL}',
    critical: '주의',
    promo: '프로모션',
    previous: '이전 메시지',
    next: '다음 메시지',
    start: '슬라이드 자동 재생 시작',
    stop: '슬라이드 자동 재생 중지',
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

// previous / next as www: up / down chevrons, stacked
const CONTROL_ICONS = {
  up: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M5.6 15.4 4.2 14 12 6.2l7.8 7.8-1.4 1.4L12 9z"/></svg>',
  down: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M18.4 8.6 19.8 10 12 17.8 4.2 10l1.4-1.4L12 15z"/></svg>',
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

/** The countdown ring's circumference (r 11.25 in a 24 x 24 box, www's .dcep-flash-teaser). */
const RING_R = 11.25;
const RING_C = 2 * Math.PI * RING_R;
/** The message goes out for 0.2 s before the next comes in (www). */
const LEAVE_MS = 200;
/** A frame further than this from the last one (a hidden tab, a stalled page) counts this much. */
const MAX_FRAME_MS = 100;

const SVG_NS = 'http://www.w3.org/2000/svg';

/** www's countdown: a track and the progress circle, rotated to start at 12 o'clock. */
function ring() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'flash-teaser-ring');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const circle = (cls) => {
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('class', cls);
    c.setAttribute('cx', '12');
    c.setAttribute('cy', '12');
    c.setAttribute('r', String(RING_R));
    c.setAttribute('fill', 'none');
    c.setAttribute('stroke-width', '1.5');
    return c;
  };
  const track = circle('flash-teaser-ring-track');
  const progress = circle('flash-teaser-ring-progress');
  progress.setAttribute('stroke-dasharray', RING_C.toFixed(2));
  progress.setAttribute('stroke-dashoffset', RING_C.toFixed(2));
  svg.append(track, progress);
  return { svg, progress };
}

/**
 * The strip: one slide per message; with two or more, www's controls (left to right: the countdown
 * ring with play/pause, the pager "1/2", previous/next stacked from 1025px). One clock drives ring
 * and rotation: the ring fills over ROTATION_MS (requestAnimationFrame, so a hidden tab pauses
 * both), full brings the next message (LEAVE_MS out, then in) and the ring starts empty again.
 * Hover on the message and pause hold the progress; previous/next, arrow keys, swipe and focus in
 * a message stop the rotation (the ring empty, the play icon; play starts it again). Reduced motion
 * starts stopped.
 * @param {Array} messages
 * @param {Object} labels
 * @param {Array} ctiRows
 * @param {Object} locale
 * @param {{now?: Function, raf?: Function, caf?: Function, reducedMotion?: boolean}} [env] the
 *   clock and frame source (tests inject their own), whether the visitor prefers reduced motion
 * @returns {{region: Element, labels: Function}}
 */
export function buildStrip(messages, labels, ctiRows, locale, env = {}) {
  const now = env.now || (() => window.performance.now());
  const raf = env.raf || ((fn) => window.requestAnimationFrame(fn));
  const caf = env.caf || ((id) => window.cancelAnimationFrame(id));
  const reducedMotion = env.reducedMotion !== undefined ? env.reducedMotion
    : Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

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
      item.classList.remove('is-leaving');
      item.hidden = !active;
      item.querySelectorAll('a').forEach((a) => { a.tabIndex = active ? 0 : -1; });
    });
    current = i;
    setStyle();
  };
  show(0);
  if (messages.length < 2) return { region, labels: () => {} };

  // controls, left to right as www: the ring with play/pause, the pager, previous / next
  const controls = el('div', 'flash-teaser-controls');
  const button = (name, icon) => {
    const b = el('button', `flash-teaser-button flash-teaser-${name}`);
    b.type = 'button';
    b.innerHTML = CONTROL_ICONS[icon];
    return b;
  };
  const timer = el('div', 'flash-teaser-timer');
  const { svg, progress } = ring();
  const toggle = button('toggle', 'pause');
  timer.append(svg, toggle);
  const pager = el('span', 'flash-teaser-pager');
  pager.setAttribute('aria-hidden', 'true');
  const page = el('span', 'flash-teaser-page');
  pager.append(page, document.createTextNode(`/${messages.length}`));
  const nav = el('div', 'flash-teaser-nav');
  const prev = button('previous', 'up');
  const next = button('next', 'down');
  nav.append(prev, next);
  const status = el('div', 'flash-teaser-sr-only flash-teaser-status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  controls.append(timer, pager, nav);
  container.append(controls);
  region.append(status);

  let lbl = labels;
  let playing = !reducedMotion;
  let held = false;
  let elapsed = 0;
  let leaving = null;
  let frame = null;
  let last = null;

  const updatePager = (roll) => {
    const digit = el('span', `flash-teaser-page-number${roll ? ' is-rolling' : ''}`, String(current + 1));
    page.replaceChildren(digit);
  };
  const render = () => {
    progress.setAttribute('stroke-dashoffset', (RING_C * (1 - elapsed / ROTATION_MS)).toFixed(2));
  };
  const go = (i, announce) => {
    // the focused slide is hidden by the change: focus moves to the link of the new one (keys
    // keep working; the buttons keep their own focus)
    const slideFocused = slides.contains(document.activeElement);
    show((i + messages.length) % messages.length);
    if (slideFocused) items[current].querySelector('a')?.focus({ preventScroll: true });
    updatePager(true);
    if (announce) {
      const msg = items[current].textContent.trim();
      status.textContent = `${stepper(lbl, current + 1, messages.length)}. ${msg}`;
    }
  };
  const setToggle = () => {
    toggle.innerHTML = CONTROL_ICONS[playing ? 'pause' : 'play'];
    toggle.dataset.state = playing ? 'pause' : 'play';
    toggle.setAttribute('aria-label', playing ? lbl.stop : lbl.start);
  };
  const tick = () => {
    frame = null;
    const t = now();
    const dt = Math.min(Math.max(t - last, 0), MAX_FRAME_MS);
    last = t;
    if (leaving !== null) {
      leaving += dt;
      if (leaving >= LEAVE_MS) {
        leaving = null;
        elapsed = 0;
        go(current + 1, false);
      }
    } else {
      elapsed = Math.min(ROTATION_MS, elapsed + dt);
      if (elapsed >= ROTATION_MS) {
        leaving = 0;
        items[current].classList.add('is-leaving');
      }
    }
    render();
    // eslint-disable-next-line no-use-before-define
    schedule();
  };
  // the clock runs only while the ring fills: playing and not held
  const schedule = () => {
    const running = playing && !held;
    slides.setAttribute('aria-live', running ? 'off' : 'polite');
    if (running && frame === null) {
      // the clock counts from now, not from its first frame
      if (last === null) last = now();
      frame = raf(tick);
    }
    if (!running) {
      if (frame !== null) caf(frame);
      frame = null;
      last = null;
    }
  };
  // a visitor's own move: the rotation stops, the ring empties, play starts it again
  const userStop = () => {
    playing = false;
    elapsed = 0;
    if (leaving !== null) items[current].classList.remove('is-leaving');
    leaving = null;
    render();
    setToggle();
    schedule();
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
  prev.addEventListener('click', () => { go(current - 1, true); userStop(); });
  next.addEventListener('click', () => { go(current + 1, true); userStop(); });
  toggle.addEventListener('click', () => {
    playing = !playing;
    setToggle();
    status.textContent = playing ? lbl.start : lbl.stop;
    schedule();
  });
  slides.addEventListener('mouseenter', () => { held = true; schedule(); });
  slides.addEventListener('mouseleave', () => { held = false; schedule(); });
  // keyboard focus moving into a message is a visitor's own move (the controls are not)
  slides.addEventListener('focusin', () => { if (playing || elapsed) userStop(); });
  region.addEventListener('keydown', (e) => {
    const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    if (!back && !forward) return;
    e.preventDefault();
    go(current + (forward ? 1 : -1), true);
    userStop();
  });
  let touchX = null;
  region.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  region.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) { go(current + (dx < 0 ? 1 : -1), true); userStop(); }
  }, { passive: true });
  setLabels(labels);
  updatePager(false);
  render();
  schedule();
  return { region, labels: setLabels };
}

/** The tap variant: www.flytap.com's alerts bar, or nothing (the bar removed) without alerts. */
async function decorateTap(block, locale) {
  const [rows, ctiRows, tap] = await Promise.all([loadIndex(), loadCtiPages(), import('./flash-teaser-tap.js')]);
  const messages = selectMessages(rows, { market: locale.country, lang: locale.lang, types: ['irreg', 'tech-outage'] });
  const wrapper = block.closest('.alerts-bar');
  block.dataset.messages = String(messages.length);
  if (!messages.length) {
    if (wrapper) wrapper.remove();
    else block.closest('.flash-teaser-wrapper')?.classList.add('flash-teaser-empty');
    return;
  }
  block.append(tap.buildTapBar(messages, ctiRows, locale).region);
  if (wrapper) tap.keepHeaderBelow(wrapper);
}

export default async function decorate(block) {
  // lh-com and the sites with roots: getLocale(); the sites without: the page's language
  const locale = messageLocale();
  const types = readTypes(block);
  block.textContent = '';
  if (block.classList.contains('tap')) {
    await decorateTap(block, locale);
    return;
  }
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
  const view = buildStrip(messages, labels, ctiRows, locale);
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
