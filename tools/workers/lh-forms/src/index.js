/*
 * lh-forms: Cloudflare Worker that receives the form block's submissions from the Edge
 * Delivery Services hosts and sends one e-mail per valid submission through the Cloudflare
 * Email Sending REST API of another Cloudflare account (secrets FORM_MAIL_ACCOUNT_ID,
 * FORM_MAIL_TOKEN). Recipients come from the FORM_CONFIG secret, the sender from FORM_SENDER.
 * The var FORM_DELIVERY (email | email+backends | backends) can also, or instead, hand the
 * submission to lh-backends (service binding DELIVERY, secret FORMS_DELIVERY_TOKEN).
 *
 * Bot check (AMS rest A6): with BOT_CHECK on (the default; `off` per deployment, as www has
 * it off) /submit needs a Cloudflare Turnstile token (part `cf-turnstile-response`), checked
 * with Siteverify and the secret TURNSTILE_SECRET before anything is sent; a missing, invalid
 * or expired token answers 403 bot-check-failed. GET /config gives the block the public site
 * key (TURNSTILE_SITE_KEY) and the switch. The RPC entrypoint BotCheck (service bindings only:
 * lh-edge's /service/secured/api/captcha/verify) checks a token, so the secret stays here.
 *
 * Never log field values, file names or addresses. No dependencies. See ../README.md.
 */
/* eslint-disable max-classes-per-file -- HourlyLimiter and BotCheck: wrangler.toml classes */
// eslint-disable-next-line import/no-unresolved -- Workers runtime module (tests: a shim)
import { WorkerEntrypoint } from 'cloudflare:workers';

