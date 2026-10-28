/**
 * The demo hosts: the replica (lhcom, lhedge, lhcn on bbird.live), its Edge Delivery hosts and
 * branch previews (*.aem.page, *.aem.live, *.hlx.page, *.hlx.live), Workers' own hosts and local
 * development. The parts of the site that only make sense on the demo are on only there (the
 * showcase notice, answers recorded from www shown when a live call fails, the cross-origin proxy
 * and tester overrides, the demo forms worker, the look-alike consent banner, the FlyNet sample
 * flight, the client-side root redirect, the channels demo block); on any other host (production:
 * www.lufthansa.com) they are off. tools/reports/production-mode.md lists them and how to check.
 */
export const DEMO_HOSTS = [
  /^(localhost|127\.0\.0\.1)$/,
  /\.bbird\.live$/,
  /\.aem\.(page|live)$/,
  /\.hlx\.(page|live)$/,
  /\.workers\.dev$/,
];

/** Whether a host name is a demo host (default: the page's). */
export function isDemoHost(hostname = (typeof window !== 'undefined' ? window.location.hostname : '')) {
  const host = String(hostname || '').toLowerCase();
  return DEMO_HOSTS.some((re) => re.test(host));
}
