/*
 * The not-found page (404.html) in the language of the path, as live's per market
 * (tools/source-export/not-found/{cc}-{ll}.json, recorded 2026-10-24 from
 * https://www.lufthansa.com/{cc}/{ll}/zz-not-found-check):
 * - English (de/en, gb/en): title, apology with a search field (the live site search), then
 *   Go to Homepage, Book flights, Online check-in, My bookings, the feedback text and
 *   Help & contact.
 * - German (de/de, at/de): title, the same links in German (opened in a new tab, as live), the
 *   feedback text and Zu Hilfe & Kontakt; no apology text and no search field.
 * The locale comes from the path (scripts/locale.js). A path without one of the four locales
 * (e.g. /error.html, where the Form (core) block goes when a submission fails) is English de/en,
 * as live's /error.html is the English not-found page. Help & contact is not migrated and links
 * to www.lufthansa.com. Runs before scripts.js decorates main.
 */
import {
  getLocale, getHomepageUrl, LIVE_ORIGIN, LOCALES,
} from './locale.js';

const TEXT = {
  en: {
    title: 'Page not found',
    intro: 'We’re sorry, but the page you’re looking for could not be found. Enter a search term to find information about the subject or service you are looking for.',
    search: 'Enter search term',
    searchButton: 'Search',
    links: [['Go to Homepage', 'home'], ['Book flights', 'flight-search'], ['Online check-in', 'online-check-in-info'], ['My bookings', 'my-bookings']],
    feedback: 'Were you unable to find the right information or do you wish to give us your feedback? Take a look at our feedback and contact options.',
    help: 'Help & contact',
    newTab: '',
  },
  de: {
    title: 'Seite konnte nicht gefunden werden',
    links: [['Zur Startseite', 'home'], ['Flüge buchen', 'flugsuche'], ['Zum Online Check-in', 'online-check-in-info'], ['Zu Meine Buchungen', 'meine-buchungen']],
    feedback: 'Sie konnten die passende Information nicht finden oder möchten uns Ihr Feedback mitteilen? Werfen Sie einen Blick auf unsere Feedback und Kontaktmöglichkeiten.',
    help: 'Zu Hilfe & Kontakt',
    newTab: 'Der Link wird in einem neuen Browser-Tab geöffnet',
  },
};

/** Locale of the path; a path without a migrated locale gets de/en (live's /error.html). */
function notFoundLocale(pathname = window.location.pathname) {
  const path = pathname.replace(/^\/content(?=\/)/, '');
  const match = path.match(/^\/(?:lhg\/)?([a-z]{2})\/([a-z]{2})(?:\/|$)/);
  return getLocale(match && LOCALES[`${match[1]}/${match[2]}`] ? pathname : '/de/en/');
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  node.append(...children);
  return node;
}

function linkParagraph(label, href, newTab) {
  const a = el('a', { href }, label);
  if (newTab) {
    a.target = '_blank';
    a.rel = 'noopener';
    a.append(el('span', { class: 'not-found-sr-only' }, ` (${newTab})`));
  }
  return el('p', {}, a);
}

function searchForm(locale, t) {
  const input = el('input', {
    type: 'search', id: 'not-found-search', name: 'query', placeholder: t.search, autocomplete: 'off',
  });
  const form = el(
    'form',
    { class: 'not-found-search', role: 'search' },
    el('label', { for: 'not-found-search', class: 'not-found-sr-only' }, t.search),
    input,
    el('button', { type: 'submit', 'aria-label': t.searchButton }, el('img', {
      src: '/icons/search.svg', alt: '', width: '24', height: '24',
    })),
  );
  // hands the term to the live site search, as the footer search does; nothing is sent here
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = input.value.trim();
    if (!term) {
      input.focus();
      return;
    }
    const url = new URL(`${LIVE_ORIGIN}/${locale.key}/support/search/search-result`);
    url.searchParams.set('query', term);
    window.location.href = url.href;
  });
  return form;
}

export default function buildNotFound(main = document.querySelector('main')) {
  if (!main) return;
  const locale = notFoundLocale();
  const t = TEXT[locale.lang] || TEXT.en;
  const base = `/${locale.key}`;
  const href = (slug) => (slug === 'home' ? getHomepageUrl(locale.country, locale.lang) : `${base}/${slug}`);
  const content = el('div', {}, el('h1', {}, t.title));
  if (t.intro) content.append(el('p', {}, t.intro), searchForm(locale, t));
  t.links.forEach(([label, slug]) => content.append(linkParagraph(label, href(slug), t.newTab)));
  content.append(
    el('p', {}, t.feedback),
    linkParagraph(t.help, `${LIVE_ORIGIN}${base}/help-and-contact`, t.newTab),
  );
  main.replaceChildren(content);
  document.title = `${t.title} | Lufthansa`;
  const og = document.querySelector('meta[property="og:title"]');
  if (og) og.content = document.title;
}

buildNotFound();
