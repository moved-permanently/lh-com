/**
 * The brands' own not-found pages (brief 342): per brand and language the title, heading, text
 * and homepage button of the brand's www 404 page, and the page a path's 404 is: the texts of the
 * path's root or language version (else the site's default language), its homepage, and the
 * metadata the brand's pages carry (brand, nav, footer; language on a site without <cc>/<ll>
 * roots). Read by scripts/not-found.js on the page and by lh-edge (src/not-found.js), which
 * makes the 404 the brand's before it is sent. lh-com (no brand): none, its 404 is
 * scripts/not-found.js's own.
 * Texts, as www has them:
 * - TAP (www.flytap.com/<root>/zz-not-found-check, 2026-11-04): per language version, pt-br its
 *   own; a market root takes its language version's (de-ch: de-de's).
 * - the others (www's /<root>/zz-not-found-check per language version, 2026-11-04, over Bright
 *   Data: logs/b342/bd-404; Air Dolomiti's directly): per language, a root takes its language's
 *   (us/de: de). Lufthansa Group's sites (Austrian, Brussels, b2b, SWISS, ITA): the first sentence
 *   of www's text (the second asks for a search term, and there is no search field here) and the
 *   first of its links, to the homepage; Cargo's www has no button, SWISS's kr/ko is English
 *   without text (lang: the page's language where it is not the root's).
 * Imports scripts/site-languages.js (its TAP table) and scripts/brands.js: lh-edge bundles both.
 */
import { BRAND_SITES } from './brands.js';
import { SITE_LANGUAGES, languageOfPath, subSiteOf } from './site-languages.js';

