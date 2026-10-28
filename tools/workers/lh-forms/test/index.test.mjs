import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker, {
  HourlyLimiter, BotCheck, SITEVERIFY, verifyToken, botCheckOn,
} from '../src/index.js';

const ORIGIN = 'https://main--lh-com--moved-permanently.aem.page';
const BASE = 'https://lh-forms.example.com';
const PAGE = 'https://main--lh-com--moved-permanently.aem.page/de/en/feedback-past-flight';
const CONFIG = {
  default: { to: ['default@example.com'], subject: 'Default subject' },
  forms: {
    'feedback-past-flight': {
      'de-de': { to: ['fb-de@example.com'], subject: 'Feedback DE' },
      '*': { to: ['fb-any@example.com', 'not an address'] },
    },
    'refund-form': {
      'gb-en': { to: ['invalid'] },
    },
  },
};

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
const JPG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]);
const PDF = new TextEncoder().encode('%PDF-1.7\n...');

let sent;
let mailCalls;
let mailReply;
let minuteHits;
let limiters;
let verifyCalls;

function memoryStorage() {
  const map = new Map();
  return {
    alarm: null,
    get: async (k) => map.get(k),
    put: async (k, v) => { map.set(k, v); },
    setAlarm: async function setAlarm(t) { this.alarm = t; },
    deleteAll: async () => { map.clear(); },
    map,
  };
}

function hourlyNamespace() {
  return {
    idFromName: (name) => `id:${name}`,
    get: (id) => {
      if (!limiters.has(id)) limiters.set(id, new HourlyLimiter({ storage: memoryStorage() }));
      const obj = limiters.get(id);
      return { fetch: (url, init) => obj.fetch(new Request(url, init)) };
    },
  };
}