/** Austrian's ids (austrian-<page name>) and titles: [en, de], one title for both languages. */
function austrianForms(titles) {
  return Object.fromEntries(Object.entries(titles)
    .map(([name, [en, de = en]]) => [`austrian-${name}`, { en, de }]));
}

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
  // Discover Airlines (lh-discover): the h1 of www.discover-airlines.com's /de/en/ and /de/de/
  // pages (2026-10-29); the sweepstake exists in German only (us/de, xx/de)
  'discover-assistance': {
    en: 'Register assistance requirements online',
    de: 'Betreuungsbedarf online anmelden',
  },
  'discover-add-sports-baggage': {
    en: 'Register sports baggage',
    de: 'Sportgepäck anmelden',
  },
  'discover-register-ammunition': {
    en: 'Registering just ammunition for transport in hold',
    de: 'Nur Munition zum Transport im Frachtraum anmelden',
  },
  'discover-register-hunting-firearm': {
    en: 'Registering a hunting weapon for transport in hold',
    de: 'Jagdwaffe zum Transport im Frachtraum anmelden',
  },
  'discover-register-sporting-firearm': {
    en: 'Register a sports weapon for transport in hold',
    de: 'Sportwaffe zum Transport im Frachtraum anmelden',
  },
  'discover-register-animal-cargo-hold': {
    en: 'Register animal for transport in hold',
    de: 'Tier zum Transport im Frachtraum anmelden',
  },
  'discover-register-animal-cabin': {
    en: 'Register an animal for transport in the cabin',
    de: 'Tier zum Transport in der Kabine anmelden',
  },
  'discover-compensation-baggage': {
    en: 'Compensation for late or damaged baggage',
    de: 'Kompensation bei verspätetem oder beschädigtem Gepäck',
  },
  'discover-other-concerns': { en: 'Other issues', de: 'Anderes Anliegen' },
  'discover-buccaneers-season-kickoff': {
    en: 'Gewinnspiel zum Season Kick-Off der Tampa Bay Buccaneers',
    de: 'Gewinnspiel zum Season Kick-Off der Tampa Bay Buccaneers',
  },
  // ITA Airways (lh-ita): the h1 of its pages (2026-10-31); ita-mice: it/en and de/de; the others
  // exist in one language (xx/en's group travel page has an Italian h1, as on www)
  'ita-mice': {
    en: 'MICE – Meetings, Incentives, Conferences, Exhibition',
    de: 'MICE – Meetings, Belohnungsreisen, Konferenzen, Ausstellungen',
  },
  'ita-group-travel': { en: 'Viaggi di gruppo', de: 'Viaggi di gruppo' },
  'ita-voglia-di-volare': {
    en: 'Form di registrazione al corso Voglia di Volare',
    de: 'Form di registrazione al corso Voglia di Volare',
  },
  'ita-emergency-contact': { en: 'Emergency contact', de: 'Emergency contact' },
  // Austrian Airlines (lh-austrian): the h1 of its at/en (else another English root's) and at/de
  // pages (2026-10-31); an id with one language has that title for both; austrian-newsletter
  // has no en or de page (cn/zh, it/it, jp/ja, pl/pl, ru/ru): it/it's and pl/pl's h1
  ...austrianForms({
    'anfrage-bestaetigung': ['Anfrage zur Bestätigung'],
    'anfrage-charterfluege': ['Anfrage zu Charterflügen'],
    'anfrage-flugbuchung': ['Anfrage zur Flugbuchung'],
    'anfrage-gepaeck': ['Anfrage zum Gepäck'],
    'anfrage-gruppenreisen': ['Group travel enquiries', 'Anfrage Gruppenreisen'],
    'anfrage-gutscheine': ['Enquiry about vouchers', 'Anfrage zu Gutscheinen'],
    'anfrage-rechnung': ['Anfrage zur Rechnung'],
    'anfrage-reisen-mit-tieren': ['Anfrage zum Reisen mit Tieren'],
    'anfrage-sitzplatz-menueauswahl': ['Anfrage zur Sitzplatz- und Menüauswahl'],
    'anfrage-sonstige-themen': ['Anfrage zu sonstigen Themen'],
    'anfrage-umbuchung': ['Anfrage zur Umbuchung'],
    'application-for-compensation-in-the-event-of-flight-irregularities': ['Antrag auf Kompensation und Kostenerstattung bei Unregelmäßigkeiten Ihres Fluges'],
    bagdamage: ['Enquiry regarding damaged baggage and repairs', 'Anfrage zu beschädigtem Gepäck und Reparatur'],
    'betroffenenrechte-anfrage': ['Betroffenenrechte-Anfrage'],
    'cancellation-refund-via-document-upload': ['Request for cancellation and refund via webform'],
    'contact-form-baggage': ['Baggage enquiry'],
    'contact-form-booking': ['Enquiry about flight bookings'],
    'contact-form-booking-confirmation': ['Enquiry about confirmation'],
    'contact-form-charter': ['Enquiry about charter flights'],
    'contact-form-medical-request': ['Register your assistance requirements online'],
    'contact-form-other': ['Enquiry about other topics'],
    'contact-form-passenger-receipt': ['Enquiry about passenger receipt'],
    'contact-form-rebooking': ['Enquiry about rebooking'],
    'contact-form-refund-seat-reservation': ['Request a refund for an additional purchased service'],
    'contact-form-requested-documents': ['Form for uploading requested documents'],
    'contact-form-seat-meal-requests': ['Enquiry about seat and menu selection'],
    'data-protection-contact': ['Data subject rights request'],
    'emergency-contact': ['Emergency contact'],
    'exclusive-charter-enquiry': ['Enquiry about exclusive charters', 'Exklusiv-Charter Anfrage'],
    'fluggaeste-mit-betreuungsbedarf': ['Betreuungsbedarf online anmelden'],
    'formular-upload-angeforderter-dokumente': ['Formular zum Upload angeforderter Dokumente'],
    'invoice-request-hungary': ['Invoice Request Hungary'],
    newsletter: ['Newsletter'],
    notfallkontakt: ['Notfallkontakt'],
    'private-check-in-counter': ['Private Check-in Counter', 'Privater Check-in Schalter'],
    'refund-form': ['Erstattungen'],
    'request-for-refund-of-expenses': ['Request for a reimbursement of expenses in the event of lost, damaged, or delayed Items', 'Antrag auf Kostenerstattung im Fall von verlorenen, beschädigten oder verspäteten Gegenständen'],
    'request-traveling-with-animals': ['Enquiry about travelling with pets'],
    'th-requested-documents': ['Form for uploading requested documents'],
  }),
};
// any country-language pair (the site's roots: de-en, de-de, at-de, gb-en, and the next ones)
const LOCALE = /^[a-z]{2}-[a-z]{2}$/;

