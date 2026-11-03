/* eslint-disable no-console, max-len */
/**
 * Functions table: checks functions.json and renders it into functions.md (committed), out/page.html (the DA source of
 * /migration-status/functions) and out/canvas.html (the body of the Slack canvas). functions.json is the only file to edit.
 * Usage: node tools/reports/functions/render.mjs [--check | --verify]
 *   --check   checks functions.json and that functions.md is current (no writes)
 *   --verify  checks the published page on aem.page and aem.live against functions.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** The symbols of functions.md and the canvas; the legend, the totals and the canvas keep this order. */
export const SYMBOLS = {
  done: '✅', wip: '🪏', 'wip-lh': '🪏✈️', lh: '✈️', elsewhere: '🌊', stays: '💬', see: '→', none: '–',
};
// the page's: the Lufthansa crane (icons/lh-crane.svg) instead of ✈️, as :lh-crane: (the pipeline makes it an icon); a
// no-break space keeps the spade and the crane on one line
const CRANE = ':lh-crane:';
export const PAGE_SYMBOLS = { ...SYMBOLS, 'wip-lh': `${SYMBOLS.wip}\u00a0${CRANE}`, lh: CRANE };
const COUNTED = ['done', 'wip', 'wip-lh', 'lh', 'elsewhere', 'stays'];
const NEEDS_FOOTNOTE = ['wip-lh', 'lh', 'stays'];
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const PSI = 'https://pagespeed.web.dev/report?url=';
// helix-html-pipeline turns :name: in text into an icon
const ICON = /(?<!(?:https?|urn)[^\s]*):(#?[a-z_-]+[a-z\d]*):/i;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MD_URL = 'https://github.com/moved-permanently/lh-com/blob/main/tools/reports/functions/functions.md';
const PAGE_URL = 'https://lufthansa.turnsthe.page/migration-status/functions';
const SLACK_TABLE_CELLS = 300;

const ESC = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESC[c]);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const blank = (s) => typeof s !== 'string' || !s.trim();
const sup = (n) => [...String(n)].map((d) => SUP[d]).join('');
const UPDATED = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/;
const day = (iso) => {
  const [date, time] = iso.split(' ');
  const [y, m, d] = date.split('-').map(Number);
  return time ? `${d} ${MONTHS[m - 1]} ${y}, ${time} CET` : `${d} ${MONTHS[m - 1]} ${y}`;
};

export function validate(doc) {
  const errors = [];
  if (!UPDATED.test(doc.updated || '')) errors.push(`updated "${doc.updated}" is not YYYY-MM-DD or YYYY-MM-DD HH:MM`);
  const text = (where, value, field = 'note') => {
    if (blank(value)) errors.push(`${where}: no ${field}`);
    else if (ICON.test(value)) errors.push(`${where}: ${field} has icon syntax (:name:), which Edge Delivery turns into an icon`);
  };
  Object.keys(SYMBOLS).forEach((s) => {
    const entry = (doc.legend || {})[s] || {};
    text(`legend ${s}`, entry.label, 'label');
    text(`legend ${s}`, entry.note);
  });
  const footnotes = doc.footnotes || {};
  Object.entries(footnotes).forEach(([k, v]) => text(`footnote ${k}`, v, 'text'));
  const brands = doc.brands || [];
  brands.forEach((b) => {
    ['id', 'name', 'host', 'www'].forEach((k) => { if (blank(b[k])) errors.push(`brand ${b.id}: no ${k}`); });
    text(`brand ${b.id}`, b.note);
  });
  const ids = new Set((doc.functions || []).map((f) => f.id));
  (doc.functions || []).forEach((f) => {
    if (blank(f.name)) errors.push(`${f.id}: no name`);
    text(f.id, f.about, 'about');
    const cells = f.cells || {};
    Object.keys(cells).filter((id) => !brands.some((b) => b.id === id)).forEach((id) => errors.push(`${f.id}: cell for unknown brand ${id}`));
    brands.forEach((b) => {
      const cell = cells[b.id];
      const where = `${f.id} / ${b.id}`;
      if (!cell) {
        errors.push(`${f.id}: no cell for brand ${b.id}`);
        return;
      }
      if (!SYMBOLS[cell.status]) errors.push(`${where}: unknown status "${cell.status}"`);
      text(where, cell.note);
      if (NEEDS_FOOTNOTE.includes(cell.status) && blank(cell.footnote)) errors.push(`${where}: a ${SYMBOLS[cell.status]} cell needs a footnote`);
      if (cell.footnote && blank(footnotes[cell.footnote])) errors.push(`${where}: footnote "${cell.footnote}" does not exist`);
      if (cell.status === 'see' && blank(cell.see)) errors.push(`${where}: see cell without a target`);
      if (cell.see && !ids.has(cell.see)) errors.push(`${where}: see target "${cell.see}" does not exist`);
      if (cell.page && !cell.page.startsWith('/')) errors.push(`${where}: page must be a path starting with /`);
    });
  });
  return errors;
}

