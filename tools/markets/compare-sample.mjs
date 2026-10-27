/* eslint-disable no-console, max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling, linkedom is a dev dependency */
/**
 * All markets, package 1 part c: compares sampled market pages of www with their reference (en:
 * de/en, de: de/de; fr and es: the first sampled market of the language), from the captures of
 * tools/importer/bd-session.mjs (tools/source-export/pages/<path>/cleaned.html). Per page:
 * - content: www's page body without header, footer, skip links and live regions;
 * - links: those into another market-language root than the page's own, and the market or
 *   country in link queries (country=CA …);
 * - currencies and phone numbers in the text;
 * - components: the sequence of www's AEM components (elements with the class "section", their
 *   first class: text, image, headline, twocolumn …);
 * - text: the text blocks (headings, paragraphs, list items, table cells, link texts) with the
 *   market's codes, currencies and numbers masked, shared or only on one side; authored text
 *   (inside the components) apart from the text www's apps render (offers, prices, forms).
 * Writes tools/reports/markets/sample.md and .json.
 * Usage: node tools/markets/compare-sample.mjs [--ref-pages tools/source-export/market-ref]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PAGES = path.join(root, 'tools/source-export/pages');
// --ref-pages dir: the de/en and de/de references captured the same day as the sample
const argv = process.argv.slice(2);
const REF_PAGES = argv.includes('--ref-pages') ? path.resolve(root, argv[argv.indexOf('--ref-pages') + 1]) : PAGES;
const sample = JSON.parse(fs.readFileSync(path.join(root, 'tools/markets/sample.json'), 'utf8'));

const CURRENCY = /\b(EUR|CHF|CAD|AED|ARS|CLP|COP|USD|GBP|DKK|SEK|NOK|PLN|CZK)\b|€|£|US\$|C\$|\$|Fr\./g;
const PHONE = /\+\s?\d[\d\s()./-]{6,}\d/g;
const ROOT_LINK = /^(?:https?:\/\/www\.lufthansa\.com)?\/([a-z]{2})\/([a-z]{2})(?=\/|$|\?|#)/;
const COMPONENT_SKIP = new Set(['section', 'parbase', 'event', 'column', '']);

/** The content of a captured page (null when not captured). */
export function content(pagePath, dir = PAGES) {
  const file = path.join(dir, pagePath, 'cleaned.html');
  if (!fs.existsSync(file)) return null;
  // cleaned.html starts with a bare <body>: linkedom needs the <html> around it
  const html = fs.readFileSync(file, 'utf8');
  const { document } = parseHTML(/^\s*<html/i.test(html) ? html : `<!doctype html><html>${html}</html>`);
  document.querySelectorAll('header, footer, script, style, noscript, .skiplinks, #sr-log, [class*="cookie"], [id*="onetrust"]').forEach((e) => e.remove());
  return document.body;
}

/** Masks what differs between markets by design: codes, currencies, numbers, spacing. */
export function mask(text, market) {
  return String(text || '').replace(/\s+/g, ' ').trim()
    .replace(CURRENCY, '¤')
    .replace(new RegExp(`\\b${market}\\b`, 'gi'), '‹cc›')
    .replace(/\d[\d.,\s]*/g, '#')
    .toLowerCase();
}

