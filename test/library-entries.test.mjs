/* The block library's entries as DA reads them, per site (lh-com: tools/library/library-variants.json;
   lh-tap: tools/library/sites/lh-tap/library-variants.json, written by
   tools/library/build-library.mjs with the documents): every entry has a name (its H2); the
   canvas toolbar's variant picker (da-live splitLibraryVariant, 5a5578d3) and the Block
   Inspector take the option value from its parentheses, which must be the table header's
   options exactly ("faq, spaced"); the later structures' names ("…: text | list") are no
   variant of the block. Where the documents are there (the site's library folder), the same
   for every H2 and the table after it; no other table in the documents.
   Run: node --max-old-space-size=512 --test test/library-entries.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITES = [
  { name: 'lh-com', manifest: 'tools/library/library-variants.json', lib: 'content/library/blocks' },
  { name: 'lh-tap', manifest: 'tools/library/sites/lh-tap/library-variants.json', lib: 'content-sites/lh-tap/content/library/blocks' },
];

// da-live blocks/canvas/ew-block-toolbar/ew-block-toolbar.js (5a5578d3)
function splitLibraryVariant(variant) {
  const name = variant?.name || '';
  const match = name.match(/^(.*\S)\s*\(([^)]+)\)\s*$/);
  if (match) return { base: match[1].trim(), variant: match[2].trim() };
  if (variant?.variants) return { base: name, variant: variant.variants };
  return { base: name, variant: '' };
}
const normalizeBlockName = (name) => (name || '').toLowerCase().replace(/[\s_-]+/g, ' ').trim();

/** The picker's option value for an entry of a block, or null (no variant of the block). */
function pickerOption(name, block) {
  const { base, variant } = splitLibraryVariant({ name });
  return normalizeBlockName(base) === normalizeBlockName(block) ? variant : null;
}

SITES.forEach((site) => {
  const file = path.join(root, site.manifest);
  const skip = !fs.existsSync(file) && `${site.name}'s library not built`;
  const manifest = skip ? {} : JSON.parse(fs.readFileSync(file, 'utf8'));

  test(`${site.name}: every library entry has a name (its H2)`, { skip }, () => {
    assert.ok(Object.keys(manifest).length);
    const unnamed = Object.entries(manifest).filter(([, e]) => !e.name).map(([k]) => k);
    assert.deepEqual(unnamed, []);
  });

  test(`${site.name}: the first entry of a variant: the picker's option value is the table header's options exactly`, { skip }, () => {
    Object.entries(manifest).filter(([, e]) => !e.heading).forEach(([key, e]) => {
      assert.equal(pickerOption(e.name, e.block), e.variant, key);
    });
  });

  test(`${site.name}: later structures and content variants are no variant of the block for the picker`, { skip }, () => {
    Object.entries(manifest).filter(([, e]) => e.heading).forEach(([key, e]) => {
      assert.equal(pickerOption(e.name, e.block), null, key);
    });
  });

  const LIB = path.join(root, site.lib);
  // the documents the build writes (a document of a block no longer in the library may stay in the folder)
  const built = new Set(Object.values(manifest).map((e) => e.block));
  const docs = fs.existsSync(LIB) ? fs.readdirSync(LIB).filter((f) => f.endsWith('.plain.html') && built.has(f.replace(/\.plain\.html$/, ''))) : [];
  test(`${site.name}: the documents: an H2 right before every table, its options as the table header's`, { skip: skip || (!docs.length && 'no local library documents') }, () => {
    docs.forEach((f) => {
      const block = f.replace(/\.plain\.html$/, '');
      const { document } = parseHTML(`<html><body><main>${fs.readFileSync(path.join(LIB, f), 'utf8')}</main></body></html>`);
      [...document.querySelectorAll('main > div')].forEach((section, i) => {
        const tables = [...section.children].filter((el) => el.tagName === 'DIV' && !el.classList.contains('library-metadata'));
        assert.equal(tables.length, 1, `${f} section ${i + 1}: one table`);
        assert.ok(!section.querySelector('.section-metadata, .metadata'), `${f} section ${i + 1}: no helper table`);
        const h2 = section.querySelector(':scope > h2');
        assert.ok(h2 && h2.textContent.trim(), `${f} section ${i + 1}: an H2`);
        assert.equal(tables[0].previousElementSibling, h2, `${f} section ${i + 1}: the H2 right before the table`);
        const [name, ...opts] = tables[0].className.trim().split(/\s+/);
        assert.equal(name, block, f);
        const option = pickerOption(h2.textContent.trim(), name);
        if (option !== null) assert.equal(option, opts.join(', '), `${f}: ${h2.textContent}`);
      });
    });
  });
});

test('lh-com: cards and columns (the starter page\'s) are not in the library', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, SITES[0].manifest), 'utf8'));
  assert.deepEqual(Object.values(manifest).filter((e) => ['cards', 'columns'].includes(e.block)), []);
});