const fnById = (doc) => Object.fromEntries(doc.functions.map((f) => [f.id, f]));

function cellText(doc, cell, symbols = SYMBOLS) {
  if (cell.status === 'see') {
    const target = fnById(doc)[cell.see];
    return `${symbols.see} ${target.short || target.name}`;
  }
  return symbols[cell.status];
}

/** Footnote keys in order of first use (row by row), each with its number. */
function footnoteNumbers(doc) {
  const numbers = {};
  doc.functions.forEach((f) => doc.brands.forEach((b) => {
    const key = f.cells[b.id].footnote;
    if (key && !numbers[key]) numbers[key] = Object.keys(numbers).length + 1;
  }));
  return numbers;
}

function totals(doc) {
  return doc.brands.map((b) => COUNTED.map((s) => doc.functions.filter((f) => f.cells[b.id].status === s).length).join('/'));
}

const totalsLabel = COUNTED.map((s) => SYMBOLS[s]).join(' / ');

export function itemCount(doc) {
  const f = doc.functions.length;
  const b = doc.brands.length;
  return f * b + f + b + Object.keys(SYMBOLS).length;
}

/** Links with a title, other than the PageSpeed Insights links, as {href, title, text}. */
export function titledItemLinks(html) {
  return [...html.matchAll(/<a\s([^>]*)>(.*?)<\/a>/gs)].map((m) => ({
    href: (m[1].match(/href="([^"]*)"/) || [])[1],
    title: (m[1].match(/title="([^"]*)"/) || [])[1],
    text: m[2],
  })).filter((l) => l.title !== undefined && !l.title.startsWith('PageSpeed Insights'));
}

export function renderMarkdown(doc) {
  const md = (s) => String(s).replace(/\|/g, '\\|');
  const numbers = footnoteNumbers(doc);
  const out = [
    '# Functions by airline', '',
    `Generated by render.mjs from functions.json: edit functions.json, not this file. Updated ${day(doc.updated)}: ${doc.change}`, '',
    `Legend: ${Object.entries(SYMBOLS).map(([s, sym]) => `${sym} ${doc.legend[s].label}`).join(' · ')}`, '',
    `| Function | ${doc.brands.map((b) => md(b.name)).join(' | ')} |`,
    `|---|${doc.brands.map(() => '---|').join('')}`,
  ];
  doc.functions.forEach((f) => {
    const cells = doc.brands.map((b) => {
      const cell = f.cells[b.id];
      return md(cellText(doc, cell) + (cell.footnote ? sup(numbers[cell.footnote]) : ''));
    });
    out.push(`| ${md(f.name)} | ${cells.join(' | ')} |`);
  });
  out.push(`| **${totalsLabel}** | ${totals(doc).join(' | ')} |`, '', '## Notes', '');
  Object.entries(numbers).forEach(([key, n]) => out.push(`${n}. ${doc.footnotes[key]}`));
  doc.brands.forEach((b) => {
    out.push('', `## ${b.name}`, '', `${b.note} Replica: ${b.host}`, '');
    doc.functions.forEach((f) => {
      const cell = f.cells[b.id];
      out.push(`- **${f.name}** ${SYMBOLS[cell.status]} ${cell.note}${cell.page ? ` (${b.host}${cell.page})` : ''}`);
    });
  });
  out.push('', '## Functions', '');
  doc.functions.forEach((f) => out.push(`- **${f.name}**: ${f.about}`));
  return `${out.join('\n')}\n`;
}

function psi(brand, page) {
  const link = (icon, host, label) => `<a href="${esc(PSI + encodeURIComponent(host + page))}" title="PageSpeed Insights, ${label}: ${esc(new URL(host).host)}">:${icon}:</a>`;
  // no-break spaces: the pipeline keeps them and the icons stay with the link
  return `\u00a0${link('landing', brand.www, 'before')}\u00a0${link('takeoff', brand.host, 'after')}`;
}

