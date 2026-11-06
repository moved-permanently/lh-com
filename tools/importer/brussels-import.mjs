/* eslint-disable no-console, max-len, import/prefer-default-export, import/extensions, no-use-before-define, import/no-extraneous-dependencies -- tooling */
/**
 * Imports one batch of Brussels Airlines' pages (lh-brussels) offline from their snapshots
 * (tools/importer/bd-snapshots/www.brusselsairlines.com: the Studio's capture, brussels-studio.mjs)
 * with lh-com's import scripts into content-sites/lh-brussels/content, built as austrian-import.mjs:
 * per page
 * the template whose components it has (templateOf), then site-postprocess.mjs (the
 * www.lufthansa.com URLs of lh-com's importers back to www.brusselsairlines.com, links between the site's
 * pages relative), after adding the batch's documents to the allowlist
 * tools/importer/sites/lh-brussels.json. Per document (one per language page, option B):
 * - widgets a service answers on www become a link to the page on www (withLinkOuts): the check-in
 *   deadline search, the FAQ search bar, the "fly more sustainably" PNR search micro-frontend,
 *   iframes the embed block doesn't play;
 * - the payment methods table (an iframe of webv4.brusselsairlines.com) as plain content where its
 *   rendered page is at hand (withPaymentTable), the phone numbers of the hotline widget
 *   (.dcep-hotline-number-display, rendered in the browser) as plain content (withHotlines);
 * - articles (template article) import with lh-com's insights template (article-header,
 *   price-bar), slideshows with fleet (carousel-lightbox);
 * - the core forms get a form config row with a proposed lh-forms id brussels-<page> (withForm;
 *   preview only until lh-forms knows them);
 * - the flight search hands off to shop.brusselsairlines.com from Brussels (withFlightSearch);
 * - the check-in entry becomes the booking-lookup block (withCheckinTabs), its hand-off the page
 *   on www (withCheckinHandoff); the booking login's "Enter booking code" opens the page on www;
 * - two-column teaser rows import as carousel-cards (withTeaserColumns);
 * - metadata (withItaMetadata): the root's nav and footer, `markets` (scope.json), www's noindex;
 * - links to www's DAM files become site-relative edsDamPath links (brussels-dam.mjs);
 * - a share image www doesn't serve becomes Brussels' own logo (brussels-share-image.mjs).
 * Writes content-sites/lh-brussels/runs/<name>-import.json: path -> template.
 *
 * Usage: node tools/importer/brussels-import.mjs --list content-sites/lh-brussels/runs/batch-01.txt [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import {
  ownPages, ownAliases, ownServed, withOwnLinks, onlyBatch,
} from './own-links.mjs';
import { relativeDamLinks } from './brussels-dam.mjs';
import { withLocalImages } from './brussels-nav.mjs';
import { withShareImage } from './brussels-share-image.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const HOST = 'www.brusselsairlines.com';
const W = path.join(root, 'content-sites/lh-brussels');
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
// the page's visible H1, else its title without the brand ("Culinary Journey | Brussels Airlines")
const h1Of = (html) => text((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g) || []).map((x) => x).find((x) => !/sr-only/.test(x)) || '')
  || text((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/\s*\|\s*Brussels Airlines\s*$/, '');

/**
 * A snapshot whose live widgets are a link to the page on www: the check-in deadline search and the
 * culinary-hub micro-frontend (labelled with the page's H1), the FAQ search bar (with its own
 * label), iframes the embed block doesn't play (with their title, else the H1).
 */
export function withLinkOuts(html, p) {
  const linkOut = (label) => `<div class="text section"><div class="richtext"><p><a href="https://${LINK_OUT}${p}">${label}</a></p></div></div>`;
  let out = editDivs(html, '<div class="checkindeadlinesearch', () => linkOut(h1Of(html) || HOST));
  // the "fly more sustainably" PNR search (pnr-search-module micro-frontend in a wrapper)
  const pnr = out.search(/<div class="wrapper section">\s*<pnr-search-module/);
  if (pnr >= 0) out = `${out.slice(0, pnr)}${linkOut(h1Of(html) || HOST)}${out.slice(divEnd(out, pnr))}`;
  out = editDivs(out, '<div class="dcep-search-bar', (el) => linkOut((el.match(/<label[^>]*>([^<]+)<\/label>/) || [])[1] || h1Of(html) || HOST));
  // the culinary hub's wrapper (whitespace between the wrapper and the element varies)
  const hub = out.search(/<div class="wrapper section">\s*<culinary-hub/);
  if (hub >= 0) out = `${out.slice(0, hub)}${linkOut(h1Of(html) || HOST)}${out.slice(divEnd(out, hub))}`;
  return out.replace(/<div class="iframe[ "][^>]*>\s*<div class="iframe-wrapper[^>]*>\s*<iframe\b([^>]*)>[\s\S]*?<\/iframe>\s*<\/div>\s*<\/div>/g, (m, attrs) => {
    const src = (attrs.match(/\ssrc="([^"]+)"/) || [])[1] || '';
    if (EMBEDDED.test(src)) return m;
    const label = (attrs.match(/\stitle="([^"]+)"/) || [])[1] || h1Of(html) || HOST;
    return `<div class="iframe-link-out"><p><a href="https://${LINK_OUT}${p}">${label}</a></p></div>`;
  });
}

