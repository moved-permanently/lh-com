/* eslint-disable no-console, max-len, import/prefer-default-export, import/extensions -- tooling */
/**
 * ITA's batch order (lh-ita) from content-sites/lh-ita/scope.json (ita-scope.mjs): batch 1 is
 * it/en's homepage and the 36 pages chosen for it (FIRST), then the reference roots in the Studio
 * capture's order (ROOT_ORDER: it/it, the rest of it/en, fr/fr, es/es, de/de, nl/nl, br/pt, gr/el,
 * jp/ja; alphabetical within a root, as the Studio's archives come), then the market roots' own
 * pages. One document per language page: a market root's page with the same path is the
 * document's `markets` metadata (plan.json markets: document -> roots). Batches of about 40
 * pages; the import reads their snapshots (own or the Studio's, ita-studio.mjs), the capture fills
 * only the gaps.
 * Writes content-sites/lh-ita/runs/batch-<nn>.txt (a batch already imported keeps its file) and
 * plan.json (per batch its size and how many pages have a snapshot).
 *
 * Usage: node tools/importer/ita-plan.mjs [--size 40]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOST } from './ita-scope.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SNAP = path.join(root, 'tools/importer/bd-snapshots', HOST);
// the reference roots in the Studio's capture order (it/it first, then the rest of it/en)
export const ROOT_ORDER = ['it/it', 'it/en', 'fr/fr', 'es/es', 'de/de', 'nl/nl', 'br/pt', 'gr/el', 'jp/ja'];

// batch 1 (it/en)
export const FIRST = ['homepage', 'support/utilities/contact', 'world-of-ita-airways/discover-ita-airways/roma-fiumicino', 'book-and-prepare/travel-information/baggage', 'manage-my-bookings/extra-services/seats-selection', 'book-and-prepare/travel-information/at-the-airport/lounges', 'manage-my-bookings/partners', 'book-and-prepare/travel-information/baggage/restricted-and-prohibited-items', 'world-of-ita-airways/services-on-board/catering/children-meals', 'book-and-prepare/travel-information/at-the-airport/priority/priority-gates', 'manage-my-bookings/partners/car-rental', 'book-and-prepare/other-requests/accessible-travel', 'help-and-contact', 'book-and-prepare/book-flights', 'manage-my-bookings/manage/check-in', 'manage-my-bookings/manage/flight-status', 'manage-my-bookings/manage/manage-my-bookings', 'manage-my-bookings/manage/change-and-refund', 'book-and-prepare/offers-and-destinations', 'world-of-ita-airways/discover-ita-airways/ita-airways-app', 'support/utilities/payment-methods', 'legal', 'legal/passenger-rights', 'legal/cookie-policy', 'legal/conditions-of-carriage-group/conditions-of-carriage-ita', 'legal/accessibility-statement', 'legal/imprint', 'legal/data-protection-overview/data-protection-ita', 'book-and-prepare/travel-information/baggage/checked-baggage', 'book-and-prepare/travel-information/baggage/carry-on-baggage', 'world-of-ita-airways/discover-ita-airways/fleet/long-haul', 'world-of-ita-airways/travel-classes/business-long-haul', 'support/support-faq/baggage-faq', 'world-of-ita-airways/discover-ita-airways/sustainability/female-talent', 'book-and-prepare/travel-information/at-the-airport/digital-newsstand', 'book-and-prepare/travel-information/at-the-airport/security-waiting-times', 'book-and-prepare/offers/mice']
  .map((s) => `/it/en/${s}`);

/** The capture order: batch 1, then each reference root in the Studio's order, then the market roots' own pages. */
export function captureOrder(scope) {
  // alphabetical within a root, as the Studio captures them (its archives then complete batches)
  const byPath = (r) => [...(scope.roots[r]?.suffixes || [])].sort((a, b) => a.localeCompare(b)).map((s) => `/${r}${s}`);
  const own = Object.entries(scope.roots).filter(([, x]) => x.own?.length).flatMap(([r, x]) => x.own.map((s) => `/${r}${s}`));
  return [...new Set([...FIRST, ...ROOT_ORDER.flatMap(byPath), ...own])];
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const size = Number(argv.includes('--size') ? argv[argv.indexOf('--size') + 1] : 40);
  const scope = JSON.parse(fs.readFileSync(path.join(root, 'content-sites/lh-ita/scope.json'), 'utf8'));
  const dir = path.join(root, 'content-sites/lh-ita/runs');
  fs.mkdirSync(dir, { recursive: true });
  const order = captureOrder(scope);
  const notInScope = FIRST.filter((p) => !scope.documents[p]);
  // batch 1 as chosen; the rest in batches of --size (snapshotted or not: the import reads the
  // snapshots, the capture fills only the gaps)
  // the batches already imported stay as they are (their files, pages and numbers); the rest of
  // the order follows them in batches of --size, written anew
  const imported = [];
  for (let n = 1; fs.existsSync(path.join(dir, `batch-${String(n).padStart(2, '0')}-import.json`)); n += 1) {
    imported.push(fs.readFileSync(path.join(dir, `batch-${String(n).padStart(2, '0')}.txt`), 'utf8').split('\n').filter(Boolean).map((u) => new URL(u).pathname));
  }
  const listed = new Set([...FIRST, ...imported.flat()]);
  const todo = order.filter((p) => !listed.has(p));
  const batches = imported.length ? [...imported] : [FIRST];
  for (let i = 0; i < todo.length; i += size) batches.push(todo.slice(i, i + size));
  batches.forEach((b, i) => {
    if (i < imported.length) return;
    fs.writeFileSync(path.join(dir, `batch-${String(i + 1).padStart(2, '0')}.txt`), `${b.map((p) => `https://${HOST}${p}`).join('\n')}\n`);
  });
  const markets = Object.fromEntries(Object.entries(scope.documents).filter(([, d]) => d.markets.length).map(([p, d]) => [p, d.markets]));
  const snapshotted = (b) => b.filter((p) => fs.existsSync(path.join(SNAP, `${p}.html`))).length;
  fs.writeFileSync(path.join(dir, 'plan.json'), `${JSON.stringify({
    pages: order.length,
    batches: batches.map((b) => ({
      n: b.length, snapshots: snapshotted(b), first: b[0], last: b.at(-1),
    })),
    notInSitemap: notInScope,
    markets,
  }, null, 1)}\n`);
  console.log(`${order.length} pages in ${batches.length} batches; batch 1: ${FIRST.length} pages (not in the scope: ${notInScope.join(' ') || 'none'})`);
  batches.slice(1).forEach((b, i) => console.log(`batch ${i + 2}: ${b.length} pages (${snapshotted(b)} with a snapshot), ${b[0]} … ${b.at(-1)}`));
}
