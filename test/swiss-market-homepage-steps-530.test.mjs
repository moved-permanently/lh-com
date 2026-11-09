/* eslint-disable max-len */
/* SWISS's market homepages (the brief after 526, item 2; SWISS row 47): the 30 market roots waiting for the capture round
   (reimport-518-swiss-homepages.txt) are imported by swiss-market-import.mjs, whose document chain lacked two steps the
   language versions' importer has: the fares conditions once, in the destination finder's Conditions row
   (withFinderConditions, SWISS row 44) and the icon tiles' SWISS icons (withSwissIcons, SWISS row 46). Both are wired into
   its chain now, after the hero and flight search steps and before the links are made relative.
   Run: node --max-old-space-size=256 --test test/swiss-market-homepage-steps-530.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../tools/importer/swiss-market-import.mjs', import.meta.url), 'utf8');

test('row 47: the market importer imports both steps from swiss-import.mjs', () => {
  const imports = src.match(/import \{([^}]*)\} from '\.\/swiss-import\.mjs';/)[1];
  assert.match(imports, /\bwithFinderConditions\b/);
  assert.match(imports, /\bwithSwissIcons\b/);
});

test('row 47: the document chain runs them with the page\'s snapshot, before the links are made relative', () => {
  const chain = src.slice(src.indexOf('made.forEach((p) => {'), src.indexOf('-upload.txt`)'));
  assert.match(chain, /doc = withSwissIcons\(withFinderConditions\(doc, snapHtml\)\.doc\);/);
  assert.ok(chain.indexOf('withFinderConditions(') > chain.indexOf('withHeroVideo('), 'after the hero and flight search steps');
  assert.ok(chain.indexOf('withFinderConditions(') < chain.indexOf('relativeDamLinks('), 'before the links');
});
