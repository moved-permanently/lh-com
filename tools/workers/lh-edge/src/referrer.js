/**
 * The referrer check of AEM's Sling referrer filter for the state-changing POSTs lh-edge answers
 * itself (.changelocale, .mfe.html, the Good for Train kiosk): only from an allowlist of hosts.
 * Production's filter: a browser POST to /deeplink/partner on www with Referer example.com 403,
 * austrian.com and flyedelweiss.com 200 (2026-10-28).
 *
 * vars (off by default, so no answer changes):
 * - REFERRER_FILTER: "on" checks, anything else ("off") doesn't;
 * - REFERRER_ALLOW_HOSTS: comma list, exact (www.example.com) or wildcard (*.example.com: any
 *   subdomain; not x.example.com.other.test). Production's list would be, for example:
 *   www.lufthansa.com, *.lufthansa.com, *.austrian.com, *.swiss.com, *.brusselsairlines.com,
 *   *.discover-airlines.com, *.ita-airways.com, *.lufthansagroup.com, *.ana.co.jp,
 *   *.airdolomiti.it, *.flyedelweiss.com;
 * - REFERRER_ALLOW_EMPTY: "true" lets a POST without Referer and Origin through.
 * Read: Referer, else Origin. A relative value, the literal Origin "null" and the request's own
 * public host pass. Only browsers are checked (User-Agent with Mozilla or Opera, as Sling).
 * A refusal answers 403.
 */
import { publicHost } from './edge.js';

const hostsOf = (v) => String(v || '').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);

/** Whether a host is on the allowlist (exact, or *.domain for any subdomain of domain). */
export function hostAllowed(host, allow) {
  const h = String(host || '').toLowerCase();
  return allow.some((a) => (a.startsWith('*.') ? h.endsWith(a.slice(1)) && h.length > a.length - 1 : h === a));
}

/** The 403 for a POST the referrer check refuses, or null when it may go on. */
export function referrerRefusal(request, env) {
  if (String(env.REFERRER_FILTER || '').trim() !== 'on') return null;
  const agent = request.headers.get('user-agent') || '';
  if (!/Mozilla|Opera/.test(agent)) return null;
  const value = (request.headers.get('referer') || request.headers.get('origin') || '').trim();
  let ok;
  if (!value) {
    ok = String(env.REFERRER_ALLOW_EMPTY || '').trim() === 'true';
  } else if (value === 'null' || (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value) && !value.startsWith('//'))) {
    // relative (a path on this host), or an opaque origin
    ok = true;
  } else {
    let host = '';
    try {
      host = new URL(value.startsWith('//') ? `https:${value}` : value).hostname.toLowerCase();
    } catch (e) {
      host = '';
    }
    const own = publicHost(request, env).toLowerCase().split(':')[0];
    ok = Boolean(host) && (host === own || hostAllowed(host, hostsOf(env.REFERRER_ALLOW_HOSTS)));
  }
  if (ok) return null;
  return new Response('Forbidden', { status: 403, headers: { 'content-type': 'text/plain', 'x-lh-edge-route': 'referrer-filter' } });
}
