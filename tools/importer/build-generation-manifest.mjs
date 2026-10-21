/* eslint-disable */
// Builds migration-work/block-generation-manifest.json (array) from one or more template
// analyses, merging every occurrence of a block across templates.
// Usage: node tools/importer/build-generation-manifest.mjs [template ...]
//        (default: every migration-work/templates/*/authoring-analysis.json)
import fs from 'node:fs';
import path from 'node:path';

const { resolveBlockTarget } = await import('/home/node/.excat-marketplaces/excat-marketplace/excat/sub-agents/excat-block-generator/scripts/build-generation-manifest.js');
const root = process.cwd();
const base = 'migration-work/templates';
const names = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(base).filter((t) => fs.existsSync(path.join(base, t, 'authoring-analysis.json')));

const byBlock = new Map();
for (const name of names) {
  const a = JSON.parse(fs.readFileSync(path.join(base, name, 'authoring-analysis.json'), 'utf8'));
  for (const s of a.sections || []) {
    for (const q of s.sequences || []) {
      if (q.decision !== 'block') continue;
      const block = q.blockVariant || q.blockName;
      const baseBlock = q.baseBlock || block;
      const e = byBlock.get(block) || {
        block, baseBlock, options: [], blockContent: [], sectionMetadata: [], visualCharacteristics: [], contentPattern: [], notes: [], sourceUrls: [], screenshots: [],
      };
      (q.options || []).forEach((o) => {
        const opt = typeof o === 'string' ? { class: o, label: o } : o;
        if (!e.options.find((x) => x.class === opt.class)) e.options.push(opt);
      });
      e.blockContent.push({ template: name, url: a.url, content: q.content });
      if (s.sectionMetadata) e.sectionMetadata.push(s.sectionMetadata);
      if (q.visualCharacteristics) e.visualCharacteristics.push(q.visualCharacteristics);
      const st = a.blockStructures?.[block];
      const pattern = st && (st.structure || JSON.stringify(st));
      if (pattern && !e.contentPattern.includes(pattern)) e.contentPattern.push(pattern);
      if (q.variantNote) e.notes.push(`${name}: ${q.variantNote}`);
      if (!e.sourceUrls.includes(a.url)) e.sourceUrls.push(a.url);
      const shot = path.join(base, name, 'screenshot.png');
      if (!e.screenshots.includes(shot)) e.screenshots.push(shot);
      if (!e.description) e.description = q.description;
      byBlock.set(block, e);
    }
  }
}

const entries = [];
for (const e of byBlock.values()) {
  const t = resolveBlockTarget({ projectRoot: root, block: e.block, baseBlock: e.baseBlock, options: e.options, projectType: 'da' });
  console.log(`${e.block}: ${t.status} (${e.sourceUrls.length} page${e.sourceUrls.length > 1 ? 's' : ''})`);
  if (!['generate', 'augment'].includes(t.status)) continue;
  entries.push({
    ...t,
    block: e.block,
    baseBlock: e.baseBlock,
    projectType: 'da',
    sourceUrl: e.sourceUrls[0],
    sourceUrls: e.sourceUrls,
    screenshots: e.screenshots,
    canonicalModel: 'standalone',
    options: e.options,
    blockContent: e.blockContent,
    sectionMetadata: e.sectionMetadata,
    visualCharacteristics: e.visualCharacteristics,
    contentPattern: e.contentPattern.join('\n'),
    description: e.description,
    notes: e.notes,
  });
}
fs.writeFileSync('migration-work/block-generation-manifest.json', JSON.stringify(entries, null, 2));
console.log('manifest entries', entries.length);
