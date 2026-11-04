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
 * Imports only scripts/site-languages.js (its TAP table): lh-edge bundles it.
 */
import { SITE_LANGUAGES, languageOfPath } from './site-languages.js';

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
 * The not-found page of a brand at a path, or null (lh-com, a brand without texts).
 * @param {string} brand the site's brand (metadata brand)
 * @param {string} pathname
 * @returns {{brand: string, lang: string, title: string, heading: string, text: string[],
 *   button: string, home: string, meta: Object<string, string>}|null}
 */
export function brandNotFound(brand, pathname) {
  const key = String(brand || '').trim().toLowerCase();
  const own = Object.prototype.hasOwnProperty.call(NOT_FOUND_TEXTS, key);
  const texts = own ? NOT_FOUND_TEXTS[key] : null;
  const languages = texts && SITE_LANGUAGES[key];
  if (!languages) return null;
  const at = plainEntry(texts, languages, String(pathname || '/'));
  return {
    brand: key, lang: at.lang, ...at.texts, home: at.home, meta: { brand: key, ...at.meta },
  };
}

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

/** The page's main content: the heading, the text, the homepage link (decorated as a button). */
export function notFoundMarkup(page) {
  return `<div><h1>${escape(page.heading)}</h1>${page.text.map((t) => `<p>${escape(t)}</p>`).join('')}<p><a href="${escape(page.home)}">${escape(page.button)}</a></p></div>`;
}
