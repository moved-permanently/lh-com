/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 520, item 4: the DA censuses found text-size marks the collapse left in form note rows. Brussels'
   feedback forms have "… binding for Brussels Airlines. {copytext-small}" (31 documents), and Austrian's enquiry
   forms have "Address {copytext-large}" (11). blocks/form/form.js reads them from a note's label cell. The cell's
   text is bare (no <p>), so the collapse's paragraph pass never saw it.
   The rule is the one for a block's single paragraphs: body, the marker goes (theme).
   B2B's video cells have a link and "{controls round-play-button}" as a Columns Media cell's bare text (3
   documents). They now take the video rules as a paragraph does.
   The CLI's and the loss check's "left" check reads block cells too, which is how these were found.
   Run: node --max-old-space-size=512 --test test/cell-marks-520.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { lossProblems, leftIn } from '../tools/importer/collapse-loss-check.mjs';

const row = (...cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;
const form = (...rows) => `<div><div class="form">${row('Label', 'Type', 'Name', 'Required', 'Options', 'Help')}${rows.join('')}</div></div>`;
const run = (html, brand) => collapseHtml(html, {
  path: '/be/en/x', brand, parse: parseHTML, force: true,
});

test('a form note\'s text-size and width marks go to the theme', () => {
  [
    ['brussels', 'The decision adopted by AESA in ADR is binding for Brussels Airlines. {copytext-small}', 'The decision adopted by AESA in ADR is binding for Brussels Airlines.'],
    ['austrian', 'Address {copytext-large}', 'Address'],
    ['lufthansa', 'Travel dates in 28 days at the earliest. {copytext-small full-width}', 'Travel dates in 28 days at the earliest.'],
    ['brussels', '<p>One</p><p>Two <strong>bold</strong> {copytext-small}</p>', '<p>One</p><p>Two <strong>bold</strong></p>'],
  ].forEach(([brand, label, want]) => {
    const doc = form(row(label, 'note', '', '', '', ''), row('Email', 'email', 'email', 'yes', '', 'Your address'));
    const r = run(doc, brand);
    assert.ok(r.html.includes(`<div>${want}</div>`), `${brand}: ${r.html}`);
    assert.ok(!/\{copytext|\{full-width/.test(r.html), brand);
    assert.ok(r.stats.theme['text-size'] >= 1, brand);
    assert.deepEqual(lossProblems(doc, r.html), [], brand);
    assert.equal(run(r.html, brand).html, r.html, `${brand}: idempotent`);
    assert.deepEqual(leftIn(r.html), [], brand);
  });
  // a field's own label and the form's placeholders stay as they are
  const fields = form(row('Passenger {n}', 'fieldset', 'pax', '', 'repeat=5<br> remaining=You can add {n} more', ''), row('Price {copytext-small}', 'text', 'price', '', '', ''));
  const out = run(fields, 'brussels').html;
  assert.ok(out.includes('Passenger {n}') && out.includes('You can add {n} more'));
  assert.ok(out.includes('Price {copytext-small}'), 'not a note: form.js shows it, the collapse leaves it (and the CLI lists it)');
  assert.equal(leftIn(out).length, 1);
});

test('the CLI\'s left check reads block cells', () => {
  assert.deepEqual(leftIn('<div><p>a</p></div>'), []);
  assert.equal(leftIn('<div><div class="cards"><div><div>Text {copytext-small}</div></div></div></div>').length, 1);
  assert.equal(leftIn('<div><p>Text {heading-small}</p></div>').length, 1);
  assert.deepEqual(leftIn('<div><div class="form"><div><div>Hello {origin} to {destination}</div></div></div></div>'), []);
});

test('a block cell\'s bare text with a video setting takes the video rules', () => {
  const url = '/content/dam/b2bneo/images/programs/ppb/cash-and-points/250618-lhg-b2b-ppb-cash-and-points-v2.mp4';
  const cell = (marks) => `<div><h2>Cash &amp; Points</h2><div class="columns-media"><div><div><a href="${url}">/content/dam/b2bneo/images/programs/ppb/cash-and-points/250618 LHG B2B PPB Cash and Points_V2.mp4</a> ${marks}</div><div><p>Text</p></div></div></div></div>`;
  // controls and the round button: the default player, the marker goes
  const doc = cell('{controls round-play-button}');
  const r = run(doc, 'b2b');
  assert.ok(!/\{controls/.test(r.html), r.html);
  assert.equal(r.stats.theme.video, 1);
  assert.deepEqual(leftIn(r.html), []);
  assert.deepEqual(lossProblems(doc, r.html), []);
  assert.equal(run(r.html, 'b2b').html, r.html, 'idempotent');
  // autoplay without controls: the block's option background-video
  const bg = run(cell('{autoplay muted loop}'), 'b2b');
  assert.match(bg.html, /class="columns-media background-video"/);
  assert.equal(bg.stats.carrier.video, 1);
  // other marks in a bare cell stay where they were (no rule reads them there)
  const other = run('<div><div class="cards"><div><div>Text {heading-small}</div></div></div></div>', 'b2b').html;
  assert.ok(other.includes('Text {heading-small}'), other);
});
