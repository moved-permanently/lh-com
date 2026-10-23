/* eslint-disable */
import { AEM_PATHS } from './aem-path-map.js';

/**
 * Public paths for AEM content paths that Lufthansa components carry in their markup
 * (maui-sub-navigation tabs, hero banner buttons): "/content/lh/markets/de/de/..." and the
 * non-vanity "/de/de/prepare-for-your-trip/travel-classes/first-class". Used by parsers before
 * the cleanup rewrites links (in-scope paths stay root-relative, the rest becomes
 * https://www.lufthansa.com/...).
 *   /content/lh/markets/{cc}/{ll}/x                      -> /{cc}/{ll}/x (live serves it)
 *   /{cc}/{ll}/prepare-for-your-trip/travel-classes      -> /{cc}/{ll}/lufthansa-reiseklassen
 *                                                           (en: lufthansa-travel-classes)
 *   /{cc}/{ll}/prepare-for-your-trip/travel-classes/first-class (business-class,
 *     premium-economy-class, economy-class)              -> /{cc}/{ll}/first-class
 *   /{cc}/{ll}/during-your-trip/internet-on-board        -> /{cc}/{ll}/flynet
 *   any other AEM path of a snapshotted page              -> its public path (aem-path-map.js,
 *     /de/en/during-your-trip/lounges/admission-rules -> /de/en/admission-rules)
 * Anything else is returned unchanged (query and hash are kept).
 */
const CLASSES = /^\/([a-z]{2})\/([a-z]{2})\/prepare-for-your-trip\/travel-classes\/(first-class|business-class|premium-economy-class|economy-class)$/;
const CLASSES_HUB = /^\/([a-z]{2})\/([a-z]{2})\/prepare-for-your-trip\/travel-classes$/;
const FLYNET = /^\/([a-z]{2})\/([a-z]{2})\/during-your-trip\/internet-on-board$/;

export function publicPath(href) {
  const raw = (href || '').trim();
  const m = raw.match(/^(?:https?:\/\/www\.lufthansa\.com)?(\/[^?#]*)([?#].*)?$/);
  if (!m) return raw;
  let path = m[1].replace(/^\/content\/lh\/markets(?=\/)/, '').replace(/\.html$/, '').replace(/\/$/, '');
  const rest = m[2] || '';
  let x = path.match(CLASSES);
  if (x) path = `/${x[1]}/${x[2]}/${x[3]}`;
  else if ((x = path.match(CLASSES_HUB))) path = `/${x[1]}/${x[2]}/${x[2] === 'de' ? 'lufthansa-reiseklassen' : 'lufthansa-travel-classes'}`;
  else if ((x = path.match(FLYNET))) path = `/${x[1]}/${x[2]}/flynet`;
  else if (Object.prototype.hasOwnProperty.call(AEM_PATHS, path)) path = AEM_PATHS[path];
  return `${path || '/'}${rest}`;
}
