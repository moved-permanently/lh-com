/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/extensions -- tooling */
/**
 * The DAM files of SWISS's sub-sites (content-sites/lh-swiss-sub: the corporate site and medical
 * services), next to swiss-dam.mjs (the main site's, whose readers it takes): no request to
 * www.swiss.com; the files come from the capture.
 *   --list    the files the documents show or link (www path, Edge Delivery name, kind, pages; an
 *             image shown in several widths: its widest rendition, under its asset's name), and
 *             whether lh-swiss's DA already has each (a HEAD of its Edge Delivery name on lh-swiss's
 *             preview, our host: the main site's copies), -> runs/dam-files.json and
 *             tools/reports/lh-swiss-sub-dam.tsv (the capture's list: the ones DA lacks; videos and
 *             PDFs for the AEM publish tier when they are over Edge Delivery's limits, which only
 *             the files' sizes tell).
 *             With --new-report <tsv>: the previous list's files (runs/dam-files.json) keep their
 *             answer, only the new ones are checked, and the new ones the capture needs go to
 *             tools/reports/<tsv> as well (a batch after the first).
 *   --switch  the documents' images from their place in lh-swiss's DA (content.da.live; the ones DA
 *             lacks show once their copy is uploaded and the page previewed again), so the preview
 *             loads nothing from www: runs/dam-switch-upload.txt
 * Options: --workspace <dir> (default content-sites/lh-swiss-sub; the market roots:
 *   content-sites/lh-swiss-mk), --report <tsv under tools/reports> (default lh-swiss-sub-dam.tsv).
 * Usage: node tools/importer/swiss-sub-dam.mjs --list | --switch
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { damFiles, assetOf, withoutGoneImages } from './swiss-dam.mjs';
import { edsDamPath } from '../../scripts/dam-path.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cli = process.argv.slice(2);
const cliOpt = (n, d) => (cli.includes(`--${n}`) ? cli[cli.indexOf(`--${n}`) + 1] : d);
const W = path.join(root, cliOpt('workspace', 'content-sites/lh-swiss-sub'));
const DOCS = path.join(W, 'content');
const SNAPS = path.join(W, 'snapshots-src/www.swiss.com');
const LIST = path.join(W, 'runs/dam-files.json');
const PREVIEW = 'https://main--lh-swiss--moved-permanently.aem.page';
export const DA_CONTENT = 'https://content.da.live/moved-permanently/lh-swiss';
const decode = (s) => { try { return decodeURIComponent(s); } catch (e) { return s; } };
const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
const widthOf = (www) => Number((www.match(/transform-width-(\d+)/) || [])[1] || 0);
const extOf = (p) => (p.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase() || '';

// the og logo www names under each sub-site (/corporate/etc/designs/dcep/logo-lx-og.jpg): the main
// site's copy in lh-swiss's DA (its documents' metadata image)
const OG_LOGO = '/content/dam/lx/images/local_images/logo-lx-og.jpg';

/**
 * www's DAM paths under a sub-site's prefix (/corporate/content/dam/..., which www's AEM answers
 * as /content/dam/...) as the file's own path; the og logo as the main site's copy.
 */