const DEFAULTS = {
  ALLOWED_ORIGIN_PATTERN: '^https://[a-z0-9-]+--(lh-com|lh-flynet|lh-discover|lh-ita|lh-austrian|lh-airdolomiti)--moved-permanently\\.(aem\\.(page|live)|(stage-)?(preview|ue)\\.da\\.(live|page))$',
  EXTRA_ALLOWED_ORIGINS: 'https://lufthansa.turnsthe.page,https://discover.turnsthe.page,https://ita.turnsthe.page,https://austrian.turnsthe.page,https://airdolomiti.turnsthe.page,http://localhost:3000',
};

const MB = 1000 * 1000;
const LIMITS = {
  // the files' total (MAIL_FILES.maxTotal) plus the fields part and the multipart overhead
  body: 19 * MB,
  fieldsBytes: 256 * 1024,
  fields: 400,
  section: 300,
  label: 1000,
  name: 200,
  value: 10000,
  page: 2000,
  perHour: 20,
};

// Files, per form that has a dropzone: the rules of its live dropzone plus a total cap that keeps
// the mail under the Email Service limit: 25 MiB per message, attachments included
// (developers.cloudflare.com/email-service/platform/limits "Total message size", 2026-10-31);
// attachments are base64-encoded (+33 %), so the files may total 18.5 MB before encoding (www's
// 5 x 3.7 MB; about 24.7 MB in the message). A file's sniffed type must be one of the form's types.
const MAIL_FILES = { maxTotal: 18.5 * MB, notAllowed: '#$%^*()[]', maxName: 200 };
// Discover's contact forms (www.discover-airlines.com compensation-baggage, other-concerns:
// accept=image/jpeg, image/jpg, application/pdf; max-files=5; max-size=3145728;
// not-allowed=#$%^*()[])
const DISCOVER_CONTACT_FILES = {
  types: ['image/jpeg', 'image/jpg', 'application/pdf'],
  extensions: ['.jpg', '.jpeg', '.pdf'],
  maxFiles: 5,
  maxSize: 3145728,
  ...MAIL_FILES,
};
/*
 * Austrian's drop zones (the file rows of lh-austrian's form pages, as www's forms-filedrop:
 * accept, max-files, max-size; not-allowed #$%^*()[]). contact-form-booking, anfrage-flugbuchung
 * and th-requested-documents had "pdf, png, jpg" (and not-allowed=#) there: the same four types.
 * The 5 x 5 MB of betroffenenrechte-anfrage and data-protection-contact are over the total: the
 * block refuses a selection over it.
 */
