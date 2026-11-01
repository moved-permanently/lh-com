/* eslint-disable no-console -- check */
/**
 * Network check (not in the offline suite): OF1's client still treats a missing consent API
 * (window.of1Consent undefined) as allowed. lh-com relies on it on /of1 without OneTrust C0004:
 * we leave window.of1Consent undefined there, so the typed search keeps working while we record
 * nothing and answer no profile request (scripts/of1/gate.js consentApiWanted). Run it after each
 * OF1 release:
 *
 *   node tools/of1/check-client-consent.mjs [client URL]
 *
 * It downloads of1-client.js, takes only its consentGranted and pluginAllowed functions (nothing
 * else of the script runs) and evaluates them in an empty sandbox: no consent API -> allowed;
 * has() false -> blocked; has() true -> allowed. Exit 1 when one of them changed or the functions
 * are gone.
 */
import vm from 'node:vm';

const URL_DEFAULT = 'https://of1-gen-web-service.franklin-prod.workers.dev/sdk/of1-client.js';
const url = process.argv[2] || URL_DEFAULT;

const fail = (message) => {
  console.error(`FAIL ${message}`);
  process.exit(1);
};

const resp = await fetch(url);
if (!resp.ok) fail(`${url}: ${resp.status}`);
const source = await resp.text();

/** A top-level function's source by name (its braces balanced). */
function functionSource(name) {
  const start = source.search(new RegExp(`function ${name}\\s*\\(`));
  if (start < 0) return null;
  let depth = 0;
  for (let i = source.indexOf('{', start); i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

const granted = functionSource('consentGranted');
const allowed = functionSource('pluginAllowed');
if (!granted || !allowed) fail(`consentGranted or pluginAllowed not found in ${url} (the client changed: read its consent gate again)`);

const run = (consent) => {
  const sandbox = { window: consent === undefined ? {} : { of1Consent: consent } };
  vm.createContext(sandbox);
  return vm.runInContext(`${granted}\n${allowed}\n({ functional: consentGranted('functional'), allowed: pluginAllowed() })`, sandbox, { timeout: 1000 });
};

const cases = [
  ['no consent API (our /of1 without C0004)', undefined, true],
  ['has() false', { has: () => false }, false],
  ['has() true (with C0004)', { has: () => true }, true],
];
let ok = true;
cases.forEach(([label, consent, expected]) => {
  const result = run(consent);
  const pass = result.allowed === expected;
  ok = ok && pass;
  console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}: allowed ${result.allowed} (expected ${expected})`);
});
console.log(`${url}: ${source.length} bytes`);
if (!ok) fail('a missing consent API no longer counts as allowed, or has() changed meaning: /of1 without C0004 needs another plan');
console.log('OK: a missing consent API counts as allowed');
