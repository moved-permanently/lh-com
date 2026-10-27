/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, import/extensions, import/prefer-default-export -- dev tooling */
/**
 * Link step (tools/loc/README.md): after a rollout or a translation in the localisation app, the
 * links of the target locale's pages are made the target locale's (tools/loc/link-lib.mjs):
 *   rollout     --from de/de --to at/de   /de/de/<x> -> /at/de/<x>
 *               --from de/en --to gb/en   /de/en/<x> -> /gb/en/<x>
 *   translation --from de/en --to de/de   absolute aem.page/aem.live/lhcom links -> root-relative;
 *                                         /de/en/<x> -> /de/de/<German slug of x>
 * Links to pages without a counterpart in the target locale stay as they are and are listed;
 * links to other hosts stay. Pages: every page of the target locale in
 * tools/migration-scope/pages.csv (or --page /at/de/x ...). Run the slug step first after a
 * translation (it moves the 72 own-slug pages and uses the same link fix).
 *
 * Default: a dry run that lists what would change. --apply writes (DA POST, read back).
 * --root /drafts/loc-test: every DA path below that folder. Never previews or publishes.
 * Report (dry run over the scope, all three pairs with --all): tools/reports/loc-link-step.md
 * Usage: node tools/loc/link-step.mjs --from de/de --to at/de [--page …] [--apply] [--root …]
 *        node tools/loc/link-step.mjs --all        (dry run of the three pairs, the report)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pairMap, localizeDoc, PAIRS } from './link-lib.mjs';
import { scopeRows } from './regional-diff.mjs';
import { daClient } from './slug-step.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REFUSED = /^\/lhg(\/|$)|^\/[a-z]{2}\/[a-z]{2}\/(login|profile)(\/|$)/;

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (next < items.length) {
      const i = next;
      next += 1;
      out[i] = await fn(items[i]);
    }
  }));
  return out;
}

/** Runs the step for one pair: [{page, links, unmapped, status}]. */
export async function runLinkStep({
  from, to, pages, rows, da, apply = false, rootDir = '', concurrency = 6,
}) {
  if (!PAIRS[`${from}>${to}`]) throw new Error(`--from ${from} --to ${to}: not a rollout or translation pair (${Object.keys(PAIRS).join(', ')})`);
  const map = pairMap(rows, from, to);
  return pool(pages, apply ? 1 : concurrency, async (page) => {
    if (!page.startsWith(`/${to}/`) && page !== `/${to}`) return { page, status: `not a /${to} page` };
    if (REFUSED.test(page)) return { page, status: 'refused (lhg, login or profile)' };
    const html = await da.get(`${rootDir}${page}`);
    if (!html) return { page, status: 'not in DA' };
    const r = localizeDoc(html, map);
    const result = {
      page, links: r.links, unmapped: r.unmapped, status: r.links ? 'changes' : 'unchanged',
    };
    if (apply && r.links) {
      await da.put(`${rootDir}${page}`, r.html);
      if (!await da.get(`${rootDir}${page}`)) throw new Error(`${rootDir}${page} not readable after the save`);
      result.status = 'written';
    }
    return result;
  });
}

function summary(from, to, results) {
  const changed = results.filter((r) => r.links);
  const unmapped = new Map();
  results.forEach((r) => (r.unmapped || []).forEach((u) => unmapped.set(u, [...(unmapped.get(u) || []), r.page])));
  const lines = [`## ${from} → ${to} (${PAIRS[`${from}>${to}`]})`, '',
    `${results.length} pages: ${changed.length} with links to change (${changed.reduce((n, r) => n + r.links, 0)} links), ${results.filter((r) => r.status === 'unchanged').length} unchanged, ${results.filter((r) => !['changes', 'unchanged', 'written'].includes(r.status)).length} skipped (${[...new Set(results.filter((r) => !['changes', 'unchanged', 'written'].includes(r.status)).map((r) => r.status))].join('; ') || 'none'}).`, '',
    `Links into /${from} without a counterpart in /${to} (left as they are): ${unmapped.size}`, ''];
  [...unmapped].sort((a, b) => b[1].length - a[1].length).forEach(([u, pages]) => lines.push(`- ${u} (${pages.length} page${pages.length > 1 ? 's' : ''}: ${pages.slice(0, 3).join(', ')}${pages.length > 3 ? ', …' : ''})`));
  if (changed.length) lines.push('', 'Pages with links to change:', '', ...changed.slice(0, 40).map((r) => `- ${r.page}: ${r.links}`), changed.length > 40 ? `- … ${changed.length - 40} more` : '');
  return lines;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const opt = (name) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : undefined);
  const rows = scopeRows();
  const da = daClient();
  const all = argv.includes('--all');
  const pairs = all ? Object.keys(PAIRS).map((k) => k.split('>')) : [[opt('from'), opt('to')]];
  const listed = argv.flatMap((a, i) => (a === '--page' ? [argv[i + 1]] : []));
  const apply = argv.includes('--apply');
  if (all && apply) throw new Error('--all is a dry run only');
  const report = ['# Link step dry run over the scope (DA as it is)', '', new Date().toISOString(), ''];
  for (const [from, to] of pairs) {
    const col = {
      'de/en': 'de_en', 'de/de': 'de_de', 'at/de': 'at_de', 'gb/en': 'gb_en',
    }[to];
    const pages = listed.length ? listed : [...new Set(rows.map((r) => r[col]).filter(Boolean))];
    const results = await runLinkStep({
      from, to, pages, rows, da, apply, rootDir: opt('root') || '',
    });
    const lines = summary(from, to, results);
    console.log(lines.slice(0, 3).join('\n'));
    if (!all) results.filter((r) => r.links || (r.unmapped || []).length).forEach((r) => console.log(`  ${r.status} ${r.page}: ${r.links} links${r.unmapped.length ? `; without counterpart: ${r.unmapped.join(', ')}` : ''}`));
    report.push(...lines, '');
  }
  if (all) fs.writeFileSync(path.join(root, 'tools/reports/loc-link-step.md'), `${report.join('\n')}\n`);
}
