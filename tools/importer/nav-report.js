/* eslint-disable no-console, import/no-extraneous-dependencies -- dev tooling */
/**
 * Lists the header, flyout (mega menu) and footer links that still point at a live
 * Lufthansa site instead of a migrated page. No browser, no network: reads the content documents.
 *
 * node tools/importer/nav-report.js [--content-dir content] [--out-dir tools/reports]
 *   [--status tools/reports/nav-link-status.json]
 *
 * Input per locale (de/en, de/de, at/de, gb/en), relative to --content-dir:
 *   {locale}/nav.plain.html                     header: logo, quick actions, tools and the
 *                                               country/language dialog list; flyout: mega menu
 *   {locale}/footer.plain.html                  footer
 * Scope: tools/importer/transformers/scope-paths.js (pages.csv + market-only pages; regenerate it
 * with build-scope-paths.js). A path is in scope when its normalized form (no query/hash,
 * no .html, no trailing slash) is in that set.
 * Live HTTP status: from the optional status file {url: status}. lufthansa.com blocks bots,
 * so it has to be measured in a real browser; the URLs to measure are written to
 * <out-dir>/nav-link-urls.txt. Without the status file the column says 'not checked'.
 *
 * Output: <out-dir>/nav-unmigrated.xlsx (sheets 'links', 'summary', 'in-scope-absolute'),
 * <out-dir>/nav-unmigrated.json and <out-dir>/nav-link-urls.txt.
 */
const fs = require('fs');
const path = require('path');
const { parseArgs } = require('util');
const ExcelJS = require('exceljs');

const ROOT = path.resolve(__dirname, '../..');
// the migrated locales (status live) of the locale table's source, tools/markets/locale-data.json
const LIVE_ROOTS = Object.entries(JSON.parse(fs.readFileSync(path.join(__dirname, '../markets/locale-data.json'), 'utf8')).roots)
  .filter(([, row]) => row.status === 'live').map(([key]) => key);
const LOCALES = LIVE_ROOTS;
const SCOPE_FILE = 'tools/importer/transformers/scope-paths.js';

/**
 * Lufthansa domains; a host matches the domain itself or any subdomain of it
 * (shop., api.travelid., once., next., business., ...).
 */
const LH_DOMAINS = [
  'lufthansa.com',
  'lufthansagroup.com',
  'lufthansagroup.careers',
  'miles-and-more.com',
  'lufthansa-cargo.com',
  'lufthansa-technik.com',
  'makechangefly.com',
];
const MAIN_HOSTS = ['www.lufthansa.com', 'lufthansa.com'];
const SEPARATE_SITES = {
  'lufthansagroup.careers': 'Lufthansa Group careers',
  'miles-and-more.com': 'Miles & More',
  'lufthansa-cargo.com': 'Lufthansa Cargo',
  'lufthansa-technik.com': 'Lufthansa Technik',
  'makechangefly.com': 'Lufthansa Group sustainability (Make Change Fly)',
};

