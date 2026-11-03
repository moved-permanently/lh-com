/**
 * Showcase notice: a modal telling visitors that this replica is a technical showcase, not an
 * official website of the site's brand (Lufthansa; Discover Airlines on lh-discover:
 * scripts/brand.js). English on every locale and channel (website, FlyNet, app view); a brand
 * whose entry asks for it (scripts/brands.js showcaseNotice 'page': TAP) in the page's language
 * where the notice has texts for it (NOTICE_TEXTS), English otherwise.
 *
 * - Started from the end of loadEager() (scripts/scripts.js) at a fixed early time, 1.8 s after
 *   navigation start (at once when the first section took longer): it no longer opens in the
 *   middle of the lazy phase at a time that varies from load to load.
 * - Native <dialog> opened with showModal(). Escape does not close it (the cancel event is
 *   prevented, closedby="none" where supported, and a close without the button reopens it);
 *   only the "I understand" button does.
 * - The button stores the acknowledgement in localStorage 'lh-showcase-acknowledged': the
 *   notice shows once per browser for every page and locale. Without storage the button still
 *   closes it for the current page view.
 * - Never shown in DA authoring contexts (isAuthoringContext), inside iframes or under /tools/.
 * - Independent of the consent banner (scripts/consent.js): whichever shows first is handled
 *   first, the other works afterwards.
 * - Not while a form field has the focus (the modal would take the keys typed into it): it
 *   opens when the focus leaves the fields; nobody typing, at its time.
 */
import { loadCSS } from './aem.js';
import { isAuthoringContext } from './consent.js';
import { brandName, brandOf, BRANDS } from './brand.js';

export const STORAGE_KEY = 'lh-showcase-acknowledged';

/** The notice's texts per language: English everywhere, TAP's languages for TAP (brief 320). */
export const NOTICE_TEXTS = {
  en: {
    title: 'Technical showcase',
    text: (brand) => `This page is a technical showcase, not an official ${brand} website. It is for demonstration purposes only.`,
    button: 'I understand',
  },
  pt: {
    title: 'Demonstração técnica',
    text: (brand) => `Esta página é uma demonstração técnica, não um website oficial da ${brand}. Destina-se apenas a fins de demonstração.`,
    button: 'Compreendo',
  },
  es: {
    title: 'Demostración técnica',
    text: (brand) => `Esta página es una demostración técnica, no un sitio web oficial de ${brand}. Solo tiene fines demostrativos.`,
    button: 'Entendido',
  },
  fr: {
    title: 'Démonstration technique',
    text: (brand) => `Cette page est une démonstration technique, et non un site web officiel de ${brand}. Elle sert uniquement à des fins de démonstration.`,
    button: 'J\'ai compris',
  },
  de: {
    title: 'Technische Demo',
    text: (brand) => `Diese Seite ist eine technische Demo, keine offizielle Website von ${brand}. Sie dient nur zu Demonstrationszwecken.`,
    button: 'Verstanden',
  },
  it: {
    title: 'Dimostrazione tecnica',
    text: (brand) => `Questa pagina è una dimostrazione tecnica, non un sito web ufficiale di ${brand}. Serve solo a scopo dimostrativo.`,
    button: 'Ho capito',
  },
  pl: {
    title: 'Prezentacja techniczna',
    text: (brand) => `Ta strona jest prezentacją techniczną, a nie oficjalną witryną ${brand}. Służy wyłącznie do celów demonstracyjnych.`,
    button: 'Rozumiem',
  },
};

/**
 * The notice's language and texts: English, or on a brand with showcaseNotice 'page' the page's
 * language (htmlLang's language part) where NOTICE_TEXTS has it.
 * @param {Object|null} brand the page's brand entry (null: lh-com)
 * @param {string} htmlLang the page's <html lang>
 */
export function noticeTexts(brand, htmlLang) {
  const own = String(htmlLang || '').slice(0, 2).toLowerCase();
  const lang = brand && brand.showcaseNotice === 'page' && NOTICE_TEXTS[own] ? own : 'en';
  const t = NOTICE_TEXTS[lang];
  return {
    lang, title: t.title, text: t.text(brand ? brand.name : brandName()), button: t.button,
  };
}

let shown = false;

// the controls a visitor types into
const TYPING = 'input:not([type="button"], [type="submit"], [type="reset"], [type="checkbox"], [type="radio"], [type="file"], [type="hidden"], [type="image"], [type="range"], [type="color"]), textarea, select, [contenteditable=""], [contenteditable="true"]';

/** Whether an element is a field the visitor types into. */
export const isTypingIn = (node) => Boolean(node && node.matches && node.matches(TYPING));

/**
 * Resolves once no field has the focus: at once, or when the focus leaves the fields (from
 * field to field it keeps waiting).
 * @param {Document} doc
 * @param {Function} [active] the focused element
 */
export function afterTyping(doc = document, active = () => doc.activeElement) {
  return new Promise((resolve) => {
    if (!isTypingIn(active())) {
      resolve();
      return;
    }
    const check = () => setTimeout(() => {
      if (isTypingIn(active())) return;
      doc.removeEventListener('focusout', check, true);
      resolve();
    }, 0);
    doc.addEventListener('focusout', check, true);
  });
}

function isAcknowledged() {
  try {
    return Boolean(window.localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    return false;
  }
}

function acknowledge() {
  try {
    window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  } catch (e) {
    // storage blocked: the notice closes for this page view only
  }
}

/**
 * Whether the notice applies to the current page view.
 * @returns {boolean}
 */
export function shouldShowNotice() {
  if (isAuthoringContext()) return false;
  if (window.self !== window.top) return false;
  const path = window.location.pathname.replace(/^\/content(?=\/)/, '');
  if (path.startsWith('/tools/')) return false;
  return !isAcknowledged();
}

function buildDialog() {
  const key = brandOf();
  const texts = noticeTexts(key ? BRANDS[key] : null, document.documentElement.lang);
  const dialog = document.createElement('dialog');
  dialog.className = 'showcase-notice';
  dialog.lang = texts.lang;
  dialog.setAttribute('aria-labelledby', 'showcase-notice-title');
  dialog.setAttribute('aria-describedby', 'showcase-notice-text');
  dialog.setAttribute('closedby', 'none');

  const title = document.createElement('h2');
  title.id = 'showcase-notice-title';
  title.className = 'showcase-notice-title';
  title.textContent = texts.title;

  const text = document.createElement('p');
  text.id = 'showcase-notice-text';
  text.className = 'showcase-notice-text';
  text.textContent = texts.text;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button primary showcase-notice-button';
  button.textContent = texts.button;

  dialog.append(title, text, button);
  return { dialog, button };
}

/**
 * Shows the notice once per page view, unless acknowledged or not applicable.
 */
export default async function showShowcaseNotice() {
  if (shown || !shouldShowNotice()) return;
  shown = true;
  await afterTyping();
  await loadCSS(`${window.hlx.codeBasePath}/styles/showcase-notice.css`);

  const { dialog, button } = buildDialog();
  let confirmed = false;
  // Escape (and any other close request) must not dismiss the notice
  dialog.addEventListener('cancel', (e) => e.preventDefault());
  dialog.addEventListener('close', () => {
    // browsers may skip a cancelable cancel event (no user activation): reopen
    if (!confirmed && dialog.isConnected) dialog.showModal();
  });
  button.addEventListener('click', () => {
    confirmed = true;
    acknowledge();
    dialog.close();
    dialog.remove();
    document.documentElement.classList.remove('showcase-notice-open');
  });

  document.body.append(dialog);
  document.documentElement.classList.add('showcase-notice-open');
  dialog.showModal();
}
