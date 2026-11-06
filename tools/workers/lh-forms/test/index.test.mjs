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
  // the body: a string, or a Blob when the message has attachments (messageBody)
  if (status >= 200 && status < 300 && body && body.success) sent.push(JSON.parse(typeof init.body === 'string' ? init.body : await init.body.text()));
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

test('allowed origins: aem.live, DA preview, the main host lufthansa.turnsthe.page, localhost:3000; the retired lhcom.bbird.live refused', async () => {
  const origins = [
    'https://feat-x--lh-com--moved-permanently.aem.live',
    'https://main--lh-flynet--moved-permanently.aem.page',
    'https://main--lh-com--moved-permanently.preview.da.live',
    'https://lufthansa.turnsthe.page',
    'http://localhost:3000',
  ];
  const results = await Promise.all(origins.map((origin, i) => post({ origin, ip: `198.51.100.${i}` })));
  results.forEach(({ res }, i) => {
    assert.equal(res.status, 200, origins[i]);
    assert.equal(res.headers.get('access-control-allow-origin'), origins[i]);
  });
  const retired = await post({ origin: 'https://lhcom.bbird.live', ip: '198.51.100.99' });
  assert.equal(retired.res.status, 403);
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

test('Content-Length over 19 MB → 413 before reading', async () => {
  const req = submission({ headers: { 'Content-Length': String(19 * 1000 * 1000 + 1) } });
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 413);
  assert.deepEqual(await res.json(), { ok: false, error: 'payload-too-large' });
  assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal(minuteHits.size, 0);
});

test('body over 19 MB without Content-Length → 413 while reading', async () => {
  let pulled = 0;
  let cancelled = false;
  const chunk = new Uint8Array(1000 * 1000);
  const body = new ReadableStream({
    pull(controller) {
      pulled += 1;
      controller.enqueue(chunk);
      if (pulled > 30) controller.close();
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
  assert.ok(pulled <= 21);
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

test('files a field already names (the form\'s file field, its own label) are listed once: not again under Attachments', async () => {
  const fields = [...FIELDS, {
    section: '', label: 'Uploaded files', name: 'attachments', value: 'photo.png, receipt.pdf',
  }];
  const { res } = await post({
    fields,
    files: [['file_1', file(PNG, 'photo.png', 'image/png')],
      ['file_2', file(PDF, 'receipt.pdf', 'application/pdf')],
      ['file_3', file(JPG, 'scan.JPEG', 'image/jpeg')]],
  });
  assert.equal(res.status, 200);
  const { attachments, html, text } = sent[0];
  assert.equal(attachments.length, 3, 'every file attached');
  assert.equal((html.match(/photo\.png/g) || []).length, 1, 'photo.png once (its field)');
  assert.equal((text.match(/receipt\.pdf/g) || []).length, 1);
  assert.ok(html.includes('Uploaded files'));
  // a file no field names: under Attachments as before
  assert.ok(html.includes('<h2>Attachments</h2><ul><li>scan.JPEG</li></ul>'), html);
  assert.ok(text.includes('== Attachments ==\nscan.JPEG'));
  // every file named by a field: no Attachments heading
  sent = [];
  await post({
    fields,
    files: [['file_1', file(PNG, 'photo.png', 'image/png')], ['file_2', file(PDF, 'receipt.pdf', 'application/pdf')]],
  });
  assert.ok(!sent[0].html.includes('Attachments'));
  assert.ok(!sent[0].text.includes('Attachments'));
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
  ];
  const results = await Promise.all(cases.map(([files], i) => post({ files, ip: `192.0.2.${100 + i}` })));
  results.forEach(({ res, body }, i) => {
    assert.equal(res.status, cases[i][1], cases[i][2]);
    assert.deepEqual(body, { ok: false, error: cases[i][2] });
  });
  assert.equal(sent.length, 0);
  // five files of the form's 3.7 MB: 18.5 MB, the total (MAIL_FILES.maxTotal)
  const ok = await post({ files: [1, 2, 3, 4, 5].map((n) => pdf(`${n}.pdf`, 3700000)), ip: '192.0.2.200' });
  assert.equal(ok.res.status, 200);
  assert.equal(sent[0].attachments.length, 5);
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

/* ---------- Discover Airlines (lh-discover) ---------- */

const DISCOVER = 'https://main--lh-discover--moved-permanently.aem.page';
const DISCOVER_PAGE = `${DISCOVER}/de/en/my-bookings/manage/customer-service/contact-form/compensation-baggage`;
const DISCOVER_IDS = ['discover-assistance', 'discover-add-sports-baggage', 'discover-register-ammunition',
  'discover-register-hunting-firearm', 'discover-register-sporting-firearm', 'discover-register-animal-cargo-hold',
  'discover-register-animal-cabin', 'discover-compensation-baggage', 'discover-other-concerns',
  'discover-buccaneers-season-kickoff'];

test('lh-discover origins are accepted (aem.page, aem.live, DA preview, discover.turnsthe.page); other sites refused', async () => {
  const origins = [DISCOVER, 'https://main--lh-discover--moved-permanently.aem.live',
    'https://main--lh-discover--moved-permanently.preview.da.live', 'https://discover.turnsthe.page'];
  const ok = await Promise.all(origins.map((origin, i) => post({
    origin, form: 'discover-other-concerns', page: DISCOVER_PAGE, ip: `198.51.100.${50 + i}`,
  })));
  ok.forEach(({ res }, i) => {
    assert.equal(res.status, 200, origins[i]);
    assert.equal(res.headers.get('access-control-allow-origin'), origins[i]);
  });
  const refused = ['https://main--lh-discoverx--moved-permanently.aem.page', 'https://main--lh-discover--someone-else.aem.page',
    'https://main--other-site--moved-permanently.aem.live', 'https://discover.turnsthe.page.evil.example', 'https://evil.turnsthe.page'];
  const bad = await Promise.all(refused.map((origin, i) => post({ origin, form: 'discover-other-concerns', ip: `198.51.100.${80 + i}` })));
  bad.forEach(({ res, body }, i) => {
    assert.equal(res.status, 403, refused[i]);
    assert.deepEqual(body, { ok: false, error: 'origin-not-allowed' });
  });
});

test('each Discover form id is known: one mail to the default recipient, titled by www\'s h1 per language', async () => {
  const results = await Promise.all(DISCOVER_IDS.flatMap((form, i) => ['de-en', 'de-de'].map((locale, j) => post({
    origin: DISCOVER, form, locale, page: DISCOVER_PAGE, ip: `203.0.113.${100 + i * 2 + j}`,
  }))));
  results.forEach(({ res, body }) => {
    assert.equal(res.status, 200);
    assert.deepEqual(body, { ok: true });
  });
  assert.equal(sent.length, DISCOVER_IDS.length * 2);
  sent.forEach((m) => assert.deepEqual(m.to, ['default@example.com']));
  const titles = sent.map((m) => m.html.match(/<h1>([^<]*)<\/h1>/)[1]);
  assert.ok(titles.includes('Compensation for late or damaged baggage'));
  assert.ok(titles.includes('Gewinnspiel zum Season Kick-Off der Tampa Bay Buccaneers'));
  assert.ok(titles.every((t) => t && !t.startsWith('@@')), 'every title is set');
});

test('files on Discover\'s contact forms: www\'s rule (5 files, 3,145,728 bytes each, JPEG or PDF); other Discover forms take none', async () => {
  const sized = (bytes, size, name, type) => {
    const b = new Uint8Array(Math.max(size, bytes.length));
    b.set(bytes);
    return ['Dokumente', file(b, name, type)];
  };
  const pdf = (name = 'a.pdf', size = 0) => sized(PDF, size, name, 'application/pdf');
  const cases = [
    [[pdf(), pdf(), pdf(), pdf(), pdf(), pdf()], 400, 'too-many-files'],
    [[pdf('a.pdf', 3145729)], 413, 'file-too-large'],
    [[['Dokumente', file(PNG, 'photo.png', 'image/png')]], 400, 'invalid-file-type'],
    // a PNG under a JPEG name and type: its bytes decide
    [[['Dokumente', file(PNG, 'photo.jpg', 'image/jpeg')]], 400, 'invalid-file-type'],
    [[pdf('bad#name.pdf')], 400, 'invalid-file-name'],
  ];
  for (const form of ['discover-compensation-baggage', 'discover-other-concerns']) { // eslint-disable-line no-restricted-syntax
    // eslint-disable-next-line no-await-in-loop
    const results = await Promise.all(cases.map(([files], i) => post({
      origin: DISCOVER, form, page: DISCOVER_PAGE, files, ip: `192.0.2.${form.length + i * 3}`,
    })));
    results.forEach(({ res, body }, i) => {
      assert.equal(res.status, cases[i][1], `${form} ${cases[i][2]}`);
      assert.deepEqual(body, { ok: false, error: cases[i][2] });
    });
  }
  assert.equal(sent.length, 0);
  // the limit itself, a JPEG and a PDF: accepted
  const ok = await post({
    origin: DISCOVER,
    form: 'discover-compensation-baggage',
    page: DISCOVER_PAGE,
    ip: '192.0.2.240',
    files: [pdf('receipt.pdf', 3145728), sized(JPG, 10, 'tag.JPG', 'image/jpeg')],
  });
  assert.equal(ok.res.status, 200);
  assert.deepEqual(sent[0].attachments.map((a) => [a.filename, a.type]), [['receipt.pdf', 'application/pdf'], ['tag.JPG', 'image/jpeg']]);
  const none = await post({
    origin: DISCOVER, form: 'discover-assistance', page: DISCOVER_PAGE, ip: '192.0.2.241', files: [pdf()],
  });
  assert.deepEqual(none.body, { ok: false, error: 'files-not-allowed' });
  // feedback-past-flight keeps its own rule: a PNG is fine there
  const fb = await post({ ip: '192.0.2.243', files: [['Attachments', file(PNG, 'photo.png', 'image/png')]] });
  assert.equal(fb.res.status, 200);
});

/* ---------- the brand sites (lh-ita, lh-austrian, lh-airdolomiti) ---------- */

const ITA_IDS = ['ita-mice', 'ita-group-travel', 'ita-voglia-di-volare', 'ita-emergency-contact'];
const AUSTRIAN_IDS = ['anfrage-bestaetigung', 'anfrage-charterfluege', 'anfrage-flugbuchung', 'anfrage-gepaeck',
  'anfrage-gruppenreisen', 'anfrage-gutscheine', 'anfrage-rechnung', 'anfrage-reisen-mit-tieren',
  'anfrage-sitzplatz-menueauswahl', 'anfrage-sonstige-themen', 'anfrage-umbuchung',
  'application-for-compensation-in-the-event-of-flight-irregularities', 'bagdamage', 'betroffenenrechte-anfrage',
  'cancellation-refund-via-document-upload', 'contact-form-baggage', 'contact-form-booking',
  'contact-form-booking-confirmation', 'contact-form-charter', 'contact-form-medical-request', 'contact-form-other',
  'contact-form-passenger-receipt', 'contact-form-rebooking', 'contact-form-refund-seat-reservation',
  'contact-form-requested-documents', 'contact-form-seat-meal-requests', 'data-protection-contact',
  'emergency-contact', 'exclusive-charter-enquiry', 'fluggaeste-mit-betreuungsbedarf',
  'formular-upload-angeforderter-dokumente', 'invoice-request-hungary', 'newsletter', 'notfallkontakt',
  'private-check-in-counter', 'refund-form', 'request-for-refund-of-expenses', 'request-traveling-with-animals',
  'th-requested-documents'].map((n) => `austrian-${n}`);
const preflight = (origin) => worker.fetch(new Request(`${BASE}/submit`, {
  method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'POST' },
}), makeEnv());

test('brand sites: their hosts and Edge Delivery hosts are allowed origins; look-alikes are not', async () => {
  const allowed = ['https://ita.turnsthe.page', 'https://austrian.turnsthe.page', 'https://airdolomiti.turnsthe.page',
    'https://main--lh-ita--moved-permanently.aem.page', 'https://main--lh-ita--moved-permanently.aem.live',
    'https://main--lh-austrian--moved-permanently.aem.page', 'https://main--lh-austrian--moved-permanently.aem.live',
    'https://main--lh-airdolomiti--moved-permanently.aem.page', 'https://main--lh-discover--moved-permanently.aem.page',
    'https://discover.turnsthe.page', 'https://lufthansa.turnsthe.page', ORIGIN,
    'https://main--lh-cargo--moved-permanently.aem.page', 'https://main--lh-cargo--moved-permanently.aem.live', 'https://cargo.turnsthe.page'];
  const refused = ['https://main--lh-cargo--moved-permanently.aem.page.example.com', 'https://cargo.turnsthe.page.example.com', 'http://cargo.turnsthe.page',
    'https://main--lh-austrian--moved-permanently.aem.page.example.com', 'https://main--lh-austria--moved-permanently.aem.page',
    'https://austrian.turnsthe.page.example.com', 'http://austrian.turnsthe.page'];
  const ok = await Promise.all(allowed.map(preflight));
  ok.forEach((res, i) => {
    assert.equal(res.status, 204, allowed[i]);
    assert.equal(res.headers.get('access-control-allow-origin'), allowed[i]);
  });
  const no = await Promise.all(refused.map(preflight));
  no.forEach((res, i) => {
    assert.equal(res.status, 403, refused[i]);
    assert.equal(res.headers.get('access-control-allow-origin'), null);
  });
  // a submission from a refused origin: nothing read, nothing sent
  const { res, body } = await post({ form: 'austrian-emergency-contact', locale: 'at-en', origin: 'https://main--lh-cargo--moved-permanently.aem.page.example.com' });
  assert.equal(res.status, 403);
  assert.deepEqual(body, { ok: false, error: 'origin-not-allowed' });
  assert.equal(sent.length, 0);
});

test('brand sites: every ITA and Austrian form id is accepted from its site; an unknown id is not', async () => {
  const ids = [...ITA_IDS, ...AUSTRIAN_IDS];
  assert.equal(AUSTRIAN_IDS.length, 39);
  const results = await Promise.all(ids.map((form, i) => post({
    form, locale: form.startsWith('ita-') ? 'it-en' : 'at-de', origin: form.startsWith('ita-') ? 'https://ita.turnsthe.page' : 'https://austrian.turnsthe.page', ip: `198.51.100.${i + 1}`,
  })));
  results.forEach(({ res, body }, i) => {
    assert.equal(res.status, 200, ids[i]);
    assert.deepEqual(body, { ok: true }, ids[i]);
  });
  assert.equal(sent.length, ids.length);
  const unknown = await Promise.all(['austrian-unknown', 'ita-group-travel-2', 'austrian', 'group-travel-ita'].map((form, i) => post({ form, origin: 'https://austrian.turnsthe.page', ip: `198.51.100.${200 + i}` })));
  unknown.forEach(({ res, body }) => {
    assert.equal(res.status, 400);
    assert.deepEqual(body, { ok: false, error: 'unknown-form' });
  });
  assert.equal(sent.length, ids.length);
});

test('brand sites: Lufthansa Cargo (lh-cargo): its hosts and its cargo- ids; the subject [lh-cargo]; others refused', async () => {
  const origins = ['https://cargo.turnsthe.page', 'https://main--lh-cargo--moved-permanently.aem.page', 'https://main--lh-cargo--moved-permanently.aem.live'];
  const env = makeEnv({ FORM_CONFIG: JSON.stringify({ default: { to: 'only@example.com' } }) });
  // Cargo's pages have no country root: English sends de-en, German de-de
  const results = await Promise.all(origins.map((origin, i) => post({
    form: 'cargo-contact-us', locale: i === 1 ? 'de-de' : 'de-en', origin, ip: `198.51.100.${170 + i}`,
  }, env)));
  results.forEach(({ res, body }, i) => {
    assert.equal(res.status, 200, origins[i]);
    assert.deepEqual(body, { ok: true }, origins[i]);
  });
  assert.equal(sent.length, 3);
  assert.equal(sent[0].subject, '[lh-cargo] Contact us (de-en)');
  assert.equal(sent[1].subject, '[lh-cargo] Contact us (de-de)');
  assert.match(sent[0].html, /<h1>Contact us<\/h1>/);
  // an id the worker does not know: refused; a Cargo id from an unknown origin: refused
  const unknown = await post({ form: 'cargo-unknown-form', origin: origins[0], ip: '198.51.100.180' });
  assert.equal(unknown.res.status, 400);
  assert.deepEqual(unknown.body, { ok: false, error: 'unknown-form' });
  const foreign = await post({
    form: 'cargo-contact-us', locale: 'de-en', origin: 'https://cargo.example.com', ip: '198.51.100.181',
  });
  assert.equal(foreign.res.status, 403);
  assert.deepEqual(foreign.body, { ok: false, error: 'origin-not-allowed' });
  assert.equal(sent.length, 3);
});

test('Cargo file rules: cargo-contact-us takes PDF, JPEG and PNG, 5 x 3,700,000 (www\'s Office types and 10 MB not); attached to the mail', async () => {
  const cargo = { origin: 'https://cargo.turnsthe.page', locale: 'de-en', form: 'cargo-contact-us' };
  const env = makeEnv({ FORM_CONFIG: JSON.stringify({ default: { to: 'only@example.com' } }) });
  const pdf = (name, size = 0) => {
    const bytes = new Uint8Array(Math.max(size, PDF.length));
    bytes.set(PDF);
    return ['Attachments', file(bytes, name, 'application/pdf')];
  };
  const png = (name = 'a.png') => ['Attachments', file(PNG, name, 'image/png')];
  const jpg = (name = 'a.jpeg') => ['Attachments', file(JPG, name, 'image/jpeg')];
  // a .docx is a ZIP (PK\x03\x04), a .xls an OLE2 file: neither is a type the worker reads
  const docx = ['Attachments', file(new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2]), 'a.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')];
  const xls = ['Attachments', file(new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), 'a.xls', 'application/vnd.ms-excel')];
  const cases = [
    [[pdf('a.pdf', 3700000), png(), jpg()], 200, null],
    [[1, 2, 3, 4, 5].map((n) => pdf(`${n}.pdf`, 3700000)), 200, null],
    [[1, 2, 3, 4, 5, 6].map((n) => pdf(`${n}.pdf`)), 400, 'too-many-files'],
    [[pdf('a.pdf', 3700001)], 413, 'file-too-large'],
    [[docx], 400, 'invalid-file-type'],
    [[xls], 400, 'invalid-file-type'],
    [[pdf('a#1.pdf')], 400, 'invalid-file-name'],
  ];
  const results = await Promise.all(cases.map(([files], i) => post({ ...cargo, files, ip: `198.51.100.${200 + i}` }, env)));
  results.forEach(({ res, body }, i) => {
    const [, status, error] = cases[i];
    assert.equal(res.status, status, `case ${i}`);
    assert.deepEqual(body, error ? { ok: false, error } : { ok: true }, `case ${i}`);
  });
  assert.equal(sent.length, 2);
  assert.deepEqual(sent[0].attachments.map((a) => [a.filename, a.type]), [['a.pdf', 'application/pdf'], ['a.png', 'image/png'], ['a.jpeg', 'image/jpeg']]);
});

test('brand sites: Air Dolomiti\'s newsletter forms are accepted from its site, each with its page\'s title', async () => {
  const ids = ['airdolomiti-iscrizione-newsletter', 'airdolomiti-newsletter-subscription', 'airdolomiti-newsletter-anmeldung'];
  const origins = ['https://airdolomiti.turnsthe.page', 'https://main--lh-airdolomiti--moved-permanently.aem.page', 'https://main--lh-airdolomiti--moved-permanently.aem.live'];
  const env = makeEnv({ FORM_CONFIG: JSON.stringify({ default: { to: 'only@example.com' } }) });
  // an Italian page sends the default root (de-de), an English page de-en, a German page de-de
  const results = await Promise.all(ids.map((form, i) => post({
    form, locale: i === 1 ? 'de-en' : 'de-de', origin: origins[i], ip: `198.51.100.${150 + i}`,
  }, env)));
  results.forEach(({ res, body }, i) => {
    assert.equal(res.status, 200, ids[i]);
    assert.deepEqual(body, { ok: true }, ids[i]);
  });
  assert.equal(sent.length, ids.length);
  assert.match(sent[0].html, /<h1>Iscrizione newsletter<\/h1>/);
  assert.match(sent[1].html, /<h1>Newsletter subscription<\/h1>/);
  assert.match(sent[2].html, /<h1>Newsletter Anmeldung<\/h1>/);
  assert.equal(sent[0].subject, '[lh-airdolomiti] Iscrizione newsletter (de-de)');
  assert.equal(sent[1].subject, '[lh-airdolomiti] Newsletter subscription (de-en)');
  const unknown = await post({ form: 'airdolomiti-newsletter', origin: origins[0], ip: '198.51.100.160' });
  assert.equal(unknown.res.status, 400);
  assert.deepEqual(unknown.body, { ok: false, error: 'unknown-form' });
});

test('sites without roots (Cargo, Air Dolomiti) send the page\'s language alone: accepted, German title on de', async () => {
  const env = makeEnv({ FORM_CONFIG: JSON.stringify({ default: { to: 'only@example.com' } }) });
  const it = await post({
    form: 'airdolomiti-iscrizione-newsletter', locale: 'it', origin: 'https://airdolomiti.turnsthe.page', ip: '198.51.100.170',
  }, env);
  const de = await post({
    form: 'airdolomiti-newsletter-anmeldung', locale: 'de', origin: 'https://airdolomiti.turnsthe.page', ip: '198.51.100.171',
  }, env);
  const en = await post({
    form: 'cargo-contact-us', locale: 'en', origin: 'https://cargo.turnsthe.page', ip: '198.51.100.172',
  }, env);
  assert.equal(it.res.status, 200);
  assert.equal(de.res.status, 200);
  assert.equal(en.res.status, 200);
  assert.equal(sent[0].subject, '[lh-airdolomiti] Iscrizione newsletter (it)');
  assert.equal(sent[1].subject, '[lh-airdolomiti] Newsletter Anmeldung (de)');
  assert.match(sent[1].html, /<h1>Newsletter Anmeldung<\/h1>/);
  assert.equal(sent[2].subject, '[lh-cargo] Contact us (en)');
  const bad = await post({
    form: 'cargo-contact-us', locale: 'deu', origin: 'https://cargo.turnsthe.page', ip: '198.51.100.173',
  }, env);
  assert.equal(bad.res.status, 400);
  assert.deepEqual(bad.body, { ok: false, error: 'unknown-locale' });
});

test('brand sites: the title is the form\'s, German on a -de root, English elsewhere', async () => {
  await post({ form: 'austrian-bagdamage', locale: 'at-de', origin: 'https://austrian.turnsthe.page' });
  await post({ form: 'austrian-bagdamage', locale: 'gb-en', origin: 'https://austrian.turnsthe.page' });
  await post({ form: 'ita-mice', locale: 'it-it', origin: 'https://ita.turnsthe.page' });
  assert.match(sent[0].html, /<h1>Anfrage zu beschädigtem Gepäck und Reparatur<\/h1>/);
  assert.match(sent[1].html, /<h1>Enquiry regarding damaged baggage and repairs<\/h1>/);
  assert.match(sent[2].html, /<h1>MICE – Meetings, Incentives, Conferences, Exhibition<\/h1>/);
});

test('brand sites: the subject names the site the mail came from (origin, else form id); lh-com keeps [lh-com]', async () => {
  const env = makeEnv({ FORM_CONFIG: JSON.stringify({ default: { to: 'only@example.com' } }) });
  const cases = [
    [{ form: 'ita-mice', locale: 'it-en', origin: 'https://ita.turnsthe.page' }, '[lh-ita] MICE – Meetings, Incentives, Conferences, Exhibition (it-en)'],
    [{ form: 'ita-group-travel', locale: 'xx-en', origin: 'https://main--lh-ita--moved-permanently.aem.page' }, '[lh-ita] Viaggi di gruppo (xx-en)'],
    [{ form: 'austrian-notfallkontakt', locale: 'at-de', origin: 'https://austrian.turnsthe.page' }, '[lh-austrian] Notfallkontakt (at-de)'],
    [{ form: 'austrian-emergency-contact', locale: 'at-en', origin: 'https://main--lh-austrian--moved-permanently.aem.live' }, '[lh-austrian] Emergency contact (at-en)'],
    [{ form: 'discover-other-concerns', locale: 'de-en', origin: 'https://discover.turnsthe.page' }, '[lh-discover] Other issues (de-en)'],
    [{ form: 'discover-other-concerns', locale: 'de-de', origin: 'https://main--lh-discover--moved-permanently.aem.page' }, '[lh-discover] Anderes Anliegen (de-de)'],
    // the form id when the origin is lh-com's (a test page there)
    [{ form: 'austrian-anfrage-gepaeck', locale: 'at-de', origin: ORIGIN }, '[lh-austrian] Anfrage zum Gepäck (at-de)'],
    [{ form: 'group-travel', locale: 'de-de', origin: ORIGIN }, '[lh-com] Gruppenreisen (de-de)'],
    [{ form: 'group-travel', locale: 'de-en', origin: 'https://lufthansa.turnsthe.page' }, '[lh-com] Group travel (de-en)'],
  ];
  const results = await Promise.all(cases.map(([opts], i) => post({ ...opts, ip: `203.0.113.${100 + i}` }, env)));
  results.forEach(({ res }, i) => assert.equal(res.status, 200, cases[i][1]));
  assert.deepEqual(sent.map((m) => m.subject).sort(), cases.map((c) => c[1]).sort());
  // a subject in the configuration still wins
  await post({
    form: 'ita-mice', locale: 'it-en', origin: 'https://ita.turnsthe.page', ip: '203.0.113.200',
  });
  assert.equal(sent.at(-1).subject, 'Default subject');
});

test('Austrian file rules: types, per-file size, count, the 18.5 MB total', async () => {
  const at = { origin: 'https://austrian.turnsthe.page', locale: 'at-en' };
  const pdf = (name, size = 0) => {
    const bytes = new Uint8Array(Math.max(size, PDF.length));
    bytes.set(PDF);
    return ['Attachments', file(bytes, name, 'application/pdf')];
  };
  const png = (name = 'a.png') => ['Attachments', file(PNG, name, 'image/png')];
  const jpg = (name = 'a.jpg') => ['Attachments', file(JPG, name, 'image/jpeg')];
  const cases = [
    // the data protection form: 5 x 5 MB per file, but not more than the total
    ['austrian-data-protection-contact', [pdf('a.pdf', 5000000)], 200, null],
    ['austrian-data-protection-contact', [pdf('a.pdf', 5000001)], 413, 'file-too-large'],
    // 18.6 MB: over the total, under the body cap (over 19 MB: payload-too-large before reading)
    ['austrian-data-protection-contact', [pdf('1.pdf', 5000000), pdf('2.pdf', 5000000), pdf('3.pdf', 5000000), pdf('4.pdf', 3600000)], 413, 'files-too-large'],
    ['austrian-data-protection-contact', [1, 2, 3, 4, 5, 6].map((n) => pdf(`${n}.pdf`)), 400, 'too-many-files'],
    ['austrian-betroffenenrechte-anfrage', [1, 2, 3].map((n) => pdf(`${n}.pdf`, 5000000)), 200, null],
    // five of 3.7 MB: the total itself
    ['austrian-contact-form-baggage', [1, 2, 3, 4, 5].map((n) => pdf(`${n}.pdf`, 3700000)), 200, null],
    ['austrian-contact-form-baggage', [pdf('a.pdf', 3700001)], 413, 'file-too-large'],
    ['austrian-contact-form-baggage', [png(), jpg()], 200, null],
    ['austrian-contact-form-baggage', [pdf('bad[1].pdf')], 400, 'invalid-file-name'],
    // 2,048,000 per file; the three rows that had "pdf, png, jpg": the same four types
    ['austrian-contact-form-booking', [pdf('a.pdf', 2048000)], 200, null],
    ['austrian-contact-form-booking', [pdf('a.pdf', 2048001)], 413, 'file-too-large'],
    ['austrian-anfrage-flugbuchung', [png(), jpg(), pdf('a.pdf')], 200, null],
    ['austrian-th-requested-documents', [pdf('a#1.pdf')], 400, 'invalid-file-name'],
    // bagdamage: images only
    ['austrian-bagdamage', [pdf('a.pdf')], 400, 'invalid-file-type'],
    ['austrian-bagdamage', [png(), jpg()], 200, null],
    // the private check-in counter: one JPEG
    ['austrian-private-check-in-counter', [jpg()], 200, null],
    ['austrian-private-check-in-counter', [png()], 400, 'invalid-file-type'],
    ['austrian-private-check-in-counter', [jpg('a.jpg'), jpg('b.jpg')], 400, 'too-many-files'],
    // forms without a drop zone take no files
    ['austrian-emergency-contact', [pdf('a.pdf')], 400, 'files-not-allowed'],
    ['ita-mice', [pdf('a.pdf')], 400, 'files-not-allowed'],
  ];
  const results = await Promise.all(cases.map(([form, files], i) => post({
    ...at, form, files, ip: `192.0.2.${10 + i}`,
  })));
  results.forEach(({ res, body }, i) => {
    const [form, , status, error] = cases[i];
    assert.equal(res.status, status, `${form} ${i}`);
    assert.deepEqual(body, error ? { ok: false, error } : { ok: true }, `${form} ${i}`);
  });
  assert.equal(sent.length, cases.filter((c) => !c[3]).length);
});

/* ---------- Brussels Airlines (lh-brussels) ---------- */

const BRUSSELS_IDS = ['ask-invoice', 'baggage', 'baggage-allowances-rules', 'cabin-comfort', 'charter',
  'delays-and-cancellation', 'denied-boarding', 'dsar-start', 'emergency-contact',
  'fc8552d5-c1e8-4576-8b35-0d588d828b10', 'group-travel-request', 'loyalty-programs', 'other',
  'personal-injury', 'rebooking-request-birthright', 'register-ppb', 'request-for-proposal', 'special-assistance'].map((n) => `brussels-${n}`);
const BRU = 'https://brussels.turnsthe.page';

test('Brussels: its host and Edge Delivery hosts are allowed origins; look-alikes are not', async () => {
  const allowed = [BRU, 'https://main--lh-brussels--moved-permanently.aem.page', 'https://main--lh-brussels--moved-permanently.aem.live',
    'https://branch--lh-brussels--moved-permanently.aem.page'];
  const refused = ['https://main--lh-brussel--moved-permanently.aem.page', 'https://brussels.turnsthe.page.example.com',
    'http://brussels.turnsthe.page', 'https://main--lh-brussels--moved-permanently.aem.page.example.com'];
  const ok = await Promise.all(allowed.map(preflight));
  ok.forEach((res, i) => {
    assert.equal(res.status, 204, allowed[i]);
    assert.equal(res.headers.get('access-control-allow-origin'), allowed[i]);
  });
  const no = await Promise.all(refused.map(preflight));
  no.forEach((res, i) => assert.equal(res.status, 403, refused[i]));
});

test('Brussels: every form id is accepted from its site, to the default recipient; an unknown id is not', async () => {
  assert.equal(BRUSSELS_IDS.length, 18);
  const results = await Promise.all(BRUSSELS_IDS.map((form, i) => post({
    form, locale: 'be-fr', origin: BRU, ip: `198.51.100.${i + 50}`,
  })));
  results.forEach(({ res, body }, i) => {
    assert.equal(res.status, 200, BRUSSELS_IDS[i]);
    assert.deepEqual(body, { ok: true }, BRUSSELS_IDS[i]);
  });
  assert.equal(sent.length, BRUSSELS_IDS.length);
  const unknown = await Promise.all(['brussels-unknown', 'brussels', 'baggage-brussels'].map((form, i) => post({
    form, locale: 'be-en', origin: BRU, ip: `198.51.100.${220 + i}`,
  })));
  unknown.forEach(({ res, body }) => {
    assert.equal(res.status, 400);
    assert.deepEqual(body, { ok: false, error: 'unknown-form' });
  });
});

test('Brussels: titles from the be/en and de/de pages; the subject names lh-brussels (origin, else form id)', async () => {
  const env = makeEnv({ FORM_CONFIG: JSON.stringify({ default: { to: 'only@example.com' } }) });
  const cases = [
    [{ form: 'brussels-charter', locale: 'be-en', origin: BRU }, '[lh-brussels] Rent a plane (be-en)'],
    [{ form: 'brussels-charter', locale: 'de-de', origin: 'https://main--lh-brussels--moved-permanently.aem.live' }, '[lh-brussels] Ein Flugzeug mieten (de-de)'],
    // il/en's own form (brussels-snapshots-013, brief 441): its page's h1
    [{ form: 'brussels-rebooking-request-birthright', locale: 'il-en', origin: BRU }, '[lh-brussels] Rebooking request for Birthright participants (il-en)'],
    [{ form: 'brussels-baggage', locale: 'be-nl', origin: 'https://main--lh-brussels--moved-permanently.aem.page' }, '[lh-brussels] BAGGAGE ISSUES (be-nl)'],
    [{ form: 'brussels-request-for-proposal', locale: 'be-fr', origin: ORIGIN }, '[lh-brussels] Your enquiry for a Lufthansa Group Meetings & Events cooperation (be-fr)'],
  ];
  const results = await Promise.all(cases.map(([opts], i) => post({ ...opts, ip: `203.0.113.${150 + i}` }, env)));
  results.forEach(({ res }, i) => assert.equal(res.status, 200, cases[i][1]));
  assert.deepEqual(sent.map((m) => m.subject).sort(), cases.map((c) => c[1]).sort());
});

test('Brussels file rules: the feedback forms 5 x 2,000,000 PDF or JPEG; the request for proposal also PNG, 5 x 2,048,000; others none', async () => {
  const be = { origin: BRU, locale: 'be-en' };
  const pdf = (name, size = 0) => {
    const bytes = new Uint8Array(Math.max(size, PDF.length));
    bytes.set(PDF);
    return ['Attachments', file(bytes, name, 'application/pdf')];
  };
  const png = (name = 'a.png') => ['Attachments', file(PNG, name, 'image/png')];
  const jpg = (name = 'a.jpg') => ['Attachments', file(JPG, name, 'image/jpeg')];
  const feedback = ['baggage', 'baggage-allowances-rules', 'cabin-comfort', 'delays-and-cancellation', 'denied-boarding',
    'loyalty-programs', 'other', 'personal-injury', 'special-assistance'].map((n) => `brussels-${n}`);
  const cases = [
    ...feedback.map((form) => [form, [pdf('a.pdf', 2000000), jpg()], 200, null]),
    ['brussels-baggage', [1, 2, 3, 4, 5].map((n) => pdf(`${n}.pdf`, 2000000)), 200, null],
    ['brussels-baggage', [pdf('a.pdf', 2000001)], 413, 'file-too-large'],
    ['brussels-baggage', [png()], 400, 'invalid-file-type'],
    ['brussels-other', [1, 2, 3, 4, 5, 6].map((n) => pdf(`${n}.pdf`)), 400, 'too-many-files'],
    ['brussels-other', [pdf('a#1.pdf')], 400, 'invalid-file-name'],
    ['brussels-request-for-proposal', [png(), jpg(), pdf('a.pdf', 2048000)], 200, null],
    ['brussels-request-for-proposal', [pdf('a.pdf', 2048001)], 413, 'file-too-large'],
    ['brussels-charter', [pdf('a.pdf')], 400, 'files-not-allowed'],
    ['brussels-ask-invoice', [pdf('a.pdf')], 400, 'files-not-allowed'],
    ['brussels-rebooking-request-birthright', [pdf('a.pdf')], 400, 'files-not-allowed'],
  ];
  const results = await Promise.all(cases.map(([form, files], i) => post({
    ...be, form, files, ip: `192.0.2.${100 + i}`,
  })));
  results.forEach(({ res, body }, i) => {
    const [form, , status, error] = cases[i];
    assert.equal(res.status, status, `${form} ${i}`);
    assert.deepEqual(body, error ? { ok: false, error } : { ok: true }, `${form} ${i}`);
  });
});

/* ---------- Lufthansa Group for Business (lh-b2b) ---------- */

const B2B_IDS = ['b2b-businesstogo', 'b2b-partner-plus-benefit-raffle'];
const B2B = 'https://b2b.turnsthe.page';

test('B2B: its host and Edge Delivery hosts are allowed origins; look-alikes are not', async () => {
  const allowed = [B2B, 'https://main--lh-b2b--moved-permanently.aem.page', 'https://main--lh-b2b--moved-permanently.aem.live',
    'https://branch--lh-b2b--moved-permanently.aem.page'];
  const refused = ['https://main--lh-b2c--moved-permanently.aem.page', 'https://b2b.turnsthe.page.example.com',
    'http://b2b.turnsthe.page', 'https://main--lh-b2b--moved-permanently.aem.live.example.com'];
  const ok = await Promise.all(allowed.map(preflight));
  ok.forEach((res, i) => {
    assert.equal(res.status, 204, allowed[i]);
    assert.equal(res.headers.get('access-control-allow-origin'), allowed[i]);
  });
  const no = await Promise.all(refused.map(preflight));
  no.forEach((res, i) => assert.equal(res.status, 403, refused[i]));
});

test('B2B: both form ids are accepted in en and de, to the default recipient; an unknown id is not', async () => {
  const cases = B2B_IDS.flatMap((form) => ['de-en', 'de-de', 'at-en', 'xx-de'].map((locale) => ({ form, locale })));
  const results = await Promise.all(cases.map((c, i) => post({ ...c, origin: B2B, ip: `198.51.100.${i + 120}` })));
  results.forEach(({ res, body }, i) => {
    assert.equal(res.status, 200, `${cases[i].form} ${cases[i].locale}`);
    assert.deepEqual(body, { ok: true });
  });
  assert.equal(sent.length, cases.length);
  assert.ok(sent.every((m) => JSON.stringify(m.to) === JSON.stringify(sent[0].to)), 'one recipient set: the default');
  const unknown = await Promise.all(['b2b-unknown', 'b2b', 'businesstogo'].map((form, i) => post({
    form, locale: 'de-en', origin: B2B, ip: `198.51.100.${230 + i}`,
  })));
  unknown.forEach(({ res, body }) => {
    assert.equal(res.status, 400);
    assert.deepEqual(body, { ok: false, error: 'unknown-form' });
  });
});

test('B2B: titles from the de/en and de/de pages; the subject names lh-b2b (origin, else form id)', async () => {
  const env = makeEnv({ FORM_CONFIG: JSON.stringify({ default: { to: 'only@example.com' } }) });
  const cases = [
    [{ form: 'b2b-businesstogo', locale: 'de-en', origin: B2B }, '[lh-b2b] Lufthansa Group BusinessToGo (de-en)'],
    [{ form: 'b2b-businesstogo', locale: 'de-de', origin: 'https://main--lh-b2b--moved-permanently.aem.live' }, '[lh-b2b] Lufthansa Group BusinessToGo (de-de)'],
    [{ form: 'b2b-partner-plus-benefit-raffle', locale: 'at-en', origin: 'https://main--lh-b2b--moved-permanently.aem.page' }, '[lh-b2b] LOYALTY PAYS OFF – WIN 1 MILLION BENEFIT POINTS (at-en)'],
    [{ form: 'b2b-partner-plus-benefit-raffle', locale: 'de-de', origin: ORIGIN }, '[lh-b2b] TREUE ZAHLT SICH AUS – GEWINNEN SIE 1 MILLION BENEFIT Punkte (de-de)'],
  ];
  const results = await Promise.all(cases.map(([opts], i) => post({ ...opts, ip: `203.0.113.${170 + i}` }, env)));
  results.forEach(({ res }, i) => assert.equal(res.status, 200, cases[i][1]));
  assert.deepEqual(sent.map((m) => m.subject).sort(), cases.map((c) => c[1]).sort());
});

test('B2B: its forms take no files (www\'s pages have no drop zone)', async () => {
  const pdf = ['Attachments', file(PDF, 'a.pdf', 'application/pdf')];
  const results = await Promise.all(B2B_IDS.map((form, i) => post({
    form, locale: 'de-en', origin: B2B, files: [pdf], ip: `192.0.2.${200 + i}`,
  })));
  results.forEach(({ res, body }) => {
    assert.equal(res.status, 400);
    assert.deepEqual(body, { ok: false, error: 'files-not-allowed' });
  });
});

/* ---------- SWISS (lh-swiss) ---------- */

const SWISS_IDS = ['accessible-travel-form', 'ad-plattforms-contact', 'company-offers-contact-form', 'data-protection-form',
  'emergency-contact', 'feedback-past-flight', 'general-request', 'group-travel-request', 'loss-of-personal-item-form',
  'refund-form', 'register-animal-cargo-hold', 'register-animals', 'register-sports-baggage', 'rent-a-plane', 'request',
  'request-for-refund-of-expenses', 'technical-support',
  'a350-geneve', 'gewinnspiel-zermatt-unplugged-2024', 'preparations-for-the-2025-european-championships',
  'swiss-au-mondial-de-fondue', 'swiss-nati-women', 'womens-nations-league',
  // ch/fr's two raffles (brief 276's import; ch/fr only)
  'swiss-ice-hockey-games-2025', 'match-de-preparation-pour-les-championnats-europeens-2025'].map((n) => `swiss-${n}`);
const LX = 'https://swiss.turnsthe.page';

test('SWISS: its host and Edge Delivery hosts are allowed origins; look-alikes are not', async () => {
  const allowed = [LX, 'https://main--lh-swiss--moved-permanently.aem.page', 'https://main--lh-swiss--moved-permanently.aem.live',
    'https://branch--lh-swiss--moved-permanently.aem.page'];
  const refused = ['https://main--lh-swis--moved-permanently.aem.page', 'https://swiss.turnsthe.page.example.com',
    'http://swiss.turnsthe.page', 'https://main--lh-swiss--moved-permanently.aem.live.example.com'];
  const ok = await Promise.all(allowed.map(preflight));
  ok.forEach((res, i) => {
    assert.equal(res.status, 204, allowed[i]);
    assert.equal(res.headers.get('access-control-allow-origin'), allowed[i]);
  });
  const no = await Promise.all(refused.map(preflight));
  no.forEach((res, i) => assert.equal(res.status, 403, refused[i]));
});

test('SWISS: its 25 form ids (17 service forms, 8 raffles) are accepted in en, de and fr, to the default recipient; an unknown id is not', async () => {
  assert.equal(SWISS_IDS.length, 25);
  const cases = SWISS_IDS.flatMap((form) => ['ch-en', 'ch-de', 'ch-fr'].map((locale) => ({ form, locale })));
  const results = await Promise.all(cases.map((c, i) => post({ ...c, origin: LX, ip: `198.18.${Math.floor(i / 200)}.${(i % 200) + 1}` })));
  results.forEach(({ res, body }, i) => {
    assert.equal(res.status, 200, `${cases[i].form} ${cases[i].locale}`);
    assert.deepEqual(body, { ok: true });
  });
  assert.equal(sent.length, cases.length);
  assert.ok(sent.every((m) => JSON.stringify(m.to) === JSON.stringify(sent[0].to)), 'one recipient set: the default');
  const unknown = await Promise.all(['swiss-unknown', 'swiss', 'general-request-swiss'].map((form, i) => post({
    form, locale: 'ch-en', origin: LX, ip: `198.18.9.${i + 1}`,
  })));
  unknown.forEach(({ res, body }) => {
    assert.equal(res.status, 400);
    assert.deepEqual(body, { ok: false, error: 'unknown-form' });
  });
});

test('SWISS: titles from the ch/en and ch/de pages; the subject names lh-swiss (origin, else form id)', async () => {
  const env = makeEnv({ FORM_CONFIG: JSON.stringify({ default: { to: 'only@example.com' } }) });
  const cases = [
    [{ form: 'swiss-general-request', locale: 'ch-en', origin: LX }, '[lh-swiss] Contact: General request and booking enquiries (ch-en)'],
    [{ form: 'swiss-general-request', locale: 'ch-de', origin: 'https://main--lh-swiss--moved-permanently.aem.live' }, '[lh-swiss] Kontakt: Allgemeine Anfrage und Buchungsanfragen (ch-de)'],
    [{ form: 'swiss-request-for-refund-of-expenses', locale: 'ch-de', origin: 'https://main--lh-swiss--moved-permanently.aem.page' }, '[lh-swiss] Erstattung bei verspätetem oder beschädigtem Gepäck (ch-de)'],
    [{ form: 'swiss-a350-geneve', locale: 'ch-de', origin: ORIGIN }, '[lh-swiss] Discover the new Airbus A350 (ch-de)'],
    // ch/fr's raffles: their page's h1 (www's hockey page says 2024)
    [{ form: 'swiss-swiss-ice-hockey-games-2025', locale: 'ch-fr', origin: LX }, '[lh-swiss] Gagnez des billets pour les SWISS Ice Hockey Games 2024 (ch-fr)'],
    [{ form: 'swiss-match-de-preparation-pour-les-championnats-europeens-2025', locale: 'ch-fr', origin: LX }, '[lh-swiss] Match de préparation pour les Championnats européens 2025 (ch-fr)'],
  ];
  const results = await Promise.all(cases.map(([opts], i) => post({ ...opts, ip: `203.0.113.${190 + i}` }, env)));
  results.forEach(({ res }, i) => assert.equal(res.status, 200, cases[i][1]));
  assert.deepEqual(sent.map((m) => m.subject).sort(), cases.map((c) => c[1]).sort());
});

test('SWISS file rules as www\'s: 5 x 3.7 MB (loss of personal item 2,048,000; data protection 3,000,000), 18.5 MB in all; others none', async () => {
  const ch = { origin: LX, locale: 'ch-en' };
  const pdf = (name, size = 0) => {
    const bytes = new Uint8Array(Math.max(size, PDF.length));
    bytes.set(PDF);
    return ['Attachments', file(bytes, name, 'application/pdf')];
  };
  const png = (name = 'a.png') => ['Attachments', file(PNG, name, 'image/png')];
  const jpg = (name = 'a.jpg') => ['Attachments', file(JPG, name, 'image/jpeg')];
  const five = (size) => [1, 2, 3, 4, 5].map((n) => pdf(`${n}.pdf`, size));
  const cases = [
    ...['general-request', 'feedback-past-flight', 'request-for-refund-of-expenses'].flatMap((n) => [
      [`swiss-${n}`, five(3700000), 200, null],
      [`swiss-${n}`, [png(), jpg()], 200, null],
      [`swiss-${n}`, [pdf('a.pdf', 3700001)], 413, 'file-too-large'],
      [`swiss-${n}`, [...five(), pdf('6.pdf')], 400, 'too-many-files'],
    ]),
    ['swiss-loss-of-personal-item-form', five(2048000), 200, null],
    ['swiss-loss-of-personal-item-form', [pdf('a.pdf', 2048001)], 413, 'file-too-large'],
    ['swiss-data-protection-form', [pdf('a.pdf', 3000000), png(), jpg()], 200, null],
    ['swiss-data-protection-form', [pdf('a.pdf', 3000001)], 413, 'file-too-large'],
    ['swiss-general-request', [pdf('a#1.pdf')], 400, 'invalid-file-name'],
    ['swiss-rent-a-plane', [pdf('a.pdf')], 400, 'files-not-allowed'],
    ['swiss-a350-geneve', [pdf('a.pdf')], 400, 'files-not-allowed'],
  ];
  const results = await Promise.all(cases.map(([form, files], i) => post({
    ...ch, form, files, ip: `192.0.2.${10 + i}`,
  })));
  results.forEach(({ res, body }, i) => {
    const [form, , status, error] = cases[i];
    assert.equal(res.status, status, `${form} ${i}`);
    assert.deepEqual(body, error ? { ok: false, error } : { ok: true }, `${form} ${i}`);
  });
});

// SWISS's corporate site (www.swiss.com/corporate/<ll>/, en de fr; the capture of 2026-11-02): its
// three forms, ids swiss-<page name>; a sub-site page sends its language alone (blocks/form
// submissionLocale: the site's languages); the subject the title in that language
const CORPORATE = [
  ['swiss-media-permission', ['Application for permission to film for media creators', 'Antrag Drehgenehmigung für Medienschaffende', 'Demande d’autorisation de tournage pour les créateurs de médias']],
  ['swiss-media-request-form', ['Inquiries from media creators', 'Anfragen von Medienschaffenden', 'Demandes des professionnels des médias']],
  ['swiss-contact-corporate-procurement', ['Corporate Procurement Inquiry']],
];

test('SWISS corporate: its three forms in en, de and fr (the language alone), the title in the page\'s language, else English; the others as before', async () => {
  const env = makeEnv({ FORM_CONFIG: JSON.stringify({ default: { to: 'only@example.com' } }) });
  const cases = CORPORATE.flatMap(([form, titles]) => ['en', 'de', 'fr'].map((locale, i) => [{ form, locale, origin: LX }, `[lh-swiss] ${titles[i] || titles[0]} (${locale})`]));
  // as before: the ch roots' titles, lh-com's fr-fr form (its French title in en and de)
  cases.push([{ form: 'swiss-general-request', locale: 'ch-de', origin: LX }, '[lh-swiss] Kontakt: Allgemeine Anfrage und Buchungsanfragen (ch-de)']);
  cases.push([{ form: 'swiss-general-request', locale: 'fr', origin: LX }, '[lh-swiss] Contact: General request and booking enquiries (fr)']);
  const results = await Promise.all(cases.map(([opts], i) => post({ ...opts, ip: `203.0.113.${100 + i}` }, env)));
  results.forEach(({ res, body }, i) => {
    assert.equal(res.status, 200, cases[i][1]);
    assert.deepEqual(body, { ok: true });
  });
  assert.deepEqual(sent.map((m) => m.subject).sort(), cases.map((c) => c[1]).sort());
});

test('SWISS corporate file rules as www\'s: the permission to film 5 x 3,700,000 PDF or JPEG; the other two take no files', async () => {
  const pdf = (name, size = 0) => {
    const bytes = new Uint8Array(Math.max(size, PDF.length));
    bytes.set(PDF);
    return ['Attachments', file(bytes, name, 'application/pdf')];
  };
  const five = (size) => [1, 2, 3, 4, 5].map((n) => pdf(`${n}.pdf`, size));
  const cases = [
    ['swiss-media-permission', five(3700000), 200, null],
    ['swiss-media-permission', [['Attachments', file(JPG, 'a.jpg', 'image/jpeg')]], 200, null],
    ['swiss-media-permission', [['Attachments', file(PNG, 'a.png', 'image/png')]], 400, 'invalid-file-type'],
    ['swiss-media-permission', [pdf('a.pdf', 3700001)], 413, 'file-too-large'],
    ['swiss-media-permission', [...five(), pdf('6.pdf')], 400, 'too-many-files'],
    ['swiss-media-request-form', [pdf('a.pdf')], 400, 'files-not-allowed'],
    ['swiss-contact-corporate-procurement', [pdf('a.pdf')], 400, 'files-not-allowed'],
  ];
  const results = await Promise.all(cases.map(([form, files], i) => post({
    origin: LX, locale: 'de', form, files, ip: `192.0.2.${120 + i}`,
  })));
  results.forEach(({ res, body }, i) => {
    const [form, , status, error] = cases[i];
    assert.equal(res.status, status, `${form} ${i}`);
    assert.deepEqual(body, error ? { ok: false, error } : { ok: true }, `${form} ${i}`);
  });
});

// SWISS's market roots' own forms (their local pages, the capture of 2026-11-02): the page's h1 as
// the title; refundable travel credit has a German page only, Hungary's invoice request and Klook
// an English one; none takes files
test('SWISS market roots: pax receipt (al/en, al/de), refundable travel credit (al/de), invoice request Hungary (hu/en), Klook (kr/en), Hyundai 26 (kr/ko); their titles; no files', async () => {
  const env = makeEnv({ FORM_CONFIG: JSON.stringify({ default: { to: 'only@example.com' } }) });
  const cases = [
    [{ form: 'swiss-pax-receipt-request', locale: 'al-en', origin: LX }, '[lh-swiss] Enquiry about passenger receipt (al-en)'],
    [{ form: 'swiss-pax-receipt-request', locale: 'al-de', origin: LX }, '[lh-swiss] Anfrage bezüglich einem Passagierbeleg (al-de)'],
    [{ form: 'swiss-refundable-travel-credit', locale: 'al-de', origin: LX }, '[lh-swiss] Antrag auf eine erstattungsfähige Reisegutschrift (al-de)'],
    [{ form: 'swiss-invoice-request-hungary', locale: 'hu-en', origin: LX }, '[lh-swiss] Invoice Request Hungary (hu-en)'],
    [{ form: 'swiss-klook', locale: 'kr-en', origin: LX }, '[lh-swiss] SWISS Europe Activity Promotion (kr-en)'],
    // kr/ko's own form (the capture of 2026-11-03, swiss-snapshots-029): its page's h1
    [{ form: 'swiss-hyundai26-application', locale: 'kr-ko', origin: LX }, '[lh-swiss] 스위스 항공의 현대자동차 임직원과 가족들을 위한 혜택 (kr-ko)'],
  ];
  const results = await Promise.all(cases.map(([opts], i) => post({ ...opts, ip: `203.0.113.${140 + i}` }, env)));
  results.forEach(({ res, body }, i) => {
    assert.equal(res.status, 200, cases[i][1]);
    assert.deepEqual(body, { ok: true });
  });
  assert.deepEqual(sent.map((m) => m.subject).sort(), cases.map((c) => c[1]).sort());
  const pdf = ['Attachments', file(PDF, 'a.pdf', 'application/pdf')];
  const withFile = await post({
    origin: LX, locale: 'kr-en', form: 'swiss-klook', files: [pdf], ip: '192.0.2.160',
  });
  assert.equal(withFile.res.status, 400);
  assert.deepEqual(withFile.body, { ok: false, error: 'files-not-allowed' });
});

// lh-com's market roots' own forms (www's local pages: bg/en, il/en, mk/de); ids by page name, as
// the other lh-com forms; mk/en's support/refund has no fields on www and no id
const LH = 'https://lufthansa.turnsthe.page';
const MARKET_FORMS = [
  ['invoice-request-bg', 'bg-en', '[lh-com] Invoice Request Bulgaria (bg-en)'],
  ['cancellation-refund-webform', 'il-en', '[lh-com] Request for cancellation and refund via webform (il-en)'],
  ['formular-notfallkontakt', 'mk-de', '[lh-com] Notfallkontakt (mk-de)'],
  // fr/fr's emergency contact form (French, batch 11)
  ['emergency-contact', 'fr-fr', '[lh-com] Contact en cas d’urgence (fr-fr)'],
];

test('lh-com market forms: bg/en, il/en, mk/de and fr/fr\'s ids accepted, their page\'s h1, the default recipient; refund is no id', async () => {
  const env = makeEnv({ FORM_CONFIG: JSON.stringify({ default: { to: 'only@example.com' } }) });
  const results = await Promise.all(MARKET_FORMS.map(([form, locale], i) => post({
    form, locale, origin: i === 1 ? ORIGIN : LH, ip: `198.18.20.${i + 1}`,
  }, env)));
  results.forEach(({ res, body }, i) => {
    assert.equal(res.status, 200, MARKET_FORMS[i][0]);
    assert.deepEqual(body, { ok: true });
  });
  assert.deepEqual(sent.map((m) => m.subject).sort(), MARKET_FORMS.map((c) => c[2]).sort());
  assert.ok(sent.every((m) => JSON.stringify(m.to) === '["only@example.com"]'));
  // the German title on an English root too (the form exists in German only), the English on mk-de
  const other = await Promise.all([['formular-notfallkontakt', 'mk-en'], ['invoice-request-bg', 'bg-de']].map(([form, locale], i) => post({
    form, locale, origin: LH, ip: `198.18.20.${10 + i}`,
  }, env)));
  other.forEach(({ res }) => assert.equal(res.status, 200));
  assert.deepEqual(sent.slice(4).map((m) => m.subject).sort(), ['[lh-com] Invoice Request Bulgaria (bg-de)', '[lh-com] Notfallkontakt (mk-en)']);
  const unknown = await post({
    form: 'refund', locale: 'mk-en', origin: LH, ip: '198.18.20.20',
  }, env);
  assert.equal(unknown.res.status, 400);
  assert.deepEqual(unknown.body, { ok: false, error: 'unknown-form' });
});

test('il/en\'s cancellation form takes www\'s five uploads: PDF, JPEG and images (PNG), 8,000,000 bytes each, 18.5 MB in all; bg and mk none', async () => {
  const il = { origin: LH, locale: 'il-en', form: 'cancellation-refund-webform' };
  const pdf = (name, size = 0) => {
    const bytes = new Uint8Array(Math.max(size, PDF.length));
    bytes.set(PDF);
    return ['File_upload', file(bytes, name, 'application/pdf')];
  };
  const png = (name = 'a.png') => ['File_upload', file(PNG, name, 'image/png')];
  const jpg = (name = 'a.jpeg') => ['File_upload', file(JPG, name, 'image/jpeg')];
  const cases = [
    [il, [pdf('a.pdf', 8000000), png(), jpg()], 200, null],
    [il, [1, 2, 3, 4, 5].map((n) => pdf(`${n}.pdf`)), 200, null],
    [il, [1, 2, 3, 4, 5, 6].map((n) => pdf(`${n}.pdf`)), 400, 'too-many-files'],
    [il, [pdf('a.pdf', 8000001)], 413, 'file-too-large'],
    [il, [pdf('1.pdf', 8000000), pdf('2.pdf', 8000000), pdf('3.pdf', 2600000)], 413, 'files-too-large'],
    [il, [pdf('a#1.pdf')], 400, 'invalid-file-name'],
    [{ ...il, form: 'invoice-request-bg', locale: 'bg-en' }, [pdf('a.pdf')], 400, 'files-not-allowed'],
    [{ ...il, form: 'formular-notfallkontakt', locale: 'mk-de' }, [pdf('a.pdf')], 400, 'files-not-allowed'],
    [{ ...il, form: 'emergency-contact', locale: 'fr-fr' }, [pdf('a.pdf')], 400, 'files-not-allowed'],
  ];
  const results = await Promise.all(cases.map(([opts, files], i) => post({ ...opts, files, ip: `198.18.21.${i + 1}` })));
  results.forEach(({ res, body }, i) => {
    const [, , status, error] = cases[i];
    assert.equal(res.status, status, `case ${i}`);
    assert.deepEqual(body, error ? { ok: false, error } : { ok: true }, `case ${i}`);
  });
  assert.equal(sent.length, 2);
  assert.deepEqual(sent[0].attachments.map((a) => [a.filename, a.type]), [['a.pdf', 'application/pdf'], ['a.png', 'image/png'], ['a.jpeg', 'image/jpeg']]);
});

test('austrian-cn.turnsthe.page (www.austrian.cn\'s alias host) is an allowed origin; look-alikes are not', async () => {
  const ok = await preflight('https://austrian-cn.turnsthe.page');
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get('access-control-allow-origin'), 'https://austrian-cn.turnsthe.page');
  const no = await Promise.all(['https://austrian-cn.turnsthe.page.example.com', 'http://austrian-cn.turnsthe.page'].map(preflight));
  no.forEach((res) => assert.equal(res.status, 403));
});

test('swiss-cn.turnsthe.page (www.swiss.com.cn\'s alias host) is an allowed origin; look-alikes are not; austrian-cn as before', async () => {
  const ok = await preflight('https://swiss-cn.turnsthe.page');
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get('access-control-allow-origin'), 'https://swiss-cn.turnsthe.page');
  assert.equal((await preflight('https://austrian-cn.turnsthe.page')).status, 204);
  const no = await Promise.all(['https://swiss-cn.turnsthe.page.example.com', 'http://swiss-cn.turnsthe.page'].map(preflight));
  no.forEach((res) => assert.equal(res.status, 403));
});

test('the emergency contact form of the French and Spanish versions (fr/fr, xx/es, es/es): its page\'s h1 per language', async () => {
  const env = makeEnv({ FORM_CONFIG: JSON.stringify({ default: { to: 'only@example.com' } }) });
  const cases = [['fr-fr', '[lh-com] Contact en cas d’urgence (fr-fr)'], ['xx-es', '[lh-com] Contacto en caso de emergencia (xx-es)'],
    ['es-es', '[lh-com] Contacto en caso de emergencia (es-es)'], ['ch-fr', '[lh-com] Contact en cas d’urgence (ch-fr)']];
  const results = await Promise.all(cases.map(([locale], i) => post({
    form: 'emergency-contact', locale, origin: 'https://lufthansa.turnsthe.page', ip: `198.18.22.${i + 1}`,
  }, env)));
  results.forEach(({ res }, i) => assert.equal(res.status, 200, cases[i][0]));
  assert.deepEqual(sent.map((m) => m.subject).sort(), cases.map((c) => c[1]).sort());
});
