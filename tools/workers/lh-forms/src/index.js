/*
 * lh-forms: Cloudflare Worker that receives the form block's submissions from the Edge
 * Delivery Services hosts and sends one e-mail per valid submission with Cloudflare Email
 * Service (send_email binding EMAIL). Recipients come from the FORM_CONFIG secret.
 *
 * Never log field values, file names or addresses. No dependencies. See ../README.md.
 */

/*
 * Form ids and their titles (the page h1 of /de/en/... and /de/de/...). special-needs and
 * add-sports-baggage have no German page, so their German title is the English one.
 */
const FORMS = {
  'anmeldung-tiere-frachtraum': {
    en: 'Register an animal for carriage in the cargo hold',
    de: 'Tier zum Transport im Frachtraum anmelden',
  },
  'refund-form': { en: 'Refunds', de: 'Erstattungen' },
  'feedback-past-flight': {
    en: 'Feedback on a past flight',
    de: 'Feedback zu einem vergangenen Flug',
  },
  'register-ammunition': {
    en: 'Register only ammunition for transport in the cargo hold',
    de: 'Nur Munition zum Transport im Frachtraum anmelden',
  },
  'register-animal-cabin': {
    en: 'Register your pet for carriage in the cabin',
    de: 'Tier zur Mitnahme in der Kabine anmelden',
  },
  'special-needs': {
    en: 'Register your assistance requirements online',
    de: 'Register your assistance requirements online',
  },
  'add-sports-baggage': { en: 'Add sports baggage', de: 'Add sports baggage' },
  'group-travel': { en: 'Group travel', de: 'Gruppenreisen' },
  'passenger-receipt-90': {
    en: 'Enquiry about passenger receipt',
    de: 'Anfrage bezüglich einem Passagierbeleg',
  },
};
const LOCALES = ['de-en', 'de-de', 'at-de', 'gb-en'];

const DEFAULTS = {
  ALLOWED_ORIGIN_PATTERN: '^https://[a-z0-9-]+--(lh-com|lh-flynet)--moved-permanently\\.(aem\\.(page|live)|(stage-)?(preview|ue)\\.da\\.(live|page))$',
  EXTRA_ALLOWED_ORIGINS: 'https://lhcom.bbird.live,http://localhost:3000',
};

const MB = 1000 * 1000;
const LIMITS = {
  body: 6 * MB,
  fieldsBytes: 256 * 1024,
  fields: 400,
  section: 300,
  label: 1000,
  name: 200,
  value: 10000,
  page: 2000,
  perHour: 20,
};

// Files: the rules of the live feedback-past-flight dropzone (content/de/en/feedback-past-flight:
// accept=image/png, image/jpeg, image/jpg, application/pdf; max-files=5; max-size=3700000;
// not-allowed=#$%^*()[]) plus a total cap that keeps the mail under the Email Service limit.
const FILE_FORMS = ['feedback-past-flight'];
const FILE_RULES = {
  types: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
  extensions: ['.png', '.jpg', '.jpeg', '.pdf'],
  maxFiles: 5,
  maxSize: 3700000,
  maxTotal: 4.5 * MB,
  notAllowed: '#$%^*()[]',
  maxName: 200,
};

const HONEYPOT = 'lh_hp';
const TEXT_PARTS = ['form', 'locale', 'page', 'fields', HONEYPOT];
const HOUR_MS = 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

function isEmail(v) {
  return typeof v === 'string' && v.length <= 254 && EMAIL_RE.test(v);
}

const regexCache = new Map();
function originRegex(pattern) {
  if (!regexCache.has(pattern)) {
    let re = null;
    try {
      re = new RegExp(pattern);
    } catch (e) {
      re = null;
    }
    regexCache.set(pattern, re);
  }
  return regexCache.get(pattern);
}

function isOriginAllowed(origin, env) {
  const extra = (env.EXTRA_ALLOWED_ORIGINS ?? DEFAULTS.EXTRA_ALLOWED_ORIGINS)
    .split(',').map((s) => s.trim()).filter(Boolean);
  if (extra.includes(origin)) return true;
  const re = originRegex(env.ALLOWED_ORIGIN_PATTERN || DEFAULTS.ALLOWED_ORIGIN_PATTERN);
  return !!re && re.test(origin);
}

function corsHeaders(origin) {
  const h = new Headers({ Vary: 'Origin' });
  if (origin) {
    h.set('Access-Control-Allow-Origin', origin);
    h.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    h.set('Access-Control-Allow-Headers', 'Content-Type');
    h.set('Access-Control-Max-Age', '86400');
  }
  return h;
}

