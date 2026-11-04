/* eslint-disable import/no-extraneous-dependencies, import/extensions -- tests */
/* eslint-disable no-underscore-dangle -- the page JSON's __typename */
/**
 * TAP Air Portugal's importer (tools/importer/tap-import.mjs): www.flytap.com's page JSON
 * (__NEXT_DATA__ of five captured pt-pt pages, trimmed: test/fixtures/tap/) as Edge Delivery
 * documents with lh-com's blocks.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import {
  altOf, slugOf, docPath, richText, linkOf, anchorsOf, convertPage, mediaIndex, mediaResolver,
} from '../tools/importer/tap-import.mjs';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/tap');
const nd = (name) => JSON.parse(fs.readFileSync(path.join(dir, `${name}.json`), 'utf8'));
const dom = (html) => parseHTML(`<html><body><main>${html}</main></body></html>`).document;

// the site the fixtures belong to: the five pages are in scope, an image of the homepage has a
// local copy, the FAQ page's anchors are known
const scope = new Set(['/pt-pt', '/pt-pt/ajuda', '/pt-pt/ajuda/perguntas-frequentes', '/pt-pt/informacoes-check-in', '/pt-pt/informacoes/bagagem']);
const MEDIA = {
  '/adobe/dynamicmedia/deliver/dm-aid--bd6d1ad2-88c0-4ed9-9cc2-91a83509e5dc/baggage_tap_air_portugal_card_hp.jpg': '/media-da/tap/baggage-tap-air-portugal-card-hp-1a2b3c4d.jpg',
};
const site = () => ({
  scope,
  media: (key) => MEDIA[key] || null,
  anchors: new Map([['/pt-pt/ajuda/perguntas-frequentes', anchorsOf(nd('perguntas-frequentes'))]]),
});
const ctx = (url = 'https://www.flytap.com/pt-pt/ajuda') => ({
  url, lang: 'pt', locale: 'pt-pt', ...site(),
});

describe('tap-import helpers', () => {
  it('altOf picks the language of www\'s multilingual descriptions', () => {
    assert.equal(altOf('pt:Ícone adicionar seguro|en:Icon add insurance|fr:Icône', 'pt'), 'Ícone adicionar seguro');
    assert.equal(altOf('pt:Ícone adicionar seguro|en:Icon add insurance|fr:Icône', 'en'), 'Icon add insurance');
    assert.equal(altOf('Fotografia de uma mulher', 'en'), 'Fotografia de uma mulher');
    assert.equal(altOf(null, 'pt'), '');
  });

  it('slugOf makes a heading\'s id as the backend does (accents kept, punctuation dropped)', () => {
    assert.equal(slugOf('Antes do voo'), 'antes-do-voo');
    assert.equal(slugOf('Alteração da reserva, cancelamento e reembolsos'), 'alteração-da-reserva-cancelamento-e-reembolsos');
    assert.equal(slugOf('Entrada no “Espaço Schengen”'), 'entrada-no-espaço-schengen');
  });

  it('docPath keeps the source path (the homepage /pt-pt itself)', () => {
    assert.equal(docPath('https://www.flytap.com/pt-pt'), '/pt-pt');
    assert.equal(docPath('https://www.flytap.com/pt-pt/ajuda/reembolsos-tap/'), '/pt-pt/ajuda/reembolsos-tap');
  });

  it('linkOf: site pages in scope relative, the rest on www, the market placeholder filled', () => {
    const c = ctx();
    assert.equal(linkOf('/informacoes/bagagem', c), '/pt-pt/informacoes/bagagem');
    assert.equal(linkOf('https://www.flytap.com/pt-pt/ajuda', c), '/pt-pt/ajuda');
    assert.equal(linkOf('/registo', c), 'https://www.flytap.com/pt-pt/registo');
    assert.equal(linkOf('https://www.flytap.com/pt_[market]/mercados-natal', c), 'https://www.flytap.com/pt_pt/mercados-natal');
    assert.equal(linkOf('https://receipts.flytap.com/PaxReceiptsWAR/spring/docs?locale=pt', c), 'https://receipts.flytap.com/PaxReceiptsWAR/spring/docs?locale=pt');
    // www's anchors to the FAQ categories: our heading ids
    assert.equal(linkOf('/ajuda/perguntas-frequentes#antes-voo', c), '/pt-pt/ajuda/perguntas-frequentes#antes-do-voo');
    // a widget anchor (www opens its check-in form): the root homepage's booking box
    assert.equal(linkOf('#special-anchor-check-in', c), '/pt-pt#check-in');
  });

  it('richText: paragraphs, formats, links, line breaks, headers, lists', () => {
    const html = richText([
      { nodeType: 'paragraph', content: [{ nodeType: 'text', value: 'Veja ' }, { nodeType: 'text', value: 'já', format: { variants: ['strong'] } }, { nodeType: 'line-break', content: [] }, { nodeType: 'link', data: { href: '/informacoes/bagagem' }, content: [{ nodeType: 'text', value: 'bagagem' }] }] },
      { nodeType: 'header', style: 'h2', content: [{ nodeType: 'text', value: 'Título', format: { variants: ['strong'] } }] },
      { nodeType: 'text', value: 'Solto' },
      { nodeType: 'unordered-list', content: [{ nodeType: 'list-item', content: [{ nodeType: 'text', value: 'Um', format: { variants: ['emphasis'] } }] }] },
    ], ctx());
    assert.equal(html, '<p>Veja <strong>já</strong><br><a href="/pt-pt/informacoes/bagagem">bagagem</a></p><h2>Título</h2><p>Solto</p><ul><li><em>Um</em></li></ul>');
  });
});

describe('tap-import media', () => {
  it('the media archives\' files by every URL they were seen under, as /media-da/tap/ copies within the limits', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tap-media-'));
    const rel = 'pic.flytap.com/adobe/dynamicmedia/deliver/dm-aid--1/baggage_card.jpg';
    fs.mkdirSync(path.join(tmp, path.dirname(rel)), { recursive: true });
    fs.writeFileSync(path.join(tmp, rel), 'x');
    const big = 'pic.flytap.com/adobe/dynamicmedia/deliver/dm-aid--2/stopover.jpg';
    fs.mkdirSync(path.join(tmp, path.dirname(big)), { recursive: true });
    fs.writeFileSync(path.join(tmp, big), 'y');
    fs.writeFileSync(path.join(tmp, 'manifest.json'), JSON.stringify([
      {
        path: rel, url: `https://${rel}?preferwebp=true&quality=75&width=1920`, urlsSeen: [`https://${rel}?preferwebp=true&quality=75&width=1280`], bytes: 1, contentType: 'image/webp',
      },
      {
        path: big, url: `https://${big}?width=1280`, urlsSeen: [], bytes: 48986761, contentType: 'image/gif',
      },
    ]));
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'tap-out-'));
    const media = mediaResolver(mediaIndex([tmp]), { out });
    const m = media('/adobe/dynamicmedia/deliver/dm-aid--1/baggage_card.jpg');
    assert.ok(m && /^\/media-da\/tap\/baggage-card-[0-9a-f]{8}\.webp$/.test(m.eds));
    assert.ok(fs.existsSync(path.join(out, m.eds)));
    assert.ok(/over Edge Delivery's 20 MB/.test(media('/adobe/dynamicmedia/deliver/dm-aid--2/stopover.jpg').link));
    assert.equal(media('/adobe/dynamicmedia/deliver/dm-aid--3/none.jpg'), null);
  });
});

describe('tap-import marks and languages', () => {
  const t = (value, ...variants) => ({ nodeType: 'text', value, ...(variants.length ? { format: { variants } } : {}) });
  it('a bold-italic run inside bold text: one bold run with the italic in it (no literal asterisks on preview)', () => {
    assert.equal(
      richText([{ nodeType: 'paragraph', content: [t('la escultura ', 'strong'), t('Compianto sul Cristo morto', 'emphasis', 'strong'), t(', compuesta por siete estatuas', 'strong'), t(' de tamaño real.')] }], ctx()),
      '<p><strong>la escultura <em>Compianto sul Cristo morto</em>, compuesta por siete estatuas</strong> de tamaño real.</p>',
    );
    assert.equal(
      richText([{ nodeType: 'list-item', content: [] }, { nodeType: 'unordered-list', content: [{ nodeType: 'list-item', content: [t('Si es un vuelo de código ', 'strong'), t('compartido', 'strong', 'emphasis'), t('*', 'strong')] }] }], ctx()),
      '<ul><li><strong>Si es un vuelo de código <em>compartido</em>*</strong></li></ul>',
    );
    // separate runs stay separate; a space between two bold runs keeps one run
    assert.equal(richText([{ nodeType: 'paragraph', content: [t('a', 'emphasis', 'strong'), t(' e '), t('b', 'strong')] }], ctx()), '<p><strong><em>a</em></strong> e <strong>b</strong></p>');
    assert.equal(richText([{ nodeType: 'paragraph', content: [t('a', 'strong'), t(' ', 'strong'), t('b', 'bold')] }], ctx()), '<p><strong>a b</strong></p>');
    // an open mark stays open while the next text has it too (an author line: "Por" italic, the
    // name bold-italic)
    assert.equal(richText([{ nodeType: 'paragraph', content: [t('Por ', 'emphasis'), t('Augusto Freitas', 'strong', 'emphasis'), t(' - © up-tap', 'emphasis')] }], ctx()), '<p><em>Por <strong>Augusto Freitas</strong> - © up-tap</em></p>');
    // the mark that runs on is the outer one (www: "arroz de marisc" bold-italic, its "o" italic)
    assert.equal(richText([{ nodeType: 'paragraph', content: [t('arroz de marisc', 'strong', 'emphasis'), t('o', 'emphasis'), t(' (seafood)')] }], ctx()), '<p><em><strong>arroz de marisc</strong>o</em> (seafood)</p>');
    // spaces at a link's edge go outside it too (a bold link text ending in a space, bold after it)
    assert.equal(richText([{ nodeType: 'paragraph', content: [t('junto da', 'strong'), t(' '), { nodeType: 'link', data: { href: 'https://www.dgav.pt/' }, content: [t('Direção Geral', 'strong'), t(' ', 'strong')] }, t('ou de um veterinário.', 'strong')] }], ctx()), '<p><strong>junto da</strong> <a href="https://www.dgav.pt/"><strong>Direção Geral</strong></a> <strong>ou de um veterinário.</strong></p>');
    // spaces at a mark's edge go outside it (a closing mark after a space is no mark in Markdown)
    assert.equal(richText([{ nodeType: 'paragraph', content: [t('1 par '), t('standard ', 'emphasis'), t('ou', 'strong'), t(' 1 '), t('slalom', 'emphasis')] }], ctx()), '<p>1 par <em>standard</em> <strong>ou</strong> 1 <em>slalom</em></p>');
  });

  it('www\'s widget link and the video label in every language of the site (pt, en, es, fr, de, it, pl)', () => {
    const page = () => ({ props: { pageProps: { page: { title: 'X', sections: [{ __typename: 'ComponentHeadingModel', title: 'X' }, { __typename: 'ComponentWidgetFreeBlockModel' }] } } } });
    const labels = {
      'pt-pt': 'Ver em flytap.com', 'en-pt': 'See on flytap.com', 'es-es': 'Ver en flytap.com', 'fr-fr': 'Voir sur flytap.com', 'de-de': 'Auf flytap.com ansehen', 'it-it': 'Vedi su flytap.com', 'pl-pl': 'Zobacz na flytap.com',
    };
    Object.entries(labels).forEach(([locale, label]) => {
      const { html } = convertPage(page(locale), { ...ctx(`https://www.flytap.com/${locale}/x`), lang: undefined, locale: undefined });
      assert.ok(html.includes(`>${label}</a>`), `${locale}: ${label}`);
      assert.ok(html.includes(`<div>Language</div><div>${locale.split('-')[0]}</div>`), locale);
    });
  });

  it('a rich text image without a file (aem.flytap.com) is listed in the page report\'s missing', () => {
    const page = { props: { pageProps: { page: { title: 'X', sections: [{ __typename: 'ComponentRichTextBlockModel', richTextContent: { json: [{ nodeType: 'paragraph', content: [{ nodeType: 'reference', data: { path: '/content/dam/tap/x/card.jpg', mimetype: 'image/jpeg' } }, t('texto')] }] } }] } } } };
    const { html, report } = convertPage(page, ctx('https://www.flytap.com/pt-pt/stopover/parceiros'));
    assert.ok(!html.includes('aem.flytap.com'));
    assert.deepEqual(report.missing, ['https://aem.flytap.com/content/dam/tap/x/card.jpg']);
  });
});

describe('tap-import parity (tools/reports/tap/parity.md)', () => {
  const metaRows = (html) => Object.fromEntries([...dom(html).querySelectorAll('.metadata > div')].map((r) => [r.children[0].textContent, r.children[1].textContent]));
  const one = (sections, extra = {}) => ({ props: { pageProps: { page: { title: 'Página', sections, ...extra } } } });

  it('the homepage: the booking box (booking-spec.md 5.1) in a section of its own right after the stage', () => {
    const home = nd('homepage');
    home.props.pageProps.markets = [{ code: 'DE', airport: 'FRA' }, { code: 'PT', airport: 'LIS' }];
    const labels = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../tools/reports/tap/booking-labels.json'), 'utf8'))['pt-pt'];
    const { html, report } = convertPage(home, { ...ctx('https://www.flytap.com/pt-pt'), booking: { labels, originName: 'Lisboa, Portugal' } });
    const sections = [...dom(html).querySelectorAll('main > div')];
    const stage = sections.findIndex((s) => s.querySelector('.hero-campaign'));
    const box = sections[stage + 1].querySelector('.booking-box');
    assert.ok(box, 'the box in the section after the stage');
    assert.equal(sections[stage + 1].children.length, 1, 'the box alone in its section');
    const rows = Object.fromEntries([...box.querySelectorAll(':scope > div')].map((r) => [r.children[0].textContent, r.children[1]]));
    assert.equal(rows.Format.textContent, 'tap');
    assert.equal(rows.Market.textContent, 'PT');
    assert.equal(rows.Language.textContent, 'pt');
    assert.equal(rows['Default origin'].textContent, 'LIS');
    assert.equal(rows['Default origin name'].textContent, 'Lisboa, Portugal');
    assert.equal(rows.Airports.querySelector('a').getAttribute('href'), '/pt-pt/booking/airports.json');
    assert.equal(rows.Tabs.textContent, 'Reservar voo, Fazer Check-in, Gerir reserva, Estado do voo');
    assert.equal(rows['Corporate link'].querySelector('a').getAttribute('href'), 'https://tapforbiz.com/');
    assert.equal(rows['Corporate link'].textContent, 'Reservas para empresas');
    // one row per label key (TAP's key | the root's text)
    assert.equal(rows['round-trip'].textContent, 'Ida e volta');
    assert.equal(rows['babys-range'].textContent, 'Idade inferior a 2 anos');
    assert.ok(!rows._corporate_link);
    assert.equal(report.blocks['booking-box'], 1);
    assert.ok(!html.includes('booking-slot'));
  });

  it('the market\'s airport when the page names no market list; the market from the root', () => {
    const labels = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../tools/reports/tap/booking-labels.json'), 'utf8'))['de-de'];
    const { html } = convertPage(nd('homepage'), {
      ...ctx('https://www.flytap.com/de-de'), locale: 'de-de', lang: 'de', booking: { labels },
    });
    const box = dom(html).querySelector('.booking-box');
    const rows = Object.fromEntries([...box.querySelectorAll(':scope > div')].map((r) => [r.children[0].textContent, r.children[1].textContent]));
    assert.equal(rows.Market, 'DE');
    assert.equal(rows.Language, 'de');
    assert.equal(rows['Default origin'], 'FRA');
    assert.equal(rows.Tabs, 'Flug buchen, Check-in, Buchung verwalten, Flugstatus');
  });

  it('www\'s box anchors (#special-anchor-book-flight, -check-in, -my-travels, -flight-status) go to the root homepage\'s box', () => {
    const c = ctx('https://www.flytap.com/pt-pt/ajuda');
    assert.equal(linkOf('#special-anchor-check-in', c), '/pt-pt#check-in');
    assert.equal(linkOf('/pt-pt#special-anchor-book-flight', c), '/pt-pt#book-flight');
    assert.equal(linkOf('https://www.flytap.com/pt-pt#special-anchor-my-travels', c), '/pt-pt#my-travels');
    assert.equal(linkOf('/informacoes#special-anchor-flight-status', c), '/pt-pt#flight-status');
    // the sign-in stays on www
    assert.equal(linkOf('#special-anchor-login', c), 'https://www.flytap.com/pt-pt/ajuda#special-anchor-login');
  });

  it('Miles&Go on the homepage: the visitor\'s card only (www shows the others to members), no stretched logo', () => {
    const { html } = convertPage(nd('homepage'), ctx('https://www.flytap.com/pt-pt'));
    const cm = dom(html).querySelector('.columns-media');
    assert.equal(cm.querySelectorAll(':scope > div').length, 1);
    assert.ok(cm.textContent.includes('TAP Miles&Go') && !cm.textContent.includes('Club TAP Miles&Go'));
    assert.ok(![...cm.querySelectorAll('img')].some((i) => /logo/.test(i.getAttribute('src') + i.getAttribute('alt'))));
  });

  it('breadcrumbs: Parent the nearest ancestor we have (else the homepage), Breadcrumb Title the page\'s title; none on the homepage', () => {
    assert.equal(metaRows(convertPage(nd('homepage'), ctx('https://www.flytap.com/pt-pt')).html).Parent, undefined);
    const help = metaRows(convertPage(nd('ajuda'), ctx()).html);
    assert.equal(help.Parent, '/pt-pt');
    assert.equal(help['Breadcrumb Title'], 'Central de ajuda');
    const crumbs = [{ url: '/informacoes', title: 'Informações de viagem' }];
    const page = { props: { pageProps: { breadcrumbs: crumbs, page: { title: 'Bagagem', sections: [{ __typename: 'ComponentHeadingModel', title: 'Bagagem' }] } } } };
    assert.equal(metaRows(convertPage(page, { ...ctx('https://www.flytap.com/pt-pt/informacoes/bagagem'), scope: new Set(['/pt-pt/informacoes']) }).html).Parent, '/pt-pt/informacoes');
    assert.equal(metaRows(convertPage(page, { ...ctx('https://www.flytap.com/pt-pt/informacoes/bagagem'), scope: new Set() }).html).Parent, '/pt-pt');
  });

  it('text cards three to a row (itemsPerRow 3): cards (three-up), their buttons kept (tap.css lays them out three to a row)', () => {
    const d = dom(convertPage(nd('ajuda'), ctx()).html);
    const t = d.querySelector('.cards.three-up');
    assert.ok(t && t.textContent.includes('Check-in online'));
    assert.ok(t.querySelector('strong > a'));
  });

  it('a list of links to pages: cards-icon tiles (www\'s grid of tiles); links to the page\'s own anchors stay jump-links', () => {
    const d = dom(convertPage(nd('ajuda'), ctx()).html);
    assert.ok(d.querySelector('.cards-icon a[href="/pt-pt/ajuda/perguntas-frequentes#antes-do-voo"]'));
    const own = convertPage(one([{ __typename: 'ComponentLinkListModel', linkList: [{ label: 'A', url: '#a' }, { label: 'B', url: '#b' }] }]), ctx()).html;
    assert.ok(dom(own).querySelector('.jump-links'));
  });

  it('a page banner with a picture only (no title, text or button): the picture in the content, no stage', () => {
    const img = { __typename: 'ImageRef', _dynamicUrl: '/adobe/dynamicmedia/deliver/dm-aid--bd6d1ad2-88c0-4ed9-9cc2-91a83509e5dc/baggage_tap_air_portugal_card_hp.jpg?preferwebp=true', description: 'Mala' };
    const d = dom(convertPage(one([{ __typename: 'ComponentHeroCardModel', image: img, title: null }, { __typename: 'ComponentHeadingModel', title: 'Bagagem' }]), ctx('https://www.flytap.com/pt-pt/informacoes/bagagem')).html);
    assert.ok(!d.querySelector('.hero-campaign, .hero-card-overlay'));
    assert.ok(d.querySelector('main > div > p > img[src^="/media-da/tap/"]'));
  });

  it('Explore Miles&Go (InfoSection): the picture, then its groups as an accordion', () => {
    const s = {
      __typename: 'ComponentInfoSectionModel', title: null, image: null, infoList: [{ label: 'Conhecer o Programa', infodescription: { json: [{ nodeType: 'unordered-list', content: [{ nodeType: 'list-item', content: [{ nodeType: 'link', data: { href: '/miles-and-go/estatutos' }, content: [{ nodeType: 'text', value: 'Estatutos' }] }] }] }] } }, { label: 'Acumular milhas', infodescription: { json: [] } }],
    };
    const d = dom(convertPage(one([s]), ctx('https://www.flytap.com/pt-pt/miles-and-go')).html);
    const faq = d.querySelector('.accordion-columns.faq');
    assert.deepEqual([...faq.querySelectorAll(':scope > div > div:first-child')].map((x) => x.textContent), ['Conhecer o Programa', 'Acumular milhas']);
    assert.ok(!d.querySelector('.columns-media'));
  });
});

describe('tap-import rich text images', () => {
  const ref = (p) => [{ nodeType: 'paragraph', content: [{ nodeType: 'span', content: [{ nodeType: 'reference', data: { path: p, mimetype: 'image/jpeg' } }] }] }];
  it('a reference to a DAM image: the archive\'s copy, else left out and listed (www renders it from aem.flytap.com)', () => {
    const missing = new Set();
    const c = { ...ctx(), missing, media: (k) => (k === '/content/dam/tap/a.jpg' ? '/media-da/tap/a-1.jpg' : null) };
    assert.equal(richText(ref('/content/dam/tap/a.jpg'), c), '<p><img src="/media-da/tap/a-1.jpg" alt=""></p>');
    assert.equal(richText(ref('/content/dam/tap/b.jpg'), c), '');
    assert.deepEqual([...missing], ['https://aem.flytap.com/content/dam/tap/b.jpg']);
  });
});

describe('tap-import pages', () => {
  it('the homepage: the stage slider, the service links, the cards, Miles&Go, metadata', () => {
    const { html, report } = convertPage(nd('homepage'), ctx('https://www.flytap.com/pt-pt'));
    const d = dom(html);
    const hero = d.querySelector('.hero-campaign');
    assert.ok(hero && hero.classList.contains('slider'));
    assert.equal(hero.querySelectorAll(':scope > div').length, 4); // two slides: image row, text row
    assert.ok(hero.textContent.includes('Islândia: onde a Natureza supera a imaginação'));
    assert.equal(d.querySelectorAll('h1').length, 1);
    const icons = d.querySelector('.cards-icon');
    assert.ok(icons && icons.textContent.includes('Adicionar seguro'));
    const cards = d.querySelector('.carousel-cards');
    assert.ok(cards && cards.textContent.includes('Regras e restrições de bagagem'));
    // the local copy of an image, an image without one stays on www's host and is listed
    assert.ok(cards.querySelector('img[src="/media-da/tap/baggage-tap-air-portugal-card-hp-1a2b3c4d.jpg"]'));
    assert.ok(report.missing.some((u) => u.startsWith('https://pic.flytap.com/adobe/dynamicmedia/deliver/')));
    assert.ok(cards.querySelector('a[href="/pt-pt/informacoes/bagagem"]'));
    assert.ok(d.querySelector('.columns-media') && d.querySelector('.columns-media').textContent.includes('TAP Miles&Go'));
    const meta = d.querySelector('.metadata');
    assert.ok(meta.textContent.includes('TAP Air Portugal | flyTAP Website Oficial'));
    assert.ok(meta.textContent.includes('/pt-pt/nav') && meta.textContent.includes('/pt-pt/footer'));
  });

  it('without the source\'s images (the CLI\'s default): an image without a local copy is left out and listed', () => {
    const { html, report } = convertPage(nd('homepage'), { ...ctx('https://www.flytap.com/pt-pt'), sourceImages: false });
    assert.ok(!html.includes('pic.flytap.com'));
    assert.ok(html.includes('/media-da/tap/baggage-tap-air-portugal-card-hp-1a2b3c4d.jpg'));
    assert.ok(report.missing.some((u) => u.startsWith('https://pic.flytap.com/')));
  });

  it('the help centre: H1 from the heading, cards, an accordion, links to the FAQ anchors', () => {
    const { html, report } = convertPage(nd('ajuda'), ctx());
    const d = dom(html);
    assert.equal(d.querySelector('h1').textContent, 'Central de ajuda');
    assert.equal(d.querySelectorAll('h1').length, 1);
    const faq = d.querySelector('.accordion-columns.faq');
    assert.ok(faq && faq.textContent.includes('Que reservas podem ser alteradas online?'));
    assert.ok(d.querySelector('a[href="/pt-pt/ajuda/perguntas-frequentes#antes-do-voo"]'));
    // the contacts by country (www's live list): a link to the page on www, reported
    assert.ok(report.linkedOut.some((x) => /ContactsByCountry/.test(x)));
  });

  it('the FAQ: a heading per category and subcategory, an accordion per subcategory', () => {
    const { html } = convertPage(nd('perguntas-frequentes'), ctx('https://www.flytap.com/pt-pt/ajuda/perguntas-frequentes'));
    const d = dom(html);
    assert.deepEqual([...d.querySelectorAll('h2')].map((h) => h.textContent), ['Antes do voo', 'Durante o voo']);
    assert.ok(d.querySelectorAll('.accordion-columns.faq').length >= 2);
  });

  it('check-in information: the info box, the accordion with the airports\' table in its panel', () => {
    const { html } = convertPage(nd('informacoes-check-in'), ctx('https://www.flytap.com/pt-pt/informacoes-check-in'));
    const d = dom(html);
    const box = d.querySelector('.section-metadata');
    assert.ok(box && box.textContent.includes('highlight'));
    assert.ok(d.body.textContent.includes('Informação importante'));
    // a table in an item stays a table (accordion-columns shows data tables in its panels)
    const table = d.querySelector('.accordion-columns.faq table');
    assert.ok(table && table.textContent.includes('Aeroporto'));
  });

  it('a table at the top level is table-striped', () => {
    const html = richText([{ nodeType: 'table', content: [{ nodeType: 'table-body', content: [{ nodeType: 'table-row', content: [{ nodeType: 'table-data', content: [{ nodeType: 'text', value: 'Aeroporto' }] }, { nodeType: 'table-data', content: [{ nodeType: 'text', value: 'Lisboa' }] }] }] }] }], ctx());
    const t = dom(html).querySelector('.table-striped');
    assert.ok(t && t.textContent.includes('Aeroporto') && t.textContent.includes('Lisboa'));
  });

  it('a page over the content bus\'s 1 MB (inspire-se): each category\'s accordions a fragment', () => {
    const faq = nd('perguntas-frequentes');
    const { html, fragments } = convertPage(faq, { ...ctx('https://www.flytap.com/pt-pt/destinos/inspire-se'), fragments: true });
    const d = dom(html);
    // the page: the category headings and a fragment block each, no accordion of its own
    assert.deepEqual([...d.querySelectorAll('h2')].map((h) => h.textContent), ['Antes do voo', 'Durante o voo']);
    assert.deepEqual([...d.querySelectorAll('.fragment a')].map((a) => a.getAttribute('href')), ['/pt-pt/fragments/inspire-se/antes-do-voo', '/pt-pt/fragments/inspire-se/durante-o-voo']);
    assert.ok(!d.querySelector('.accordion-columns'));
    // the fragments: the subcategories' headings and accordions
    assert.equal(fragments.length, 2);
    assert.equal(fragments[0].doc, '/pt-pt/fragments/inspire-se/antes-do-voo');
    const f = dom(fragments[0].html);
    assert.ok(f.querySelector('h3') && f.querySelector('.accordion-columns.faq'));
  });

  it('a category over a fragment\'s limits (900 KB, 180 images): several fragments, -2, -3 …', () => {
    const faq = nd('perguntas-frequentes');
    const limits = { bytes: 1500, images: 180 };
    const { html, fragments } = convertPage(faq, {
      ...ctx('https://www.flytap.com/pt-pt/destinos/inspire-se'), fragments: true, fragmentLimits: limits,
    });
    const links = [...dom(html).querySelectorAll('.fragment a')].map((a) => a.getAttribute('href'));
    assert.ok(links.includes('/pt-pt/fragments/inspire-se/durante-o-voo-2'));
    assert.deepEqual(fragments.map((f) => f.doc), links);
    assert.ok(fragments.every((f) => Buffer.byteLength(f.html) <= limits.bytes + 100));
    // every subcategory once, in order; every item once
    const cats = faq.props.pageProps.page.sections[1].categories;
    const subs = fragments.flatMap((f) => [...dom(f.html).querySelectorAll('h3')].map((h) => h.textContent));
    assert.deepEqual(subs, cats.flatMap((c) => c.subCategories.map((s) => s.label)));
    const items = fragments.flatMap((f) => [...dom(f.html).querySelectorAll('.accordion-columns > div')]).length;
    assert.equal(items, cats.flatMap((c) => c.subCategories.flatMap((s) => s.items)).length);
  });

  it('fares: a heading per route group, its cabins as accordion-columns (tabs) with the fare table in each panel', () => {
    const { html, report } = convertPage(nd('tarifas-tap'), ctx('https://www.flytap.com/pt-pt/reservas/tarifas-tap'));
    const d = dom(html);
    assert.deepEqual([...d.querySelectorAll('h2')].map((h) => h.textContent), ['Voos para Europa e Norte de África', 'Voos intercontinentais']);
    const tabs = d.querySelectorAll('.accordion-columns.tabs');
    assert.equal(tabs.length, 2);
    const first = tabs[0].querySelector(':scope > div');
    assert.equal(first.firstElementChild.textContent, 'Economy');
    const table = first.querySelector('table');
    // the header row: the fares; a row: its title (and note), the fares' values
    assert.deepEqual([...table.querySelectorAll('tr:first-child th')].map((x) => x.textContent), ['', 'Discount', 'Classic', 'Plus']);
    assert.ok(table.querySelector('tr:nth-child(2)').textContent.startsWith('Bagagem de mão'));
    assert.deepEqual(report.generic, []);
  });

  it('a fare table at the top level is table-striped (header)', () => {
    const tabs = nd('tarifas-tap').props.pageProps.page.sections[1];
    const table = tabs.tabs[0].tabsItems[0].sections.find((s) => s.__typename === 'ComponentTableModel');
    const page = { props: { pageProps: { page: { title: 'T', sections: [table] } } } };
    const d = dom(convertPage(page, ctx('https://www.flytap.com/pt-pt/x')).html);
    const t = d.querySelector('.table-striped.header');
    assert.ok(t && t.textContent.includes('Discount'));
  });

  it('the language counterparts (www\'s hrefLangs) we have documents for: Alternate <lang> rows', () => {
    const page = {
      props: {
        pageProps: {
          page: {
            title: 'Central de ajuda',
            sections: [{ __typename: 'ComponentHeadingModel', title: 'Central de ajuda' }],
            hrefLangs: [{ url: '/de-de/hilfe' }, { url: '/en-pt/help' }, { url: '/en-gb/help' }],
          },
        },
      },
    };
    const c = { ...ctx(), scope: new Set([...scope, '/en-pt/help']) };
    const meta = dom(convertPage(page, c).html).querySelector('.metadata');
    const rows = [...meta.querySelectorAll(':scope > div')].map((r) => [...r.children].map((x) => x.textContent));
    assert.deepEqual(rows.filter(([k]) => /^Alternate/.test(k)), [['Alternate en', '/en-pt/help']]);
  });

  it('the registration form page is out of scope (a form): skipped', () => {
    const r = convertPage(nd('registo'), ctx('https://www.flytap.com/pt-pt/registo'));
    assert.ok(r.skipped && /register/.test(r.skipped));
  });
});
