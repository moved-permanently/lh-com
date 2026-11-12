/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* A ":word:" that is no icon of ours is text, not a broken icon (lh-b2b meissen's "Mitarbeiter:innen:",
   2026-11-11): the importer's guard (tools/importer/icon-tokens.mjs, applied to every upload by
   da-upload-sites.mjs uploadBody and to DA's copies by icon-tokens-apply.mjs), and the browser step
   that takes its WORD JOINER out again (scripts/icon-token-text.js). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import {
  guardIconTokens, strayTokens, tokensOf, realIcons, WORD_JOINER,
} from '../tools/importer/icon-tokens.mjs';
import { uploadBody } from '../tools/importer/da-upload-sites.mjs';
import { restoreIconTokenText } from '../scripts/icon-token-text.js';

const WJ = WORD_JOINER;
const icons = new Set(['phone', 'lock', 'baggage']);

test('our icons are the files in /icons', () => {
  const ours = realIcons();
  assert.equal(ours.has('lock'), true);
  assert.equal(ours.has('innen'), false);
  assert.equal(ours.size, fs.readdirSync(new URL('../icons/', import.meta.url)).filter((f) => /\.(svg|png)$/.test(f)).length);
});

test('a gender suffix before a colon stays text; a real icon token stays one', () => {
  const doc = '<p><strong>Mitarbeiter:innen:</strong> 400+</p><p>:phone: Call us</p>';
  const out = guardIconTokens(doc, icons);
  assert.equal(out, `<p><strong>Mitarbeiter:innen${WJ}:</strong> 400+</p><p>:phone: Call us</p>`);
  assert.equal(strayTokens(out, icons).length, 0);
  assert.deepEqual(tokensOf(':phone: x').map((t) => t.name), ['phone']);
  assert.equal(guardIconTokens(out, icons), out, 'idempotent');
});

test('runs of tokens, URLs, code, attributes and references as the pipeline reads them', () => {
  // two tokens sharing a colon: both kept as text
  assert.equal(guardIconTokens('<p>Kund:innen:Partner:innen: ok</p>', icons), `<p>Kund:innen${WJ}:Partner${WJ}:innen${WJ}: ok</p>`);
  // after "https" in the same word the pipeline reads no token; an app configuration's "dmc:https:" it does
  assert.equal(guardIconTokens('<p>https://x.de/a:b:c</p>', icons), '<p>https://x.de/a:b:c</p>');
  assert.equal(guardIconTokens('<div>apiKey:x;dmc:https://www.austrian.com/a;tmc:1</div>', icons), `<div>apiKey:x;dmc:https${WJ}://www.austrian.com/a;tmc:1</div>`);
  // code is left alone by the pipeline, and so here; attributes are no text
  const code = '<p><code>a:b:</code></p><a href="/x:innen:" title="Kund:innen:">x</a>';
  assert.equal(guardIconTokens(code, icons), code);
  // a no-break space reference is whitespace to the pipeline: "http&nbsp;" ends the URL's word
  assert.equal(guardIconTokens('<p>http&nbsp;Kund:innen: x</p>', icons), `<p>http&nbsp;Kund:innen${WJ}: x</p>`);
  // a colon written as a reference is a colon to the pipeline
  assert.equal(guardIconTokens('<p>Kund&#58;innen&#x3A; x</p>', icons), `<p>Kund:innen${WJ}: x</p>`);
  const plain = '<p>Time: 10:30, ratio 1:2:3</p>';
  assert.equal(guardIconTokens(plain, icons), plain, 'no letters between the colons: no token');
});

test('every upload is guarded (da-upload-sites uploadBody)', () => {
  const body = uploadBody('plain', '<div><p><strong>Mitarbeiter:innen:</strong> 400+</p><p>:lock: Login</p></div>');
  assert.equal(body.includes(`Mitarbeiter:innen${WJ}:`), true);
  assert.equal(body.includes('<p>:lock: Login</p>'), true);
  assert.equal(body.startsWith('<body><header></header><main>'), true);
});

test('the browser takes the joiner out again: the text reads as www\'s', () => {
  const { document } = parseHTML(`<html><body><main><p><strong>Mitarbeiter:innen${WJ}:</strong> 400+</p><div class="micro-frontend"><div>apiKey:x;dmc:https${WJ}://www.austrian.com/a</div></div><p>a${WJ}b</p><p>Kund:innen${WJ}:Partner${WJ}:innen${WJ}: ok</p></main></body></html>`);
  const main = document.querySelector('main');
  restoreIconTokenText(main);
  assert.equal(main.querySelector('strong').textContent, 'Mitarbeiter:innen:');
  assert.equal(main.querySelector('.micro-frontend div').textContent, 'apiKey:x;dmc:https://www.austrian.com/a');
  assert.equal(main.querySelectorAll('p')[1].textContent, `a${WJ}b`, 'a joiner elsewhere stays');
  assert.equal(main.querySelectorAll('p')[2].textContent, 'Kund:innen:Partner:innen: ok', 'tokens sharing a colon');
  const src = fs.readFileSync(new URL('../scripts/scripts.js', import.meta.url), 'utf8');
  assert.match(src, /restoreIconTokenText\(main\);\n {2}restoreAppConfigText\(main\);\n {2}decorateIcons\(main\);/);
});

test('the Metadata block keeps its colons (the pipeline reads it into the head before the icons)', () => {
  const doc = '<div><h1>Madrid</h1><div class="metadata"><div><div>Title</div><div>Geheimtipp für Madrid-Urlauber:innen: Mercado</div></div><div><div>Breadcrumb title</div><div><p>Urlauber:innen: x</p></div></div></div><p>Köch:innen: am Grill</p></div>';
  const out = guardIconTokens(doc, icons);
  assert.equal(out.includes('Madrid-Urlauber:innen: Mercado'), true);
  assert.equal(out.includes('<p>Urlauber:innen: x</p>'), true, 'nested in the block');
  assert.equal(out.includes(`Köch:innen${WJ}: am Grill`), true, 'the text after the block is guarded');
  assert.deepEqual(strayTokens(doc, icons).map((t) => t.context), ['Köch:innen: am Grill']);
});