const REASONS = {
  inScope: 'in scope – link should be rewritten',
  shop: 'booking flow on shop.lufthansa.com – out of scope',
  login: 'login / Travel ID – out of scope',
  deeplink: 'My Flights (/deeplink/*) – out of scope',
  checkin: 'check-in flow (once.lufthansa.com) – out of scope',
  help: 'help/contact app (/support/*, /help-and-contact) – not in migration scope',
  group: (host) => `Lufthansa Group site (${host}) – separate site`,
  separate: (name, host) => `separate site: ${name} (${host})`,
  subdomain: (host) => `lufthansa.com subdomain (${host}) – separate application, not in migration scope`,
  root: 'site root www.lufthansa.com/ (redirects by visitor IP) – page not in migration scope',
  otherLocale: `other country/language site – not in migration scope (migrated locales: ${LOCALES.join(', ')})`,
  aircore: 'AirCore page (/lhg/, left the replica on 2026-10-25) – page not in migration scope',
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
const stripIcons = (s) => s.replace(/(^|\s):[a-z0-9-]+:(?=\s|$)/gi, ' ').replace(/\s+/g, ' ').trim();
const rawText = (n) => (n.text !== undefined ? n.text : n.children.map(rawText).join(''));
const textOf = (n) => stripIcons(rawText(n));
const isHeading = (n) => /^h[1-6]$/.test(n.tag || '');
const isList = (n) => n.tag === 'ul' || n.tag === 'ol';
const find = (n, pred) => (pred(n) ? n
  : (n.children || []).reduce((hit, c) => hit || find(c, pred), null));
const hasLink = (n) => Boolean(find(n, (x) => x.tag === 'a'));
const hasIconTokens = (n) => /(^|\s):[a-z0-9-]+:(\s|$)/i.test(rawText(n));
const linkLabel = (a) => {
  const img = find(a, (x) => x.tag === 'img');
  return textOf(a) || a.attrs.title || (img && img.attrs.alt) || a.attrs['aria-label'] || '';
};

// ---------- link extraction ----------
/**
 * Walks one container and returns its links with the label chain above them: a heading or a
 * text-only <p> names the lists that follow it; an <li>'s own label (first <p>/heading/link/
 * text) names its nested lists. `nested` is true for links below a first-level <li>.
 */
function walkLinks(nodes) {
  const links = [];
  function walk(list, ctx) {
    let group = null;
    list.forEach((n) => {
      if (n.text !== undefined) return;
      if (n.tag === 'a') {
        links.push({ a: n, path: ctx.path, nested: ctx.nested });
        walk(n.children, ctx);
      } else if (isHeading(n) || (n.tag === 'p' && !hasLink(n) && textOf(n))) {
        if (textOf(n)) group = textOf(n);
        if (isHeading(n)) walk(n.children, ctx); // a linked heading is a link of its own
      } else if (isList(n)) {
        const base = group ? [...ctx.path, group] : ctx.path;
        n.children.filter((li) => li.tag === 'li').forEach((li) => {
          const own = li.children.filter((c) => !(c.tag && isList(c)));
          const labelNode = own.find((c) => c.tag || textOf(c));
          const label = labelNode ? textOf(labelNode) : '';
          li.children.forEach((c) => walk([c], c === labelNode
            ? { path: base, nested: ctx.depth > 0, depth: ctx.depth + 1 }
            : { path: [...base, label], nested: true, depth: ctx.depth + 1 }));
        });
      } else {
        walk(n.children, ctx);
      }
    });
  }
  walk(nodes, { path: [], nested: false, depth: 0 });
  return links;
}

const rootSections = (html) => {
  const root = parseHtml(html);
  const divs = root.children.filter((n) => n.tag === 'div');
  return divs.length ? divs : [root];
};

/** Nav document: sections recognised by content like blocks/header/header.js does. */
function navSections(sections) {
  const tools = sections.find(hasIconTokens) || sections[3];
  const menu = sections.find((s) => s !== tools
    && find(s, (n) => n.tag === 'li' && n.children.some(isList))) || sections[2];
  const brand = sections.find((s) => ![tools, menu].includes(s) && find(s, (n) => n.tag === 'img'))
    || sections[0];
  const quick = sections.find((s) => ![tools, menu, brand].includes(s) && hasLink(s))
    || sections[1];
  return sections.map((s) => {
    if (s === tools) return 'tools';
    if (s === menu) return 'menu';
    if (s === brand) return 'brand';
    if (s === quick) return 'quick';
    return 'other';
  });
}

/** Footer document: search/locale row, link columns, legal row, logos (blocks/footer/footer.js). */
function footerSections(sections) {
  const columns = sections.find((s) => find(s, isHeading)) || sections[1];
  const search = sections.find((s) => s !== columns && hasIconTokens(s)) || sections[0];
  const logos = [...sections].reverse().find((s) => ![columns, search].includes(s)
    && find(s, (n) => n.tag === 'img' || (n.tag === 'a' && hasIconTokens(n) && !textOf(n))))
    || sections[3];
  return sections.map((s) => {
    if (s === columns) return 'columns';
    if (s === search) return 'search';
    if (s === logos) return 'logos';
    return 'legal';
  });
}

/**
 * Returns every link of one document with its nav area and menu path (ending in the label).
 * kind: 'nav' | 'footer'.
 */
function extractLinks(html, kind) {
  const sections = rootSections(html);
  const roles = kind === 'nav' ? navSections(sections) : footerSections(sections);
  const out = [];
  sections.forEach((s, i) => {
    const role = roles[i];
    walkLinks(s.children).forEach(({ a, path: p, nested }) => {
      const label = linkLabel(a);
      let area = 'footer';
      let prefix = [];
      if (kind === 'nav') {
        area = 'header';
        if (role === 'menu') area = nested || p.length ? 'flyout' : 'header';
        if (role === 'brand') prefix = ['Logo'];
        if (role === 'quick') prefix = ['Quick actions'];
        if (role === 'tools') prefix = nested ? ['Country & language dialog'] : ['Header tools'];
        if (role === 'other') prefix = ['Header'];
      } else if (kind === 'footer') {
        prefix = {
          search: ['Search bar'], legal: ['Legal links'], logos: ['Logos'], columns: [],
        }[role];
      }
      // the country list hangs below the ':globe: Country | Language' item: keep only the dialog
      const chain = role === 'tools' && nested ? [] : p;
      out.push({
        area,
        menuPath: [...prefix, ...chain, label].filter(Boolean).join(' > '),
        label,
        href: a.attrs.href || '',
      });
    });
  });
  return out;
}

// ---------- classification ----------
function normPath(p) {
  let s = p;
  try {
    s = decodeURIComponent(p);
  } catch (e) { /* keep raw */ }
  return s.replace(/\/+$/, '').replace(/\.html?$/, '').replace(/\/+$/, '').toLowerCase() || '/';
}

function lhDomain(host) {
  return LH_DOMAINS.find((d) => host === d || host.endsWith(`.${d}`));
}

function classify(url, scope) {
  const host = url.hostname.toLowerCase();
  const domain = lhDomain(host);
  const p = normPath(url.pathname);
  const www = MAIN_HOSTS.includes(host);
  const inScope = www && scope.has(p);
  let reason;
  if (inScope) reason = REASONS.inScope;
  else if (host === 'shop.lufthansa.com') reason = REASONS.shop;
  else if (/(^|\.)travelid\./.test(host) || (www && /(^|\/)(profile|travel-id|login)(\/|$)/.test(p))) reason = REASONS.login;
  else if (host === 'once.lufthansa.com') reason = REASONS.checkin;
  else if (www && /^\/deeplink(\/|$)/.test(p)) reason = REASONS.deeplink;
  else if (www && /^\/[a-z]{2}\/[a-z]{2}\/(support(\/|$)|help-and-contact$)/.test(p)) reason = REASONS.help;
  else if (www && p === '/') reason = REASONS.root;
  else if (www && /^\/lhg(\/|$)/.test(p)) reason = REASONS.aircore;
  else if (www && /^\/[a-z]{2}\/[a-z]{2}(\/|$)/.test(p) && !LOCALES.includes(p.slice(1, 6))) {
    reason = REASONS.otherLocale;
  } else if (domain === 'lufthansagroup.com') reason = REASONS.group(host);
  else if (SEPARATE_SITES[domain]) reason = REASONS.separate(SEPARATE_SITES[domain], host);
  else if (!www) reason = REASONS.subdomain(host);
  else reason = REASONS.notInScope;
  return { inScope, reason };
}

// ---------- inputs ----------
/** Reads the Set literal out of scope-paths.js (an ES module; parsed as text). */
function loadScope() {
  const file = path.join(ROOT, SCOPE_FILE);
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/new Set\((\[[\s\S]*?\])\)/);
  if (!m) throw new Error(`${SCOPE_FILE}: no "new Set([...])" literal found`);
  const list = JSON.parse(m[1].replace(/,\s*\]$/, ']'));
  return { paths: new Set(list.map(normPath)), file: SCOPE_FILE };
}

