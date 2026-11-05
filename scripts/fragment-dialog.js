/*
 * A page's link that opens a fragment as a dialog (every brand): a link to a document under
 * /modals/ (the block collection's modal convention, e.g. /ch/en/modals/general-conditions) opens
 * that document in a modal <dialog> instead of navigating, as www opens the General Conditions
 * under its fares and offers. showModal() makes the rest of the page inert; the focus moves to the
 * close button and Tab stays inside; Escape (the dialog's cancel), the close button and a click on
 * the backdrop close it and the focus returns to the link. The dialog is named by the document's
 * first heading (else by the link). A modifier key (a new tab) or a document that does not load
 * keep the link a link.
 */

import { loadCSS } from './aem.js';
import { uiIcon } from './lh-icons.js';

export const CLOSE_LABELS = {
  en: 'Close',
  de: 'Schließen',
  fr: 'Fermer',
  it: 'Chiudi',
  es: 'Cerrar',
  nl: 'Sluiten',
  pt: 'Fechar',
  pl: 'Zamknij',
  el: 'Κλείσιμο',
  ru: 'Закрыть',
  ja: '閉じる',
  zh: '关闭',
  ko: '닫기',
};

const MODAL_PATH = /\/modals\//;
let count = 0;
let cssLoaded;

/** Whether a link opens its document as a dialog: this site's, under /modals/. */
export function isDialogLink(a) {
  try {
    const url = new URL(a.getAttribute('href'), window.location.href);
    return url.origin === window.location.origin && MODAL_PATH.test(url.pathname);
  } catch (e) {
    return false;
  }
}

/** styles/fragment-dialog.css, once (from the first link on the page, else the first open) */
function ensureStyles() {
  if (cssLoaded || !window.hlx) return;
  cssLoaded = loadCSS(`${window.hlx.codeBasePath}/styles/fragment-dialog.css`);
}

async function loadDocument(path) {
  // eslint-disable-next-line import/no-cycle
  const { loadFragment } = await import('../blocks/fragment/fragment.js');
  return loadFragment(path);
}

/**
 * Opens a document as a modal dialog.
 * @param {string} path the document's path
 * @param {Element} trigger the link (the focus returns to it)
 * @param {{load?: Function}} [options] load(path): the document's decorated main (tests)
 * @returns {Promise<HTMLDialogElement|null>} null when the document does not load
 */
export async function openFragmentDialog(path, trigger, { load = loadDocument } = {}) {
  ensureStyles();
  const content = await load(path).catch(() => null);
  if (!content) return null;
  const lang = (document.documentElement.lang || 'en').slice(0, 2);
  count += 1;
  const dialog = document.createElement('dialog');
  dialog.className = 'fragment-dialog';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'fragment-dialog-close';
  close.setAttribute('aria-label', CLOSE_LABELS[lang] || CLOSE_LABELS.en);
  close.append(uiIcon('close'));
  const body = document.createElement('div');
  body.className = 'fragment-dialog-body';
  body.append(...content.children);
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.id = heading.id || `fragment-dialog-title-${count}`;
    dialog.setAttribute('aria-labelledby', heading.id);
  } else {
    dialog.setAttribute('aria-label', (trigger && trigger.textContent.trim()) || path);
  }
  dialog.append(close, body);

  close.addEventListener('click', () => dialog.close());
  // the backdrop: a click on the dialog element itself, outside its content
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  // Tab and Shift+Tab stay inside: the page behind is inert, and the focus would leave for the
  // browser's own controls
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const nodes = [...dialog.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')];
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  });
  dialog.addEventListener('close', () => {
    dialog.remove();
    document.body.classList.remove('fragment-dialog-open');
    if (trigger && trigger.isConnected) trigger.focus();
  });

  document.body.append(dialog);
  document.body.classList.add('fragment-dialog-open');
  dialog.showModal();
  close.focus();
  return dialog;
}

/**
 * The page's links to /modals/ open their documents as dialogs.
 * @param {Document} doc
 * @param {{open?: Function}} [options] open(path, link): openFragmentDialog (tests)
 */
export function initFragmentDialogs(doc = document, { open = openFragmentDialog } = {}) {
  const links = [...doc.querySelectorAll('a[href*="/modals/"]')].filter(isDialogLink);
  links.forEach((a) => a.setAttribute('aria-haspopup', 'dialog'));
  if (links.length) ensureStyles();
  let opening = false;
  doc.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || !isDialogLink(a)) return;
    const modified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
    if (e.defaultPrevented || e.button !== 0 || modified) return;
    e.preventDefault();
    if (opening) return;
    opening = true;
    const { pathname } = new URL(a.getAttribute('href'), window.location.href);
    open(pathname, a).then((dialog) => {
      if (!dialog) window.location.href = a.href;
    }).finally(() => { opening = false; });
  });
}