/** brand → texts key (TAP: the language version's root) → title, heading, text, button */
export const NOT_FOUND_TEXTS = {
  tap: {
    'pt-pt': {
      title: '404 Erro | TAP Air Portugal',
      heading: 'Erro 404',
      text: ['Este destino não está disponível', 'Regresse à página inicial e continue a sua viagem.'],
      button: 'Continuar',
    },
    'en-pt': {
      title: '404 Error | TAP Air Portugal',
      heading: 'Error 404',
      text: ['This destination isn\'t available', 'Return to the homepage and continue your journey.'],
      button: 'Continue',
    },
    'es-es': {
      title: '404 Error | TAP Air Portugal',
      heading: 'Error 404',
      text: ['Este destino no está disponible', 'Vuelve a la página de inicio y continúa tu viaje.'],
      button: 'Continuar',
    },
    'fr-fr': {
      title: '404 Erreur | TAP Air Portugal',
      heading: 'Erreur 404',
      text: ['Cette destination n\'est pas disponible', 'Retournez à la page d\'accueil et poursuivez votre voyage.'],
      button: 'Continuer',
    },
    'de-de': {
      title: '404 Fehler | TAP Air Portugal',
      heading: 'Fehler 404',
      text: ['Dieses Reiseziel ist nicht verfügbar', 'Kehren Sie zur Startseite zurück und setzen Sie Ihre Reise fort.'],
      button: 'Weiter',
    },
    'it-it': {
      title: '404 Errore | TAP Air Portugal',
      heading: 'Errore 404',
      text: ['Questa destinazione non è disponibile', 'Torna alla homepage e continua il tuo viaggio.'],
      button: 'Continua',
    },
    'pl-pl': {
      title: '404 Błąd | TAP Air Portugal',
      heading: 'Błąd 404',
      text: ['Ta destynacja jest niedostępna', 'Wróć do strony głównej i kontynuuj swoją podróż.'],
      button: 'Kontynuuj',
    },
    'pt-br': {
      title: '404 Erro | TAP Air Portugal',
      heading: 'Erro 404',
      text: ['Este destino não está disponível', 'Volte para a página inicial e continue sua viagem.'],
      button: 'Continuar',
    },
  },
  discover: {
    en: {
      title: 'Page not found | Discover Airlines',
      heading: 'Page not found',
      text: ['There may be a typing error in the link or the page may no longer exist.', 'Please use our navigation to search for an alternative or use the button below to return to the homepage.'],
      button: 'To the homepage',
    },
    de: {
      title: 'Seite nicht gefunden | Discover Airlines',
      heading: 'Seite nicht gefunden',
      text: ['Eventuell ist im Link ein Tippfehler enthalten oder die Seite existiert nicht mehr.', 'Benutzen Sie gerne unsere Navigation um nach einer Alternative zu suchen oder benutzen Sie den nachfolgenden Button um wieder auf die Startseite zurückzukehren.'],
      button: 'Zur Startseite',
    },
    fr: {
      title: 'Page introuvable | Discover Airlines',
      heading: 'Page introuvable',
      text: ['Il peut y avoir une erreur de saisie dans le lien ou la page pourrait ne plus exister.', 'Veuillez utiliser notre outil de navigation pour choisir une autre option ou utiliser le bouton ci-dessous pour revenir à la page d’accueil.'],
      button: 'Aller à la page d’accueil',
    },
  },
  ita: {
    pt: {
      title: 'Página não encontrada | ITA Airways',
      heading: 'Não foi possível encontrar a página',
      text: ['Não foi possível encontrar a página que você busca.'],
      button: 'Página inicial',
    },
    de: {
      title: 'Seite nicht gefunden | ITA Airways',
      heading: 'Seite nicht gefunden',
      text: ['Es tut uns leid, aber die von Ihnen gesuchte Seite konnte nicht gefunden werden.'],
      button: 'Startseite',
    },
    es: {
      title: 'Página no encontrada | ITA Airways',
      heading: 'No ha sido posible encontrar la página',
      text: ['Lo sentimos, pero no ha sido posible encontrar la página que está buscando.'],
      button: 'Página de inicio',
    },
    fr: {
      title: 'Page introuvable | ITA Airways',
      heading: 'Impossible de trouver la page',
      text: ['Nous sommes désolés, mais la page que vous recherchez est introuvable.'],
      button: 'Page d’accueil',
    },
    el: {
      title: 'Η σελίδα δεν βρέθηκε | ITA Airways',
      heading: 'Δεν ήταν δυνατή η εύρεση της σελίδας',
      text: ['Λυπούμαστε, αλλά η σελίδα που ψάχνετε δεν βρέθηκε.'],
      button: 'Αρχική σελίδα',
    },
    en: {
      title: 'Page not found | ITA Airways',
      heading: 'Unable to find the page',
      text: ['We\'re sorry, but the page you\'re looking for could not be found.'],
      button: 'Homepage',
    },
    it: {
      title: 'Pagina non trovata | ITA Airways',
      heading: 'Impossibile trovare la pagina',
      text: ['Siamo spiacenti, ma la pagina che stai cercando non è stata trovata.'],
      button: 'Homepage',
    },
    ja: {
      title: 'ページが見つかりません | ITA Airways',
      heading: 'ページが見つかりません',
      text: ['申し訳ございません。お探しのページが見つかりませんでした。'],
      button: 'ホームページ',
    },
    nl: {
      title: 'Pagina niet gevonden | ITA Airways',
      heading: 'De pagina kan niet worden gevonden.',
      text: ['Sorry, we kunnen de pagina die je zoekt niet vinden.'],
      button: 'Startpagina',
    },
  },
  austrian: {
    de: {
      title: 'Seite konnte nicht gefunden werden | Austrian Airlines',
      heading: 'Seite konnte nicht gefunden werden',
      text: ['Die angeforderte Seite existiert nicht mehr oder ist umgezogen.'],
      button: 'Zur Startseite',
    },
    en: {
      title: 'The page could not be found | Austrian Airlines',
      heading: 'The page could not be found',
      text: ['The page requested no longer exists or has moved.'],
      button: 'To the homepage',
    },
    zh: {
      title: '找不到该页面 | Austrian Airlines',
      heading: '找不到该页面',
      text: ['请求的页面不存在或已移至其他位置。'],
      button: '回到主页',
    },
    es: {
      title: 'No ha sido posible encontrar la página | Austrian Airlines',
      heading: 'No ha sido posible encontrar la página',
      text: ['La página solicitada ya no existe o se ha movido.'],
      button: 'A la página principal',
    },
    fr: {
      title: 'La page que vous avez demandée n’a pas pu être trouvée | Austrian Airlines',
      heading: 'La page que vous avez demandée n’a pas pu être trouvée',
      text: ['La page demandée n’existe plus ou a été déplacée.'],
      button: 'Page d’accueil',
    },
    el: {
      title: 'Η σελίδα δεν βρέθηκε | Austrian Airlines',
      heading: 'Η σελίδα δεν βρέθηκε',
      text: ['Η σελίδα που ζητήσατε δεν υπάρχει πια ή μετακινήθηκε.'],
      button: 'Μετάβαση στην αρχική σελίδα',
    },
    it: {
      title: 'Pagina non disponibile | Austrian Airlines',
      heading: 'Pagina non disponibile',
      text: ['La pagina richiesta non esiste più o è stata rimossa.'],
      button: 'Homepage',
    },
    ja: {
      title: 'ページが見つかりませんでした | Austrian Airlines',
      heading: 'ページが見つかりませんでした',
      text: ['お探しのページは存在しないか、移動しました。'],
      button: 'ホームページへ',
    },
    pl: {
      title: 'Nie znaleziono strony | Austrian Airlines',
      heading: 'Nie znaleziono strony',
      text: ['Żądana strona nie istnieje lub została przeniesiona.'],
      button: 'Strona główna',
    },
    ru: {
      title: 'Страница не найдена | Austrian Airlines',
      heading: 'Страница не найдена',
      text: ['Эта страница не существует или была перемещена.'],
      button: 'На главную страницу',
    },
  },
  brussels: {
    en: {
      title: 'The page could not be found | Brussels Airlines',
      heading: 'The page could not be found',
      text: ['The page requested no longer exists or has moved.'],
      button: 'To the homepage',
    },
    fr: {
      title: 'La page n’a pas été trouvée | Brussels Airlines',
      heading: 'La page n’a pas été trouvée',
      text: ['La page demandée n’existe plus ou a été déplacée.'],
      button: 'Vers la page d’accueil',
    },
    nl: {
      title: 'De pagina kon niet worden gevonden | Brussels Airlines',
      heading: 'De pagina kon niet worden gevonden',
      text: ['De opgevraagde pagina bestaat niet meer of is verplaatst.'],
      button: 'Naar de homepage',
    },
    de: {
      title: 'Die Seite konnte nicht gefunden werden | Brussels Airlines',
      heading: 'Die Seite konnte nicht gefunden werden',
      text: ['Die gewünschte Seite existiert nicht mehr oder wurde verschoben.'],
      button: 'Zur Startseite',
    },
    es: {
      title: 'No ha sido posible encontrar la página | Brussels Airlines',
      heading: 'No ha sido posible encontrar la página',
      text: ['La página solicitada ya no existe o se ha movido.'],
      button: 'Ir a la página principal',
    },
    it: {
      title: 'Pagina non disponibile | Brussels Airlines',
      heading: 'Pagina non disponibile',
      text: ['La pagina richiesta non esiste più o è stata rimossa.'],
      button: 'Homepage',
    },
  },
  b2b: {
    de: {
      title: 'Seite nicht gefunden | Lufthansa Group',
      heading: 'Seite nicht gefunden',
      text: ['Die angeforderte Seite existiert nicht mehr oder ist umgezogen.'],
      button: 'Zur Startseite',
    },
    en: {
      title: 'Page not found | Lufthansa Group',
      heading: 'Page not Found',
      text: ['The page requested no longer exists or has moved.'],
      button: 'To Homepage',
    },
  },
  swiss: {
    de: {
      title: 'Diese Seite ist nicht auffindbar | SWISS',
      heading: 'Diese Seite ist nicht auffindbar',
      text: ['Die angeforderte Seite existiert nicht mehr oder ist umgezogen.'],
      button: 'Zur Startseite',
    },
    el: {
      title: 'Η σελίδα δεν βρέθηκε | SWISS',
      heading: 'Η σελίδα δεν βρέθηκε',
      text: ['Η σελίδα που ζητήσατε δεν υπάρχει πια ή μετακινήθηκε.'],
      button: 'Μετάβαση στην αρχική σελίδα',
    },
    en: {
      title: 'The page could not be found | SWISS',
      heading: 'The page could not be found',
      text: ['The page requested no longer exists or has moved.'],
      button: 'To the homepage',
    },
    es: {
      title: 'No ha sido posible encontrar la página | SWISS',
      heading: 'No ha sido posible encontrar la página',
      text: ['La página solicitada ya no existe o se ha movido.'],
      button: 'Ir a la página principal',
    },
    fr: {
      title: 'La page que vous avez demandée n’a pas pu être trouvée | SWISS',
      heading: 'La page que vous avez demandée n’a pas pu être trouvée',
      text: ['La page demandée n’existe plus ou a été déplacée.'],
      button: 'Page d’accueil',
    },
    it: {
      title: 'Impossibile trovare la pagina | SWISS',
      heading: 'Impossibile trovare la pagina',
      text: ['La pagina richiesta non esiste più o è stata rimossa.'],
      button: 'Homepage',
    },
    ja: {
      title: 'ページが見つかりませんでした | SWISS',
      heading: 'ページが見つかりませんでした',
      text: ['お探しのページは存在しないか、移動しました。'],
      button: 'ホームページへ',
    },
    pt: {
      title: 'A página não foi encontrada | SWISS',
      heading: 'A página não foi encontrada',
      text: ['A página solicitada não existe mais ou foi transferida.'],
      button: 'Acessar a página inicial',
    },
    ru: {
      title: 'Страница не найдена | SWISS',
      heading: 'Страница не найдена',
      text: ['Эта страница не существует или была перемещена.'],
      button: 'На главную страницу',
    },
    zh: {
      title: '找不到该页面 | SWISS',
      heading: '找不到该页面',
      text: ['请求的页面不存在或已移至其他位置。'],
      button: '回到主页',
    },
    ko: {
      lang: 'en',
      title: 'The requested page could not be found | SWISS',
      heading: 'The requested page could not be found',
      text: [],
    },
  },
  cargo: {
    en: {
      title: 'This page is no longer available | Lufthansa Cargo',
      heading: 'This page is no longer available',
      text: ['We\'re sorry, but the page you are looking for is no longer available.', 'Thank you for your understanding.'],
    },
    de: {
      title: 'Diese Webseite ist nicht mehr verfügbar | Lufthansa Cargo',
      heading: 'Diese Webseite ist nicht mehr verfügbar',
      text: ['Die von Ihnen gesuchte Webseite ist leider nicht mehr verfügbar.', 'Vielen Dank!'],
    },
  },
  airdolomiti: {
    it: {
      title: 'Impossibile trovare la pagina | Air Dolomiti',
      heading: 'Impossibile trovare la pagina',
      text: ['I nostri servizi di prenotazione sono sempre disponibili, per ulteriori informazioni contatta il nostro Sale Center al: 0039 0452886140.'],
      button: 'Torna all’homepage',
    },
    en: {
      title: 'The page could not be found | Air Dolomiti',
      heading: 'The page could not be found',
      text: ['Our Service Center is always available, for more information contact our Sales Center at: 0039 0452886140.'],
      button: 'Back to homepage',
    },
    de: {
      title: 'Seite konnte nicht gefunden werden | Air Dolomiti',
      heading: 'Seite konnte nicht gefunden werden',
      text: ['Unsere Reservierungsservice ist immer verfügbar, für weitere Informationen wenden Sie sich bitte an unser Sales Center unter der Nummer: 0039 0452886140.'],
      button: 'Zurück zur Startseite',
    },
  },
};