const row = (cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;

export function renderPage(doc) {
  const titled = (href, title, text) => `<a href="${esc(href)}" title="${esc(title)}">${esc(text)}</a>`;
  const intro = [
    '<h1>Functions by airline</h1>',
    `<p>Which interactive functions of each airline&#39;s website work on its replica on Edge Delivery Services, and what is still ahead. Updated ${day(doc.updated)}: ${esc(doc.change)}</p>`,
    '<p>Point at a symbol, a function or an airline for a short explanation. On a phone, tap a symbol to jump to the airline&#39;s list further down, where every explanation is written out.</p>',
    '<p>Part of the <a href="/migration-status">migration status</a>.</p>',
    '<h2>Legend</h2>',
    `<ul>${Object.entries(PAGE_SYMBOLS).map(([s, sym]) => `<li>${titled('#legend', doc.legend[s].note, sym)} ${esc(doc.legend[s].label)}: ${esc(doc.legend[s].note)}</li>`).join('')}</ul>`,
    '<p>:landing:\u00a0next to links: PageSpeed on the airline&#39;s current site, :takeoff:: PageSpeed on the replica</p>',
  ].join('');
  const table = `<div class="table-striped header matrix">${[
    row(['Function', ...doc.brands.map((b) => titled(`#${slug(b.name)}`, b.note, b.name))]),
    ...doc.functions.map((f) => row([
      titled('#functions', f.about, f.name),
      ...doc.brands.map((b) => titled(`#${slug(b.name)}`, f.cells[b.id].note, cellText(doc, f.cells[b.id], PAGE_SYMBOLS))),
    ])),
  ].join('')}</div>`;
  const lists = doc.brands.map((b) => {
    const items = doc.functions.map((f) => {
      const cell = f.cells[b.id];
      const page = cell.page ? ` <a href="${esc(b.host + cell.page)}">${cell.status === 'done' ? 'Try it' : 'Today&#39;s page'}</a>${psi(b, cell.page)}` : '';
      return `<li><strong>${esc(f.name)}</strong> ${PAGE_SYMBOLS[cell.status]} ${esc(cell.note)}${page}</li>`;
    });
    return `<h3>${esc(b.name)}</h3><p>${esc(b.note)} Replica: <a href="${esc(b.host)}/">${esc(new URL(b.host).host)}</a></p><ul>${items.join('')}</ul>`;
  }).join('');
  const functions = `<h2>Functions</h2><ul>${doc.functions.map((f) => `<li><strong>${esc(f.name)}</strong>: ${esc(f.about)}</li>`).join('')}</ul>`;
  const metadata = `<div class="metadata">${[
    row(['Title', 'Functions by airline | lufthansa.com on Edge Delivery Services']),
    row(['Description', 'Which functions of the Lufthansa Group airlines&#39; websites work on their replicas on Edge Delivery Services.']),
    row(['nav', '/de/en/nav']),
    row(['footer', '/de/en/footer']),
    row(['language', 'en']),
  ].join('')}</div>`;
  const sections = [intro, `<h2>By function</h2>${table}`, `<h2>By airline</h2>${lists}${functions}`, metadata];
  return `<body><header></header><main>${sections.map((s) => `<div>${s}</div>`).join('')}</main><footer></footer></body>\n`;
}

export function renderCanvas(doc) {
  const numbers = footnoteNumbers(doc);
  const legend = Object.entries(SYMBOLS).map(([s, sym]) => `${sym} ${esc(doc.legend[s].label)}`).join(' · ');
  const head = `<tr><th>Function</th>${doc.brands.map((b) => `<th>${esc(b.name)}</th>`).join('')}</tr>`;
  const rows = doc.functions.map((f) => `<tr><td>${esc(f.name)}</td>${doc.brands.map((b) => {
    const cell = f.cells[b.id];
    return `<td>${esc(cellText(doc, cell))}${cell.footnote ? sup(numbers[cell.footnote]) : ''}</td>`;
  }).join('')}</tr>`);
  // a Slack canvas table holds at most 300 cells (a pasted table is cut there): split into even tables, header in each
  const perTable = Math.floor(SLACK_TABLE_CELLS / (doc.brands.length + 1)) - 1;
  const size = Math.ceil(rows.length / Math.ceil(rows.length / perTable));
  const tables = Array.from({ length: Math.ceil(rows.length / size) }, (_, i) => `<table>${head}${rows.slice(i * size, (i + 1) * size).join('')}</table>`);
  return [
    '<h1>Lufthansa POC: functions by brand</h1>',
    `<p>What works on each airline's replica and what's still ahead. Updated ${day(doc.updated)}: ${esc(doc.change)} Generated from <a href="${MD_URL}">git</a>, also as a <a href="${PAGE_URL}">page</a>; edits here get overwritten at the next update, so please ask in the channel.</p>`,
    `<p><b>Legend:</b> ${legend}</p>`,
    `<p><b>Replicas:</b> ${doc.brands.map((b) => `<a href="${esc(b.host)}/">${esc(b.name)}</a>`).join(' · ')}</p>`,
    ...tables,
    `<p><b>Totals</b> (${totalsLabel}): ${doc.brands.map((b, i) => `${esc(b.name)} ${totals(doc)[i]}`).join(' · ')}</p>`,
    '<h2>Notes</h2>',
    `<ol>${Object.keys(numbers).map((key) => `<li>${esc(doc.footnotes[key])}</li>`).join('')}</ol>`,
  ].join('\n');
}

/** Problems of a served .plain.html of the page: lost titled links, missing anchors, an older version (date or change). */
export function verifyPlain(doc, html) {
  const errors = [];
  const links = titledItemLinks(html).length;
  if (links !== itemCount(doc)) errors.push(`${links} titled item links, expected ${itemCount(doc)}`);
  ['legend', 'functions', ...doc.brands.map((b) => slug(b.name))].forEach((id) => {
    if (!html.includes(`id="${id}"`)) errors.push(`no heading id "${id}"`);
  });
  const text = html.replace(/<[^>]+>/g, '').replace(/&#39;|&#x27;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  const line = `Updated ${day(doc.updated)}: ${doc.change}`;
  if (!text.includes(`Updated ${day(doc.updated)}:`)) errors.push(`no "Updated ${day(doc.updated)}" line`);
  else if (!text.includes(line)) errors.push(`no "${line}" line: the page is an older version of the same day`);
  return errors;
}

export function check(doc, mdOnDisk) {
  const errors = validate(doc);
  if (errors.length) return errors;
  return renderMarkdown(doc) === mdOnDisk ? [] : ['functions.md is out of date: run node tools/reports/functions/render.mjs'];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const doc = JSON.parse(fs.readFileSync(path.join(dir, 'functions.json'), 'utf8'));
  const mdFile = path.join(dir, 'functions.md');
  if (process.argv.includes('--check')) {
    const errors = check(doc, fs.existsSync(mdFile) ? fs.readFileSync(mdFile, 'utf8') : '');
    errors.forEach((e) => console.error(e));
    console.log(errors.length ? `check failed: ${errors.length} error(s)` : 'check passed');
    process.exit(errors.length ? 1 : 0);
  }
  if (process.argv.includes('--verify')) {
    const hosts = ['https://main--lh-com--moved-permanently.aem.page', 'https://main--lh-com--moved-permanently.aem.live'];
    const attempt = async (host, left) => {
      const html = await (await fetch(`${host}/migration-status/functions.plain.html`, { cache: 'no-store' })).text();
      const errors = verifyPlain(doc, html);
      if (!errors.length || !left) return errors;
      await new Promise((r) => { setTimeout(r, 10000); });
      return attempt(host, left - 1);
    };
    const results = await Promise.all(hosts.map((h) => attempt(h, 6)));
    results.forEach((errors, i) => console.log(`${hosts[i]}: ${errors.length ? errors.join('; ') : `ok, ${itemCount(doc)} titled item links`}`));
    process.exit(results.some((e) => e.length) ? 1 : 0);
  }
  const errors = validate(doc);
  if (errors.length) {
    errors.forEach((e) => console.error(e));
    process.exit(1);
  }
  fs.mkdirSync(path.join(dir, 'out'), { recursive: true });
  fs.writeFileSync(mdFile, renderMarkdown(doc));
  const page = renderPage(doc);
  fs.writeFileSync(path.join(dir, 'out', 'page.html'), page);
  fs.writeFileSync(path.join(dir, 'out', 'canvas.html'), renderCanvas(doc));
  console.log(JSON.stringify({
    updated: doc.updated,
    items: itemCount(doc),
    titledItemLinks: titledItemLinks(page).length,
    footnotes: Object.keys(footnoteNumbers(doc)).length,
    totals: Object.fromEntries(doc.brands.map((b, i) => [b.name, totals(doc)[i]])),
  }));
}
