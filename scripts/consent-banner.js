/**
 * Fallback cookie banner, shown only when OneTrust does not run (see consent.js).
 * Markup, texts and layout reproduce Lufthansa's OneTrust banner (template
 * "[LUFTHANSA]-GDPR Custom Template", otCenterRounded) and a reduced preference center.
 * Texts: OneTrust domain data 01994cb2-af99-7dbe-8fb0-56427773e54e, languages de and en.
 */

import { loadCSS } from './aem.js';
import { BRANDS, brandOf } from './brand.js';

const TEXTS = {
  en: {
    title: 'Privacy Settings',
    intro: 'We use cookies and similar technologies that are necessary to run our apps and websites. With your consent to one or more of the following processing purposes, you agree on the use of additional cookies and similar technologies which are required to fulfil the respective purpose:',
    purposes: [
      ['Analytics and Statistics', 'We monitor our app and website to measure and improve their performance and evaluate the efficiency of our marketing campaigns.'],
      ['App and Website Personalization', 'We track and analyze your online interactions (e.g. searches, clicks, chatbot interactions) to offer you products and services which meet your interests.'],
      ['Advertising', 'We personalize online and social advertising by using collected data, building customer segments, sharing data with social media and advertising platforms, and embedding third-party content.'],
    ],
    special: 'You can withdraw or manage your consent at any time with future effect in the "Change Consent Settings" - section of the website footer.',
    links: [
      ['Privacy Policy', 'https://www.lufthansa.com/xx/en/data-protection-information?hidebanner=true'],
      ['Cookie Policy', 'https://www.lufthansa.com/xx/en/cookie-policy?hidebanner=true'],
      ['Imprint', 'https://www.lufthansa.com/xx/en/imprint?hidebanner=true'],
    ],
    manage: 'Manage preferences',
    reject: 'Only necessary',
    accept: 'Accept all',
    pcTitle: 'Privacy settings',
    save: 'Save preferences',
    close: 'Close preference center',
    alwaysActive: 'Always Active',
    groups: {
      C0001: ['Strictly Necessary Cookies', ['These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work. These cookies do not store any personally identifiable information.']],
      C0002: ['Analytics and Statistics', ['Performing aggregated analytics of our digital touchpoints.', 'Monitoring website traffic.', 'Measuring marketing channel performance.']],
      C0004: ['App and Website Personalization', ['Tracking interactions from previous and current visits on our apps and websites', 'Analyzing digital behavior, purchase and service interaction history', 'Determining digital preferences and providing personalized products and services on our apps and websites']],
      C0005: ['Advertising', ['Using collected data to increase the relevance and personalize online and social advertising', 'Building segments on specific customer groups to reconnect with our products along the whole customer journey', 'Sharing specific customer data with advertising and social media partners to match our customers interests', 'Embedding 3rd party content on our digital touchpoints']],
    },
  },
  de: {
    title: 'Privatsphäre-Einstellungen',
    intro: 'Wir verwenden Cookies und ähnliche Technologien, die für den Betrieb unserer Apps und Internetseiten erforderlich sind. Mit Ihrer Zustimmung zu einem oder mehreren der folgenden Verarbeitungszwecke stimmen Sie der Verwendung zusätzlicher Cookies und ähnlicher Technologien zu, die zur Erfüllung des jeweiligen Zwecks erforderlich sind:',
    purposes: [
      ['Analyse und Statistik', 'Wir analysieren unsere App und Internetseite, um deren Leistung zu messen und zu verbessern und die Effizienz unserer Marketingkampagnen zu bewerten.'],
      ['Personalisierung von Apps und Internetseiten', 'Wir verfolgen und analysieren Ihre Online-Interaktionen (z. B. Suchen, Klicks, Chatbot-Interaktionen), um Ihnen Produkte und Services anzubieten, die Ihren Interessen entsprechen.'],
      ['Werbung', 'Wir personalisieren Online- und Social-Media-Werbung, indem wir erhobene Daten verwenden, Kundensegmente erstellen, Daten mit Social-Media- und Werbeplattformen teilen und Inhalte Dritter einbetten.'],
    ],
    special: 'Sie können Ihre Einwilligung jederzeit mit zukünftiger Wirkung im Abschnitt "Einwilligungseinstellungen ändern“ in der Fußzeile der Internetseite widerrufen oder verwalten.',
    links: [
      ['Datenschutzrichtlinie', 'https://www.lufthansa.com/de/de/informationen-zum-datenschutz?hidebanner=true'],
      ['Cookie-Richtlinie', 'https://www.lufthansa.com/xx/de/cookie-policy?hidebanner=true'],
      ['Impressum', 'https://www.lufthansa.com/de/de/impressum?hidebanner=true'],
    ],
    manage: 'Präferenzen verwalten',
    reject: 'Nur erforderliche',
    accept: 'Alle akzeptieren',
    pcTitle: 'Privatsphäre-Einstellungen',
    save: 'Präferenzen speichern',
    close: 'Präferenzen speichern',
    alwaysActive: 'Immer aktiv',
    groups: {
      C0001: ['Unbedingt erforderliche Cookies', ['Diese Cookies sind zur Funktion der Website erforderlich und können in Ihren Systemen nicht deaktiviert werden. In der Regel werden diese Cookies nur als Reaktion auf von Ihnen getätigte Aktionen gesetzt, die einer Dienstanforderung entsprechen, wie etwa dem Festlegen Ihrer Datenschutzeinstellungen, dem Anmelden oder dem Ausfüllen von Formularen. Sie können Ihren Browser so einstellen, dass diese Cookies blockiert oder Sie über diese Cookies benachrichtigt werden. Einige Bereiche der Website funktionieren dann aber nicht. Diese Cookies speichern keine personenbezogenen Daten.']],
      C0002: ['Analyse und Statistik', ['Durchführung aggregierter Analysen unserer digitalen Kontaktpunkte.', 'Überwachung des Datenverkehrs auf der Website.', 'Messung der Performance von Marketingkanälen.']],
      C0004: ['Personalisierung von Apps und Websites', ['Nachverfolgung von Interaktionen von früheren und aktuellen Besuchen unserer Apps und Websites.', 'Analyse der Historie von digitalem Verhalten, Kauf- und Serviceinteraktionen.', 'Ermittlung digitaler Präferenzen und Bereitstellung personalisierter Produkte und Services auf unseren Apps und Websites.']],
      C0005: ['Werbung', ['Nutzung der erfassten Daten zur Steigerung der Relevanz und Personalisierung von Online- und Social-Media-Werbung.', 'Segmentierung der Kund:innen in bestimmte Gruppen, um sie während der gesamten Customer Journey wieder mit unseren Produkten in Kontakt zu bringen.', 'Weitergabe bestimmter Kundendaten an Werbe- und Social-Media-Partner, um den Interessen unserer Kund:innen gerecht zu werden.', 'Einbindung von Inhalten von Drittanbietern in unsere digitalen Kontaktpunkte.']],
    },
  },
};

