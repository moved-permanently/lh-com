/**
 * Showcase notice: a modal telling visitors that this replica is a technical showcase, not an
 * official Lufthansa website. English on every locale and channel (website, FlyNet, app view).
 *
 * - Loaded from loadDelayed() (scripts/scripts.js), about 3.5 s after load: no LCP impact.
 * - Native <dialog> opened with showModal(). Escape does not close it (the cancel event is
 *   prevented, closedby="none" where supported, and a close without the button reopens it);
 *   only the "I understand" button does.
 * - The button stores the acknowledgement in localStorage 'lh-showcase-acknowledged': the
 *   notice shows once per browser for every page and locale. Without storage the button still
 *   closes it for the current page view.
 * - Never shown in DA authoring contexts (isAuthoringContext), inside iframes or under /tools/.
 * - Independent of the consent banner (scripts/consent.js): whichever shows first is handled
 *   first, the other works afterwards.
 */
import { loadCSS } from './aem.js';
import { isAuthoringContext } from './consent.js';

export const STORAGE_KEY = 'lh-showcase-acknowledged';

const TEXT = {
  title: 'Technical showcase',
  text: 'This page is a technical showcase, not an official Lufthansa website. It is for demonstration purposes only.',
  button: 'I understand',
};

let shown = false;

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
  const dialog = document.createElement('dialog');
  dialog.className = 'showcase-notice';
  dialog.lang = 'en';
  dialog.setAttribute('aria-labelledby', 'showcase-notice-title');
  dialog.setAttribute('aria-describedby', 'showcase-notice-text');
  dialog.setAttribute('closedby', 'none');

  const title = document.createElement('h2');
  title.id = 'showcase-notice-title';
  title.className = 'showcase-notice-title';
  title.textContent = TEXT.title;

  const text = document.createElement('p');
  text.id = 'showcase-notice-text';
  text.className = 'showcase-notice-text';
  text.textContent = TEXT.text;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button primary showcase-notice-button';
  button.textContent = TEXT.button;

  dialog.append(title, text, button);
  return { dialog, button };
}

/**
 * Shows the notice once per page view, unless acknowledged or not applicable.
 */
export default async function showShowcaseNotice() {
  if (shown || !shouldShowNotice()) return;
  shown = true;
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
