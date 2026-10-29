/* eslint-disable no-console, max-len, import/prefer-default-export, import/extensions -- tooling */
/**
 * Imports one capture batch of Discover's pages (brief 124) offline from their snapshots
 * (tools/importer/bd-snapshots/www.discover-airlines.com) with lh-com's import scripts into
 * content-sites/lh-discover/content, as the demo did (brief 95): per page the template whose
 * components it has (articles: insights; the destination finder grid: hub; feedback forms: form;
 * the timetable: flight-status; the aircraft slideshow: fleet; check-in and booking entries:
 * app-entry; homepages: homepage; everything else: info), then site-postprocess.mjs (the
 * www.lufthansa.com URLs of lh-com's importers back to www.discover-airlines.com, links between
 * the site's pages relative), after adding the batch's documents to the allowlist
 * tools/importer/sites/lh-discover.json. Live widgets the importers would flatten into text (the
 * security waiting times) become a link to the page on www.discover-airlines.com (withLinkOuts).
 * Discover's forms get their lh-forms id, the same root's thank-you and error pages and www's
 * maxlengths (withDiscoverForm), noindex pages www's robots value (withRobots).
 * Links to www's DAM files become site-relative edsDamPath links (discover-dam.mjs relativeDamLinks;
 * the batch's files are copied with discover-dam.mjs --list --download --upload, its posters and
 * subtitle tracks switched with --switch).
 * Pages whose snapshot is missing are listed.
 * Writes content-sites/lh-discover/runs/<name>-import.json: path -> template.
 *
 * Usage: node tools/importer/discover-import.mjs --list content-sites/lh-discover/runs/batch-01.txt [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { relativeDamLinks } from './discover-dam.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const HOST = 'www.discover-airlines.com';
const W = path.join(root, 'content-sites/lh-discover');
const SNAP = path.join(root, 'tools/importer/bd-snapshots', HOST);
const CI = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts';
// the import reads copies of the snapshots whose own lufthansa.com URLs (real Lufthansa links,
// e.g. on gift-voucher and offers) point at a placeholder host: lh-com's importers turn relative
// URLs into www.lufthansa.com ones, which site-postprocess.mjs maps to Discover's host; it turns
// the placeholder back into www.lufthansa.com afterwards
export const PLACEHOLDER = 'www.lufthansa-com.invalid';
const MAPPED = path.join(W, 'snapshots');

/** A snapshot with its own lufthansa.com URLs on the placeholder host. */
// (the host ends where no host character follows: also redirect_uri=https://www.lufthansa.com&amp;…)
export const withPlaceholder = (html) => html.replace(/(?:https?:)?\/\/(?:www\.)?lufthansa\.com(?![\w.-])/gi, `https://${PLACEHOLDER}`);

// links out to the page on Discover's host (a widget a service answers on www): on this host
// during the import, so neither the importers nor site-postprocess.mjs (which makes links to the
// site's own pages relative) touch them; Discover's host afterwards, in the batch's documents
export const LINK_OUT = 'link-out.invalid';

// iframes lh-com's embed block plays (parsers/media-nodes.js embedUrl): imported as embeds
const EMBEDDED = /^https:\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com|lufthansa-inflightentertainment\.com)\//;
const text = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * A snapshot whose live widgets are a link to the page on www (the importers flatten them into
 * text or drop them): the security waiting times (an airport select), labelled with the select's
 * own label; an iframe component the embed block doesn't play (the timetable, the claims form),
 * labelled with the iframe's title, else the page's H1.
 */
