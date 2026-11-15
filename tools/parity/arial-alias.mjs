/* eslint-disable import/prefer-default-export, max-len -- dev tooling */
/**
 * Arial for the measuring browser, as an option (off by default; ema-lufthansa, standing order 24 of 2026-11-15).
 *
 * The machine has no face with Arial's widths (fc-match Arial: DejaVu Sans, wider), so text that www and our pages set
 * in Arial (ITA's footer link lists) wraps differently in a measurement than in a visitor's browser
 * (tools/reports/parity-2026-11-09/fonts-so22-arial.txt). With PARITY_ARIAL_FONTS=<dir> holding Liberation Sans
 * (metric-compatible with Arial; release 2.1.5 from the drop, fonts-liberation-sans-2.1.5.tar.gz, SIL OFL; the files
 * are not in git), arialAliasEnv writes a fontconfig file that keeps the system's configuration, adds the dir and maps
 * the family Arial to Liberation Sans, and returns { FONTCONFIG_FILE } for the browser's environment. The generic
 * families (sans-serif) stay the system's.
 *
 *   const browser = await chromium.launch({ env: { ...process.env, ...arialAliasEnv() } });
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const ARIAL_FACES = [
  'LiberationSans-Regular.ttf',
  'LiberationSans-Bold.ttf',
  'LiberationSans-Italic.ttf',
  'LiberationSans-BoldItalic.ttf',
];

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The fontconfig file: the system's configuration, the faces' dir, a cache of its own, Arial -> Liberation Sans. */
export function arialAliasConfig(dir, cacheDir) {
  return `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <include ignore_missing="yes">/etc/fonts/fonts.conf</include>
  <dir>${xml(dir)}</dir>
  <cachedir>${xml(cacheDir)}</cachedir>
  <match target="pattern">
    <test qual="any" name="family"><string>Arial</string></test>
    <edit name="family" mode="assign" binding="strong"><string>Liberation Sans</string></edit>
  </match>
</fontconfig>
`;
}

/**
 * The browser's extra environment: {} unless env.PARITY_ARIAL_FONTS names a dir with the four faces (refused, with
 * the missing file named, when one is not there); then the config is written under workDir (a temp dir by default).
 */
export function arialAliasEnv(env = process.env, { workDir } = {}) {
  const dir = env.PARITY_ARIAL_FONTS;
  if (!dir) return {};
  const abs = path.resolve(dir);
  const missing = ARIAL_FACES.filter((f) => !fs.existsSync(path.join(abs, f)));
  if (missing.length) throw new Error(`PARITY_ARIAL_FONTS=${dir}: missing ${missing.join(', ')}`);
  const work = workDir || fs.mkdtempSync(path.join(os.tmpdir(), 'parity-arial-'));
  const cache = path.join(work, 'fontconfig-cache');
  fs.mkdirSync(cache, { recursive: true });
  const file = path.join(work, 'fonts.conf');
  fs.writeFileSync(file, arialAliasConfig(abs, cache));
  return { FONTCONFIG_FILE: file };
}