// the Email Sending REST API: every call is recorded, the message body is parsed into `sent`
const MAIL_URL = 'https://api.cloudflare.com/client/v4/accounts/acc-123/email/sending/send';
// Cloudflare's published Turnstile test secrets: always passes, always fails, token already spent
const PASS_SECRET = '1x0000000000000000000000000000000AA';
const FAIL_SECRET = '2x0000000000000000000000000000000AA';
const SPENT_SECRET = '3x0000000000000000000000000000000AA';
const DUMMY_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX';
// Siteverify as Cloudflare answers the test secrets
function siteverify(init) {
  const form = new URLSearchParams(String(init.body));
  verifyCalls.push(Object.fromEntries(form));
  const secret = form.get('secret');
  if (secret === 'network') throw new TypeError('fetch failed');
  if (secret === PASS_SECRET) return { success: true, 'error-codes': [] };
  if (secret === FAIL_SECRET) return { success: false, 'error-codes': ['invalid-input-response'] };
  if (secret === SPENT_SECRET) return { success: false, 'error-codes': ['timeout-or-duplicate'] };
  return { success: false, 'error-codes': ['invalid-input-secret'] };
}
globalThis.fetch = async (url, init = {}) => {
  if (String(url) === SITEVERIFY) {
    return new Response(JSON.stringify(siteverify(init)), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  mailCalls.push({ url: String(url), init });
  if (mailReply === 'network') throw new TypeError('fetch failed');
  const { status, body } = mailReply;
  if (status >= 200 && status < 300 && body && body.success) sent.push(JSON.parse(init.body));
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
};
const MAIL_OK = {
  status: 200,
  body: {
    success: true, errors: [], messages: [], result: { delivered: ['x@example.com'], permanent_bounces: [], queued: [] },
  },
};

function makeEnv(extra = {}) {
  return {
    FORM_MAIL_ACCOUNT_ID: 'acc-123',
    FORM_MAIL_TOKEN: 'secret-token-value',
    FORM_SENDER: 'forms-sender@example.com',
    FORM_CONFIG: JSON.stringify(CONFIG),
    // the bot check has its own tests below
    BOT_CHECK: 'off',
    RATE_LIMIT_MINUTE: {
      limit: async ({ key }) => {
        minuteHits.set(key, (minuteHits.get(key) || 0) + 1);
        return { success: minuteHits.get(key) <= 5 };
      },
    },
    HOURLY_LIMITER: hourlyNamespace(),
    ...extra,
  };
}

const FIELDS = [
  {
    section: 'Personal details', label: 'First name', name: 'firstName', value: 'Erika',
  },
  {
    section: 'Personal details', label: 'Email address', name: 'emailAddress', value: 'customer@example.com',
  },
  {
    section: 'Your feedback', label: 'Your feedback', name: 'additionalText', value: 'All good',
  },
];

function submission({
  form = 'feedback-past-flight', locale = 'de-en', page = PAGE, fields = FIELDS, files = [],
  hp, extra = {}, origin = ORIGIN, ip = '203.0.113.7', headers = {},
} = {}) {
  const fd = new FormData();
  if (form !== null) fd.append('form', form);
  if (locale !== null) fd.append('locale', locale);
  if (page !== null) fd.append('page', page);
  if (fields !== null) fd.append('fields', typeof fields === 'string' ? fields : JSON.stringify(fields));
  if (hp !== undefined) fd.append('lh_hp', hp);
  files.forEach(([part, file]) => fd.append(part, file));
  Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
  const h = { 'CF-Connecting-IP': ip, ...headers };
  if (origin) h.Origin = origin;
  return new Request(`${BASE}/submit`, { method: 'POST', headers: h, body: fd });
}

const file = (bytes, name, type) => new File([bytes], name, { type });

async function post(opts = {}, env = makeEnv()) {
  const res = await worker.fetch(submission(opts), env);
  return { res, body: await res.json() };
}

beforeEach(() => {
  sent = [];
  verifyCalls = [];
  mailCalls = [];
  mailReply = MAIL_OK;
  minuteHits = new Map();
  limiters = new Map();
});

test('valid submission sends one mail and answers 200 {ok:true}', async () => {
  const { res, body } = await post();
  assert.equal(res.status, 200);
  assert.deepEqual(body, { ok: true });
  assert.equal(sent.length, 1);
  const m = sent[0];
  assert.equal(m.from, 'forms-sender@example.com');
  assert.deepEqual(m.to, ['fb-any@example.com']);
  assert.equal(m.subject, 'Default subject');
  assert.equal(m.reply_to, 'customer@example.com');
  assert.equal(m.attachments, undefined);
  assert.match(m.html, /<h1>Feedback on a past flight<\/h1>/);
  assert.ok(m.html.includes(PAGE));
  assert.match(m.html, /Time: \d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/);
  assert.equal((m.html.match(/<table/g) || []).length, 2);
  assert.ok(m.html.indexOf('<h2>Personal details</h2>') < m.html.indexOf('<h2>Your feedback</h2>'));
  assert.ok(m.text.startsWith('Feedback on a past flight\nPage: '));
  assert.match(m.text, /== Personal details ==\nFirst name: Erika\nEmail address: customer@example.com/);
  assert.match(m.text, /Time: \d{4}-\d\d-\d\dT/);
});

test('recipients: form+locale entry wins with its subject', async () => {
  await post({ locale: 'de-de' });
  assert.deepEqual(sent[0].to, ['fb-de@example.com']);
  assert.equal(sent[0].subject, 'Feedback DE');
  assert.match(sent[0].html, /<h1>Feedback zu einem vergangenen Flug<\/h1>/);
});

test('recipients: form "*" entry, invalid addresses dropped, default subject', async () => {
  await post({ locale: 'at-de' });
  assert.deepEqual(sent[0].to, ['fb-any@example.com']);
  assert.equal(sent[0].subject, 'Default subject');
});

test('a root beyond the four (ch-de): accepted, the form "*" recipients, the German title', async () => {
  const { res } = await post({ locale: 'ch-de' });
  assert.equal(res.status, 200);
  assert.deepEqual(sent[0].to, ['fb-any@example.com']);
  assert.match(sent[0].html, /<h1>Feedback zu einem vergangenen Flug<\/h1>/);
});

test('recipients: entry without a valid address falls through to default', async () => {
  const { res } = await post({ form: 'refund-form', locale: 'gb-en' });
  assert.equal(res.status, 200);
  assert.deepEqual(sent[0].to, ['default@example.com']);
  await post({ form: 'group-travel', locale: 'de-en' });
  assert.deepEqual(sent[1].to, ['default@example.com']);
});

test('subject is generated when the config has none', async () => {
  const env = makeEnv({ FORM_CONFIG: JSON.stringify({ default: { to: 'only@example.com' } }) });
  await post({ form: 'group-travel', locale: 'de-de' }, env);
  assert.equal(sent[0].subject, '[lh-com] Gruppenreisen (de-de)');
  assert.deepEqual(sent[0].to, ['only@example.com']);
  await post({ form: 'refund-form', locale: 'gb-en' }, env);
  assert.equal(sent[1].subject, '[lh-com] Refunds (gb-en)');
});

test('no valid recipient → 500 and nothing sent', async () => {
  const env = makeEnv({ FORM_CONFIG: JSON.stringify({ default: { to: ['nope'] }, forms: {} }) });
  const { res, body } = await post({}, env);
  assert.equal(res.status, 500);
  assert.deepEqual(body, { ok: false, error: 'no-recipients' });
  assert.equal(sent.length, 0);
});

test('missing configuration → 500 not-configured and nothing sent', async () => {
  const cases = [{ FORM_SENDER: undefined }, { FORM_CONFIG: '{not json' }, { FORM_MAIL_TOKEN: undefined }, { FORM_MAIL_ACCOUNT_ID: '' }];
  // eslint-disable-next-line no-restricted-syntax
  for (const extra of cases) {
    // eslint-disable-next-line no-await-in-loop
    const { res, body } = await post({}, makeEnv(extra));
    assert.equal(res.status, 500);
    assert.deepEqual(body, { ok: false, error: 'not-configured' });
  }
  assert.equal(sent.length, 0);
});

test('values, labels and sections are HTML-escaped', async () => {
  const fields = [
    {
      section: '<b>S&S</b>', label: 'Label "<i>"', name: 'x', value: '<script>alert("x")</script> & \'y\'\nline 2',
    },
  ];
  await post({ fields });
  const { html, text } = sent[0];
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<b>S&S</b>'));
  assert.ok(html.includes('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;<br>line 2'));
  assert.ok(html.includes('<h2>&lt;b&gt;S&amp;S&lt;/b&gt;</h2>'));
  assert.ok(html.includes('Label &quot;&lt;i&gt;&quot;'));
  assert.ok(text.includes('<script>alert("x")</script>'));
});

test('Reply-To: first e-mail-like field with a valid address', async () => {
  await post({
    fields: [
      {
        section: 's', label: 'E-Mail', name: 'contact', value: 'not-an-address',
      },
      {
        section: 's', label: 'Repeat', name: 'mailRepeat', value: ' second@example.com ',
      },
      {
        section: 's', label: 'Email address', name: 'emailAddress', value: 'third@example.com',
      },
    ],
  });
  assert.equal(sent[0].reply_to, 'second@example.com');
});

test('Reply-To absent without a valid e-mail field', async () => {
  await post({
    fields: [
      {
        section: 's', label: 'Name', name: 'name', value: 'someone@example.com',
      },
      {
        section: 's', label: 'Email', name: 'email', value: 'broken@',
      },
    ],
  });
  assert.equal(sent.length, 1);
  assert.equal('reply_to' in sent[0], false);
});

test('honeypot filled → 200 {ok:true}, nothing sent', async () => {
  const { res, body } = await post({ hp: 'http://spam.example.com' });
  assert.equal(res.status, 200);
  assert.deepEqual(body, { ok: true });
  assert.equal(sent.length, 0);
  const empty = await post({ hp: '' });
  assert.equal(empty.res.status, 200);
  assert.equal(sent.length, 1);
});

test('disallowed origin or no Origin on POST → 403', async () => {
  const bad = await post({ origin: 'https://evil.example.com' });
  assert.equal(bad.res.status, 403);
  assert.deepEqual(bad.body, { ok: false, error: 'origin-not-allowed' });
  assert.equal(bad.res.headers.get('access-control-allow-origin'), null);
  const none = await post({ origin: null });
  assert.equal(none.res.status, 403);
  const other = await post({ origin: 'https://main--other--moved-permanently.aem.page' });
  assert.equal(other.res.status, 403);
  assert.equal(sent.length, 0);
});

test('allowed origins: aem.live, DA preview, lhcom.bbird.live and its twin, localhost:3000', async () => {
  const origins = [
    'https://feat-x--lh-com--moved-permanently.aem.live',
    'https://main--lh-flynet--moved-permanently.aem.page',
    'https://main--lh-com--moved-permanently.preview.da.live',
    'https://lhcom.bbird.live',
    'https://lufthansa.turnsthe.page',
    'http://localhost:3000',
  ];
  const results = await Promise.all(origins.map((origin, i) => post({ origin, ip: `198.51.100.${i}` })));
  results.forEach(({ res }, i) => {
    assert.equal(res.status, 200, origins[i]);
    assert.equal(res.headers.get('access-control-allow-origin'), origins[i]);
  });
});

test('unknown form, locale, page or bad fields → 400, nothing sent', async () => {
  const cases = [
    [{ form: 'contact-us' }, 'unknown-form'],
    [{ form: '__proto__' }, 'unknown-form'],
    [{ form: null }, 'unknown-form'],
    [{ locale: 'fr_FR' }, 'unknown-locale'],
    [{ locale: 'de-de-x' }, 'unknown-locale'],
    [{ locale: '' }, 'unknown-locale'],
    [{ page: 'data:text/html,hi' }, 'invalid-page'],
    [{ page: 'not a url' }, 'invalid-page'],
    [{ fields: null }, 'missing-fields'],
    [{ fields: '{"a":1}' }, 'invalid-fields'],
    [{ fields: 'not json' }, 'invalid-fields'],
    [{
      fields: [{
        section: 's', label: 'l', name: 'n', value: 1,
      }],
    }, 'invalid-fields'],
    [{ fields: [{ section: 's', label: 'l', name: 'n' }] }, 'invalid-fields'],
    [{
      fields: [{
        section: 's', label: 'l', name: 'n', value: 'x'.repeat(10001),
      }],
    }, 'invalid-fields'],
    [{
      fields: Array(401).fill({
        section: '', label: 'l', name: 'n', value: '',
      }),
    }, 'invalid-fields'],
    [{
      fields: [{
        section: 's', label: 'l', name: 'n', value: 'x'.repeat(9000),
      }].concat(Array(30).fill({
        section: 's', label: 'l', name: 'n', value: 'x'.repeat(9000),
      })),
    }, 'fields-too-large'],
    [{ extra: { comment: 'stray text part' } }, 'invalid-parts'],
  ];
  const results = await Promise.all(cases.map(([opts], i) => post({ ...opts, ip: `192.0.2.${i}` })));
  results.forEach(({ res, body }, i) => {
    assert.equal(res.status, 400, JSON.stringify(cases[i][0]).slice(0, 80));
    assert.deepEqual(body, { ok: false, error: cases[i][1] });
  });
  assert.equal(sent.length, 0);
});

test('non-multipart body → 400', async () => {
  const res = await worker.fetch(new Request(`${BASE}/submit`, {
    method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json' }, body: '{}',
  }), makeEnv());
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { ok: false, error: 'expected-multipart' });
});

test('Content-Length over 6 MB → 413 before reading', async () => {
  const req = submission({ headers: { 'Content-Length': String(6 * 1000 * 1000 + 1) } });
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 413);
  assert.deepEqual(await res.json(), { ok: false, error: 'payload-too-large' });
  assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal(minuteHits.size, 0);
});

