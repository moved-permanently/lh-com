/* eslint-disable no-console, max-len, import/prefer-default-export, import/extensions -- tooling */
/**
 * Imports one capture batch of ITA's pages (lh-ita) offline from their snapshots
 * (tools/importer/bd-snapshots/www.ita-airways.com) with lh-com's import scripts into
 * content-sites/lh-ita/content, as discover-import.mjs does for lh-discover: per page the template
 * whose components it has (templateOf), then site-postprocess.mjs (the www.lufthansa.com URLs of
 * lh-com's importers back to www.ita-airways.com, links between the site's pages relative), after
 * adding the batch's documents to the allowlist tools/importer/sites/lh-ita.json.
 * Per document (one per language page):
 * - live widgets the importers would flatten (the security waiting times; the booking login of
 *   the manage-my-bookings page) become a link to the page on www.ita-airways.com (withLinkOuts;
 *   the login widget's cards are lh-com's carousel-cards, its booking-code card links to www);
 * - the MICE form gets its lh-forms id ita-mice (withItaForm; preview only until lh-forms knows it);
 * - the flight search hands off to shop.ita-airways.com from the market's airport (withFlightSearch);
 * - the check-in entry becomes the booking-lookup block (withCheckinTabs: in a tabs container as on
 *   lufthansa.com), its hand-off the page on www (withCheckinHandoff);
 * - metadata (withItaMetadata): the root's nav and footer documents (lh-com's locale table maps
 *   ITA's roots to lh-com's), `markets` (the market roots with the same page, from scope.json),
 *   www's robots value on noindex pages;
 * - links to www's DAM files become site-relative edsDamPath links (ita-dam.mjs relativeDamLinks;
 *   the files are copied with ita-dam.mjs --list --download --upload --switch).
 * Pages whose snapshot is missing are listed.
 * Writes content-sites/lh-ita/runs/<name>-import.json: path -> template.
 *
 * Usage: node tools/importer/ita-import.mjs --list content-sites/lh-ita/runs/batch-01.txt [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { relativeDamLinks } from './ita-dam.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const HOST = 'www.ita-airways.com';
const W = path.join(root, 'content-sites/lh-ita');
const SNAP = path.join(root, 'tools/importer/bd-snapshots', HOST);
const CI = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts';
// the source pages' own lufthansa.com URLs on a placeholder host during the import (as Discover)
export const PLACEHOLDER = 'www.lufthansa-com.invalid';
const MAPPED = path.join(W, 'snapshots');
const { stripScripts } = await import(path.join(CI, '../../excat-scrape-webpage/scripts/strip-scripts.js'));
export const withPlaceholder = (html) => html.replace(/(?:https?:)?\/\/(?:www\.)?lufthansa\.com(?![\w.-])/gi, `https://${PLACEHOLDER}`);

// links out to the page on www (a widget a service answers there): on this host during the import
export const LINK_OUT = 'link-out.invalid';
const EMBEDDED = /^https:\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com|lufthansa-inflightentertainment\.com)\//;
const text = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const h1Of = (html) => text((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g) || []).map((x) => x).find((x) => !/sr-only/.test(x)) || '');

/**
 * A snapshot whose live widgets are a link to the page on www: the security waiting times (an
 * airport select, labelled with its own label), the booking login widget (labelled with its
 * headline), iframes the embed block doesn't play (labelled with their title, else the H1).
 */
export const withLinkOuts = (html, p) => html.replace(/<div class="securitywaitingtime(?: section)?">[\s\S]*?<\/maui-select><\/form><\/div><\/div><\/div>/g, (m) => {
  const label = (m.match(/buttontriggerlabel="([^"]+)"/) || [])[1] || HOST;
  return `<div class="securitywaitingtime"><p><a href="https://${LINK_OUT}${p}">${label}</a></p></div>`;
}).replace(/<div class="iframe[ "][^>]*>\s*<div class="iframe-wrapper[^>]*>\s*<iframe\b([^>]*)>[\s\S]*?<\/iframe>\s*<\/div>\s*<\/div>/g, (m, attrs) => {
  const src = (attrs.match(/\ssrc="([^"]+)"/) || [])[1] || '';
  if (EMBEDDED.test(src)) return m;
  const label = (attrs.match(/\stitle="([^"]+)"/) || [])[1] || h1Of(html) || HOST;
  return `<div class="iframe-link-out"><p><a href="https://${LINK_OUT}${p}">${label}</a></p></div>`;
});

/**
 * A snapshot that loads nothing while it is imported (setContent would fetch its absolute
 * www.ita-airways.com URLs): a Content-Security-Policy meta tag refuses every subresource and allows
 * only the importer's inline script; the URLs stay in the markup (austrian-import.mjs the same).
 */
