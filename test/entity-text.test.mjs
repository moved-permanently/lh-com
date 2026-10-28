/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* www's Insights articles carry their text escaped twice (f&amp;uuml;r); the import decodes it
   once (tools/importer/transformers/lufthansa-cleanup.js decodeEntityText), and the existing
   documents were fixed with tools/importer/fix-entity-text.mjs. The lines are real ones of the
   export (tools/source-export/articles, /de/de/articles/explore-the-world/in-my-hood-poblenou-barcelona).
   Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { decodeHTML } from 'entities';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';
import { fixEntityText } from '../tools/importer/fix-entity-text.mjs';

// as www sends it: the figcaption and the component JSON of the Poblenou article
const CAPTION = '<figcaption class="caption"><maui-caption>Die Side Gallery in Poblenou: ein Ort der Inspiration (&amp;copy; Side Gallery; Header-Bild &amp;copy; Getty Images)</maui-caption></figcaption>';
const CAPTION2 = '<figcaption class="caption"><maui-caption> Fotograf Coke Bartrina aus Barcelona arbeitet f&amp;uuml;r Magazine und Lifestyle-Marken</maui-caption></figcaption>';
const DCEP = '<div data-dcep="{&quot;caption&quot;: &quot;Die Side Gallery in Poblenou: ein Ort der Inspiration (&amp;copy; Side Gallery), &amp;quot;Zitat&amp;quot;&quot;}"></div>';

test('the import decodes www\'s twice-escaped article text once (caption, credit, component JSON, title)', () => {
  // the importer runs in Chromium (run-bulk-import.js), whose DOMParser decodes every entity;
  // linkedom's decodes only &amp; &lt; &gt; &quot; &apos;, so the test lends the browser's
  // decoding (the entities package)
  global.DOMParser = class {
    // eslint-disable-next-line class-methods-use-this
    parseFromString(html) {
      const inner = html.match(/<p>([\s\S]*)<\/p>/)[1];
      return { querySelector: () => ({ textContent: decodeHTML(inner) }) };
    }
  };
  const { document } = parseHTML(`<html><head><title>In my hood: Poblenou f&amp;uuml;r Kreative | Lufthansa</title><meta name="description" content="Barcelonas Viertel f&amp;uuml;r Kunst"></head><body><main><div class="section">${CAPTION}${CAPTION2}${DCEP}<p>Miles &amp; More</p></div></main></body></html>`);
  transform('beforeTransform', document.body, { document, url: 'https://www.lufthansa.com/de/de/articles/explore-the-world/in-my-hood-poblenou-barcelona', params: { originalURL: 'https://www.lufthansa.com/de/de/articles/explore-the-world/in-my-hood-poblenou-barcelona' } });
  const captions = [...document.querySelectorAll('maui-caption, figcaption')].map((e) => e.textContent.trim());
  assert.ok(captions.includes('Die Side Gallery in Poblenou: ein Ort der Inspiration (© Side Gallery; Header-Bild © Getty Images)'), captions.join(' | '));
  assert.ok(captions.includes('Fotograf Coke Bartrina aus Barcelona arbeitet für Magazine und Lifestyle-Marken'), captions.join(' | '));
  // the JSON stays JSON: its markup entities are not decoded, the others are
  const json = JSON.parse(document.querySelector('[data-dcep]').getAttribute('data-dcep'));
  assert.equal(json.caption, 'Die Side Gallery in Poblenou: ein Ort der Inspiration (© Side Gallery), &quot;Zitat&quot;');
  assert.match(document.querySelector('title').textContent, /Poblenou für Kreative/);
  assert.equal(document.querySelector('meta[name="description"]').getAttribute('content'), 'Barcelonas Viertel für Kunst');
  // text escaped once (Miles & More) stays as it is
  assert.equal(document.querySelector('p').textContent, 'Miles & More');
});

test('fixEntityText: the documents already in DA, decoded once in their HTML', () => {
  const doc = '<div><p><picture><img src="./media_1.jpg" alt="Interieur f&amp;uuml;r Kreative"></picture></p><p>Die Side Gallery in Poblenou: ein Ort der Inspiration (&amp;copy; Side Gallery; Header-Bild &amp;copy; Getty Images) {caption}</p><p>Miles &amp; More &amp;amp; Partner, 5 &amp;lt; 6, &amp;quot;x&amp;quot; &amp;nbsp;</p><p>&amp;unknownname; stays</p></div>';
  const r = fixEntityText(doc);
  assert.equal(r.html, '<div><p><picture><img src="./media_1.jpg" alt="Interieur für Kreative"></picture></p><p>Die Side Gallery in Poblenou: ein Ort der Inspiration (© Side Gallery; Header-Bild © Getty Images) {caption}</p><p>Miles &amp; More &amp; Partner, 5 &lt; 6, &quot;x&quot;  </p><p>&amp;unknownname; stays</p></div>');
  assert.equal(r.count, 8);
  assert.equal(fixEntityText(r.html).count, 0, 'once only: a second run changes nothing');
});