/**
 * The hotline widget (.dcep-hotline-number-display: a country select whose phone numbers www fills
 * in the browser) as plain content: per rendered contact (.support-contact) its heading, the number
 * (a tel: link), the notes, the opening hours (day: hours) and the e-mail line; the select goes.
 */
export function withHotlines(html) {
  return editDivs(html, '<div class="hotlinenumberdisplay', (el) => {
    const { document } = parseHTML(`<html><body>${el}</body></html>`);
    const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    document.querySelectorAll('svg, maui-icon, maui-select, .sr-only').forEach((n) => n.remove());
    const parts = [...document.querySelectorAll('.support-contact')].map((c) => {
      const out = [];
      const head = c.querySelector(':scope > maui-headline');
      if (head) out.push(`<h3>${esc(clean(head.textContent))}</h3>`);
      c.querySelectorAll(':scope > a.phone-number').forEach((a) => out.push(`<p><a href="${a.getAttribute('href')}">${esc(clean(a.textContent))}</a></p>`));
      c.querySelectorAll(':scope > div').forEach((d) => {
        const table = d.querySelector('table.service-hours');
        if (table) {
          const h = d.querySelector('maui-headline');
          if (h) out.push(`<h4>${esc(clean(h.textContent))}</h4>`);
          const rows = [...table.querySelectorAll('tr')].map((tr) => `${esc(clean(tr.querySelector('th')?.textContent))}: ${esc(clean(tr.querySelector('td')?.textContent))}`);
          out.push(`<p>${rows.join('<br>')}</p>`);
          return;
        }
        const lines = [...d.querySelectorAll('span')].map((s) => clean(s.textContent)).filter(Boolean);
        if (lines.length) out.push(`<p>${lines.map(esc).join('<br>')}</p>`);
      });
      return out.join('');
    }).join('');
    return parts ? `<div class="text section"><div class="richtext">${parts}</div></div>` : '';
  });
}

// the payment methods table: the iframe page of webv4.brusselsairlines.com per language, rendered
// through the Bright Data session (content-sites/lh-brussels/assets/fop/<file>.html, the table only)
const FOP = path.join(W, 'assets/fop');

/** The payment methods iframe as its table (plain content) where its page is at hand. */
export function withPaymentTable(html) {
  return html.replace(/<div class="iframe[ "][^>]*>\s*<div class="iframe-wrapper[^>]*>\s*<iframe\b[^>]*src="https:\/\/webv4\.brusselsairlines\.com\/[^"]*\/(fop_standalone_[^"/]+?)\.html"[^>]*>[\s\S]*?<\/iframe>\s*<\/div>\s*<\/div>/g, (m, file) => {
    const f = path.join(FOP, `${file}.html`);
    return fs.existsSync(f) && fs.statSync(f).size > 0 ? `<div class="text section"><div class="richtext">${fs.readFileSync(f, 'utf8')}</div></div>` : m;
  });
}