export const withLinkOuts = (html, p) => html.replace(/<div class="securitywaitingtime">[\s\S]*?<\/maui-select><\/form><\/div><\/div><\/div>/g, (m) => {
  const label = (m.match(/buttontriggerlabel="([^"]+)"/) || [])[1] || HOST;
  return `<div class="securitywaitingtime"><p><a href="https://${LINK_OUT}${p}">${label}</a></p></div>`;
}).replace(/<div class="iframe[ "][^>]*>\s*<div class="iframe-wrapper[^>]*>\s*<iframe\b([^>]*)>[\s\S]*?<\/iframe>\s*<\/div>\s*<\/div>/g, (m, attrs) => {
  const src = (attrs.match(/\ssrc="([^"]+)"/) || [])[1] || '';
  if (EMBEDDED.test(src)) return m;
  const label = (attrs.match(/\stitle="([^"]+)"/) || [])[1] || text((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '') || HOST;
  return `<div class="iframe-link-out"><p><a href="https://${LINK_OUT}${p}">${label}</a></p></div>`;
});

// Discover's forms (the info template's form-core parser writes lufthansa.com's form ids and its
// /error.html): the lh-forms id per page name, the same root's thank-you and error pages where www
// has them (www.discover-airlines.com's answers, 2026-10-29), www's maxlength values
export const DISCOVER_FORMS = {
  'register-assistance-requirements-online': 'discover-assistance',
  'add-sports-baggage': 'discover-add-sports-baggage',
  'register-ammunition': 'discover-register-ammunition',
  'register-hunting-firearm': 'discover-register-hunting-firearm',
  'register-sporting-firearm': 'discover-register-sporting-firearm',
  'register-animal-cargo-hold': 'discover-register-animal-cargo-hold',
  'register-animal-cabin': 'discover-register-animal-cabin',
  'compensation-baggage': 'discover-compensation-baggage',
  'other-concerns': 'discover-other-concerns',
  'buccaneers-season-kickoff': 'discover-buccaneers-season-kickoff',
};
// the contact forms share contact-form/thank-you and contact-form/error
const CONTACT = /\/my-bookings\/manage\/customer-service\/contact-form\/[^/]+$/;
// roots where www answers 404 for a form's thank-you or error page ('*': every root)
const THANK_YOU_404 = {
  'register-animal-cabin': ['de/en', 'ca/en', 'ca/fr', 'us/en', 'xx/en', 'xx/fr'],
  'register-assistance-requirements-online': ['de/en', 'us/en', 'xx/en'],
  'register-ammunition': ['us/en', 'xx/en'],
  'buccaneers-season-kickoff': '*',
};
const ERROR_404 = {
  'register-animal-cabin': ['de/en'],
  'register-assistance-requirements-online': ['de/en'],
  'buccaneers-season-kickoff': '*',
};
// a root's language version (option B: the language documents; market roots get them there)
const LANGUAGE_VERSIONS = { en: 'de/en', de: 'de/de', fr: 'xx/fr' };
const CONFIG_ROW = /<div><div>(?:(?!<\/div><div>)[\s\S])*?<\/div><div>config<\/div><div>(?:form|success|error)<\/div>(?:<div><\/div>){7}<\/div>/g;
const configRow = (name, value) => `<div><div>${value}</div><div>config</div><div>${name}</div>${'<div></div>'.repeat(7)}</div>`;
const linkRow = (name, href) => configRow(name, `<a href="${href}">${href}</a>`);
const is404 = (table, page, key) => table[page] === '*' || (table[page] || []).includes(key);

/**
 * www's maxlength from the value its markup shows: the attribute often holds a value written twice
 * (2020, 100100, 66) or two values run together (1413: 14 and 13); a doubled value is its half, two
 * run-together values the larger (never stricter than www), any other value as it is.
 */
export function maxlengthOf(value) {
  const s = String(value);
  const half = s.length / 2;
  if (s.length % 2 === 0 && s.slice(0, half) === s.slice(half)) return s.slice(0, half);
  if (Number(s) < 1000) return s;
  const splits = [...Array(s.length - 1).keys()].map((i) => [s.slice(0, i + 1), s.slice(i + 1)])
    .filter(([, b]) => !b.startsWith('0'))
    .sort((x, y) => Math.abs(x[0].length - x[1].length) - Math.abs(y[0].length - y[1].length));
  return splits.length ? String(Math.max(Number(splits[0][0]), Number(splits[0][1]))) : s;
}

