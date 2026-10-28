/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/prefer-default-export -- dev tooling */
/**
 * Smoke check of lh-edge's answers for today's paths (the four roots, app screens, feeds, DAM
 * images and video, entry redirects, sitemaps, llms, search, the server endpoints lh-edge answers,
 * the ch market rows): status, location, content type, content range and a hash of the body
 * (nonces masked) per request. Run before and after a deploy: every answer must be the same.
 * Baselines per host are kept in smoke/<host>.json (README "Smoke check").
 *
 * Usage:
 *   node tools/workers/lh-edge/smoke.mjs --host https://lhedge.bbird.live --check     (against smoke/lhedge.bbird.live.json)
 *   node tools/workers/lh-edge/smoke.mjs --host https://lhedge.bbird.live --update    (writes that baseline)
 *   node tools/workers/lh-edge/smoke.mjs --host https://lhedge.bbird.live --out before.json
 *   node tools/workers/lh-edge/smoke.mjs --compare before.json after.json
 *   [--video /content/dam/…/x.mp4] [--subtitle /content/dam/…/x.vtt]: the DAM video checked with
 *   Range: bytes=0-99, and its subtitle file
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const VIDEO = opt('video', '/content/dam/video/c3/202405-em/austragungsorte/lh-em-en-uts-lh-com.mp4');
const SUBTITLE = opt('subtitle', '/content/dam/video/c3/202405-em/austragungsorte/lh-em-de-audiodescription-lh-com.vtt');
const json = { 'content-type': 'application/json' };
const portal = (site, language) => ({ 'x-portal': 'LH', 'x-portal-site': site, ...(language ? { 'x-portal-language': language } : {}) });

export const CHECKS = [
  // the four roots: pages, .plain.html, nav and footer
  ...['/de/en/homepage', '/de/en/baggage', '/de/en/feedback-past-flight', '/de/de/homepage', '/de/de/gepaeck', '/at/de/homepage', '/at/de/fluege', '/gb/en/homepage', '/gb/en/flights',
    '/de/en/nav.plain.html', '/de/de/footer.plain.html', '/de/en/homepage.plain.html', '/de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history', '/de/en/no-such-page'].map((p) => ({ path: p })),
  // app screens, feeds, sheets, indexes
  ...['/content/mobile/lh/en/homepage.sdui', '/content/mobile/lh/de/articles.sdui', '/content/mobile/lh/en/articles.v2.sdui', '/graphql/execute.json/AllegrisUpgrade/AllegrisAircraftsList', '/graphql/execute.json/AllegrisUpgrade/AllegrisAircraftsList;airline=LH', '/graphql/execute.json/Travel-Regulations/TravelRegulationList',
    '/graphql/execute.json/mobileapp/whatsnewList', '/graphql/execute.json/Message-Center/CTI_Pages_for_APP', '/api/content/graphql/execute.json/AllegrisUpgrade/AllegrisAircraftsList', '/de/en/search-index.json', '/data/locale-map.json', '/xf/query-index.json', '/fleet-index.json',
    '/de/en/homepage.csi-owa-header.json', '/message-center/config/cti-pages.json'].map((p) => ({ path: p })),
  // DAM: PDFs, images, a video (a range) and its subtitles
  { path: '/content/dam/lufthansa-group/pdfs/lhg-power-of-attorney-form-en.pdf', method: 'HEAD' },
  { path: '/content/dam/lufthansa-group/pdfs/lh-poster-antonio-colomboni-48x73cm.pdf', method: 'HEAD' },
  { path: '/content/dam/lh/images/mobileapp/Lufthansa%20Insights%20V2.png' },
  { path: '/content/dam/lh/images/offers/destination/zzq-square.jpg' },
  {
    path: VIDEO, name: 'range 0-99', headers: { range: 'bytes=0-99' },
  },
  { path: SUBTITLE },
  // entry redirects (no cookie; the country and language headers fixed)
  ...['/', '/de', '/de/en', '/at', '/gb/en', '/us', '/xx', '/fr/fr', '/ch', '/ch/en', '/ch/de'].map((p) => ({ path: p, headers: { 'cf-ipcountry': 'DE', 'accept-language': 'en' } })),
  // the routes ahead of the market route (app view, SDUI, header and footer JSON, offline list,
  // micro-frontend page, aircraft list, llms.txt): the four roots, and ch (on lhedge a market root)
  ...['/de/en/baggage.solo_continue', '/de/de/gepaeck.solo_continue', '/de/en/airport-information.solo_continue', '/de/de/homepage.solo.continue.solo_continue',
    '/content/lh/markets/de/en/addresses-worldwide.sdui', '/de/en/addresses-worldwide.sdui',
    '/content/lh/markets/de/en/homepage.csi-owa-header.json', '/content/lh/markets/de/de/homepage.csi-owa-footer.json', '/content/lh/markets/at/de/homepage.csi-owa-footer.json', '/content/lh/markets/gb/en/homepage.csi-offline.json',
    '/de/en/book-and-manage/trip-management.mfe.html', '/de/en/addresses-worldwide.aircraft.json', '/de/de/llms.txt', '/at/llms.txt',
    '/ch/en/baggage.solo_continue', '/content/lh/markets/ch/en/addresses-worldwide.sdui', '/content/lh/markets/ch/de/homepage.csi-owa-header.json',
    '/content/lh/markets/ch/en/homepage.csi-offline.json', '/ch/en/addresses-worldwide.aircraft.json', '/ch/llms.txt'].map((p) => ({ path: p })),
  // the ch market roots' pages and sitemaps (lhedge: market roots; lhcom: its CDN sends /ch/... and
  // the sitemaps to lh-edge)
  ...['/ch/en/homepage', '/ch/de/homepage', '/ch/en/baggage', '/ch/de/gepaeck', '/sitemap/sitemap_lh_ch_en.xml', '/sitemap/sitemap_lh_ch_de.xml'].map((p) => ({ path: p })),
  // sitemaps, llms, well-known
  ...['/sitemap/sitemap_lh.xml', '/sitemap/sitemap_lh.xml.gz', '/sitemap/sitemap_lh_de_en.xml', '/sitemap/sitemap_lh_at_de.xml.gz', '/de/llms.txt', '/gb/llms.txt', '/robots.txt', '/service-worker.js',
    '/.well-known/assetlinks.json', '/.well-known/apple-app-site-association'].map((p) => ({ path: p })),
  // the server endpoints lh-edge answers itself
  {
    path: '/service/secured/api/search', method: 'POST', body: '{"phrase":"baggage"}', headers: { ...json, ...portal('GB', 'en') },
  },
  {
    path: '/service/secured/api/search', name: 'DE en', method: 'POST', body: '{"phrase":"baggage"}', headers: { ...json, ...portal('DE', 'en') },
  },
  { path: '/service/secured/api/core/authenticate/loginPageUrl?state=smoke' },
  { path: '/service/secured/api/core/booking/defaultairport', headers: { 'x-portal-site': 'AT' } },
  { path: '/service/secured/api/core/booking/bookinglist' },
  {
    path: '/apps/dcep/deeplink/goodfortrain/stele', method: 'POST', body: 'Country=de&Language=en&Filekey=ABC123&Lastname=Test', headers: { 'content-type': 'application/x-www-form-urlencoded' },
  },
];

const keyOf = (c) => `${c.method || 'GET'} ${c.path}${c.name ? ` [${c.name}]` : ''}`;
// nonces, dates in JSON, and the cache node and time on Fastly's error page (Details: cache-…)
const mask = (text) => text.replace(/\snonce="[^"]*"/g, '').replace(/"(etag|date)":"[^"]*"/g, '')
  .replace(/<p>Details: cache-[^<]*<\/p>/g, '');

async function run(host) {
  const out = [];
  for (const c of CHECKS) {
    const resp = await fetch(`${host}${c.path}`, {
      method: c.method || 'GET', headers: c.headers || {}, body: c.body, redirect: 'manual',
    });
    const buf = Buffer.from(await resp.arrayBuffer());
    const type = resp.headers.get('content-type') || '';
    const text = /text|json|xml|javascript/.test(type) ? mask(buf.toString('utf8')) : null;
    out.push({
      key: keyOf(c),
      path: c.path,
      method: c.method || 'GET',
      status: resp.status,
      location: resp.headers.get('location') || '',
      type,
      range: resp.headers.get('content-range') || undefined,
      length: text === null ? Number(resp.headers.get('content-length') || buf.length) : undefined,
      hash: crypto.createHash('sha256').update(text ?? buf).digest('hex').slice(0, 16),
      route: resp.headers.get('x-lh-edge-route') || '',
    });
  }
  return out;
}

/** The differences of two runs, by check (older files without keys: by method and path). */
function compare(a, b) {
  const key = (x) => x.key || `${x.method} ${x.path}`;
  const after = new Map(b.map((y) => [key(y), y]));
  const diffs = [];
  a.forEach((x) => {
    const y = after.get(key(x));
    if (!y) return;
    const keys = ['status', 'location', 'type', 'range', 'hash', 'length', 'route'].filter((k) => x[k] !== y[k]);
    if (keys.length) diffs.push(`${key(x)}: ${keys.map((k) => `${k} ${x[k]} -> ${y[k]}`).join('; ')}`);
  });
  const only = (xs, ys) => xs.filter((x) => !ys.some((y) => key(y) === key(x))).map(key);
  return { diffs, missing: only(a, b), added: only(b, a) };
}

