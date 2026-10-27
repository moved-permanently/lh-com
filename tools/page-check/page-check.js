/**
 * Page check, a DA library plugin (AMS rest A11): opened from the editor's library, it reads
 * the current document's preview (.plain.html), its metadata (the DA source with the editor's
 * login; outside DA the preview's head), the site's query indexes and the redirects sheet,
 * runs the checks of checks.js and lists the issues with their severity, a short message and a
 * link to the place in the preview. Scores overall and per group. Single checks can be switched
 * off (kept in localStorage). Runs on open and on "Scan"; it never changes the document.
 * Outside DA (a browser tab): ?path=/de/en/homepage.
 */
import {
  CHECKS, GROUPS, runChecks, scores,
} from './checks.js';
import { edsDamPath } from '../../scripts/dam-path.js';
import { LIVE_ROOTS } from '../../scripts/locale.js';

const OFF_KEY = 'lh-page-check:off';
const LOCALES = LIVE_ROOTS;
const $ = (sel) => document.querySelector(sel);
const parse = (html) => new DOMParser().parseFromString(`<!doctype html><html><body>${html}</body></html>`, 'text/html');
const off = () => new Set(JSON.parse(localStorage.getItem(OFF_KEY) || '[]'));

async function context() {
  if (window.parent !== window) {
    try {
      // eslint-disable-next-line import/no-unresolved -- DA's SDK, loaded from da.live
      const { default: DA_SDK } = await import('https://da.live/nx/utils/sdk.js');
      const { context: c, token } = await DA_SDK;
      return {
        org: c.org, repo: c.repo, path: String(c.path || '').replace(/\.html$/, ''), token,
      };
    } catch (e) { /* not in DA: below */ }
  }
  const params = new URLSearchParams(window.location.search);
  return { org: 'moved-permanently', repo: 'lh-com', path: (params.get('path') || '/de/en/homepage').replace(/\.html$/, '') };
}

async function head(url) {
  try {
    const resp = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    return { ok: resp.ok, size: Number(resp.headers.get('content-length')) || 0 };
  } catch (e) {
    return null;
  }
}
const json = async (url) => {
  try {
    const resp = await fetch(url, { cache: 'no-store' });
    return resp.ok ? (await resp.json()).data || [] : [];
  } catch (e) {
    return [];
  }
};

function badge(label) {
  const span = document.createElement('span');
  span.className = `badge badge-${label.toLowerCase()}`;
  span.textContent = label;
  return span;
}

function render(ctx, origin, issues) {
  const s = scores(issues);
  $('#status').textContent = `${ctx.path}: ${issues.length} issue${issues.length === 1 ? '' : 's'}`;
  const sum = $('#scores');
  sum.replaceChildren();
  [['Overall', s.overall], ...GROUPS.map((g) => [g, s.groups[g]])].forEach(([name, v]) => {
    const row = document.createElement('div');
    row.className = name === 'Overall' ? 'score overall' : 'score';
    row.append(Object.assign(document.createElement('span'), { textContent: name }), Object.assign(document.createElement('strong'), { textContent: String(v.score) }), badge(v.label));
    sum.append(row);
  });
  const list = $('#issues');
  list.replaceChildren();
  if (!issues.length) list.append(Object.assign(document.createElement('li'), { className: 'none', textContent: 'No issues found.' }));
  issues.forEach((i) => {
    const li = document.createElement('li');
    li.className = `issue ${i.severity}`;
    const sev = Object.assign(document.createElement('span'), { className: `severity ${i.severity}`, textContent: i.severity });
    const text = Object.assign(document.createElement('span'), { className: 'message', textContent: `${CHECKS.find((c) => c.id === i.check).title}: ${i.message}` });
    const link = document.createElement('a');
    link.href = `${origin}${ctx.path}${i.text ? `#:~:text=${encodeURIComponent(i.text)}` : ''}`;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Show';
    li.append(sev, text, link);
    list.append(li);
  });
}

function renderSettings(onChange) {
  const box = $('#checks');
  box.replaceChildren();
  const disabled = off();
  CHECKS.forEach((c) => {
    const label = document.createElement('label');
    const input = Object.assign(document.createElement('input'), { type: 'checkbox', checked: !disabled.has(c.id) });
    input.addEventListener('change', () => {
      const now = off();
      if (input.checked) now.delete(c.id); else now.add(c.id);
      localStorage.setItem(OFF_KEY, JSON.stringify([...now]));
      onChange();
    });
    label.append(input, ` ${c.title} (${c.severity}, ${c.group})`);
    box.append(label);
  });
}

async function scan(ctx) {
  $('#status').textContent = `Checking ${ctx.path} …`;
  const origin = `https://main--${ctx.repo}--${ctx.org}.aem.page`;
  const plain = await fetch(`${origin}${ctx.path}.plain.html`, { cache: 'no-store' });
  if (!plain.ok) {
    $('#status').textContent = `No preview of ${ctx.path} (${plain.status}): preview the document first.`;
    return;
  }
  const doc = parse(await plain.text());
  let meta = {};
  if (ctx.token) {
    const source = await fetch(`https://admin.da.live/source/${ctx.org}/${ctx.repo}${ctx.path}.html`, { headers: { authorization: `Bearer ${ctx.token}` } });
    if (source.ok) {
      const { metadataOf } = await import('./checks.js');
      meta = { ...metadataOf(parse(await source.text())), source: true };
    }
  }
  let headTitle = '';
  let headDescription = '';
  if (!meta.source) {
    const page = await fetch(`${origin}${ctx.path}`, { cache: 'no-store' });
    if (page.ok) {
      const pageDoc = new DOMParser().parseFromString(await page.text(), 'text/html');
      headTitle = pageDoc.title;
      headDescription = pageDoc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    }
  }
  const [redirects, ...indexes] = await Promise.all([
    json(`${origin}/redirects.json?limit=5000`),
    ...LOCALES.map((l) => json(`${origin}/${l}/search-index.json?limit=5000`)),
  ]);
  const sitePaths = new Set(indexes.flat().map((r) => r.path));
  const issues = await runChecks({
    doc,
    meta,
    headTitle,
    headDescription,
    path: ctx.path,
    origin,
    sitePaths,
    redirects,
    head,
    damName: edsDamPath,
    disabled: off(),
  });
  render(ctx, origin, issues);
}

const ctx = await context();
$('#scan').addEventListener('click', () => scan(ctx));
renderSettings(() => scan(ctx));
scan(ctx);