function json(status, data, origin) {
  const headers = corsHeaders(origin);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { status, headers });
}

const fail = (status, error, origin) => json(status, { ok: false, error }, origin);

async function readLimited(stream, max) {
  if (!stream) return new Uint8Array(0);
  const reader = stream.getReader();
  const chunks = [];
  let size = 0;
  const pump = async () => {
    const { done, value } = await reader.read();
    if (done) return true;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return false;
    }
    chunks.push(value);
    return pump();
  };
  if (!(await pump())) return null;
  const out = new Uint8Array(size);
  let offset = 0;
  chunks.forEach((c) => {
    out.set(c, offset);
    offset += c.byteLength;
  });
  return out;
}

/* ---------- configuration ---------- */

function parseConfig(raw) {
  if (raw && typeof raw === 'object') return raw;
  if (typeof raw !== 'string') return null;
  try {
    const cfg = JSON.parse(raw);
    return cfg && typeof cfg === 'object' && !Array.isArray(cfg) ? cfg : null;
  } catch (e) {
    return null;
  }
}

function isConfigured(env) {
  return !!(env.EMAIL && typeof env.EMAIL.send === 'function'
    && isEmail(String(env.FORM_SENDER || '').trim()) && parseConfig(env.FORM_CONFIG));
}

const oneLine = (s) => String(s).replace(/[\r\n\t]+/g, ' ').trim().slice(0, 300);

/**
 * Recipients and subject: forms[form][locale], then forms[form]["*"], then default; the first
 * entry with at least one valid address wins.
 * @returns {{to: string[], subject: string|null}|null}
 */
function resolveRecipients(cfg, form, locale) {
  const forms = cfg && cfg.forms && typeof cfg.forms === 'object' ? cfg.forms : {};
  const own = forms[form] && typeof forms[form] === 'object' ? forms[form] : {};
  const def = cfg && cfg.default && typeof cfg.default === 'object' ? cfg.default : {};
  const subjectOf = (e) => (typeof e?.subject === 'string' && oneLine(e.subject) ? oneLine(e.subject) : null);
  const entries = [own[locale], own['*'], def];
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    if (entry && typeof entry === 'object') {
      const list = Array.isArray(entry.to) ? entry.to : [entry.to];
      const to = [...new Set(list.filter((a) => typeof a === 'string').map((a) => a.trim()).filter(isEmail))];
      if (to.length) return { to: to.slice(0, 50), subject: subjectOf(entry) || subjectOf(def) };
    }
  }
  return null;
}

/* ---------- validation ---------- */

function validateFields(raw) {
  if (typeof raw !== 'string' || !raw) return { error: 'missing-fields' };
  if (new TextEncoder().encode(raw).byteLength > LIMITS.fieldsBytes) return { error: 'fields-too-large' };
  let list;
  try {
    list = JSON.parse(raw);
  } catch (e) {
    return { error: 'invalid-fields' };
  }
  if (!Array.isArray(list) || list.length > LIMITS.fields) return { error: 'invalid-fields' };
  const keys = ['section', 'label', 'name', 'value'];
  const ok = list.every((f) => f && typeof f === 'object' && !Array.isArray(f)
    && keys.every((k) => typeof f[k] === 'string' && f[k].length <= LIMITS[k]));
  if (!ok) return { error: 'invalid-fields' };
  return {
    fields: list.map((f) => ({
      section: f.section, label: f.label, name: f.name, value: f.value,
    })),
  };
}

function validPage(raw) {
  if (typeof raw !== 'string' || !raw || raw.length > LIMITS.page) return null;
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null;
  } catch (e) {
    return null;
  }
}

function sniffType(bytes) {
  const b = bytes;
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 5 && String.fromCharCode(...b.subarray(0, 5)) === '%PDF-') return 'application/pdf';
  return null;
}

