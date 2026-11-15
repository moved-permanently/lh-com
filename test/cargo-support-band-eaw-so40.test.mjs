/* eslint-disable max-len */
/* Standing order 40 (2026-11-15), Cargo's theme:
   item 1, Support & Contact at 390: below 1025 px www's grey bands have 20 px of padding (40 from 1025 px; Liferay's
   .greyBgBox padding-block) and the topic finder ends 20 px above the "Contact us" band. Ours had 40 px and the 48 px
   section gap at every width: +3.07 % at 390 (3,160 px, www 3,066), with the rule 3,092 (+0.85 %); 1440 unchanged.
   item 2, eaw: a media cell with the option stacked draws its pictures one under the other without a gap, as www's
   image-section (the block's own stacked rule is Insights' galleries, 40 px apart). No Cargo document has the option
   before delta-so40-cargo-eaw-stacked.txt's row.
   Run: node --max-old-space-size=256 --test test/cargo-support-band-eaw-so40.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

/** The body of the first @media block with this condition holding the selector, or ''. */
function inMedia(cond, selector) {
  let at = css.indexOf(`@media ${cond} {`);
  while (at >= 0) {
    let depth = 0;
    let end = at;
    for (let i = css.indexOf('{', at); i < css.length; i += 1) {
      if (css[i] === '{') depth += 1;
      if (css[i] === '}') depth -= 1;
      if (depth === 0) { end = i; break; }
    }
    const body = css.slice(at, end + 1);
    if (body.includes(`${selector} {`)) return body;
    at = css.indexOf(`@media ${cond} {`, end);
  }
  return '';
}

const rule = (body, selector) => {
  const i = body.indexOf(`${selector} {`);
  return i < 0 ? '' : body.slice(i, body.indexOf('}', i) + 1);
};

test('item 1: below 1025 px the "Contact us" band has www\'s 20 px of padding, the section before it ends 20 px above it', () => {
  const band = 'body.brand-cargo main > .section.contact';
  const before = 'body.brand-cargo main > :where(.section:has(+ .section.contact))';
  const m = inMedia('(width < 1025px)', band);
  assert.match(rule(m, band), /padding: 20px 0;/);
  assert.match(rule(m, before), /margin-bottom: 20px;/, 'the finder section\'s gap, at the weight of a section rule');
});

test('item 1: from 1025 px the band keeps its 40 px (the base rule is unchanged)', () => {
  assert.match(css, /body\.brand-cargo main > \.section\.contact \{ margin-bottom: 0; padding: 40px 0; background-color: #f5f5f5; \}/);
});

test('item 2: a stacked media cell\'s pictures without a gap on Cargo', () => {
  assert.match(css, /body\.brand-cargo main \.columns-media\.stacked \.columns-media-multi \{ gap: 0; \}/);
});

test('item 2: the row gives the option to eaw\'s media block only', () => {
  const rows = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so40-cargo-eaw-stacked.json', import.meta.url), 'utf8'));
  assert.deepEqual(rows, [{ block: 'columns-media', text: 'With the various components', add: 'stacked' }]);
  const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so40-cargo-eaw-stacked.txt', import.meta.url), 'utf8');
  const ready = list.split('\n').filter((l) => l.startsWith('READY\t')).map((l) => l.split('\t')[1]);
  assert.deepEqual([...new Set(ready)], ['/en/eaw']);
  assert.match(list, /\/\.token-free-backup\/2026-11-cargo-so40-eaw-stacked\//, 'the backup folder is named');
});