function austrianFileRules() {
  const rules = (types, maxSize, maxFiles = 5) => ({
    types,
    extensions: [...new Set(types.map((t) => ({ 'image/png': '.png', 'application/pdf': '.pdf' }[t] || '.jpg')))]
      .flatMap((e) => (e === '.jpg' ? ['.jpg', '.jpeg'] : [e])),
    maxFiles,
    maxSize,
    ...MAIL_FILES,
  });
  const ALL = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
  const byForm = {
    'anfrage-bestaetigung': rules(ALL, 3700000),
    'anfrage-charterfluege': rules(ALL, 3700000),
    'anfrage-flugbuchung': rules(ALL, 2048000),
    'anfrage-gepaeck': rules(ALL, 3700000),
    'anfrage-gutscheine': rules(ALL, 3700000),
    'anfrage-rechnung': rules(ALL, 3700000),
    'anfrage-reisen-mit-tieren': rules(ALL, 3700000),
    'anfrage-sitzplatz-menueauswahl': rules(ALL, 3700000),
    'anfrage-sonstige-themen': rules(ALL, 2048000),
    'anfrage-umbuchung': rules(ALL, 3700000),
    'application-for-compensation-in-the-event-of-flight-irregularities': rules(ALL, 3700000),
    bagdamage: rules(['image/png', 'image/jpeg', 'image/jpg'], 3700000),
    'betroffenenrechte-anfrage': rules(ALL, 5000000),
    'contact-form-baggage': rules(ALL, 3700000),
    'contact-form-booking': rules(ALL, 2048000),
    'contact-form-booking-confirmation': rules(ALL, 3700000),
    'contact-form-charter': rules(ALL, 3700000),
    'contact-form-medical-request': rules(ALL, 2048000),
    'contact-form-other': rules(ALL, 3700000),
    'contact-form-passenger-receipt': rules(ALL, 3700000),
    'contact-form-rebooking': rules(ALL, 3700000),
    'contact-form-refund-seat-reservation': rules(ALL, 3700000),
    'contact-form-requested-documents': rules(ALL, 3700000),
    'contact-form-seat-meal-requests': rules(ALL, 3700000),
    'data-protection-contact': rules(ALL, 5000000),
    'fluggaeste-mit-betreuungsbedarf': rules(ALL, 3700000),
    'formular-upload-angeforderter-dokumente': rules(ALL, 3700000),
    'private-check-in-counter': rules(['image/jpeg', 'image/jpg'], 3700000, 1),
    'request-for-refund-of-expenses': rules(ALL, 3700000),
    'request-traveling-with-animals': rules(ALL, 3700000),
    'th-requested-documents': rules(ALL, 2048000),
  };
  return Object.fromEntries(Object.entries(byForm).map(([name, r]) => [`austrian-${name}`, r]));
}
const FILE_RULES = {
  // content/de/en/feedback-past-flight: accept=image/png, image/jpeg, image/jpg, application/pdf;
  // max-files=5; max-size=3700000; not-allowed=#$%^*()[]
  'feedback-past-flight': {
    types: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
    extensions: ['.png', '.jpg', '.jpeg', '.pdf'],
    maxFiles: 5,
    maxSize: 3700000,
    ...MAIL_FILES,
  },
  'discover-compensation-baggage': DISCOVER_CONTACT_FILES,
  'discover-other-concerns': DISCOVER_CONTACT_FILES,
  ...austrianFileRules(),
};

const HONEYPOT = 'lh_hp';
// the Turnstile widget's token (the name the widget gives its hidden input)
const BOT_TOKEN = 'cf-turnstile-response';
const TEXT_PARTS = ['form', 'locale', 'page', 'fields', HONEYPOT, BOT_TOKEN];
export const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
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

function isMailConfigured(env) {
  return !!(String(env.FORM_MAIL_ACCOUNT_ID || '').trim() && String(env.FORM_MAIL_TOKEN || '').trim()
    && isEmail(String(env.FORM_SENDER || '').trim()) && parseConfig(env.FORM_CONFIG));
}

/* ---------- delivery to lh-backends (switch FORM_DELIVERY) ---------- */

const DELIVERY_MODES = ['email', 'email+backends', 'backends'];
const DELIVERY_TIMEOUT_MS = 40000;
const warned = new Set();
/** Logs a warning once per isolate (codes only). */
function warnOnce(code) {
  if (warned.has(code)) return;
  warned.add(code);
  // eslint-disable-next-line no-console
  console.warn('lh-forms', code);
}

/** email (default and for any unknown value), email+backends or backends. */
function deliveryMode(env) {
  const mode = String(env.FORM_DELIVERY ?? '').trim();
  if (!mode) return 'email';
  if (DELIVERY_MODES.includes(mode)) return mode;
  warnOnce('unknown-form-delivery');
  return 'email';
}

/** The binding DELIVERY (lh-backends) and the secret FORMS_DELIVERY_TOKEN are there. */
function isDeliveryConfigured(env) {
  return !!(env.DELIVERY && typeof env.DELIVERY.fetch === 'function' && String(env.FORMS_DELIVERY_TOKEN || '').trim());
}

/** Configured for the delivery mode (GET /health). */
function isConfigured(env) {
  const mode = deliveryMode(env);
  if (mode === 'backends') return !!(isDeliveryConfigured(env) && parseConfig(env.FORM_CONFIG));
  if (mode === 'email+backends') return isMailConfigured(env) && isDeliveryConfigured(env);
  return isMailConfigured(env);
}

/**
 * Hands a submission to lh-backends (POST /_lh-backends/forms/deliver over the binding; the
 * host does not matter). 200 delivered, 202 queued for a retry: both success. Returns the status
 * and lh-backends' error code only; nothing of the request is logged.
 * @returns {Promise<{ok:boolean,status:number,error:string}>}
 */
