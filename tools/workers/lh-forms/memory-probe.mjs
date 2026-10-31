/* eslint-disable no-console, max-len -- tooling */
/*
 * One submission of the given total (5 PDF files) through the worker: the handler, the file
 * checks and the message build, the Email Sending call answered locally (nothing leaves the
 * process). Prints the peak of the live JS heap plus external memory, array buffers included
 * (what counts toward a Worker isolate's 128 MB), sampled after a full GC every millisecond.
 * Run by test/memory.test.mjs as a child process; by hand:
 *   node --max-old-space-size=128 --expose-gc --import ./test/cloudflare-workers-shim.mjs memory-probe.mjs 18500000
 */
import worker from './src/index.js';

const total = Number(process.argv[2]) || 18500000;
const files = 5;
const size = Math.floor(total / files);
const ORIGIN = 'https://austrian.turnsthe.page';
let peak = 0;
// live memory: a full GC first, then the heap and the external memory (array buffers included)
const sample = () => {
  if (globalThis.gc) globalThis.gc();
  const m = process.memoryUsage();
  peak = Math.max(peak, m.heapUsed + m.external);
};
const timer = setInterval(sample, 1);
let sentBytes = 0;
globalThis.fetch = async (url, init = {}) => {
  sample();
  sentBytes = typeof init.body === 'string' ? init.body.length : init.body.size;
  return new Response(JSON.stringify({ success: true, errors: [], result: {} }), { status: 200, headers: { 'content-type': 'application/json' } });
};
const env = {
  FORM_MAIL_ACCOUNT_ID: 'acc-1',
  FORM_MAIL_TOKEN: 'token',
  FORM_SENDER: 'forms-sender@example.com',
  FORM_CONFIG: JSON.stringify({ default: { to: ['to@example.com'] } }),
  BOT_CHECK: 'off',
};
const fd = new FormData();
fd.append('form', 'austrian-contact-form-baggage');
fd.append('locale', 'at-en');
fd.append('page', `${ORIGIN}/at/en/contact-form-baggage`);
fd.append('fields', JSON.stringify([{
  section: 'Contact', label: 'Email', name: 'email', value: 'customer@example.com',
}]));
for (let i = 0; i < files; i += 1) {
  const bytes = new Uint8Array(size);
  bytes.set(new TextEncoder().encode('%PDF-1.7\n'));
  for (let j = 16; j < size; j += 4096) bytes[j] = (i * 31 + j) % 251;
  fd.append(`file_${i + 1}`, new File([bytes], `doc-${i + 1}.pdf`, { type: 'application/pdf' }));
}
const request = new Request('https://lh-forms.example/submit', { method: 'POST', headers: { Origin: ORIGIN }, body: fd });
if (globalThis.gc) globalThis.gc();
sample();
const before = peak;
const res = await worker.fetch(request, env);
const body = await res.json();
sample();
clearInterval(timer);
console.log(JSON.stringify({
  total: size * files, status: res.status, ok: body.ok === true, error: body.error || null, sentBytes, before, peak,
}));
