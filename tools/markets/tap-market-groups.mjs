/* eslint-disable no-console, max-len, import/extensions, import/prefer-default-export -- tooling */
/**
 * TAP's market comparison as decisions for tap-markets.mjs (the standing order of 2026-11-10, item 3c):
 * tools/reports/market-diff/tap/import-list.tsv (the comparison's rows, brief 488) to
 * tools/reports/market-diff/tap/market-groups.json:
 * - pages: per language page (/<language version><rest>), the root groups www serves another variant
 *   of it without a rule, grouped by the comparison's variant hash: a version page local to its home
 *   market ("version-local: fix <page> (home-market section)": every root of the group sees the
 *   roots' variant) or a group sharing a variant ("one document with markets"). tap-markets.mjs gives
 *   a group whose capture differs its unit with its countries, the language version's unit every
 *   other country;
 * - own: per root, the pages it has a document of its own for ("own document": www URLs, the CLI's
 *   own pages, converted from the root's capture).
 * Left out: the alerts page (pt-pt/alertas-e-informacoes: the alerts come from lh-tap's Message
 * Center in the browser, the comparison's summary: nothing to import).
 *
 * Usage: node tools/markets/tap-market-groups.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { languageOf } from '../importer/tap-markets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const IN = path.join(root, 'tools/reports/market-diff/tap/import-list.tsv');
const OUT = path.join(root, 'tools/reports/market-diff/tap/market-groups.json');
const LEFT_OUT = new Set(['/pt-pt/alertas-e-informacoes']);

/**
 * The decisions from the comparison's rows.
 * @param {string} tsv import-list.tsv
 * @returns {{pages: object, own: object, leftOut: string[]}}
 */
export function marketGroups(tsv) {
  const [head, ...lines] = tsv.trim().split('\n');
  const cols = head.split('\t');
  const rows = lines.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [cols[i], v])));
  const pages = {};
  const own = {};
  const leftOut = new Set();
  rows.forEach((r) => {
    const lv = languageOf(r.root);
    const page = `/${lv}${r.rest}`;
    const local = /^version-local: fix ([a-z]{2}-[a-z]{2}\/\S+) \(home-market section\)/.exec(r.action);
    if (local || /^one document with markets/.test(r.action)) {
      if (LEFT_OUT.has(page)) { leftOut.add(page); return; }
      if (!pages[page]) pages[page] = [];
      const groups = pages[page];
      let g = groups.find((x) => x.variant === r.variant);
      if (!g) {
        g = {
          variant: r.variant, kind: local ? 'version-local' : 'shared variant', roots: [], countries: [],
        };
        groups.push(g);
      }
      g.roots.push(r.root);
      g.countries.push(r.root.split('-')[1]);
      return;
    }
    if (r.action === 'own document') (own[r.root] ||= []).push(`https://www.flytap.com${r.www_path}`);
  });
  Object.values(pages).forEach((gs) => gs.forEach((g) => { g.roots.sort(); g.countries = [...new Set(g.countries)].sort(); }));
  Object.values(own).forEach((l) => l.sort());
  const sortedKeys = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
  return { pages: sortedKeys(pages), own: sortedKeys(own), leftOut: [...leftOut].sort() };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = {
    about: 'TAP\'s market comparison (tools/reports/market-diff/tap/import-list.tsv) as decisions for tools/importer/tap-markets.mjs: pages: per language page the root groups www serves another variant without a rule (by the comparison\'s variant hash), each a section with its countries; own: per root the pages it gets a document of its own for. Written by tools/markets/tap-market-groups.mjs',
    ...marketGroups(fs.readFileSync(IN, 'utf8')),
  };
  const text = `${JSON.stringify(out, null, 1)}\n`;
  if (process.argv.includes('--check')) {
    const same = fs.existsSync(OUT) && fs.readFileSync(OUT, 'utf8') === text;
    console.log(same ? 'market-groups.json up to date' : 'market-groups.json out of date');
    process.exit(same ? 0 : 1);
  }
  fs.writeFileSync(OUT, text);
  const groups = Object.values(out.pages).flat();
  console.log(`${Object.keys(out.pages).length} pages, ${groups.length} groups (${groups.reduce((n, g) => n + g.roots.length, 0)} roots), ${Object.values(out.own).flat().length} own documents for ${Object.keys(out.own).length} roots; left out ${out.leftOut.join(', ')}`);
}
