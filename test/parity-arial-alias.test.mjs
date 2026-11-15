/* eslint-disable max-len, import/extensions -- dev tooling */
/* The measuring browser's Arial (ema-lufthansa, standing order 24 of 2026-11-15, item 1; order 22's fonts-so22-arial.txt):
   the machine has no face with Arial's widths, so Chromium draws Arial text in DejaVu Sans (wider). PARITY_ARIAL_FONTS=<dir>
   (Liberation Sans 2.1.5 from the drop, fonts-liberation-sans-2.1.5.tar.gz, not in git) makes tools/parity/arial-alias.mjs
   write a fontconfig file that adds the dir and maps Arial to Liberation Sans; the browser is launched with it as
   FONTCONFIG_FILE. Off by default: without the variable nothing changes. Run: node --test test/parity-arial-alias.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  ARIAL_FACES, arialAliasConfig, arialAliasEnv,
} from '../tools/parity/arial-alias.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'arial-alias-'));

test('off by default: no PARITY_ARIAL_FONTS, no change to the browser\'s environment', () => {
  assert.deepEqual(arialAliasEnv({}), {});
  assert.deepEqual(arialAliasEnv({ PARITY_ARIAL_FONTS: '' }), {});
});

test('the four Liberation Sans faces are required; a dir without them is refused', () => {
  assert.deepEqual(ARIAL_FACES, ['LiberationSans-Regular.ttf', 'LiberationSans-Bold.ttf', 'LiberationSans-Italic.ttf', 'LiberationSans-BoldItalic.ttf']);
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'LiberationSans-Regular.ttf'), '');
  assert.throws(() => arialAliasEnv({ PARITY_ARIAL_FONTS: dir }, { workDir: tmp() }), /LiberationSans-Bold\.ttf/);
});

test('the config: the system\'s fonts, the dir, its own cache, and Arial mapped to Liberation Sans', () => {
  const conf = arialAliasConfig('/fonts/liberation', '/tmp/cache');
  assert.match(conf, /<include ignore_missing="yes">\/etc\/fonts\/fonts\.conf<\/include>/);
  assert.match(conf, /<dir>\/fonts\/liberation<\/dir>/);
  assert.match(conf, /<cachedir>\/tmp\/cache<\/cachedir>/);
  assert.match(conf, /<test qual="any" name="family"><string>Arial<\/string><\/test>\s*<edit name="family" mode="assign" binding="strong"><string>Liberation Sans<\/string><\/edit>/);
  assert.doesNotMatch(conf, /sans-serif/, 'only Arial: the generic family stays the system\'s');
});

test('with the dir: FONTCONFIG_FILE written and returned', () => {
  const dir = tmp();
  ARIAL_FACES.forEach((f) => fs.writeFileSync(path.join(dir, f), ''));
  const env = arialAliasEnv({ PARITY_ARIAL_FONTS: dir }, { workDir: tmp() });
  assert.deepEqual(Object.keys(env), ['FONTCONFIG_FILE']);
  assert.match(fs.readFileSync(env.FONTCONFIG_FILE, 'utf8'), new RegExp(`<dir>${path.resolve(dir).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</dir>`));
});

test('the parity capture launches its browser with the option\'s environment (nothing without PARITY_ARIAL_FONTS)', () => {
  const src = fs.readFileSync(new URL('../tools/parity/capture.js', import.meta.url), 'utf8');
  assert.match(src, /await import\('\.\/arial-alias\.mjs'\)/);
  assert.match(src, /env: \{ \.\.\.process\.env, \.\.\.fontEnv \}/);
  assert.match(src, /PARITY_ARIAL_FONTS/);
});