/**
 * A site without <cc>/<ll> roots (SITE_LANGUAGES): the path's language (the longest prefix, else
 * the first), its texts key (TAP: a market root's language version) and homepage.
 */
function plainEntry(texts, languages, pathname) {
  const entry = languageOfPath(pathname, languages) || languages[0];
  const own = entry.country ? `${entry.lang}-${entry.country}` : entry.lang;
  const key = [own, entry.version, Object.keys(texts)[0]].find((k) => k && texts[k]);
  return {
    lang: entry.lang,
    texts: texts[key],
    home: entry.home,
    meta: { language: entry.lang, nav: `${entry.path}nav`, footer: `${entry.path}footer` },
  };
}

/**
 * A site with <cc>/<ll> roots (BRAND_SITES): the path's root, else its sub-site's language (SWISS's
 * /corporate/de/), else the first language version; the texts of its language, else of the first
 * language version's.
 */
function rootEntry(texts, brand, pathname) {
  const site = BRAND_SITES[brand];
  const first = Object.values(site.versions)[0];
  const fallback = texts[site.rows[first].lang];
  const sub = subSiteOf(brand, pathname);
  if (sub) {
    const entry = languageOfPath(pathname, sub.languages) || sub.languages[0];
    return {
      lang: entry.lang,
      texts: texts[entry.lang] || fallback,
      home: entry.home,
      meta: { nav: `${entry.path}nav`, footer: `${entry.path}footer` },
    };
  }
  const m = pathname.match(/^\/([a-z]{2})\/([a-z]{2})(?:\/|$)/);
  const root = m && site.rows[`${m[1]}/${m[2]}`] ? `${m[1]}/${m[2]}` : first;
  const { lang } = site.rows[root];
  return {
    lang,
    texts: texts[lang] || fallback,
    home: `/${root}/homepage`,
    meta: { nav: `/${root}/nav`, footer: `/${root}/footer` },
  };
}

