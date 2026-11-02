/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue, max-len, import/extensions, import/prefer-default-export -- tooling */
/**
 * www images lh-swiss's preview already holds (documents previewed with www's image URLs: their
 * images are in the preview's media bus) as DAM copies, from the site's own preview host, no
 * request to www.swiss.com: per document listed, its local <img> sources and the preview's
 * .plain.html <img> sources in document order (the same count, else the document is skipped);
 * each www image not in the cache yet gets the preview's original (media_<hash>.<ext>, no query)
 * as its copy (content-sites/lh-swiss/dam-cache/<www path>, state cached, source preview).
 * swiss-dam.mjs --upload then puts them into DA, --switch shows them from DA.
 *
 * Usage: node tools/importer/swiss-dam-preview.mjs --list <file with document paths>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const W = path.join(root, 'content-sites/lh-swiss');
const PREVIEW = 'https://main--lh-swiss--moved-permanently.aem.page';
const STATE = path.join(W, 'dam-state.json');
const CACHE = path.join(W, 'dam-cache');
const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
const decode = (s) => { try { return decodeURIComponent(s); } catch (e) { return s; } };
const srcs = (html) => [...html.matchAll(/<img\b[^>]*?\ssrc="([^"]+)"/g)].map((m) => m[1].replace(/&amp;|&#x26;/g, '&'));

/** The pairs (www path, preview media URL) of a document: its www images and the preview's. */
export function pairsOf(local, preview, base) {
  // (the metadata block's image is the page's og:image, not in the preview's .plain.html)
  const a = srcs(local.replace(/<div class="metadata">[\s\S]*$/, ''));
  const b = srcs(preview);
  if (a.length !== b.length) return null;
  return a.map((s, i) => [s, b[i]]).filter(([s, m]) => /^https:\/\/www\.swiss\.com\//.test(s) && /\/media_[0-9a-f]+\.[a-z]+/.test(m))
    .map(([s, m]) => [decode(new URL(s).pathname), new URL(m.split('?')[0], `${PREVIEW}${base}`).href]);
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const list = argv[argv.indexOf('--list') + 1];
  const docs = fs.readFileSync(path.resolve(root, list), 'utf8').split('\n').map((x) => x.trim()).filter(Boolean);
  let copied = 0;
  const skipped = [];
  for (const p of docs) {
    const local = fs.readFileSync(path.join(W, 'content', `${p}.plain.html`), 'utf8');
    const r = await fetch(`${PREVIEW}${p}.plain.html`);
    if (!r.ok) { skipped.push(`${p} (preview ${r.status})`); continue; }
    const pairs = pairsOf(local, await r.text(), p);
    if (!pairs) { skipped.push(`${p} (image counts differ)`); continue; }
    for (const [www, media] of pairs) {
      if (['cached', 'aem'].includes(state[www]?.status)) continue;
      const got = await fetch(media);
      if (!got.ok) { skipped.push(`${p}: ${www} (${got.status})`); continue; }
      const buf = Buffer.from(await got.arrayBuffer());
      const file = path.join(CACHE, www.replace(/^\/content\/dam\//, ''));
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, buf);
      state[www] = {
        status: 'cached', bytes: buf.length, type: got.headers.get('content-type') || '', source: `preview ${new URL(media).pathname}`, at: new Date().toISOString(),
      };
      copied += 1;
    }
    fs.writeFileSync(STATE, `${JSON.stringify(state, null, 1)}\n`);
  }
  console.log(`swiss-dam-preview: ${copied} images copied from the preview; ${skipped.length} skipped`);
  skipped.forEach((s) => console.log(`  ${s}`));
}
