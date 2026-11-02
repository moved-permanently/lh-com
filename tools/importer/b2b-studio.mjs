/* eslint-disable no-console, max-len, import/no-unresolved, import/extensions, import/prefer-default-export -- tooling */
/**
 * The Studio capture of business.lufthansagroup.com (rendered pages from a real browser, delivered
 * as b2b-snapshots-NNN.tar.gz with a manifest.json) into lh-b2b's capture, as brussels-studio.mjs:
 *   --place <unpacked dir> ...  every manifest file checked (bytes, sha256), copied to its snapshot
 *       path (snapshotPathFor: tools/importer/bd-snapshots/business.lufthansagroup.com/<path>.html)
 *       only where there is none yet (an own capture wins), and recorded in the capture state
 *       (content-sites/lh-b2b/bd-session-state.json: status ok, source studio, the manifest's
 *       capture time, its list). Log: content-sites/lh-b2b/studio.json
 * Usage: node tools/importer/b2b-studio.mjs --place content-sites/lh-b2b/inputs/b2b-snapshots-001/x ...
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
const { snapshotPathFor } = await import(path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts/bd-scrape.js'));
const W = path.join(root, 'content-sites/lh-b2b');
const STATE = path.join(W, 'bd-session-state.json');
const LOG = path.join(W, 'studio.json');
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);

/** Places the archives' pages (folders with a manifest.json); returns the log. */
export function place(dirs) {
  const state = readJson(STATE, { pages: {} });
  const log = readJson(LOG, { archives: {}, placed: {}, kept: {} });
  dirs.forEach((dir) => {
    // the archive's name: its folder (content-sites/lh-b2b/inputs/<archive>/x)
    const archive = path.basename(path.basename(dir) === 'x' ? path.dirname(dir) : dir);
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
    let placed = 0;
    let kept = 0;
    manifest.forEach((m) => {
      if (m.status !== 'ok' || !m.file) return;
      const src = path.join(dir, m.file.replace(/^snapshots\//, ''));
      const buf = fs.readFileSync(src);
      if (buf.length !== m.bytes || crypto.createHash('sha256').update(buf).digest('hex') !== m.sha256) throw new Error(`${archive}: ${m.file} differs from its manifest`);
      const dest = snapshotPathFor(m.url, root);
      if (fs.existsSync(dest) && !log.placed[m.url]) {
        kept += 1;
        log.kept[m.url] = { archive, reason: 'own capture' };
        return;
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, buf);
      state.pages[m.url] = {
        status: 'ok', source: 'studio', http: m.http, at: m.at, archive, list: m.list, sha256: m.sha256, imagesTotal: m.imagesTotal, imagesPlaceholder: m.imagesPlaceholder,
      };
      log.placed[m.url] = {
        archive, at: m.at, bytes: m.bytes, list: m.list,
      };
      placed += 1;
    });
    log.archives[archive] = {
      entries: manifest.length, placed, kept, at: new Date().toISOString(),
    };
    console.log(`${archive}: ${manifest.length} entries, ${placed} placed, ${kept} kept (own capture)`);
  });
  fs.mkdirSync(W, { recursive: true });
  fs.writeFileSync(STATE, JSON.stringify(state, null, 1));
  fs.writeFileSync(LOG, `${JSON.stringify(log, null, 1)}\n`);
  return log;
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain && argv.includes('--place')) {
  const rest = argv.slice(argv.indexOf('--place') + 1);
  const end = rest.findIndex((a) => a.startsWith('--'));
  place((end < 0 ? rest : rest.slice(0, end)).map((d) => path.resolve(root, d)));
}