/** The URL that is measured (and looked up in the status file): no hash. */
const statusKey = (url) => {
  const u = new URL(url.href);
  u.hash = '';
  return u.href;
};

function statusFor(statuses, url) {
  if (!statuses) return 'not checked';
  const key = statusKey(url);
  const bare = key.replace(/\/+$/, '');
  const hit = [url.href, key, bare, `${bare}/`].find((v) => statuses[v] !== undefined);
  return hit ? statuses[hit] : 'not checked';
}

// ---------- output ----------
const COLUMNS = [
  { header: 'Locale', key: 'locale', width: 9 },
  { header: 'Nav area', key: 'area', width: 12 },
  { header: 'Menu path', key: 'menuPath', width: 56 },
  { header: 'Label', key: 'label', width: 30 },
  { header: 'Target URL', key: 'url', width: 72 },
  { header: 'Live HTTP status', key: 'status', width: 16 },
  { header: 'In migration scope', key: 'inScopeText', width: 18 },
  { header: 'Why it was not migrated', key: 'reason', width: 70 },
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
  const order = (k, i) => {
    if (keys[i] === 'locale') return String(LOCALES.indexOf(k));
    if (keys[i] === 'area') return String(['header', 'flyout', 'footer'].indexOf(k));
    return k;
  };
  return [...map.entries()].map(([k, count]) => [...k.split('\u0000'), count])
    .sort((a, b) => a.slice(0, -1).map(order).join('\u0000')
      .localeCompare(b.slice(0, -1).map(order).join('\u0000')));
}

