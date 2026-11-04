/*
 * hero-campaign option slider on brand tap (TAP Air Portugal), as www.flytap.com's homepage stage
 * (/pt-pt, 2026-11-04; its swiper: autoplay every 5 s, on after a click, paused while the
 * pointer is over it): www's green wedge (top left) and line (bottom right) on every slide, a
 * desktop and a phone shape each as www draws them; previous, dots and next in one group; a pause
 * button that stops and restarts the rotation. Under prefers-reduced-motion nothing rotates (the
 * button shows the stage as paused and starts it on request). A stage of one slide (pl-pl) gets
 * the stripes only. The look: styles/themes/tap.css.
 */

/** www's swiper: autoplay { delay: 5e3 } */
export const ROTATION_MS = 5000;

/** The pause button's labels in TAP's languages (English for any other). */
export const TAP_STAGE_LABELS = {
  pt: { pause: 'Parar a rotação dos destaques', play: 'Retomar a rotação dos destaques' },
  en: { pause: 'Pause the slideshow', play: 'Resume the slideshow' },
  es: { pause: 'Pausar el carrusel', play: 'Reanudar el carrusel' },
  fr: { pause: 'Mettre le carrousel en pause', play: 'Reprendre le carrousel' },
  de: { pause: 'Diashow anhalten', play: 'Diashow fortsetzen' },
  it: { pause: 'Metti in pausa il carosello', play: 'Riprendi il carosello' },
  pl: { pause: 'Wstrzymaj pokaz slajdów', play: 'Wznów pokaz slajdów' },
};

// www's shapes (the slide's absolute left-0 top-0 / bottom-0 right-0 layers), lg:block and
// lg:hidden: the wide one from 1024 px, the narrow one below
const WEDGE = '<svg class="hero-campaign-stripe-wide" xmlns="http://www.w3.org/2000/svg" width="491" height="281" viewBox="0 0 491 281" fill="none" focusable="false"><path d="M491 0L0 281V0H491Z" fill="#65C922"/></svg>'
  + '<svg class="hero-campaign-stripe-narrow" xmlns="http://www.w3.org/2000/svg" width="207" height="118" viewBox="0 0 207 118" fill="none" focusable="false"><path d="M207 0L0 118V0H207Z" fill="#65C922"/></svg>';
const LINE = '<svg class="hero-campaign-stripe-wide" xmlns="http://www.w3.org/2000/svg" width="928" height="302" viewBox="0 0 928 302" fill="none" focusable="false"><path d="M1.93164 348.062L802.611 7.58585C818.256 0.932251 836.375 0.932251 852.02 7.58585L1652.7 348.062" stroke="#9EFD38" stroke-width="5"/></svg>'
  + '<svg class="hero-campaign-stripe-narrow" xmlns="http://www.w3.org/2000/svg" width="343" height="91" viewBox="0 0 343 91" fill="none" focusable="false"><path d="M-62 150.473L238.502 5.12972C244.374 2.28942 251.174 2.28942 257.046 5.12972L557.548 150.473" stroke="#9EFD38" stroke-width="5"/></svg>';

/**
 * The rotation: advance() every delay ms while running.
 * @param {{advance: Function, delay?: number, timers?: {setInterval: Function,
 *   clearInterval: Function}}} opts
 * @returns {{start: Function, stop: Function, running: Function}}
 */
export function createRotation({ advance, delay = ROTATION_MS, timers = window }) {
  let id = null;
  return {
    start() {
      if (id !== null) return;
      id = timers.setInterval(advance, delay);
      // (a runtime whose timers keep it alive, as the tests' Node: the rotation alone does not)
      if (id && typeof id.unref === 'function') id.unref();
    },
    stop() {
      if (id === null) return;
      timers.clearInterval(id);
      id = null;
    },
    running: () => id !== null,
  };
}

function stripe(className, markup) {
  const layer = document.createElement('div');
  layer.className = className;
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = markup;
  return layer;
}

/**
 * TAP's slider parts on a built slider (hero-campaign.js buildSlider).
 * @param {Element} block the slider
 * @param {{slides: Element[], track: Element, prev: Element, next: Element, dots: Element,
 *   goTo: Function, current: Function, lang: string}} parts
 */
export default function decorateTapSlider(block, {
  slides, track, prev, next, dots, goTo, current, lang,
}) {
  block.classList.add('hero-campaign-tap');
  slides.forEach((slide) => {
    const media = slide.querySelector('.hero-campaign-media') || slide;
    media.after(stripe('hero-campaign-stripe-wedge', WEDGE), stripe('hero-campaign-stripe-line', LINE));
  });
  // one slide: nothing to rotate or step through
  if (slides.length < 2) {
    block.classList.add('hero-campaign-single');
    block.replaceChildren(track);
    return;
  }

  const controls = document.createElement('div');
  controls.className = 'hero-campaign-controls';
  controls.append(prev, dots, next);

  const labels = TAP_STAGE_LABELS[lang] || TAP_STAGE_LABELS.en;
  const pause = document.createElement('button');
  pause.type = 'button';
  pause.className = 'hero-campaign-pause';
  pause.setAttribute('aria-controls', track.id);

  const rotation = createRotation({ advance: () => goTo(current() + 1) });
  let paused = false;
  const show = () => {
    pause.setAttribute('aria-pressed', String(paused));
    pause.setAttribute('aria-label', paused ? labels.play : labels.pause);
    block.classList.toggle('hero-campaign-paused', paused);
  };
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  paused = Boolean(reduced);
  show();
  if (!paused) rotation.start();
  pause.addEventListener('click', () => {
    paused = !paused;
    if (paused) rotation.stop();
    else rotation.start();
    show();
  });
  // www's pauseOnMouseEnter (the button's state stays as the visitor set it)
  block.addEventListener('mouseenter', () => rotation.stop());
  block.addEventListener('mouseleave', () => { if (!paused) rotation.start(); });
  // a keyboard visitor inside the stage: no slide moves under the focus
  block.addEventListener('focusin', () => rotation.stop());
  block.addEventListener('focusout', (e) => {
    if (!paused && !block.contains(e.relatedTarget)) rotation.start();
  });

  block.replaceChildren(track, controls, pause);
}
