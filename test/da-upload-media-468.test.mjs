/* eslint-disable max-len, import/extensions */
/* da-upload's media (brief 468): a picture the document references that is not in the local tree but already in DA (a
   copy uploaded from another tree, DA's own copy of an earlier import) is no problem: DA is asked before the warning,
   and the picture is noted in the state as DA's. Only a picture neither has is "missing image".
   da-upload-sites.mjs mediaStep. Run: node --max-old-space-size=256 --test test/da-upload-media-468.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mediaStep } from '../tools/importer/da-upload-sites.mjs';

test('mediaStep: known, upload, in DA, missing; DA asked only for a picture with no local file', () => {
  let asked = 0;
  const inDa = (yes) => () => { asked += 1; return yes; };
  assert.equal(mediaStep({ known: true, localExists: false, inDa: inDa(false) }), 'known');
  assert.equal(mediaStep({ known: false, localExists: true, inDa: inDa(false) }), 'upload');
  assert.equal(asked, 0);
  assert.equal(mediaStep({ known: false, localExists: false, inDa: inDa(true) }), 'in-da');
  assert.equal(mediaStep({ known: false, localExists: false, inDa: inDa(false) }), 'missing');
  assert.equal(asked, 2);
  assert.equal(mediaStep({
    known: true, force: true, localExists: true, inDa: inDa(true),
  }), 'upload');
  assert.equal(mediaStep({
    known: true, force: true, localExists: false, inDa: inDa(true),
  }), 'in-da');
});

test('da-upload asks DA (GET, body dropped) before it reports a missing image, and notes DA\'s pictures in the state', () => {
  const js = fs.readFileSync(new URL('../tools/importer/da-upload.mjs', import.meta.url), 'utf8');
  assert.match(js, /const inDa = \(\) => curl\(\['-o', '\/dev\/null', `https:\/\/admin\.da\.live\/source\/\$\{ORG\}\/\$\{SITE\}\$\{m\}`\]\)\.status === 200;/);
  assert.match(js, /mediaStep\(\{\s+known: Boolean\(state\.media\[m\]\), force: has\('force'\), localExists: fs\.existsSync\(local\), inDa,\s+\}\)/);
  assert.match(js, /state\.media\[m\] = \{ at: new Date\(\)\.toISOString\(\), inDa: true \};/);
  assert.match(js, /problem\(`\$\{p\}: missing image \$\{m\} \(not in DA either\)`\)/);
});
