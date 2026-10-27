/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue */
/**
 * Uploads the block library to Document Authoring (the Block Inspector and DA's Blocks panel
 * read it from content.da.live with the author's login): content/library/blocks/<block>.html to
 * /library/blocks/<block>.html, and with --sheet content/library/blocks.json to
 * /library/blocks.json. Then reads every document back and compares it with the local file.
 * --only a,b: only these block documents. --preview: previews each uploaded document on
 * main--lh-com--moved-permanently.aem.page (never published).
 *
 * Usage: node tools/library/upload-library.mjs [--only a,b] [--preview] [--sheet] [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LIB = path.join(root, 'content/library');
const SOURCE = 'https://admin.da.live/source/moved-permanently/lh-com/library';
const argv = process.argv.slice(2);
const dry = argv.includes('--dry');
const only = argv.includes('--only') ? new Set(argv[argv.indexOf('--only') + 1].split(',').map((b) => b.trim())) : null;
const PREVIEW = 'https://admin.hlx.page/preview/moved-permanently/lh-com/main/library';

// curl: Document Authoring credentials are added to admin.da.live requests by the environment
async function curl(args) {
  const { stdout } = await run('curl', ['-s', '-w', '\n%{http_code}', ...args], { maxBuffer: 64 * 1024 * 1024 });
  const i = stdout.lastIndexOf('\n');
  return { status: Number(stdout.slice(i + 1)), body: stdout.slice(0, i) };
}

const files = fs.readdirSync(path.join(LIB, 'blocks')).filter((f) => f.endsWith('.html') && (!only || only.has(f.replace(/\.html$/, '')))).sort()
  .map((f) => ({
    local: path.join(LIB, 'blocks', f), remote: `${SOURCE}/blocks/${f}`, preview: `${PREVIEW}/blocks/${f.replace(/\.html$/, '')}`, type: 'text/html',
  }));
if (only && files.length !== only.size) throw new Error(`--only: ${only.size} names, ${files.length} documents found`);
if (argv.includes('--sheet')) files.push({ local: path.join(LIB, 'blocks.json'), remote: `${SOURCE}/blocks.json`, type: 'application/json' });

const problems = [];
for (const f of files) {
  if (dry) { console.log(`would upload ${f.remote}`); continue; }
  const up = await curl(['-X', 'POST', '-F', `data=@${f.local};type=${f.type}`, f.remote]);
  if (up.status < 200 || up.status > 299) { problems.push(`${f.remote}: upload ${up.status} ${up.body.slice(0, 120)}`); continue; }
  const back = await curl([f.remote]);
  const same = f.type === 'application/json'
    ? JSON.stringify(JSON.parse(back.body || '{}')[':names']) === JSON.stringify(JSON.parse(fs.readFileSync(f.local, 'utf8'))[':names'])
    : back.body.trim() === fs.readFileSync(f.local, 'utf8').trim();
  if (back.status !== 200 || !same) { problems.push(`${f.remote}: read back ${back.status}${same ? '' : ', differs from the local file'}`); continue; }
  if (argv.includes('--preview') && f.preview) {
    const pv = await curl(['-X', 'POST', f.preview]);
    if (pv.status !== 200) problems.push(`${f.preview}: preview ${pv.status} ${pv.body.slice(0, 120)}`);
    else console.log(`previewed /library/blocks/${path.basename(f.local, '.html')}`);
  }
}
console.log(`upload-library: ${files.length} files, ${problems.length} problems`);
problems.forEach((p) => console.log(`  ${p}`));
if (problems.length) process.exitCode = 1;
