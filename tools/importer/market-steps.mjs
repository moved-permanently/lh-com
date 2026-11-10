/* eslint-disable no-console, max-len, import/extensions -- tooling */
/**
 * The market steps of a re-import list (brief 558; tools/importer/market-sections.mjs) run over documents the import
 * harness wrote: for the import helper, after the template imports of the list's pages.
 *
 * List (TSV, header row): row, action, document, variant, markets, hide, archive, expected
 * - action `markets-section`: <docs>/<document>.html (the language version's document) and <docs>/<variant>.html
 *   (the stand-in root's page imported with the same template: input only, never uploaded) give the merged version
 *   document; markets "<home>|<others>" (e.g. "de|-de").
 * - action `shared-variant`: <docs>/<document>.html gets the page metadata markets (the group, "cn/de, es/de").
 * - action `tabs-by-market`: <docs>/<document>.html's Flight Search gets the Tabs by market row; markets the group,
 *   hide the tab kinds ("car, hotel").
 * Writes <out>/<document>.html (default: in place) and prints one line per row (what changed). A row whose inputs
 * are missing is reported and skipped; nothing is uploaded here.
 *
 * Usage: node tools/importer/market-steps.mjs --list <list.tsv> --docs <dir> [--out <dir>] [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { mergeMarketVariant, withPageMarkets, withTabsByMarket } from './market-sections.mjs';

/** The list's rows as objects (by the header row's names). */
export function readList(text) {
  const lines = text.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
  const head = lines.shift().split('\t');
  return lines.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [head[i], v])));
}

/** One row's step on documents read by `read` (path -> html or null); returns { html, note } or { skip }. */
export function runRow(row, read) {
  const doc = read(row.document);
  if (doc === null) return { skip: `no document ${row.document}` };
  if (row.action === 'markets-section') {
    const variant = read(row.variant);
    if (variant === null) return { skip: `no variant ${row.variant}` };
    const [home, others] = String(row.markets).split('|');
    const r = mergeMarketVariant(doc, variant, { home, others });
    return { html: r.html, note: r.unchanged ? 'no difference' : `${r.runs.length} run(s): ${r.runs.map((x) => `${x.version.length}/${x.variant.length}`).join(', ')} sections` };
  }
  if (row.action === 'shared-variant') return { html: withPageMarkets(doc, row.markets), note: `markets ${row.markets}` };
  if (row.action === 'tabs-by-market') {
    const hide = String(row.hide || '').split(/[\s,]+/).filter(Boolean);
    const r = withTabsByMarket(doc, [{ markets: row.markets, hide }]);
    return r.blocks ? { html: r.html, note: `Tabs by market on ${r.blocks} block(s)` } : { skip: 'no Flight Search with tabs left to show' };
  }
  return { skip: `unknown action ${row.action}` };
}

function main() {
  const args = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
  const list = opt('--list');
  const docs = opt('--docs');
  const out = opt('--out') || docs;
  if (!list || !docs) {
    console.error('usage: node tools/importer/market-steps.mjs --list <list.tsv> --docs <dir> [--out <dir>] [--dry-run]');
    process.exit(2);
  }
  const read = (p) => { const f = path.join(docs, `${p}.html`); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null; };
  readList(fs.readFileSync(list, 'utf8')).forEach((row) => {
    const r = runRow(row, read);
    if (r.skip) { console.log(`${row.row}\t${row.document}\tskipped: ${r.skip}`); return; }
    if (!args.includes('--dry-run')) {
      const f = path.join(out, `${row.document}.html`);
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, r.html);
    }
    console.log(`${row.row}\t${row.document}\t${r.note}`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) main();