export const withoutSubPrefix = (doc) => doc
  .replace(/(https:\/\/www\.swiss\.com)?\/(?:corporate|medicalservices)\/etc\/designs\/dcep\/logo-lx-og\.jpg/g, (m, host) => `${host || ''}${OG_LOGO}`)
  .replace(/(https:\/\/www\.swiss\.com)?\/(?:corporate|medicalservices)\/(content\/dam|etc\/designs)\//g, (m, host, dir) => `${host || ''}/${dir}/`);

/**
 * Images whose source www answers 404 itself (the capture's own 404s): left out of the documents
 * (swiss-dam.mjs withoutGoneImages: the picture, and its paragraph when it held only the picture)
 * and of the capture list. www paths.
 */
export const GONE_IMAGES = [
  // corporate's sponsoring pages (en, de, fr): the Locarno picture (2026-11-02)
  '/content/dam/lx/images/corporate/2.8. Piazza Grande.jpg',
  // the market versions' seven held pages (2026-11-03): still missing in lh-swiss's DA after the
  // capture's upload of its list (al/fr aig-travel-insurance; al/fr, al/it prepare-lxmas-2024;
  // br/en homepage and br/pt terminal-btg; dk/en ski-campaign-2025 and gb/en ski-campaign;
  // gb/en swiss-summit-lounge)
  '/content/dam/lx/images/local_images/Logo-AIG.jpg',
  '/content/dam/lx/images/local_images/LX004_SWISS_Saveurs_Mondial_fr_Fondue_2023_Landing_Page_Stage_Teaser_1440x720px_f01_01_@2x.jpg',
  '/content/dam/lx/images/local_images/LX004_SWISS_Saveurs_Mondial_it_Fondue_2023_Landing_Page_Stage_Teaser_1440x720px_f01_01_@2x.jpg',
  '/content/dam/btg/btg-terminal-1-1-jpg.jpeg',
  '/content/dam/lx/hxod/stage-winter-skideshot-slki-und-snowboard-1.jpg',
  '/content/dam/lx/images/pixels/7/7/8/251028-swiss-uk-2hy-winter-newsletter-header-2-1.jpg',
];
const GONE = new Set(GONE_IMAGES.map((www) => edsDamPath(assetOf(www))));

/**
 * The document's images shown from their place in lh-swiss's DA (content.da.live + the Edge
 * Delivery name of the asset), www's or already switched; GONE_IMAGES left out.
 */
export function withDaImages(doc) {
  const shown = withoutSubPrefix(doc).replace(/<img src="(?:https:\/\/www\.swiss\.com)?(\/(?:content\/dam|etc\/designs)\/[^"?]+)"/g, (m, src) => `<img src="${DA_CONTENT}${edsDamPath(assetOf(decode(src)))}"`);
  return withoutGoneImages(shown, GONE);
}

