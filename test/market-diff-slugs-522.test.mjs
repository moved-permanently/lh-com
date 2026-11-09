/* eslint-disable max-len, import/extensions, import/no-relative-packages -- tools/market-diff has a package.json of its own */
/* market-diff's replica check and the slug maps (the brief after 518, item 1; ema-cashub's
   tools/reports/slugs/write-step-517.md): a pair is two www paths (the root's page, the version's
   page) and stays so; the replica check asks OUR replica for a page where the write step puts it,
   the map's write target (canonicalOf without `all`: the canonical path once its root's flag is on,
   else the www path, as da-upload writes). With every flag off nothing changes: the same requests
   for every pair on disk. With a flags-on copy of a map the replica is asked at the canonical path,
   the www side at the www path, and each of Lufthansa's localized pairs maps back (wwwPathsOf).
   Run: node --max-old-space-size=1024 --test test/market-diff-slugs-522.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { loadMap } from '../tools/slugs/lib.mjs';
import { replicaMapOf, requestsOf } from '../tools/market-diff/lib/replica-paths.mjs';

const pairsOf = (list) => zlib.gunzipSync(fs.readFileSync(new URL(`../tools/market-diff/lists/${list}/pairs-pending.tsv.gz`, import.meta.url))).toString('utf8')
  .split('\n').slice(1)
  .filter(Boolean)
  .map((l) => l.split('\t'))
  .map(([root, version, rootPath, versionPath]) => ({
    root, version, rootPath, versionPath,
  }));
// the requests as md-replica-check.mjs made them before: our replica at the www path (an AEM path's /content/<site>/markets dropped)
const short = (p) => p.replace(/^\/content\/[^/]+\/markets/, '');
const before = (r) => ({ www: [r.versionPath, r.rootPath], replica: [short(r.rootPath), short(r.versionPath)] });
const HOSTS = {
  lh: 'www.lufthansa.com', swiss: 'www.swiss.com', b2b: 'business.lufthansagroup.com', ita: 'www.ita-airways.com', tap: 'www.flytap.com',
};

test('the map of a www host: lh-com, lh-swiss, lh-b2b; none for ITA and TAP', () => {
  assert.equal(replicaMapOf('www.lufthansa.com').map.site, 'lh-com');
  assert.equal(replicaMapOf('www.swiss.com').map.site, 'lh-swiss');
  assert.equal(replicaMapOf('business.lufthansagroup.com').map.site, 'lh-b2b');
  assert.equal(replicaMapOf('www.ita-airways.com'), null);
  assert.equal(replicaMapOf('www.flytap.com'), null);
  assert.equal(replicaMapOf(''), null);
});

test('every flag off: the same pairs, the same requests as before, for every list on disk', () => {
  const counts = {};
  Object.entries(HOSTS).forEach(([list, host]) => {
    const map = replicaMapOf(host);
    const pairs = pairsOf(list);
    counts[list] = pairs.length;
    pairs.forEach((r) => assert.deepEqual(requestsOf(r, map), before(r), `${list} ${r.rootPath}`));
  });
  assert.equal(counts.lh, 173479);
  assert.equal(counts.swiss, 36205);
  assert.equal(counts.b2b, 47364);
});

test('a flags-on copy of Lufthansa\'s map: the replica at the canonical path, www at the www path, every pair maps back', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'md-slugs-')), 'lh-com.json');
  const on = JSON.parse(fs.readFileSync(new URL('../tools/slugs/lh-com.json', import.meta.url), 'utf8'));
  Object.keys(on.active).forEach((root) => { on.active[root] = true; });
  fs.writeFileSync(file, JSON.stringify(on));
  const map = replicaMapOf('www.lufthansa.com', { file });
  const all = loadMap(JSON.parse(fs.readFileSync(new URL('../tools/slugs/lh-com.json', import.meta.url), 'utf8')));
  let localized = 0;
  pairsOf('lh').forEach((r) => {
    const req = requestsOf(r, map);
    assert.deepEqual(req.www, [r.versionPath, r.rootPath]);
    const [rootAt, versionAt] = req.replica;
    const canonicalRoot = all.canonicalOf(short(r.rootPath), { all: true });
    if (canonicalRoot === short(r.rootPath)) {
      assert.equal(rootAt, short(r.rootPath));
      return;
    }
    localized += 1;
    assert.equal(rootAt, canonicalRoot);
    assert.equal(versionAt, all.canonicalOf(short(r.versionPath), { all: true }));
    assert.ok(all.wwwPathsOf(rootAt).includes(short(r.rootPath)), `${r.rootPath} back from ${rootAt}`);
  });
  assert.equal(localized, 6499);
  fs.rmSync(path.dirname(file), { recursive: true, force: true });
});