test('body over 6 MB without Content-Length → 413 while reading', async () => {
  let pulled = 0;
  let cancelled = false;
  const chunk = new Uint8Array(1000 * 1000);
  const body = new ReadableStream({
    pull(controller) {
      pulled += 1;
      controller.enqueue(chunk);
      if (pulled > 20) controller.close();
    },
    cancel() { cancelled = true; },
  });
  const req = new Request(`${BASE}/submit`, {
    method: 'POST',
    headers: { Origin: ORIGIN, 'Content-Type': 'multipart/form-data; boundary=x' },
    body,
    duplex: 'half',
  });
  assert.equal(req.headers.get('content-length'), null);
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 413);
  assert.deepEqual(await res.json(), { ok: false, error: 'payload-too-large' });
  assert.ok(cancelled);
  assert.ok(pulled <= 8);
  assert.equal(sent.length, 0);
});

test('rate limit: 6th submission in a minute → 429', async () => {
  const env = makeEnv();
  const statuses = [];
  // eslint-disable-next-line no-restricted-syntax
  for (let i = 0; i < 6; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    statuses.push((await post({}, env)).res.status);
  }
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
  assert.equal(sent.length, 5);
  const other = await post({ ip: '203.0.113.99' }, env);
  assert.equal(other.res.status, 200);
  assert.deepEqual(minuteHits.get('203.0.113.7'), 6);
});

