/* eslint-disable no-console, import/no-extraneous-dependencies, import/extensions -- dev tooling */
/**
 * The importers' last step (token-free styling, step 2): their written documents through the
 * collapse (tools/importer/marker-collapse.mjs), in place, after every post-processing step that
 * may still write a marker (an importer's own steps, site-postprocess). No import writes markers.
 * Usage: collapseDocs(files, { brand: 'austrian', content: '<site>/content' }) -> {changed, totals}
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';
import { collapseHtml, totals } from './marker-collapse.mjs';

export default function collapseDocs(files, { brand, content }) {
  let changed = 0;
  const sum = { theme: 0, carrier: 0, hand: 0 };
  files.filter((f) => fs.existsSync(f)).forEach((f) => {
    const html = fs.readFileSync(f, 'utf8');
    const docPath = `/${path.relative(content, f).replace(/\.plain\.html$/, '')}`;
    const r = collapseHtml(html, { path: docPath, brand, parse: parseHTML });
    if (r.html !== html) {
      fs.writeFileSync(f, r.html);
      changed += 1;
    }
    const t = totals(r.stats);
    Object.keys(sum).forEach((k) => { sum[k] += t[k]; });
  });
  console.log(`marker-collapse (${brand}): ${changed} of ${files.length} documents; markers to the theme ${sum.theme}, to carriers ${sum.carrier}, for a person ${sum.hand}`);
  return { changed, totals: sum };
}