const NECESSARY = 'C0001';
const GROUP_ORDER = ['C0001', 'C0002', 'C0004', 'C0005'];
const SVG_NS = 'http://www.w3.org/2000/svg';

let root;
let cssLoaded;
let lastFocus;

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') node.className = value;
    else if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value);
  });
  node.append(...children.flat(Infinity).filter((child) => child !== null && child !== undefined));
  return node;
}

/** the arrow Lufthansa's icon font draws in front of the banner links */
function arrow() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 9 21');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M.75 10.5h7M5 7.25l3.25 3.25L5 13.75');
  svg.append(path);
  return el('span', { className: 'lh-consent-arrow' }, svg);
}

const LINK_KEYS = ['privacy', 'cookies', 'imprint'];

/**
 * The banner's privacy, cookie and imprint links: lh-com's (www.lufthansa.com), a brand's own
 * pages on its www (scripts/brands.js consentLinks; English for other languages; a page the
 * brand lacks is left out).
 * @param {string} lang the page language
 * @param {Function} [read] metadata reader
 * @returns {Array<[string, string]>}
 */
export function bannerLinks(lang, read) {
  const { links } = TEXTS[lang] || TEXTS.en;
  const key = brandOf(read);
  const own = key && BRANDS[key].consentLinks;
  if (!own) return links;
  const urls = own[lang] || own.en;
  return links.map(([label], i) => [label, urls[LINK_KEYS[i]]]).filter(([, href]) => href);
}

function texts() {
  const lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  return { ...(TEXTS[lang] || TEXTS.en), links: bannerLinks(lang) };
}

/** banner description: intro, purposes, withdrawal note */
function description(t) {
  return [
    el('p', { text: t.intro }),
    t.purposes.map(([heading, text]) => [el('h3', { text: heading }), el('p', { text })]),
    el('p', { className: 'lh-consent-special', text: t.special }),
  ];
}

function arrowLink(label, href) {
  return el('a', { href, target: '_blank', rel: 'noopener noreferrer' }, arrow(), label);
}

function trapFocus(dialog) {
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])')]
      .filter((node) => node.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

/** Removes the fallback banner. */
export function removeConsentBanner() {
  if (!root) return;
  root.remove();
  root = null;
  if (lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true });
}

function finish(onChoice, groups) {
  removeConsentBanner();
  onChoice(groups);
}

