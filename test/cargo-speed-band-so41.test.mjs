/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 41 (2026-11-15):
   Cargo's theme: below 1025 px a section holding the breadcrumb ends 20 px above a grey section after it (www's Speed
   pages: the grey Introduction band 19 px under the "Back" row; cargo-parity-006's 390 first load of /en/speed-zoom).
   Only td.Zoom, td.Pro and td.Flash have that shape; from 1025 px nothing changes.
   The lists: speed-zoom's tab and join rows (delta-so41-cargo-speed-zoom.txt), industries-healthcare's call-to-action
   band (delta-so41-cargo-healthcare-cta.txt, the button at the live Cargo site's full address), gb/en's hero picture on
   phones (delta-so41-austrian-gb-hero-mobile-image.txt), and the Austrian homepage gate (gate-so41-austrian-homepages.txt).
   Run: node --max-old-space-size=256 --test test/cargo-speed-band-so41.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyTextInserts, removeTextInserts, listPaths } from '../tools/importer/text-inserts-apply.mjs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const css = read('styles/themes/cargo.css').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const R = 'tools/reports/parity-2026-11-09';

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

const SPEED = 'body.brand-cargo main > :where(.section:has(> .breadcrumb-wrapper):has(+ .section.grey))';

test('below 1025 px the breadcrumb\'s section ends 20 px above a grey band under it, at a section rule\'s weight', () => {
  const m = inMedia('(width < 1025px)', SPEED);
  assert.ok(m, 'the rule sits in a (width < 1025px) block');
  const i = m.indexOf(`${SPEED} {`);
  assert.match(m.slice(i, m.indexOf('}', i) + 1), /\{ margin-bottom: 20px; \}/);
  assert.equal(css.split(`${SPEED} {`).length - 1, 1, 'nowhere else, so 1440 is unchanged');
});

test('speed-zoom\'s rows: order 37\'s tab row and the two section joins, READY on speed-zoom alone', () => {
  const tabs = JSON.parse(read(`${R}/delta-so41-cargo-speed-zoom-tabs.json`));
  assert.deepEqual(Object.keys(tabs), ['/en/speed-zoom']);
  assert.equal(tabs['/en/speed-zoom'].add, 'tabs');
  assert.deepEqual(tabs['/en/speed-zoom'].titles, ['Features', 'Booking & Tracking', 'Links & Downloads']);
  const [joins] = JSON.parse(read(`${R}/delta-so41-cargo-speed-zoom-joins.json`));
  assert.equal(joins.path, '/en/speed-zoom');
  assert.equal(joins.inserts.length, 3);
  assert.deepEqual(listPaths(read(`${R}/delta-so41-cargo-speed-zoom.txt`)), ['/en/speed-zoom', '/en/speed-zoom']);
  // on a copy shaped as DA's speed-zoom: two sections, the grey style at the end of the joined one, and back byte for byte
  const meta = '<div class="section-metadata"><div><div>Style</div><div>grey</div></div></div>';
  const doc = `<body><header></header><main><div><p><picture><img src="a.jpg"></picture></p></div>\n<div><div class="breadcrumb"><div><div>x</div></div></div></div>\n<div><h1>td.Zoom</h1><p>t</p>${meta}</div>\n<div><div class="accordion-columns faq tabs"><div><div>Features</div><div><p>p</p></div></div></div><div class="metadata"><div><div>Language</div><div>en</div></div></div></div>\n</main><footer></footer></body>`;
  const { html, results, inserts } = applyTextInserts(doc, joins.inserts);
  assert.deepEqual(results, ['inserted', 'inserted', 'inserted']);
  assert.equal(html.split('\n<div>').length - 1, 1, 'two sections');
  assert.ok(html.includes(`${meta}</div>\n</main>`));
  assert.equal(removeTextInserts(html, inserts), doc);
});

test('industries-healthcare\'s band: www\'s heading, paragraph and primary button at the live Cargo site\'s full address', () => {
  const [row] = JSON.parse(read(`${R}/delta-so41-cargo-healthcare-cta.json`));
  assert.equal(row.path, '/en/industries-healthcare');
  const [ins] = row.inserts;
  assert.equal(ins.before, '<div><h2>Reliable solutions, extensive experience</h2>');
  assert.ok(ins.text.startsWith('<div><h2>Let’s find the right solution for your pharma logistics.</h2>'));
  assert.ok(ins.text.includes('<p><strong><a href="https://www.lufthansa-cargo.com/contact-pharma-industry-team">Get in touch</a></strong></p>'));
  assert.deepEqual([...new Set(listPaths(read(`${R}/delta-so41-cargo-healthcare-cta.txt`)))], ['/en/industries-healthcare']);
});

test('gb/en\'s hero without no-mobile-image, the one READY row of the Austrian homepage gate', () => {
  const [row] = JSON.parse(read(`${R}/delta-so41-austrian-gb-hero-mobile-image.json`));
  assert.deepEqual(row, { path: '/gb/en/homepage', inserts: [{ replace: '<div class="hero-card-overlay right no-mobile-image light">', text: '<div class="hero-card-overlay right light">' }] });
  const gate = read(`${R}/gate-so41-austrian-homepages.txt`).split('\n').filter((l) => /^(WITHIN|READY|HOLD)\t/.test(l)).map((l) => l.split('\t'));
  assert.equal(gate.length, 50, '25 pages at 1440 and 390');
  assert.deepEqual(gate.filter((c) => c[0] === 'READY').map((c) => `${c[1]} ${c[2]}`), ['/gb/en/homepage 390']);
  assert.ok(!gate.some((c) => c[1] === '/de/en/overview-manage'));
});

test('order 41\'s eservices-app lists stay HOLD only (order 42 decides them: delta-so42-cargo-eservices-app.txt, test/cargo-phone-gap-so42)', () => {
  assert.deepEqual(listPaths(read(`${R}/gate-so41-cargo-eservices-app.txt`)), []);
  const text = JSON.parse(read(`${R}/delta-so41-cargo-eservices-app-text.json`));
  assert.deepEqual(text.map((d) => [d.path, d.inserts.length]), [['/de/eservices-app', 4], ['/en/eservices-app', 1]]);
  const tabs = JSON.parse(read(`${R}/delta-so41-cargo-eservices-app-tabs.json`));
  assert.deepEqual(Object.keys(tabs), ['/de/eservices-app', '/en/eservices-app']);
  assert.equal(listPaths(read(`${R}/gate-so41-cargo-section-gap-390.txt`)).length, 0);
});
