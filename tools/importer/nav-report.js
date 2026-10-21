/* eslint-disable no-console, import/no-extraneous-dependencies -- dev tooling */
/**
 * Lists the nav/footer links that still point at a live Lufthansa site instead of a migrated page.
 * Writes tools/reports/nav-unmigrated.xlsx (sheets 'links' and 'summary') and .json.
 *
 * node tools/importer/nav-report.js [--content-dir content] [--out-dir tools/reports]
 *   [--status tools/reports/nav-link-status.json]
 *
 * Input per locale: <content-dir>/{de/en,de/de,at/de,gb/en}/{nav,footer}.plain.html.
 * Scope: tools/migration-scope/pages.csv, tools/migration-scope/aircore.csv and
 * tools/importer/aircore-locales.csv (whichever exist; columns de_en,de_de,at_de,gb_en).
 * Live HTTP status comes from the optional status file {url: status}; it has to be measured
 * from a real browser (lufthansa.com blocks bots), so without it the column says 'not checked'.
 */
const fs = require('fs');
const path = require('path');
const { parseArgs } = require('util');
const ExcelJS = require('exceljs');

const ROOT = path.resolve(__dirname, '../..');
const LOCALES = ['de/en', 'de/de', 'at/de', 'gb/en'];
const LOCALE_COLUMNS = ['de_en', 'de_de', 'at_de', 'gb_en'];
const SCOPE_FILES = [
  'tools/migration-scope/pages.csv',
  'tools/migration-scope/aircore.csv',
  'tools/importer/aircore-locales.csv',
];

/** Lufthansa (Group) domains; a host matches the domain itself or any subdomain of it. */
const LH_DOMAINS = [
  'lufthansa.com',
  'lufthansagroup.com',
  'lufthansa-group.com',
  'lhgroup.com',
  'miles-and-more.com',
  'milesandmore.com',
  'lufthansa-cargo.com',
  'lufthansa-technik.com',
  'lufthansa-systems.com',
  'lufthansa-aviation-training.com',
  'lufthansa-experts.com',
  'lufthansa-holidays.com',
  'be-lufthansa.com',
  'travelid.com',
  'swiss.com',
  'austrian.com',
  'brusselsairlines.com',
  'eurowings.com',
  'discover-airlines.com',
  'lhcityairlines.com',
];
const MAIN_HOSTS = ['www.lufthansa.com', 'lufthansa.com'];

const REASONS = {
  inScope: 'in scope – link should be rewritten',
  shop: 'booking flow (shop.lufthansa.com) – out of scope',
  login: 'login / Travel ID – out of scope',
  deeplink: 'My Flights deeplink – out of scope',
  checkin: 'check-in flow – out of scope',
  group: 'other Lufthansa Group domain – separate site',
  subdomain: 'lufthansa.com subdomain – separate site',
  notInScope: 'page not in migration scope',
};

// ---------- tiny HTML parser (EDS fragment HTML is simple and well-formed) ----------
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '',
};

function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

