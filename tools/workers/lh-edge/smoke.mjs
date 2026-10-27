/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/prefer-default-export -- dev tooling */
/**
 * Smoke check of lh-edge's answers for today's paths (the four roots, app screens, feeds, DAM,
 * entry redirects, sitemaps, llms, search): status, location, content type and a hash of the
 * body (nonces masked) per request. Run before and after a deploy and compare: every answer
 * must be the same.
 *
 * Usage: node tools/workers/lh-edge/smoke.mjs --host https://lhedge.bbird.live --out before.json
 *        node tools/workers/lh-edge/smoke.mjs --compare before.json after.json
 */
import fs from 'node:fs';
import crypto from 'node:crypto';

export const CHECKS = [
  // the four roots: pages, .plain.html, nav and footer
  ...['/de/en/homepage', '/de/en/baggage', '/de/en/feedback-past-flight', '/de/de/homepage', '/de/de/gepaeck', '/at/de/homepage', '/at/de/fluege', '/gb/en/homepage', '/gb/en/flights',
    '/de/en/nav.plain.html', '/de/de/footer.plain.html', '/de/en/homepage.plain.html', '/de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history', '/de/en/no-such-page'].map((path) => ({ path })),
  // app screens, feeds, sheets, indexes
  ...['/content/mobile/lh/en/homepage.sdui', '/content/mobile/lh/de/articles.sdui', '/graphql/execute.json/AllegrisUpgrade/AllegrisAircraftsList', '/graphql/execute.json/Travel-Regulations/TravelRegulationList',
    '/graphql/execute.json/mobileapp/whatsnewList', '/api/content/graphql/execute.json/AllegrisUpgrade/AllegrisAircraftsList', '/de/en/search-index.json', '/data/locale-map.json', '/xf/query-index.json', '/fleet-index.json',
    '/de/en/homepage.csi-owa-header.json', '/message-center/config/cti-pages.json'].map((path) => ({ path })),
  // DAM
  { path: '/content/dam/lufthansa-group/pdfs/lhg-power-of-attorney-form-en.pdf', method: 'HEAD' },
  { path: '/content/dam/lufthansa-group/pdfs/lh-poster-antonio-colomboni-48x73cm.pdf', method: 'HEAD' },
  // entry redirects (no cookie; the country and language headers fixed)
  ...['/', '/de', '/de/en', '/at', '/gb/en', '/us', '/xx', '/fr/fr', '/ch', '/ch/en', '/ch/de'].map((path) => ({ path, headers: { 'cf-ipcountry': 'DE', 'accept-language': 'en' } })),
  // the routes ahead of the market route (app view, SDUI, header and footer JSON, offline list,
  // micro-frontend page, aircraft list, llms.txt): the four roots, and ch (on lhedge a market root)
  ...['/de/en/baggage.solo_continue', '/de/de/gepaeck.solo_continue', '/content/lh/markets/de/en/addresses-worldwide.sdui', '/de/en/addresses-worldwide.sdui',
    '/content/lh/markets/de/en/homepage.csi-owa-header.json', '/content/lh/markets/at/de/homepage.csi-owa-footer.json', '/content/lh/markets/gb/en/homepage.csi-offline.json',
    '/de/en/book-and-manage/trip-management.mfe.html', '/de/en/addresses-worldwide.aircraft.json', '/de/de/llms.txt', '/at/llms.txt',
    '/ch/en/baggage.solo_continue', '/content/lh/markets/ch/en/addresses-worldwide.sdui', '/content/lh/markets/ch/de/homepage.csi-owa-header.json',
    '/content/lh/markets/ch/en/homepage.csi-offline.json', '/ch/en/addresses-worldwide.aircraft.json', '/ch/llms.txt'].map((path) => ({ path })),
  // sitemaps, llms, well-known, search
  ...['/sitemap/sitemap_lh.xml', '/sitemap/sitemap_lh.xml.gz', '/sitemap/sitemap_lh_de_en.xml', '/sitemap/sitemap_lh_at_de.xml.gz', '/de/llms.txt', '/gb/llms.txt', '/robots.txt', '/service-worker.js'].map((path) => ({ path })),
  {
    path: '/service/secured/api/search',
    method: 'POST',
    body: '{"phrase":"baggage"}',
    headers: {
      'content-type': 'application/json', 'x-portal': 'LH', 'x-portal-site': 'GB', 'x-portal-language': 'en',
    },
  },
];

const mask = (text) => text.replace(/\snonce="[^"]*"/g, '').replace(/"(etag|date)":"[^"]*"/g, '');

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
      path: c.path,
      method: c.method || 'GET',
      status: resp.status,
      location: resp.headers.get('location') || '',
      type,
      length: text === null ? Number(resp.headers.get('content-length') || buf.length) : undefined,
      hash: crypto.createHash('sha256').update(text ?? buf).digest('hex').slice(0, 16),
      route: resp.headers.get('x-lh-edge-route') || '',
    });
  }
  return out;
}

function compare(a, b) {
  const diffs = [];
  a.forEach((x, i) => {
    const y = b[i];
    const keys = ['status', 'location', 'type', 'hash', 'length', 'route'].filter((k) => x[k] !== y[k]);
    if (keys.length) diffs.push(`${x.method} ${x.path}: ${keys.map((k) => `${k} ${x[k]} -> ${y[k]}`).join('; ')}`);
  });
  return diffs;
}

const argv = process.argv.slice(2);
if (argv.includes('--compare')) {
  const i = argv.indexOf('--compare');
  const [a, b] = [argv[i + 1], argv[i + 2]].map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
  const diffs = compare(a, b);
  console.log(`smoke: ${a.length} checks, ${diffs.length} differ`);
  diffs.forEach((d) => console.log(`  ${d}`));
  process.exitCode = diffs.length ? 1 : 0;
} else if (argv.includes('--host')) {
  const res = await run(argv[argv.indexOf('--host') + 1]);
  fs.writeFileSync(argv[argv.indexOf('--out') + 1], `${JSON.stringify(res, null, 1)}\n`);
  console.log(`smoke: ${res.length} checks: ${res.map((r) => r.status).join(' ')}`);
}
