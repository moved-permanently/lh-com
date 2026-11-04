/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue */
/**
 * Uploads the block library to Document Authoring (the Block Inspector and DA's Blocks panel
 * read it from content.da.live with the author's login): content/library/blocks/<block>.plain.html
 * (its <main>, wrapped as DA's document) to /library/blocks/<block>.html, and with --sheet
 * content/library/blocks.json and content/library/ema-library.json to /library/blocks.json and
 * /library/ema-library.json (previewed with --preview too). Then reads every document back and compares it with the local file.
 * --only a,b: only these block documents. --preview: previews each uploaded document on
 * main--lh-com--moved-permanently.aem.page (never published).
 *
 * --site lh-tap: lh-tap's library to DA moved-permanently/lh-tap /library/ (its sheets:
 * blocks.json only; tools/library/sites.mjs).
 *
 * Usage: node tools/library/upload-library.mjs [--site lh-tap] [--only a,b] [--preview] [--sheet] [--dry]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { siteConfig, siteArg } from './sites.mjs';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = siteConfig(siteArg());
const LIB = SITE.library;
const SOURCE = SITE.source;
const argv = process.argv.slice(2);
const dry = argv.includes('--dry');
const only = argv.includes('--only') ? new Set(argv[argv.indexOf('--only') + 1].split(',').map((b) => b.trim())) : null;
const { preview: PREVIEW } = SITE;

// curl: Document Authoring credentials are added to admin.da.live requests by the environment
async function curl(args) {
  const { stdout } = await run('curl', ['-s', '-w', '\n%{http_code}', ...args], { maxBuffer: 64 * 1024 * 1024 });
  const i = stdout.lastIndexOf('\n');
  return { status: Number(stdout.slice(i + 1)), body: stdout.slice(0, i) };
}

// the documents: <block>.plain.html, uploaded as <body><header></header><main>…</main><footer></footer></body>
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'library-'));
const files = fs.readdirSync(path.join(LIB, 'blocks')).filter((f) => f.endsWith('.plain.html') && (!only || only.has(f.replace(/\.plain\.html$/, '')))).sort()
  .map((f) => {
    const name = f.replace(/\.plain\.html$/, '');
    const local = path.join(TMP, `${name}.html`);
    fs.writeFileSync(local, `<body><header></header><main>${fs.readFileSync(path.join(LIB, 'blocks', f), 'utf8')}</main><footer></footer></body>`);
    return {
      local, remote: `${SOURCE}/blocks/${name}.html`, preview: `${PREVIEW}/blocks/${name}`, type: 'text/html',
    };
  });
if (only && files.length !== only.size) throw new Error(`--only: ${only.size} names, ${files.length} documents found`);
if (argv.includes('--sheet')) {
  SITE.sheets.forEach((f) => files.push({
    local: path.join(LIB, f), remote: `${SOURCE}/${f}`, preview: `${PREVIEW}/${f}`, type: 'application/json',
  }));
}

const problems = [];
for (const f of files) {
  if (dry) { console.log(`would upload ${f.remote}`); continue; }
  const up = await curl(['-X', 'POST', '-F', `data=@${f.local};type=${f.type}`, f.remote]);
  if (up.status < 200 || up.status > 299) { problems.push(`${f.remote}: upload ${up.status} ${up.body.slice(0, 120)}`); continue; }
  const back = await curl([f.remote]);
  const same = f.type === 'application/json'
    ? JSON.stringify(JSON.parse(back.body || '{}')[':names'] || JSON.parse(back.body || '{}').total) === JSON.stringify(JSON.parse(fs.readFileSync(f.local, 'utf8'))[':names'] || JSON.parse(fs.readFileSync(f.local, 'utf8')).total)
    : back.body.trim() === fs.readFileSync(f.local, 'utf8').trim();
  if (back.status !== 200 || !same) { problems.push(`${f.remote}: read back ${back.status}${same ? '' : ', differs from the local file'}`); continue; }
  if (argv.includes('--preview') && f.preview) {
    const pv = await curl(['-X', 'POST', f.preview]);
    if (pv.status !== 200) problems.push(`${f.preview}: preview ${pv.status} ${pv.body.slice(0, 120)}`);
    else console.log(`previewed ${f.preview.replace(/^.*\/main/, '')}`);
  }
}
console.log(`upload-library: ${files.length} files, ${problems.length} problems`);
problems.forEach((p) => console.log(`  ${p}`));
if (problems.length) process.exitCode = 1;