/** @returns {Promise<{status:number,error:string}|{attachments:object[]}>} */
async function validateFiles(files, form) {
  if (!files.length) return { attachments: [] };
  if (!FILE_FORMS.includes(form)) return { status: 400, error: 'files-not-allowed' };
  if (files.length > FILE_RULES.maxFiles) return { status: 400, error: 'too-many-files' };
  let total = 0;
  const bad = files.map((file) => {
    const name = String(file.name || '');
    const lower = name.toLowerCase();
    total += file.size;
    if (!name || name.length > FILE_RULES.maxName || /[\x00-\x1f\x7f/\\]/.test(name) // eslint-disable-line no-control-regex
      || [...FILE_RULES.notAllowed].some((c) => name.includes(c))) return [400, 'invalid-file-name'];
    if (file.size > FILE_RULES.maxSize) return [413, 'file-too-large'];
    if (!FILE_RULES.extensions.some((e) => lower.endsWith(e))
      || !FILE_RULES.types.includes(String(file.type || '').toLowerCase())) return [400, 'invalid-file-type'];
    return null;
  }).find(Boolean);
  if (bad) return { status: bad[0], error: bad[1] };
  if (total > FILE_RULES.maxTotal) return { status: 413, error: 'files-too-large' };
  const attachments = await Promise.all(files.map(async (file) => {
    const content = await file.arrayBuffer();
    return {
      content, filename: file.name, type: sniffType(new Uint8Array(content)), disposition: 'attachment',
    };
  }));
  if (attachments.some((a) => !a.type)) return { status: 400, error: 'invalid-file-type' };
  return { attachments };
}

/* ---------- mail ---------- */

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function groupBySection(fields) {
  const groups = new Map();
  fields.forEach((f) => {
    if (!groups.has(f.section)) groups.set(f.section, []);
    groups.get(f.section).push(f);
  });
  return [...groups.entries()];
}

function replyToFrom(fields) {
  const hit = fields.find((f) => (/mail/i.test(f.name) || /mail/i.test(f.label)) && isEmail(f.value.trim()));
  return hit ? hit.value.trim() : null;
}

function buildMail({
  title, page, time, fields, files,
}) {
  const groups = groupBySection(fields);
  const cell = 'style="border:1px solid #ccc;padding:4px 8px;text-align:left;vertical-align:top"';
  const htmlValue = (v) => escapeHtml(v).replace(/\r?\n/g, '<br>');
  const html = [
    '<!doctype html><html><body style="font-family:Arial,sans-serif">',
    `<h1>${escapeHtml(title)}</h1>`,
    `<p>Page: <a href="${escapeHtml(page)}">${escapeHtml(page)}</a><br>Time: ${escapeHtml(time)}</p>`,
    ...groups.map(([section, list]) => [
      section ? `<h2>${escapeHtml(section)}</h2>` : '',
      '<table style="border-collapse:collapse">',
      ...list.map((f) => `<tr><th ${cell}>${escapeHtml(f.label || f.name)}</th><td ${cell}>${htmlValue(f.value)}</td></tr>`),
      '</table>',
    ].join('')),
    files.length ? `<h2>Attachments</h2><ul>${files.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ul>` : '',
    '</body></html>',
  ].join('\n');
  const text = [
    title,
    `Page: ${page}`,
    `Time: ${time}`,
    ...groups.map(([section, list]) => [
      '',
      ...(section ? [`== ${section} ==`] : []),
      ...list.map((f) => `${f.label || f.name}: ${f.value}`),
    ].join('\n')),
    ...(files.length ? ['', '== Attachments ==', ...files] : []),
  ].join('\n');
  return { html, text };
}

/* ---------- rate limits ---------- */

/*
 * Per-hour limit: one SQLite-backed Durable Object per client IP keeps the timestamps of its
 * accepted submissions of the last hour (sliding window, at most LIMITS.perHour entries). An
 * alarm one hour after the last hit deletes the storage. (The rate limiting binding only
 * supports periods of 10 or 60 s, so it covers the per-minute limit.)
 */
export class HourlyLimiter {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    const limit = Number(new URL(request.url).searchParams.get('limit')) || LIMITS.perHour;
    const now = Date.now();
    const hits = ((await this.state.storage.get('hits')) || []).filter((t) => t > now - HOUR_MS);
    if (hits.length >= limit) return new Response(JSON.stringify({ success: false }));
    hits.push(now);
    await this.state.storage.put('hits', hits);
    await this.state.storage.setAlarm(now + HOUR_MS);
    return new Response(JSON.stringify({ success: true }));
  }

  async alarm() {
    await this.state.storage.deleteAll();
  }
}

async function rateLimited(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (env.RATE_LIMIT_MINUTE) {
    const { success } = await env.RATE_LIMIT_MINUTE.limit({ key: ip });
    if (!success) return true;
  }
  if (env.HOURLY_LIMITER) {
    const stub = env.HOURLY_LIMITER.get(env.HOURLY_LIMITER.idFromName(ip));
    const res = await stub.fetch(`https://hourly-limiter/hit?limit=${LIMITS.perHour}`, { method: 'POST' });
    const { success } = await res.json();
    if (!success) return true;
  }
  return false;
}