async function deliver(env, payload) {
  let resp;
  try {
    resp = await env.DELIVERY.fetch('https://lh-backends/_lh-backends/forms/deliver', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forms-delivery-token': String(env.FORMS_DELIVERY_TOKEN).trim(),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
    });
  } catch (e) {
    return { ok: false, status: 0, error: e && e.name === 'TimeoutError' ? 'timeout' : 'network' };
  }
  let data = null;
  try { data = await resp.json(); } catch (e) { data = null; }
  const code = data && typeof data.error === 'string' && /^[a-z0-9_.-]{1,80}$/i.test(data.error) ? data.error : '';
  return { ok: resp.status === 200 || resp.status === 202, status: resp.status, error: code };
}

function logDelivery(result) {
  // the status and lh-backends' error code: never addresses, values, file names or the token
  // eslint-disable-next-line no-console
  console.error('lh-forms delivery failed', result.status, result.error || '-');
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

/**
 * Base64 of bytes (attachments in the REST API's JSON), in chunks of a multiple of 3 bytes: no
 * binary string of the whole file next to its encoding (memory: 18.5 MB of files per message).
 */
function base64(bytes) {
  const CHUNK = 3 * 0x8000;
  const parts = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    parts.push(btoa(String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK))));
  }
  return parts.join('');
}

/**
 * The REST API's JSON body: a string without attachments; with them a Blob of parts, so the
 * base64 contents are not copied into one more string of the whole message (about 25 MB).
 */
export function messageBody(message) {
  const { attachments = [], ...rest } = message;
  if (!attachments.length) return JSON.stringify(message);
  const parts = [`${JSON.stringify(rest).slice(0, -1)},"attachments":[`];
  attachments.forEach(({ content, ...meta }, i) => {
    parts.push(`${i ? ',' : ''}{"content":"`, content, `",${JSON.stringify(meta).slice(1)}`);
  });
  parts.push(']}');
  return new Blob(parts, { type: 'application/json' });
}

const MAIL_API = 'https://api.cloudflare.com/client/v4/accounts';
const MAIL_TIMEOUT_MS = 15000;

/**
 * Sends the message through the Email Sending REST API. A non-2xx status or success:false is a
 * failure; returns the API's error codes only (numbers and machine strings, never addresses).
 * @returns {Promise<{ok:true}|{ok:false,codes:string[]}>}
 */