export const OFFLINE_CSP = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:";
export const withoutLoads = (html) => html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}<meta http-equiv="Content-Security-Policy" content="${OFFLINE_CSP}">`);

/** The end (index after its closing tag) of the div that opens at `start`, by div depth. */
export function divEnd(html, start) {
  const re = /<div\b|<\/div>/g;
  re.lastIndex = start;
  let depth = 0;
  let m = re.exec(html);
  while (m) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return m.index + m[0].length;
    m = re.exec(html);
  }
  return html.length;
}

/** The html with each div whose opening tag starts with `open` given to `edit` (its outer html). */
function editDivs(html, open, edit) {
  let out = '';
  let from = 0;
  let i = html.indexOf(open, from);
  while (i >= 0) {
    const end = divEnd(html, i);
    out += html.slice(from, i) + edit(html.slice(i, end));
    from = end;
    i = html.indexOf(open, from);
  }
  return out + html.slice(from);
}

/**
 * A snapshot whose check-in entry sits in a tabs container as on lufthansa.com (ITA's
 * .checkinpassengerreceiptentry stands alone; lh-com's app-entry importer reads it from
 * ".tabs:has(.checkinpassengerreceiptentry)" into the booking-lookup block). Only the entry's
 * markup changes (a wrapper div), the rest of the snapshot stays as captured.
 */
export function withCheckinTabs(html) {
  if (/class="tabs[ "][^>]*>\s*<div class="checkinpassengerreceiptentry/.test(html)) return html;
  return editDivs(html, '<div class="checkinpassengerreceiptentry', (el) => `<div class="tabs section">${el}</div>`);
}

/**
 * A snapshot whose teaser rows in a two-column view (ITA's "Related", "This might also interest
 * you": two teasers side by side) are a three-column view, which lh-com's info importer makes a
 * carousel-cards block (".threecolumn:has(.teaser)"; its two-column views with teasers are left
 * to the text flow, where the teasers stack). Column views nested in it are left as they are.
 */
export const withTeaserColumns = (html) => editDivs(html, '<div class="twocolumn', (el) => {
  if (!el.includes('class="teaser') || /<div class="(?:two|three|four)column/.test(el.slice(1))) return el;
  return el.replace('<div class="twocolumn', '<div class="threecolumn').replace('data-identifier="twocolumn"', 'data-identifier="threecolumn"');
});

// the booking-lookup's hand-off: www's check-in app is not reachable from the replica (and its
// target is not in the page), so a valid search opens the same page on www, nothing in the URL
export const withCheckinHandoff = (doc, p) => doc
  // the login widget's "Enter booking code" (lh-com: its own dialog) opens the page on www
  .split('href="#booking-code"').join(`href="https://${HOST}${p}"`).replace(/<div class="booking-lookup(?: [^"]*)?">/g, (m) => (/Submit URL/.test(doc) ? m : `${m}<div><div>Submit URL</div><div>https://${HOST}${p}</div></div>`));

// the MICE form (the only form of batch 1): its lh-forms id
export const ITA_FORMS = { mice: 'ita-mice' };
const CONFIG_ROW = /<div><div>(?:(?!<\/div><div>)[\s\S])*?<\/div><div>config<\/div><div>(?:form|success|error)<\/div>(?:<div><\/div>){7}<\/div>/g;
const configRow = (name, value) => `<div><div>${value}</div><div>config</div><div>${name}</div>${'<div></div>'.repeat(7)}</div>`;

/** An ITA form document with its form config row (the lh-forms id); others as they are. */
export function withItaForm(doc, p) {
  const id = ITA_FORMS[p.split('/').pop()];
  if (!id || !/<div class="form[ "]/.test(doc)) return doc;
  let placed = false;
  return doc.replace(CONFIG_ROW, () => {
    if (placed) return '';
    placed = true;
    return configRow('form', id);
  });
}

/** Metadata rows (name, value) added to the document's metadata block (made when it has none). */
export function withMetadataRows(doc, rows) {
  const add = rows.filter(([name]) => !new RegExp(`<div><div>${name}</div>`, 'i').test(doc));
  if (!add.length) return doc;
  const cells = add.map(([n, v]) => `<div><div>${n}</div><div>${v}</div></div>`).join('');
  if (doc.includes('<div class="metadata">')) return doc.replace('<div class="metadata">', `<div class="metadata">${cells}`);
  return `${doc.trimEnd()}\n<div><div class="metadata">${cells}</div></div>\n`;
}