function parseAttrs(s) {
  const attrs = {};
  s.replace(/([^\s=/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g, (m, k, a, b, c) => {
    attrs[k.toLowerCase()] = decode(a ?? b ?? c ?? '');
    return m;
  });
  return attrs;
}

function parseHtml(html) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>|([^<]+)/g;
  let m = re.exec(html);
  while (m) {
    const [, close, rawTag, rawAttrs, text] = m;
    const top = stack[stack.length - 1];
    if (text !== undefined) {
      top.children.push({ text: decode(text) });
    } else if (rawTag) {
      const tag = rawTag.toLowerCase();
      if (close) {
        const i = stack.map((n) => n.tag).lastIndexOf(tag);
        if (i > 0) stack.length = i;
      } else {
        const node = { tag, attrs: parseAttrs(rawAttrs), children: [] };
        top.children.push(node);
        if (!VOID.has(tag) && !/\/\s*$/.test(rawAttrs)) stack.push(node);
      }
    }
    m = re.exec(html);
  }
  return root;
}

// icon notation (:name:) is not a label
const textOf = (n) => (n.text !== undefined ? n.text : n.children.map(textOf).join(''))
  .replace(/(^|\s):[a-z0-9-]+:(?=\s|$)/gi, ' ').replace(/\s+/g, ' ').trim();
const isHeading = (n) => /^h[1-6]$/.test(n.tag || '');
const isList = (n) => n.tag === 'ul' || n.tag === 'ol';
const hasLink = (n) => n.tag === 'a' || (n.children || []).some(hasLink);

// ---------- link extraction ----------
/**
 * Walks one fragment and returns every link with its area and menu path.
 * Top-level sections are the root <div>s. In the nav, links of first-level <li>s (and links
 * outside lists) are 'header', anything nested deeper inside a nav item is 'flyout'.
 * A heading or a text-only <p> names the lists that follow it in the same container;
 * an <li>'s own label (first <p>/heading/link/text) names its nested lists.
 */
function extractLinks(html, kind) {
  const links = [];
  const emit = (a, ctx) => {
    let area = 'footer';
    if (kind === 'nav') area = ctx.depth >= 2 || ctx.inFlyout ? 'flyout' : 'header';
    links.push({
      area,
      menuPath: ctx.path.filter(Boolean).join(' > '),
      label: textOf(a) || a.attrs.title || a.attrs['aria-label'] || '',
      href: a.attrs.href || '',
    });
  };

  function walk(nodes, ctx) {
    // a heading names everything after it in this container, a text-only <p> only the lists
    let group = null;
    nodes.forEach((n) => {
      if (n.text !== undefined) return;
      if (n.tag === 'a') {
        emit(n, ctx);
        walk(n.children, ctx);
      } else if (isHeading(n) || (n.tag === 'p' && !hasLink(n) && textOf(n))) {
        if (textOf(n)) group = { label: textOf(n), heading: isHeading(n) };
        walk(n.children, ctx);
      } else if (isList(n)) {
        const path2 = group ? [...ctx.path, group.label] : ctx.path;
        n.children.filter((li) => li.tag === 'li').forEach((li) => {
          // the li's label: its first non-list child element, or its leading text
          const own = li.children.filter((c) => !(c.tag && isList(c)));
          const labelNode = own.find((c) => (c.tag || textOf(c)));
          const label = labelNode ? textOf(labelNode) : '';
          const liCtx = { ...ctx, depth: ctx.depth + 1, path: path2 };
          // everything else inside a nav item (nested lists, teasers) belongs to its flyout
          const restCtx = { ...liCtx, path: [...path2, label], inFlyout: kind === 'nav' };
          li.children.forEach((c) => walk([c], c === labelNode ? liCtx : restCtx));
        });
      } else {
        const named = group && group.heading;
        walk(n.children, named ? { ...ctx, path: [...ctx.path, group.label] } : ctx);
      }
    });
  }

  const root = parseHtml(html);
  const sections = root.children.filter((n) => n.tag === 'div');
  (sections.length ? sections : [root]).forEach((s) => walk(s.children, { depth: 0, path: [] }));
  return links;
}

// ---------- classification ----------
const normPath = (p) => (decodeURIComponent(p).replace(/\/+$/, '').replace(/\.html?$/, '').toLowerCase() || '/');

function lhDomain(host) {
  return LH_DOMAINS.find((d) => host === d || host.endsWith(`.${d}`));
}

function classify(url, scope) {
  const host = url.hostname.toLowerCase();
  const p = url.pathname.toLowerCase();
  const inScope = MAIN_HOSTS.includes(host) && scope.has(normPath(url.pathname));
  let reason;
  if (inScope) reason = REASONS.inScope;
  else if (host === 'shop.lufthansa.com') reason = REASONS.shop;
  else if (/\/profile|travel-?id|login|\/signin|\/sign-in/.test(`${host}${p}`)) reason = REASONS.login;
  else if (/\/deeplink/.test(p)) reason = REASONS.deeplink;
  else if (/check-?in/.test(`${host}${p}`)) reason = REASONS.checkin;
  else if (lhDomain(host) !== 'lufthansa.com') reason = REASONS.group;
  else if (!MAIN_HOSTS.includes(host)) reason = REASONS.subdomain;
  else reason = REASONS.notInScope;
  return { inScope, reason };
}

// ---------- inputs ----------
function readCsv(file) {
  if (!fs.existsSync(file)) return [];
  const [head, ...lines] = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const cols = head.split(',').map((c) => c.trim());
  return lines.map((l) => Object.fromEntries(l.split(',').map((v, i) => [cols[i], v.trim()])));
}

function loadScope() {
  const paths = new Set();
  const used = [];
  SCOPE_FILES.forEach((rel) => {
    const rows = readCsv(path.join(ROOT, rel));
    if (!rows.length) return;
    used.push(`${rel} (${rows.length} rows)`);
    rows.forEach((r) => LOCALE_COLUMNS.forEach((c) => {
      if (r[c]) paths.add(normPath(r[c]));
    }));
  });
  return { paths, used };
}

function statusFor(statuses, href) {
  if (!statuses) return 'not checked';
  const noHash = href.split('#')[0];
  const variants = [href, noHash, noHash.replace(/\/+$/, ''), `${noHash.replace(/\/+$/, '')}/`];
  const hit = variants.find((v) => statuses[v] !== undefined);
  return hit ? statuses[hit] : 'not checked';
}

// ---------- output ----------
const COLUMNS = [
  { header: 'Locale', key: 'locale', width: 9 },
  { header: 'Nav area', key: 'area', width: 10 },
  { header: 'Menu path', key: 'menuPath', width: 42 },
  { header: 'Label', key: 'label', width: 34 },
  { header: 'Target URL', key: 'url', width: 70 },
  { header: 'Live HTTP status', key: 'status', width: 16 },
  { header: 'In migration scope', key: 'inScope', width: 18 },
  { header: 'Reason not migrated', key: 'reason', width: 48 },
];

function styleHeader(ws, lastRow) {
  const header = ws.getRow(1);
  header.font = { bold: true };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF7' } };
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = {
    from: { row: 1, column: 1 }, to: { row: Math.max(1, lastRow), column: ws.columnCount },
  };
}

function countBy(rows, keys) {
  const map = new Map();
  rows.forEach((r) => {
    const k = keys.map((key) => r[key]).join('\u0000');
    map.set(k, (map.get(k) || 0) + 1);
  });
  return [...map.entries()].map(([k, count]) => [...k.split('\u0000'), count])
    .sort((a, b) => a.slice(0, -1).join().localeCompare(b.slice(0, -1).join()));
}

async function writeXlsx(file, rows) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'tools/importer/nav-report.js';
  const ws = wb.addWorksheet('links');
  ws.columns = COLUMNS;
  rows.forEach((r) => {
    const row = ws.addRow({ ...r, inScope: r.inScope ? 'yes' : 'no' });
    row.getCell('url').value = { text: r.url, hyperlink: r.url };
    row.getCell('url').font = { color: { argb: 'FF1F4E9A' }, underline: true };
  });
  styleHeader(ws, rows.length + 1);

  const sum = wb.addWorksheet('summary');
  sum.columns = [
    { header: 'Locale', key: 'a', width: 10 },
    { header: 'Nav area', key: 'b', width: 10 },
    { header: 'Reason not migrated', key: 'c', width: 48 },
    { header: 'Links', key: 'd', width: 8 },
  ];
  const grouped = countBy(rows, ['locale', 'area', 'reason']);
  grouped.forEach((g) => sum.addRow(g));
  styleHeader(sum, grouped.length + 1);
  const table = (title, keys) => {
    sum.addRow([]);
    sum.addRow([title]).font = { bold: true };
    countBy(rows, keys).forEach(([k, n]) => sum.addRow([k, '', '', n]));
  };
  table('Total by locale', ['locale']);
  table('Total by nav area', ['area']);
  table('Total by reason', ['reason']);
  sum.addRow([]);
  sum.addRow(['Total', '', '', rows.length]).font = { bold: true };
  await wb.xlsx.writeFile(file);
}

