// Pure helpers of the admin apps (no DOM, no network), so they can be tested with node --test.

// The admin apps' lh-backends (the Cloudflare account's Worker).
export const DEFAULT_API = 'https://lh-backends.benpeter.workers.dev';

/** The default API origin for the host an app runs on (one for every host). */
export const defaultApi = () => DEFAULT_API;

// ?api= may only point at a local Worker or another deployment of the same Worker, so a crafted
// link cannot send the editor's sign-in token to a foreign host.
const LOCAL_HOSTS = ['localhost', '127.0.0.1'];
const WORKER_HOST = /^([a-z0-9-]+-)?lh-backends\.benpeter\.workers\.dev$/;

/** The API origin: the host's default, or an allowed ?api= value from the page's query string. */
export function resolveApiBase(search, hostname = '') {
  const fallback = defaultApi(hostname);
  const value = new URLSearchParams(search || '').get('api');
  if (!value) return fallback;
  let url;
  try {
    url = new URL(value);
  } catch {
    return fallback;
  }
  if (url.username || url.password || (url.pathname !== '/' && url.pathname !== '')) return fallback;
  const local = LOCAL_HOSTS.includes(url.hostname) && ['http:', 'https:'].includes(url.protocol);
  const worker = url.protocol === 'https:' && !url.port && WORKER_HOST.test(url.hostname);
  return local || worker ? url.origin : fallback;
}

const SERVICE_DOWN = 'The admin service is not available right now. Try again in a few minutes.';

/** A plain-English message for an API error (status and the JSON error body, if any). */
export function errorMessage(status, body = {}) {
  const code = body && typeof body.error === 'string' ? body.error : '';
  const fields = Array.isArray(body?.fields) ? body.fields.join(', ') : '';
  if (status === 0) return 'The admin service cannot be reached. Check your network and try again.';
  if (status === 401) return 'Your sign-in was not accepted or has expired. Reload the page in DA and try again.';
  if (status === 403) return 'Your account may not use this tool. Ask an administrator to give you access.';
  if (status === 503) {
    if (code === 'admin-not-configured') return `The admin service is not set up yet (missing setting: ${body.missing}).`;
    if (code === 'secret-not-configured') return `The admin service is missing a setting (${body.secret}). Ask the operator.`;
    if (code === 'upstream-not-configured') return 'The data source behind this tool is not connected yet.';
    if (code === 'ims-mock-disabled') return 'The sign-in check of the admin service is not set up yet.';
    return SERVICE_DOWN;
  }
  if (status === 502) return 'A system behind this tool did not answer. Try again later.';
  if (status === 413) return 'The file or text is too large for the admin service.';
  if (status === 415) return 'The request was not sent as JSON.';
  const known = {
    'dry-run-required': 'Run the check again on this exact file before importing.',
    'partner-exists': 'A partner with this ID exists already.',
    'partner-not-found': 'This partner does not exist.',
    'partner-disabled': 'Enable the partner before you change its end date.',
    'rotation-pending': 'A new key is already waiting for its start date. Wait until then before creating another.',
    'incident-not-found': 'No incident with this number.',
    'no-entries': 'This sweepstake has no entries.',
    'not-retryable': 'Only failed or rejected jobs can be retried.',
    'unknown-job': 'This job does not exist (any more).',
    'unknown-dataset': 'There is no schema for this path.',
    'range-too-long': 'Choose a date range of at most one year.',
    'unknown-fields': `The service does not accept these fields: ${fields}.`,
    'invalid-fields': `Check these fields: ${fields}.`,
  };
  if (known[code]) return known[code];
  if (status === 404) return 'Not found.';
  if (status === 400) return 'The service did not accept the request.';
  if (status >= 500) return SERVICE_DOWN;
  return `The admin service answered with status ${status}.`;
}

/** Tool access from /admin/me: the tool itself, or (for sweepstakes) any tenant entry of it. */
export function hasTool(tools, tool) {
  if (!tool) return true;
  return (tools || []).some((t) => t === tool || t.startsWith(`${tool}:`));
}

// --- CSV ---

function csvCell(value) {
  if (value === null || value === undefined) return '';
  let text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  // a spreadsheet would run these as formulas
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Rows (arrays of values) -> CSV text with CRLF line ends (RFC 4180), formula-guarded. */
export function toCsv(rows) {
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n').concat('\r\n');
}

/** The file name of a Content-Disposition header, or the fallback. */
export function filenameFromDisposition(header, fallback) {
  const text = String(header || '');
  const star = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(text);
  if (star) {
    try {
      return decodeURIComponent(star[1].trim());
    } catch {
      // fall through
    }
  }
  const plain = /filename\s*=\s*"([^"]*)"|filename\s*=\s*([^;]+)/i.exec(text);
  const name = plain ? (plain[1] ?? plain[2]).trim() : '';
  return name && !/[/\\]/.test(name) ? name : fallback;
}

// --- sheets (DA sheet JSON <-> rows) ---

const pad = (n) => String(n).padStart(2, '0');

