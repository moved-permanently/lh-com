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
 * Brand sites (ITA, Discover, Cargo, Air Dolomiti): the 404 has no metadata of its own, so it
 * takes the brand of the site's /metadata.json row that matches the path, and the nav, footer and
 * language its pages carry (a site without roots: the language of the path's prefix; with roots:
 * the path's <cc>/<ll>), before scripts.js loads (theme, consent, showcase notice and header and
 * footer then follow the brand). Its title names the brand; it links only the site's pages that
 * answer (homepage, booking, check-in, bookings: a HEAD request each), without Lufthansa's search
 * and help page. lh-com (no brand row) as above. scripts.js is loaded from here, after that.
 */
import {
  getLocale, getHomepageUrl, LIVE_ORIGIN, LOCALES,
} from './locale.js';
import { BRANDS, brandName } from './brand.js';
import { siteLanguagesOf, languageOfPath } from './site-languages.js';

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
  it: {
    title: 'Pagina non trovata',
    links: [['Vai alla homepage', 'home'], ['Prenota voli', 'flight-search'], ['Check-in online', 'online-check-in-info'], ['Le mie prenotazioni', 'my-bookings']],
    feedback: 'Non hai trovato le informazioni giuste o vuoi lasciarci un feedback? Consulta le nostre opzioni di feedback e contatto.',
    help: 'Assistenza e contatti',
    newTab: '',
  },
  fr: {
    title: 'Page introuvable',
    links: [['Aller à la page d’accueil', 'home'], ['Réserver des vols', 'flight-search'], ['Enregistrement en ligne', 'online-check-in-info'], ['Mes réservations', 'my-bookings']],
    feedback: 'Vous n’avez pas trouvé l’information recherchée ou souhaitez nous faire part de vos commentaires ? Consultez nos possibilités de contact.',
    help: 'Aide et contact',
    newTab: '',
  },
  es: {
    title: 'Página no encontrada',
    links: [['Ir a la página de inicio', 'home'], ['Reservar vuelos', 'flight-search'], ['Check-in online', 'online-check-in-info'], ['Mis reservas', 'my-bookings']],
    feedback: '¿No ha encontrado la información adecuada o desea darnos su opinión? Consulte nuestras opciones de opinión y contacto.',
    help: 'Ayuda y contacto',
    newTab: '',
  },
  nl: {
    title: 'Pagina niet gevonden',
    links: [['Naar de homepage', 'home'], ['Vluchten boeken', 'flight-search'], ['Online inchecken', 'online-check-in-info'], ['Mijn boekingen', 'my-bookings']],
    feedback: 'Hebt u de juiste informatie niet gevonden of wilt u ons feedback geven? Bekijk onze feedback- en contactmogelijkheden.',
    help: 'Hulp en contact',
    newTab: '',
  },
  pt: {
    title: 'Página não encontrada',
    links: [['Ir para a página inicial', 'home'], ['Reservar voos', 'flight-search'], ['Check-in online', 'online-check-in-info'], ['Minhas reservas', 'my-bookings']],
    feedback: 'Não encontrou a informação certa ou quer nos enviar sua opinião? Veja nossas opções de feedback e contato.',
    help: 'Ajuda e contato',
    newTab: '',
  },
  el: {
    title: 'Η σελίδα δεν βρέθηκε',
    links: [['Μετάβαση στην αρχική σελίδα', 'home'], ['Κράτηση πτήσεων', 'flight-search'], ['Online check-in', 'online-check-in-info'], ['Οι κρατήσεις μου', 'my-bookings']],
    feedback: 'Δεν βρήκατε τις πληροφορίες που θέλατε ή θέλετε να μας πείτε τη γνώμη σας; Δείτε τις επιλογές σχολίων και επικοινωνίας.',
    help: 'Βοήθεια και επικοινωνία',
    newTab: '',
  },
  ja: {
    title: 'ページが見つかりません',
    links: [['ホームページへ', 'home'], ['航空券を予約', 'flight-search'], ['オンラインチェックイン', 'online-check-in-info'], ['予約の確認', 'my-bookings']],
    feedback: 'お探しの情報が見つからない場合や、ご意見をお寄せいただける場合は、フィードバックとお問い合わせの方法をご覧ください。',
    help: 'ヘルプとお問い合わせ',
    newTab: '',
  },
};

