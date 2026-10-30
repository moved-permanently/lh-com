/* eslint-disable no-console, max-len, import/prefer-default-export, import/extensions -- tooling */
/**
 * ITA's capture order (lh-ita) from content-sites/lh-ita/scope.json (ita-scope.mjs): batch 1 is
 * it/en's homepage and the 36 pages chosen for it (FIRST), then it/en's other pages by section,
 * then the other reference roots' pages (it/it, fr/fr, es/es, de/de, nl/nl, br/pt, gr/el, jp/ja),
 * each by section, then the market roots' own pages. One document per language page: a market
 * root's page with the same path is not captured, it is the document's `markets` metadata
 * (plan.json markets: document -> roots). Batches of about 40 pages, without the pages that have a
 * snapshot already.
 * Writes content-sites/lh-ita/runs/batch-<nn>.txt (an existing batch file is kept as it is) and
 * plan.json.
 *
 * Usage: node tools/importer/ita-plan.mjs [--size 40]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REFERENCE_ROOTS, HOST } from './ita-scope.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SNAP = path.join(root, 'tools/importer/bd-snapshots', HOST);
const SECTIONS = ['homepage', 'book-and-prepare', 'manage-my-bookings', 'world-of-ita-airways', 'support', 'help-and-contact', 'legal'];

// batch 1 (it/en)
export const FIRST = ['homepage', 'support/utilities/contact', 'world-of-ita-airways/discover-ita-airways/roma-fiumicino', 'book-and-prepare/travel-information/baggage', 'manage-my-bookings/extra-services/seats-selection', 'book-and-prepare/travel-information/at-the-airport/lounges', 'manage-my-bookings/partners', 'book-and-prepare/travel-information/baggage/restricted-and-prohibited-items', 'world-of-ita-airways/services-on-board/catering/children-meals', 'book-and-prepare/travel-information/at-the-airport/priority/priority-gates', 'manage-my-bookings/partners/car-rental', 'book-and-prepare/other-requests/accessible-travel', 'help-and-contact', 'book-and-prepare/book-flights', 'manage-my-bookings/manage/check-in', 'manage-my-bookings/manage/flight-status', 'manage-my-bookings/manage/manage-my-bookings', 'manage-my-bookings/manage/change-and-refund', 'book-and-prepare/offers-and-destinations', 'world-of-ita-airways/discover-ita-airways/ita-airways-app', 'support/utilities/payment-methods', 'legal', 'legal/passenger-rights', 'legal/cookie-policy', 'legal/conditions-of-carriage-group/conditions-of-carriage-ita', 'legal/accessibility-statement', 'legal/imprint', 'legal/data-protection-overview/data-protection-ita', 'book-and-prepare/travel-information/baggage/checked-baggage', 'book-and-prepare/travel-information/baggage/carry-on-baggage', 'world-of-ita-airways/discover-ita-airways/fleet/long-haul', 'world-of-ita-airways/travel-classes/business-long-haul', 'support/support-faq/baggage-faq', 'world-of-ita-airways/discover-ita-airways/sustainability/female-talent', 'book-and-prepare/travel-information/at-the-airport/digital-newsstand', 'book-and-prepare/travel-information/at-the-airport/security-waiting-times', 'book-and-prepare/offers/mice']
  .map((s) => `/it/en/${s}`);

const section = (s) => {
  const i = SECTIONS.indexOf(s.split('/')[1]);
  return i < 0 ? SECTIONS.length : i;
};

/** The capture order: batch 1, then each reference root by section, then the market roots' own pages. */
export function captureOrder(scope) {
  const bySection = (r) => [...(scope.roots[r]?.suffixes || [])].sort((a, b) => section(a) - section(b) || a.localeCompare(b)).map((s) => `/${r}${s}`);
  const own = Object.entries(scope.roots).filter(([, x]) => x.own?.length).flatMap(([r, x]) => x.own.map((s) => `/${r}${s}`));
  return [...new Set([...FIRST, ...REFERENCE_ROOTS.flatMap(bySection), ...own])];
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
  // batch 1 as chosen; the rest in batches of --size, without pages captured already
  const listed = new Set(FIRST);
  const todo = order.filter((p) => !listed.has(p) && !fs.existsSync(path.join(SNAP, `${p}.html`)));
  const batches = [FIRST];
  for (let i = 0; i < todo.length; i += size) batches.push(todo.slice(i, i + size));
  batches.forEach((b, i) => {
    const f = path.join(dir, `batch-${String(i + 1).padStart(2, '0')}.txt`);
    if (!fs.existsSync(f)) fs.writeFileSync(f, `${b.map((p) => `https://${HOST}${p}`).join('\n')}\n`);
  });
  const markets = Object.fromEntries(Object.entries(scope.documents).filter(([, d]) => d.markets.length).map(([p, d]) => [p, d.markets]));
  fs.writeFileSync(path.join(dir, 'plan.json'), `${JSON.stringify({
    pages: order.length, batches: batches.map((b) => ({ n: b.length, first: b[0], last: b.at(-1) })), notInSitemap: notInScope, markets,
  }, null, 1)}\n`);
  console.log(`${order.length} pages in ${batches.length} batches; batch 1: ${FIRST.length} pages (not in the scope: ${notInScope.join(' ') || 'none'})`);
  batches.slice(1).forEach((b, i) => console.log(`batch ${i + 2}: ${b.length} pages, ${b[0]} … ${b.at(-1)}`));
}
