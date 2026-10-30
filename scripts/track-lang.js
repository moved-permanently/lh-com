/**
 * The language of a video's text track (.vtt): the language its file name names (www's names:
 * `…-cc-en.vtt`, `…-de-ad.vtt`, `…_cc_de.vtt`, `selfbagdrop-eng.vtt`; the last such part counts),
 * else `fallback` (the page language). www's video viewer declares no language; a page may carry
 * another language's tracks (Discover's /de/en flight disruptions page has the German ones).
 * Shared by scripts/media.js (the track's srclang) and the importers (the track links' labels).
 */
// fr: Discover's French tracks (…_cc_fr.vtt); not "fra", which names Frankfurt in www's files
export const TRACK_LANGS = {
  en: 'en', eng: 'en', de: 'de', deu: 'de', ger: 'de', fr: 'fr',
};

export function trackLang(href, fallback = '') {
  const file = String(href || '').split(/[?#]/)[0].split('/').pop().replace(/\.vtt$/i, '');
  const named = file.toLowerCase().split(/[-_.]/).filter((part) => TRACK_LANGS[part]).pop();
  return named ? TRACK_LANGS[named] : fallback;
}