/**
 * A Discover form document with its config rows (form: the lh-forms id; success and error: the
 * language version's thank-you and error pages, none where www has none) and www's maxlengths; a
 * document without a Discover form as it is. Also used for later batches and roots.
 */
export function withDiscoverForm(doc, p) {
  const m = p.match(/^\/([a-z]{2})\/([a-z]{2})\/(.+)$/);
  if (!m || !/<div class="form[ "]/.test(doc)) return doc;
  const [, cc, ll, rest] = m;
  const key = `${cc}/${ll}`;
  const page = rest.split('/').pop();
  const id = DISCOVER_FORMS[page];
  if (!id) return doc;
  const version = LANGUAGE_VERSIONS[ll] || key;
  const own = `/${version}/${rest}`;
  const base = CONTACT.test(own) ? own.replace(/\/[^/]+$/, '') : own;
  const contactError = `/${version}/my-bookings/manage/customer-service/contact-form/error`;
  const rows = [configRow('form', id)];
  if (!is404(THANK_YOU_404, page, key)) rows.push(linkRow('success', `${base}/thank-you`));
  rows.push(linkRow('error', is404(ERROR_404, page, key) ? contactError : `${base}/error`));
  let placed = false;
  const out = doc.replace(CONFIG_ROW, () => {
    if (placed) return '';
    placed = true;
    return rows.join('');
  });
  return out.replace(/maxlength=(\d+)/g, (x, v) => `maxlength=${maxlengthOf(v)}`);
}

/** A document with www's robots value when its snapshot is noindex (the sweepstake). */
export function withRobots(doc, html) {
  const robots = ((html || '').match(/<meta name="robots" content="([^"]*)"/i) || [])[1] || '';
  if (!/noindex/i.test(robots) || /<div><div>Robots<\/div>/i.test(doc)) return doc;
  const value = robots.split(',').map((x) => x.trim()).filter(Boolean).join(', ');
  return doc.replace('<div class="metadata">', `<div class="metadata"><div><div>Robots</div><div>${value}</div></div>`);
}