async function sendMail(env, message) {
  const account = encodeURIComponent(String(env.FORM_MAIL_ACCOUNT_ID).trim());
  let resp;
  try {
    resp = await fetch(`${MAIL_API}/${account}/email/sending/send`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${String(env.FORM_MAIL_TOKEN).trim()}`,
        'content-type': 'application/json',
      },
      body: messageBody(message),
      signal: AbortSignal.timeout(MAIL_TIMEOUT_MS),
    });
  } catch (e) {
    return { ok: false, codes: [e && e.name === 'TimeoutError' ? 'timeout' : 'network'] };
  }
  let data = null;
  try { data = await resp.json(); } catch (e) { data = null; }
  if (resp.ok && data && data.success === true) return { ok: true };
  const codes = (data && Array.isArray(data.errors) ? data.errors : [])
    .map((er) => [er && er.code, er && er.message]
      .filter((v) => (typeof v === 'number') || (typeof v === 'string' && /^[a-z0-9_.-]{1,80}$/i.test(v)))
      .join(' '))
    .filter(Boolean)
    .slice(0, 5);
  return { ok: false, codes: codes.length ? codes : [`http-${resp.status}`] };
}

/** @returns {Promise<{status:number,error:string}|{attachments:object[]}>} */
async function validateFiles(files, form) {
  if (!files.length) return { attachments: [] };
  const rules = Object.prototype.hasOwnProperty.call(FILE_RULES, form) ? FILE_RULES[form] : null;
  if (!rules) return { status: 400, error: 'files-not-allowed' };
  if (files.length > rules.maxFiles) return { status: 400, error: 'too-many-files' };
  let total = 0;
  const bad = files.map((file) => {
    const name = String(file.name || '');
    const lower = name.toLowerCase();
    total += file.size;
    if (!name || name.length > rules.maxName || /[\x00-\x1f\x7f/\\]/.test(name) // eslint-disable-line no-control-regex
      || [...rules.notAllowed].some((c) => name.includes(c))) return [400, 'invalid-file-name'];
    if (file.size > rules.maxSize) return [413, 'file-too-large'];
    if (!rules.extensions.some((e) => lower.endsWith(e))
      || !rules.types.includes(String(file.type || '').toLowerCase())) return [400, 'invalid-file-type'];
    return null;
  }).find(Boolean);
  if (bad) return { status: bad[0], error: bad[1] };
  if (total > rules.maxTotal) return { status: 413, error: 'files-too-large' };
  // one file at a time: its bytes go once it is encoded
  const attachments = [];
  for (let i = 0; i < files.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const bytes = new Uint8Array(await files[i].arrayBuffer());
    attachments.push({
      content: base64(bytes), filename: files[i].name, type: sniffType(bytes), disposition: 'attachment',
    });
  }
  if (attachments.some((a) => !a.type || !rules.types.includes(a.type))) return { status: 400, error: 'invalid-file-type' };
  return { attachments };
}

/* ---------- mail ---------- */

// the brand sites by their turnsthe.page host label and form id prefix (lh-com: neither)
const BRAND_TAGS = {
  discover: 'lh-discover', ita: 'lh-ita', austrian: 'lh-austrian', airdolomiti: 'lh-airdolomiti',
};
const BRAND_ORIGIN = /^https:\/\/[a-z0-9-]+--(lh-discover|lh-ita|lh-austrian|lh-airdolomiti)--/;

/** The site of a submission (the subject's tag): its origin's, else its form id's, else lh-com. */
export function siteTag(origin, form) {
  const site = String(origin || '').match(BRAND_ORIGIN);
  if (site) return site[1];
  const host = String(origin || '').match(/^https:\/\/([a-z0-9]+)\.turnsthe\.page$/);
  if (host && BRAND_TAGS[host[1]]) return BRAND_TAGS[host[1]];
  const prefix = String(form || '').match(/^([a-z]+)-/);
  return (prefix && BRAND_TAGS[prefix[1]]) || 'lh-com';
}

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

/* ---------- bot check ---------- */

/** Whether the deployment checks tokens (BOT_CHECK on unless set to off). */
export const botCheckOn = (env) => String(env.BOT_CHECK ?? 'on').trim().toLowerCase() !== 'off';

/**
 * Siteverify of a Turnstile token (TURNSTILE_SECRET): true only for success. A missing token or
 * secret, a network error or any other answer is false. Tokens are never logged.
 */
export async function verifyToken(env, token, ip) {
  const response = String(token || '').trim();
  if (!response || response.length > 2048 || !env.TURNSTILE_SECRET) return false;
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response });
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetch(SITEVERIFY, { method: 'POST', body });
    if (!res.ok) return false;
    const outcome = await res.json();
    return Boolean(outcome && outcome.success === true);
  } catch (e) {
    return false;
  }
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

  // with a Content-Length (browsers send one; checked above) the runtime parses the body as it
  // is; without one it is read up to the limit first (one copy of the body less in memory)
  let data;
  if (Number.isFinite(declared) && request.headers.has('content-length')) {
    try {
      data = await request.formData();
    } catch (e) {
      return fail(400, 'invalid-multipart', origin);
    }
  } else {
    const body = await readLimited(request.body, LIMITS.body);
    if (body === null) return fail(413, 'payload-too-large', origin);
    try {
      data = await new Response(body, { headers: { 'content-type': type } }).formData();
    } catch (e) {
      return fail(400, 'invalid-multipart', origin);
    }
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
  if (botCheckOn(env)) {
    if (!env.TURNSTILE_SECRET) return fail(500, 'bot-check-not-configured', origin);
    const ip = request.headers.get('CF-Connecting-IP') || '';
    if (!(await verifyToken(env, text[BOT_TOKEN], ip))) return fail(403, 'bot-check-failed', origin);
  }

  const { form, locale } = text;
  if (!Object.prototype.hasOwnProperty.call(FORMS, form || '')) return fail(400, 'unknown-form', origin);
  if (!LOCALE.test(String(locale || ''))) return fail(400, 'unknown-locale', origin);
  const page = validPage(text.page);
  if (!page) return fail(400, 'invalid-page', origin);
  const checked = validateFields(text.fields);
  if (checked.error) return fail(400, checked.error, origin);
  const filesChecked = await validateFiles(files, form);
  if (filesChecked.error) return fail(filesChecked.status, filesChecked.error, origin);
  // the parsed parts are not needed any more (the files are in the attachments)
  files.length = 0;
  data = null;

  const mode = deliveryMode(env);
  if (mode === 'backends' ? !(isDeliveryConfigured(env) && parseConfig(env.FORM_CONFIG)) : !isMailConfigured(env)) {
    return fail(500, 'not-configured', origin);
  }
  const recipients = resolveRecipients(parseConfig(env.FORM_CONFIG), form, locale);
  if (!recipients) return fail(500, 'no-recipients', origin);

  const title = FORMS[form][locale.endsWith('-de') ? 'de' : 'en'];
  const { fields } = checked;
  const { attachments } = filesChecked;
  const { html, text: plain } = buildMail({
    title, page, time: new Date().toISOString(), fields, files: attachments.map((a) => a.filename),
  });
  const message = {
    from: String(env.FORM_SENDER || '').trim(),
    to: recipients.to,
    subject: recipients.subject || `[${siteTag(origin, form)}] ${title} (${locale})`,
    html,
    text: plain,
  };
  const replyTo = replyToFrom(fields);
  if (replyTo) message.reply_to = replyTo;
  if (attachments.length) message.attachments = attachments;

  const payload = () => ({
    form, locale, page, message, fields, attachments,
  });

  if (mode === 'backends') {
    const delivered = await deliver(env, payload());
    if (!delivered.ok) {
      logDelivery(delivered);
      return json(502, { ok: false, error: 'delivery-failed' }, origin);
    }
    return json(200, { ok: true }, origin);
  }

  const sent = await sendMail(env, message);
  if (!sent.ok) {
    // only the API's error codes: never addresses, values or the token
    // eslint-disable-next-line no-console
    console.error('lh-forms send failed', sent.codes.join(', '));
    return json(502, { ok: false, error: 'send-failed', codes: sent.codes }, origin);
  }
  if (mode === 'email+backends') {
    // the visitor's answer is the e-mail's; the hand-over is logged when it fails
    if (!isDeliveryConfigured(env)) warnOnce('delivery-not-configured');
    else {
      const delivered = await deliver(env, payload());
      if (!delivered.ok) logDelivery(delivered);
    }
  }
  return json(200, { ok: true }, origin);
}

async function handle(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');

  if (origin && !isOriginAllowed(origin, env)) return fail(403, 'origin-not-allowed', null);

  if (request.method === 'OPTIONS') {
    const wanted = (request.headers.get('Access-Control-Request-Method') || '').toUpperCase();
    const ok = (url.pathname === '/submit' && wanted === 'POST') || (['/health', '/config'].includes(url.pathname) && wanted === 'GET');
    if (!origin || !ok) return fail(404, 'not-found', origin);
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (url.pathname === '/health') {
    if (request.method !== 'GET') return fail(405, 'method-not-allowed', origin);
    return json(200, { configured: isConfigured(env) }, origin);
  }

  // the form block's configuration: the bot check switch and the public Turnstile site key
  if (url.pathname === '/config') {
    if (request.method !== 'GET') return fail(405, 'method-not-allowed', origin);
    return json(200, { botCheck: botCheckOn(env) ? 'on' : 'off', turnstileSiteKey: String(env.TURNSTILE_SITE_KEY || '') }, origin);
  }

  if (url.pathname === '/submit') {
    if (request.method !== 'POST') return fail(405, 'method-not-allowed', origin);
    if (!origin) return fail(403, 'origin-not-allowed', null);
    return submit(request, env, origin);
  }

  return fail(404, 'not-found', origin);
}

/**
 * The bot check for other Workers (service binding with entrypoint BotCheck, never a route):
 * lh-edge's www URL /service/secured/api/captcha/verify. verify(token, ip) -> boolean.
 */
export class BotCheck extends WorkerEntrypoint {
  async verify(token, ip = '') {
    return verifyToken(this.env, token, ip);
  }
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
