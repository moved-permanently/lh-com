/* eslint-disable max-len, import/extensions -- the importer modules are .mjs */
/* SWISS's market roots' import steps (tools/importer/swiss-market-import.mjs): the flight search's
   default origin from the root's own homepage, the pages a root has on the site (its own documents,
   ch/<ll>'s pages whose markets row lists it), the forms' date picker out.
   Run: node --max-old-space-size=512 --test test/swiss-market-import.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  marketOriginOf, withMarketOrigin, servedPaths, withoutDatepicker,
} from '../tools/importer/swiss-market-import.mjs';
import { withFlightSearch } from '../tools/importer/swiss-import.mjs';

// (www's origin field holds the capture session's airport, de/de's "Prague - Ruzyně Airport": not
// the page's; the fare teaser's recommendations name the configured origin and its code)
const teaser = (name, code) => `<a href="/de/de/book-and-manage/destination?OriginCode=${code}&amp;DestinationCode=ATL" class="fareteaser-recommendation-od-link"><div class="fareteaser-recommendation-origin">${name}</div></a>`;
const HOME = `<input name="flightQuery.flightSegments[0].originCode" type="text" value="Prague - Ruzyně Airport">${teaser('Frankfurt', 'FRA')}${teaser('Frankfurt', 'FRA')}${teaser('München', 'MUC')}`;

// (the destination finder configures no origin on www: lh-com's parser writes its list's first
// airport, fr/fr's "Bastia (BIA)", us/en's "Albany (ALB)")
const FINDER = '<div class="destination-finder"><div><div>Default origin</div><div>Bastia (BIA)</div></div></div>';

// a fare teaser the browser draws (41 roots: no recommendations in the snapshot, its origin field
// the list's first airport): its configured origin code alone ("FRA": the block names it)
const DYNAMIC = '<input id="dcep-inlinetextautocompleteairport-fareteaser-origins" value="Aachen/Maastricht"><div data-dcep="{&quot;fareTeaserManualTravels&quot;:[{&quot;destination&quot;:&quot;ATL&quot;,&quot;origin&quot;:&quot;FRA&quot;},{&quot;destination&quot;:&quot;ATH&quot;,&quot;origin&quot;:&quot;FRA&quot;}]}"></div>';

test('marketOriginOf: the fare teaser\'s most frequent origin (its name and code), else its configured code alone; never the destination finder\'s parsed value or the session\'s origin field', () => {
  assert.equal(marketOriginOf(HOME), 'Frankfurt (FRA)');
  assert.equal(marketOriginOf(HOME, FINDER), 'Frankfurt (FRA)');
  assert.equal(marketOriginOf(DYNAMIC, FINDER), 'FRA', 'a dynamic fare teaser: its code');
  assert.equal(marketOriginOf('<p>no fare teaser</p>', FINDER), '', 'the destination finder\'s first airport is none');
  assert.equal(marketOriginOf('<input name="flightQuery.flightSegments[0].originCode" value="Prague">'), '');
});

test('withMarketOrigin: the destination finder\'s default origin as the root\'s too; without one the parsed row as it is', () => {
  const doc = `${withFlightSearch('<div class="flight-search"></div>', '/fr/fr/homepage')}${FINDER}`;
  const out = withMarketOrigin(doc, HOME);
  assert.ok(out.includes('<div class="destination-finder"><div><div>Default origin</div><div>Frankfurt (FRA)</div></div></div>'), out);
  assert.ok(withMarketOrigin(doc, DYNAMIC).includes('<div class="destination-finder"><div><div>Default origin</div><div>FRA</div></div></div>'));
  assert.equal(withMarketOrigin(FINDER, '<p></p>'), FINDER, 'no origin: as parsed');
});

test('withMarketOrigin: after swiss-import.mjs\'s Shop row, once; a block with an origin (ch) as it is', () => {
  const doc = withFlightSearch('<div class="flight-search"><div><div>Trip</div><div>x</div></div></div>', '/de/en/homepage');
  const out = withMarketOrigin(doc, HOME);
  assert.ok(out.includes('<div><div>Shop</div><div><a href="https://shop.swiss.com/booking/availability">https://shop.swiss.com/booking/availability</a></div></div><div><div>Default origin</div><div>Frankfurt (FRA)</div></div><div><div>Trip</div>'), out);
  assert.equal(withMarketOrigin(out, HOME), out, 'once');
  const ch = withFlightSearch('<div class="flight-search"></div>', '/ch/en/homepage');
  assert.equal(withMarketOrigin(ch, HOME), ch, 'ch/en has Zurich (ZRH)');
  assert.equal(withMarketOrigin(doc, '<p></p>'), doc, 'no origin on the homepage: the hub');
});

test('servedPaths: the roots\' own documents, the language versions\' and ch/<ll>\'s pages for the roots their markets list (of that language); an empty markets row every market root of the language (lh-edge\'s rule)', () => {
  const served = servedPaths({
    own: ['/de/en/homepage', '/al/fr/local-page/x'],
    sitePaths: new Set(['/ch/en/prepare/baggage', '/ch/en/only-de', '/ch/en/contact-us', '/ch/fr/bagages']),
    markets: {
      '/ch/en/prepare/baggage': ['de/en', 'al/en', 'de/de'], '/ch/en/only-de': ['de/en'], '/ch/en/contact-us': [], '/ch/fr/bagages': ['al/fr'], '/ch/de/x': { status: 404 },
    },
    roots: ['de/en', 'al/en', 'de/de', 'al/fr'],
  });
  ['/de/en/homepage', '/al/fr/local-page/x', '/ch/en/prepare/baggage', '/de/en/prepare/baggage', '/al/en/prepare/baggage', '/al/fr/bagages', '/de/en/only-de', '/de/en/contact-us', '/al/en/contact-us'].forEach((p) => assert.ok(served.has(p), p));
  ['/de/de/prepare/baggage', '/al/en/only-de', '/de/de/contact-us', '/al/fr/contact-us', '/ch/de/x'].forEach((p) => assert.ok(!served.has(p), p));
});

test('withoutDatepicker: the date picker div goes, the rest stays', () => {
  assert.equal(withoutDatepicker('<main><p>a</p></main><div id="ui-datepicker-div" class="ui-datepicker"><div><a>Prev</a></div></div><p>b</p>'), '<main><p>a</p></main><p>b</p>');
});

test('the market pages\' images www answers 404 (GONE_IMAGES; still missing in DA after the capture\'s upload) are left out, their paragraphs with them; the others stay', async () => {
  const { withDaImages, GONE_IMAGES, filesOf } = await import('../tools/importer/swiss-sub-dam.mjs');
  const gone = [
    '/content/dam/lx/images/local_images/Logo-AIG.jpg',
    '/content/dam/lx/images/local_images/LX004_SWISS_Saveurs_Mondial_fr_Fondue_2023_Landing_Page_Stage_Teaser_1440x720px_f01_01_@2x.jpg',
    '/content/dam/lx/images/local_images/LX004_SWISS_Saveurs_Mondial_it_Fondue_2023_Landing_Page_Stage_Teaser_1440x720px_f01_01_@2x.jpg',
    '/content/dam/btg/btg-terminal-1-1-jpg.jpeg',
    '/content/dam/lx/hxod/stage-winter-skideshot-slki-und-snowboard-1.jpg',
    '/content/dam/lx/images/pixels/7/7/8/251028-swiss-uk-2hy-winter-newsletter-header-2-1.jpg',
  ];
  assert.equal(gone.every((g) => GONE_IMAGES.includes(g)), true);
  gone.forEach((g) => {
    const doc = `<h2>X</h2><p><img src="https://www.swiss.com${g}.transform/lh-dcep-transform-width-2560/img.jpg" alt=""></p><p>Text</p><p><img src="https://www.swiss.com/content/dam/lx/images/other.jpg" alt=""></p>`;
    const out = withDaImages(doc);
    assert.equal(out.startsWith('<h2>X</h2><p>Text</p>') && out.includes('/content/dam/lx/images/other.jpg'), true, g);
    assert.equal([...filesOf([{ p: '/gb/en/x', doc, snap: '' }]).values()].length, 1, g);
  });
});

test('onSite: a page of a language lh-swiss has (live, or behind SWISS_LANGUAGES_LIVE as a pilot: el, ru), or of an own root (kr/ko), is the site\'s; another language\'s not', async () => {
  const { onSite } = await import('../tools/importer/swiss-market-import.mjs');
  assert.equal(onSite('/kr/ko/fly/check-in'), true);
  assert.equal(onSite('/kr/en/homepage'), true);
  assert.equal(onSite('/gr/el/homepage'), true);
  assert.equal(onSite('/ru/ru/family-promotion'), true);
  assert.equal(onSite('/tr/tr/homepage'), false);
});

test('marketsOfDocument: a ch page\'s markets from its rendered page\'s head (a language whose index is not built yet)', async () => {
  const { marketsOfDocument } = await import('../tools/importer/swiss-market-import.mjs');
  const meta = (v) => `<html><head><title>x</title>${v === null ? '' : `<meta name="markets" content="${v}">`}</head><body></body></html>`;
  assert.deepEqual(marketsOfDocument(meta('gr/el, cy/el')), ['gr/el', 'cy/el']);
  assert.deepEqual(marketsOfDocument(meta('')), []);
  assert.deepEqual(marketsOfDocument(meta(null)), []);
});

test('marketsOf: a language index\'s rows as the markets record (path -> its roots; an empty markets value: none listed)', async () => {
  const { marketsOf } = await import('../tools/importer/swiss-market-import.mjs');
  assert.deepEqual(marketsOf([{ path: '/ch/es/a', markets: 'ar/es, br/es' }, { path: '/ch/es/b', markets: '' }, { path: '/ch/es/c' }]), {
    '/ch/es/a': ['ar/es', 'br/es'], '/ch/es/b': [], '/ch/es/c': [],
  });
});

test('withServedLinks: www\'s links to a path lh-swiss serves itself (/deeplink/cockpit) relative, the query kept; other www links as they are', async () => {
  const { withServedLinks } = await import('../tools/importer/swiss-market-import.mjs');
  const doc = '<a href="https://www.swiss.com/deeplink/cockpit?country=AE&amp;language=EN">My flights</a> <a href="https://www.swiss.com/deeplink/other">x</a> <a href="https://www.swiss.com/deeplink/cockpit">y</a>';
  assert.equal(withServedLinks(doc, ['/deeplink/cockpit']), '<a href="/deeplink/cockpit?country=AE&amp;language=EN">My flights</a> <a href="https://www.swiss.com/deeplink/other">x</a> <a href="/deeplink/cockpit">y</a>');
});

test('withParentPath: the Parent metadata as a plain path (as ch\'s documents write it; a link\'s text, www\'s URL, became the breadcrumb\'s target)', async () => {
  const { withParentPath } = await import('../tools/importer/swiss-market-import.mjs');
  const row = (cell) => `<div><div>Parent</div><div>${cell}</div></div>`;
  assert.equal(withParentPath(row('<a href="/kr/en/homepage">https://www.swiss.com/kr/en/homepage</a>')), row('/kr/en/homepage'));
  assert.equal(withParentPath(row('<a href="https://www.swiss.com/kr/en/homepage">https://www.swiss.com/kr/en/homepage</a>')), row('/kr/en/homepage'));
  assert.equal(withParentPath(row('/ch/en/homepage')), row('/ch/en/homepage'));
});

test('relinked: a market document\'s links again (the root\'s served pages relative, DAM links site-relative, served paths, Parent); a second pass leaves it as it is', async () => {
  const { relinked } = await import('../tools/importer/swiss-market-import.mjs');
  const doc = '<p><a href="https://www.swiss.com/br/pt/fly/check-in">Check-in</a> <a href="https://www.swiss.com/content/dam/lx/documents/br/condicoes-gerais-de-transporte-aereo-jun2024.pdf">Condições</a> <a href="https://www.swiss.com/deeplink/cockpit?country=BR&amp;language=PT">Voos</a> <a href="https://www.swiss.com/br/pt/unknown">x</a></p>';
  const opts = { served: new Set(['/br/pt/fly/check-in']), subPages: new Set(), selfServed: ['/deeplink/cockpit'] };
  const out = relinked(doc, opts);
  assert.equal(out.includes('href="/br/pt/fly/check-in"'), true, out);
  assert.equal(out.includes('href="/content/dam/lx/documents/br/condicoes-gerais-de-transporte-aereo-jun2024.pdf"'), true, out);
  assert.equal(out.includes('href="/deeplink/cockpit?country=BR&amp;language=PT"'), true, out);
  assert.equal(out.includes('href="https://www.swiss.com/br/pt/unknown"'), true, out);
  assert.equal(relinked(out, opts), out);
});

test('kr/ko\'s images www answers 404 (on the capture\'s not-fetched list) are left out; the voucher icon Edge Delivery refuses (66 KB SVG) as ch\'s PNG of it (swiss-nav.mjs LOCAL_IMAGES), www\'s or DA\'s spelling', async () => {
  const { withDaImages, GONE_IMAGES } = await import('../tools/importer/swiss-sub-dam.mjs');
  const { relinked } = await import('../tools/importer/swiss-market-import.mjs');
  const gone = [
    '/content/dam/lx/images/frontify/2024/q3/2024-061-SWISS_A350_Shot_02_delivery-C.jpg',
    '/content/dam/lx/images/frontify_variations/9/c-917821987-436555062.jpg',
    '/content/dam/lx/images/frontify_variations/3/c-207114728-SWISS_Business_Continental_Meal_7.jpg',
    '/content/dam/lx/images/frontify_variations/9/c-552853445-436555062.jpg',
    '/content/dam/lx/images/local_images/Formular_2to1.jpg',
  ];
  assert.equal(gone.every((g) => GONE_IMAGES.includes(g)), true);
  gone.forEach((g) => {
    const out = withDaImages(`<p><img src="https://www.swiss.com${g}.transform/lh-dcep-transform-width-2560/img.jpg" alt=""></p><p>Text</p>`);
    assert.equal(out, '<p>Text</p>', g);
  });
  const opts = { served: new Set(), subPages: new Set(), selfServed: [] };
  const da = '<h3><a href="/kr/ko/customer-support/faq/lounge-voucher"><img src="https://content.da.live/moved-permanently/lh-swiss/content/dam/lx/icons/product-voucher.svg" alt="">라운지 이용 바우처</a></h3>';
  assert.equal(relinked(da, opts).includes('<img src="/media-da/swiss/product-voucher.png" alt="">'), true);
  const www = '<img src="https://www.swiss.com/content/dam/lx/icons/product-voucher.svg" alt="">';
  assert.equal(relinked(www, opts), '<img src="/media-da/swiss/product-voucher.png" alt="">');
});
