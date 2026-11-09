/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 530, item 2 (Brussels' check-in form): www's online-check-in-options (be fr/en/nl, de/de, it/it, es/es)
   has its quick actions with the Check-in panel only: on phones a row "Enregistrement" that opens and closes, a Connexion
   link, the booking code, the first and the last name as boxed fields with a hint under each name, the button; from 768 px a
   tab bar with the one tab. The import wrote a plain booking-lookup (no title row on phones, no link, no hints): -285 px at
   390 and -249 at 1440 between the page's two headings on /be/fr (recordings, brief 497). It is www's check-in component
   SWISS has (flm-checkin-fktnCheckinRequest), so brussels-import.mjs writes it as SWISS's option, booking-lookup
   (my-bookings, checkin), with www's link and hints (withCheckinFields), and brussels.css draws www's boxes and spacing
   for that option only. The block's files, its other users (lh-com, SWISS, Austrian, Discover, Brussels' manage bookings)
   and the other Brussels documents are untouched.
   Markup: the snapshot of www.brusselsairlines.com/be/fr/check-in-options-and-info/online-check-in-options (brussels
   snapshots, brief 448), trimmed. Run: node --max-old-space-size=256 --test test/brussels-checkin-536.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { withCheckinFields } = await import('../tools/importer/brussels-import.mjs');

const LOGIN = 'https://api.travelid.brusselsairlines.com/oauth2/authorize?client_id=FuBoxl39ln5fAfvIAX18xIi2BI4d6rny&amp;response_type=code&amp;state=/be/fr/check-in-options-and-info/online-check-in-options&amp;view=login&amp;country=BE&amp;lang=fr';
const input = (name, label, hint, extra = '') => `<maui-input label="${label}" placeholder="${label}" required="" ${extra} id="dcep-a-flm-checkin-fktnCheckinRequest-${name}" hint="${hint}" errormessage="Remplissez"></maui-input>`;
const snap = `<html><body><div class="quickaction"><div class="dcep-quick-actions"><maui-tab-control-contained><maui-tab-control-panel name="Enregistrement" data-key="checkIn" role="tabpanel"><div class="tab-content"><div><div><maui-navigation-link href="${LOGIN}" target="_self" class="mr-5 d-inline-block maui-link"><maui-icon use="icon-arrow-up-right" slot="prefix"></maui-icon>Connexion</maui-navigation-link><form novalidate="">${input('fileKey', 'Code réservation', '', 'maxlength="13"')}${input('firstName', 'Prénom (tel qu’il apparait sur la réservation)', 'Veuillez saisir votre prénom, tel qu’il apparait sur la confirmation de votre réservation.', 'autocomplete="given-name"')}${input('lastName', 'Nom de famille (tel qu’il apparait sur la réservation)', 'Veuillez saisir votre nom de famille, tel qu’il apparait sur la confirmation de votre réservation.', 'autocomplete="family-name"')}<maui-button type="primary" behavior="submit">Enregistrement</maui-button></form></div></div></div></maui-tab-control-panel></maui-tab-control-contained></div></div></body></html>`;
const row = (k, v) => `<div><div>${k}</div><div>${v}</div></div>`;
const plain = `<div><p><a href="/be/fr/check-in-options-and-info/check-in-times">Vers les délais d’enregistrement</a></p><div class="booking-lookup">${row('Tab', 'Enregistrement')}${row('Reference label', 'Code réservation')}${row('Reference pattern', '^([A-Z0-9]{6}|\\d{13})$')}${row('Reference error', 'Remplissez un code de réservation')}${row('First name label', 'Prénom (tel qu’il apparait sur la réservation)')}${row('First name error', 'Remplissez votre prénom')}${row('Last name label', 'Nom de famille (tel qu’il apparait sur la réservation)')}${row('Last name error', 'Remplissez votre nom de famille')}${row('Submit label', 'Enregistrement')}</div><h2 id="comment">Comment obtenir votre carte d’embarquement</h2></div>`;