/** The document's ITA metadata: nav and footer of its root, its markets, www's noindex. */
export function withItaMetadata(doc, p, html, markets = []) {
  const key = p.split('/').slice(1, 3).join('/');
  const rows = [['nav', `/${key}/nav`], ['footer', `/${key}/footer`]];
  if (markets.length) rows.push(['markets', markets.join(', ')]);
  const robots = ((html || '').match(/<meta name="robots" content="([^"]*)"/i) || [])[1] || '';
  if (/noindex/i.test(robots)) rows.push(['Robots', robots.split(',').map((x) => x.trim()).filter(Boolean).join(', ')]);
  return withMetadataRows(doc, rows);
}

// the flight search hands the search to ITA's shop (www's flight manager: shop.ita-airways.com, the
// same booking platform as Lufthansa's) and starts from the market's airport (www: Rome for it/*)
export const ITA_SHOP = 'https://shop.ita-airways.com/booking/availability';
// the market's airport per root, named in the root's language (www: Rome for the Italian market)
const DEFAULT_ORIGIN = { 'it/en': 'Rome (ROM)', 'it/it': 'Roma (ROM)' };

/** The document's flight-search blocks with the Shop row and the market's default origin. */
export function withFlightSearch(doc, p) {
  const key = p.split('/').slice(1, 3).join('/');
  return doc.replace(/<div class="flight-search(?: [^"]*)?">/g, (m) => {
    const rows = [`<div><div>Shop</div><div><a href="${ITA_SHOP}">${ITA_SHOP}</a></div></div>`];
    if (DEFAULT_ORIGIN[key]) rows.push(`<div><div>Default origin</div><div>${DEFAULT_ORIGIN[key]}</div></div>`);
    return `${m}${rows.join('')}`;
  });
}