test('rate limit: 21st submission in an hour → 429 (Durable Object)', async () => {
  const env = makeEnv({ RATE_LIMIT_MINUTE: { limit: async () => ({ success: true }) } });
  const statuses = [];
  // eslint-disable-next-line no-restricted-syntax
  for (let i = 0; i < 21; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    statuses.push((await post({}, env)).res.status);
  }
  assert.deepEqual(statuses.slice(0, 20), Array(20).fill(200));
  assert.equal(statuses[20], 429);
  const last = await post({}, env);
  assert.deepEqual(last.body, { ok: false, error: 'rate-limited' });
  assert.equal(sent.length, 20);
});

test('HourlyLimiter: sliding hour window and cleanup alarm', async () => {
  const realNow = Date.now;
  let now = 1_000_000_000_000;
  Date.now = () => now;
  try {
    const storage = memoryStorage();
    const limiter = new HourlyLimiter({ storage });
    const hit = async () => (await (await limiter.fetch(new Request('https://hourly-limiter/hit?limit=3', { method: 'POST' }))).json()).success;
    assert.equal(await hit(), true);
    now += 20 * 60 * 1000;
    assert.equal(await hit(), true);
    assert.equal(await hit(), true);
    assert.equal(await hit(), false);
    assert.equal(storage.alarm, now + 3600 * 1000);
    now += 41 * 60 * 1000; // the first hit is now older than an hour
    assert.equal(await hit(), true);
    assert.equal(await hit(), false);
    await limiter.alarm();
    assert.equal(storage.map.size, 0);
  } finally {
    Date.now = realNow;
  }
});

test('files on feedback-past-flight become attachments', async () => {
  const { res } = await post({
    files: [['Attachments', file(PNG, 'photo.png', 'image/png')],
      ['Attachments', file(JPG, 'scan.JPEG', 'image/jpeg')],
      ['receipt', file(PDF, 'receipt.pdf', 'application/pdf')]],
  });
  assert.equal(res.status, 200);
  const { attachments, html, text } = sent[0];
  assert.equal(attachments.length, 3);
  assert.deepEqual(attachments.map((a) => [a.filename, a.type, a.disposition]), [
    ['photo.png', 'image/png', 'attachment'],
    ['scan.JPEG', 'image/jpeg', 'attachment'],
    ['receipt.pdf', 'application/pdf', 'attachment'],
  ]);
  assert.equal(typeof attachments[0].content, 'string');
  assert.deepEqual(new Uint8Array(Buffer.from(attachments[0].content, 'base64')), PNG);
  assert.ok(html.includes('<li>receipt.pdf</li>'));
  assert.ok(text.includes('== Attachments ==\nphoto.png'));
});

test('an empty file input (browser: filename="") is ignored', async () => {
  const b = 'xBOUNDARYx';
  const part = (name, value, extra = '') => `--${b}\r\nContent-Disposition: form-data; name="${name}"${extra}\r\n\r\n${value}\r\n`;
  const body = `${part('form', 'group-travel') + part('locale', 'de-en') + part('page', PAGE)
    + part('fields', JSON.stringify(FIELDS))
    + part('Attachments', '', '; filename=""\r\nContent-Type: application/octet-stream')}--${b}--\r\n`;
  const res = await worker.fetch(new Request(`${BASE}/submit`, {
    method: 'POST',
    headers: { Origin: ORIGIN, 'Content-Type': `multipart/form-data; boundary=${b}` },
    body,
  }), makeEnv());
  assert.equal(res.status, 200);
  assert.equal(sent[0].attachments, undefined);
});