/**
 * A snapshot that loads nothing while it is imported: the import browser renders it with
 * setContent, and its absolute www.brusselsairlines.com URLs (about 40 images per page) would be fetched
 * from www. A Content-Security-Policy meta tag refuses every subresource (images, styles, fonts,
 * frames, requests) and allows only the importer's inline script; the URLs stay in the markup.
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
 * A snapshot whose teaser rows in a two-column view (Brussels' "Related", "This might also interest
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

// the core forms: a proposed lh-forms id per page name (brussels-<page>; lh-forms does not know
// them yet, so the form pages stay on preview)
export const formIdOf = (p) => `brussels-${p.split('/').pop().replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`;
const CONFIG_ROW = /<div><div>(?:(?!<\/div><div>)[\s\S])*?<\/div><div>config<\/div><div>(?:form|success|error)<\/div>(?:<div><\/div>){7}<\/div>/g;
const ERROR_ROW = /<div><div>(?:(?!<\/div><div>)[\s\S])*?<\/div><div>config<\/div><div>error<\/div>(?:<div><\/div>){7}<\/div>/g;
const configRow = (name, value) => `<div><div>${value}</div><div>config</div><div>${name}</div>${'<div></div>'.repeat(7)}</div>`;
const linkRow = (name, href) => configRow(name, `<a href="${href}">${href}</a>`);

/** www's confirmation page of a form (its :redirect) as the public path on the site. */
export function successOf(html) {
  const redirect = (String(html || '').match(/name=":redirect"[^>]*value="([^"]+)"|value="([^"]+)"[^>]*name=":redirect"/) || []).slice(1).find(Boolean) || '';
  const m = redirect.match(/^\/content\/bel\/markets(\/[a-z]{2}\/[a-z]{2})(\/.+?)(?:\.html)?$/);
  // (the GUID copy of be/en's invoice form redirects into /content/bel/gc/, Lufthansa's global
  // tree: no public page)
  return m ? `${m[1]}${m[2]}` : '';
}

/**
 * A Brussels form document with its form config row (the proposed lh-forms id) and its success
 * row (www's confirmation page; lh-com's parser only maps /content/lh/markets/ paths); the
 * parser's error row stays. Others as they are.
 */
export function withItaForm(doc, p, html = '') {
  if (!/<div class="form[ "]/.test(doc)) return doc;
  const id = formIdOf(p);
  const success = successOf(html);
  const rows = [...doc.matchAll(CONFIG_ROW)].map((m) => m[0]);
  const has = (name) => rows.some((r) => r.includes(`<div>config</div><div>${name}</div>`));
  let out = doc;
  if (has('form')) out = out.replace(rows.find((r) => r.includes('<div>config</div><div>form</div>')), configRow('form', id));
  const add = [has('form') ? '' : configRow('form', id), success && !has('success') ? linkRow('success', success) : ''].join('');
  const first = [...out.matchAll(CONFIG_ROW)][0];
  if (add && first) out = `${out.slice(0, first.index)}${add}${out.slice(first.index)}`;
  // no error row (www's /error.html answers 404 here: the block shows its message in place); the
  // drop zones whose accept is no type list ("pdf, png, jpg") get the four types and the full
  // not-allowed set (lh-forms' FILE_RULES for these forms)
  return out.replace(ERROR_ROW, '')
    .replace(/accept=(?:Approved file formats: pdf, png and jpg\.|pdf, png, jpg)(?=<br>)/g, 'accept=image/png, image/jpeg, image/jpg, application/pdf')
    .replace(/(max-size=2048000<br> not-allowed=)#(?=<\/div>)/g, '$1#$$%^*()[]');
}

/** Metadata rows (name, value) added to the document's metadata block (made when it has none). */
export function withMetadataRows(doc, rows) {
  const add = rows.filter(([name]) => !new RegExp(`<div><div>${name}</div>`, 'i').test(doc));
  if (!add.length) return doc;
  const cells = add.map(([n, v]) => `<div><div>${n}</div><div>${v}</div></div>`).join('');
  if (doc.includes('<div class="metadata">')) return doc.replace('<div class="metadata">', `<div class="metadata">${cells}`);
  return `${doc.trimEnd()}\n<div><div class="metadata">${cells}</div></div>\n`;
}

/** The document's metadata: nav and footer of its root, its markets, www's noindex. */
export function withItaMetadata(doc, p, html, markets = []) {
  const key = p.split('/').slice(1, 3).join('/');
  const rows = [['nav', `/${key}/nav`], ['footer', `/${key}/footer`]];
  if (markets.length) rows.push(['markets', markets.join(', ')]);
  const robots = ((html || '').match(/<meta name="robots" content="([^"]*)"/i) || [])[1] || '';
  if (/noindex/i.test(robots)) rows.push(['Robots', robots.split(',').map((x) => x.trim()).filter(Boolean).join(', ')]);
  return withMetadataRows(doc, rows);
}

// the flight search hands the search to Brussels' shop (www's flight manager posts to
// shop.brusselsairlines.com, the same booking platform as Lufthansa's) and starts from Brussels
export const SHOP = 'https://shop.brusselsairlines.com/booking/availability';
// the market's airport per root, named in the root's language (the homepages' flight search)
const DEFAULT_ORIGIN = { 'be/en': 'Brussels (BRU)', 'be/fr': 'Bruxelles (BRU)', 'be/nl': 'Brussel (BRU)' };