async function main() {
  const { values: args } = parseArgs({
    options: {
      'content-dir': { type: 'string', default: path.join(ROOT, 'content') },
      'out-dir': { type: 'string', default: path.join(ROOT, 'tools/reports') },
      status: { type: 'string', default: path.join(ROOT, 'tools/reports/nav-link-status.json') },
    },
  });
  const contentDir = path.resolve(args['content-dir']);
  const outDir = path.resolve(args['out-dir']);
  const statuses = fs.existsSync(args.status) ? JSON.parse(fs.readFileSync(args.status, 'utf8')) : null;
  const scope = loadScope();

  const rows = [];
  const inputs = {};
  LOCALES.forEach((locale) => {
    inputs[locale] = {};
    ['nav', 'footer'].forEach((kind) => {
      const file = path.join(contentDir, locale, `${kind}.plain.html`);
      inputs[locale][kind] = fs.existsSync(file);
      if (!inputs[locale][kind]) {
        console.warn(`missing ${path.relative(ROOT, file)}`);
        return;
      }
      extractLinks(fs.readFileSync(file, 'utf8'), kind).forEach((link) => {
        let url;
        try {
          url = new URL(link.href.startsWith('//') ? `https:${link.href}` : link.href);
        } catch (e) {
          return; // relative link: a migrated page
        }
        if (!/^https?:$/.test(url.protocol) || !lhDomain(url.hostname.toLowerCase())) return;
        rows.push({
          locale,
          area: link.area,
          menuPath: link.menuPath,
          label: link.label,
          url: url.href,
          status: statusFor(statuses, link.href),
          ...classify(url, scope.paths),
        });
      });
    });
  });

  fs.mkdirSync(outDir, { recursive: true });
  const xlsx = path.join(outDir, 'nav-unmigrated.xlsx');
  const json = path.join(outDir, 'nav-unmigrated.json');
  await writeXlsx(xlsx, rows);
  const summary = Object.fromEntries(['locale', 'area', 'reason']
    .map((k) => [k, Object.fromEntries(countBy(rows, [k]))]));
  fs.writeFileSync(json, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    contentDir: contentDir.startsWith(`${ROOT}/`) ? path.relative(ROOT, contentDir) : contentDir,
    scope: { files: scope.used, paths: scope.paths.size },
    statusFile: statuses ? path.relative(ROOT, path.resolve(args.status)) : null,
    inputs,
    summary,
    links: rows,
  }, null, 2)}\n`);
  const show = (f) => (f.startsWith(`${ROOT}/`) ? path.relative(ROOT, f) : f);
  console.log(`${rows.length} unmigrated links -> ${show(xlsx)}, ${show(json)}`);
}

module.exports = { extractLinks, classify, parseHtml };

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
