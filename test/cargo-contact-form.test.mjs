/* eslint-disable max-len, import/extensions */
/* Lufthansa Cargo's contact form page (tools/importer/cargo-contact-form.mjs): www's Support &
   Contact form (a fixture in its markup) becomes one Form (core) block sent as cargo-contact-us:
   www's labels, optional marks, hint and Liferay messages, its countries and reasons, one hidden
   section per reason with www's subreasons (the reason select's toggles, both prefilled from the
   address), the drop zone within lh-forms' limits, www's toasts; and the links to it
   (cargo-paths.mjs contactFormHref).
   Run: node --max-old-space-size=512 --test test/cargo-contact-form.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  contactFormRows, contactFormPage, SUBREASONS, FORM_ID,
} from '../tools/importer/cargo-contact-form.mjs';
import { CONTACT_FORM, contactForm, contactFormHref } from '../tools/importer/cargo-paths.mjs';

const NS = '_com_lhcargo_eportal_contact_support_web_';
const col = (cls, label, input, extra = '') => `<div class="${cls}"><label class="control-label">${label}</label>${extra}<div class="form-group input-text-wrapper">${input}</div></div>`;
const rule = (name, message, validator = 'required') => `{ body: '', custom: false, errorMessage: '${message}', fieldName: '${NS}${name}', validatorName: '${validator}' }`;
const PAGE = `<!DOCTYPE html><html><body>
<form id="${NS}contactSupportForm" name="${NS}contactSupportForm"><input type="hidden" name="${NS}formDate" value="1">
<h2 class="popupHeader">Contact us</h2>
<div class="frmbody"><div class="contactSupportFrm"><div class="requestorDetails"><p>Please sign in to access the platform's full functionality.</p>
<div class="row loggedinDetails">
${col('col-md-4 required', 'Company name', `<input type="text" name="${NS}companyName" maxlength="200">`)}
${col('col-md-4 required', 'First name', `<input type="text" name="${NS}firstName" maxlength="200">`)}
${col('col-md-4 required', 'Last name', `<input type="text" name="${NS}lastName" maxlength="200">`)}
${col('col-md-4 optional', 'Phone', `<input type="text" name="${NS}phone" maxlength="200">`, '<div class="optional-text">optional</div>')}
${col('col-md-4 required', 'Email', `<input type="text" name="${NS}email">`)}
${col('col-md-4 required', 'Country of origin', `<select name="${NS}country"><option value=""></option><option value="Albania">Albania</option><option value="Germany">Germany</option></select>`)}
</div><div class="row">
${col('col-md-4 required', 'Reason for contact', `<select name="${NS}reasons"><option value=""></option><option>Bookings &amp; Shipments</option><option>General request</option><option>Technical support</option></select>`)}
${col('col-md-4 required subReasonDiv', 'Subreason', `<select name="${NS}subReason"><option value=""></option></select>`)}
${col('col-md-4 awbBlock optional', 'AWB number', `<input type="text" name="${NS}awbNumber" maxlength="9">`, '<div class="optional-text">optional</div>')}
${col('col-md-12 required textArea', 'Specify your request', `<textarea name="${NS}specifyReq"></textarea>`, '<small class="hint">Please provide details of your request</small>')}
</div></div>
<div class="fileUploadWrapper"><span class="optionalLabel">Optional</span><div class="form-group clearfix row"><div class="fileUploadBox col-md-12"><div class="docUploading">
<div class="doc-input-text">Drag file(s) here <br><span>or</span><br><div class="btnBrowse">Browse for a file</div></div>
<div class="extraSmall">Valid formats: .pdf, .xls, .doc, .jpg, .jpeg, .png up to 10 MB</div>
<div class="form-group input-text-wrapper"><input type="file" name="${NS}fileuploaded"></div></div></div></div><h4>Uploaded files</h4></div>
<h2 class="mb-0">Send request and reply also to:</h2><input name="sendMailTo"><input type="checkbox" name="${NS}sendCopyToMe">
<input type="text" name="${NS}captchaText"><button type="button" id="${NS}submitButton"><span class="lfr-btn-label">Submit</span></button>
</div></div></form>
<div class="contactSupportWrapper"><div class="contactBox"><div><h3>Contact us</h3><p>Do you have a question? Fill out the form and we'll get back to you shortly.</p></div></div></div>
<script>Liferay.Form.register({ id: '${NS}contactSupportForm', fieldRules: [
${rule('captchaText', 'Captcha verification is required')}, ${rule('companyName', 'Please enter company name')}, ${rule('firstName', 'Please enter first name')},
${rule('lastName', 'Please enter last name')}, ${rule('phone', 'Please use this format to enter your phone number: + 49 (0)79 746 000 ', 'custom_rule_phone')},
${rule('email', 'Please enter a valid email address')}, ${rule('email', 'Please enter a valid email address ', 'email')},
${rule('country', 'Please select your country of origin')}, ${rule('reasons', 'Please select a reason for contact')}, ${rule('subReason', 'Please select a subreason')},
${rule('awbNumber', 'Please enter a valid 8 digit AWB number ')}, ${rule('awbNumber', 'Please enter a valid 8 digit AWB number ', 'custom_rule_awbNumber')},
${rule('specifyReq', 'Please enter your request with up to 1,500 characters')} ] });</script>
</body></html>`;

const rows = contactFormRows(PAGE);
const byName = Object.fromEntries(rows.filter((r) => r[2]).map((r) => [r[2], r]));
const strip = (c) => c.replace(/<\/p><p>/g, '\n').replace(/<\/?p>/g, '').replace(/&amp;/g, '&');

test('fields as www\'s: labels, required or www\'s optional mark, messages; no CAPTCHA, copy or extra recipients', () => {
  assert.deepEqual(rows[0], ['Label', 'Type', 'Name', 'Required', 'Options', 'Help text', 'Placeholder', 'Validation message', 'Constraint message', 'Rules']);
  assert.deepEqual(rows[1].slice(0, 2), ['<p>Please sign in to access the platform\'s full functionality.</p>', 'note']);
  assert.deepEqual(['companyName', 'firstName', 'lastName', 'phone', 'email', 'country', 'reason', 'awbNumber', 'request', 'attachments'].map((n) => [byName[n][0], byName[n][1], byName[n][3]]), [
    ['Company name', 'text', 'yes'], ['First name', 'text', 'yes'], ['Last name', 'text', 'yes'], ['Phone', 'text', 'optional'], ['Email', 'email', 'yes'],
    ['Country of origin', 'select', 'yes'], ['Reason for contact', 'select', 'yes'], ['AWB number', 'text', 'optional'], ['Specify your request', 'textarea', 'yes'],
    ['Drag file(s) here', 'file', 'Optional'],
  ]);
  assert.equal(byName.companyName[7], 'Please enter company name');
  assert.equal(byName.phone[8], 'Please use this format to enter your phone number: + 49 (0)79 746 000');
  assert.deepEqual(strip(byName.phone[9]).split('\n'), ['maxlength=200', 'pattern=^[0-9 +/()-]*$', 'inputmode=tel']);
  assert.deepEqual([byName.email[7], byName.email[8]], ['Please enter a valid email address', 'Please enter a valid email address']);
  assert.equal(byName.request[5], 'Please provide details of your request');
  assert.deepEqual(strip(byName.request[9]).split('\n'), ['maxlength=1500', 'rows=5']);
  assert.deepEqual(strip(byName.awbNumber[9]).split('\n'), ['maxlength=9', 'pattern=^[0-9]{8}$', 'inputmode=numeric']);
  assert.equal(strip(byName.country[4]), 'Albania\nGermany');
  assert.ok(!rows.some((r) => /captcha|sendMailTo|sendCopyToMe|Send copy|reply also/i.test(r.join(' '))));
});

test('reason -> subreasons: one hidden section per reason, www\'s subreasons, both prefilled from ?reason=&subreason=', () => {
  assert.equal(strip(byName.reason[4]), 'bookings=Bookings & Shipments\ngeneral=General request\ntechnical=Technical support');
  assert.deepEqual(strip(byName.reason[9]).split('\n'), ['toggles=bookings, general, technical', 'prefill=reason']);
  const at = (name) => rows.findIndex((r) => r[2] === name);
  Object.values(SUBREASONS).forEach(({ key, options }) => {
    assert.deepEqual(rows[at(key)].slice(1, 3).concat(rows[at(key)][9]), ['fieldset', key, 'hidden']);
    const sub = rows[at(key) + 1];
    assert.deepEqual([sub[0], sub[1], sub[2], sub[3], sub[7], sub[9]], ['Subreason', 'select', `subreason-${key}`, 'yes', 'Please select a subreason', 'prefill=subreason']);
    assert.deepEqual(strip(sub[4]).split('\n'), options);
  });
  assert.equal(rows[at('subreason-technical') + 1][1], 'end');
  assert.ok(SUBREASONS['General request'].options.includes('Feedback / Complaints'));
  assert.throws(() => contactFormRows(PAGE.replace('<option>Technical support</option>', '<option>Technical support</option><option>Claims</option>')), /Claims/);
});

test('drop zone within lh-forms\' limits (PDF, JPEG, PNG; 5 x 3.7 MB); www\'s texts, button, toasts; form id', () => {
  const zone = byName.attachments;
  assert.deepEqual([zone[5], zone[6]], ['Valid formats: .pdf, .jpg, .jpeg, .png up to 3.7 MB', 'Browse for a file']);
  assert.deepEqual(strip(zone[9]).split('\n'), ['accept=application/pdf, image/jpeg, image/jpg, image/png', 'max-files=5', 'max-size=3700000', 'not-allowed=#$%^*()[]']);
  const label = (key) => rows.find((r) => r[1] === 'label' && r[2] === key)[0];
  assert.deepEqual(['file or', 'file list headline', 'success message', 'send error'].map(label), ['or', 'Uploaded files', 'Your request has been submitted successfully.', 'Your request failed to complete']);
  assert.deepEqual(rows.find((r) => r[1] === 'submit').slice(0, 2), ['Submit', 'submit']);
  assert.deepEqual(rows.find((r) => r[1] === 'config').slice(0, 3), [FORM_ID, 'config', 'form']);
  assert.equal(FORM_ID, 'cargo-contact-us');
  assert.ok(!rows.some((r) => r[1] === 'config' && r[2] === 'success'), 'no success page: www\'s message in place');
});

test('the page: www\'s card heading as H1, its text, the block, English metadata', () => {
  const doc = contactFormPage(PAGE);
  assert.match(doc, /^<div><h1>Contact us<\/h1><p>Do you have a question\? Fill out the form and we'll get back to you shortly\.<\/p><div class="form core">/);
  assert.match(doc, /<div><div>Title<\/div><div>Contact us - Lufthansa Cargo<\/div><\/div>/);
  assert.match(doc, /<div><div>Nav<\/div><div>\/en\/nav<\/div><\/div><div><div>Footer<\/div><div>\/en\/footer<\/div><\/div><div><div>Language<\/div><div>en<\/div><\/div>/);
  assert.throws(() => contactFormRows('<html><body></body></html>'), /no contactSupportForm/);
});

test('the German page (/de/contact-us, brief 417): www\'s English form and card under the German header and footer', () => {
  const en = contactFormPage(PAGE);
  const de = contactFormPage(PAGE, 'de');
  assert.match(de, /<div><div>Nav<\/div><div>\/de\/nav<\/div><\/div><div><div>Footer<\/div><div>\/de\/footer<\/div><\/div><div><div>Language<\/div><div>de<\/div><\/div>/);
  assert.equal(de.split('<div class="metadata">')[0], en.split('<div class="metadata">')[0], 'the same heading, text and form');
});

test('links: www\'s reason and subreason in the query, else the plain form page', () => {
  assert.equal(CONTACT_FORM, '/en/contact-us');
  assert.equal(contactFormHref('General request', 'Feedback / Complaints'), '/en/contact-us?reason=General%20request&subreason=Feedback%20%2F%20Complaints');
  assert.equal(contactFormHref('Bookings & Shipments', 'Other'), '/en/contact-us?reason=Bookings%20%26%20Shipments&subreason=Other');
  assert.equal(contactFormHref('', ''), '/en/contact-us');
  assert.equal(contactFormHref('General request', ''), '/en/contact-us');
  // the German pages' form page (brief 417): www's form in English under the German header
  assert.equal(contactForm('de'), '/de/contact-us');
  assert.equal(contactForm('en'), CONTACT_FORM);
  assert.equal(contactFormHref('General request', 'Feedback / Complaints', 'de'), '/de/contact-us?reason=General%20request&subreason=Feedback%20%2F%20Complaints');
  assert.equal(contactFormHref('', '', 'de'), '/de/contact-us');
});
