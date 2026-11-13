/* eslint-disable max-len */
/* Lufthansa Cargo, the company pages' picture header on phones (standing order 23; cargo-parity-001 /en and
   /de/ci/whats-up-now at 390, www's LCAGCP-lcagHeaderImageTextContainer): below 992 px www lays the picture header out
   as its video header (row 38, test/cargo-video-stage-503): the picture across the screen at 16:9 (220 px at 390), under
   it a white box 16 px in, the title 10 px lower (24/29 navy, 10 px under it), the subline 16 / 19.2 px, the link row
   16 px under it with www's 36 px button (18 / 21.6 px, 5 px 25 px). Ours drew a 320 px picture with the text on it:
   -2.2 / -2.5 % at 390 (en / de). From 992 px nothing changes. Cargo's theme only.
   Run: node --test test/cargo-picture-stage-so23.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const P = 'body.brand-cargo .hero-campaign.narrow:has(> .hero-campaign-media > picture):not(:has(video))';

/** The declarations of the rules for sel inside @media (width < 992px), merged. */
function phone(sel) {
  const out = {};
  css.split('@media (width < 992px)').slice(1).forEach((chunk) => {
    let depth = 0;
    let end = 0;
    for (let i = chunk.indexOf('{'); i < chunk.length; i += 1) {
      if (chunk[i] === '{') depth += 1;
      if (chunk[i] === '}') depth -= 1;
      if (depth === 0) { end = i; break; }
    }
    const body = chunk.slice(chunk.indexOf('{') + 1, end);
    [...body.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter((m) => m[1].split(',').map((s) => s.trim()).includes(sel))
      .forEach((m) => m[2].split(';').map((d) => d.trim()).filter(Boolean).forEach((d) => {
        const [k, ...v] = d.split(':');
        out[k.trim()] = v.join(':').trim();
      }));
  });
  return out;
}

test('below 992 px the picture header is the picture at 16:9 with a white text box under it', () => {
  const b = phone(P);
  assert.deepEqual([b.display, b['min-height'], b['padding-bottom'], b.color], ['block', '0', '0', '#05164d']);
  const m = phone(`${P} > .hero-campaign-media`);
  assert.deepEqual([m.position, m['aspect-ratio']], ['relative', '16 / 9']);
  const i = phone(`${P} > .hero-campaign-inner`);
  assert.deepEqual([i.padding, i['background-color']], ['16px', '#fff']);
});

test('the title 10 px under the box\'s top and over the subline; the subline 16 / 19.2 px', () => {
  const h = phone(`${P} h1`);
  assert.deepEqual([h.margin, h.color, h['font-weight']], ['10px 0', '#05164d', '500']);
  const s = phone(`${P} .hero-campaign-subtitle`);
  assert.deepEqual([s.margin, s.padding, s.color, s['font-size'], s['line-height']], ['0', '0', '#05164d', '16px', '19.2px']);
});

test('the link row 16 px under the subline, www\'s 36 px button', () => {
  assert.equal(phone(`${P} .hero-campaign-cta`)['padding-top'], '16px');
  const a = phone(`${P} .hero-campaign-cta .button`);
  assert.deepEqual([a['min-height'], a.padding, a['font-size'], a['line-height']], ['0', '5px 25px', '18px', '21.6px']);
});

test('the video header keeps its own rules (row 38), and nothing for the picture header from 992 px', () => {
  assert.ok(css.includes('body.brand-cargo .hero-campaign.narrow:has(> .hero-campaign-media video) > .hero-campaign-inner'));
  const wide = css.split('@media (width < 992px)').map((chunk, n) => (n === 0 ? chunk : chunk.slice(chunk.indexOf('}\n}') + 3))).join('');
  assert.ok(!wide.includes(':has(> .hero-campaign-media > picture):not(:has(video))'), 'the picture header\'s rules only below 992 px');
});
