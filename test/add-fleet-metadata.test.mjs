/* eslint-disable import/extensions */
/* tools/importer/add-fleet-metadata.mjs: the fleet pages' aircraft-code / aircraft-order rows for
   every live root. It stopped at the first root whose fleet documents weren't in the workspace
   (ENOENT on content/xx/fr/320.plain.html, the de/en re-import of brief 435), so the roots after it
   got nothing and the redirect list wasn't written. Now a missing document is skipped and listed;
   every root's redirect rows are still written (they don't depend on the documents).
   Run: node --test test/add-fleet-metadata.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const { fleetMetadata } = await import('../tools/importer/add-fleet-metadata.mjs');

test('a root without local documents is skipped and listed, the others written, every redirect row kept', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fleet-'));
  fs.mkdirSync(path.join(root, 'content/de/en/discover-lufthansa/lufthansa-fleet'), { recursive: true });
  const meta = '<div><div class="metadata"><div><div>Title</div><div>A320</div></div></div></div>';
  ['359', 'discover-lufthansa/lufthansa-fleet/351', '320', '32n', 'boeing787', '744'].forEach((slug) => fs.writeFileSync(path.join(root, 'content/de/en', `${slug}.plain.html`), meta));
  const r = fleetMetadata({ root, locales: ['xx/fr', 'de/en'] });
  assert.equal(r.docs.length, 6);
  assert.ok(r.docs.every((d) => d.startsWith('/de/en/')));
  assert.equal(r.missing.length, 6);
  assert.ok(r.missing.every((d) => d.startsWith('/xx/fr/')));
  assert.match(fs.readFileSync(path.join(root, 'content/de/en/320.plain.html'), 'utf8'), /<div><div>aircraft-code<\/div><div>320<\/div><\/div>/);
  assert.equal(r.redirects.filter((x) => x.Source.startsWith('/xx/fr/')).length, 5);
  assert.equal(r.redirects.filter((x) => x.Source.startsWith('/de/en/')).length, 5);
  fs.rmSync(root, { recursive: true, force: true });
});
