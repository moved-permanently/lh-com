/**
 * Small helpers shared by the parity scripts (capture, compare, run-batch).
 */
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

/** Our hosts: Edge Delivery's and a local server. */
const isOwnHost = (host) => /(^|\.)aem\.(live|page)$/.test(host) || host === 'localhost' || host === '127.0.0.1';
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

module.exports = {
  ROOT,
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
