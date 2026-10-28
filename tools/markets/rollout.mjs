/* eslint-disable no-console, max-len, no-restricted-syntax, no-continue, import/extensions -- dev tooling */
/**
 * Choice B rolled out to www's en and de roots (all `pilot`, served on lhedge only), in batches of
 * about 10 countries: first the countries with only en and de roots, then the en and de roots of
 * the others (tools/source-export/feeds/sitemaps). A root of a country that already has rows
 * (at/en) joins its country's batch.
 *
 *   --batches                       the batches and their roots
 *   --plan <n> [--out-dir dir]      capture lists for tools/importer/bd-session.mjs (run lists, not
 *                                   committed): the roots' homepages, their own pages, the pages
 *                                   compared with the language version (COMPARE), and for batch 1
 *                                   the same-day references of the language versions (refs)
 *   --rows <n> [--apply]            the locale table rows from the homepage captures: name (www's
 *                                   country and language label), countryName (its country part,
 *                                   per language), homeAirport (the booking form's preselected
 *                                   origin), currency (the prices shown); timeZone and shopLang are
 *                                   not on www's homepage: null and listed. --apply writes
 *                                   tools/markets/locale-data.json
 *   --own <n>                       the roots' own pages: www's market-only URLs without the AEM
 *                                   configuration pages, URLs only in stale sitemap files and test
 *                                   pages (those listed)
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(root, 'tools/source-export/feeds/sitemaps');
const SNAP = path.join(root, 'tools/importer/bd-snapshots/www.lufthansa.com');
const LANGS = ['en', 'de'];
const VERSIONS = { en: 'de/en', de: 'de/de' };
// the pages compared per root with the language version (en paths; the root's own slug from the
// page groups): the flight offers page and two pages with local content (airports, services)
export const COMPARE = ['/de/en/flights', '/de/en/airport-information', '/de/en/additional-services'];
// batch 1: same-day references of the pages where ch lacked lead texts (report ch-choice-b.md)
export const LEAD_TEXT_PAGES = ['/de/en/additional-services', '/de/en/100-years', '/de/en/320', '/de/en/32n', '/de/de/book-and-manage/stopover'];
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

/** The batches: [{n, countries, roots}] (roots: the en and de roots without a row yet). */
export function batches(roots = read(path.join(DATA, 'roots.json')).roots, table = read(path.join(root, 'tools/markets/locale-data.json')).roots, size = 10) {
  const byCc = {};
  roots.filter((r) => r.ownSitemap).forEach((r) => { (byCc[r.cc] ||= []).push(r.ll); });
  // rows of the rollout (a `batch` field) stay in their batch
  const has = (k) => Boolean(table[k]) && !table[k].batch;
  const todo = (cc) => byCc[cc].filter((ll) => LANGS.includes(ll) && !has(`${cc}/${ll}`)).sort().map((ll) => `${cc}/${ll}`);
  const countries = Object.keys(byCc).filter((cc) => todo(cc).length).sort();
  const onlyEnDe = countries.filter((cc) => byCc[cc].every((ll) => LANGS.includes(ll)));
  const others = countries.filter((cc) => !onlyEnDe.includes(cc));
  const out = [];
  [onlyEnDe, others].forEach((list) => {
    for (let i = 0; i < list.length; i += size) {
      // a remainder of one or two countries joins the batch before it
      const rest = list.length - (i + size);
      const cs = list.slice(i, rest > 0 && rest < 3 ? list.length : i + size);
      out.push({ n: out.length + 1, countries: cs, roots: cs.flatMap(todo) });
      i += cs.length - size;
    }
  });
  return out;
}

let groupsCache;
const groups = () => {
  groupsCache ||= JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(DATA, 'groups.json.gz')))).groups;
  return groupsCache;
};
const first = (v) => [v || []].flat()[0];

/**
 * A page of the language version in another root (its page group), or null. A group with
 * several URLs of the root (www's /ae/de/flights and /ae/de/fluege) gives the one with the path
 * of the language version's page the replica has (de/de/fluege for a de root), else the first.
 */