test('files on other forms → 400', async () => {
  const { res, body } = await post({ form: 'refund-form', files: [['Attachments', file(PDF, 'a.pdf', 'application/pdf')]] });
  assert.equal(res.status, 400);
  assert.deepEqual(body, { ok: false, error: 'files-not-allowed' });
  assert.equal(sent.length, 0);
});

test('file rules of the live form: count, type, name, size, total', async () => {
  const pdf = (name = 'a.pdf', size = 0) => {
    const bytes = new Uint8Array(Math.max(size, PDF.length));
    bytes.set(PDF);
    return ['Attachments', file(bytes, name, 'application/pdf')];
  };
  const cases = [
    [[pdf(), pdf(), pdf(), pdf(), pdf(), pdf()], 400, 'too-many-files'],
    [[['Attachments', file(PDF, 'a.exe', 'application/pdf')]], 400, 'invalid-file-type'],
    [[['Attachments', file(PDF, 'a.pdf', 'text/plain')]], 400, 'invalid-file-type'],
    [[['Attachments', file(new TextEncoder().encode('MZ...'), 'fake.png', 'image/png')]], 400, 'invalid-file-type'],
    [[pdf('bad#name.pdf')], 400, 'invalid-file-name'],
    [[pdf('bad(1).pdf')], 400, 'invalid-file-name'],
    [[pdf('a.pdf', 3700001)], 413, 'file-too-large'],
    [[pdf('a.pdf', 2300000), pdf('b.pdf', 2300000)], 413, 'files-too-large'],
    [[pdf('a.pdf', 2000000), pdf('b.pdf', 1500001)], 413, 'files-too-large'],
  ];
  const results = await Promise.all(cases.map(([files], i) => post({ files, ip: `192.0.2.${100 + i}` })));
  results.forEach(({ res, body }, i) => {
    assert.equal(res.status, cases[i][1], cases[i][2]);
    assert.deepEqual(body, { ok: false, error: cases[i][2] });
  });
  assert.equal(sent.length, 0);
  // 3.5 MB in total before base64 (the JSON message must stay under 5 MiB)
  const ok = await post({ files: [pdf('a.pdf', 2000000), pdf('b.pdf', 1500000)], ip: '192.0.2.200' });
  assert.equal(ok.res.status, 200);
  assert.equal(sent[0].attachments.length, 2);
});

test('send failure → 502 and the log carries no address or value', async () => {
  const logs = [];
  // eslint-disable-next-line no-console
  const realError = console.error;
  // eslint-disable-next-line no-console
  console.error = (...args) => logs.push(args.join(' '));
  try {
    mailReply = {
      status: 400,
      body: {
        success: false,
        errors: [{ code: 10001, message: 'email.sending.error.invalid_request_schema' }, { code: 10002, message: 'sender forms-sender@example.com not allowed' }],
        messages: [],
        result: null,
      },
    };
    const { res, body } = await post({}, makeEnv());
    assert.equal(res.status, 502);
    assert.deepEqual(body, { ok: false, error: 'send-failed', codes: ['10001 email.sending.error.invalid_request_schema', '10002'] });
    assert.ok(!JSON.stringify(body).includes('@'));
  } finally {
    // eslint-disable-next-line no-console
    console.error = realError;
  }
  assert.equal(logs.length, 1);
  assert.ok(logs[0].includes('10001'));
  assert.ok(!logs.join('\n').includes('secret-token-value'));
  assert.ok(!logs.join('\n').includes('@'));
  assert.ok(!logs.join('\n').includes('Erika'));
});

test('/health reports configured without showing addresses', async () => {
  const yes = await worker.fetch(new Request(`${BASE}/health`), makeEnv());
  assert.equal(yes.status, 200);
  const yesText = await yes.text();
  assert.deepEqual(JSON.parse(yesText), { configured: true });
  assert.ok(!yesText.includes('@'));

  const variants = [
    {},
    { FORM_SENDER: undefined },
    { FORM_CONFIG: undefined },
    { FORM_CONFIG: 'not json' },
    { FORM_CONFIG: '[]' },
    { FORM_MAIL_ACCOUNT_ID: undefined },
    { FORM_MAIL_TOKEN: undefined },
  ];
  const results = await Promise.all(variants.map((v, i) => worker.fetch(
    new Request(`${BASE}/health`),
    i === 0 ? {} : makeEnv(v),
  )));
  await Promise.all(results.map(async (res) => {
    assert.equal(res.status, 200);
    const t = await res.text();
    assert.deepEqual(JSON.parse(t), { configured: false });
    assert.ok(!t.includes('@'));
  }));
});