const report = (a, b) => {
  const { diffs, missing, added } = compare(a, b);
  console.log(`smoke: ${a.length} checks, ${diffs.length} differ${added.length ? `, ${added.length} new` : ''}${missing.length ? `, ${missing.length} not run` : ''}`);
  diffs.forEach((d) => console.log(`  ${d}`));
  added.forEach((k) => console.log(`  new: ${k}`));
  missing.forEach((k) => console.log(`  not run: ${k}`));
  process.exitCode = diffs.length ? 1 : 0;
};

const baselineOf = (host) => path.join(here, 'smoke', `${new URL(host).host}.json`);

if (argv.includes('--compare')) {
  const i = argv.indexOf('--compare');
  const [a, b] = [argv[i + 1], argv[i + 2]].map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
  report(a, b);
} else if (argv.includes('--host')) {
  const host = opt('host');
  const res = await run(host);
  console.log(`smoke: ${res.length} checks: ${res.map((r) => r.status).join(' ')}`);
  if (opt('out')) fs.writeFileSync(opt('out'), `${JSON.stringify(res, null, 1)}\n`);
  if (argv.includes('--update')) {
    fs.mkdirSync(path.dirname(baselineOf(host)), { recursive: true });
    fs.writeFileSync(baselineOf(host), `${JSON.stringify(res, null, 1)}\n`);
    console.log(`baseline written: ${path.relative(process.cwd(), baselineOf(host))}`);
  }
  if (argv.includes('--check')) report(JSON.parse(fs.readFileSync(baselineOf(host), 'utf8')), res);
}
