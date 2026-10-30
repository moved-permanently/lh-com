/**
 * The demo hosts: the replica on turnsthe.page (the brand hosts below; lufthansa.turnsthe.page is
 * the main host), its Edge Delivery hosts and
 * branch previews (*.aem.page, *.aem.live, *.hlx.page, *.hlx.live), Workers' own hosts and local
 * development. The parts of the site that only make sense on the demo are on only there (the
 * showcase notice, answers recorded from www shown when a live call fails, the cross-origin proxy
 * and tester overrides, the demo forms worker, the look-alike consent banner, the FlyNet sample
 * flight, the client-side root redirect, the channels demo block); on any other host (production:
 * www.lufthansa.com) they are off. tools/reports/production-mode.md lists them and how to check.
 */
/**
 * The Lufthansa group brands on turnsthe.page, the demo's domain (its main host
 * lufthansa.turnsthe.page): each brand has its first-level host <brand>.turnsthe.page and helper
 * hosts <brand>-<role>.turnsthe.page (lufthansa-edge, lufthansa-cn, lufthansa-forms). Only these
 * brands, not the whole domain (other demos may live there). The one list: the site
 * (isTurnsThePageHost, isDemoHost) and lh-edge (the head-URL rewrite) read it.
 */
export const TURNSTHE_PAGE_BRANDS = ['lufthansa', 'discover', 'ita', 'cargo', 'airdolomiti'];
export const TURNSTHE_PAGE_DOMAIN = 'turnsthe.page';
export const TURNSTHE_PAGE_HOST = new RegExp(`^(${TURNSTHE_PAGE_BRANDS.join('|')})(-[a-z0-9-]+)?\\.turnsthe\\.page$`);

/** The brand of a turnsthe.page host (lufthansa-cn.turnsthe.page: lufthansa), or null. */
export function turnsThePageBrandOf(hostname) {
  const m = String(hostname || '').toLowerCase().match(TURNSTHE_PAGE_HOST);
  return m ? m[1] : null;
}

export const DEMO_HOSTS = [
  /^(localhost|127\.0\.0\.1)$/,
  TURNSTHE_PAGE_HOST,
  /\.aem\.(page|live)$/,
  /\.hlx\.(page|live)$/,
  /\.workers\.dev$/,
];

const pageHost = () => (typeof window !== 'undefined' ? window.location.hostname : '');

/** Whether a host name is one of the brand hosts on turnsthe.page (default: the page's). */
export function isTurnsThePageHost(hostname = pageHost()) {
  return TURNSTHE_PAGE_HOST.test(String(hostname || '').toLowerCase());
}

/** Whether a host name is a demo host (default: the page's). */
export function isDemoHost(hostname = pageHost()) {
  const host = String(hostname || '').toLowerCase();
  return DEMO_HOSTS.some((re) => re.test(host));
}
