/* eslint-disable no-console, max-len */
/**
 * AirCore route pages: the live JSON-LD (recorded by bd-record-head.mjs in
 * tools/source-export/heads/{path}.json) as one value per page for the "json-ld" metadata row
 * (head-metadata.mjs writes it): {"@context": "https://schema.org", "@graph": [BreadcrumbList,
 * Flight..., FAQPage, Product]} in live order.
 *
 * Prices: the recording is newer than the import, so the live "from" price has moved on (e.g.
 * frankfurt-new-york 528 € on 2026-10-24, 545 € on the imported page). The Product offer takes
 * the price and currency the page shows (its h1 "... from 545 €" / "... ab 458 €"), and the
 * same live price in the FAQ answers ("start at 528 €") is replaced by it.
 *
 * Also writes the live hreflang alternates of the de/en route pages into the "hreflang" column
 * of tools/migration-scope/aircore.csv ("de-de https://... en-de https://..."; recorded only, not
 * rendered).
 *
 * Usage: node tools/importer/build-aircore-jsonld.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const headsDir = path.join(root, 'tools/source-export/heads');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  const p = path.join(dir, d.name);
  if (d.isDirectory()) return walk(p);
  return p.endsWith('.json') ? [p] : [];
});
const CURRENCY = { '€': 'EUR', '£': 'GBP', $: 'USD' };

const out = {}; const hreflang = {}; const problems = [];
walk(headsDir).forEach((file) => {
  const p = file.slice(headsDir.length).replace(/\.json$/, '');
  const rec = JSON.parse(fs.readFileSync(file, 'utf8'));
  hreflang[p] = rec.hreflang.map((h) => `${h.hreflang} ${h.href}`).join(' ');
  const items = rec.jsonld.filter((j) => j.data).map((j) => {
    const { '@context': ctx, ...rest } = j.data;
    return rest;
  });
  if (rec.jsonld.some((j) => !j.data)) problems.push(`${p}: invalid JSON-LD on live`);
  const contentFile = path.join(root, 'content', `${p}.plain.html`);
  if (!fs.existsSync(contentFile)) { problems.push(`${p}: no content`); return; }
  const html = fs.readFileSync(contentFile, 'utf8');
  const h1 = ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '').replace(/<[^>]+>/g, '');
  // the h1 ("... from 545 €"), else the first "from / ab" price of the page (the stage offer
  // card "Hin- und Rückflug ab 545 €" on the de/de direct-flight pages, whose h1 has no price)
  const PRICE = /(?:from|ab)\s+([\d.,]+)\s*(€|£|\$)/i;
  const m = h1.match(PRICE) || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').match(PRICE);
  const product = items.find((i) => i['@type'] === 'Product');
  let json = JSON.stringify(items);
  if (product && product.offers && m) {
    const price = Number(m[1].replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.'));
    const currency = CURRENCY[m[2]];
    const livePrice = product.offers.price;
    const liveSymbol = Object.keys(CURRENCY).find((s) => CURRENCY[s] === product.offers.priceCurrency) || '€';
    if (livePrice !== price) {
      json = json.split(`${livePrice} ${liveSymbol}`).join(`${price} ${m[2]}`)
        .split(`${livePrice} ${liveSymbol}`).join(`${price} ${m[2]}`);
    }
    const graph = JSON.parse(json);
    const prod = graph.find((i) => i['@type'] === 'Product');
    prod.offers.price = price;
    prod.offers.priceCurrency = currency;
    out[p] = { '@context': 'https://schema.org', '@graph': graph };
    console.log(`${p}: ${graph.length} items (${[...new Set(graph.map((i) => i['@type']))].join(', ')}), offer ${price} ${currency}${livePrice !== price ? ` (live now ${livePrice} ${product.offers.priceCurrency})` : ''}`);
  } else {
    problems.push(`${p}: ${product ? 'no "from" price in the h1' : 'no Product'}`);
  }
});
fs.writeFileSync(path.join(root, 'tools/importer/aircore-jsonld.json'), `${JSON.stringify(out, null, 1)}\n`);

// hreflang column of aircore.csv (de/en paths)
const csvFile = path.join(root, 'tools/migration-scope/aircore.csv');
const lines = fs.readFileSync(csvFile, 'utf8').trim().split('\n');
const header = lines[0].split(',');
const col = header.indexOf('hreflang');
const rows = lines.map((l, i) => {
  const cells = l.split(',');
  if (i === 0) { if (col < 0) cells.push('hreflang'); return cells.join(','); }
  const value = hreflang[cells[1]] || '';
  if (col < 0) cells.push(value); else cells[col] = value;
  return cells.join(',');
});
fs.writeFileSync(csvFile, `${rows.join('\n')}\n`);
console.log(`aircore-jsonld: ${Object.keys(out).length} pages; hreflang for ${Object.keys(hreflang).filter((p) => lines.some((l) => l.split(',')[1] === p)).length} aircore.csv rows; problems: ${problems.length ? problems.join('; ') : 'none'}`);
