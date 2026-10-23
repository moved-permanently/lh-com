/* eslint-disable no-console -- dev tooling */
/**
 * Writes the visual parity report from the run-batch.js progress.
 *
 * node tools/parity/report.mjs [--jobs tools/parity/jobs.json]
 *   [--progress tools/reports/parity/state/progress.json]
 *   [--out tools/reports/parity-report]   (writes <out>.md and <out>.json)
 *
 * Inputs besides the progress:
 *   tools/parity/jobs.skipped.json   pages without a faithful live capture (build-jobs.mjs)
 *   tools/parity/fixes.json          append-only log, maintained by hand:
 *     [{ "page": "/de/en/homepage" | "template": "homepage" | "block": "fare-teaser",
 *        "change": "what was changed", "commit": "abc1234", "date": "2026-10-23" }]
 *     an entry with none of page/template/block is site-wide.
 *   tools/parity/impossible.md       "Genuinely impossible gaps", included verbatim
 *   tools/parity/unmapped-widgets.md "Unmapped widgets", included verbatim (unmapped-widgets.mjs)
 *   tools/importer/reports/{path}.report.json  blocks per page (to match block fixes)
 *   data/recorded/index.json         recording dates for the live-data section
 *
 * Status per page (thresholds below): pass = every width checked with unmaskedRatio <= PASS_MAX,
 * no horizontal overflow and no failed images; review = worst unmaskedRatio <= REVIEW_MAX;
 * fail = worse; pending = a width is not compared yet; error = a capture/compare gave up.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const PASS_MAX = 0.08;
const REVIEW_MAX = 0.20;
const MAX_OVERFLOW_PX = 0;
const MAX_FAILED_IMAGES = 0;
/** Height differences above this are listed under "what remains". */
const HEIGHT_NOTE = 0.03;
const SEVERITY = {
  fail: 0, error: 1, review: 2, pending: 3, pass: 4,
};

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { values: args } = parseArgs({
  options: {
    jobs: { type: 'string', default: path.join(ROOT, 'tools/parity/jobs.json') },
    progress: { type: 'string', default: path.join(ROOT, 'tools/reports/parity/state/progress.json') },
    out: { type: 'string', default: path.join(ROOT, 'tools/reports/parity-report') },
    fixes: { type: 'string', default: path.join(ROOT, 'tools/parity/fixes.json') },
    impossible: { type: 'string', default: path.join(ROOT, 'tools/parity/impossible.md') },
    unmapped: { type: 'string', default: path.join(ROOT, 'tools/parity/unmapped-widgets.md') },
  },
});

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return fallback;
  }
};
const rel = (file) => (file ? path.relative(ROOT, file) : file);
const pct = (r) => (typeof r === 'number' ? `${(r * 100).toFixed(1)}%` : '');
const normPath = (p) => `/${String(p || '').replace(/^https?:\/\/[^/]+/, '').replace(/^\/+|\/+$/g, '')}`;

const jobs = readJson(args.jobs, null);
if (!Array.isArray(jobs)) {
  console.error(`cannot read ${args.jobs}; run tools/parity/build-jobs.mjs first`);
  process.exit(2);
}
const progress = readJson(args.progress, { items: {} });
const skipped = readJson(args.jobs.replace(/\.json$/, '.skipped.json'), []);
const fixes = readJson(args.fixes, []);
const impossible = fs.existsSync(args.impossible) ? fs.readFileSync(args.impossible, 'utf8').trim() : '';
const unmapped = fs.existsSync(args.unmapped) ? fs.readFileSync(args.unmapped, 'utf8').trim() : '';
const recorded = readJson(path.join(ROOT, 'data/recorded/index.json'), { entries: {} }).entries || {};

const blocksOf = (pagePath) => (readJson(path.join(ROOT, `tools/importer/reports${pagePath}.report.json`), {}).blocks || []);

