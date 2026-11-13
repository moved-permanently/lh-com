/* eslint-disable max-len, import/extensions */
/* Brussels' share image (brief 414): every page's og:image, og:image:secure_url and twitter:image
   read about:error on preview and live. The documents' Image row is www's og:image, mostly
   /etc/designs/dcep/logo-lh-og.jpg, which www itself no longer serves (302 to webv4, 403), and on
   the welcome pages two Frontify banners www answers 404 for; Edge Delivery can't fetch them.
   tools/importer/brussels-share-image.mjs puts Brussels' own copy of the logo
   (/content/dam/bel/images/local_images/logo-lh-og.jpg, 1200 x 628, the homepages' share image) in
   their place: brussels-import.mjs on every import, its CLI on the documents in DA (written to a
   folder for the user's harness, nothing uploaded).
   Run: node --test test/brussels-share-image.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { withShareImage, SHARE_IMAGE, DEAD_SHARE_IMAGES } from '../tools/importer/brussels-share-image.mjs';

const row = (src) => `<div><div>Image</div><div><picture><img src="${src}" alt=""></picture></div></div>`;
const doc = (src, extra = '') => `<div><h1>Carry-on baggage</h1><p><picture><img src="${src}" alt="x"></picture></p></div>\n<div><div class="metadata"><div><div>nav</div><div>/be/en/nav</div></div>${row(src)}${extra}</div></div>`;
const DEAD = 'https://www.brusselsairlines.com/etc/designs/dcep/logo-lh-og.jpg';

test('the dead share images: www\'s design logo and the two Frontify banners; the replacement Brussels\' own logo', () => {
  assert.equal(SHARE_IMAGE, 'https://www.brusselsairlines.com/content/dam/bel/images/local_images/logo-lh-og.jpg');
  assert.deepEqual([...DEAD_SHARE_IMAGES].map((u) => u.split('/').pop()), ['logo-lh-og.jpg', '12401866-BA_Imagocampagne-KV_banner_1440x480px_FR.jpg', '12401866-BA_Imagocampagne-KV_banner_1440x480px_UK.jpg']);
});

test('withShareImage: only the Image row\'s dead picture changes (a body picture with the same file stays), byte for byte otherwise; idempotent', () => {
  const before = doc(DEAD);
  const after = withShareImage(before);
  assert.equal(after, before.replace(row(DEAD), row(SHARE_IMAGE)));
  assert.equal(withShareImage(after), after);
  // the row in a DA document (whole <body>), the key in any case, a relative or protocol-less form
  const da = `<body><header></header><main>${doc('//www.brusselsairlines.com/etc/designs/dcep/logo-lh-og.jpg').replace('<div>Image</div>', '<div>image</div>')}</main><footer></footer></body>`;
  assert.match(withShareImage(da), /<div>image<\/div><div><picture><img src="https:\/\/www\.brusselsairlines\.com\/content\/dam\/bel\/images\/local_images\/logo-lh-og\.jpg" alt=""><\/picture><\/div><\/div>/);
  assert.match(withShareImage(doc('/etc/designs/dcep/logo-lh-og.jpg')), /local_images\/logo-lh-og\.jpg" alt=""><\/picture><\/div><\/div>/);
  // a working share image and a document without one: unchanged
  const fine = doc('https://www.brusselsairlines.com/content/dam/bel/images/sn-lexus_experience_2x1.jpg');
  assert.equal(withShareImage(fine), fine);
  assert.equal(withShareImage('<div><p>x</p></div>'), '<div><p>x</p></div>');
});

test('brussels-import.mjs applies it to every document it writes', () => {
  const src = fs.readFileSync(new URL('../tools/importer/brussels-import.mjs', import.meta.url), 'utf8');
  assert.match(src, /import \{ withShareImage \} from '\.\/brussels-share-image\.mjs';/);
  // (the picker's group link after it: withGroupBooking, the brief after 551)
  assert.match(src, /const next = (?:withGroupBooking\()?withShareImage\(withOwnLinks\(/);
});

test('CLI --from a folder: changed documents to --out (DA shape), changes.tsv, changed-paths.txt; resumes', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bru-share-'));
  const from = path.join(tmp, 'from');
  const out = path.join(tmp, 'out');
  const put = (p, html) => { fs.mkdirSync(path.dirname(path.join(from, p)), { recursive: true }); fs.writeFileSync(path.join(from, `${p}.html`), html); };
  const body = (m) => `<body><header></header><main>${m}</main><footer></footer></body>`;
  put('/be/en/a', body(doc(DEAD)));
  put('/be/fr/b', body(doc(SHARE_IMAGE)));
  const list = path.join(tmp, 'paths.txt');
  fs.writeFileSync(list, '/be/en/a\n/be/fr/b\n/be/nl/missing\n');
  const cli = path.join(root, 'tools/importer/brussels-share-image.mjs');
  const run = () => execFileSync('node', [cli, '--from', from, '--list', list, '--out', out], { encoding: 'utf8', timeout: 20000 });
  assert.match(run(), /3 paths, 0 already done, 1 changed, 1 unchanged, 1 error/);
  assert.equal(fs.readFileSync(path.join(out, 'be/en/a.html'), 'utf8'), withShareImage(body(doc(DEAD))));
  assert.equal(fs.existsSync(path.join(out, 'be/fr/b.html')), false);
  assert.equal(fs.readFileSync(path.join(out, 'changed-paths.txt'), 'utf8'), '/be/en/a\n');
  const rows = fs.readFileSync(path.join(out, 'changes.tsv'), 'utf8').trim().split('\n').map((l) => l.split('\t').slice(0, 2));
  assert.deepEqual(rows, [['path', 'status'], ['/be/en/a', 'changed'], ['/be/fr/b', 'unchanged'], ['/be/nl/missing', 'error']]);
  assert.match(run(), /2 already done, 0 changed, 0 unchanged, 1 error/);
  fs.rmSync(tmp, { recursive: true, force: true });
});