test('CORS: responses echo the origin, preflight 204, unknown routes 404', async () => {
  const { res } = await post();
  assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal(res.headers.get('vary'), 'Origin');
  assert.equal(res.headers.get('cache-control'), 'no-store');

  const pre = await worker.fetch(new Request(`${BASE}/submit`, {
    method: 'OPTIONS',
    headers: { Origin: ORIGIN, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
  }), makeEnv());
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal(pre.headers.get('access-control-allow-methods'), 'GET,POST,OPTIONS');
  assert.equal(pre.headers.get('access-control-allow-headers'), 'Content-Type');
  assert.equal(pre.headers.get('access-control-max-age'), '86400');

  const preBad = await worker.fetch(new Request(`${BASE}/submit`, {
    method: 'OPTIONS', headers: { Origin: 'https://evil.example.com', 'Access-Control-Request-Method': 'POST' },
  }), makeEnv());
  assert.equal(preBad.status, 403);

  const health = await worker.fetch(new Request(`${BASE}/health`, { headers: { Origin: 'http://localhost:3000' } }), makeEnv());
  assert.equal(health.headers.get('access-control-allow-origin'), 'http://localhost:3000');

  const nf = await worker.fetch(new Request(`${BASE}/other`, { headers: { Origin: ORIGIN } }), makeEnv());
  assert.equal(nf.status, 404);
  assert.deepEqual(await nf.json(), { ok: false, error: 'not-found' });
  const getSubmit = await worker.fetch(new Request(`${BASE}/submit`, { headers: { Origin: ORIGIN } }), makeEnv());
  assert.equal(getSubmit.status, 405);
});

test('the mail goes to the REST API of the mail account with the token, as JSON', async () => {
  const { res } = await post();
  assert.equal(res.status, 200);
  assert.equal(mailCalls.length, 1);
  const { url, init } = mailCalls[0];
  assert.equal(url, MAIL_URL);
  assert.equal(init.method, 'POST');
  assert.equal(init.headers.authorization, 'Bearer secret-token-value');
  assert.equal(init.headers['content-type'], 'application/json');
  const m = JSON.parse(init.body);
  assert.deepEqual(Object.keys(m).sort(), ['from', 'html', 'reply_to', 'subject', 'text', 'to']);
  assert.equal(m.from, 'forms-sender@example.com');
});

test('success:false with 200, a non-2xx status and a network error are failed sends', async () => {
  const replies = [
    { status: 200, body: { success: false, errors: [{ code: 10200, message: 'email.sending.error.sender_domain_not_available' }] } },
    { status: 503, body: {} },
    'network',
  ];
  const expected = [['10200 email.sending.error.sender_domain_not_available'], ['http-503'], ['network']];
  for (let i = 0; i < replies.length; i += 1) {
    mailReply = replies[i];
    // eslint-disable-next-line no-await-in-loop
    const { res, body } = await post({ ip: `198.51.100.${i + 1}` });
    assert.equal(res.status, 502);
    assert.deepEqual(body.codes, expected[i]);
  }
  assert.equal(sent.length, 0);
});

test('the honeypot and a missing config never call the API', async () => {
  await post({ hp: 'bot' });
  await post({ ip: '198.51.100.50' }, makeEnv({ FORM_MAIL_TOKEN: '' }));
  assert.equal(mailCalls.length, 0);
});

/* ---------- FORM_DELIVERY: hand-over to lh-backends ---------- */

/** A fake binding DELIVERY: records each call and answers with the given status and body. */
function fakeDelivery(status = 200, body = { ok: true, state: 'delivered' }) {
  const calls = [];
  return {
    calls,
    fetch: async (url, init = {}) => {
      calls.push({ url: String(url), init, body: JSON.parse(init.body) });
      if (status === 'network') throw new TypeError('fetch failed');
      return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    },
  };
}

async function quietly(fn) {
  const logs = [];
  // eslint-disable-next-line no-console
  const real = [console.error, console.warn, console.log];
  // eslint-disable-next-line no-console
  console.error = (...a) => logs.push(a.join(' '));
  // eslint-disable-next-line no-console
  console.warn = (...a) => logs.push(a.join(' '));
  // eslint-disable-next-line no-console
  console.log = (...a) => logs.push(a.join(' '));
  try {
    return { result: await fn(), logs };
  } finally {
    // eslint-disable-next-line no-console
    [console.error, console.warn, console.log] = real;
  }
}

test('delivery off (email, unset, unknown value): the binding is never called', async () => {
  const values = [undefined, 'email', 'smtp'];
  const runs = await Promise.all(values.map(async (FORM_DELIVERY) => {
    const DELIVERY = fakeDelivery();
    const { result } = await quietly(() => post({}, makeEnv({ FORM_DELIVERY, DELIVERY, FORMS_DELIVERY_TOKEN: 'tok-1' })));
    return { DELIVERY, result };
  }));
  runs.forEach(({ DELIVERY, result }) => {
    assert.equal(result.res.status, 200);
    assert.equal(DELIVERY.calls.length, 0);
  });
  assert.equal(sent.length, 3);
});

test('email+backends: one hand-over after a sent mail, none after a failed one; its failure keeps the answer', async () => {
  const DELIVERY = fakeDelivery();
  const env = makeEnv({ FORM_DELIVERY: 'email+backends', DELIVERY, FORMS_DELIVERY_TOKEN: 'tok-1' });
  const ok = await post({}, env);
  assert.equal(ok.res.status, 200);
  assert.equal(sent.length, 1);
  assert.equal(DELIVERY.calls.length, 1);

  mailReply = { status: 500, body: { success: false, errors: [], messages: [] } };
  const { result: failed } = await quietly(() => post({ ip: '203.0.113.8' }, env));
  assert.equal(failed.res.status, 502);
  assert.equal(DELIVERY.calls.length, 1);

  mailReply = MAIL_OK;
  const broken = fakeDelivery(500, { ok: false, state: 'failed', error: 'upstream-unavailable' });
  const { result, logs } = await quietly(() => post({ ip: '203.0.113.9' }, makeEnv({ FORM_DELIVERY: 'email+backends', DELIVERY: broken, FORMS_DELIVERY_TOKEN: 'tok-1' })));
  assert.equal(result.res.status, 200);
  assert.deepEqual(result.body, { ok: true });
  assert.equal(broken.calls.length, 1);
  assert.equal(logs.length, 1);
  assert.match(logs[0], /500 upstream-unavailable/);
});

test('email+backends without binding or token: the mail goes, no hand-over, /health not configured', async () => {
  const { result } = await quietly(() => post({}, makeEnv({ FORM_DELIVERY: 'email+backends' })));
  assert.equal(result.res.status, 200);
  assert.equal(sent.length, 1);
  const health = await worker.fetch(new Request(`${BASE}/health`), makeEnv({ FORM_DELIVERY: 'email+backends', DELIVERY: fakeDelivery() }));
  assert.deepEqual(await health.json(), { configured: false });
});

test('backends: the hand-over instead of the mail; 200 and 202 are ok, anything else 502', async () => {
  const envFor = (DELIVERY) => makeEnv({
    FORM_DELIVERY: 'backends', DELIVERY, FORMS_DELIVERY_TOKEN: 'tok-1', FORM_MAIL_ACCOUNT_ID: undefined, FORM_MAIL_TOKEN: undefined, FORM_SENDER: undefined,
  });
  const cases = [[200, 200], [202, 200], [500, 502], [400, 502], ['network', 502]];
  const ips = ['203.0.113.10', '203.0.113.11', '203.0.113.12', '203.0.113.13', '203.0.113.14'];
  const runs = await Promise.all(cases.map(async ([reply, expected], i) => {
    const DELIVERY = fakeDelivery(reply, reply === 200 || reply === 202 ? { ok: true, state: reply === 202 ? 'queued' : 'delivered' } : { ok: false, state: 'failed', error: 'rejected' });
    const { result } = await quietly(() => post({ ip: ips[i] }, envFor(DELIVERY)));
    return {
      result, expected, DELIVERY, reply,
    };
  }));
  runs.forEach(({ result, expected, DELIVERY }) => {
    assert.equal(result.res.status, expected);
    assert.deepEqual(result.body, expected === 200 ? { ok: true } : { ok: false, error: 'delivery-failed' });
    assert.equal(DELIVERY.calls.length, 1);
  });
  assert.equal(mailCalls.length, 0);
  assert.equal(sent.length, 0);
  const health = await worker.fetch(new Request(`${BASE}/health`), envFor(fakeDelivery()));
  assert.deepEqual(await health.json(), { configured: true });
});

test('backends without binding or token: 500 not-configured, /health not configured', async () => {
  const env = makeEnv({ FORM_DELIVERY: 'backends' });
  const { res, body } = await post({}, env);
  assert.equal(res.status, 500);
  assert.equal(body.error, 'not-configured');
  const health = await worker.fetch(new Request(`${BASE}/health`), env);
  assert.deepEqual(await health.json(), { configured: false });
});

test('the hand-over: token header, JSON shape, and nothing but codes in the log', async () => {
  const DELIVERY = fakeDelivery(503, { ok: false, state: 'failed', error: 'down' });
  const { result, logs } = await quietly(() => post({
    files: [['file1', file(PNG, 'receipt.png', 'image/png')]],
  }, makeEnv({ FORM_DELIVERY: 'backends', DELIVERY, FORMS_DELIVERY_TOKEN: 'tok-secret-1' })));
  assert.equal(result.res.status, 502);
  const [call] = DELIVERY.calls;
  assert.match(call.url, /\/_lh-backends\/forms\/deliver$/);
  assert.equal(call.init.method, 'POST');
  assert.equal(call.init.headers['content-type'], 'application/json');
  assert.equal(call.init.headers['x-forms-delivery-token'], 'tok-secret-1');
  assert.ok(call.init.signal);
  assert.deepEqual(Object.keys(call.body).sort(), ['attachments', 'fields', 'form', 'locale', 'message', 'page']);
  assert.equal(call.body.form, 'feedback-past-flight');
  assert.equal(call.body.locale, 'de-en');
  assert.equal(call.body.page, PAGE);
  assert.deepEqual(Object.keys(call.body.message).sort(), ['attachments', 'from', 'html', 'reply_to', 'subject', 'text', 'to']);
  assert.deepEqual(call.body.fields.map((f) => f.name), ['firstName', 'emailAddress', 'additionalText']);
  // the list built for the mail, as it is (filename, type, Base64 content, disposition)
  assert.ok(['content', 'filename', 'type'].every((k) => k in call.body.attachments[0]));
  const all = logs.join('\n');
  assert.match(all, /503 down/);
  ['tok-secret-1', '@', 'Erika', 'receipt.png'].forEach((secret) => assert.ok(!all.includes(secret), secret));
});

/* ---------- bot check (Turnstile, Cloudflare's test keys) ---------- */

const botEnv = (extra = {}) => makeEnv({ BOT_CHECK: 'on', TURNSTILE_SECRET: PASS_SECRET, ...extra });

test('bot check on: a passing token sends; Siteverify gets secret, token and IP', async () => {
  const { res, body } = await post({ extra: { 'cf-turnstile-response': DUMMY_TOKEN } }, botEnv());
  assert.equal(res.status, 200);
  assert.deepEqual(body, { ok: true });
  assert.equal(sent.length, 1);
  assert.deepEqual(verifyCalls, [{ secret: PASS_SECRET, response: DUMMY_TOKEN, remoteip: '203.0.113.7' }]);
  assert.ok(!JSON.stringify(sent[0]).includes(DUMMY_TOKEN), 'the token is not part of the mail');
});

test('bot check on: a missing, failing or spent token → 403 bot-check-failed, nothing sent', async () => {
  const cases = [
    [{}, botEnv()],
    [{ extra: { 'cf-turnstile-response': '' } }, botEnv()],
    [{ extra: { 'cf-turnstile-response': DUMMY_TOKEN } }, botEnv({ TURNSTILE_SECRET: FAIL_SECRET })],
    [{ extra: { 'cf-turnstile-response': DUMMY_TOKEN } }, botEnv({ TURNSTILE_SECRET: SPENT_SECRET })],
    [{ extra: { 'cf-turnstile-response': 'x'.repeat(2049) } }, botEnv()],
    [{ extra: { 'cf-turnstile-response': DUMMY_TOKEN } }, botEnv({ TURNSTILE_SECRET: 'network' })],
  ];
  const results = await Promise.all(cases.map(([opts, env], i) => post({ ...opts, ip: `198.51.100.${i}` }, env)));
  results.forEach(({ res, body }, i) => {
    assert.equal(res.status, 403, `case ${i}`);
    assert.deepEqual(body, { ok: false, error: 'bot-check-failed' });
    assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN, 'the block can read the answer');
  });
  assert.equal(sent.length, 0);
  assert.equal(verifyCalls.length, 3, 'no Siteverify call without a usable token');
});

