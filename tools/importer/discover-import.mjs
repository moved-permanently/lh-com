/* eslint-disable no-console, max-len, import/prefer-default-export -- tooling */
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
 * Pages whose snapshot is missing are listed.
 * Writes content-sites/lh-discover/runs/<name>-import.json: path -> template.
 *
 * Usage: node tools/importer/discover-import.mjs --list content-sites/lh-discover/runs/batch-01.txt [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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
export const withPlaceholder = (html) => html.replace(/(?:https?:)?\/\/(?:www\.)?lufthansa\.com(?=[/"'?#\s)]|$)/gi, `https://${PLACEHOLDER}`);

// links out to the page on Discover's host (a widget a service answers on www): on this host
// during the import, so neither the importers nor site-postprocess.mjs (which makes links to the
// site's own pages relative) touch them; Discover's host afterwards, in the batch's documents
export const LINK_OUT = 'link-out.invalid';

/**
 * A snapshot whose live widgets are a link to the page on www (the importers flatten them into
 * text): the security waiting times (an airport select), labelled with the select's own label.
 */
export const withLinkOuts = (html, p) => html.replace(/<div class="securitywaitingtime">[\s\S]*?<\/maui-select><\/form><\/div><\/div><\/div>/g, (m) => {
  const label = (m.match(/buttontriggerlabel="([^"]+)"/) || [])[1] || HOST;
  return `<div class="securitywaitingtime"><p><a href="https://${LINK_OUT}${p}">${label}</a></p></div>`;
});

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
  urls.forEach((u) => {
    const p = new URL(u).pathname;
    const f = path.join(SNAP, `${p}.html`);
    if (!fs.existsSync(f)) { missing.push(p); return; }
    const html = fs.readFileSync(f, 'utf8');
    const t = templateOf(p, html);
    const copy = path.join(MAPPED, HOST, `${p}.html`);
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    fs.writeFileSync(copy, withLinkOuts(withPlaceholder(html), p));
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
    fs.writeFileSync(sites, `${JSON.stringify(allow, null, 1)}\n`);
    // the host mapping only for this batch's documents (earlier ones have their own Lufthansa URLs
    // back); links to the new documents become relative in every document
    const mapOnly = path.join(W, 'runs', `${name}-upload.txt`);
    fs.writeFileSync(mapOnly, `${made.join('\n')}\n`);
    console.log(execFileSync('node', ['tools/importer/site-postprocess.mjs', '--site', 'lh-discover', '--source-host', HOST, '--snapshots', path.join(MAPPED, HOST), '--real-placeholder', PLACEHOLDER, '--map-only', mapOnly], { cwd: root, encoding: 'utf8' }).trim().split('\n').slice(-3)
      .join('\n'));
    made.forEach((p) => {
      const f = path.join(W, 'content', `${p}.plain.html`);
      const doc = fs.readFileSync(f, 'utf8');
      if (doc.includes(`https://${LINK_OUT}`)) fs.writeFileSync(f, doc.split(`https://${LINK_OUT}`).join(`https://${HOST}`));
    });
    fs.writeFileSync(path.join(W, 'runs', `${name}-import.json`), `${JSON.stringify({ templates: out, documents: made, missing }, null, 1)}\n`);
    console.log(`${made.length} documents; upload list runs/${name}-upload.txt`);
  }
}
