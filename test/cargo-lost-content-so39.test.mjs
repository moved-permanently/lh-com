/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 39 of 2026-11-15: items 2 and 3, www's lost words and links as text inserts (delta-so39-cargo-airdolomiti-
   lost-content.txt, its two .json) with Cargo's store badge rule; item 4, the eFreight breadcrumbs and general-terms1 as
   document rows with their own spacing (delta-so39-cargo-efreight-legal-scoped.txt); item 1, every Cargo list names the DA
   backup folder. Strings only, no DOM.
   Run: node --max-old-space-size=256 --test test/cargo-lost-content-so39.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyTextInserts, removeTextInserts, listPaths } from '../tools/importer/text-inserts-apply.mjs';

const dir = new URL('../tools/reports/parity-2026-11-09/', import.meta.url);
const read = (f) => fs.readFileSync(new URL(f, dir), 'utf8');
const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8');
const rule = (sel) => {
  const i = css.indexOf(sel);
  assert.ok(i > 0, sel);
  return { body: css.slice(i, css.indexOf('}', i)), media: css.slice(css.lastIndexOf('}', i), i).includes('@media') };
};

test('the badge rule: a text cell\'s paragraph that is one store link holding a picture, inline at the picture\'s size, Cargo only, at every width', () => {
  const stores = ':is([href^="https://play.google.com/store/"], [href^="https://apps.apple.com/"])';
  const p = rule(`body.brand-cargo main .columns-media .columns-media-text > p:has(> a:only-child${stores} > picture) {`);
  assert.equal(p.media, false);
  assert.match(p.body, /display: inline-block;/);
  assert.match(p.body, /margin: 0 20px 0 0;/);
  const img = rule(`body.brand-cargo main .columns-media .columns-media-text > p > a:only-child${stores} > picture img {`);
  assert.equal(img.media, false);
  assert.match(img.body, /width: auto;/);
  assert.match(img.body, /max-width: 100%;/);
  assert.match(img.body, /height: auto;/);
});

// a document holding a row's anchors in their order, as DA's copy does
const docOf = (inserts) => {
  const anchors = [];
  inserts.forEach(({ before, after }) => { const a = before || after; if (!anchors.includes(a)) anchors.push(a); });
  // an anchor that holds another (the badge's paragraph and its picture) stands once
  return `<body><header></header><main><div>${anchors.filter((a) => !anchors.some((b) => b !== a && b.includes(a))).join('</p><p>')}</div></main><footer></footer></body>`;
};

test('the lost-content rows: each inserted once, there already on a second run, DA\'s copy back without them', () => {
  const rows = [...JSON.parse(read('delta-so39-cargo-lost-content.json')), ...JSON.parse(read('delta-so39-airdolomiti-lost-content.json'))];
  assert.deepEqual(rows.map((r) => r.path), ['/en/eservices-app', '/en/ci/partnerships-subsidiaries', '/de/reisenformationen/schwangere-und-kinder']);
  rows.forEach(({ path, inserts }) => {
    const doc = docOf(inserts);
    const r = applyTextInserts(doc, inserts);
    assert.ok(r.results.every((x) => x === 'inserted'), `${path}: ${r.results}`);
    assert.equal(removeTextInserts(r.html, r.inserts), doc, path);
    assert.ok(applyTextInserts(r.html, inserts).results.every((x) => x === 'present'), path);
  });
  const [app, partners, kinder] = rows.map((r) => r.inserts.map((x) => x.text).join(''));
  ['<h3>App-solutely mobile</h3>', '<h4>Lufthansa Cargo eServices</h4>', 'enjoy access from anywhere at any time.</p>', '<a href="https://play.google.com/store/apps/details?id=com.etrackingapp&amp;hl=de&amp;gl=US">', '<a href="https://apps.apple.com/de/app/lh-cargo/id6469620870">', '<h2>FAQ</h2>'].forEach((t) => assert.ok(app.includes(t), t));
  assert.equal((partners.match(/<li><a href="https:\/\/www\.lufthansa-cargo\.com\/partner\?aid=(global|premium|business)-partners-anchor">(Global|Premium|Business) Partner<\/a><\/li>/g) || []).length, 3);
  assert.match(kinder, /<a href="\/de\/unterstutzung-und-kontakte\/sales-center-de"><strong>Kundenservice<\/strong><\/a>/);
  assert.match(kinder, /Business-Class auf Flügen von Air Dolomiti nicht möglich\.<\/p>$/);
  assert.ok(!/style=|&nbsp;|<span/.test(kinder), 'www\'s inline styles left out');
});