// authored: text inside www's AEM components; app: text its apps render outside them (offers,
// prices, search forms), which the replica's blocks load per market anyway
const textBlocks = (body, market, authored) => [...body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th, a, button, label, figcaption')]
  .filter((e) => !e.querySelector('p, li, td, h1, h2, h3, h4, h5, h6'))
  .filter((e) => Boolean(e.closest('[class~="section"]')) === authored)
  .map((e) => mask(e.textContent, market)).filter((t) => t.length > 2);

const components = (body) => [...body.querySelectorAll('[class~="section"]')]
  .map((e) => e.className.trim().split(/\s+/).find((c) => !COMPONENT_SKIP.has(c)) || 'section');

/** The facts of one captured page. */
export function facts(pagePath, market, lang, dir = PAGES) {
  const body = content(pagePath, dir);
  if (!body) return null;
  const text = body.textContent.replace(/\s+/g, ' ');
  const links = [...body.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
  const roots = {};
  const queries = {};
  links.forEach((href) => {
    const m = href.match(ROOT_LINK);
    if (m) roots[`${m[1]}/${m[2]}`] = (roots[`${m[1]}/${m[2]}`] || 0) + 1;
    (href.match(/[?&](country|market|countryCode|pos|lang|language)=([^&#]+)/gi) || []).forEach((q) => {
      const k = q.slice(1).toLowerCase();
      queries[k] = (queries[k] || 0) + 1;
    });
  });
  return {
    own: `${market}/${lang}`,
    links: links.length,
    roots,
    queries,
    currencies: [...new Set(text.match(CURRENCY) || [])],
    phones: [...new Set((text.match(PHONE) || []).map((p) => p.replace(/\s+/g, ' ').trim()))],
    components: components(body),
    text: textBlocks(body, market, true),
    appText: textBlocks(body, market, false),
  };
}

/** What differs between a market page and its reference. */
export function compare(a, b) {
  const count = (list) => list.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
  const minus = (x, y) => {
    const cy = count(y);
    return x.filter((t) => {
      const n = cy.get(t) || 0;
      if (n) cy.set(t, n - 1);
      return !n;
    });
  };
  const onlyA = minus(a.text, b.text);
  const onlyB = minus(b.text, a.text);
  const appA = minus(a.appText, b.appText);
  const appB = minus(b.appText, a.appText);
  const ownLinks = (f) => f.roots[f.own] || 0;
  const foreign = (f) => Object.entries(f.roots).filter(([r]) => r !== f.own);
  return {
    textShared: a.text.length - onlyA.length,
    textOnlyHere: onlyA.length,
    textOnlyReference: onlyB.length,
    examplesHere: [...new Set(onlyA)].slice(0, 5),
    examplesReference: [...new Set(onlyB)].slice(0, 5),
    appTextShared: a.appText.length - appA.length,
    appTextDiffers: appA.length + appB.length,
    componentsSame: a.components.join() === b.components.join(),
    componentsHere: minus(a.components, b.components),
    componentsReference: minus(b.components, a.components),
    ownRootLinks: ownLinks(a),
    otherRootLinks: foreign(a),
    queries: a.queries,
    currencies: a.currencies,
    referenceCurrencies: b.currencies,
    phones: a.phones,
    referencePhones: b.phones,
  };
}

/**
 * Per sampled page: how many markets differ from the reference only by their own root in links,
 * only by app data (offers, prices), or by authored content (components or text).
 */
function summaryLines(results) {
  const kinds = (r) => {
    if (r.status !== 'compared') return null;
    if (!r.componentsSame || r.textOnlyHere || r.textOnlyReference) return 'authored content differs';
    if (r.appTextDiffers) return 'only app data differs';
    return 'only the own root in links';
  };
  const pages = [...new Set(results.map((r) => r.page))];
  return ['| Page (en slug) | Compared | Only the own root in links | Only app data | Authored content differs |', '| --- | --- | --- | --- | --- |',
    ...pages.map((p) => {
      const rs = results.filter((r) => r.page === p && kinds(r));
      const n = (k) => rs.filter((r) => kinds(r) === k).length;
      return `| ${p} | ${rs.length} | ${n('only the own root in links')} | ${n('only app data differs')} | ${n('authored content differs')} |`;
    }), '', `Currencies seen: ${
      [...new Set(results.flatMap((r) => r.currencies || r.facts?.currencies || []))].join(', ')
    }. Phone numbers: ${
      results.some((r) => r.status === 'compared' && r.phones.join() !== r.referencePhones.join()) ? 'some differ (see the rows)' : 'none differ from the reference'
    }.`, ''];
}

/** When a page was captured (its metadata.json), as a date. */
function captured(pagePath, dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, pagePath, 'metadata.json'), 'utf8')).timestamp.slice(0, 10);
  } catch (e) {
    return '';
  }
}

