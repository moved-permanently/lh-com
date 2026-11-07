/* eslint-disable max-len, import/extensions -- dev tooling */
/* Austrian's culinary journey (/<market>/<lang>/culinaryjourney, 10 documents; parity row 42, brief 444): www's
   <culinary-hub> app. The import made it a link to the page on www (withLinkOuts) and read the page with the info
   template, which has no micro-frontend mapping, so a re-import lost the micro-frontend block DA has (written
   outside the importer). Now the hub stays in the snapshot and a page with it takes lh-com's mfe template
   (micro-frontend: culinary-hub, its Configuration and API gateway rows), as on Discover.
   Run: node --max-old-space-size=512 --test test/austrian-culinary-hub.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const hub = '<div class="wrapper section">\n  <culinary-hub data-public-endpoint="" data-configuration="apiKey:x;tmc:1" data-api-gateway="https://api.travelid.austrian.com/one-catering/v1" class="full-width-bg px-0"></culinary-hub></div>';

test('withLinkOuts keeps the culinary hub (the micro-frontend parser reads it)', async () => {
  const { withLinkOuts } = await import('../tools/importer/austrian-import.mjs');
  const html = `<html><head><title>Culinary Journey | Austrian Airlines</title></head><body><div class="section-content">${hub}</div></body></html>`;
  assert.equal(withLinkOuts(html, '/at/de/culinaryjourney'), html);
});

test('templateOf: a page with the culinary hub takes the mfe template', async () => {
  const { templateOf } = await import('../tools/importer/austrian-import.mjs');
  assert.equal(templateOf('/at/de/culinaryjourney', `<body>${hub}</body>`), 'mfe');
  assert.equal(templateOf('/at/de/info', '<body><div class="text"></div></body>'), 'info');
  const { templates } = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
  const mfe = templates.find((t) => t.name === 'mfe');
  assert.ok(mfe.blocks.some((b) => b.name === 'micro-frontend' && b.instances.includes('culinary-hub')));
});
