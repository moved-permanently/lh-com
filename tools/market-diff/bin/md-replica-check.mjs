/* eslint-disable import/extensions, max-len, no-await-in-loop, no-console, no-promise-executor-return, object-curly-newline, object-property-newline, prefer-template -- dev tooling */
// market-diff tier 2: for every pair md-compare.mjs found to differ, does OUR replica already show the root's own text on
// the root (a section with `markets` metadata, a donor document, an own document published since)? Reads the page as the
// root is served (lib/served.mjs, brief 468): --read root (default) the replica's answer for the root path as lh-edge's
// market route renders it (<replica host>/<root>/<rest>.plain.html: the source document with the sections the root does
// not get dropped); --read version, for a host without the route (aem.page), the root's own document, else the version's
// with the sections whose markets leave the root's country out dropped (scripts/market-rules.js). Either way each fragment
// block's document goes in its place, filtered for the country (fragments load in the browser), so "covered" means
// served the same. Then looks for the texts only the www root page has (should be there) and the texts only the www
// version page has (should not be). Requests go to our own hosts only. A pair is two www paths; our replica is asked
// where the write step puts the page (lib/replica-paths.mjs: the site's slug map's write target, the canonical path once
// a root's flag is on; with every flag off the www path, as before).
//
// usage: node bin/md-replica-check.mjs --results <md-compare out dir> --fetch <fetch dir> --replica https://<host>
//          [--profile aem-html|tap-next] [--host <www host>] [--concurrency 4] [--read root|version]
//          [--slug-map <a copy of tools/slugs/<site>.json, e.g. with flags on>]
// Writes <results dir>/replica.jsonl and replica.tsv: covered (>= 80 % of the root's own texts there, <= 20 % of the
// version's), missing (< 50 % of the root's texts, >= 50 % of the version's: the replica shows the version's text),
// partly (in between), no-text-diff (only links, media or attributes differ: check by eye), replica-404, replica-error.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { parseHTML } from 'linkedom';
import { diffTokens } from '../lib/diff.mjs';
import { servedView, countryOfRoot } from '../lib/served.mjs';
import { replicaMapOf, requestsOf } from '../lib/replica-paths.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const RES = path.resolve(opt('results'));
const FETCH = path.resolve(opt('fetch', RES));
const REPLICA = opt('replica');
const PROFILE = opt('profile', 'aem-html');
const HOST = opt('host', '');
const CONC = Number(opt('concurrency', '2'));
const READ = opt('read', 'root');
const SLUG_MAP = replicaMapOf(HOST, { file: opt('slug-map') });
const { pageFacts } = await import(PROFILE === 'tap-next' ? '../lib/tap-next.mjs' : '../lib/aem-html.mjs');
const rootStyle = PROFILE === 'tap-next' ? 'll-cc' : 'cc/ll';
const fetched = new Map();
fs.readFileSync(path.join(FETCH, 'fetch.jsonl'), 'utf8').split('\n').filter(Boolean).forEach((l) => { const r = JSON.parse(l); fetched.set(r.path, r); });
const body = (p) => zlib.gunzipSync(fs.readFileSync(path.join(FETCH, fetched.get(p).file))).toString('utf8');
const rows = fs.readFileSync(path.join(RES, 'results.jsonl'), 'utf8').split('\n').filter(Boolean).map(JSON.parse)
  .filter((r) => r.verdict === 'differs' && r.class !== 'widget');
const simple = (s) => s.toLowerCase().replace(/[\u200b-\u200d\ufeff]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const texts = (ops, op) => ops.filter((o) => o.op === op && o.t.startsWith('"')).map((o) => simple(o.t.slice(1, -1)))
  .filter((t) => t.length >= 12 && !/^\{date/.test(t));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function check(r) {
  const a = pageFacts(body(r.versionPath), r.version, { rootStyle, host: HOST });
  const b = pageFacts(body(r.rootPath), r.root, { rootStyle, host: HOST });
  const d = diffTokens(a.content, b.content);
  const rootOnly = [...new Set(texts(d.ops, '+'))];
  const versionOnly = [...new Set(texts(d.ops, '-'))];
  const [rest, versionRest] = requestsOf(r, SLUG_MAP).replica;
  const url = `${REPLICA}${rest}.plain.html`;
  // our own hosts; a failed connection is asked again twice (Node's fetch drops one now and then)
  const get = async (p) => {
    for (let i = 0; ; i += 1) {
      try {
        const res = await fetch(`${REPLICA}${p}.plain.html`, { redirect: 'manual', headers: { 'user-agent': 'market-diff replica check' } });
        return { status: res.status, text: res.status === 200 ? await res.text() : '' };
      } catch (e) {
        if (i === 2) throw e;
        await sleep(2000 * (i + 1));
      }
    }
  };
  let view;
  try {
    view = await servedView({ get, rootPath: rest, versionPath: versionRest, country: countryOfRoot(r.root, rootStyle), read: READ });
  } catch (e) { return { ...r, replica: 'replica-error', url, error: String(e).slice(0, 120) }; }
  if (view.status === 404) return { ...r, replica: 'replica-404', url };
  if (view.status !== 200) return { ...r, replica: 'replica-error', url, http: view.status };
  const { document } = parseHTML(`<html><body>${view.html}</body></html>`);
  const page = simple(document.body.textContent || '');
  const hit = (t) => page.includes(t);
  const fr = rootOnly.filter(hit).length;
  const fv = versionOnly.filter(hit).length;
  let replica;
  const pr = rootOnly.length ? fr / rootOnly.length : 1;
  const pv = versionOnly.length ? fv / versionOnly.length : 0;
  if (!rootOnly.length && !versionOnly.length) replica = 'no-text-diff';
  else if (pr >= 0.8 && pv <= 0.2) replica = 'covered';
  else if (pr < 0.5 && (!versionOnly.length || pv >= 0.5)) replica = 'missing';
  else replica = 'partly';
  return { ...r, replica, url, servedFrom: view.from, fragments: view.fragments, rootOnlyTexts: rootOnly.length, rootOnlyFound: fr, versionOnlyTexts: versionOnly.length, versionOnlyFound: fv,
    missingExample: rootOnly.find((t) => !hit(t))?.slice(0, 120) || '' };
}
const out = [];
for (let i = 0; i < rows.length; i += CONC) {
  out.push(...await Promise.all(rows.slice(i, i + CONC).map(check)));
  await sleep(250);
}
fs.writeFileSync(path.join(RES, 'replica.jsonl'), out.map((o) => JSON.stringify(o)).join('\n') + (out.length ? '\n' : ''));
fs.writeFileSync(path.join(RES, 'replica.tsv'), ['root\trest\tclass\treplica\troot_texts_found\tversion_texts_found\tmissing_example\turl',
  ...out.map((o) => [o.root, o.rest, o.class, o.replica, `${o.rootOnlyFound ?? ''}/${o.rootOnlyTexts ?? ''}`, `${o.versionOnlyFound ?? ''}/${o.versionOnlyTexts ?? ''}`, o.missingExample || '', o.url].join('\t'))].join('\n') + '\n');
const c = {};
out.forEach((o) => { c[o.replica] = (c[o.replica] || 0) + 1; });
console.log(JSON.stringify({ checked: out.length, ...c }));