// ---- per width ----
function widthResult(job, width) {
  const item = progress.items[`${job.id}@${width}`];
  const contentWidth = (job.contentWidth && job.contentWidth[width]) || width;
  if (!item) return { width, contentWidth, state: 'pending' };
  const eds = item.captures && item.captures.eds;
  const m = (eds && eds.metrics) || {};
  const c = item.compare || {};
  const errors = Object.entries(item.captures || {})
    .filter(([, cap]) => cap.error && cap.status !== 'ok' && cap.status !== 'provided')
    .map(([side, cap]) => `${side}: ${cap.error}`);
  if (c.error) errors.push(`compare: ${c.error}`);
  let state = 'pending';
  if (item.status === 'done') state = 'done';
  else if (item.status === 'failed') state = 'error';
  return {
    width,
    contentWidth,
    state,
    unmaskedRatio: c.unmaskedRatio,
    mismatchRatio: c.mismatchRatio,
    maskRatio: c.maskRatio,
    maskBoxes: c.maskBoxes,
    heightSrc: c.heightA,
    heightEds: c.heightB,
    heightDiffRatio: c.heightDiffRatio,
    firstDivergentY: c.firstDivergentBand ? c.firstDivergentBand.y : null,
    worstBands: c.worstBands,
    capturedWidth: c.widthB,
    contentWidthMatched: m.contentWidthMatched,
    clientWidth: m.clientWidth,
    overflowPx: m.overflowPx,
    failedImages: m.failedImages,
    failedSrc: m.failedSrc,
    fonts: m.fonts,
    consentBannerVisible: m.consentBannerVisible,
    showcaseNoticeVisible: m.showcaseNoticeVisible,
    truncated: m.truncated,
    diff: rel(c.diff || item.diff),
    errors: errors.length ? errors : undefined,
  };
}

/** Plain-language list of what still differs at one width. */
function remainsAt(w) {
  const out = [];
  if (w.state === 'error') out.push(`capture/compare failed at ${w.width}: ${(w.errors || []).join('; ')}`);
  if (w.state !== 'done') return out;
  const at = `at ${w.width}`;
  const taller = w.heightEds > w.heightSrc ? 'taller' : 'shorter';
  const heightNote = w.heightDiffRatio > HEIGHT_NOTE
    ? `replica ${Math.abs(w.heightEds - w.heightSrc)} px ${taller} (${pct(w.heightDiffRatio)})` : '';
  if (w.firstDivergentY !== null) {
    out.push(`layout diverges at y≈${w.firstDivergentY} px ${at}${heightNote ? `; ${heightNote}` : ''}`);
  } else {
    if (w.unmaskedRatio > PASS_MAX) {
      const worst = (w.worstBands || [])[0];
      out.push(`${pct(w.unmaskedRatio)} of unmasked pixels differ ${at}${worst ? `, most around y≈${worst.y} px` : ''}`);
    }
    if (heightNote) out.push(`page height ${at}: ${heightNote}`);
  }
  if (w.overflowPx > MAX_OVERFLOW_PX) out.push(`horizontal overflow ${w.overflowPx} px ${at}`);
  if (w.failedImages > MAX_FAILED_IMAGES) {
    out.push(`${w.failedImages} image(s) failed ${at}${w.failedSrc ? `: ${w.failedSrc.slice(0, 2).join(', ')}` : ''}`);
  }
  const noWebfont = ['h1', 'body'].filter((k) => w.fonts && w.fonts[k] && w.fonts[k].webfont === false);
  if (noWebfont.length) {
    out.push(`no web font for ${noWebfont.map((k) => `${k} (${w.fonts[k].used})`).join(', ')} ${at}`);
  }
  if (w.consentBannerVisible) out.push(`a consent banner was visible ${at}`);
  if (w.showcaseNoticeVisible) out.push(`the showcase notice was visible ${at}`);
  if (w.contentWidthMatched === false) {
    out.push(`layout width ${w.clientWidth} px instead of ${w.contentWidth} px ${at} (diff is skewed)`);
  }
  return out;
}

function pageStatus(widths) {
  if (widths.some((w) => w.state === 'error')) return 'error';
  if (widths.some((w) => w.state !== 'done')) return 'pending';
  const worst = Math.max(...widths.map((w) => w.unmaskedRatio || 0));
  const clean = widths.every((w) => !(w.overflowPx > MAX_OVERFLOW_PX)
    && !(w.failedImages > MAX_FAILED_IMAGES));
  if (worst <= PASS_MAX && clean) return 'pass';
  if (worst <= REVIEW_MAX) return 'review';
  return 'fail';
}

// fixes.json entries also use "scope": a template name (or a comma list of them) counts as
// "template", anything else ("site", "channels", "aircore") as site-wide; "block" may be a list
const listOf = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const templateNames = new Set(jobs.map((j) => j.template));
const fixTemplates = (f) => (f.template ? listOf(f.template)
  : listOf(f.scope).filter((s) => templateNames.has(s)));
const fixKind = (f) => (f.page && 'page') || (fixTemplates(f).length && 'template')
  || (f.block && 'block') || 'site';
