/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 38 of 2026-11-15, item 3: Cargo's legal pages (terms-of-use, general-terms1) as www's legal template
   (cargo-parity-003 at 1440): the content 1,184 px wide from x 128, the running text over the whole of it (not Cargo's
   two thirds); our title stays. Keyed on the page Metadata row Template legal (526457df's row; the importer writes it on
   lufthansa.com only, so Cargo's two documents get it from delta-so38-cargo-legal-template.txt, metadata-row-apply).
   Run: node --test test/cargo-legal-template-so38.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { applyMetadataRow } from '../tools/importer/metadata-row-apply.mjs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8');
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i > 0, sel);
  const media = css.lastIndexOf('@media', i);
  return { body: css.slice(i, css.indexOf('}', i)), media: css.slice(media, css.indexOf('{', media)).trim() };
};

test('the rule: from 1281 px, Cargo\'s legal pages only, 56 px more each side and the text over the whole width', () => {
  const pad = rule('  body.brand-cargo.legal main > .section > div');
  assert.equal(pad.media, '@media (width >= 1281px)');
  assert.match(pad.body, /padding: 0 calc\(var\(--layout-margin\) \+ 56px\);/);
  const text = rule('  body.brand-cargo.legal main > .section > .default-content-wrapper > :is(p, ul, ol)');
  assert.equal(text.media, '@media (width >= 1281px)');
  assert.match(text.body, /max-width: none;/);
  assert.ok(!/main h1[^{]*legal|\.legal[^{]*h1/.test(css), 'our title keeps its style');
  assert.equal((css.match(/\.legal\b/g) || []).length, 2, 'no other legal rule in the theme');
});

test('the rows: Template legal on Cargo\'s two legal pages, named with their tool and data in the list header', () => {
  const dir = new URL('../tools/reports/parity-2026-11-09/', import.meta.url);
  const list = fs.readFileSync(new URL('delta-so38-cargo-legal-template.txt', dir), 'utf8');
  const rows = JSON.parse(fs.readFileSync(new URL('delta-so38-cargo-legal-template.json', dir), 'utf8'));
  assert.deepEqual(rows, [{ key: 'Template', value: 'legal' }]);
  const head = list.split('\n').filter((l) => l.startsWith('#')).slice(0, 3).join('\n');
  assert.match(head, /tools\/importer\/metadata-row-apply\.mjs/);
  assert.match(head, /delta-so38-cargo-legal-template\.json/);
  const paths = list.split('\n').filter((l) => /^(READY|HOLD)\t/.test(l)).map((l) => l.split('\t')[1]);
  assert.deepEqual([...new Set(paths)].sort(), ['/en/footer/bottomnav/terms-of-use', '/en/meta/meta/company/general-terms1']);
  assert.ok(readyPaths(list).every((p) => p === '/en/footer/bottomnav/terms-of-use'));
  const doc = '<body><header></header><main><div><h1>Terms of use</h1><div class="metadata"><div><div>Title</div><div>Terms of use - Lufthansa Cargo</div></div><div><div>Language</div><div>en</div></div></div></div></main><footer></footer></body>';
  const r = applyMetadataRow(doc, rows);
  assert.deepEqual(r.results.map((x) => x.result), ['placed']);
  assert.equal(r.html, doc.replace('<div><div>Language</div><div>en</div></div></div>', '<div><div>Language</div><div>en</div></div><div><div>Template</div><div>legal</div></div></div>'));
});