function addLinkSheet(wb, name, rows) {
  const ws = wb.addWorksheet(name);
  ws.columns = COLUMNS;
  rows.forEach((r) => {
    const row = ws.addRow(r);
    row.getCell('url').value = { text: r.url, hyperlink: r.url };
    row.getCell('url').font = { color: { argb: 'FF1F4E9A' }, underline: true };
  });
  styleHeader(ws, rows.length + 1);
  return ws;
}

async function writeXlsx(file, rows) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'tools/importer/nav-report.js';
  addLinkSheet(wb, 'links', rows);

  const sum = wb.addWorksheet('summary');
  sum.columns = [
    { header: 'Locale', key: 'a', width: 9 },
    { header: 'Nav area', key: 'b', width: 12 },
    { header: 'Why it was not migrated', key: 'c', width: 90 },
    { header: 'Links', key: 'd', width: 8 },
  ];
  const grouped = countBy(rows, ['locale', 'area', 'reason']);
  grouped.forEach((g) => sum.addRow(g));
  styleHeader(sum, grouped.length + 1);
  const table = (title, keys) => {
    sum.addRow([]);
    sum.addRow([title]).font = { bold: true };
    countBy(rows, keys).forEach((g) => {
      const n = g.pop();
      const cells = keys.length === 1 && keys[0] === 'reason' ? ['', '', g[0]] : g;
      sum.addRow([...cells, ...Array(3 - cells.length).fill(''), n]);
    });
  };
  table('Total by locale × nav area', ['locale', 'area']);
  table('Total by locale', ['locale']);
  table('Total by nav area', ['area']);
  table('Total by reason', ['reason']);
  sum.addRow([]);
  sum.addRow(['Total', '', '', rows.length]).font = { bold: true };

  addLinkSheet(wb, 'in-scope-absolute', rows.filter((r) => r.inScope));
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
  const show = (f) => (f.startsWith(`${ROOT}/`) ? path.relative(ROOT, f) : f);

  const DOCS = [
    ['nav', 'nav.plain.html'],
    ['footer', 'footer.plain.html'],
  ];
  const rows = [];
  const relativeOutOfScope = [];
  const inputs = {};
  LOCALES.forEach((locale) => {
    inputs[locale] = {};
    DOCS.forEach(([kind, rel]) => {
      const file = path.join(contentDir, locale, rel);
      if (!fs.existsSync(file)) {
        inputs[locale][rel] = null;
        console.warn(`missing ${show(file)}`);
        return;
      }
      const links = extractLinks(fs.readFileSync(file, 'utf8'), kind);
      inputs[locale][rel] = links.length;
      links.forEach((link) => {
        if (!link.href || link.href.startsWith('#') || /^(mailto|tel|javascript):/i.test(link.href)) return;
        if (link.href.startsWith('/') && !link.href.startsWith('//')) {
          // relative link: served by this site; note the ones whose page is not in scope
          const p = normPath(new URL(link.href, 'https://x.invalid').pathname);
          if (!scope.paths.has(p)) {
            relativeOutOfScope.push({
              locale, area: link.area, menuPath: link.menuPath, href: link.href, path: p,
            });
          }
          return;
        }
        let url;
        try {
          url = new URL(link.href.startsWith('//') ? `https:${link.href}` : link.href);
        } catch (e) {
          return;
        }
        if (!/^https?:$/.test(url.protocol) || !lhDomain(url.hostname.toLowerCase())) return;
        const c = classify(url, scope.paths);
        rows.push({
          locale,
          area: link.area,
          menuPath: link.menuPath,
          label: link.label,
          url: url.href,
          status: statusFor(statuses, url),
          inScope: c.inScope,
          inScopeText: c.inScope ? 'yes' : 'no',
          reason: c.reason,
        });
      });
    });
  });

  fs.mkdirSync(outDir, { recursive: true });
  const xlsx = path.join(outDir, 'nav-unmigrated.xlsx');
  const json = path.join(outDir, 'nav-unmigrated.json');
  const urlsFile = path.join(outDir, 'nav-link-urls.txt');
  await writeXlsx(xlsx, rows);

  const statusUrls = [...new Set(rows
    .filter((r) => MAIN_HOSTS.includes(new URL(r.url).hostname.toLowerCase()))
    .map((r) => statusKey(new URL(r.url))))].sort();
  fs.writeFileSync(urlsFile, `${statusUrls.join('\n')}\n`);

  const summary = Object.fromEntries([['locale'], ['area'], ['reason'], ['locale', 'area']]
    .map((k) => [k.join(' x '), Object.fromEntries(countBy(rows, k).map((g) => [g.slice(0, -1).join(' / '), g[g.length - 1]]))]));
  const inScopeAbsolute = rows.filter((r) => r.inScope);
  fs.writeFileSync(json, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    contentDir: show(contentDir),
    scope: { file: scope.file, paths: scope.paths.size },
    lhDomains: LH_DOMAINS,
    statusFile: statuses ? show(path.resolve(args.status)) : null,
    statusUrls: { file: show(urlsFile), count: statusUrls.length },
    inputs,
    summary,
    inScopeAbsolute,
    relativeOutOfScope,
    links: rows.map(({ inScopeText, ...r }) => r),
  }, null, 2)}\n`);

  console.log(`${rows.length} unmigrated links (${inScopeAbsolute.length} in scope but absolute) -> ${show(xlsx)}, ${show(json)}`);
  console.log(`${statusUrls.length} unique www.lufthansa.com URLs need a status -> ${show(urlsFile)}`
    + `${statuses ? '' : ' (no status file: column says "not checked")'}`);
  if (relativeOutOfScope.length) console.log(`${relativeOutOfScope.length} relative links point at paths not in scope (see JSON relativeOutOfScope)`);
}

module.exports = {
  extractLinks, classify, parseHtml, normPath, LH_DOMAINS,
};

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