test('the lost-content list: the three pages READY, the tool, both .json and the backup folders in its header', () => {
  const list = read('delta-so39-cargo-airdolomiti-lost-content.txt');
  assert.deepEqual([...new Set(listPaths(list))].sort(), ['/de/reisenformationen/schwangere-und-kinder', '/en/ci/partnerships-subsidiaries', '/en/eservices-app']);
  assert.ok(!/^HOLD\t/m.test(list));
  const head = list.split('\n').filter((l) => l.startsWith('#')).slice(0, 4).join('\n');
  ['tools/importer/text-inserts-apply.mjs', 'delta-so39-cargo-lost-content.json', 'delta-so39-airdolomiti-lost-content.json', '/.token-free-backup/2026-11-cargo-so39-lost-content/', '/.token-free-backup/2026-11-airdolomiti-so39-lost-content/'].forEach((f) => assert.ok(head.includes(f), f));
  assert.match(read('sweep-so39-lost-content-census.txt'), /^LOSS\tcargo\t\/en\/eservices-app\t/m);
  assert.equal((read('sweep-so39-lost-content-census.txt').match(/^LOSS\t/gm) || []).length, 3);
});

test('the scoped rows: eFreight\'s trail and title spacer, general-terms1\'s row and spacing; eaw HOLD; no code', () => {
  const list = read('delta-so39-cargo-efreight-legal-scoped.txt');
  assert.deepEqual([...new Set(listPaths(list))].sort(), ['/en/ecsd', '/en/ehm', '/en/meta/meta/company/general-terms1']);
  const rows = JSON.parse(read('delta-so39-cargo-efreight-legal-scoped.json'));
  assert.deepEqual(rows.map((r) => r.path), ['/en/eaw', '/en/ecsd', '/en/ehm', '/en/meta/meta/company/general-terms1']);
  rows.slice(0, 3).forEach(({ path, inserts }) => {
    assert.equal(inserts[0].after, '<main>');
    assert.match(inserts[0].text, /^<div><div class="breadcrumb"><div><div><ul><li><a href="\/en\/home">Home<\/a><\/li><li>Info-Hub<\/li><li>eServices<\/li><li><a href="\/en\/eservices\/efreight">eFreight<\/a><\/li><li>(EAW|eCSD|eHM)<\/li><\/ul><\/div><\/div><\/div><\/div>\n$/, path);
    assert.deepEqual(inserts[1], { before: '<h1>', text: '<p>{spacer-18 from-768}</p>' });
  });
  const gt = rows[3].inserts.map((x) => x.text).join('|');
  assert.equal(gt, '<p>{spacer-20 from-768}</p><div class="columns-media"><div><div>|</div><div>|</div></div></div><p>{spacer-38 from-768}</p>');
  const head = list.split('\n').filter((l) => l.startsWith('#')).slice(0, 5).join('\n');
  ['tools/importer/metadata-row-apply.mjs', 'delta-so38-cargo-legal-template.json', 'tools/importer/text-inserts-apply.mjs', 'delta-so39-cargo-efreight-legal-scoped.json', '/.token-free-backup/2026-11-cargo-so39-efreight-legal-scoped/', 'without the marker collapse'].forEach((f) => assert.ok(head.includes(f), f));
  // terms-of-use and Support & Contact keep their rows: so38's legal list still READY for terms-of-use alone
  assert.deepEqual([...new Set(listPaths(read('delta-so38-cargo-legal-template.txt')))], ['/en/footer/bottomnav/terms-of-use']);
});

test('every Cargo delta list names its DA backup folder, none the token-free pass\'s', () => {
  const lists = fs.readdirSync(dir).filter((f) => /^delta-so3[789]-cargo-.*\.txt$/.test(f));
  assert.ok(lists.length >= 9, String(lists.length));
  lists.forEach((f) => {
    const m = read(f).match(/^# DA backup folder \(standing order 39\): .*?(\/\.token-free-backup\/2026-11-cargo-so3[789]-[a-z-]+\/)/m);
    assert.ok(m, f);
    assert.notEqual(m[1], '/.token-free-backup/2026-11-cargo/', f);
    assert.ok(m[1].includes(f.match(/^delta-(so3\d)-/)[1]), `${f}: ${m[1]}`);
  });
});