export function counterpart(enPath, rootKey, list = groups()) {
  const g = list.find((x) => [x.paths['de/en'] || []].flat().includes(enPath) || [x.paths['de/de'] || []].flat().includes(enPath));
  if (!g) return null;
  const urls = [g.paths[rootKey] || []].flat();
  const version = VERSIONS[rootKey.split('/')[1]];
  // the language version's page the replica has (de/de/fluege, not de/de/flights)
  const own = [g.paths[version] || []].flat().filter((o) => fs.existsSync(path.join(root, 'content', `${o}.plain.html`)));
  const same = urls.find((u) => own.some((o) => o.slice(version.length + 1) === u.slice(rootKey.length + 1)));
  return same || first(urls) || null;
}

/** The own pages of a root: {keep, left: [{path, why}]}. */
export function ownPages(rootKey, marketOnly = read(path.join(DATA, 'market-only.json')).roots, stats = read(path.join(DATA, 'stats.json'))) {
  const stale = new Set(stats.urlsOnlyInStaleFiles || []);
  const keep = [];
  const left = [];
  (marketOnly[rootKey] || []).forEach(([p]) => {
    if (/\/configuration(\/|$)/.test(p)) left.push({ path: p, why: 'AEM configuration page' });
    else if (stale.has(p)) left.push({ path: p, why: 'only in a stale sitemap file' });
    else if (/(^|[/-])test([-/]|$)|\/test[a-z0-9-]*$|-test$/i.test(p)) left.push({ path: p, why: 'test page' });
    else keep.push(p);
  });
  return { keep: keep.sort(), left };
}

const CURRENCIES = 'EUR CHF GBP USD AED SAR QAR KWD BHD OMR JOD EGP ILS TRY PLN CZK HUF RON BGN RSD MKD ALL BAM HRK DKK SEK NOK ISK UAH GEL AMD AZN INR SGD MYR THB PHP IDR VND AUD NZD ZAR NGN KES ETB ERN SDG LYD IQD IRR LBP MUR MVR CDF MDL CAD MXN BRL ARS CLP COP PEN CRC PAB VES JPY KRW CNY HKD TWD KZT BYN RUB MAD DZD TND AOA XAF'.split(' ');
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#39;/g, "'");

/**
 * What a homepage capture says: {label, airport, currency}. airport: the booking form's
 * preselected origin, else the fare teaser's origin when all its routes start there (offer links'
 * OriginCode counts are no evidence: dk/de links Aalborg more often than Copenhagen); currency:
 * the most frequent currency next to a price, in text and attributes (prices sit in aria-labels).
 */
export function homepageFacts(html) {
  const label = (html.match(/class="country-language-text">([^<]+)</) || [])[1]?.trim() || null;
  let airport = null;
  const teaser = new Set();
  for (const m of html.matchAll(/data-dcep="([^"]*)"/g)) {
    const json = decode(m[1]);
    const v = json.match(/"preselectedOrigin"\s*:\s*"([A-Z]{3})"/);
    if (v && !airport) [, airport] = v;
    if (/"fareTeaserManualTravels"/.test(json)) [...json.matchAll(/"origin"\s*:\s*"([A-Z]{3})"/g)].forEach((o) => teaser.add(o[1]));
  }
  if (!airport && teaser.size === 1) [airport] = [...teaser];
  const plain = decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')).replace(/&nbsp;|\u00a0/g, ' ');
  const counts = {};
  const re = new RegExp(`(?:\\b(${CURRENCIES.join('|')})\\s?\\d)|(?:\\d[\\d.,]*\\s?(${CURRENCIES.join('|')})\\b)|(€\\s?\\d|\\d[\\d.,]*\\s?€)`, 'g');
  [...plain.matchAll(re)].forEach((m) => {
    const c = m[1] || m[2] || (m[3] ? 'EUR' : null);
    if (c) counts[c] = (counts[c] || 0) + 1;
  });
  const currency = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  return { label, airport, currency };
}