/** The document's flight-search blocks with the Shop row and the market's default origin. */
export function withFlightSearch(doc, p) {
  const key = p.split('/').slice(1, 3).join('/');
  return doc.replace(/<div class="flight-search(?: [^"]*)?">/g, (m) => {
    const rows = [`<div><div>Shop</div><div><a href="${SHOP}">${SHOP}</a></div></div>`];
    if (DEFAULT_ORIGIN[key]) rows.push(`<div><div>Default origin</div><div>${DEFAULT_ORIGIN[key]}</div></div>`);
    return `${m}${rows.join('')}`;
  });
}

/** The template of a page from its path and snapshot. */
export function templateOf(p, html) {
  // (homepage-new: the variant homepage some Italian-language roots have, al/it, be/it, ch/it)
  if (/^\/[a-z]{2}\/[a-z]{2}\/homepage$/.test(p)) return 'homepage';
  // articles and the article hub: lh-com's insights template (article-header, price-bar)
  if (/<meta name="template" content="article"/.test(html) || /class="dcep-blog-overview/.test(html)) return 'insights';
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
    // (the form's jQuery UI date picker, appended to the body and hidden on www, is no content)
    const mapped = withoutLoads(withTeaserColumns(withCheckinTabs(withLinkOuts(withHotlines(withPaymentTable(withPlaceholder(editDivs(stripScripts(html), '<div id="ui-datepicker-div"', () => '')))), p))))
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
    // where lh-com has reports of its own at paths Brussels has too (/be/en/..., /de/de/...):
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
    // this batch's reports go to content-sites/lh-brussels/reports; lh-com's set-aside ones come back
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
    const sites = path.join(root, 'tools/importer/sites/lh-brussels.json');
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
      const next = withItaMetadata(withCheckinHandoff(withFlightSearch(withItaForm(doc, p, fs.readFileSync(path.join(SNAP, `${src}.html`), 'utf8')), p), p), p, fs.readFileSync(path.join(SNAP, `${src}.html`), 'utf8'), markets);
      if (next !== doc) fs.writeFileSync(f, next);
    });
    const mapOnly = path.join(W, 'runs', `${name}-upload.txt`);
    fs.writeFileSync(mapOnly, `${made.join('\n')}\n`);
    // site-postprocess's step 3 rewrites every document: outside the batch only links made
    // relative stay (onlyBatch), so a run never takes an earlier or another session's link back
    // to www
    const post = onlyBatch('lh-brussels', new Set(made), () => execFileSync('node', ['tools/importer/site-postprocess.mjs', '--site', 'lh-brussels', '--source-host', HOST, '--snapshots', path.join(MAPPED, HOST), '--real-placeholder', PLACEHOLDER, '--map-only', mapOnly], { cwd: root, encoding: 'utf8' }));
    console.log(post.result.trim().split('\n').slice(-3).join('\n'));
    console.log(`site-postprocess: ${post.restored.length} documents outside the batch left as they were`);
    // links to the site's pages relative (own-links.mjs: its documents and the market roots'
    // pages lh-edge answers from them), after site-postprocess (which knows only the pages
    // imported so far)
    const pages = ownPages('lh-brussels');
    const aliases = ownAliases('lh-brussels');
    // the login and profile pages and the cockpit deep link the replica serves (lh-brussels.json served)
    const served = ownServed('lh-brussels');
    // a link-out document keeps its link to its own page on www
    const linkOutDocs = new Set(allow.linkOuts || []);
    made.forEach((p) => {
      const f = path.join(W, 'content', `${p}.plain.html`);
      const doc = fs.readFileSync(f, 'utf8');
      // a share image www doesn't serve: Brussels' own logo (brussels-share-image.mjs)
      const next = withShareImage(withOwnLinks(withLocalImages(relativeDamLinks(doc.split(`https://${LINK_OUT}`).join(`https://${HOST}`))), HOST, pages, aliases, { linkOut: linkOutDocs.has(p) ? p : null, served }).doc);
      if (next !== doc) fs.writeFileSync(f, next);
    });
    fs.writeFileSync(path.join(W, 'runs', `${name}-import.json`), `${JSON.stringify({ templates: out, documents: made, missing }, null, 1)}\n`);
    console.log(`${made.length} documents; upload list runs/${name}-upload.txt`);
  }
}