test('bot check on by default; without the secret → 500 bot-check-not-configured', async () => {
  assert.equal(botCheckOn({}), true);
  assert.equal(botCheckOn({ BOT_CHECK: ' OFF ' }), false);
  assert.equal(botCheckOn({ BOT_CHECK: 'yes' }), true);
  const { res, body } = await post({ extra: { 'cf-turnstile-response': DUMMY_TOKEN } }, makeEnv({ BOT_CHECK: undefined }));
  assert.equal(res.status, 500);
  assert.deepEqual(body, { ok: false, error: 'bot-check-not-configured' });
  assert.equal(sent.length, 0);
});

test('bot check off: no token needed, Siteverify never called; the honeypot still wins', async () => {
  assert.equal((await post({}, makeEnv({ TURNSTILE_SECRET: FAIL_SECRET }))).res.status, 200);
  assert.equal(sent.length, 1);
  const trap = await post({ hp: 'bot', ip: '198.51.100.50' }, botEnv({ TURNSTILE_SECRET: FAIL_SECRET }));
  assert.deepEqual([trap.res.status, trap.body], [200, { ok: true }]);
  assert.equal(sent.length, 1);
  assert.equal(verifyCalls.length, 0);
});

test('GET /config: the switch and the public site key, CORS for the block', async () => {
  const get = (env) => worker.fetch(new Request(`${BASE}/config`, { headers: { Origin: ORIGIN } }), env);
  const on = await get(botEnv({ TURNSTILE_SITE_KEY: '1x00000000000000000000AA' }));
  assert.equal(on.status, 200);
  assert.deepEqual(await on.json(), { botCheck: 'on', turnstileSiteKey: '1x00000000000000000000AA' });
  assert.equal(on.headers.get('access-control-allow-origin'), ORIGIN);
  const off = await get(makeEnv());
  assert.deepEqual(await off.json(), { botCheck: 'off', turnstileSiteKey: '' });
  const text = JSON.stringify(await (await get(botEnv())).json());
  assert.ok(!text.includes(PASS_SECRET), 'never the secret');
  const pre = await worker.fetch(new Request(`${BASE}/config`, {
    method: 'OPTIONS', headers: { Origin: ORIGIN, 'Access-Control-Request-Method': 'GET' },
  }), makeEnv());
  assert.equal(pre.status, 204);
  const wrong = await worker.fetch(new Request(`${BASE}/config`, { method: 'POST', headers: { Origin: ORIGIN } }), makeEnv());
  assert.equal(wrong.status, 405);
});

test('BotCheck entrypoint (service binding): verify(token, ip) with the test keys', async () => {
  const pass = new BotCheck({}, { TURNSTILE_SECRET: PASS_SECRET });
  const fail = new BotCheck({}, { TURNSTILE_SECRET: FAIL_SECRET });
  assert.equal(await pass.verify(DUMMY_TOKEN, '203.0.113.9'), true);
  assert.equal(await pass.verify(''), false);
  assert.equal(await fail.verify(DUMMY_TOKEN), false);
  assert.equal(await new BotCheck({}, {}).verify(DUMMY_TOKEN), false, 'no secret: false');
  assert.equal(await verifyToken({ TURNSTILE_SECRET: PASS_SECRET }, DUMMY_TOKEN), true);
  assert.deepEqual(verifyCalls.map((c) => c.remoteip), ['203.0.113.9', undefined, undefined]);
});