function fixesFor(job, blocks) {
  return fixes.filter((f) => (f.page && normPath(f.page) === job.path)
    || fixTemplates(f).includes(job.template)
    || (f.block && listOf(f.block).some((b) => blocks.includes(b))))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}
function fixLine(f) {
  const kind = fixKind(f);
  let scope = kind;
  if (kind === 'template') scope = `template ${fixTemplates(f).join(', ')}`;
  else if (kind === 'block') scope = `block ${f.block}`;
  else if (kind === 'site' && f.scope && f.scope !== 'site') scope = `site (${f.scope})`;
  return `${f.date || '?'} [${scope}] ${f.change}${f.commit ? ` (${f.commit})` : ''}`;
}

const pages = jobs.map((job) => {
  const widths = job.widths.map((w) => widthResult(job, w));
  const blocks = blocksOf(job.path);
  const status = pageStatus(widths);
  const done = widths.filter((w) => w.state === 'done');
  return {
    path: job.path,
    locale: job.locale,
    template: job.template,
    priority: job.priority,
    status,
    provisional: status === 'pending' && done.length ? pageStatus(done) : undefined,
    widthsChecked: done.map((w) => w.width),
    widths,
    fixed: fixesFor(job, blocks).map(fixLine),
    remains: widths.flatMap(remainsAt),
  };
});

// ---- summary ----
const statuses = ['pass', 'review', 'fail', 'pending', 'error'];
const locales = [...new Set(pages.map((p) => p.locale))];
const summary = Object.fromEntries(locales.map((loc) => {
  const list = pages.filter((p) => p.locale === loc);
  return [loc, Object.fromEntries([['pages', list.length], ...statuses.map((s) => [s, list.filter((p) => p.status === s).length])])];
}));
const allWidths = pages.flatMap((p) => p.widths);
const pageWidths = { total: allWidths.length, compared: allWidths.filter((w) => w.state === 'done').length };

// ---- template groups and worst page-widths (compared widths only) ----
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const comparedRows = pages.flatMap((p) => p.widths.filter((w) => w.state === 'done')
  .map((w) => ({ page: p, w })));
const groupMap = {};
comparedRows.forEach(({ page, w }) => {
  const key = `${page.template}@${w.width}`;
  (groupMap[key] ||= { template: page.template, width: w.width, ratios: [] }).ratios.push(w.unmaskedRatio || 0);
});
const templateGroups = Object.values(groupMap).map((g) => ({
  template: g.template,
  width: g.width,
  pageWidths: g.ratios.length,
  meanUnmasked: g.ratios.reduce((a, b) => a + b, 0) / g.ratios.length,
  medianUnmasked: median(g.ratios),
  maxUnmasked: Math.max(...g.ratios),
})).sort((a, b) => b.meanUnmasked - a.meanUnmasked);
const WORST_N = 20;
const worstPageWidths = [...comparedRows]
  .sort((a, b) => (b.w.unmaskedRatio || 0) - (a.w.unmaskedRatio || 0))
  .slice(0, WORST_N)
  .map(({ page, w }) => ({
    path: page.path,
    template: page.template,
    width: w.width,
    unmaskedRatio: w.unmaskedRatio,
    mismatchRatio: w.mismatchRatio,
    firstDivergentY: w.firstDivergentY,
    worstBands: w.worstBands,
    heightSrc: w.heightSrc,
    heightEds: w.heightEds,
    heightDiffRatio: w.heightDiffRatio,
    diff: w.diff,
  }));

const recordedAt = Object.values(recorded).map((e) => e.recordedAt).filter(Boolean).sort();
const liveData = {
  recordings: Object.keys(recorded).length,
  recordedFrom: recordedAt[0] || null,
  recordedTo: recordedAt[recordedAt.length - 1] || null,
  // keep in sync with LIVE_SELECTORS in capture.js
  maskedSelectors: ['.flight-search', '.fare-teaser', '.destination-finder', '.price-bar', '.weather', '.flight-status', '.table-deals .table-deals-price', '[data-lh-source]'],
};

const report = {
  generatedAt: new Date().toISOString(),
  thresholds: {
    PASS_MAX, REVIEW_MAX, MAX_OVERFLOW_PX, MAX_FAILED_IMAGES, HEIGHT_NOTE,
  },
  summary,
  pageWidths,
  templateGroups,
  worstPageWidths,
  pages,
  siteWideFixes: fixes.filter((f) => fixKind(f) === 'site').map(fixLine),
  impossible: impossible || null,
  unmappedWidgets: unmapped || null,
  liveData,
  skipped,
};