function buildBanner(t, { onChoice, openPreferences }) {
  const manage = el('a', { href: '#', className: 'lh-consent-manage' }, arrow(), t.manage);
  manage.addEventListener('click', (e) => {
    e.preventDefault();
    openPreferences();
  });

  const reject = el('button', { type: 'button', className: 'lh-consent-reject', text: t.reject });
  const accept = el('button', { type: 'button', className: 'lh-consent-accept', text: t.accept });
  reject.addEventListener('click', () => finish(onChoice, [NECESSARY]));
  accept.addEventListener('click', () => finish(onChoice, GROUP_ORDER));

  const dialog = el(
    'div',
    {
      className: 'lh-consent-banner',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'lh-consent-title',
      'aria-describedby': 'lh-consent-text',
      tabindex: '0',
    },
    el(
      'div',
      { className: 'lh-consent-container' },
      el(
        'div',
        { className: 'lh-consent-group' },
        el('h2', { id: 'lh-consent-title', className: 'lh-consent-title', text: t.title }),
        el(
          'div',
          { id: 'lh-consent-text', className: 'lh-consent-text' },
          description(t),
          el(
            'div',
            { className: 'lh-consent-links' },
            t.links.map(([label, href]) => el('div', {}, arrowLink(label, href))),
            el('div', {}, manage),
          ),
        ),
      ),
      el('div', { className: 'lh-consent-actions' }, el('div', { className: 'lh-consent-buttons' }, reject, accept)),
    ),
  );
  return dialog;
}

function buildPreferences(t, { onChoice, groups }) {
  const items = GROUP_ORDER.map((id) => {
    const [name, details] = t.groups[id];
    const necessary = id === NECESSARY;
    const input = el('input', {
      type: 'checkbox',
      id: `lh-consent-group-${id}`,
      value: id,
      'aria-describedby': `lh-consent-desc-${id}`,
    });
    input.checked = necessary || groups.includes(id);
    input.disabled = necessary;
    const toggle = el('button', {
      type: 'button',
      className: 'lh-consent-toggle',
      'aria-expanded': 'false',
      'aria-controls': `lh-consent-desc-${id}`,
      'aria-label': name,
    });
    const desc = el(
      'div',
      { id: `lh-consent-desc-${id}`, className: 'lh-consent-group-desc', hidden: '' },
      details.length > 1 ? el('ul', {}, details.map((text) => el('li', { text }))) : el('p', { text: details[0] }),
    );
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      desc.hidden = !open;
    });
    return el(
      'li',
      { className: 'lh-consent-item' },
      el(
        'div',
        { className: 'lh-consent-item-header' },
        el('label', { for: input.id }, input, el('span', { text: name })),
        necessary ? el('span', { className: 'lh-consent-always', text: t.alwaysActive }) : null,
        toggle,
      ),
      desc,
    );
  });

  const selected = (dialog) => [...dialog.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
  const close = el('button', { type: 'button', className: 'lh-consent-close', 'aria-label': t.close });
  const save = el('button', { type: 'button', className: 'lh-consent-save', text: t.save });
  const accept = el('button', { type: 'button', className: 'lh-consent-accept-all', text: t.accept });

  const dialog = el(
    'div',
    {
      className: 'lh-consent-pc',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'lh-consent-pc-title',
      tabindex: '-1',
    },
    el('div', { className: 'lh-consent-pc-header' }, close),
    el(
      'div',
      { className: 'lh-consent-pc-content' },
      el('h2', { id: 'lh-consent-pc-title', className: 'lh-consent-pc-title', text: t.pcTitle }),
      el(
        'div',
        { className: 'lh-consent-pc-desc' },
        description(t),
        el('div', { className: 'lh-consent-links' }, t.links.map(([label, href]) => el('div', {}, arrowLink(label, href)))),
      ),
      el('ul', { className: 'lh-consent-groups' }, items),
    ),
    el('div', { className: 'lh-consent-pc-footer' }, save, accept),
  );
  // closing the preference center saves the current selection, like OneTrust
  close.addEventListener('click', () => finish(onChoice, selected(dialog)));
  save.addEventListener('click', () => finish(onChoice, selected(dialog)));
  accept.addEventListener('click', () => finish(onChoice, GROUP_ORDER));
  return dialog;
}

/**
 * Shows the fallback banner (or its preference center).
 * @param {Object} options
 * @param {string} [options.view] 'banner' or 'preferences'
 * @param {string[]} [options.groups] currently accepted categories
 * @param {Function} options.onChoice receives the accepted categories
 */
export async function showConsentBanner({ view = 'banner', groups = [NECESSARY], onChoice }) {
  if (!cssLoaded) cssLoaded = loadCSS(`${window.hlx.codeBasePath}/styles/consent-banner.css`);
  await cssLoaded;
  removeConsentBanner();
  lastFocus = document.activeElement;

  const t = texts();
  const lang = t === TEXTS.de ? 'de' : 'en';
  root = el('div', { className: 'lh-consent', lang, 'data-nosnippet': 'true' }, el('div', { className: 'lh-consent-overlay' }));
  const render = (which) => {
    const current = root.querySelector('.lh-consent-banner, .lh-consent-pc');
    const dialog = which === 'preferences'
      ? buildPreferences(t, { onChoice, groups })
      : buildBanner(t, { onChoice, openPreferences: () => render('preferences') });
    trapFocus(dialog);
    if (current) current.replaceWith(dialog);
    else root.append(dialog);
    const target = which === 'preferences' ? dialog.querySelector('.lh-consent-close') : dialog;
    target.focus({ preventScroll: true });
  };
  document.body.append(root);
  render(view);
}
