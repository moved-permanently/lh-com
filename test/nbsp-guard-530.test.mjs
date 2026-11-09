/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 527, item 1 (no-break spaces through the import; tools/reports/parity-2026-11-09/nbsp-proposal-cashub.md):
   the framework (the plugin's helix-importer: DOMUtils.reviewParagraphs, reviewInlineElement, MDUtils.cleanupMarkdown)
   turns www's no-break spaces into plain ones. tools/importer/nbsp-guard.mjs: guardNbsp, in every import script's onLoad
   (before the framework's steps), writes them as U+2007 (figure space: no www page has one, the framework leaves it), and
   restoreNbsp / withRestoredNbsp (every brand importer's last step, import-batch.mjs after the bulk run, da-upload's
   upload body) writes them back. A paragraph holding only a no-break space (www's empty line, <p>&nbsp;</p>) is not
   guarded: the framework drops it, as before.
   The checks see a changed character, not a changed word: the collapse loss check (lossProblems), the description rules
   (clean, firstTextParagraph) and the plugin's text similarity (tokenize, computeTextSimilarity) give the same result for a
   document with the restored no-break spaces as for today's with plain spaces.
   Run: node --max-old-space-size=256 --test test/nbsp-guard-530.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import {
  NBSP_STAND_IN as STAND_IN, guardNbsp, restoreNbsp, withRestoredNbsp,
} from '../tools/importer/nbsp-guard.mjs';

const NB = '\u00a0';
const HI = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/node_modules/@adobe/helix-importer/src/utils/';
const SIM = '/home/node/.excat-marketplaces/excat-marketplace/excat/utils/content-similarity.js';
const fixture = `<main><div>
<h2>Kilimandjaro,&nbsp;Tanzanie</h2>
<p>Distance&nbsp;: 6&nbsp;773&nbsp;km</p>
<p>&nbsp;</p>
<p><a href="/be/fr/book">Réservez&nbsp;maintenant</a></p>
<table><tr><td>9&nbsp;h&nbsp;15&nbsp;min</td></tr></table>
<p><img src="/a.jpg" alt="Vol&nbsp;BRU"></p>
</div></main>`;
const doc = () => parseHTML(`<html><body>${fixture}</body></html>`).document;

test('the guard: no-break spaces in a paragraph, a heading, a link text and a table cell become the stand-in; the empty line and attributes stay', () => {
  const d = doc();
  guardNbsp(d.body);
  assert.equal(d.querySelector('h2').textContent, `Kilimandjaro,${STAND_IN}Tanzanie`);
  assert.equal(d.querySelector('p').textContent, `Distance${STAND_IN}: 6${STAND_IN}773${STAND_IN}km`);
  assert.equal(d.querySelector('a').textContent, `Réservez${STAND_IN}maintenant`);
  assert.equal(d.querySelector('td').textContent, `9${STAND_IN}h${STAND_IN}15${STAND_IN}min`);
  assert.equal(d.querySelectorAll('p')[1].textContent, NB, 'www\'s empty line is left for the framework to drop');
  assert.equal(d.querySelector('img').getAttribute('alt'), `Vol${NB}BRU`, 'attributes as they are');
  assert.ok(!d.body.innerHTML.includes(`6${NB}773`));
});

test('through the framework\'s own steps (where the plugin is on disk): the empty line dropped, the stand-in kept, then restored', async (t) => {
  if (!fs.existsSync(`${HI}DOMUtils.js`)) { t.skip('no helix-importer on disk'); return; }
  const { default: DOMUtils } = await import(`${HI}DOMUtils.js`);
  const { default: MDUtils } = await import(`${HI}MDUtils.js`);
  const d = doc();
  guardNbsp(d.body);
  DOMUtils.reviewParagraphs(d);
  ['a', 'strong', 'em'].forEach((tag) => DOMUtils.reviewInlineElement(d, tag));
  assert.equal(d.querySelectorAll('p').length, 3, '<p>&nbsp;</p> dropped, as before');
  // the markdown's text (linkedom serialises U+00A0 as &nbsp;, the browser's markdown as the character)
  const md = MDUtils.cleanupMarkdown(d.querySelector('main').textContent);
  assert.ok(md.includes(`6${STAND_IN}773${STAND_IN}km`), 'cleanupMarkdown leaves the stand-in');
  const back = restoreNbsp(md);
  assert.ok(back.includes(`6${NB}773${NB}km`) && back.includes(`Kilimandjaro,${NB}Tanzanie`) && back.includes(`Réservez${NB}maintenant`) && back.includes(`9${NB}h${NB}15${NB}min`));
  assert.ok(!back.includes(STAND_IN));
  // without the guard, as today: every no-break space a plain space
  const today = doc();
  DOMUtils.reviewParagraphs(today);
  assert.ok(MDUtils.cleanupMarkdown(today.querySelector('main').textContent).includes('6 773 km'));
});

test('restore: idempotent, a document without the stand-in byte for byte, its entity forms too; files in place', () => {
  assert.equal(restoreNbsp(`a${STAND_IN}b &#8199; &#x2007; &numsp;`), `a${NB}b ${NB} ${NB} ${NB}`);
  assert.equal(restoreNbsp(restoreNbsp(`a${STAND_IN}b`)), `a${NB}b`);
  const plain = '<p>Nothing&nbsp;here</p>';
  assert.equal(restoreNbsp(plain), plain);
  const dir = fs.mkdtempSync('/tmp/nbsp-530-');
  fs.writeFileSync(`${dir}/a.plain.html`, `<p>6${STAND_IN}773</p>`);
  fs.writeFileSync(`${dir}/b.plain.html`, '<p>no change</p>');
  const files = [`${dir}/a.plain.html`, `${dir}/b.plain.html`, `${dir}/missing.plain.html`];
  const mtime = fs.statSync(`${dir}/b.plain.html`).mtimeMs;
  assert.equal(withRestoredNbsp(files, fs), files, 'the list back, for collapseDocs');
  assert.equal(fs.readFileSync(`${dir}/a.plain.html`, 'utf8'), `<p>6${NB}773</p>`);
  assert.equal(fs.statSync(`${dir}/b.plain.html`).mtimeMs, mtime, 'an unchanged file is not written');
  fs.rmSync(dir, { recursive: true });
});

test('the checks see the restored no-break space as a space: loss check, description rules, text similarity', async () => {
  const todayDoc = '<div><h2>Kilimandjaro, Tanzanie</h2><p>Distance : 6 773 km</p><p><a href="/be/fr/book">Réservez maintenant</a></p></div>';
  const restored = todayDoc.replace('o, T', `o,${NB}T`).replace('e :', `e${NB}:`).replace('6 773 km', `6${NB}773${NB}km`).replace('z m', `z${NB}m`);
  assert.notEqual(restored, todayDoc);
  const { lossProblems } = await import('../tools/importer/collapse-loss-check.mjs');
  assert.deepEqual(lossProblems(todayDoc, restored), [], 'the collapse loss check: no text, link or heading difference');
  const { clean, firstTextParagraph } = await import('../tools/importer/description-rules.js');
  const p = (h) => firstTextParagraph(parseHTML(`<html><body><main>${h}</main></body></html>`).document.querySelector('main'));
  assert.equal(clean(p(restored)?.textContent), clean(p(todayDoc)?.textContent), 'the description rules: the same description');
  if (fs.existsSync(SIM)) {
    const { tokenize, computeTextSimilarity, htmlToText } = await import(SIM);
    assert.deepEqual(tokenize(htmlToText(restored)), tokenize(htmlToText(todayDoc)), 'the plugin\'s tokens: the same words');
    assert.equal(computeTextSimilarity(htmlToText(todayDoc), htmlToText(restored)), 1);
  }
});

test('the wiring: every generated import script guards in onLoad, every brand importer restores at its collapse, import-batch after the run, da-upload in the upload body', () => {
  const read = (f) => fs.readFileSync(new URL(`../tools/importer/${f}`, import.meta.url), 'utf8');
  assert.match(read('build-import-script.js'), /onLoad: \(\{ document \}\) => \{\n {4}executeTransformers\('onLoad', document\.body, \{ document \}\);\n {4}guardNbsp\(document\.body\);/);
  ['app-entry', 'austrian-checkin', 'austrian-flight-status', 'austrian-hero-banner', 'campaign', 'fleet', 'flight-status', 'form', 'homepage', 'hub', 'info', 'insights', 'legal', 'mfe'].forEach((t) => {
    assert.match(read(`import-${t}.js`), /executeTransformers\('onLoad', document\.body, \{ document \}\);\n {4}guardNbsp\(document\.body\);/, t);
    assert.match(read(`import-${t}.bundle.js`), /guardNbsp\(document\.body\)/, `${t} bundle`);
  });
  ['airdolomiti', 'austrian', 'b2b', 'brussels', 'cargo', 'discover', 'ita', 'sdui', 'swiss', 'swiss-magazine', 'swiss-market', 'swiss-sub'].forEach((b) => {
    assert.match(read(`${b}-import.mjs`), /collapseDocs\(withRestoredNbsp\(/, b);
  });
  assert.match(read('import-batch.mjs'), /withRestoredNbsp\(/);
  assert.match(read('da-upload-sites.mjs'), /restoreNbsp\(/);
});
