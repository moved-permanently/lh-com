/**
 * Small helpers shared by the parity scripts (capture, compare, run-batch).
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { parseArgs } = require('util');

const ROOT = path.resolve(__dirname, '../..');
const DEFAULT_STATE = path.join(ROOT, 'tools/reports/parity/state');

/**
 * Parses --key value options; exits with usage on unknown options or missing required ones.
 * @param {Object} options util.parseArgs option spec (all strings unless type is given)
 * @param {string[]} required names that must be present
 * @param {string} usage usage line printed on error
 */
function getArgs(options, required, usage) {
  let values;
  try {
    ({ values } = parseArgs({ options, strict: true, allowPositionals: false }));
  } catch (e) {
    process.stderr.write(`${e.message}\nusage: ${usage}\n`);
    process.exit(2);
  }
  const missing = required.filter((k) => values[k] === undefined);
  if (missing.length) {
    process.stderr.write(`missing --${missing.join(', --')}\nusage: ${usage}\n`);
    process.exit(2);
  }
  return values;
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Writes JSON via tmp file + rename so a crash never leaves a half-written file. */
function writeJsonAtomic(file, data) {
  mkdirp(path.dirname(file));
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`);
  fs.renameSync(tmp, file);
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return fallback;
  }
}

function appendJsonl(file, data) {
  mkdirp(path.dirname(file));
  fs.appendFileSync(file, `${JSON.stringify(data)}\n`);
}

function rmSafe(file) {
  try {
    fs.unlinkSync(file);
  } catch (e) {
    // already gone
  }
}

/** A capture is tried once and retried once. */
const MAX_ATTEMPTS = 2;
const isOk = (c) => Boolean(c) && (c.status === 'ok' || c.status === 'provided');
/**
 * Whether run-batch.js should run a capture: it has a URL, is not ok and has attempts left. A
 * source screenshot given as a file (srcPng: "provided", or "missing" while it is not there yet)
 * has no URL and is never captured; its page waits for the file.
 */
function needsCapture(c) {
  return Boolean(c) && Boolean(c.url) && c.status !== 'missing' && !isOk(c) && (c.attempts || 0) < MAX_ATTEMPTS;
}

/**
 * The executable of the installed playwright browser build of a kind ("chromium",
 * "chromium_headless_shell") in dir (PLAYWRIGHT_BROWSERS_PATH): the highest revision that has
 * `exe` (its path under the build's folder), else null. The image's builds change with it
 * (standing order 11 of 2026-11-12: chromium-1208 became chromium-1254).
 */
function installedBrowser(kind, exe, dir = process.env.PLAYWRIGHT_BROWSERS_PATH) {
  if (!dir || !fs.existsSync(dir)) return null;
  const re = new RegExp(`^${kind}-(\\d+)$`);
  const found = fs.readdirSync(dir).map((d) => [d, d.match(re)]).filter(([, m]) => m)
    .sort((a, b) => Number(b[1][1]) - Number(a[1][1]))
    .map(([d]) => path.join(dir, d, exe))
    .find((f) => fs.existsSync(f));
  return found || null;
}

/** Our hosts: Edge Delivery's, lh-edge's (turnsthe.page) and a local server. */
const isOwnHost = (host) => /(^|\.)aem\.(live|page)$/.test(host) || /(^|\.)turnsthe\.page$/.test(host)
  || host === 'localhost' || host === '127.0.0.1';
/** Foreign hosts a capture of our pages may reach: OneTrust's consent hosts (no airline's). */
const CONSENT_HOSTS = ['cdn.cookielaw.org', 'geolocation.onetrust.com'];

/**
 * For a capture of one of our pages (aem.live, aem.page, localhost), the test of the request
 * URLs it may load: our hosts, the consent hosts, data: and blob: URLs. Its scripts call
 * www.lufthansa.com directly (scripts/lh-data.js) and lh-proxy, which forwards to www; a capture
 * must never reach an airline host (standing order 12 of 2026-11-13). Chrome's
 * --host-resolver-rules do not stop them behind an HTTP proxy, so capture.js aborts the others in
 * the browser. Null for any other target (a recording of www): nothing aborted, as before.
 * @param {string} url the page captured
 * @returns {((u: URL) => boolean)|null}
 */
function ownHostFilter(url) {
  let host;
  try {
    host = new URL(url).hostname;
  } catch (e) {
    return null;
  }
  if (!isOwnHost(host)) return null;
  return (u) => u.protocol === 'data:' || u.protocol === 'blob:'
    || isOwnHost(u.hostname) || CONSENT_HOSTS.includes(u.hostname);
}

/**
 * The local copy of a web font a capture of our pages asks a foreign host for: styles/fonts.css
 * and the brand themes load their fonts from our path first (404 on aem.live), then from the
 * airline's www (/digitalhangar/design-system/...). The recording drops hold www's files at the
 * same paths, so PARITY_FONTS points capture.js at them. The file for a font URL (.woff2, .woff,
 * .ttf, .otf) under one of dirs at the URL's path (query ignored), else null; never a file
 * outside the directories.
 * @param {URL} u the request URL
 * @param {string[]} dirs directories holding www's paths (a drop's root)
 * @returns {string|null}
 */
function mirroredFont(u, dirs) {
  let rel;
  try {
    rel = decodeURIComponent(u.pathname);
  } catch (e) {
    return null;
  }
  if (!/\.(woff2?|ttf|otf)$/i.test(rel)) return null;
  const found = dirs.map((dir) => {
    const root = path.resolve(dir);
    const file = path.resolve(root, `.${path.posix.normalize(`/${rel}`)}`);
    return file.startsWith(`${root}${path.sep}`) && fs.existsSync(file) && fs.statSync(file).isFile()
      ? file : null;
  }).find(Boolean);
  return found || null;
}

/**
 * The one airline call a capture of our pages may have answered from a recording (standing order
 * 22): Discover's offers grid's price call, www.lufthansa.com's destinationfinder FRA/E for
 * months 0_11, RETURN, under X-Portal FOUR_Y. Every other request to an airline host stays
 * refused.
 */
const ANSWERABLE_QUERY = { months: '0_11', tripType: 'RETURN' };
const ANSWERABLE_CALLS = [
  // Discover's offers page and homepages (standing orders 22, 23, 25)
  { path: '/service/api/destinationfinder/destination/finder/FRA/E', portal: 'FOUR_Y' },
  // lufthansa.com's offers grid in the UK (/gb/en/flights, standing order 25)
  { path: '/service/api/destinationfinder/destination/finder/LHR/E', portal: 'LH' },
  // lufthansa.com's /de/en/flights, /de/de/fluege and /at/de/fluege (lufthansa-api-002,
  // standing order 27)
  { path: '/service/api/destinationfinder/destination/finder/FRA/E', portal: 'LH' },
  { path: '/service/api/destinationfinder/destination/finder/VIE/E', portal: 'LH' },
  // lufthansa.com's other grids (lufthansa-api-003, standing order 27): the markets' default
  // airports
  ...['ZRH', 'SJJ', 'BOM', 'BEY', 'RUH', 'FCO', 'HND', 'WAW', 'LIS', 'ARN'].map((origin) => ({
    path: `/service/api/destinationfinder/destination/finder/${origin}/E`, portal: 'LH',
  })),
  // the page's default airport (no price; standing order 27: without it a capture of /in/en/flights
  // asks its home airport DEL, www's load BOM), no query
  { path: '/service/api/defaultAirport', portal: 'LH', query: {} },
];
const ANSWERABLE = {
  host: 'www.lufthansa.com',
  query: ANSWERABLE_QUERY,
  calls: ANSWERABLE_CALLS,
  // the first call, as before (standing order 22's tests read ANSWERABLE.path and .portal)
  path: ANSWERABLE_CALLS[0].path,
  portal: ANSWERABLE_CALLS[0].portal,
};

/** The answerable call a URL (and portal) is, or null. */
function answerableCall(rawUrl, portal) {
  let u;
  try {
    u = new URL(rawUrl);
  } catch (e) {
    return null;
  }
  if (u.protocol !== 'https:' || u.hostname !== ANSWERABLE.host) return null;
  // a path may be answerable under more than one portal (FRA/E: Discover's FOUR_Y,
  // lufthansa.com's LH)
  const wanted = portal === undefined ? null : String(portal).toUpperCase();
  const call = ANSWERABLE_CALLS.find((c) => c.path === u.pathname
    && (wanted === null || c.portal === wanted));
  if (!call) return null;
  const query = call.query || ANSWERABLE_QUERY;
  const keys = [...u.searchParams.keys()];
  const want = Object.keys(query);
  if (keys.length !== want.length) return null;
  if (!want.every((k) => u.searchParams.get(k) === query[k])) return null;
  return call;
}

function isAnswerable(rawUrl, portal) {
  return Boolean(answerableCall(rawUrl, portal));
}

/**
 * The recorded answers of PARITY_ANSWERS: a plain file ({recordedAt, url, portal, status, body}
 * or a list of them) or a HAR (log.entries). Throws for a file under the site's data/recorded/
 * (the 21 October recording), an answer recorded on 2026-10-21 or without a recording date, and
 * an answer that is not the offers page's price call (ANSWERABLE).
 * @param {string} file
 * @returns {{status: number, contentType: string, body: string, recordedAt: string}[]}
 */
function loadRecordedAnswers(file) {
  const abs = path.resolve(file);
  const recorded = path.join(ROOT, 'data', 'recorded');
  if (abs === recorded || abs.startsWith(`${recorded}${path.sep}`)) {
    throw new Error(`${file}: the site's data/recorded (the 21 October recording) is never a parity answer`);
  }
  const data = JSON.parse(fs.readFileSync(abs, 'utf8'));
  const header = (list, name) => {
    const h = (list || []).find((x) => String(x.name).toLowerCase() === name);
    return h ? h.value : undefined;
  };
  // the Captures child's archive (standing order 23): <name>.request.json, its body in <name>.json,
  // checked against the record's sha256
  if (data && Array.isArray(data.requests) && /\.request\.json$/.test(abs)) {
    const bodyFile = abs.replace(/\.request\.json$/, '.json');
    const text = fs.readFileSync(bodyFile, 'utf8');
    const digest = crypto.createHash('sha256').update(text).digest('hex');
    if (data.sha256 && digest !== data.sha256) {
      throw new Error(`${bodyFile}: its sha256 ${digest} is not the record's ${data.sha256}`);
    }
    data.requests.forEach((r) => {
      const root = /^https?:\/\/[^/]+\/[a-z]{2}\/([a-z]{2})(?:\/|$)/.exec(data.pageUrl || '');
      Object.assign(r, {
        recordedAt: r.at,
        portal: r.xPortalRequestHeader,
        body: text,
        language: root ? root[1] : undefined,
        site: r.xPortalSiteRequestHeader,
      });
    });
  }
  // the Captures child's page-load index (standing order 25): api/index.json, per page its
  // pageUrl and calls (url, at, xPortalRequestHeader, file under the archive, sha256); its
  // finder calls only
  if (Array.isArray(data) && data.length && data.every((p) => p && Array.isArray(p.calls))) {
    const base = path.dirname(path.dirname(abs));
    const found = [];
    data.forEach((page) => {
      const root = /^https?:\/\/[^/]+\/[a-z]{2}\/([a-z]{2})(?:\/|$)/.exec(page.pageUrl || '');
      const country = /^https?:\/\/[^/]+\/([a-z]{2})\/[a-z]{2}(?:\/|$)/.exec(page.pageUrl || '');
      page.calls.forEach((c) => {
        if ((c.method && c.method !== 'GET') || !isAnswerable(c.url, c.xPortalRequestHeader || '')) return;
        const bodyFile = path.resolve(base, c.file);
        if (!bodyFile.startsWith(`${base}${path.sep}`)) throw new Error(`${file}: ${c.file} is outside the archive`);
        const text = fs.readFileSync(bodyFile, 'utf8');
        const digest = crypto.createHash('sha256').update(text).digest('hex');
        if (c.sha256 && digest !== c.sha256) {
          throw new Error(`${bodyFile}: its sha256 ${digest} is not the index's ${c.sha256}`);
        }
        found.push({
          recordedAt: c.at,
          url: c.url,
          method: c.method,
          portal: c.xPortalRequestHeader,
          language: c.xPortalLanguageRequestHeader || (root ? root[1] : undefined),
          // the market (X-Portal-Site): recorded, else the page's country root
          site: c.xPortalSiteRequestHeader || (country ? country[1] : undefined),
          status: c.status,
          contentType: c.contentType,
          body: text,
        });
      });
    });
    if (!found.length) throw new Error(`${file}: no answerable price call in the index`);
    data.splice(0, data.length, ...found);
  }
  const raw = data && data.log && Array.isArray(data.log.entries)
    ? data.log.entries.map((e) => ({
      recordedAt: e.startedDateTime,
      url: e.request.url,
      method: e.request.method,
      portal: header(e.request.headers, 'x-portal'),
      language: header(e.request.headers, 'x-portal-language'),
      site: header(e.request.headers, 'x-portal-site'),
      status: e.response.status,
      contentType: (e.response.content && e.response.content.mimeType) || header(e.response.headers, 'content-type'),
      body: e.response.content ? e.response.content.text : '',
    }))
    : [].concat(data && Array.isArray(data.requests) ? data.requests : data);
  return raw.map((a) => {
    const at = a.recordedAt ? new Date(a.recordedAt) : null;
    if (!at || Number.isNaN(at.getTime())) throw new Error(`${file}: an answer without a recording date`);
    if (at.toISOString().startsWith('2026-10-21')) throw new Error(`${file}: an answer of the 21 October recording`);
    if ((a.method && a.method !== 'GET') || !isAnswerable(a.url, a.portal === undefined ? '' : a.portal)) {
      throw new Error(`${file}: ${a.url} (portal ${a.portal}) is not an answerable price call`);
    }
    return {
      path: new URL(a.url).pathname,
      status: Number(a.status) || 200,
      contentType: a.contentType || 'application/json',
      body: typeof a.body === 'string' ? a.body : JSON.stringify(a.body),
      recordedAt: at.toISOString(),
      // the answer's names are in the page's language (X-Portal-Language): that language only
      language: a.language ? String(a.language).toLowerCase() : null,
      // its portal and market (X-Portal, X-Portal-Site): those only (standing order 27)
      portal: a.portal ? String(a.portal).toUpperCase() : null,
      site: a.site ? String(a.site).toUpperCase() : null,
    };
  });
}

