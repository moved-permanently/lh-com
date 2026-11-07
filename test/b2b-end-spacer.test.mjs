/* eslint-disable max-len, import/extensions -- dev tooling */
/* B2B (brief 444 item 4): business.lufthansagroup.com ends 12 pages with a separator (an inline margin-bottom of
   30, 60 or 90 px), and that margin shows there (/de/en/travel-solutions/lufthansa-group-airlines: the last link's
   ink 121 px above the footer at 1440, 81 at 390; ours 80 and 49). lh-com's cleanup drops a separator at the end
   of a section (lufthansa.com's last component has no margin). withEndSpacer writes it back as {spacer-N} at the
   end of the document's last content section, when www's main content ends with one and the document does not.
   Run: node --max-old-space-size=512 --test test/b2b-end-spacer.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sep = (n) => `<div class="separator">\n  <div aria-hidden="true" style="margin-bottom: ${n}px;" class="hr hr-no-layout "><maui-divider role="separator" theme="b2b"></maui-divider></div>\n</div>`;
const page = (end) => `<main><div class="section-content"><div class="text"><p>Last</p></div>${end}</div></div></main>\n<link rel="stylesheet" href="/x.css">\n<footer id="footer"></footer>`;
const meta = '<div class="metadata"><div><div>nav</div><div>/de/en/nav</div></div></div>';

test('a page that ends with a separator: {spacer-N} at the end of the last content section, before the metadata', async () => {
  const { withEndSpacer } = await import('../tools/importer/b2b-import.mjs');
  const doc = `<div><h1>A</h1></div>\n<div><p>Last</p><p>{column-end-outer}</p>${meta}</div>`;
  assert.equal(withEndSpacer(doc, page(sep(30))), `<div><h1>A</h1></div>\n<div><p>Last</p><p>{column-end-outer}</p><p>{spacer-30}</p>${meta}</div>`);
  const own = `<div><p>Last</p></div>\n<div>${meta}</div>`;
  assert.equal(withEndSpacer(own, page(sep(90))), `<div><p>Last</p><p>{spacer-90}</p></div>\n<div>${meta}</div>`, 'metadata in a section of its own: the content section before it');
});

test('no separator at the end, or the document already ends with a spacer: as it was', async () => {
  const { withEndSpacer } = await import('../tools/importer/b2b-import.mjs');
  const doc = `<div><p>Last</p>${meta}</div>`;
  assert.equal(withEndSpacer(doc, page('')), doc);
  assert.equal(withEndSpacer(doc, page(`${sep(30)}<div class="text"><p>More</p></div>`)), doc, 'a separator not at the end');
  const has = `<div><p>Last</p><p>{spacer-30}</p>${meta}</div>`;
  assert.equal(withEndSpacer(has, page(sep(30))), has);
});

test('the airlines page\'s snapshot ends with a 30 px one; the import writes it', () => {
  const f = new URL('../tools/importer/bd-snapshots/business.lufthansagroup.com/de/en/travel-solutions/lufthansa-group-airlines.html', import.meta.url);
  if (fs.existsSync(f)) assert.match(fs.readFileSync(f, 'utf8'), /margin-bottom: 30px;[^]*?<footer/);
  const src = fs.readFileSync(new URL('../tools/importer/b2b-import.mjs', import.meta.url), 'utf8');
  assert.match(src, /const next = withEndSpacer\(withB2bMetadata\(/);
});
