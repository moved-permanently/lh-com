/* eslint-disable no-console */
/**
 * Writes tools/importer/upload-all.txt: every imported page (import-progress.json), the nav,
 * footer and fragment documents of the four locales. da-upload.mjs
 * itself refuses anything outside the scope (root index/nav/footer, drafts, test files).
 * Usage: node tools/importer/build-upload-list.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const content = path.join(root, 'content');
const progress = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/import-progress.json'), 'utf8'));
const docsIn = (dir) => {
  const abs = path.join(content, dir);
  return fs.existsSync(abs)
    ? fs.readdirSync(abs).filter((f) => f.endsWith('.plain.html')).map((f) => `/${dir}/${f.replace('.plain.html', '')}`)
    : [];
};

const locales = ['de/en', 'de/de', 'at/de', 'gb/en'];
// fragments no page shows any more (the payment/follow-us band was shown on the /lhg/ pages
// only): not uploaded; their DA documents are removed by hand
const RETIRED_FRAGMENTS = ['payment-social'];
const localeDocs = locales.flatMap((l) => [`/${l}/nav`, `/${l}/footer`, ...docsIn(`${l}/fragments`)
  .filter((p) => !RETIRED_FRAGMENTS.includes(p.split('/').pop()))]);
const pages = Object.entries(progress)
  .filter(([, v]) => v.status === 'ok')
  .map(([u]) => new URL(u).pathname.replace(/\/$/, ''))
  // the AirCore pages (/lhg/) left the replica on 2026-10-25: nothing there is uploaded
  .filter((p) => !p.startsWith('/lhg/'));

const all = [...new Set([...localeDocs, ...pages])];
fs.writeFileSync(path.join(root, 'tools/importer/upload-all.txt'), `${all.join('\n')}\n`);
console.log(`upload list: ${all.length} documents (${localeDocs.length} locale docs, ${pages.length} pages)`);