/** Locale of the path; a path without a migrated locale gets de/en (live's /error.html). */
function notFoundLocale(pathname = window.location.pathname) {
  const path = pathname.replace(/^\/content(?=\/)/, '');
  const match = path.match(/^\/([a-z]{2})\/([a-z]{2})(?:\/|$)/);
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

export function buildNotFound(main = document.querySelector('main')) {
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

/** A metadata sheet's URL glob as a regular expression (** any path, * one segment). */
function globRegExp(glob) {
  const source = String(glob || '').trim().split('**')
    .map((part) => part.split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*'))
    .join('.*');
  return new RegExp(`^${source}$`);
}

/**
 * The brand of the rows of the site's /metadata.json that match a path (the last one wins, as
 * Edge Delivery applies them); '' for none or an unknown brand.
 * @param {Object[]} rows
 * @param {string} pathname
 */
export function metadataBrand(rows, pathname) {
  const brand = (rows || [])
    .filter((r) => r && r.brand && r.URL && globRegExp(r.URL).test(pathname))
    .map((r) => String(r.brand).trim().toLowerCase()).pop() || '';
  return Object.prototype.hasOwnProperty.call(BRANDS, brand) ? brand : '';
}

/**
 * The metadata a brand's pages carry, for its 404 at a path: brand; nav, footer (and language on
 * a site without roots) of the path's language or root.
 * @param {string} pathname
 * @param {string} brand
 * @returns {Object<string, string>}
 */
export function brandPageMeta(pathname, brand) {
  const meta = { brand };
  const languages = siteLanguagesOf((n) => (n === 'brand' ? brand : ''));
  if (languages) {
    const entry = languageOfPath(pathname, languages) || languages[0];
    return {
      ...meta, language: entry.lang, nav: `${entry.path}nav`, footer: `${entry.path}footer`,
    };
  }
  const root = pathname.match(/^\/([a-z]{2})\/([a-z]{2})(?:\/|$)/);
  if (!root) return meta;
  return { ...meta, nav: `/${root[1]}/${root[2]}/nav`, footer: `/${root[1]}/${root[2]}/footer` };
}

/** Sets a page metadata value (<meta name>). */
export function setMeta(name, content) {
  let meta = document.head.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.append(meta);
  }
  meta.setAttribute('content', content);
}

const pageMeta = (name) => document.head.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || '';

/** Whether a page of this site answers (HEAD, after redirects). */
async function pageExists(href) {
  try {
    return (await fetch(href, { method: 'HEAD' })).ok;
  } catch (e) {
    return false;
  }
}

/**
 * A brand's not-found page: the title, then the homepage and the booking, check-in and bookings
 * pages of the path's language or root that exist on the site; the brand's name in the title.
 * @param {Element} [main]
 * @param {Function} [exists] async (href) => boolean
 */
export async function buildBrandNotFound(main = document.querySelector('main'), exists = pageExists) {
  if (!main) return;
  const { pathname } = window.location;
  const languages = siteLanguagesOf(pageMeta);
  const root = pathname.match(/^\/([a-z]{2})\/([a-z]{2})(?:\/|$)/);
  let lang = 'en';
  let base = '';
  let home = '/';
  if (languages) {
    const entry = languageOfPath(pathname, languages) || languages[0];
    ({ lang, home } = entry);
    base = entry.path.replace(/\/$/, '');
  } else if (root) {
    [, , lang] = root;
    base = `/${root[1]}/${root[2]}`;
    home = `${base}/homepage`;
  }
  const t = TEXT[lang] || TEXT.en;
  const candidates = t.links.map(([label, slug]) => [label, slug === 'home' ? home : `${base}/${slug}`]);
  const found = await Promise.all(candidates.map(([, href]) => exists(href).catch(() => false)));
  const content = el('div', {}, el('h1', {}, t.title));
  candidates.forEach(([label, href], i) => {
    if (found[i]) content.append(linkParagraph(label, href, ''));
  });
  main.replaceChildren(content);
  document.title = `${t.title} | ${brandName()}`;
  const og = document.querySelector('meta[property="og:title"]');
  if (og) og.content = document.title;
}

/** The brand of this site: its /metadata.json row for the path ('' for lh-com and on errors). */
async function siteBrand(pathname) {
  try {
    const resp = await fetch('/metadata.json');
    return resp.ok ? metadataBrand((await resp.json()).data, pathname) : '';
  } catch (e) {
    return '';
  }
}

export default buildNotFound;

// the not-found page (404.html): the brand first, then the page's text, then scripts.js
if (window.isErrorPage) {
  const { pathname } = window.location;
  const brand = await siteBrand(pathname);
  if (brand) {
    Object.entries(brandPageMeta(pathname, brand)).forEach(([k, v]) => setMeta(k, v));
    await buildBrandNotFound();
  } else {
    buildNotFound();
  }
  await import('./scripts.js');
}
