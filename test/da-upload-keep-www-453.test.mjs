/* eslint-disable max-len, import/extensions */
/* da-upload's check that a local copy doesn't take back to www a link DA has relative (own-links.mjs
   linksTakenBack, brief 413) also stopped the fix of a wrong relative link (brief 453: SWISS's
   /digitalassistant/webchat.html, www's chat assistant, 404 on the replica). Paths named with
   --keep-www <prefix,…> are left out of the check: their links may go back to www. Without the
   option as before. Run: node --max-old-space-size=256 --test test/da-upload-keep-www-453.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { linksTakenBack } from '../tools/importer/own-links.mjs';

const da = '<body><header></header><main><div><p><a href="/digitalassistant/webchat.html">Chat</a> <a href="/ch/el/profile/login">Login</a></p></div></main><footer></footer></body>';
const local = '<div><p><a href="https://www.swiss.com/digitalassistant/webchat.html">Chat</a> <a href="https://www.swiss.com/ch/el/profile/login">Login</a></p></div>';

test('linksTakenBack: the paths given as kept on www left out; the others named as before', () => {
  assert.deepEqual(linksTakenBack(da, local), ['/digitalassistant/webchat.html', '/ch/el/profile/login']);
  assert.deepEqual(linksTakenBack(da, local, ['/digitalassistant/']), ['/ch/el/profile/login']);
  assert.deepEqual(linksTakenBack(da, local.replace('https://www.swiss.com/ch/el/profile/login', '/ch/el/profile/login'), ['/digitalassistant/']), []);
});

test('da-upload reads --keep-www (a comma list of path prefixes) and passes it to the check', () => {
  const js = fs.readFileSync(new URL('../tools/importer/da-upload.mjs', import.meta.url), 'utf8');
  assert.match(js, /const keepWww = \(opt\('keep-www'\) \|\| ''\)\.split\(','\)\.map\(\(x\) => x\.trim\(\)\)\.filter\(Boolean\);/);
  assert.match(js, /linksTakenBack\(current\.body, html, keepWww\)/);
  assert.match(js, /\[--keep-www <path prefix,…>\]/);
});
