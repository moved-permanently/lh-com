/* eslint-disable max-len */
/* Portuguese for lufthansa.com (tools/reports/markets/pt.md): www's market-neutral xx/pt has pages
   of its own (Portuguese, its own canonical, as xx/es and xx/fr: the captures of 2026-11-03), so it
   is Portuguese's language version, and www's three Portuguese roots with own sitemaps (ao/pt,
   br/pt, pt/pt) are its market roots: tools/markets/rollout.mjs LANGUAGE_BATCHES, batch 13 after
   French (11) and Spanish (12). No locale row yet (the table is ema-adobe's): the batch only.
   Run: node --max-old-space-size=512 --test test/markets-pt.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
// eslint-disable-next-line import/extensions
import { batches, LANGUAGE_BATCHES } from '../tools/markets/rollout.mjs';

test('rollout: Portuguese is batch 13 with its language version xx/pt and the market roots ao/pt, br/pt, pt/pt', () => {
  assert.deepEqual(LANGUAGE_BATCHES.find((l) => l.lang === 'pt'), { lang: 'pt', version: 'xx/pt' });
  const pt = batches().find((x) => x.lang === 'pt');
  assert.equal(pt.n, 13);
  assert.equal(pt.version, 'xx/pt');
  assert.deepEqual(pt.roots, ['ao/pt', 'br/pt', 'pt/pt']);
  assert.deepEqual(pt.countries, ['ao', 'br', 'pt']);
  // French and Spanish as before
  assert.equal(batches().find((x) => x.lang === 'fr').n, 11);
  assert.equal(batches().find((x) => x.lang === 'es').n, 12);
});
