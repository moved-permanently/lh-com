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
 *             the files' sizes tell)
 *   --switch  the documents' images from their place in lh-swiss's DA (content.da.live; the ones DA
 *             lacks show once their copy is uploaded and the page previewed again), so the preview
 *             loads nothing from www: runs/dam-switch-upload.txt
 * Usage: node tools/importer/swiss-sub-dam.mjs --list | --switch
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { damFiles, assetOf } from './swiss-dam.mjs';
import { edsDamPath } from '../../scripts/dam-path.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-swiss-sub');
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
 * The document's images shown from their place in lh-swiss's DA (content.da.live + the Edge
 * Delivery name of the asset), www's or already switched.
 */
export function withDaImages(doc) {
  return withoutSubPrefix(doc).replace(/<img src="(?:https:\/\/www\.swiss\.com)?(\/(?:content\/dam|etc\/designs)\/[^"?]+)"/g, (m, src) => `<img src="${DA_CONTENT}${edsDamPath(assetOf(decode(src)))}"`);
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
    const files = [...filesOf(docs).values()];
    // in lh-swiss's DA already (the main site's copies): its preview answers the name
    for (const x of files) {
      const res = await fetch(`${PREVIEW}${x.eds}`, { method: 'HEAD', headers: { 'user-agent': 'curl/8.5.0' } });
      x.inDa = res.ok;
      await new Promise((r) => { setTimeout(r, 250); });
    }
    const out = files.map((x) => ({ ...x, pages: [...x.pages].sort() }));
    fs.writeFileSync(LIST, `${JSON.stringify(out, null, 1)}\n`);
    const need = out.filter((x) => !x.inDa);
    const rows = need.sort((a, b) => a.www.localeCompare(b.www)).map((x) => [
      `https://www.swiss.com${x.www}`, x.eds, x.kind, /^(mp4|pdf)$/.test(extOf(x.www)) ? 'AEM if over the limit (mp4 36 MiB, PDF 20 MB)' : 'DA', x.pages.length, x.pages.slice(0, 3).join(' '),
    ].join('\t'));
    fs.writeFileSync(path.join(root, 'tools/reports/lh-swiss-sub-dam.tsv'), `${['www url', 'da path', 'kind', 'where', 'pages', 'first pages'].join('\t')}\n${rows.join('\n')}\n`);
    const kinds = (l) => Object.entries(l.reduce((a, x) => ({ ...a, [extOf(x.www)]: (a[extOf(x.www)] || 0) + 1 }), {})).map(([k, n]) => `${n} ${k}`).join(', ');
    console.log(`swiss-sub-dam list: ${out.length} files (${kinds(out)}); in lh-swiss's DA ${out.length - need.length}; for the capture ${need.length} (${kinds(need)})`);
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