/** One line of findings: what differs. */
function verdict(c) {
  const parts = [];
  if (c.otherRootLinks.length) parts.push(`links into other roots ${c.otherRootLinks.map(([r, n]) => `${r} ${n}`).join(', ')}`);
  if (Object.keys(c.queries).length) parts.push(`link queries ${Object.entries(c.queries).map(([q, n]) => `${q} ×${n}`).join(', ')}`);
  if (c.currencies.join() !== c.referenceCurrencies.join()) parts.push(`currency ${c.currencies.join(' ') || '–'} (reference ${c.referenceCurrencies.join(' ') || '–'})`);
  if (c.phones.join() !== c.referencePhones.join()) parts.push(`phones ${c.phones.slice(0, 3).join('; ') || '–'} (reference ${c.referencePhones.slice(0, 2).join('; ') || '–'})`);
  if (!c.componentsSame) parts.push(`components +${c.componentsHere.length}/-${c.componentsReference.length} (${[...new Set(c.componentsHere)].slice(0, 4).join(', ')}${c.componentsReference.length ? ` / ref ${[...new Set(c.componentsReference)].slice(0, 4).join(', ')}` : ''})`);
  if (c.textOnlyHere || c.textOnlyReference) parts.push(`authored text ${c.textShared} shared, ${c.textOnlyHere} only here, ${c.textOnlyReference} only in the reference`);
  if (c.appTextDiffers) parts.push(`app text (offers, prices, forms) ${c.appTextDiffers} differ, ${c.appTextShared} shared`);
  return parts.join('; ') || 'nothing (besides the own root in links)';
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  // fr and es: the first sampled market of the language is the reference
  const firstOf = {};
  sample.forEach((s) => { if (!firstOf[s.lang]) firstOf[s.lang] = s; });
  const results = sample.map((s) => {
    const own = new URL(s.url).pathname;
    let refPath;
    if (s.lang === 'en') refPath = s.ref_en;
    else if (s.lang === 'de') refPath = s.ref_de;
    else {
      const first = sample.find((x) => x.lang === s.lang && x.page === s.page);
      refPath = first === s ? null : new URL(first.url).pathname;
    }
    const a = facts(own, s.market, s.lang);
    if (!a) return { ...s, status: 'not captured' };
    if (!refPath) return { ...s, status: 'reference of its language', facts: { ...a, text: a.text.length, appText: a.appText.length } };
    const [, rc, rl] = refPath.split('/');
    // en and de: today's reference where it was captured (--ref-pages), else the earlier capture
    const fresh = (s.lang === 'en' || s.lang === 'de') && fs.existsSync(path.join(REF_PAGES, refPath, 'cleaned.html'));
    const refDir = fresh ? REF_PAGES : PAGES;
    const b = facts(refPath, rc, rl, refDir);
    if (!b) return { ...s, reference: refPath, status: 'reference not captured' };
    const referenceCaptured = captured(refPath, refDir);
    const c = compare(a, b);
    return {
      ...s, reference: refPath, referenceCaptured, captured: captured(own, PAGES), status: 'compared', verdict: verdict(c), ...c,
    };
  });
  const out = path.join(root, 'tools/reports/markets');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'sample.json'), `${JSON.stringify(results, null, 1)}\n`);
  const lines = ['# Market sample: www pages against their reference', '', `${new Date().toISOString()}. ${results.length} pages (${results.filter((r) => r.status === 'compared').length} compared, ${results.filter((r) => r.status === 'reference of its language').length} references of fr and es, ${results.filter((r) => /not captured/.test(r.status)).length} not captured). References: en de/en, de de/de, fr and es the first sampled market. Text blocks are compared with the market's codes, currencies and numbers masked.`, '',
    ...summaryLines(results),
    '| Page | Market | Reference (captured) | What differs |', '| --- | --- | --- | --- |',
    ...results.map((r) => `| ${new URL(r.url).pathname} | ${r.market}/${r.lang} | ${r.reference ? `${r.reference} (${r.referenceCaptured})` : '-'} | ${r.status === 'compared' ? r.verdict.replace(/\|/g, '\\|') : r.status} |`), ''];
  fs.writeFileSync(path.join(out, 'sample.md'), lines.join('\n'));
  console.log(`compare-sample: ${results.length} pages, ${results.filter((r) => r.status === 'compared').length} compared`);
}
