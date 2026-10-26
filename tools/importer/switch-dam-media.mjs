/* eslint-disable no-console, no-await-in-loop, max-len */
/**
 * The documents that play www's videos (links to https://www.lufthansa.com/content/dam/...mp4)
 * get the site's own copies: the link becomes /content/dam/<Edge Delivery name>
 * (scripts/dam-path.js edsDamPath, the same as the copies in DA and R2), and the text tracks of
 * www's video viewer for that video on that page (data-dcep closedCaptionsSrc and
 * audioDescriptionSrc, from the unpacked article export and the Bright Data snapshots) follow
 * the video link in its paragraph as links to their copies ("Untertitel" / "Subtitles",
 * "Audiodeskription" / "Audio description"; scripts/media.js turns them into <track>s).
 * Videos www doesn't have any more (GONE) and the ones not recorded yet (neither in DA nor in
 * R2: lh-edge doesn't answer them) keep www's link; subtitles not recorded yet are left out.
 * Every file is checked on lh-edge (--edge) before a link is switched. Idempotent: run it again
 * once more files are recorded.
 *
 * Where the files are: lh-edge's route says it (dam: the DA copies, dam-media: R2). The documents
 * are listed in tools/reports/dam/dam-media-documents.{md,json}: every file in DA, at least one
 * in R2, and the ones left with www's videos only.
 *
 * Usage: node tools/importer/switch-dam-media.mjs [--dry] [--edge https://lhedge.bbird.live]
 *   writes tools/importer/dam-media-documents.txt (the documents changed by this run, for da-upload.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { edsDamPath, decodePath } from '../../scripts/dam-path.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const dry = argv.includes('--dry');
const edge = argv.includes('--edge') ? argv[argv.indexOf('--edge') + 1].replace(/\/$/, '') : 'https://lhedge.bbird.live';
const CONTENT = path.join(root, 'content');
const SOURCES = [path.join(root, 'tools/source-export/articles-unpacked/pages'), path.join(root, 'tools/importer/bd-snapshots/www.lufthansa.com')];
// gone from www itself (404 there, and their renditions): the documents keep www's link
const GONE = new Set([
  ...['food', 'geschichte', 'kunst', 'musik', 'shopping', 'sport'].map((t) => `/content/dam/video/c3/audiotravelguide/muc/01_interessensbasiert/de/munich_lhcom_${t}_de.mp4`),
  '/content/dam/video/c3/headeranimation/lh_blog_hongkong_animation_16x9.mp4',
]);
const LABELS = { de: ['Untertitel', 'Audiodeskription'], en: ['Subtitles', 'Audio description'] };
const WWW_VIDEO = /<a href="https:\/\/www\.lufthansa\.com(\/content\/dam\/[^"]+\.mp4)"([^>]*)>([\s\S]*?)<\/a>/g;
const OWN = /href="(\/content\/dam\/[^"]+\.(?:mp4|vtt))"/g;

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&');
const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  if (e.isSymbolicLink()) return [];
  return e.isDirectory() ? walk(p) : [p];
}) : []);
const isTrack = (src) => /\.vtt$/i.test(src || '');

/** www's video viewers of a page: videoSrc -> { cc, ad } (www paths). */
function viewersOf(pagePath) {
  const out = new Map();
  SOURCES.forEach((dir) => {
    const f = path.join(dir, `${pagePath}.html`);
    if (!fs.existsSync(f) || out.size) return;
    const html = fs.readFileSync(f, 'utf8');
    [...html.matchAll(/class="dcep-video-viewer"[^>]*?data-dcep=(?:'([^']*)'|"([^"]*)")/g)].forEach((m) => {
      try {
        const cfg = JSON.parse(decode(m[1] ?? m[2]));
        if (cfg.videoSrc) out.set(decodePath(cfg.videoSrc), { cc: cfg.closedCaptionsSrc || '', ad: cfg.audioDescriptionSrc || '' });
      } catch (e) { /* not JSON */ }
    });
  });
  return out;
}

const playing = walk(CONTENT).filter((f) => f.endsWith('.plain.html') && !/\/(lhg|drafts)\//.test(f)).map((file) => ({
  file, docPath: `/${path.relative(CONTENT, file).replace(/\.plain\.html$/, '')}`, html: fs.readFileSync(file, 'utf8'),
})).filter((d) => d.html.match(WWW_VIDEO) || d.html.match(OWN));

// every file the documents would use, and where it is: lh-edge answers it from R2 (route
// dam-media) or from the DA copies (route dam); anything else is missing (not recorded yet)
const wanted = new Set();
playing.forEach((d) => {
  d.viewers = viewersOf(d.docPath);
  [...d.html.matchAll(OWN)].forEach((m) => wanted.add(m[1]));
  [...d.html.matchAll(WWW_VIDEO)].forEach((m) => {
    const asset = decodePath(decode(m[1]));
    if (GONE.has(asset)) return;
    wanted.add(edsDamPath(asset));
    const v = d.viewers.get(asset);
    if (v) [v.cc, v.ad].filter(isTrack).forEach((t) => wanted.add(edsDamPath(decodePath(t))));
  });
});
const where = new Map();
const list = [...wanted].sort();
for (let i = 0; i < list.length; i += 8) {
  await Promise.all(list.slice(i, i + 8).map(async (p) => {
    const r = await fetch(`${edge}${p}`, { method: 'HEAD' });
    const route = r.headers.get('x-lh-edge-route');
    if (r.ok && route === 'dam-media') where.set(p, 'r2');
    else if (r.ok && route === 'dam') where.set(p, 'da');
    else where.set(p, `missing (${r.status})`);
  }));
}
const there = (p) => where.get(p) === 'r2' || where.get(p) === 'da';