/** The template of a page from its path and snapshot. */
export function templateOf(p, html) {
  // (homepage-new: the variant homepage some Italian-language roots have, al/it, be/it, ch/it)
  if (/^\/[a-z]{2}\/[a-z]{2}\/homepage(-new)?$/.test(p)) return 'homepage';
  if (/class="topoffersdestinationfinder/.test(html)) return 'hub';
  if (/class="flightstatustimetable/.test(html)) return 'flight-status';
  if (/class="slideshow/.test(html)) return 'fleet';
  if (/checkinpassengerreceiptentry|class="[^"]*dcep-quick-actions/.test(html)) return 'app-entry';
  return 'info';
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const started = Date.now();
  const list = opt('list');
  const name = path.basename(list).replace(/\.txt$/, '');
  const urls = fs.readFileSync(path.resolve(root, list), 'utf8').split('\n').map((u) => u.trim()).filter(Boolean);
  const scopeFile = path.join(W, 'scope.json');
  const scope = fs.existsSync(scopeFile) ? JSON.parse(fs.readFileSync(scopeFile, 'utf8')) : { documents: {} };
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
    // (the help centre app's screen-reader announcement "Help page loaded." is no page text;
    // the Studio's snapshots keep www's scripts, which must not run in the import browser)
    const mapped = withoutLoads(withTeaserColumns(withCheckinTabs(withLinkOuts(withPlaceholder(stripScripts(html)), p))))
      .replace(/<output[^>]*class="screen-reader-announcer"[^>]*>[\s\S]*?<\/output>/g, '');
    if (mapped.includes(`https://${LINK_OUT}`)) linkOuts.push(p);
    fs.writeFileSync(copy, mapped);
    (byTemplate[t] ||= []).push(u);
    out[p] = t;
  });
  console.log(`${name}: ${Object.entries(byTemplate).map(([t, l]) => `${t} ${l.length}`).join(', ')}; no snapshot: ${missing.length ? missing.join(' ') : 'none'}`);
  if (!argv.includes('--dry-run')) {
    // the bulk importer loads a page live (page.goto) unless its workspace is flagged protected:
    // the flag first, so every page comes from its snapshot and nothing is requested from www
    // (without it the first pages of a new workspace went to www live until one was refused)
    const flag = path.join(W, '.migration/project.json');
    const flags = fs.existsSync(flag) ? JSON.parse(fs.readFileSync(flag, 'utf8')) : {};
    if (flags.botProtected !== true) {
      fs.mkdirSync(path.dirname(flag), { recursive: true });
      fs.writeFileSync(flag, `${JSON.stringify({ ...flags, botProtected: true }, null, 2)}\n`);
    }
    // the bulk importer writes its reports into lh-com's tree (tools/importer/reports/<path>),
    // where lh-com has reports of its own at paths ITA has too (/de/de/homepage, /gb/en/feedback):
    // those are set aside before the import and put back after it
    const REPORTS = path.join(root, 'tools/importer/reports');
    const ASIDE = path.join(W, 'reports-aside');
    const aside = Object.keys(out).filter((p) => fs.existsSync(path.join(REPORTS, `${p}.report.json`)));
    aside.forEach((p) => {
      fs.mkdirSync(path.dirname(path.join(ASIDE, `${p}.report.json`)), { recursive: true });
      fs.copyFileSync(path.join(REPORTS, `${p}.report.json`), path.join(ASIDE, `${p}.report.json`));
    });
    Object.entries(byTemplate).forEach(([t, l]) => {
      const listFile = path.join(W, `urls-${name}-${t}.txt`);
      fs.writeFileSync(listFile, `${l.join('\n')}\n`);
      const log = execFileSync('node', [`${CI}/run-bulk-import.js`, '--import-script', `tools/importer/import-${t}.bundle.js`, '--urls', listFile, '--force', '--html-dir', MAPPED], {
        // no Bright Data fallback from inside the import (BD_ENDPOINT empty): pages come from snapshots
        cwd: root, env: { ...process.env, WORKSPACE_PATH: W, BD_ENDPOINT: '' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024,
      });
      // a snapshot import that failed falls through to a live load of www: name every one
      log.split('\n').filter((x) => /Snapshot import failed|falling through to live/i.test(x)).forEach((x) => console.log(`WARNING (live fallback): ${x.trim()}`));
      const lines = log.split('\n').filter((x) => /imported|failed|error/i.test(x) && !/wss:|endpoint/i.test(x));
      console.log(`${t}: ${lines.slice(-2).join(' | ')}`);
    });
    // this batch's reports go to content-sites/lh-ita/reports; lh-com's set-aside ones come back
    Object.keys(out).forEach((p) => {
      const from = path.join(REPORTS, `${p}.report.json`);
      if (fs.existsSync(from) && fs.statSync(from).mtimeMs >= started) {
        const to = path.join(W, 'reports', `${p}.report.json`);
        fs.mkdirSync(path.dirname(to), { recursive: true });
        fs.renameSync(from, to);
      }
      if (aside.includes(p)) {
        fs.mkdirSync(path.dirname(from), { recursive: true });
        fs.renameSync(path.join(ASIDE, `${p}.report.json`), from);
        return;
      }
      // and the folders it leaves empty
      for (let d = path.dirname(from); d.startsWith(`${REPORTS}/`) && fs.existsSync(d) && !fs.readdirSync(d).length; d = path.dirname(d)) fs.rmdirSync(d);
    });
    const sites = path.join(root, 'tools/importer/sites/lh-ita.json');
    const allow = JSON.parse(fs.readFileSync(sites, 'utf8'));
    const docName = (p) => p.toLowerCase().replace(/_/g, '-').replace(/-{2,}/g, '-');
    const made = Object.keys(out).map(docName).filter((p) => fs.existsSync(path.join(W, 'content', `${p}.plain.html`)));
    allow.paths = [...new Set([...allow.paths, ...made])];
    if (linkOuts.length) allow.linkOuts = [...new Set([...(allow.linkOuts || []), ...linkOuts.map(docName)])];
    fs.writeFileSync(sites, `${JSON.stringify(allow, null, 1)}\n`);
    made.forEach((p) => {
      const f = path.join(W, 'content', `${p}.plain.html`);
      const doc = fs.readFileSync(f, 'utf8');
      const src = Object.keys(out).find((k) => docName(k) === p);
      const markets = scope.documents[src]?.markets || [];
      const next = withItaMetadata(withCheckinHandoff(withFlightSearch(withItaForm(doc, p), p), p), p, fs.readFileSync(path.join(SNAP, `${src}.html`), 'utf8'), markets);
      if (next !== doc) fs.writeFileSync(f, next);
    });
    const mapOnly = path.join(W, 'runs', `${name}-upload.txt`);
    fs.writeFileSync(mapOnly, `${made.join('\n')}\n`);
    console.log(execFileSync('node', ['tools/importer/site-postprocess.mjs', '--site', 'lh-ita', '--source-host', HOST, '--snapshots', path.join(MAPPED, HOST), '--real-placeholder', PLACEHOLDER, '--map-only', mapOnly], { cwd: root, encoding: 'utf8' }).trim().split('\n').slice(-3)
      .join('\n'));
    made.forEach((p) => {
      const f = path.join(W, 'content', `${p}.plain.html`);
      const doc = fs.readFileSync(f, 'utf8');
      const next = relativeDamLinks(doc.split(`https://${LINK_OUT}`).join(`https://${HOST}`));
      if (next !== doc) fs.writeFileSync(f, next);
    });
    fs.writeFileSync(path.join(W, 'runs', `${name}-import.json`), `${JSON.stringify({ templates: out, documents: made, missing }, null, 1)}\n`);
    console.log(`${made.length} documents; upload list runs/${name}-upload.txt`);
  }
}