/** The template of a page from its path and snapshot. */
export function templateOf(p, html) {
  if (/^\/[a-z]{2}\/[a-z]{2}\/homepage$/.test(p)) return 'homepage';
  if (/^\/[a-z]{2}\/[a-z]{2}\/articles(\/|$)/.test(p)) return 'insights';
  if (/class="topoffersdestinationfinder/.test(html)) return 'hub';
  if (/class="feedbackforms/.test(html)) return 'form';
  if (/class="flightstatustimetable/.test(html)) return 'flight-status';
  if (/class="slideshow/.test(html)) return 'fleet';
  if (/checkinpassengerreceiptentry|class="[^"]*dcep-quick-actions/.test(html)) return 'app-entry';
  return 'info';
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const list = opt('list');
  const name = path.basename(list).replace(/\.txt$/, '');
  const urls = fs.readFileSync(path.resolve(root, list), 'utf8').split('\n').map((u) => u.trim()).filter(Boolean);
  const byTemplate = {};
  const missing = [];
  const out = {};
  const linkOuts = [];
  urls.forEach((u) => {
    const p = new URL(u).pathname;
    const f = path.join(SNAP, `${p}.html`);
    if (!fs.existsSync(f)) { missing.push(p); return; }
    const html = fs.readFileSync(f, 'utf8');
    const t = templateOf(p, html);
    const copy = path.join(MAPPED, HOST, `${p}.html`);
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    const mapped = withLinkOuts(withPlaceholder(html), p);
    if (mapped.includes(`https://${LINK_OUT}`)) linkOuts.push(p);
    fs.writeFileSync(copy, mapped);
    (byTemplate[t] ||= []).push(u);
    out[p] = t;
  });
  console.log(`${name}: ${Object.entries(byTemplate).map(([t, l]) => `${t} ${l.length}`).join(', ')}; no snapshot: ${missing.length ? missing.join(' ') : 'none'}`);
  if (!argv.includes('--dry-run')) {
    Object.entries(byTemplate).forEach(([t, l]) => {
      const listFile = path.join(W, `urls-${name}-${t}.txt`);
      fs.writeFileSync(listFile, `${l.join('\n')}\n`);
      const log = execFileSync('node', [`${CI}/run-bulk-import.js`, '--import-script', `tools/importer/import-${t}.bundle.js`, '--urls', listFile, '--force', '--html-dir', MAPPED], {
        cwd: root, env: { ...process.env, WORKSPACE_PATH: W }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024,
      });
      const lines = log.split('\n').filter((x) => /imported|failed|error/i.test(x) && !/wss:|endpoint/i.test(x));
      console.log(`${t}: ${lines.slice(-2).join(' | ')}`);
    });
    // the documents into the allowlist (site-postprocess makes links to them relative)
    const sites = path.join(root, 'tools/importer/sites/lh-discover.json');
    const allow = JSON.parse(fs.readFileSync(sites, 'utf8'));
    const docName = (p) => p.toLowerCase().replace(/_/g, '-').replace(/-{2,}/g, '-');
    const made = Object.keys(out).map(docName).filter((p) => fs.existsSync(path.join(W, 'content', `${p}.plain.html`)));
    allow.paths = [...new Set([...allow.paths, ...made])];
    // their links out stay absolute in later runs too (site-postprocess.mjs)
    if (linkOuts.length) allow.linkOuts = [...new Set([...(allow.linkOuts || []), ...linkOuts.map(docName)])];
    fs.writeFileSync(sites, `${JSON.stringify(allow, null, 1)}\n`);
    // Discover's forms (config rows, maxlengths) and www's noindex, before the links are mapped
    made.forEach((p) => {
      const f = path.join(W, 'content', `${p}.plain.html`);
      const doc = fs.readFileSync(f, 'utf8');
      const src = Object.keys(out).find((k) => docName(k) === p);
      const next = withRobots(withDiscoverForm(doc, p), fs.readFileSync(path.join(SNAP, `${src}.html`), 'utf8'));
      if (next !== doc) fs.writeFileSync(f, next);
    });
    // the host mapping only for this batch's documents (earlier ones have their own Lufthansa URLs
    // back); links to the new documents become relative in every document
    const mapOnly = path.join(W, 'runs', `${name}-upload.txt`);
    fs.writeFileSync(mapOnly, `${made.join('\n')}\n`);
    console.log(execFileSync('node', ['tools/importer/site-postprocess.mjs', '--site', 'lh-discover', '--source-host', HOST, '--snapshots', path.join(MAPPED, HOST), '--real-placeholder', PLACEHOLDER, '--map-only', mapOnly], { cwd: root, encoding: 'utf8' }).trim().split('\n').slice(-3)
      .join('\n'));
    made.forEach((p) => {
      const f = path.join(W, 'content', `${p}.plain.html`);
      const doc = fs.readFileSync(f, 'utf8');
      // links to www's DAM files: site-relative links to their copies (edsDamPath; DA, AEM and R2
      // through lh-edge's DAM route), made by discover-dam.mjs for each batch
      const next = relativeDamLinks(doc.split(`https://${LINK_OUT}`).join(`https://${HOST}`));
      if (next !== doc) fs.writeFileSync(f, next);
    });
    fs.writeFileSync(path.join(W, 'runs', `${name}-import.json`), `${JSON.stringify({ templates: out, documents: made, missing }, null, 1)}\n`);
    console.log(`${made.length} documents; upload list runs/${name}-upload.txt`);
  }
}
