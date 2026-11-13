/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 15 (2026-11-13), item 1: /pl/pl/register-animal-cabin, the pl/pl root's own form document (brief 582's
   own-document rows; DA has none, lh-edge answers the path from xx/pl's document today). The lufthansa.com forms carry
   three config rows (the form parser, tools/importer/parsers/form-core.js): `form` = the lh-forms worker's form id,
   `success` = the confirmation page of the form's root, `error` = /error.html. pl/pl's document is xx/pl's with its links
   made pl/pl's (tools/markets/root-docs.mjs, as the roots' navs and footers): the form id and the error page stay, the
   confirmation becomes pl/pl's (lh-edge serves it from xx/pl's). The form id must exist in lh-forms and the locale the
   block sends there (pl-pl) must pass the worker's check. Recipients are the worker's secret configuration: never in the
   repo, DA or a list.
   Input: xx/pl's document (test/fixtures/form-config-so15, the local copy of 2026-11-13).
   Run: node --max-old-space-size=256 --test test/form-config-so15.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { rootMap, rootCopy } from '../tools/markets/root-docs.mjs';

const XX = fs.readFileSync(new URL('./fixtures/form-config-so15/xx-pl-register-animal-cabin.plain.html', import.meta.url), 'utf8');
const CONFIRMATION = 'prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation';
const configRows = (html) => {
  const { document } = parseHTML(`<html><body><main>${html}</main></body></html>`);
  return [...document.querySelector('div.form').children]
    .filter((r) => r.children[1] && r.children[1].textContent.trim() === 'config')
    .map((r) => [r.children[2].textContent.trim(), r.children[0].querySelector('a') ? r.children[0].querySelector('a').getAttribute('href') : r.children[0].textContent.trim()]);
};
// as root-docs.mjs's main for a root answered from its language version: xx/pl's documents keep their path under pl/pl
const map = rootMap('xx/pl', 'pl/pl');
map.paths[`/xx/pl/${CONFIRMATION}`] = map.paths[`/xx/pl/${CONFIRMATION}`] || `/pl/pl/${CONFIRMATION}`;

test('xx/pl\'s form has the three config rows; pl/pl\'s copy: the same form id and error page, pl/pl\'s confirmation', () => {
  assert.deepEqual(configRows(XX), [['form', 'register-animal-cabin'], ['success', `/xx/pl/${CONFIRMATION}`], ['error', 'https://www.lufthansa.com/error.html']]);
  const pl = rootCopy(XX, 'xx/pl', 'pl/pl', map);
  assert.deepEqual(configRows(pl.html), [['form', 'register-animal-cabin'], ['success', `/pl/pl/${CONFIRMATION}`], ['error', 'https://www.lufthansa.com/error.html']]);
  assert.ok(!/href="\/xx\/pl\//.test(pl.html), 'no link into xx/pl left');
});

test('lh-forms knows the form and the locale pl-pl; the page name maps to it', () => {
  const worker = fs.readFileSync(new URL('../tools/workers/lh-forms/src/index.js', import.meta.url), 'utf8');
  assert.match(worker, /\n {2}'register-animal-cabin': \{/);
  const locale = new RegExp(worker.match(/const LOCALE = \/(.+)\/;/)[1]);
  assert.ok(locale.test('pl-pl'));
  const forms = fs.readFileSync(new URL('../scripts/lh-forms.js', import.meta.url), 'utf8');
  assert.match(forms, /'register-animal-cabin': 'register-animal-cabin'/);
});
