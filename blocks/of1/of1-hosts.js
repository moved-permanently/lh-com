/**
 * Where the OF1 generative page (blocks/of1) can reach OF1's API.
 * - proxy: *.of1.live, OF1's edge proxy in front of the site; the client script calls /api/* on
 *   its own origin (productApiBase in of1-client.js), nothing to set.
 * - edge: the turnsthe.page brand hosts, served by lh-edge, which forwards OF1's /api/* paths to
 *   the proxy server to server (the proxy refuses cross-origin calls): api-base = the page origin.
 * - none: aem.page, aem.live, localhost and every other host have no such route; the block shows
 *   a note with links to the hosts where it works instead of a page that fails.
 */
import { isTurnsThePageHost } from '../../scripts/demo.js';

export const OF1_MAIN_HOST = 'lufthansa.turnsthe.page';
const OF1_PROXY_HOST = /^[a-z0-9-]+\.of1\.live$/;
const EDS_HOST = /^([a-z0-9-]+--[a-z0-9-]+--[a-z0-9-]+)\.aem\.(page|live)$/;

/** The kind of a host name: 'proxy', 'edge' or 'none'. */
export function of1HostKind(hostname) {
  const host = String(hostname || '').toLowerCase();
  if (OF1_PROXY_HOST.test(host)) return 'proxy';
  if (isTurnsThePageHost(host)) return 'edge';
  return 'none';
}

/** The api-base the block sets for the client script (null: leave it to the script). */
export function of1ApiBase(loc = window.location) {
  return of1HostKind(loc.hostname) === 'edge' ? loc.origin : null;
}

/**
 * Where the page works, for the note on hosts without the API route: the of1.live host of the
 * same branch and stage (aem.page: the preview proxy prev--, aem.live: the live proxy), then the
 * demo's main host. Path and query are kept.
 */
export function of1DemoLinks(loc = window.location) {
  const path = `${loc.pathname}${loc.search || ''}`;
  const links = [];
  const eds = String(loc.hostname || '').toLowerCase().match(EDS_HOST);
  if (eds) links.push(`https://${eds[2] === 'page' ? 'prev--' : ''}${eds[1]}.of1.live${path}`);
  links.push(`https://${OF1_MAIN_HOST}${path}`);
  return links;
}
