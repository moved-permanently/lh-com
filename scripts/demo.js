/**
 * The demo hosts: the replica (lhcom, lhedge, lhcn on bbird.live and their twins on turnsthe.page:
 * lufthansa, lufthansa-edge, lufthansa-cn; only lufthansa and lufthansa-* there, other demos may
 * share the domain), its Edge Delivery hosts and
 * branch previews (*.aem.page, *.aem.live, *.hlx.page, *.hlx.live), Workers' own hosts and local
 * development. The parts of the site that only make sense on the demo are on only there (the
 * showcase notice, answers recorded from www shown when a live call fails, the cross-origin proxy
 * and tester overrides, the demo forms worker, the look-alike consent banner, the FlyNet sample
 * flight, the client-side root redirect, the channels demo block); on any other host (production:
 * www.lufthansa.com) they are off. tools/reports/production-mode.md lists them and how to check.
 */
// the replica's hosts on turnsthe.page (the second Cloudflare account of the parallel run)
export const TURNSTHE_PAGE_HOST = /^lufthansa(-[a-z0-9-]+)?\.turnsthe\.page$/;

export const DEMO_HOSTS = [
  /^(localhost|127\.0\.0\.1)$/,
  /\.bbird\.live$/,
  TURNSTHE_PAGE_HOST,
  /\.aem\.(page|live)$/,
  /\.hlx\.(page|live)$/,
  /\.workers\.dev$/,
];

const pageHost = () => (typeof window !== 'undefined' ? window.location.hostname : '');

/**
 * Whether a host name is one of the replica's turnsthe.page hosts (default: the page's): there the
 * site calls the second account's Workers (the forms worker, the proxy); elsewhere Blackbird's.
 */
export function isTurnsThePageHost(hostname = pageHost()) {
  return TURNSTHE_PAGE_HOST.test(String(hostname || '').toLowerCase());
}

/** Whether a host name is a demo host (default: the page's). */
export function isDemoHost(hostname = pageHost()) {
  const host = String(hostname || '').toLowerCase();
  return DEMO_HOSTS.some((re) => re.test(host));
}
