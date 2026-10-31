/**
 * The brand's favicon and web app manifest on its host (scripts/brand-icons.js: www's own
 * paths, the code's copies under etc/designs/<brand>/). head.html links Lufthansa's
 * (/etc/designs/dcep/) on every site; on an HTML answer for a site host (src/sites.js siteOf)
 * whose brand has its own, a streaming HTMLRewriter points the head's icon and manifest links at
 * the brand's files before the first paint (a brand without a manifest on www: the link goes).
 * The page itself does the same on hosts without lh-edge (scripts/brand.js applyBrandIcons).
 * .plain.html, non-HTML answers and lh-com's hosts (no site): untouched, no rewriter.
 */
/* global HTMLRewriter */
/* eslint-disable import/no-relative-packages */
import { iconsOf } from '../../../../scripts/brand-icons.js';
/* eslint-enable import/no-relative-packages */

/**
 * @param {Response} response
 * @param {Request} request
 * @param {Object|null} site siteOf(request, env)
 * @returns {Response}
 */
export function rewriteBrandIcons(response, request, site) {
  const icons = site && iconsOf(site.name);
  if (!icons) return response;
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html') || !response.body) return response;
  if (/\.plain\.html$/.test(new URL(request.url).pathname)) return response;
  return new HTMLRewriter()
    .on('head link[rel]', {
      element(el) {
        const rel = String(el.getAttribute('rel') || '').toLowerCase().split(/\s+/);
        if (rel.includes('manifest')) {
          if (icons.manifest) el.setAttribute('href', icons.manifest);
          else el.remove();
        } else if (rel.includes('icon')) {
          el.setAttribute('href', icons.icon);
          if (icons.type) el.setAttribute('type', icons.type);
        }
      },
    })
    .transform(response);
}

export default rewriteBrandIcons;