// ---- markdown ----
const md = [];
const cell = (w) => {
  if (!w) return '–';
  if (w.state === 'error') return 'error';
  if (w.state !== 'done') return '…';
  return pct(w.unmaskedRatio);
};
const esc = (s) => String(s).replace(/\|/g, '\\|');
const WIDTHS = [1440, 768, 390];

md.push('# Visual parity report', '');
md.push(`Generated ${report.generatedAt}. Live: www.lufthansa.com screenshots (tools/source-export/pages, faithful captures from 2026-10-21T18:46Z on, cookie dialog dismissed). Replica: https://main--lh-com--moved-permanently.aem.page, consent stored as "necessary only" before load. ${pageWidths.compared} of ${pageWidths.total} page-widths compared.`, '');
md.push('## Summary', '');
md.push(`| Locale | Pages | ${statuses.join(' | ')} |`, `|---|---:|${statuses.map(() => '---:').join('|')}|`);
locales.forEach((loc) => md.push(`| ${loc} | ${summary[loc].pages} | ${statuses.map((s) => summary[loc][s]).join(' | ')} |`));
md.push('');
md.push(`Status: **pass** = unmasked mismatch <= ${pct(PASS_MAX)} at every width, no horizontal overflow, no failed images; **review** = worst width <= ${pct(REVIEW_MAX)}; **fail** = worse; **pending** = not every width compared yet (the provisional status of the compared widths is given in brackets); **error** = a capture or compare gave up after a retry.`, '');
md.push('Unmasked mismatch: share of differing pixels outside the live-data widgets, which are painted the same grey in both screenshots (selectors under "Live data"). "Diverges" is the first 200 px band where more than 30% of the pixels differ, i.e. where the layout stops lining up.', '');

md.push('## Template groups', '');
md.push('Unmasked mismatch per template and width over the compared page-widths, worst mean first.', '');
md.push('| Template | Width | Page-widths | Mean | Median | Max |', '|---|---:|---:|---:|---:|---:|');
templateGroups.forEach((g) => md.push(`| ${g.template} | ${g.width} | ${g.pageWidths} | ${pct(g.meanUnmasked)} | ${pct(g.medianUnmasked)} | ${pct(g.maxUnmasked)} |`));
md.push('');

md.push(`## ${WORST_N} worst page-widths`, '');
md.push('| Page | Template | Width | Unmasked | Diverges at | Worst bands (y: share) | Height live / replica |', '|---|---|---:|---:|---|---|---|');
worstPageWidths.forEach((x) => md.push(`| ${esc(x.path)} | ${x.template} | ${x.width} | ${pct(x.unmaskedRatio)} | ${x.firstDivergentY === null ? '–' : `y≈${x.firstDivergentY}`} | ${(x.worstBands || []).map((b) => `${b.y}: ${pct(b.unmaskedRatio)}`).join(', ')} | ${x.heightSrc} / ${x.heightEds} |`));
md.push('');

md.push('## Pages', '');
md.push(`| Page | Template | Status | ${WIDTHS.join(' | ')} | Diverges at | Overflow | Failed images |`, `|---|---|---|${WIDTHS.map(() => '---:').join('|')}|---|---|---|`);
pages.forEach((p) => {
  const byW = Object.fromEntries(p.widths.map((w) => [w.width, w]));
  const done = p.widths.filter((w) => w.state === 'done');
  const diverge = done.filter((w) => w.firstDivergentY !== null).map((w) => `${w.width}: y≈${w.firstDivergentY}`).join(', ');
  const overflow = done.filter((w) => w.overflowPx > 0).map((w) => `${w.width}: ${w.overflowPx} px`).join(', ');
  const failed = done.filter((w) => w.failedImages > 0).map((w) => `${w.width}: ${w.failedImages}`).join(', ');
  const status = p.provisional ? `pending (${p.provisional})` : p.status;
  md.push(`| ${esc(p.path)} | ${p.template} | ${status} | ${WIDTHS.map((w) => cell(byW[w])).join(' | ')} | ${diverge} | ${overflow} | ${failed} |`);
});
md.push('');

md.push('## Details', '');
const detailed = pages.filter((p) => p.status !== 'pass' || p.fixed.length)
  .filter((p) => p.remains.length || p.fixed.length || p.widthsChecked.length)
  .map((p, i) => ({ p, i }))
  .sort((a, b) => SEVERITY[a.p.status] - SEVERITY[b.p.status] || a.i - b.i)
  .map(({ p }) => p);