/** The files of the documents: Map key -> {www, asset, eds, kind, pages}. */
export function filesOf(docs) {
  const files = new Map();
  docs.forEach(({ p, doc, snap }) => {
    // www's own spelling of a path (capitals, spaces) from the page's snapshot
    const own = new Map();
    [...String(snap || '').matchAll(/(?:https:\/\/www\.swiss\.com)?(\/content\/dam\/[^"'?#\s)&,<>]+)/g)].forEach((m) => {
      const www = decode(m[1]);
      own.set(edsDamPath(assetOf(www)), www);
    });
    // names with spaces ("Bengaluru Header Video_8017471.mp4"): up to the file's extension
    [...String(snap || '').matchAll(/(\/content\/dam\/[^"'?#)&,<>]+?\.(?:jpe?g|png|svg|gif|webp|pdf|mp4|vtt))(?=["'?#)&,<\s]|\.transform)/gi)]
      .filter((m) => /\s/.test(m[1]))
      .forEach((m) => { const www = decode(m[1]); own.set(edsDamPath(assetOf(www)), www); });
    damFiles(withoutSubPrefix(doc)).forEach(([link, kind]) => {
      const www = own.get(edsDamPath(assetOf(link))) || link;
      if (GONE.has(edsDamPath(assetOf(www)))) return;
      const key = kind === 'link' ? www : `image:${edsDamPath(assetOf(www))}`;
      const had = files.get(key);
      if (!had) {
        files.set(key, {
          www, asset: assetOf(www), eds: edsDamPath(assetOf(www)), kind, pages: new Set([p]),
        });
      } else {
        if (key.startsWith('image:') && widthOf(www) > widthOf(had.www)) Object.assign(had, { www, asset: assetOf(www) });
        had.pages.add(p);
      }
    });
  });
  return files;
}

/**
 * The files against the previous list (runs/dam-files.json): known ones keep its answer (inDa),
 * with the pages of now; fresh ones are to be checked (and listed apart: --new-report).
 */
export function splitKnown(files, previous = []) {
  const before = new Map(previous.map((x) => [x.kind === 'link' ? x.www : `image:${x.eds}`, x]));
  const known = [];
  const fresh = [];
  files.forEach((x, key) => {
    const had = before.get(key);
    if (had) known.push({ ...x, inDa: had.inDa });
    else fresh.push(x);
  });
  return { known, fresh };
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const docs = walk(DOCS).filter((f) => f.endsWith('.plain.html')).map((f) => {
    const p = `/${path.relative(DOCS, f).replace(/\.plain\.html$/, '')}`;
    const snapFile = path.join(SNAPS, `${p}.html`);
    return {
      p, f, doc: fs.readFileSync(f, 'utf8'), snap: fs.existsSync(snapFile) ? fs.readFileSync(snapFile, 'utf8') : '',
    };
  });
  if (argv.includes('--list')) {
    // --new-report: the previous list's files keep their answer; only the new ones are checked
    const newReport = cliOpt('new-report', null);
    const previous = newReport && fs.existsSync(LIST) ? JSON.parse(fs.readFileSync(LIST, 'utf8')) : [];
    const { known, fresh } = newReport ? splitKnown(filesOf(docs), previous) : { known: [], fresh: [...filesOf(docs).values()] };
    const files = [...known, ...fresh];
    // in lh-swiss's DA already (the main site's copies): its preview answers the name
    for (const x of fresh) {
      const res = await fetch(`${PREVIEW}${x.eds}`, { method: 'HEAD', headers: { 'user-agent': 'curl/8.5.0' } });
      x.inDa = res.ok;
      await new Promise((r) => { setTimeout(r, 250); });
    }
    const out = files.map((x) => ({ ...x, pages: [...x.pages].sort() }));
    fs.writeFileSync(LIST, `${JSON.stringify(out, null, 1)}\n`);
    const need = out.filter((x) => !x.inDa);
    const tsv = (list) => `${['www url', 'da path', 'kind', 'where', 'pages', 'first pages'].join('\t')}\n${list.sort((a, b) => a.www.localeCompare(b.www)).map((x) => [
      `https://www.swiss.com${x.www}`, x.eds, x.kind, /^(mp4|pdf)$/.test(extOf(x.www)) ? 'AEM if over the limit (mp4 36 MiB, PDF 20 MB)' : 'DA', x.pages.length, x.pages.slice(0, 3).join(' '),
    ].join('\t')).join('\n')}\n`;
    fs.writeFileSync(path.join(root, 'tools/reports', cliOpt('report', 'lh-swiss-sub-dam.tsv')), tsv(need));
    const kinds = (l) => Object.entries(l.reduce((a, x) => ({ ...a, [extOf(x.www)]: (a[extOf(x.www)] || 0) + 1 }), {})).map(([k, n]) => `${n} ${k}`).join(', ');
    console.log(`swiss-sub-dam list: ${out.length} files (${kinds(out)}); in lh-swiss's DA ${out.length - need.length}; for the capture ${need.length} (${kinds(need)})`);
    if (newReport) {
      const isFresh = new Set(fresh.map((x) => x.www));
      const newNeed = need.filter((x) => isFresh.has(x.www));
      fs.writeFileSync(path.join(root, 'tools/reports', newReport), tsv(newNeed));
      console.log(`  new since the previous list: ${fresh.length} files; for the capture ${newNeed.length} (${kinds(newNeed)}) -> tools/reports/${newReport}`);
    }
  }
  if (argv.includes('--switch')) {
    const changed = [];
    docs.forEach(({ p, f, doc }) => {
      const next = withDaImages(doc);
      if (next !== doc) { fs.writeFileSync(f, next); changed.push(p); }
    });
    fs.writeFileSync(path.join(W, 'runs/dam-switch-upload.txt'), `${changed.join('\n')}\n`);
    console.log(`swiss-sub-dam switch: ${changed.length} documents changed (runs/dam-switch-upload.txt)`);
  }
}