/**
 * The recorded answer to one browser request ({url, method, headers} with lower-case header
 * names), or null: the price call (GET, X-Portal FOUR_Y) from the newest answer, its CORS
 * preflight (OPTIONS) with 204, nothing else.
 */
function recordedAnswer(request, answers) {
  if (!answers || !answers.length) return null;
  const headers = request.headers || {};
  const cors = { 'access-control-allow-origin': '*' };
  if (request.method === 'OPTIONS' && isAnswerable(request.url)) {
    return {
      status: 204,
      headers: {
        ...cors,
        'access-control-allow-methods': 'GET',
        'access-control-allow-headers': headers['access-control-request-headers'] || '*',
      },
      body: '',
    };
  }
  if (request.method !== 'GET' || !isAnswerable(request.url, headers['x-portal'] || '')) return null;
  const lang = String(headers['x-portal-language'] || '').toLowerCase();
  const portal = String(headers['x-portal'] || '').toUpperCase();
  const site = String(headers['x-portal-site'] || '').toUpperCase();
  const { pathname } = new URL(request.url);
  const fitting = answers.filter((a) => (!a.path || a.path === pathname)
    && (!a.language || !lang || a.language === lang)
    && (!a.portal || !portal || a.portal === portal)
    && (!a.site || !site || a.site === site));
  if (!fitting.length) return null;
  const newest = [...fitting].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];
  return {
    status: newest.status,
    headers: { ...cors, 'content-type': newest.contentType },
    body: newest.body,
  };
}

module.exports = {
  ROOT,
  ANSWERABLE,
  loadRecordedAnswers,
  recordedAnswer,
  installedBrowser,
  ownHostFilter,
  mirroredFont,
  DEFAULT_STATE,
  getArgs,
  mkdirp,
  writeJsonAtomic,
  readJson,
  appendJsonl,
  rmSafe,
  MAX_ATTEMPTS,
  isOk,
  needsCapture,
};
