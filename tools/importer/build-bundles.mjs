/* eslint-disable no-console */
/**
 * Rebuilds the import bundles atomically, so a running capture/import loop never loads a
 * half-written bundle: regenerates tools/importer/import-<template>.js (build-import-script.js),
 * bundles a temporary copy with @adobe/aem-import-helper (offline, from the npx cache) and
 * renames the result over tools/importer/import-<template>.bundle.js.
 *
 * Usage: node tools/importer/build-bundles.mjs [<template> ...]   (default: every template)
 *        AEM_IMPORT_HELPER=/path/to/aem-import-helper node tools/importer/build-bundles.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../..');
const { templates } = JSON.parse(fs.readFileSync(path.join(dir, 'page-templates.json'), 'utf8'));
const names = process.argv.slice(2).length ? process.argv.slice(2) : templates.map((t) => t.name);

let failed = 0;
names.forEach((name) => {
  const tmpBase = `.tmp-bundle-${name}-${process.pid}`;
  const tmpJs = path.join(dir, `${tmpBase}.js`);
  const tmpBundle = path.join(dir, `${tmpBase}.bundle.js`);
  try {
    execFileSync('node', [path.join(dir, 'build-import-script.js'), name], { cwd: root, stdio: 'pipe' });
    fs.copyFileSync(path.join(dir, `import-${name}.js`), tmpJs);
    // AEM_IMPORT_HELPER: path of an installed aem-import-helper binary when the npx cache has none
    const helper = process.env.AEM_IMPORT_HELPER;
    const [cmd, pre] = helper ? [helper, []] : ['npx', ['--offline', '@adobe/aem-import-helper']];
    execFileSync(cmd, [...pre, 'bundle', '--importjs', path.relative(root, tmpJs)], {
      cwd: root, stdio: 'pipe', timeout: 300000,
    });
    const code = fs.readFileSync(tmpBundle, 'utf8').split(`${tmpBase}.js`).join(`import-${name}.js`);
    if (!code.includes('CustomImportScript')) throw new Error('bundle without CustomImportScript');
    fs.writeFileSync(tmpBundle, code);
    fs.renameSync(tmpBundle, path.join(dir, `import-${name}.bundle.js`));
    console.log(`${name}: bundle rebuilt`);
  } catch (e) {
    failed += 1;
    console.error(`${name}: FAILED ${(e.stderr || e.message || '').toString().split('\n').slice(-5).join(' ')}`);
  } finally {
    [tmpJs, tmpBundle].forEach((f) => { if (fs.existsSync(f)) fs.unlinkSync(f); });
  }
});
process.exit(failed ? 1 : 0);