/**
 * A spreadsheet cell as sheet text. Dates (SheetJS cellDates, local time) become yyyy-MM-dd, or
 * yyyy-MM-dd HH:mm:ss when they have a time of day.
 */
export function cellText(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return '';
    const day = `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
    const time = `${pad(v.getHours())}:${pad(v.getMinutes())}:${pad(v.getSeconds())}`;
    return time === '00:00:00' ? day : `${day} ${time}`;
  }
  return String(v);
}

/** Column names of row objects, in first-seen order. */
export function columnsOf(data) {
  const seen = [];
  (data || []).forEach((row) => Object.keys(row || {}).forEach((k) => {
    if (!seen.includes(k)) seen.push(k);
  }));
  return seen;
}

/**
 * Spreadsheet rows (first row = headers, as SheetJS gives them with header: 1) -> row objects with
 * text values. Blank rows and columns without a header are dropped; headers are trimmed.
 */
export function sheetRowsToObjects(rows) {
  const [head = [], ...body] = rows || [];
  const headers = Array.from(head, (h) => cellText(h).trim());
  return body
    .filter((row) => Array.isArray(row) && Array.from(row).some((v) => cellText(v).trim() !== ''))
    .map((row) => Object.fromEntries(headers
      .map((h, i) => [h, cellText(row[i])])
      .filter(([h]) => h !== '')));
}

/** Row objects -> spreadsheet rows (header row first) for the given columns. */
export function objectsToSheetRows(data, columns = columnsOf(data)) {
  return [columns, ...(data || []).map((row) => columns.map((c) => cellText(row?.[c])))];
}

/**
 * Reads a DA sheet document ({":type": "sheet"} or "multi-sheet"). Returns the sheet names and the
 * chosen sheet (the given name, else "data", else the first).
 */
export function readDaSheet(json, name) {
  if (!json || typeof json !== 'object') {
    return {
      names: [], name: null, data: [], columns: [],
    };
  }
  if (json[':type'] === 'multi-sheet') {
    const names = Array.isArray(json[':names']) ? json[':names'] : [];
    let chosen = names[0] ?? null;
    if (names.includes(name)) chosen = name;
    else if (names.includes('data')) chosen = 'data';
    const data = Array.isArray(json[chosen]?.data) ? json[chosen].data : [];
    return {
      names, name: chosen, data, columns: columnsOf(data),
    };
  }
  const data = Array.isArray(json.data) ? json.data : [];
  const sheetName = json[':sheetname'] || 'data';
  return {
    names: [sheetName], name: sheetName, data, columns: columnsOf(data),
  };
}

/**
 * A DA sheet document with the named sheet replaced by `data` (other sheets and private sheets
 * kept). Without an existing document: a single sheet named "data".
 */
export function writeDaSheet(existing, name, data) {
  const sheet = {
    total: data.length, limit: data.length, offset: 0, data,
  };
  if (existing && existing[':type'] === 'multi-sheet') {
    const names = Array.isArray(existing[':names']) ? [...existing[':names']] : [];
    if (!names.includes(name)) names.push(name);
    return {
      ...existing, [name]: { ...existing[name], ...sheet }, ':names': names,
    };
  }
  const out = { ...sheet, ':sheetname': name || 'data', ':type': 'sheet' };
  if (existing?.[':colWidths'] && (existing[':sheetname'] || 'data') === (name || 'data')) {
    out[':colWidths'] = existing[':colWidths'];
  }
  if (existing?.[':private']) out[':private'] = existing[':private'];
  return out;
}

// --- seat map workbook ---

export const SEATMAP_MAX_BYTES = 2 * 1024 * 1024;

/**
 * SheetJS sheets read with { header: 1, raw: true, blankrows: true } -> the import body:
 * { airline, sheets: [{ name, rows }] }. Empty cells become null, blank rows [].
 */
export function workbookToImport(airline, sheets) {
  return {
    airline: String(airline || '').trim().toUpperCase(),
    sheets: (sheets || []).map(({ name, rows }) => ({
      name: String(name),
      rows: (rows || []).map((row) => {
        if (!Array.isArray(row)) return [];
        const cells = Array.from(row, (v) => {
          if (v === undefined || v === null || v === '') return null;
          if (v instanceof Date) return v.toISOString().slice(0, 10);
          return typeof v === 'number' || typeof v === 'boolean' ? v : String(v);
        });
        while (cells.length && cells[cells.length - 1] === null) cells.pop();
        return cells;
      }),
    })),
  };
}

/** UTF-8 size of a JSON body in bytes. */
export const jsonBytes = (value) => new TextEncoder().encode(JSON.stringify(value)).length;

// --- feature switches: rows <-> text ("TENANT MARKET" per line) ---

export function rowsToText(rows) {
  return (rows || []).map((r) => `${r.tenant} ${r.market}`).join('\n');
}

/** "LH DE" lines (also "LH/DE", "LH,DE") -> { rows, bad: [line numbers] }; upper-cased. */
export function textToRows(text) {
  const rows = [];
  const bad = [];
  String(text || '').split(/\r?\n/).forEach((line, i) => {
    const t = line.trim();
    if (!t) return;
    const parts = t.split(/[\s,/;]+/);
    if (parts.length !== 2) {
      bad.push(i + 1);
      return;
    }
    rows.push({ tenant: parts[0].toUpperCase(), market: parts[1].toUpperCase() });
  });
  return { rows, bad };
}

// --- partners: form values -> API body ---

/** True/false flags object from the checked names and all names. */
export function flagsOf(all, checked) {
  return Object.fromEntries((all || []).map((n) => [n, (checked || []).includes(n)]));
}

/**
 * Form values (strings and checkbox lists) -> the partner body. Empty optional fields are left
 * out on create and sent as null on update (to clear them).
 */
export function partnerBody(values, { create = false, tenantNames = [], modeNames = [] } = {}) {
  const body = {};
  const text = (v) => (typeof v === 'string' ? v.trim() : '');
  if (create && text(values.id)) body.id = text(values.id);
  body.name = text(values.name);
  if (text(values.comment) || !create) body.comment = text(values.comment);
  ['validFrom', 'validTo'].forEach((k) => {
    if (text(values[k])) body[k] = text(values[k]);
    else if (!create) body[k] = null;
  });
  const minutes = Number(text(values.timestampValidity));
  body.timestampValidity = Number.isInteger(minutes) && text(values.timestampValidity) !== '' ? minutes : NaN;
  body.encryptAll = Boolean(values.encryptAll);
  body.noEncryptionForBookingFlow = Boolean(values.noEncryptionForBookingFlow);
  if (tenantNames.length) body.tenants = flagsOf(tenantNames, values.tenants);
  if (modeNames.length) body.modes = flagsOf(modeNames, values.modes);
  return body;
}

/** The flag names used by any listed partner (the API is the source; nothing is hard-coded). */
export function flagNames(partners, field) {
  const names = [];
  (partners || []).forEach((p) => Object.keys(p?.[field] || {}).forEach((k) => {
    if (!names.includes(k)) names.push(k);
  }));
  return names;
}

// --- reports ---

/** {key: count} -> [[key, count]] sorted by count (descending), then key. */
export function countRows(counts) {
  return Object.entries(counts || {})
    .filter(([, v]) => typeof v === 'number')
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

// --- Message Center dashboard ---

const NOT_MESSAGES = ['details', 'config']; // details pages and settings live beside the messages
const MC_PATH = /^\/message-center\/([a-z0-9-]+)\/([a-z0-9-]+)\/([a-z]{2}(?:-[a-z]{2})?)$/;

function validity(from, to, now) {
  const f = from ? Date.parse(from) : NaN;
  const t = to ? Date.parse(to) : NaN;
  if (Number.isFinite(t) && t < now) return 'expired';
  if (Number.isFinite(f) && f > now) return 'upcoming';
  return 'active';
}

/** Index rows (one per message and language) -> one entry per message, sorted by type and title. */
export function groupMessages(rows, now = Date.now()) {
  const byKey = new Map();
  (rows || []).forEach((row) => {
    const m = MC_PATH.exec(row?.path || '');
    if (!m) return;
    const [, type, id, lang] = m;
    if (NOT_MESSAGES.includes(type)) return;
    const key = `${type}/${id}`;
    if (!byKey.has(key)) {
      byKey.set(key, {
        type, id, title: '', languages: [], from: '', to: '', criticality: '', touchpoints: [], state: '',
      });
    }
    const entry = byKey.get(key);
    entry.languages.push(lang);
    if (!entry.title) entry.title = row['internal-title'] || row.headline || '';
    if (!entry.from && row.from) entry.from = row.from;
    if (!entry.to && row.to) entry.to = row.to;
    if (!entry.criticality && row.criticality) entry.criticality = row.criticality;
    const tps = Array.isArray(row.touchpoints) ? row.touchpoints : [];
    tps.forEach((t) => { if (!entry.touchpoints.includes(t)) entry.touchpoints.push(t); });
  });
  return [...byKey.values()].map((e) => ({
    ...e,
    languages: e.languages.sort(),
    title: e.title || e.id,
    state: validity(e.from, e.to, now),
  })).sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
}

// --- articles ---

/** Language of a document path like /de/en/...: second segment, else first, else en. */
export function languageFromPath(path) {
  const parts = String(path || '').split('/').filter(Boolean);
  const lang = [parts[1], parts[0]].find((p) => /^[a-z]{2}$/.test(p || ''));
  return lang || 'en';
}

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

/** A generated article -> HTML for the document: a heading and one paragraph per text block. */
export function articleHtml({ title, description, text }) {
  const paras = String(text || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return [
    title ? `<h1>${escapeHtml(title)}</h1>` : '',
    description ? `<p>${escapeHtml(description)}</p>` : '',
    ...paras.map((p) => `<p>${escapeHtml(p)}</p>`),
  ].join('');
}