/* ---------- handler ---------- */

async function submit(request, env, origin) {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > LIMITS.body) return fail(413, 'payload-too-large', origin);
  const type = request.headers.get('content-type') || '';
  if (!/^multipart\/form-data\s*;/i.test(type)) return fail(400, 'expected-multipart', origin);
  if (await rateLimited(request, env)) return fail(429, 'rate-limited', origin);

  const body = await readLimited(request.body, LIMITS.body);
  if (body === null) return fail(413, 'payload-too-large', origin);
  let data;
  try {
    data = await new Response(body, { headers: { 'content-type': type } }).formData();
  } catch (e) {
    return fail(400, 'invalid-multipart', origin);
  }

  const text = {};
  const files = [];
  let unexpected = false;
  data.forEach((value, key) => {
    if (TEXT_PARTS.includes(key)) {
      if (typeof value === 'string' && !(key in text)) text[key] = value;
      else unexpected = true;
    } else if (typeof value === 'string') {
      // an empty unknown part is ignored (an empty file input), any other text is an error
      if (value) unexpected = true;
    } else if (value.size > 0 || value.name) {
      files.push(value);
    }
  });

  if (text[HONEYPOT]) return json(200, { ok: true }, origin);
  if (unexpected) return fail(400, 'invalid-parts', origin);

  const { form, locale } = text;
  if (!Object.prototype.hasOwnProperty.call(FORMS, form || '')) return fail(400, 'unknown-form', origin);
  if (!LOCALES.includes(locale)) return fail(400, 'unknown-locale', origin);
  const page = validPage(text.page);
  if (!page) return fail(400, 'invalid-page', origin);
  const checked = validateFields(text.fields);
  if (checked.error) return fail(400, checked.error, origin);
  const filesChecked = await validateFiles(files, form);
  if (filesChecked.error) return fail(filesChecked.status, filesChecked.error, origin);

  if (!isConfigured(env)) return fail(500, 'not-configured', origin);
  const recipients = resolveRecipients(parseConfig(env.FORM_CONFIG), form, locale);
  if (!recipients) return fail(500, 'no-recipients', origin);

  const title = FORMS[form][locale.endsWith('-de') ? 'de' : 'en'];
  const { fields } = checked;
  const { attachments } = filesChecked;
  const { html, text: plain } = buildMail({
    title, page, time: new Date().toISOString(), fields, files: attachments.map((a) => a.filename),
  });
  const message = {
    from: String(env.FORM_SENDER).trim(),
    to: recipients.to,
    subject: recipients.subject || `[lh-com] ${title} (${locale})`,
    html,
    text: plain,
  };
  const replyTo = replyToFrom(fields);
  if (replyTo) message.replyTo = replyTo;
  if (attachments.length) message.attachments = attachments;

  try {
    await env.EMAIL.send(message);
  } catch (e) {
    // only the error code: never the message, which may quote addresses
    // eslint-disable-next-line no-console
    console.error('lh-forms send failed', String((e && e.code) || 'unknown'));
    return fail(502, 'send-failed', origin);
  }
  return json(200, { ok: true }, origin);
}

async function handle(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');

  if (origin && !isOriginAllowed(origin, env)) return fail(403, 'origin-not-allowed', null);

  if (request.method === 'OPTIONS') {
    const wanted = (request.headers.get('Access-Control-Request-Method') || '').toUpperCase();
    const ok = (url.pathname === '/submit' && wanted === 'POST') || (url.pathname === '/health' && wanted === 'GET');
    if (!origin || !ok) return fail(404, 'not-found', origin);
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (url.pathname === '/health') {
    if (request.method !== 'GET') return fail(405, 'method-not-allowed', origin);
    return json(200, { configured: isConfigured(env) }, origin);
  }

  if (url.pathname === '/submit') {
    if (request.method !== 'POST') return fail(405, 'method-not-allowed', origin);
    if (!origin) return fail(403, 'origin-not-allowed', null);
    return submit(request, env, origin);
  }

  return fail(404, 'not-found', origin);
}

// The default export is the worker; HourlyLimiter is the Durable Object class (wrangler.toml).
export default {
  async fetch(request, env) {
    const bindings = env || {};
    try {
      return await handle(request, bindings);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('lh-forms error', String((e && e.name) || 'Error'));
      const origin = request.headers.get('Origin');
      return fail(500, 'internal-error', origin && isOriginAllowed(origin, bindings) ? origin : null);
    }
  },
};
