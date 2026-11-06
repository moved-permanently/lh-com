/* The importer maps a two-column row of teaser cards (www's .twocolumn of a.teaser.card: "More
   information about our in-flight menus" on /de/en/childrens-menus-on-board, the explore-the-world
   articles' card pairs) to carousel-cards on info, insights and hub pages; before, insights had
   nothing for it (columns-media leaves rows with a .teaser) and the cards came in as default
   content, a picture, an h4 and a line per card, stacked full width (parity 2026-11-06). Info got
   its mapping with the b2b pass (65afd3a2: only rows of teaser cards, from the section's content);
   insights takes ".twocolumn:has(a.teaser.card)" as hub does. The generated import scripts carry
   them.
   Run: node --max-old-space-size=256 --test test/importer-twocolumn-teaser-cards.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const templates = JSON.parse(fs.readFileSync('tools/importer/page-templates.json', 'utf8'));
const list = Array.isArray(templates) ? templates : templates.templates;
const isCardRow = (s) => /\.twocolumn:has\(.*a\.teaser\.card/.test(s);

test('info, insights and hub map a two-column row of teaser cards to carousel-cards', () => {
  ['info', 'insights', 'hub'].forEach((name) => {
    const t = list.find((x) => x.name === name);
    const cards = t.blocks.find((b) => b.name === 'carousel-cards');
    assert.ok(cards.instances.some(isCardRow), name);
  });
  const insights = list.find((x) => x.name === 'insights').blocks.find((b) => b.name === 'carousel-cards');
  assert.ok(insights.instances.includes('.twocolumn:has(a.teaser.card)'));
});

test('the generated import scripts carry them', () => {
  ['info', 'insights'].forEach((name) => {
    ['js', 'bundle.js'].forEach((ext) => {
      const src = fs.readFileSync(`tools/importer/import-${name}.${ext}`, 'utf8');
      assert.ok(src.split('\n').some(isCardRow), `import-${name}.${ext}`);
    });
  });
});
