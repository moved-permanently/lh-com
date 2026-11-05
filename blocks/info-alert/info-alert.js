/*
 * info-alert: TAP's info alert as www.flytap.com's ("Informação importante": check-in
 * information, insurance, time to think …; tools/reports/tap/parity.md row 63). One cell: a
 * heading (www's H4) and its text or list. Shown as a light info-blue box with Material's info
 * icon beside the text and a close button at the top right. The close hides the alert for this
 * page view only, as www's: nothing is stored, the next load shows it again. Option static: no
 * close button (the alerts www's data marks dismissable: false; row 101). The look:
 * info-alert.css.
 */

/** The close button's name in TAP's languages (English else). */
export const INFO_ALERT_CLOSE = {
  pt: 'Fechar', en: 'Close', es: 'Cerrar', fr: 'Fermer', de: 'Schließen', it: 'Chiudi', pl: 'Zamknij',
};

// Material's info (outlined) and close (300: 1.5 px lines) icons
const INFO = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M11.25 16.75h1.5v-6h-1.5zM12 9.29q.34 0 .57-.23.23-.23.23-.57t-.23-.57Q12.34 7.69 12 7.69t-.57.23q-.23.23-.23.57t.23.57q.23.23.57.23zM12 21.5q-1.97 0-3.7-.75-1.73-.75-3.02-2.03-1.28-1.29-2.03-3.02-.75-1.73-.75-3.7t.75-3.7q.75-1.73 2.03-3.02 1.29-1.28 3.02-2.03Q10.03 2.5 12 2.5t3.7.75q1.73.75 3.02 2.03 1.28 1.29 2.03 3.02.75 1.73.75 3.7t-.75 3.7q-.75 1.73-2.03 3.02-1.29 1.28-3.02 2.03-1.73.75-3.7.75zm0-1.5q3.35 0 5.68-2.33Q20 15.35 20 12t-2.32-5.68Q15.35 4 12 4T6.33 6.32Q4 8.65 4 12t2.33 5.67Q8.65 20 12 20z"/></svg>';
const CLOSE = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false"><path d="m6.4 18.65-1.05-1.05L10.95 12 5.35 6.4 6.4 5.35 12 10.95l5.6-5.6 1.05 1.05L13.05 12l5.6 5.6-1.05 1.05L12 13.05z"/></svg>';

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const text = document.createElement('div');
  text.className = 'info-alert-text';
  text.append(...cell.childNodes);
  const icon = document.createElement('span');
  icon.className = 'info-alert-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = INFO;
  const body = document.createElement('div');
  body.className = 'info-alert-body';
  body.append(icon, text);
  // option static: an alert www shows without its close button (its data's dismissable: false,
  // row 101)
  if (block.classList.contains('static')) {
    block.replaceChildren(body);
    return;
  }
  const lang = (document.documentElement.lang || '').slice(0, 2);
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'info-alert-close';
  close.setAttribute('aria-label', INFO_ALERT_CLOSE[lang] || INFO_ALERT_CLOSE.en);
  close.innerHTML = CLOSE;
  // www: closed for this view, back on the next load (nothing stored)
  close.addEventListener('click', () => { block.hidden = true; });
  block.replaceChildren(close, body);
}