/** The locale-data rows of a batch's roots from their homepage captures: {rows, missing}. */
export function rowsOf(batchRoots, snapDir = SNAP) {
  const facts = {};
  batchRoots.forEach((k) => {
    // a capture of another page (www sent the session to another root: al/en to al/de) is no
    // evidence: then the page data of the capture the document was imported from
    const own = (html) => html && new RegExp(`<link rel="canonical" href="https://www\\.lufthansa\\.com/${k}/homepage"`).test(html);
    const raw = path.join(snapDir, `${k}/homepage.html`);
    const cleaned = path.join(root, 'tools/source-export/pages', k, 'homepage/cleaned.html');
    const html = [raw, cleaned].filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f, 'utf8')).find((h, i) => i === 1 || own(h));
    facts[k] = html ? homepageFacts(html) : null;
  });
  const rows = {};
  const missing = [];
  batchRoots.forEach((k) => {
    const [cc] = k.split('/');
    const f = facts[k];
    if (!f) { missing.push(`${k}: no homepage capture (no row)`); return; }
    // the country's name per language: its label's country part in each of its en and de roots
    // (a root of the country that already has a row: that row's name)
    const existing = read(path.join(root, 'tools/markets/locale-data.json')).roots;
    const countryOf = (l) => facts[`${cc}/${l}`]?.label?.split('|')[0].trim()
      || Object.entries(existing).find(([key, r]) => key.startsWith(`${cc}/`) && !r.batch && r.countryName?.[l])?.[1].countryName[l] || null;
    const countryName = { en: countryOf('en'), de: countryOf('de') };
    const row = {
      status: 'pilot', documents: 'language', name: f.label, countryName, homeAirport: f.airport, currency: f.currency, timeZone: null, shopLang: null,
    };
    const unknown = ['name', 'homeAirport', 'currency'].filter((x) => !row[x]);
    ['en', 'de'].forEach((l) => { if (!countryName[l]) unknown.push(`countryName.${l}`); });
    row.unverified = [...unknown, 'timeZone', 'shopLang'];
    unknown.forEach((x) => missing.push(`${k}: ${x} not found on the homepage`));
    rows[k] = row;
  });
  return { rows, missing };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
  const all = batches();
  if (argv.includes('--batches')) {
    all.forEach((b) => console.log(`batch ${b.n}: ${b.countries.length} countries, ${b.roots.length} roots: ${b.roots.join(' ')}`));
    process.exit(0);
  }
  const pick = (name) => all.find((b) => b.n === Number(opt(name)));
  if (argv.includes('--own')) {
    const b = pick('own');
    b.roots.forEach((k) => {
      const o = ownPages(k);
      console.log(`${k}: ${o.keep.length} own pages${o.keep.length ? `: ${o.keep.join(' ')}` : ''}; left out ${o.left.length}`);
      o.left.filter((x) => x.why !== 'AEM configuration page').forEach((x) => console.log(`  left out (${x.why}): ${x.path}`));
      const conf = o.left.filter((x) => x.why === 'AEM configuration page').length;
      if (conf) console.log(`  left out: ${conf} AEM configuration pages`);
    });
    process.exit(0);
  }
  if (argv.includes('--plan')) {
    const b = pick('plan');
    const outDir = opt('out-dir', '/tmp/art/rollout');
    fs.mkdirSync(outDir, { recursive: true });
    const url = (p) => `https://www.lufthansa.com${p}`;
    const pages = [];
    const compare = [];
    b.roots.forEach((k) => {
      pages.push(`/${k}/homepage`);
      ownPages(k).keep.forEach((p) => pages.push(p));
      COMPARE.forEach((en) => {
        const lang = k.split('/')[1];
        const from = lang === 'en' ? en : counterpart(en, 'de/de');
        if (from && !fs.existsSync(path.join(root, 'content', `${from}.plain.html`))) throw new Error(`${from}: no language document`);
        const p = counterpart(en, k);
        if (p) { pages.push(p); compare.push({ root: k, page: p, language: from }); } else compare.push({ root: k, page: null, language: from });
      });
    });
    const refs = new Set();
    compare.filter((c) => c.page).forEach((c) => refs.add(c.language));
    if (b.n === 1) LEAD_TEXT_PAGES.forEach((p) => { refs.add(p); if (p.startsWith('/de/en/')) refs.add(counterpart(p, 'de/de')); });
    fs.writeFileSync(path.join(outDir, `batch${b.n}-pages.txt`), `${[...new Set(pages)].map(url).join('\n')}\n`);
    fs.writeFileSync(path.join(outDir, `batch${b.n}-refs.txt`), `${[...refs].filter(Boolean).map(url).join('\n')}\n`);
    fs.writeFileSync(path.join(outDir, `batch${b.n}-compare.json`), `${JSON.stringify(compare, null, 1)}\n`);
    console.log(`batch ${b.n}: ${new Set(pages).size} pages, ${[...refs].filter(Boolean).length} references; compare pairs ${compare.filter((c) => c.page).length} (no counterpart: ${compare.filter((c) => !c.page).map((c) => `${c.root} ${c.language}`).join(', ') || 'none'})`);
    process.exit(0);
  }
  if (argv.includes('--rows')) {
    const b = pick('rows');
    const { rows, missing } = rowsOf(b.roots);
    Object.entries(rows).forEach(([k, r]) => console.log(`${k}: ${r.name} | ${JSON.stringify(r.countryName)} | ${r.homeAirport} | ${r.currency}`));
    missing.forEach((m) => console.log(`  missing: ${m}`));
    if (argv.includes('--apply')) {
      const f = path.join(root, 'tools/markets/locale-data.json');
      const data = read(f);
      Object.entries(rows).forEach(([k, r]) => { data.roots[k] = { ...r, batch: b.n }; });
      fs.writeFileSync(f, `${JSON.stringify(data, null, 2)}\n`);
      console.log(`locale-data.json: ${Object.keys(rows).length} rows added`);
    }
    process.exit(0);
  }
  if (argv.includes('--docs')) {
    // the roots' homepages and own pages imported from their captures and made the root's own,
    // nav and footer copied from the language version; the upload list and the allowlist
    const b = pick('docs');
    const run = (args) => execFileSync('node', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const url = (p) => `https://www.lufthansa.com${p}`;
    const captured = (p) => fs.existsSync(path.join(SNAP, `${p}.html`));
    const homes = b.roots.map((k) => `/${k}/homepage`).filter(captured);
    const own = b.roots.flatMap((k) => ownPages(k).keep).filter(captured);
    const restore = () => execFileSync('git', ['checkout', '--', 'tools/importer/import-progress.json', ...['homepage', 'info'].flatMap((t) => [`tools/importer/urls-${t}.txt`, `tools/importer/reports/import-${t}.report.xlsx`])], { cwd: root });
    // the importer's document name: Edge Delivery has no upper case or underscores in names
    // (www's /fi/en/.../worldwide_offers1 is the document worldwide-offers1: a redirect row)
    const docName = (p) => p.toLowerCase().replace(/_/g, '-');
    const renamed = own.filter((p) => docName(p) !== p);
    if (!argv.includes('--no-import')) {
      try {
        if (homes.length) console.log(run(['tools/importer/import-batch.mjs', 'homepage', '--force', ...homes.flatMap((p) => ['--url', url(p)])]).trim().split('\n').pop());
        if (own.length) console.log(run(['tools/importer/import-batch.mjs', 'info', '--force', ...own.flatMap((p) => ['--url', url(p)])]).trim().split('\n').pop());
      } finally {
        restore();
      }
      if (homes.length) console.log(run(['tools/importer/postprocess-media.mjs', ...homes]).trim().split('\n').pop());
    }
    const out = [];
    b.roots.forEach((k) => {
      const pages = [...homes, ...own.map(docName)].filter((p) => p.startsWith(`/${k}/`) && fs.existsSync(path.join(root, 'content', `${p}.plain.html`)));
      if (pages.length) out.push(run(['tools/markets/root-docs.mjs', '--own-root', k, ...pages.flatMap((p) => ['--page', p])]).trim());
      out.push(run(['tools/markets/root-docs.mjs', '--from', VERSIONS[k.split('/')[1]], '--to', k, '--doc', 'nav', '--doc', 'footer']).trim());
    });
    console.log(out.join('\n'));
    const docs = [...homes, ...own.map(docName), ...b.roots.flatMap((k) => [`/${k}/nav`, `/${k}/footer`])].filter((p) => fs.existsSync(path.join(root, 'content', `${p}.plain.html`)));
    renamed.forEach((p) => console.log(`www's ${p} is the document ${docName(p)}: a redirect row ${p} -> ${docName(p)} keeps www's URL`));
    const sites = path.join(root, 'tools/importer/sites/lh-com.json');
    const allow = read(sites);
    allow.paths = [...new Set([...allow.paths, ...docs])];
    fs.writeFileSync(sites, `${JSON.stringify(allow, null, 2)}\n`);
    const list = path.join(opt('out-dir', '/tmp/art/rollout'), `batch${b.n}-upload.txt`);
    fs.writeFileSync(list, `${docs.join('\n')}\n`);
    console.log(`batch ${b.n}: ${homes.length} homepages, ${own.length} own pages, ${b.roots.length * 2} nav and footer documents; upload list ${list}; not captured: ${b.roots.map((k) => `/${k}/homepage`).filter((p) => !captured(p)).join(' ') || 'none'}`);
    process.exit(0);
  }
  if (argv.includes('--compare')) {
    // per root the compared pages against the language version's www page of the same day
    // (else the capture its document was imported from)
    const b = pick('compare');
    const { facts, compare } = await import('./compare-sample.mjs');
    const PAGES = path.join(root, 'tools/source-export/pages');
    const REF = path.join(root, 'tools/source-export/market-ref');
    const pairs = read(path.join(opt('out-dir', '/tmp/art/rollout'), `batch${b.n}-compare.json`));
    const rows = pairs.filter((c) => c.page).map((c) => {
      const [cc, ll] = c.root.split('/');
      const a = facts(c.page, cc, ll);
      const refDir = fs.existsSync(path.join(REF, c.language, 'cleaned.html')) ? REF : PAGES;
      const ref = facts(c.language, 'de', ll, refDir);
      if (!a || !ref) return { ...c, status: a ? 'language page not captured' : 'not captured' };
      const d = compare(a, ref);
      const differs = d.textOnlyHere > 0 || d.textOnlyReference > 0 || !d.componentsSame;
      return {
        ...c, status: differs ? 'differs' : 'same', reference: refDir === REF ? 'same day' : 'import capture', textShared: d.textShared, onlyHere: d.examplesHere, onlyLanguage: d.examplesReference, nHere: d.textOnlyHere, nLanguage: d.textOnlyReference, components: d.componentsSame ? '' : `+${d.componentsHere.join(',')} -${d.componentsReference.join(',')}`,
      };
    });
    fs.writeFileSync(path.join(root, `tools/reports/markets/rollout-batch${b.n}-compare.json`), `${JSON.stringify(rows, null, 1)}\n`);
    rows.forEach((r) => console.log(`${r.status.padEnd(9)} ${r.page} vs ${r.language}${r.status === 'differs' ? ` (${r.reference}): ${r.nHere} only here ${JSON.stringify(r.onlyHere.slice(0, 2))}, ${r.nLanguage} only language ${JSON.stringify(r.onlyLanguage.slice(0, 2))} ${r.components}` : ''}`));
  }
}
