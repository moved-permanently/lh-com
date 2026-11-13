/* eslint-disable import/no-extraneous-dependencies, import/extensions, max-len -- tests */
/* eslint-disable no-underscore-dangle -- the page JSON's __typename and _path */
/**
 * TAP's market comparison as tap-markets.mjs decisions (the standing order of 2026-11-10, item 3c): the comparison
 * (tools/reports/market-diff/tap/import-list.tsv) found roots www serves another variant of a language page without a
 * rule: the version page local to its home market (pt-pt payment methods for 57 roots, en-pt club for 55, ...), a group
 * sharing a variant (en and pt /miles-and-go/promo, 8 roots each), and 34 single-root own documents. The step kept the
 * language version for every market there (a drift note). Now market-groups.json (tools/markets/tap-market-groups.mjs)
 * gives the step the comparison's groups: a group whose capture differs in a slot gets its unit with its countries, the
 * language version's unit every other country; the own documents join the roots' own pages. Synthetic page JSON as
 * test/tap-markets.test.mjs.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { marketUnits, withComparison } from '../tools/importer/tap-markets.mjs';
import { marketGroups } from '../tools/markets/tap-market-groups.mjs';

const M = (lang, p) => `/content/dam/tap/master/${lang}/components/${p}`;
const text = (lang, p, t) => ({
  __typename: 'ComponentRichTextBlockModel', _path: M(lang, p), _variation: 'master', richTextContent: { plaintext: t },
});
const pick = (units) => units.map((u) => [u.richTextContent && u.richTextContent.plaintext, u.__markets || null]);

describe('marketUnits with the comparison\'s groups', () => {
  const home = [text('en', 'intro', 'Pay with Santander (Portugal)'), text('en', 'faq', 'Questions')];
  const roots = [text('en', 'intro', 'Simple, secure and flexible payments'), text('en', 'faq', 'Questions')];

  it('a version page local to its home market: the roots\' variant for their countries, the version\'s for the others', () => {
    const r = marketUnits({
      home: 'pt', units: home, views: [{ country: 'us', units: roots }], countries: ['us', 'ca', 'gb'], groups: [['us', 'ca']],
    });
    assert.deepEqual(pick(r.units), [
      ['Pay with Santander (Portugal)', '-ca,-us'], ['Simple, secure and flexible payments', 'ca,us'], ['Questions', null],
    ]);
    assert.equal(r.notes.length, 0);
  });

  it('two groups on one page, each its variant; a member that disagrees with its group is drift', () => {
    const eu = [text('en', 'intro', 'Iceland offer'), text('en', 'faq', 'Questions')];
    const r = marketUnits({
      home: 'pt', units: home, views: [{ country: 'us', units: roots }, { country: 'de', units: eu }, { country: 'ca', units: eu }], groups: [['us', 'ca'], ['de']],
    });
    assert.deepEqual(pick(r.units).slice(0, 3), [
      ['Pay with Santander (Portugal)', '-ca,-de,-us'], ['Simple, secure and flexible payments', 'ca,us'], ['Iceland offer', 'de'],
    ]);
    assert.deepEqual(r.notes.map((n) => [n.kind, n.root]), [['drift', 'ca']]);
  });

  it('a group whose capture equals the version, or no group: as before; a group with no capture: noted, the version kept', () => {
    const same = marketUnits({
      home: 'pt', units: home, views: [{ country: 'us', units: home }], groups: [['us']],
    });
    assert.deepEqual(pick(same.units), [['Pay with Santander (Portugal)', null], ['Questions', null]]);
    const before = marketUnits({ home: 'pt', units: home, views: [{ country: 'us', units: roots }] });
    assert.deepEqual(pick(before.units), [['Pay with Santander (Portugal)', null], ['Questions', null]]);
    assert.deepEqual(before.notes.map((n) => n.kind), ['drift']);
    const none = marketUnits({
      home: 'pt', units: home, views: [], groups: [['mx']],
    });
    assert.deepEqual(pick(none.units), [['Pay with Santander (Portugal)', null], ['Questions', null]]);
    assert.deepEqual(none.notes.map((n) => [n.kind, n.countries.join(',')]), [['unplaced', 'mx'], ['unplaced', 'mx']]);
  });
});

describe('market-groups.json from the comparison', () => {
  const tsv = fs.readFileSync(new URL('../tools/reports/market-diff/tap/import-list.tsv', import.meta.url), 'utf8');
  const file = JSON.parse(fs.readFileSync(new URL('../tools/reports/market-diff/tap/market-groups.json', import.meta.url), 'utf8'));

  it('the file as the comparison gives it: 17 language pages, the alerts page left out, 34 own documents', () => {
    const g = marketGroups(tsv);
    assert.deepEqual({ pages: g.pages, own: g.own, leftOut: g.leftOut }, { pages: file.pages, own: file.own, leftOut: file.leftOut });
    assert.equal(Object.keys(g.pages).length, 17);
    assert.deepEqual(g.leftOut, ['/pt-pt/alertas-e-informacoes']);
    assert.equal(Object.values(g.own).flat().length, 34);
    const pay = g.pages['/pt-pt/reservas/modalidades-de-pagamento'];
    assert.deepEqual([pay.length, pay[0].kind, pay[0].roots.length], [1, 'version-local', 57]);
    assert.deepEqual(g.pages['/en-pt/miles-and-go/promo'].map((x) => [x.kind, x.countries.join(',')]), [['shared variant', 'cl,mx,mz,pl,sn,tg,tr,za']]);
    assert.deepEqual(g.pages['/en-pt/miles-and-go/club'].map((x) => x.roots.length).sort((a, b) => a - b), [1, 1, 55]);
  });

  it('withComparison: a page\'s groups as countries, the own documents added to the roots\' own pages', () => {
    const { groupsOf, list } = withComparison({ 'de-at': { own: [], rule: [] }, 'en-us': { own: ['https://www.flytap.com/en-us/x'], rule: [] } }, file);
    assert.deepEqual(groupsOf('/en-pt/miles-and-go/promo'), [['cl', 'mx', 'mz', 'pl', 'sn', 'tg', 'tr', 'za']]);
    assert.deepEqual(groupsOf('/en-pt/nothing'), []);
    assert.ok(list['de-at'].own.includes('https://www.flytap.com/de-at/buchungen/versicherung'));
    assert.ok(list['en-us'].own.includes('https://www.flytap.com/en-us/x'));
  });
});
