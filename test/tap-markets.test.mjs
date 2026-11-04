/* eslint-disable import/no-extraneous-dependencies, import/extensions, max-len -- tests */
/* eslint-disable no-underscore-dangle -- the page JSON's __typename and _path */
/**
 * TAP's market roots (tools/importer/tap-markets.mjs, Ben's option B): the components of a
 * language page behind a country rule (pageProps.personalizations) as sections with section
 * metadata Markets, the other markets' variants merged in from their captures, and the hook in
 * tap-import.mjs's convertPage that renders them. Synthetic page JSON in www's shape.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { convertPage } from '../tools/importer/tap-import.mjs';
import {
  ruleTail, ruleIndex, marketUnits, pageMarkets, withPageMarkets, rootLinks, languageOf, rootDocPath, variantFragments,
} from '../tools/importer/tap-markets.mjs';
import { dropMarketSections, sectionMarkets } from '../scripts/market-rules.js';

const M = (lang, p) => `/content/dam/tap/master/${lang}/components/${p}`;
const text = (lang, p, t, variation = 'master') => ({
  __typename: 'ComponentRichTextBlockModel', _path: M(lang, p), _variation: variation, richTextContent: { plaintext: t },
});
const heading = (lang, p, t) => ({
  __typename: 'ComponentHeadingModel', _path: M(lang, p), _variation: 'master', title: t,
});
const show = (p, value) => ({
  _path: `/content/dam/tap/personalization/${p}`, action: 'show', value, targets: [{ __typename: 'X', _path: M('pt', p) }],
});
const hide = (p, value) => ({ ...show(p, value), action: 'hide' });
const variation = (p, vars) => ({
  _path: `/content/dam/tap/personalization/${p}-v`,
  action: 'activate-variation',
  value: Object.entries(vars).map(([n, m]) => `${n}+${m.join(',')}`),
  targets: [{ __typename: 'X', _path: M('pt', p) }],
  variations: Object.fromEntries(Object.entries(vars).map(([n, m]) => [n, { name: n, markets: m, action: 'show' }])),
});
const nd = (sections, extra = {}) => ({
  props: {
    pageProps: {
      page: {
        __typename: 'PageModel', _path: '/content/dam/tap/master/en/pages/x', title: 'X', seoTitle: 'X | TAP Air Portugal', sections, ...extra,
      },
      personalizations: [],
    },
  },
});
const site = (units) => ({
  url: 'https://www.flytap.com/en-pt/x', scope: new Set(['/en-pt/x']), media: () => null, sourceImages: false, units,
});
const sectionsOf = (html) => {
  const out = [];
  let depth = 0;
  let start = 0;
  const re = /<div\b[^>]*>|<\/div>/g;
  let m = re.exec(html);
  while (m) {
    if (m[0] === '</div>') { depth -= 1; if (depth === 0) out.push(html.slice(start, re.lastIndex)); } else { if (depth === 0) start = m.index; depth += 1; }
    m = re.exec(html);
  }
  return out;
};

describe('tap-markets: rules', () => {
  it('a rule names the pt master: it matches every language copy by the path after /master/<lang>/', () => {
    assert.equal(ruleTail(M('de', 'a/b')), 'components/a/b');
    assert.equal(ruleTail(M('pt-br', 'a/b')), 'components/a/b');
    const idx = ruleIndex([show('a/b', ['pt', 'br']), hide('a/b', ['us'])]);
    assert.equal(idx.get('components/a/b').length, 2);
  });

  it('the language version of a root and a root path\'s document', () => {
    assert.equal(languageOf('en-us'), 'en-pt');
    assert.equal(languageOf('pt-ao'), 'pt-pt');
    assert.equal(languageOf('fr-ca'), 'fr-fr');
    assert.equal(languageOf('de-ch'), 'de-de');
    assert.equal(languageOf('es-mx'), 'es-es');
    assert.equal(rootDocPath('/de-ch'), '/de-ch/index');
    assert.equal(rootDocPath('/en-ca/legal-info/x'), '/en-ca/legal-info/x');
  });
});

describe('tap-markets: marketUnits', () => {
  const home = [heading('en', 'h', 'Title'), text('en', 'a', 'For all'), text('en', 'galp', 'Galp (Portugal only)'), text('en', 'c', 'Card text')];

  it('a component behind a show rule: its own unit with the rule\'s countries', () => {
    const r = marketUnits({
      home: 'pt', units: home, views: [], rules: [show('galp', ['pt', 'br'])], countries: ['pt', 'us'],
    });
    assert.deepEqual(r.units.map((u) => u.__markets || null), [null, null, 'br,pt', null]);
    assert.equal(r.units[2].richTextContent.plaintext, 'Galp (Portugal only)');
  });

  it('a hide rule: an exclusion list', () => {
    const r = marketUnits({
      home: 'pt', units: home, views: [], rules: [hide('c', ['us', 'ca'])], countries: ['pt', 'us'],
    });
    assert.equal(r.units[3].__markets, '-ca,-us');
  });

  it('activate-variation: one unit per variant, each with its countries, the market\'s from its capture', () => {
    const us = [home[0], home[1], text('en', 'c', 'Card text for the US', 'variation_us')];
    const r = marketUnits({
      home: 'pt', units: home, views: [{ country: 'us', units: us }], rules: [variation('c', { variation_us: ['us'], variation_br: ['br'] }), show('galp', ['pt'])], countries: ['pt', 'us', 'ca'],
    });
    const c = r.units.filter((u) => ruleTail(u._path) === 'components/c');
    assert.deepEqual(c.map((u) => [u._variation, u.__markets]), [['master', '-br,-us'], ['variation_us', 'us']]);
    // Brazil's variant: no root of this language shows it, so no capture holds it: a note, no root concerned
    assert.ok(r.notes.some((n) => /variation_br|br/.test(n.why) && !n.root));
  });

  it('a variation for every market but some ("variation_x-pt", action hide): the others\' variant', () => {
    const rule = {
      ...variation('c', { variation_todososmercados: ['pt'] }),
      value: ['variation_todososmercados-pt'],
      variations: { variation_todososmercados: { name: 'variation_todososmercados', markets: ['pt'], action: 'hide' } },
    };
    const gb = [home[0], home[1], home[2], text('en', 'c', 'Card text, all markets', 'variation_todososmercados')];
    const r = marketUnits({
      home: 'pt', units: home, views: [{ country: 'gb', units: gb }], rules: [rule], countries: ['pt', 'gb', 'us'],
    });
    const c = r.units.filter((u) => ruleTail(u._path) === 'components/c');
    assert.deepEqual(c.map((u) => [u._variation, u.__markets]), [['master', 'pt'], ['variation_todososmercados', '-pt']]);
    assert.ok(!r.notes.some((n) => n.kind === 'unplaced'), 'us gets the variation for all markets');
  });

  it('a variation named market_<cc> is the market\'s without a rule (www applies it so)', () => {
    const table = { ...text('en', 'c', 'Card text'), _variations: ['market_us', 'market_ao'] };
    const us = [home[0], home[1], home[2], { ...table, _variation: 'market_us', richTextContent: { plaintext: 'US card' } }];
    const r = marketUnits({
      home: 'pt', units: [home[0], home[1], home[2], table], views: [{ country: 'us', units: us }], rules: [], countries: ['pt', 'us', 'ao', 'gb'],
    });
    const c = r.units.filter((u) => ruleTail(u._path) === 'components/c');
    assert.deepEqual(c.map((u) => [u._variation, u.__markets]), [['master', '-ao,-us'], ['market_us', 'us'], [undefined, 'ao']]);
    assert.ok(r.notes.some((n) => n.kind === 'unplaced' && n.root === 'ao'), 'Angola\'s variation: no capture');
  });

  it('a component only a market shows (missing in the language version) is merged in at its place', () => {
    const br = [home[0], home[1], text('en', 'brazil', 'Only in Brazil'), home[3]];
    const r = marketUnits({
      home: 'pt', units: home, views: [{ country: 'br', units: br }], rules: [show('galp', ['pt']), show('brazil', ['br'])], countries: ['pt', 'br'],
    });
    assert.deepEqual(r.units.map((u) => [ruleTail(u._path).split('/').pop(), u.__markets || null]), [['h', null], ['a', null], ['galp', 'pt'], ['brazil', 'br'], ['c', null]]);
  });

  it('a difference no rule explains (TAP edited the page between captures) keeps the language version, noted', () => {
    const us = [home[0], text('en', 'a', 'For all, edited'), home[2], home[3]];
    const r = marketUnits({
      home: 'pt', units: home, views: [{ country: 'us', units: us }], rules: [], countries: ['pt', 'us'],
    });
    assert.equal(r.units[1].richTextContent.plaintext, 'For all');
    assert.ok(!r.units.some((u) => u.__markets));
    assert.ok(r.notes.some((n) => n.kind === 'drift' && n.root === 'us'));
  });

  it('a root whose rules give another view than any capture shows: a hit that could not be placed', () => {
    // the variant for ca has no capture: Canada (a root of the language) sees nothing of it
    const r = marketUnits({
      home: 'pt', units: home, views: [], rules: [variation('c', { variation_canada: ['ca'] })], countries: ['pt', 'ca'],
    });
    assert.equal(r.units[3].__markets, '-ca');
    assert.ok(r.notes.some((n) => n.kind === 'unplaced' && n.root === 'ca'));
    // in its place for Canada: the page on www (as the importer does for www's live widgets)
    assert.deepEqual([r.units[4].__typename, r.units[4].__markets], ['MarketVariantOnWww', 'ca']);
    const { html, report } = convertPage(nd([]), site(() => r.units));
    assert.match(dropMarketSections(html, 'ca'), /<a href="https:\/\/www\.flytap\.com\/en-pt\/x">See on flytap\.com<\/a>/);
    assert.ok(!dropMarketSections(html, 'pt').includes('See on flytap.com'));
    assert.ok(report.linkedOut.some((x) => /market variant/.test(x)));
  });

  it('show/hide rules on items of a component: a root without a capture gets the component without the items its rules hide', () => {
    const list = {
      __typename: 'ComponentGenericCardListModel',
      _path: M('en', 'list'),
      items: [{ __typename: 'GenericCard1Model', _path: M('en', 'list/pt-only'), title: 'PT' }, { __typename: 'GenericCard1Model', _path: M('en', 'list/all'), title: 'All' }],
    };
    const r = marketUnits({
      home: 'pt', units: [list], views: [], rules: [show('list/pt-only', ['pt', 'es'])], countries: ['pt', 'us'],
    });
    assert.deepEqual(r.units.map((u) => [u.items.map((x) => x.title).join('+'), u.__markets]), [['PT+All', 'es,pt'], ['All', '-es,-pt']]);
    assert.ok(!r.notes.some((n) => n.kind === 'unplaced'));
    // an item only Brazil's capture holds: the US (no capture) gets it from there, without the
    // Portugal card its rules hide
    const br = { ...list, items: [...list.items, { __typename: 'GenericCard1Model', _path: M('en', 'list/americas'), title: 'Americas' }] };
    const two = marketUnits({
      home: 'pt', units: [list], views: [{ country: 'br', units: [br] }], rules: [show('list/americas', ['br', 'us']), show('list/pt-only', ['pt', 'br'])], countries: ['pt', 'br', 'us'],
    });
    assert.ok(!two.notes.some((n) => n.kind === 'unplaced'));
    assert.deepEqual(two.units.map((u) => [u.items.map((x) => x.title).join('+'), u.__markets]), [['PT+All', 'pt'], ['PT+All+Americas', 'br'], ['All+Americas', 'us'], ['All', '-br,-pt,-us']]);
  });

  it('a show/hide rule on the component itself decides for roots without a capture', () => {
    const r = marketUnits({
      home: 'pt', units: home, views: [], rules: [show('galp', ['pt'])], countries: ['pt', 'us'],
    });
    assert.ok(!r.notes.some((n) => n.kind === 'unplaced'), 'us does not see it: the rule says so');
  });
});

describe('tap-markets: the hook in convertPage', () => {
  const units = [heading('en', 'h', 'Title'), { ...text('en', 'c', 'Master text'), __markets: '-br' }, { ...text('en', 'c', 'Brazil text', 'variation_brasil'), __markets: 'br' }];

  it('without units the page converts as before', () => {
    const a = convertPage(nd(units.map(({ __markets, ...u }) => u)), site());
    assert.ok(!a.html.includes('Markets'));
  });

  it('each unit with markets is a section of its own with section metadata Markets', () => {
    const r = convertPage(nd([]), site(() => [...units, text('en', 'z', 'After')]));
    const secs = sectionsOf(r.html.trim());
    assert.deepEqual(secs.map((s) => sectionMarkets(s)), [null, '-br', 'br', null]);
    assert.match(secs[1], /Master text/);
    assert.match(secs[2], /Brazil text/);
    assert.match(secs[3], /After/);
    assert.match(secs[3], /class="metadata"/);
  });

  it('the page metadata never sits in a market section', () => {
    const r = convertPage(nd([]), site(() => units));
    const secs = sectionsOf(r.html.trim());
    assert.equal(secs.length, 4);
    assert.equal(sectionMarkets(secs[3]), null);
    assert.match(secs[3], /class="metadata"/);
    assert.ok(!/class="metadata"/.test(secs[2]));
  });

  it('as lh-com\'s market rules read it: Brazil gets its variant, Portugal the master', () => {
    const { html } = convertPage(nd([]), site(() => units));
    assert.match(dropMarketSections(html, 'br'), /Brazil text/);
    assert.ok(!dropMarketSections(html, 'br').includes('Master text'));
    assert.match(dropMarketSections(html, 'pt'), /Master text/);
    assert.ok(!dropMarketSections(html, 'pt').includes('Brazil text'));
  });

  it('a heading behind a rule keeps its H1 in every variant', () => {
    const hs = [{ ...heading('en', 'h', 'Title'), __markets: '-br' }, { ...heading('en', 'h', 'Título BR'), _variation: 'variation_brasil', __markets: 'br' }, text('en', 'a', 'x')];
    const { html } = convertPage(nd([]), site(() => hs));
    assert.match(dropMarketSections(html, 'br'), /<h1>Título BR<\/h1>/);
    assert.match(dropMarketSections(html, 'pt'), /<h1>Title<\/h1>/);
  });
});

describe('tap-markets: pages and links', () => {
  it('a rule on the page itself (PageModel): the page\'s Markets, into its metadata', () => {
    const { page } = nd([]).props.pageProps;
    const rules = [{ ...show('x', ['br']), targets: [{ __typename: 'PageModel', _path: page._path }] }];
    assert.equal(pageMarkets(page, rules), 'br');
    const html = withPageMarkets('<div><div class="metadata"><div><div>Title</div><div>X</div></div></div></div>', 'br');
    assert.match(html, /<div class="metadata"><div><div>Title<\/div><div>X<\/div><\/div><div><div>Markets<\/div><div>br<\/div><\/div><\/div>/);
  });

  it('variantFragments: the variants of a page over the limits get fragment documents of their own', () => {
    const block = (d) => `<div class="fragment"><div><div><a href="${d}">${d}</a></div></div></div>`;
    const f = '/en-pt/fragments/partners/hotels';
    const g = '/en-pt/fragments/partners/airlines';
    const html = `<div>${block(f)}${block(g)}</div>\n<div>${block(f)}${block(g)}</div>\n`;
    const r = variantFragments(html, [{ doc: f, html: 'A' }, { doc: g, html: 'G' }, { doc: f, html: 'B' }, { doc: g, html: 'G' }]);
    assert.equal(r.fragments.length, 3, 'the same content shares its document');
    const other = r.fragments[2].doc;
    assert.match(other, /^\/en-pt\/fragments\/partners\/hotels-[0-9a-f]{6}$/);
    assert.equal(r.html, `<div>${block(f)}${block(g)}</div>\n<div>${block(other)}${block(g)}</div>\n`);
  });

  it('rootLinks: a root\'s document as its language version\'s (to compare nav and footer)', () => {
    assert.equal(rootLinks('<a href="/en-us/x">a</a> <a href="https://www.flytap.com/en_us/deals">b</a> <a href="/en-us">c</a>', 'en-us', 'en-pt'), '<a href="/en-pt/x">a</a> <a href="https://www.flytap.com/en_pt/deals">b</a> <a href="/en-pt">c</a>');
  });
});
