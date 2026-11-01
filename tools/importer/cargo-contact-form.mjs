/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * Lufthansa Cargo's contact form page (lh-cargo) /en/contact-us: www's "Contact us" form (the
 * modal behind Support & Contact's "Open contact form", its topic entries and the menus'
 * Feedback/Complaints link; the same English form on /en/ and /de/support-and-contact) as one
 * Form (core) block, sent by the lh-forms worker as cargo-contact-us to its configured recipients.
 * From the captured page (content-sites/lh-cargo/snapshots/www.lufthansa-cargo.com/en/
 * support-and-contact.html, form #_com_lhcargo_eportal_contact_support_web_contactSupportForm):
 * labels, the optional marks, the hint, the validation messages of its Liferay rules, the country
 * list (as www's, its two Bosnia entries too) and the reasons; the subreasons www's form fetches per
 * reason (its getSubreason lookup, 2026-11-01) are SUBREASONS below. One hidden section per reason
 * holds its Subreason select (the reason select's toggles); ?reason=&subreason= in the address
 * choose both (prefill), as www's /support-and-contact?reason=&subreason=.
 * Not as www: no CAPTCHA (the block's bot check); the drop zone takes PDF, JPEG and PNG, 5 x 3.7 MB
 * (lh-forms' limits; www: also Word and Excel, 10 MB); no "Send request and reply also to" and no
 * "Send copy to me" (the worker sends to its recipients only); the AWB number is optional and
 * 8 digits (www requires it for Feedback / Complaints and checks its check digit); the success
 * message shows in place, as www's (its toast), the entries stay.
 *
 * Usage: node tools/importer/cargo-contact-form.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { CONTACT_FORM } from './cargo-paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-cargo');
const SNAPSHOT = path.join(W, 'snapshots/www.lufthansa-cargo.com/en/support-and-contact.html');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const NS = '_com_lhcargo_eportal_contact_support_web_';

export const FORM_ID = 'cargo-contact-us';

/** www's subreasons per reason (getSubreason, 2026-11-01), with the key of its section. */
export const SUBREASONS = {
  'Bookings & Shipments': { key: 'bookings', options: ['Booking', 'Shipment / Flight status', 'Shipment / Irregularity', 'Rates & Conditions', 'Other'] },
  'General request': { key: 'general', options: ['Schedule / Capacity', 'Office contact / Station details', 'Feedback / Complaints', 'Other'] },
  'Technical support': { key: 'technical', options: ['Registration / User account', 'Login / Password', 'Manage my account and services', 'Technical support / Issue with a particular service', 'Other'] },
};

const HEADER = ['Label', 'Type', 'Name', 'Required', 'Options', 'Help text', 'Placeholder', 'Validation message', 'Constraint message', 'Rules'];
const lines = (list) => list.map((l) => `<p>${esc(l)}</p>`).join('');

/**
 * The form's rows from www's page. Throws when the form or a field is missing (www changed).
 * @param {string} html the captured Support & Contact page
 */
export function contactFormRows(html) {
  const { document } = parseHTML(html);
  const form = document.getElementById(`${NS}contactSupportForm`);
  if (!form) throw new Error('no contactSupportForm on the page');
  const scripts = [...document.querySelectorAll('script')].map((s) => s.textContent).join('\n');
  // the Liferay rules: fieldName -> errorMessage (the first rule of a field: its required message)
  const messages = {};
  [...scripts.matchAll(/errorMessage:\s*'([^']*)',\s*fieldName:\s*'([^']+)',\s*validatorName:\s*'([^']+)'/g)].forEach(([, message, name, validator]) => {
    const key = name.replace(NS, '');
    messages[key] = messages[key] || {};
    if (!messages[key][validator]) messages[key][validator] = clean(message);
  });
  const control = (name) => {
    const c = form.querySelector(`[name="${NS}${name}"]`);
    if (!c) throw new Error(`no field ${name}`);
    return c;
  };
  // a field's column (label, optional mark, hint): its .col-md-* (the .form-group inside has the input only)
  const box = (name) => control(name).closest('.col-md-4, .col-md-6, .col-md-12') || form;
  const label = (name) => clean((box(name).querySelector('label') || {}).textContent);
  const optional = (name) => clean((box(name).querySelector('.optional-text, .optionalLabel') || {}).textContent);
  const required = (name) => (optional(name) ? optional(name) : 'yes');
  const msg = (name, validator = 'required') => (messages[name] || {})[validator] || '';
  const maxlength = (name) => (control(name).getAttribute('maxlength') ? `maxlength=${control(name).getAttribute('maxlength')}` : '');
  const text = (name, rules = []) => [esc(label(name)), 'text', name, esc(required(name)), '', '', '', esc(msg(name)), '', lines([maxlength(name), ...rules].filter(Boolean))];

  const reasons = [...control('reasons').querySelectorAll('option')].map((o) => clean(o.textContent)).filter(Boolean);
  const unknown = reasons.filter((r) => !SUBREASONS[r]);
  if (unknown.length) throw new Error(`reasons without subreasons: ${unknown.join(', ')}`);
  const countries = [...control('country').querySelectorAll('option')].map((o) => clean(o.textContent)).filter(Boolean);
  const intro = clean((form.querySelector('.requestorDetails > p') || {}).textContent);
  // the drop zone: "Drag file(s) here <br><span>or</span><br><div class="btnBrowse">Browse for a file</div>"
  const drop = form.querySelector('.doc-input-text');
  const zoneText = (sel, fallback) => clean((form.querySelector(sel) || {}).textContent) || fallback;
  const prompt = clean(drop && drop.firstChild && drop.firstChild.nodeType === 3 ? drop.firstChild.textContent : '') || 'Drag file(s) here';

  const rows = [HEADER];
  if (intro) rows.push([`<p>${esc(intro)}</p>`, 'note', '', '', '', '', '', '', '', '']);
  rows.push(
    text('companyName'),
    text('firstName'),
    text('lastName'),
    // www's custom rule: digits, spaces and + - / ( ); optional
    [esc(label('phone')), 'text', 'phone', esc(required('phone')), '', '', '', '', esc(msg('phone', 'custom_rule_phone')), lines([maxlength('phone'), 'pattern=^[0-9 +/()-]*$', 'inputmode=tel'].filter(Boolean))],
    [esc(label('email')), 'email', 'email', 'yes', '', '', '', esc(msg('email')), esc(msg('email', 'email') || msg('email')), ''],
    [esc(label('country')), 'select', 'country', 'yes', lines(countries), '', '', esc(msg('country')), '', ''],
    [esc(label('reasons')), 'select', 'reason', 'yes', lines(reasons.map((r) => `${SUBREASONS[r].key}=${r}`)), '', '', esc(msg('reasons')), '',
      lines([`toggles=${reasons.map((r) => SUBREASONS[r].key).join(', ')}`, 'prefill=reason'])],
  );
  reasons.forEach((r) => {
    const { key, options } = SUBREASONS[r];
    rows.push(
      ['', 'fieldset', key, '', '', '', '', '', '', 'hidden'],
      [esc(label('subReason')), 'select', `subreason-${key}`, 'yes', lines(options), '', '', esc(msg('subReason')), '', 'prefill=subreason'],
    );
  });
  rows.push(
    ['', 'end', '', '', '', '', '', '', '', ''],
    // www: 8 digits after the prefix 020, its check digit (7th digit modulo 7)
    [esc(label('awbNumber')), 'text', 'awbNumber', esc(required('awbNumber')), '', '', '', '', esc(msg('awbNumber', 'custom_rule_awbNumber') || msg('awbNumber')), lines([maxlength('awbNumber'), 'pattern=^[0-9]{8}$', 'inputmode=numeric'].filter(Boolean))],
    // www: "up to 1,500 characters" (its message; the field sets no maxlength)
    [esc(label('specifyReq')), 'textarea', 'request', 'yes', '', esc(clean((box('specifyReq').querySelector('.hint') || {}).textContent)), '', esc(msg('specifyReq')), '', lines(['maxlength=1500', 'rows=5'])],
    [esc(prompt), 'file', 'attachments', esc(zoneText('.optionalLabel', 'Optional')), '',
      // www: "Valid formats: .pdf, .xls, .doc, .jpg, .jpeg, .png up to 10 MB"; lh-forms takes these
      'Valid formats: .pdf, .jpg, .jpeg, .png up to 3.7 MB', esc(zoneText('.btnBrowse', 'Browse for a file')), '', '',
      lines(['accept=application/pdf, image/jpeg, image/jpg, image/png', 'max-files=5', 'max-size=3700000', 'not-allowed=#$%^*()[]'])],
    [esc(zoneText('.doc-input-text > span', 'or')), 'label', 'file or', '', '', '', '', '', '', ''],
    [esc(zoneText('.fileUploadWrapper h4', 'Uploaded files')), 'label', 'file list headline', '', '', '', '', '', '', ''],
    [esc(clean((form.querySelector(`#${NS}submitButton`) || {}).textContent) || 'Submit'), 'submit', '', '', '', '', '', '', '', ''],
    [FORM_ID, 'config', 'form', '', '', '', '', '', '', ''],
    // www's toasts (its sendReq answers)
    ['Your request has been submitted successfully.', 'label', 'success message', '', '', '', '', '', '', ''],
    ['Your request failed to complete', 'label', 'send error', '', '', '', '', '', '', ''],
  );
  return rows;
}

/** The page: H1 and intro as www's contact card, the form, the metadata. */
export function contactFormPage(html) {
  const { document } = parseHTML(html);
  const card = document.querySelector('.contactSupportWrapper .contactBox');
  const heading = clean((card && card.querySelector('h3')) ? card.querySelector('h3').textContent : 'Contact us');
  const intro = clean((card && card.querySelector('p')) ? card.querySelector('p').textContent : '');
  const rows = contactFormRows(html);
  const block = `<div class="form core">${rows.map((r) => `<div>${r.map((c) => `<div>${c}</div>`).join('')}</div>`).join('')}</div>`;
  const meta = [['Title', `${heading} - Lufthansa Cargo`], ['Description', intro], ['Nav', '/en/nav'], ['Footer', '/en/footer'], ['Language', 'en']]
    .filter(([, v]) => v)
    .map(([k, v]) => `<div><div>${k}</div><div>${esc(v)}</div></div>`).join('');
  return `<div><h1>${esc(heading)}</h1>${intro ? `<p>${esc(intro)}</p>` : ''}${block}<div class="metadata">${meta}</div></div>\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = path.join(W, `content${CONTACT_FORM}.plain.html`);
  const doc = contactFormPage(fs.readFileSync(SNAPSHOT, 'utf8'));
  const before = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null;
  if (before !== doc) fs.writeFileSync(out, doc);
  console.log(`${CONTACT_FORM}: ${before === doc ? 'unchanged' : 'written'} (${FORM_ID})`);
}