test('the check-in panel\'s form becomes SWISS\'s check-in option with www\'s Connexion link and the two name hints', () => {
  const out = withCheckinFields(plain, snap);
  assert.ok(out.includes('<div class="booking-lookup my-bookings checkin">'));
  assert.ok(out.includes(`${row('Tab', 'Enregistrement')}${row('Login link', `<a href="${LOGIN}">Connexion</a>`)}${row('Reference label', 'Code réservation')}`), 'the link right after the tab');
  assert.ok(out.includes(`${row('First name label', 'Prénom (tel qu’il apparait sur la réservation)')}${row('First name hint', 'Veuillez saisir votre prénom, tel qu’il apparait sur la confirmation de votre réservation.')}${row('First name error', 'Remplissez votre prénom')}`));
  assert.ok(out.includes(`${row('Last name label', 'Nom de famille (tel qu’il apparait sur la réservation)')}${row('Last name hint', 'Veuillez saisir votre nom de famille, tel qu’il apparait sur la confirmation de votre réservation.')}${row('Last name error', 'Remplissez votre nom de famille')}`));
  assert.ok(!out.includes('Reference hint'), 'www\'s booking code has no hint');
  assert.equal(out.replace(/<div><div>(?:Login link|First name hint|Last name hint)<\/div><div>.*?<\/div><\/div>/g, '').replace(' my-bookings checkin', ''), plain, 'nothing else changes');
});

test('documents and snapshots without that form, and a document already written so, as they are', () => {
  const noPanel = snap.replace('data-key="checkIn"', 'data-key="myBookings"');
  assert.equal(withCheckinFields(plain, noPanel), plain);
  const manage = plain.replace('<div class="booking-lookup">', '<div class="booking-lookup my-bookings">');
  assert.equal(withCheckinFields(manage, snap), manage, 'the manage bookings form (my-bookings) keeps its rows');
  const once = withCheckinFields(plain, snap);
  assert.equal(withCheckinFields(once, snap), once);
  const twoPanels = snap.replace('</maui-tab-control-panel>', '</maui-tab-control-panel><maui-tab-control-panel name="Mes vols" data-key="myBookings" role="tabpanel"></maui-tab-control-panel>');
  assert.equal(withCheckinFields(plain, twoPanels), plain, 'www\'s full quick actions are another component');
});

test('the wiring: the documents\' last steps run withCheckinFields with the page\'s snapshot, before the hand-off', () => {
  const src = fs.readFileSync(new URL('../tools/importer/brussels-import.mjs', import.meta.url), 'utf8');
  assert.match(src, /withCheckinHandoff\(withCheckinFields\(withFlightSearch\(/);
  assert.match(src, /withCheckinFields\(withFlightSearch\([\s\S]*?\), snap\), p\)/);
});

test('brussels.css draws the option as www: boxed 48 px fields, the hints, the row in the text column on phones; nothing else of the block', () => {
  const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const rules = [...css.matchAll(/([^{}]*\.booking-lookup[^{}]*)\{([^}]*)\}/g)].map((m) => [m[1].trim(), m[2].trim()]);
  assert.ok(rules.length >= 10);
  rules.forEach(([sel]) => sel.split(',').forEach((s) => assert.match(s.trim(), /^body\.brand-brussels \.booking-lookup\.checkin\b/, s)));
  const of = (sel) => (rules.find(([s]) => s === sel) || [])[1] || '';
  assert.match(of('body.brand-brussels .booking-lookup.checkin'), /--booking-lookup-field-height: 48px; --booking-lookup-field-reserve: 20px; margin: 44px 0 72px;/);
  assert.match(of('body.brand-brussels .booking-lookup.checkin .booking-lookup-field input'), /border: 1px solid var\(--lh-grey-8\); border-radius: 4px; background-color: var\(--lh-grey-1\);/);
  assert.match(of('body.brand-brussels .booking-lookup.checkin .booking-lookup-hint'), /margin: 7px 0 20px;.*font-size: 13px; line-height: 15px;/);
  const phone = css.match(/@media \(width < 768px\) \{ body\.brand-brussels \.booking-lookup\.checkin \{[\s\S]*?\} \}/)?.[0] || '';
  assert.match(phone, /body\.brand-brussels \.booking-lookup\.checkin \{ margin: 44px 0 70px; \}/);
  assert.match(phone, /\.booking-lookup-tabs ~ \.booking-lookup-panel \{ padding: 32px 40px 56px; \}/);
  assert.match(phone, /\.booking-lookup-submit \{ width: 100%; \}/);
});