/**
 * The not-found page of a brand at a path, or null (lh-com, a brand without texts).
 * @param {string} brand the site's brand (metadata brand)
 * @param {string} pathname
 * @returns {{brand: string, lang: string, title: string, heading: string, text: string[],
 *   button?: string, home: string, meta: Object<string, string>}|null}
 */
export function brandNotFound(brand, pathname) {
  const key = String(brand || '').trim().toLowerCase();
  const own = Object.prototype.hasOwnProperty.call(NOT_FOUND_TEXTS, key);
  const texts = own ? NOT_FOUND_TEXTS[key] : null;
  if (!texts) return null;
  const path = String(pathname || '/');
  let at;
  if (SITE_LANGUAGES[key]) at = plainEntry(texts, SITE_LANGUAGES[key], path);
  else if (BRAND_SITES[key]) at = rootEntry(texts, key, path);
  else return null;
  return {
    brand: key, lang: at.lang, ...at.texts, home: at.home, meta: { brand: key, ...at.meta },
  };
}

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

/**
 * The page's main content: the heading, the text, the homepage link (decorated as a button; none
 * where www has none).
 */
export function notFoundMarkup(page) {
  const text = page.text.map((t) => `<p>${escape(t)}</p>`).join('');
  const button = page.button ? `<p><a href="${escape(page.home)}">${escape(page.button)}</a></p>` : '';
  return `<div><h1>${escape(page.heading)}</h1>${text}${button}</div>`;
}