const changed = [];
const uses = new Map(); // doc path -> Set of the site's own files (mp4, vtt)
const kept = []; // www's videos left in, and subtitles left out
let links = 0;
let tracks = 0;
playing.forEach(({
  file, docPath, html: before, viewers,
}) => {
  const files = new Set([...before.matchAll(OWN)].map((m) => m[1]));
  const lang = docPath.split('/')[2] === 'de' ? 'de' : 'en';
  const html = before.replace(WWW_VIDEO, (all, raw, attrs, text) => {
    const asset = decodePath(decode(raw));
    const own = edsDamPath(asset);
    if (GONE.has(asset) || !there(own)) {
      kept.push({ doc: docPath, file: asset, why: GONE.has(asset) ? 'gone on www (404)' : 'not recorded yet' });
      return all;
    }
    links += 1;
    files.add(own);
    let out = `<a href="${own}"${attrs}>${text}</a>`;
    const v = viewers.get(asset);
    if (v) {
      [[v.cc, LABELS[lang][0]], [v.ad, LABELS[lang][1]]].filter(([src]) => isTrack(src)).forEach(([src, label]) => {
        const track = edsDamPath(decodePath(src));
        if (!there(track)) {
          kept.push({ doc: docPath, file: decodePath(src), why: 'subtitles not recorded yet' });
          return;
        }
        files.add(track);
        tracks += 1;
        out += ` <a href="${track}">${label}</a>`;
      });
    }
    return out;
  });
  if (files.size) uses.set(docPath, files);
  if (html !== before) {
    changed.push(docPath);
    if (!dry) fs.writeFileSync(file, html);
  }
});

const daOnly = [];
const withR2 = [];
[...uses.entries()].sort(([a], [b]) => a.localeCompare(b)).forEach(([doc, set]) => {
  if ([...set].every((p) => where.get(p) === 'da')) daOnly.push(doc);
  else withR2.push(doc);
});
const wwwOnly = [...new Set(kept.map((k) => k.doc))].filter((d) => !uses.has(d)).sort();
const count = (state) => list.filter((p) => where.get(p) === state).length;
const report = {
  checkedAt: new Date().toISOString(),
  edge,
  documents: playing.length,
  changedNow: changed.length,
  links,
  tracks,
  files: { da: count('da'), r2: count('r2'), missing: list.filter((p) => !there(p)) },
  daOnly,
  withR2,
  wwwOnly,
  kept,
};
const WHY = ['gone on www (404)', 'not recorded yet', 'subtitles not recorded yet'];
fs.mkdirSync(path.join(root, 'tools/reports/dam'), { recursive: true });
fs.writeFileSync(path.join(root, 'tools/reports/dam/dam-media-documents.json'), `${JSON.stringify(report, null, 1)}\n`);
fs.writeFileSync(path.join(root, 'tools/reports/dam/dam-media-documents.md'), [
  '# Documents that play the site\'s own videos', '', `${report.checkedAt}, files checked on ${edge}`, '',
  `${playing.length} documents play videos; ${uses.size} use the site's own files (${links} video links, ${tracks} subtitle links). Files: ${report.files.da} in DA, ${report.files.r2} in R2, ${report.files.missing.length} not there yet.`, '',
  `## Every file in DA (${daOnly.length})`, '', ...daOnly.map((d) => `- ${d}`), '',
  `## At least one file in R2 (${withR2.length}): plays through lh-edge only`, '', ...withR2.map((d) => `- ${d}`), '',
  `## Only www's videos left (${wwwOnly.length}): nothing switched`, '', ...wwwOnly.map((d) => `- ${d}`), '',
  ...WHY.flatMap((why) => {
    const rows = kept.filter((k) => k.why === why);
    return [`## ${why} (${rows.length})`, '', ...rows.map((k) => `- ${k.doc}: ${k.file}`), ''];
  }),
].join('\n'));
if (!dry) fs.writeFileSync(path.join(root, 'tools/importer/dam-media-documents.txt'), `${changed.sort().join('\n')}\n`);
console.log(`switch-dam-media: ${playing.length} documents, ${uses.size} with own files (${changed.length} changed now): ${links} video links, ${tracks} subtitle links; DA only ${daOnly.length}, with R2 ${withR2.length}, www only ${wwwOnly.length}; files da ${report.files.da}, r2 ${report.files.r2}, missing ${report.files.missing.length}; kept ${kept.length}`);