if (!detailed.length) md.push('Nothing compared yet.', '');
detailed.forEach((p) => {
  md.push(`### ${p.path} (${p.template}): ${p.status}${p.provisional ? ` (${p.provisional} so far)` : ''}`, '');
  const checked = p.widths.filter((w) => w.state === 'done')
    .map((w) => (w.contentWidth !== w.width ? `${w.width} (${w.contentWidth} px layout)` : String(w.width)));
  md.push(`- Widths checked: ${checked.join(', ') || 'none yet'}`);
  md.push(`- Mismatch (unmasked / all): ${p.widths.map((w) => `${w.width}: ${w.state === 'done' ? `${pct(w.unmaskedRatio)} / ${pct(w.mismatchRatio)}` : w.state}`).join(', ')}`);
  md.push(`- What was fixed:${p.fixed.length ? '' : ' nothing recorded'}`);
  p.fixed.forEach((f) => md.push(`  - ${esc(f)}`));
  md.push(`- What remains:${p.remains.length ? '' : ' nothing detected'}`);
  p.remains.forEach((r) => md.push(`  - ${r}`));
  const diffs = p.widths.filter((w) => w.state === 'done' && w.diff).map((w) => w.diff);
  if (diffs.length) md.push(`- Diffs: ${diffs.join(', ')}`);
  md.push('');
});

md.push('## Site-wide fixes', '');
if (report.siteWideFixes.length) report.siteWideFixes.forEach((f) => md.push(`- ${esc(f)}`));
else md.push('None recorded (tools/parity/fixes.json).');
md.push('');

md.push('## Genuinely impossible gaps', '');
md.push(impossible ? impossible.replace(/^#\s.*\n+/, '') : 'None recorded yet (tools/parity/impossible.md).', '');

md.push('## Unmapped widgets', '');
md.push(unmapped ? unmapped.replace(/^#\s.*\n+/, '') : 'Not scanned yet (node tools/parity/unmapped-widgets.mjs).', '');

md.push('## Live data on the replica', '');
md.push(`The replica's widgets (flight search, fare teasers, destination finder, price bar, weather, flight status, deal prices) show data recorded as of the import date, ${liveData.recordedFrom ? `${liveData.recordedFrom.slice(0, 10)} to ${liveData.recordedTo.slice(0, 10)}` : '2026-10-21/22'} (${liveData.recordings} recorded responses, data/recorded/), wherever the live call is not possible.`);
md.push('- Direct live calls (airport suggestions, labels, catalogs, defaultAirport, core/feature/list, destination finder) go from the visitor\'s browser to www.lufthansa.com. They only work as long as Lufthansa keeps those routes open for cross-origin requests (CORS) and the visitor passes Lufthansa\'s bot protection; otherwise the recording is shown.');
md.push('- Fare teasers and weather always come from the recordings: lh-proxy is blocked upstream, and the live routes refuse foreign origins.');
md.push('- Shop handoff: "Find flights" posts to shop.lufthansa.com/booking/availability; the lang/portalCountry values were captured from a real de/en search, those for de/de, at/de and gb/en (de-DE, de-AT, en-GB) are unverified.');
md.push('- App view (?channel=app) drops header, footer, breadcrumb and consent banner on the assumption that the app\'s web view handles navigation and consent; not verifiable without the app and not part of this comparison.');
md.push(`- These widgets are masked in the comparison (${liveData.maskedSelectors.map((s) => `\`${s}\``).join(', ')}), because live prices, dates and weather change by the minute; their frame and position still count wherever they shift the surrounding layout.`);
md.push('');

md.push('## Not checked', '');
if (skipped.length) {
  md.push('Imported pages without a faithful live capture (no reference screenshot):', '');
  skipped.forEach((s) => md.push(`- ${s.path} (${s.template}): ${s.reason}`));
} else {
  md.push('Every imported page in scope has a faithful live capture.');
}
md.push('');

fs.mkdirSync(path.dirname(args.out), { recursive: true });
fs.writeFileSync(`${args.out}.json`, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(`${args.out}.md`, `${md.join('\n')}\n`);
const totals = statuses.map((s) => `${s} ${pages.filter((p) => p.status === s).length}`).join(', ');
console.log(`parity report: ${pages.length} pages (${totals}); ${pageWidths.compared}/${pageWidths.total} page-widths compared -> ${rel(args.out)}.md, .json`);
