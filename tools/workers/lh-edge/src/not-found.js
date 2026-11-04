/**
 * The brand's not-found page on its host (brief 342): the origin's 404 for a missing page is the
 * code's 404.html, with Lufthansa's title and text until its script runs; on a site host
 * (src/sites.js siteOf) whose brand has its own (scripts/not-found-texts.js), the page is the
 * brand's before it is sent: its title and og:title, <html lang>, the brand, nav, footer (and
 * language) metadata of the path's root or language version, the heading, text and homepage
 * button of the brand's www 404. The page's scripts are kept (scripts/not-found.js then builds
 * the same page). The 404.html is a few KB: read whole, no rewriter. lh-com's hosts (no site),
 * other answers, .plain.html, HEAD and a 404 that is not the code's page: the same response.
 */
/* eslint-disable import/no-relative-packages */
import { brandNotFound, notFoundMarkup } from '../../../../scripts/not-found-texts.js';
/* eslint-enable import/no-relative-packages */

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/**
 * @param {Response} response
 * @param {Request} request
 * @param {Object|null} site siteOf(request, env)
 * @returns {Promise<Response>}
 */
export async function brandNotFoundPage(response, request, site) {
  if (!site || response.status !== 404 || !response.body) return response;
  if (!(response.headers.get('content-type') || '').includes('text/html')) return response;
  const { pathname } = new URL(request.url);
  if (/\.plain\.html$/.test(pathname)) return response;
  const page = brandNotFound(site.name, pathname);
  if (!page) return response;
  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  const { status, statusText } = response;
  const answer = (body) => new Response(body, { status, statusText, headers });
  if (!html.includes('window.isErrorPage')) return answer(html);
  const title = escape(page.title);
  const metas = Object.entries(page.meta).map(([k, v]) => `<meta name="${k}" content="${escape(v)}">`).join('');
  return answer(html
    .replace(/<html(?![^>]*\slang=)([^>]*)>/i, `<html lang="${escape(page.lang)}"$1>`)
    .replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/i, `$1${title}$2`)
    .replace(/<meta name="(?:brand|nav|footer|language)" content="[^"]*">/gi, '')
    .replace(/<\/head>/i, `${metas}</head>`)
    .replace(/<main>[\s\S]*?<\/main>/i, `<main>${notFoundMarkup(page)}</main>`));
}

export default brandNotFoundPage;
