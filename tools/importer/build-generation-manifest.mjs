/* eslint-disable */
// Builds migration-work/block-generation-manifest.json (array) from migration-work/authoring-analysis.json.
// Usage: node tools/importer/build-generation-manifest.mjs
import fs from 'node:fs';
const { resolveBlockTarget } = await import('/home/node/.excat-marketplaces/excat-marketplace/excat/sub-agents/excat-block-generator/scripts/build-generation-manifest.js');
const root = process.cwd();
const a = JSON.parse(fs.readFileSync('migration-work/authoring-analysis.json', 'utf8'));
const byBlock = new Map();
for (const s of a.sections) for (const q of s.sequences || []) {
  if (q.decision !== 'block') continue;
  const block = q.blockVariant || q.blockName;
  const baseBlock = q.baseBlock || block;
  const e = byBlock.get(block) || { block, baseBlock, options: [], blockContent: [], sectionMetadata: [], visualCharacteristics: [], contentPattern: [] };
  (q.options || []).forEach((o) => { if (!e.options.find((x) => x.class === o.class)) e.options.push(o); });
  e.blockContent.push(q.content);
  if (s.sectionMetadata) e.sectionMetadata.push(s.sectionMetadata);
  if (q.visualCharacteristics) e.visualCharacteristics.push(q.visualCharacteristics);
  const st = a.blockStructures?.[block];
  if (st && !e.contentPattern.includes(st.structure)) e.contentPattern.push(st.structure);
  e.variantNote = q.variantNote; e.description = q.description;
  byBlock.set(block, e);
}
const entries = [];
for (const e of byBlock.values()) {
  const t = resolveBlockTarget({ projectRoot: root, block: e.block, baseBlock: e.baseBlock, options: e.options, projectType: 'da' });
  console.log(e.block, t.status);
  if (!['generate', 'augment'].includes(t.status)) continue;
  entries.push({ ...t, block: e.block, baseBlock: e.baseBlock, projectType: 'da', sourceUrl: a.url, screenshots: ['migration-work/screenshot.png'], canonicalModel: 'standalone', options: e.options, blockContent: e.blockContent, sectionMetadata: e.sectionMetadata, visualCharacteristics: e.visualCharacteristics, contentPattern: e.contentPattern.join('\n'), description: e.description, variantNote: e.variantNote });
}
fs.writeFileSync('migration-work/block-generation-manifest.json', JSON.stringify(entries, null, 2));
console.log('manifest entries', entries.length);
