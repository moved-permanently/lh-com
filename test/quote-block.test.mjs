/* The quote block (blocks/quote/quote.js, shared): a quotation and the name of the person quoted
   (www's author quote, .quote-text and .subline-text): the first cell with text is the quote, the
   next one the name, in one row or two; a block without text goes. The B2B importer's
   withB2bQuotes: the author quotes of lh-b2b's documents (two paragraphs) as quote blocks.
   Run: node --max-old-space-size=512 --test test/quote-block.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body><main></main></body></html>');
globalThis.window = window;
globalThis.document = document;
const { default: decorate } = await import('../blocks/quote/quote.js');
const { withB2bQuotes } = await import('../tools/importer/b2b-import.mjs');

const blockOf = (inner) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'quote-wrapper';
  wrapper.innerHTML = `<div class="quote block">${inner}</div>`;
  document.querySelector('main').append(wrapper);
  return wrapper.firstElementChild;
};

test('two rows: the quote as a blockquote, the name as its caption, in a figure', () => {
  const block = blockOf('<div><div><p>“Global, strategic — but still personal.”</p></div></div><div><div><p>Anne Delgado</p></div></div>');
  decorate(block);
  const figure = block.querySelector(':scope > figure');
  assert.ok(Boolean(figure), 'a figure');
  assert.equal(block.children.length, 1);
  const quote = figure.querySelector(':scope > blockquote.quote-text');
  assert.equal(quote && quote.textContent, '“Global, strategic — but still personal.”');
  const name = figure.querySelector(':scope > figcaption.quote-name');
  assert.equal(name && name.textContent, 'Anne Delgado');
  assert.ok(name.querySelector('p') === null, 'the name without its paragraph');
});

test('one row of two cells; a cell without a paragraph; empty cells skipped; a third cell ignored', () => {
  const block = blockOf('<div><div></div><div>The crane gave us wings.</div><div><p>Markus Orth</p></div><div>extra</div></div>');
  decorate(block);
  assert.equal(block.querySelector('.quote-text p')?.textContent, 'The crane gave us wings.');
  assert.equal(block.querySelector('.quote-name')?.textContent, 'Markus Orth');
  assert.ok(!block.textContent.includes('extra'));
});

test('a quote without a name: no caption; a block without text: gone with its wrapper', () => {
  const block = blockOf('<div><div><p>Only a quote</p><p>in two lines</p></div></div>');
  decorate(block);
  assert.equal(block.querySelectorAll('.quote-text p').length, 2);
  assert.ok(block.querySelector('figcaption') === null, 'no caption');
  const empty = blockOf('<div><div> </div></div>');
  const wrapper = empty.parentElement;
  decorate(empty);
  assert.ok(wrapper.parentElement === null, 'the wrapper is gone');
});

test('quote.css: www\'s look, scoped to .quote (622 px, 60/80 px, the heading face bold, the name 14/18 light)', () => {
  const css = fs.readFileSync(new URL('../blocks/quote/quote.css', import.meta.url), 'utf8');
  const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').match(/[^{}]+(?=\{)/g).map((s) => s.trim()).filter((s) => s && !s.startsWith('@'));
  rules.forEach((s) => s.split(',').forEach((sel) => assert.ok(sel.trim().startsWith('.quote'), sel)));
  ['max-width: 622px', 'margin: 60px 0', 'margin: 80px 0', 'font-family: var(--heading-font-family)', 'font-weight: 700', 'font-size: 14px', 'line-height: 18px', 'font-weight: 300'].forEach((d) => assert.ok(css.includes(d), d));
});

test('B2B importer: an author quote\'s two paragraphs become a quote block; other paragraphs stay', async () => {
  const src = '<div class="authorquote event"><div class="dcep-author-quote "><div class="author-quote d-flex flex-column "><div class="quote-text text-left mb-0">“Global, strategic — but still personal.”</div><div class="subline-text">Anne Delgado</div></div></div></div>';
  const doc = '<div><p>{column-end-outer}</p><p>“Global, strategic — but still personal.” {full-width}</p><p>Anne Delgado {full-width}</p><p>{column-start-outer}</p><p>Anne Delgado</p></div>';
  const out = withB2bQuotes(doc, src);
  assert.equal(out, '<div><p>{column-end-outer}</p><div class="quote"><div><div><p>“Global, strategic — but still personal.”</p></div></div><div><div><p>Anne Delgado</p></div></div></div><p>{column-start-outer}</p><p>Anne Delgado</p></div>');
  assert.equal(withB2bQuotes(out, src), out, 'once');
  assert.equal(withB2bQuotes(doc, '<p>no quote</p>'), doc, 'a page without an author quote as it was');
  const amp = withB2bQuotes('<div><p>A &amp; B {full-width}</p><p>Dr. X</p></div>', '<div class="quote-text">A &amp; B</div><div class="subline-text">Dr. X</div>');
  assert.equal(amp, '<div><div class="quote"><div><div><p>A &amp; B</p></div></div><div><div><p>Dr. X</p></div></div></div></div>', 'entities as the document has them');
});

test('B2B importer: a quote in a block\'s cell (Jägermeister\'s, beside an image) stays as it is', async () => {
  const src = '<div class="quote-text">"A little piece of home."</div><div class="subline-text">Florian Carl Eisenblätter</div>';
  const doc = '<div><div class="columns-media"><div><div><p>"A little piece of home."</p><p>Florian Carl Eisenblätter</p></div><div><picture><img src="/a.jpg" alt=""></picture></div></div></div></div>';
  assert.equal(withB2bQuotes(doc, src), doc);
});
