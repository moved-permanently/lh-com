/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 28 (2026-11-14): Austrian's intro is www's p.copytext-large (Portada 18 / 27) also when the import put the
   title in a section of its own and the intro opens the next one. www's recordings: fly-with-austrian en / de,
   bearbeitungsgebuehren and sustainable-flying (behind its dk / no section), the only four of the 121 recorded documents
   with an H1-only section, and all four p.copytext-large on www. The paragraph right after the H1 keeps its rule.
   Run: node --max-old-space-size=512 --test test/austrian-intro-next-section-so28.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const decorate = async (html, brand = 'austrian') => {
  const { document } = parseHTML(`<html><head></head><body><main>${html}</main></body></html>`);
  globalThis.document = document;
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const main = document.querySelector('main');
  decorateTokenFree(main, { brand, path: '/at/en/x', read: () => '' });
  return [...main.querySelectorAll('p')].map((p) => `${p.textContent.trim()}:${p.className}`).join(' | ');
};

test('the title alone in its section (after the breadcrumb): the next section\'s first paragraph is the intro', async () => {
  const out = await decorate('<div><div class="breadcrumb"></div><h1>Title</h1></div><div><p>Intro</p><p>More</p></div>');
  assert.equal(out, 'Intro:copytext-large | More:');
});

test('a market section between the title and the intro is passed over', async () => {
  const out = await decorate('<div><h1>Title</h1></div><div data-markets="dk,no"><h2>Carbon</h2><p>Market text</p></div><div><p>Intro</p></div>');
  assert.equal(out, 'Market text: | Intro:copytext-large');
});

test('not when the title shares its section, the next section opens otherwise, or the paragraph is a picture', async () => {
  assert.equal(await decorate('<div><h1>Title</h1><div class="columns-media"><div><div>x</div></div></div></div><div><p>Text</p></div>'), 'Text:');
  assert.equal(await decorate('<div><h1>Title</h1></div><div><h2>Heading</h2><p>Text</p></div>'), 'Text:');
  assert.equal(await decorate('<div><h1>Title</h1></div><div><p><picture><img src="a.jpg" alt=""></picture></p><p>Text</p></div>'), ': | Text:');
});

test('the rule after the H1 is unchanged, a marker wins, and other brands are untouched', async () => {
  assert.equal(await decorate('<div><h1>Title</h1><p>Intro</p></div><div><p>Next</p></div>'), 'Intro:copytext-large | Next:');
  assert.equal(await decorate('<div><h1>Title</h1></div><div><p class="copytext-small">Small</p></div>'), 'Small:copytext-small');
  assert.equal(await decorate('<div><h1>Title</h1></div><div><p>Intro</p></div>', 'brussels'), 'Intro:');
});
