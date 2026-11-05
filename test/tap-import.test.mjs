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
  deliveryMediaDirs,
} from '../tools/importer/tap-import.mjs';
import { cardsOf } from '../tools/importer/tap-click-to-call.mjs';

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

  it('the call-back capture\'s pictures (tap-byside-001: click-to-call.json\'s pictures, no manifest) as /media-da/tap/ copies too', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tap-byside-'));
    const file = 'pictures/bysa1.byside.com/files/B414516D6E/window/29971/bg_c2call_full_2.png';
    fs.mkdirSync(path.join(tmp, path.dirname(file)), { recursive: true });
    fs.writeFileSync(path.join(tmp, file), 'p');
    const url = 'https://bysa1.byside.com/files/B414516D6E/window/29971/bg_c2call_full_2.png';
    fs.writeFileSync(path.join(tmp, 'click-to-call.json'), JSON.stringify({ entries: [], pictures: [{ file, url, width: 533, height: 584 }, { file: '../outside.png', url: 'https://bysa1.byside.com/x.png' }] }));
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'tap-out-'));
    const media = mediaResolver(mediaIndex([tmp]), { out });
    const m = media(url);
    assert.ok(m && /^\/media-da\/tap\/bg-c2call-full-2-[0-9a-f]{8}\.png$/.test(m.eds), JSON.stringify(m));
    assert.equal(fs.readFileSync(path.join(out, m.eds), 'utf8'), 'p');
    assert.equal(media('https://bysa1.byside.com/x.png'), null, 'nothing outside the capture');
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

  it('the destinations map (www\'s widget mapa-destinos): the poi-map block on the language version\'s sheet, a section of its own; the other widgets link www', () => {
    const page = (p) => ({ props: { pageProps: { page: { title: 'X', sections: [{ __typename: 'ComponentHeadingModel', title: 'Destinations' }, { __typename: 'ComponentWidgetFreeBlockModel', _path: p }, { __typename: 'ComponentHeadingModel', title: 'After' }] } } } });
    const map = (lang) => page(`/content/dam/tap/master/${lang}/components/destinos/mapa-destinos-en-us`);
    const at = (url, extra = {}) => ({
      ...ctx(url), lang: undefined, locale: undefined, ...extra,
    });
    const source = (html) => {
      const block = dom(html).querySelector('.poi-map');
      assert.ok(block, 'a poi-map block');
      assert.equal(block.parentElement.children.length, 1, 'alone in its section');
      assert.equal(block.parentElement.parentElement.tagName, 'MAIN');
      return [...block.querySelectorAll(':scope > div')].map((r) => [...r.children].map((c) => c.textContent));
    };
    const en = convertPage(map('en'), at('https://www.flytap.com/en-pt/destinations')).html;
    assert.deepEqual(source(en), [['Source', '/en-pt/destinations/destinations-map.json']]);
    // the grid of the same widget (Smartvel's Explore&Go, parity 84): ema-test's destination-grid
    // on the version's sheet, a section of its own, before the map
    const grid = dom(en).querySelector('.destination-grid');
    assert.ok(grid, 'a destination-grid block');
    assert.deepEqual([...grid.querySelectorAll(':scope > div')].map((r) => [...r.children].map((c) => c.textContent)), [['Source', '/en-pt/destinations/destination-grid.json']]);
    assert.equal(grid.parentElement.children.length, 1, 'alone in its section');
    const blocks = [...dom(en).querySelectorAll('.destination-grid, .poi-map')].map((b) => b.className.split(' ')[0]);
    assert.deepEqual(blocks, ['destination-grid', 'poi-map']);
    assert.ok(!en.includes('See on flytap.com'), 'no link to www in its place');
    assert.deepEqual(source(convertPage(map('pt'), at('https://www.flytap.com/pt-pt/destinos')).html), [['Source', '/pt-pt/destinations/destinations-map.json']], 'the sheets are at /<version>/destinations/ in every version');
    // a market root's document: its language version's sheet
    assert.deepEqual(source(convertPage(map('de'), at('https://www.flytap.com/de-ch/reiseziele', { version: 'de-de' })).html), [['Source', '/de-de/destinations/destinations-map.json']]);
    // the baggage widget (Luggit) as before
    const bag = convertPage(page('/content/dam/tap/master/en/components/informacoes-de-viagem/bagagem/luggit'), at('https://www.flytap.com/en-pt/information/baggage')).html;
    assert.ok(bag.includes('>See on flytap.com</a>') && !bag.includes('poi-map'));
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

  it('pt-br\'s homepage: the box as on the seven, market BR, pt-br\'s texts (its br store and labels), its own airport sheet', () => {
    const labelsAll = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../tools/reports/tap/booking-labels.json'), 'utf8'));
    const labels = labelsAll['pt-br'];
    assert.ok(labels, 'pt-br has labels of its own');
    assert.deepEqual(Object.keys(labels), Object.keys(labelsAll['pt-pt']), 'the same keys as the seven');
    assert.equal(labels['ibe.my-travels'], 'Gerenciar reserva');
    const home = nd('homepage');
    home.props.pageProps.markets = [{ code: 'BR', airport: 'RIO' }];
    // www's pt-br page: a pt-br store without the box's texts, a br store with them
    home.props.pageProps._nextI18Next = {
      initialI18nStore: {
        'pt-br': { common: { other: 'x' } },
        br: {
          common: {
            'ibe.book-flight': 'Reservar voo', 'ibe.to-check-in': 'Check-in', 'ibe.my-travels': 'Gerenciar reserva', 'ibe.flight-status': 'Status do voo',
          },
        },
      },
    };
    const { html } = convertPage(home, {
      ...ctx('https://www.flytap.com/pt-br'), locale: 'pt-br', lang: 'pt', booking: { labels, originName: 'Rio de Janeiro, Brasil' },
    });
    const box = dom(html).querySelector('.booking-box');
    assert.ok(box);
    const rows = Object.fromEntries([...box.querySelectorAll(':scope > div')].map((r) => [r.children[0].textContent, r.children[1]]));
    assert.equal(rows.Market.textContent, 'BR');
    assert.equal(rows.Language.textContent, 'pt');
    assert.equal(rows['Default origin'].textContent, 'RIO');
    assert.equal(rows.Airports.querySelector('a').getAttribute('href'), '/pt-br/booking/airports.json');
    assert.equal(rows.Tabs.textContent, 'Reservar voo, Check-in, Gerenciar reserva, Status do voo', 'www\'s pt-br texts, from its br store');
  });

  it('every root\'s box: the check-in and manage tabs\' texts and the block\'s own, in the root\'s language (booking-spec.md 6)', () => {
    const KEYS = ['ibe.login', 'login-and-make-easier', 'ibe.reservation-details', 'ibe.reservation-number', 'ibe.passenger-lastname', 'ibe.find-reservation', 'validation-invalid', 'same-airports', 'flight-status-text', 'remove-flight', 'previous-month', 'next-month', 'close', 'fewer', 'more', 'new-tab'];
    const all = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../tools/reports/tap/booking-labels.json'), 'utf8'));
    ['pt-pt', 'en-pt', 'es-es', 'fr-fr', 'de-de', 'it-it', 'pl-pl', 'pt-br'].forEach((lv) => KEYS.forEach((k) => assert.ok(String(all[lv][k] || '').trim(), `${lv} ${k}`)));
    assert.equal(all['de-de']['ibe.find-reservation'] !== all['en-pt']['ibe.find-reservation'], true, 'German, not English');
    assert.equal(all['pt-pt'].close, 'Fechar');
    const { html } = convertPage(nd('homepage'), { ...ctx('https://www.flytap.com/pt-pt'), booking: { labels: all['pt-pt'] } });
    const rows = Object.fromEntries([...dom(html).querySelector('.booking-box').querySelectorAll(':scope > div')].map((r) => [r.children[0].textContent, r.children[1].textContent]));
    KEYS.forEach((k) => assert.ok(rows[k], `the row ${k}`));
    assert.equal(rows['ibe.reservation-number'], all['pt-pt']['ibe.reservation-number']);
    // ema-adobe's reading (brief 354): the steppers' fewer / more lead the buttons' names
    // ("Remove one: Adults"), French's departure as the form's "Départ de", German's tab reflexive
    const STEPPER = {
      'en-pt': ['Remove one', 'Add one'],
      'pt-pt': ['Remover um', 'Adicionar um'],
      'pt-br': ['Remover um', 'Adicionar um'],
      'es-es': ['Quitar uno', 'Añadir uno'],
      'fr-fr': ['Retirer un', 'Ajouter un'],
      'de-de': ['Eine Person weniger', 'Eine Person mehr'],
      'it-it': ['Togli uno', 'Aggiungi uno'],
      'pl-pl': ['Usuń', 'Dodaj'],
    };
    Object.entries(STEPPER).forEach(([lv, [fewer, more]]) => assert.deepEqual([all[lv].fewer, all[lv].more], [fewer, more], lv));
    assert.equal(all['fr-fr']['same-airports'], 'Choisissez une destination différente du lieu de départ');
    assert.equal(all['de-de']['new-tab'], 'öffnet sich in einem neuen Tab');
    // a root's homepage from its language version's rows (de-ch: de-de's)
    const de = convertPage(nd('homepage'), {
      ...ctx('https://www.flytap.com/de-ch'), locale: 'de-ch', lang: 'de', booking: { labels: all['de-de'] },
    }).html;
    const deRows = Object.fromEntries([...dom(de).querySelector('.booking-box').querySelectorAll(':scope > div')].map((r) => [r.children[0].textContent, r.children[1].textContent]));
    assert.deepEqual([deRows.fewer, deRows.more, deRows['new-tab']], ['Eine Person weniger', 'Eine Person mehr', 'öffnet sich in einem neuen Tab']);
  });

  it('stopover (parity 42-44): the video under its title as hero-card-overlay, the FAQ card a section info-card, a rich text\'s button centred', () => {
    const MP4 = 'https://publish-p133109-e1368204.adobeaemcloud.com/content/dam/tap/media/global/pages/homepage/video/stopover.mp4';
    const sections = [
      {
        __typename: 'ComponentRichTextBlockModel', richTextContent: { plaintext: 'Mais de 500 ofertas.' }, ctaLabel: 'Reservar agora', ctaUrl: '#special-anchor-book-flight',
      },
      {
        __typename: 'ComponentBannerVideoModel', title: 'Portugal Stopover com a TAP', bannerVideoDescription: { plaintext: 'Veja o vídeo.' }, buttonLabel: 'Assistir ao vídeo', backgroundImage: { _path: '/content/dam/tap/poster.jpg', description: 'Vídeo' }, video: { _path: '/content/dam/tap/media/global/pages/homepage/video/stopover.mp4', _publishUrl: MP4 },
      },
      {
        __typename: 'ComponentCardInfoBlockModel', title: 'Perguntas frequentes', cardInfoBlockDescription: { plaintext: 'Tem dúvidas?' }, primaryCtaLabel: 'Saiba mais', primaryCtaUrl: '/ajuda/perguntas-frequentes#stopover',
      },
    ];
    const page = { props: { pageProps: { page: { title: 'Stopover', sections: [{ __typename: 'ComponentHeadingModel', title: 'Stopover' }, ...sections] } } } };
    const media = (k) => ({ [MP4]: '/media-da/tap/stopover-1.mp4', '/content/dam/tap/poster.jpg': '/media-da/tap/poster-1.jpg' }[k] || null);
    const { html } = convertPage(page, { ...ctx('https://www.flytap.com/pt-pt/stopover'), media });
    const secs = [...dom(html).querySelectorAll('main > div')];
    const style = (s) => { const m = s.querySelector('.section-metadata'); return m ? m.textContent.replace(/\s+/g, ' ').trim() : ''; };
    // the rich text's button: a section of its own, style centred-button, the text stays before it
    const button = secs.find((s) => /centred-button/.test(style(s)));
    assert.ok(button && button.querySelector('a[href="/pt-pt#book-flight"]'));
    assert.ok(!button.textContent.includes('Mais de 500 ofertas'));
    assert.ok(secs[secs.indexOf(button) - 1].textContent.includes('Mais de 500 ofertas'));
    // the video: hero-card-overlay, the poster, the title and text, the local mp4 (no AEM host)
    const hero = dom(html).querySelector('.hero-card-overlay');
    assert.ok(hero, 'hero-card-overlay');
    assert.ok(hero.querySelector('img[src="/media-da/tap/poster-1.jpg"]'));
    assert.equal(hero.querySelector('h3').textContent, 'Portugal Stopover com a TAP', 'an H3, as www (14 of 14)');
    assert.equal(hero.querySelector('a[href$=".mp4"]').getAttribute('href'), '/media-da/tap/stopover-1.mp4');
    assert.ok(!html.includes('adobeaemcloud.com'));
    assert.ok(!dom(html).querySelector('.columns-media'));
    // the FAQ card: a section info-card with its title (bold text, no heading: www's is a span),
    // text and button
    const card = secs.find((s) => /info-card/.test(style(s)));
    assert.ok(card && card.querySelector('a[href="/pt-pt/ajuda/perguntas-frequentes#stopover"]'));
    assert.equal(card.querySelector('p > strong').textContent, 'Perguntas frequentes');
    assert.ok(!card.querySelector('h1, h2, h3, h4'), 'no heading in the card');
    // without a local copy of the video: the poster and texts, no link to TAP's AEM host
    const none = convertPage(page, { ...ctx('https://www.flytap.com/pt-pt/stopover'), media: (k) => (k === '/content/dam/tap/poster.jpg' ? '/media-da/tap/poster-1.jpg' : null) });
    assert.ok(!none.html.includes('adobeaemcloud.com'));
    assert.ok(dom(none.html).querySelector('.hero-card-overlay'));
  });

  it('a banner\'s phone picture (www\'s imageMobile, below 728 px; parity 94): the picture cell\'s second picture once the blocks show it (site.phonePictures), else the desktop one only', () => {
    const desk = ['/media-da', 'tap', 'fest-1920x450-1.jpg'].join('/');
    const phone = ['/media-da', 'tap', 'fest-1280x630-2.jpg'].join('/');
    const media = (k) => ({ '/content/dam/tap/fest-1920x450.jpg': desk, '/content/dam/tap/fest-1280x630.jpg': phone }[k] || null);
    const hero = (extra = {}) => ({
      props: {
        pageProps: {
          page: {
            title: 'Festival', slider: extra.slider,
            sections: [{
              __typename: 'ComponentHeroCardModel', title: 'Festival de cinema a bordo', heroCardDescription: { plaintext: 'Já.' }, image: { _path: '/content/dam/tap/fest-1920x450.jpg' }, imageMobile: { _path: '/content/dam/tap/fest-1280x630.jpg' },
            }, { __typename: 'ComponentHeadingModel', title: 'Festival' }],
          },
        },
      },
    });
    const cell = (html) => dom(html).querySelector('.hero-campaign > div > div');
    const at = { ...ctx('https://www.flytap.com/pt-pt/a-bordo/altitude-film-festival'), media };
    // off (the blocks don't show a second picture yet): the desktop picture only, as before
    assert.deepEqual([...cell(convertPage(hero(), at).html).querySelectorAll('img')].map((i) => i.getAttribute('src')), [desk]);
    // on: the desktop picture, then the phone one
    assert.deepEqual([...cell(convertPage(hero(), { ...at, phonePictures: true }).html).querySelectorAll('img')].map((i) => i.getAttribute('src')), [desk, phone]);
    // the same phone picture as the desktop one: one picture
    const same = hero(); same.props.pageProps.page.sections[0].imageMobile = { _path: '/content/dam/tap/fest-1920x450.jpg' };
    assert.equal(cell(convertPage(same, { ...at, phonePictures: true }).html).querySelectorAll('img').length, 1);
    // a stage's slide alike
    const slider = { __typename: 'ComponentSliderHomepageModel', slides: [{ __typename: 'BannerSlideModel', title: 'Islândia', image: { _path: '/content/dam/tap/fest-1920x450.jpg' }, imageMobile: { _path: '/content/dam/tap/fest-1280x630.jpg' } }] };
    const s = dom(convertPage(hero({ slider }), { ...at, phonePictures: true }).html).querySelector('.hero-campaign');
    assert.deepEqual([...s.querySelector(':scope > div > div').querySelectorAll('img')].map((i) => i.getAttribute('src')), [desk, phone]);
  });

  it('a stage\'s destination slide (pl-pl\'s Fortaleza): the destination\'s name and picture, www\'s "book now" to the root\'s booking box, no fare (live fares stay on TAP)', () => {
    const fortaleza = ['/media-da', 'tap', 'fortaleza-1.jpg'].join('/');
    const slider = {
      __typename: 'ComponentSliderHomepageModel',
      slides: [{
        __typename: 'DestinationSlideModel', title: null, flightType: 'round-trip',
        destination: { title: 'Fortaleza', airports: ['FOR'], lowestPrice: null, image: { _path: '/content/dam/tap/media/global/destinations/fortaleza.jpeg' } },
      }],
    };
    const store = { pl: { common: { 'book-now': 'Rezerwuj teraz', 'flight-price': 'Loty z' } } };
    const page = { props: { pageProps: { _nextI18Next: { initialI18nStore: store }, page: { title: 'TAP', slider, sections: [] } } } };
    const at = { ...ctx('https://www.flytap.com/pl-pl'), lang: 'pl', locale: 'pl-pl', media: (k) => (/fortaleza/.test(String(k)) ? fortaleza : null) };
    const s = dom(convertPage(page, at).html).querySelector('.hero-campaign');
    assert.ok(s, 'the stage');
    assert.equal(s.querySelector('img').getAttribute('src'), fortaleza);
    assert.equal(s.querySelector('h2').textContent, 'Fortaleza');
    const a = s.querySelector('a');
    assert.equal(a.textContent, 'Rezerwuj teraz');
    assert.equal(a.getAttribute('href'), '/pl-pl#book-flight');
    assert.ok(!/Loty z|zł/.test(s.textContent), 'no fare');
    // a destination slide whose picture we have no copy of (a root's Washington): left out, as before
    const none = { ...at, media: () => null };
    const two = structuredClone(page);
    two.props.pageProps.page.slider.slides.push({ __typename: 'BannerSlideModel', title: 'Islândia', image: { _path: '/content/dam/tap/x.jpg' } });
    const stage = dom(convertPage(two, { ...none, media: (k) => (/x\.jpg/.test(String(k)) ? fortaleza : null) }).html).querySelector('.hero-campaign');
    assert.deepEqual([...stage.querySelectorAll('h2')].map((h) => h.textContent), ['Islândia'], 'only the slide with its picture');
  });

  it('as www renders them: a hero card\'s title an H3; rich text\'s sub- and superscript plain text', () => {
    const hero = { props: { pageProps: { page: { title: 'Extras', sections: [{ __typename: 'ComponentHeroCardModel', title: 'Adquira com antecedência e poupe', image: { _path: '/content/dam/tap/x.jpg' }, heroCardDescription: { plaintext: 'Já.' } }, { __typename: 'ComponentHeadingModel', title: 'Extras e Upgrades' }] } } } };
    const picture = ['/media-da', 'tap', 'x-1.jpg'].join('/');
    const h = dom(convertPage(hero, { ...ctx('https://www.flytap.com/pt-pt/gerir-reserva/extras'), media: () => picture }).html);
    assert.equal(h.querySelector('.hero-campaign h3').textContent, 'Adquira com antecedência e poupe', 'an H3, as www (43 of 43)');
    assert.equal(h.querySelector('h1').textContent, 'Extras e Upgrades');
    // a feature card's title an H3 too (www 330 of 331; the theme's H3 style, parity 60)
    const feature = { props: { pageProps: { page: { title: 'Inspire-se', sections: [{ __typename: 'ComponentHeadingModel', title: 'Inspire-se' }, { __typename: 'ComponentFeatureCardModel', title: 'Reiquiavique: descubra a nova rota TAP', featureCardDescription: { plaintext: 'Voe.' }, image: { _path: '/content/dam/tap/x.jpg' } }] } } } };
    const f = dom(convertPage(feature, { ...ctx('https://www.flytap.com/pt-pt/destinos/inspire-se'), media: () => picture }).html);
    assert.equal(f.querySelector('.columns-media h3').textContent, 'Reiquiavique: descubra a nova rota TAP');
    assert.ok(!f.querySelector('.columns-media h2'));
    const t = (value, ...v) => ({ nodeType: 'text', value, format: { variants: v } });
    const rich = [{ nodeType: 'paragraph', content: [t('Para extras de bagagem ', 'subscript'), t('TAP', 'superscript', 'bold'), t(' e mais.')] }];
    const r = convertPage({ props: { pageProps: { page: { title: 'X', sections: [{ __typename: 'ComponentHeadingModel', title: 'X' }, { __typename: 'ComponentRichTextBlockModel', richTextContent: { json: rich } }] } } } }, ctx()).html;
    assert.ok(!/<su[bp]>/.test(r), 'no <sub>, no <sup> (www: none in the 265 pages with the marks)');
    assert.ok(r.includes('Para extras de bagagem <strong>TAP</strong> e mais.'));
  });

  it('headings as www shows them (live-audit 154-171): a card list\'s title not shown, the page\'s only H2 its H1 when it is the title', () => {
    const steps = {
      __typename: 'ComponentGenericCardListModel', title: 'To pre-choose your meal, follow the steps below.', items: [{ __typename: 'GenericCard1Model', title: '1 - Enter your booking details' }],
    };
    const meals = { props: { pageProps: { page: { title: 'Meals in Economy Prime', sections: [{ __typename: 'ComponentHeadingModel', title: 'Meals in Economy Prime' }, { __typename: 'ComponentHeadingSectionModel', title: 'Pre-select your meal' }, steps] } } } };
    const m = convertPage(meals, { ...ctx('https://www.flytap.com/en-pt/on-board/meals/economy-prime'), lang: 'en', locale: 'en-pt' }).html;
    assert.ok(!m.includes('To pre-choose your meal'), 'www renders no card list title');
    assert.ok(m.includes('1 - Enter your booking details'));
    // no H1 on www, the first heading the page's title: that heading is the H1, not a second copy
    const only = (first) => ({ props: { pageProps: { page: { title: 'Travel Pass Optiontown (Flight Pass)', sections: [{ __typename: 'ComponentHeadingSectionModel', title: first }, { __typename: 'ComponentHeadingSectionModel', title: 'Jak to działa' }] } } } });
    const h = (html) => [...dom(html).querySelectorAll('h1, h2')].map((x) => `${x.tagName} ${x.textContent}`);
    const pl = { ...ctx('https://www.flytap.com/pl-pl/informacje-prawne/flight-passes'), lang: 'pl', locale: 'pl-pl' };
    assert.deepEqual(h(convertPage(only('Travel Pass Optiontown (Flight Pass)'), pl).html), ['H1 Travel Pass Optiontown (Flight Pass)', 'H2 Jak to działa']);
    // another first heading: the title as H1 before it, as before
    assert.deepEqual(h(convertPage(only('Inny tytuł'), pl).html), ['H1 Travel Pass Optiontown (Flight Pass)', 'H2 Inny tytuł', 'H2 Jak to działa']);
  });

  it('text that reads as an icon token (the cookie table\'s inside:eu:IN-1000585) keeps its name, no icon', () => {
    const t = (value) => ({ nodeType: 'text', value });
    const cell = (value) => ({ nodeType: 'table-data', content: [{ nodeType: 'paragraph', content: [t(value)] }] });
    const json = [{ nodeType: 'table', content: [{ nodeType: 'table-row', content: [cell('eu-live.inside-graph.com'), cell('inside:eu:IN-1000585, inside-eu')] }] }];
    const page = (j) => ({ props: { pageProps: { page: { title: 'Cookies', sections: [{ __typename: 'ComponentHeadingModel', title: 'Cookies' }, { __typename: 'ComponentRichTextBlockModel', richTextContent: { json: j } }] } } } });
    const { html } = convertPage(page(json), { ...ctx('https://www.flytap.com/pt-pt/info-legal/cookies') });
    const name = [...dom(html).querySelectorAll('div, td')].filter((x) => !x.children.length || [...x.children].every((y) => y.tagName === 'P')).find((x) => x.textContent.includes('IN-1000585'));
    assert.ok(name, 'the cookie name in the table');
    assert.equal(name.textContent.replace(/\u2060/g, '').trim(), 'inside:eu:IN-1000585, inside-eu', 'the name as it is to read');
    assert.ok(!/:[#a-z_-]+[a-z\d]*:/i.test(name.textContent), 'no :name: the page decoration turns into an icon');
    // a link's address untouched, its text kept from being read as one too
    const link = [{ nodeType: 'paragraph', content: [{ nodeType: 'link', data: { href: 'https://example.com/a:b:c' }, content: [t('urn:x:y')] }] }];
    const l = convertPage(page(link), ctx()).html;
    assert.ok(l.includes('href="https://example.com/a:b:c"'));
    assert.ok(!/>[^<]*:[#a-z_-]+[a-z\d]*:[^<]*</i.test(l));
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

  it('Miles&Go on the homepage: columns-media (stack), all four cards www shows a visitor (lower-home.md), one row each', () => {
    const home = nd('homepage');
    const list = home.props.pageProps.page.sections.find((x) => x.__typename === 'ComponentMiles_GoCardListModel');
    const [first] = list.milesAndGoCards;
    list.milesAndGoCards.push(
      {
        ...first, type: '4', title: 'Descontos em hotéis', subtitle: 'A estadia perfeita', primaryCtaLabel: 'Descobrir hotéis', primaryCtaUrl: '/miles-and-go/parceiros#hotel',
      },
      {
        ...first, type: '3', title: 'Cartões de Crédito TAP Miles&Go', subtitle: 'Ganhe milhas', primaryCtaLabel: 'Saiba mais', primaryCtaUrl: '/miles-and-go/acumular-milhas/cartoes-de-credito', secondaryCtaLabel: 'Consulte aqui', secondaryCtaUrl: 'https://www.bportugal.pt/intermediariocreditofar/x', extrainfo: { plaintext: 'Com o Cartão TAP FLY+ …' },
      },
    );
    const media = (k) => (String(k).includes('logo') ? '/media-da/tap/logo-miles-go-1.png' : MEDIA[k] || '/media-da/tap/photo-1.jpg');
    const { html } = convertPage(home, { ...ctx('https://www.flytap.com/pt-pt'), media });
    const cm = dom(html).querySelector('.columns-media');
    assert.equal(cm.className, 'columns-media stack');
    const rows = [...cm.querySelectorAll(':scope > div')];
    assert.deepEqual(rows.map((r) => r.querySelector('h2').textContent), ['TAP Miles&Go', 'Club TAP Miles&Go', 'Descontos em hotéis', 'Cartões de Crédito TAP Miles&Go'], 'www\'s order, not members only');
    rows.forEach((r) => {
      const [text, photo] = r.children;
      // the text cell: the logo picture, the h2 title, the second line an h2 too (as www,
      // parity 85)
      assert.ok(text.firstElementChild.tagName === 'P' && text.firstElementChild.querySelector('img'), 'the logo first');
      assert.equal(text.children[1].tagName, 'H2');
      assert.equal(text.children[2].tagName, 'H2', 'the second line an H2');
      assert.ok(photo.querySelector('img'), 'the photo next to it');
    });
    // the first card's button bold italic, the others' italic; "See here" a plain link
    assert.ok(rows[0].querySelector('p > em > strong > a'));
    rows.slice(1).forEach((r) => { assert.ok(r.querySelector('p > em > a')); assert.ok(!r.querySelector('strong > a')); });
    const seeHere = [...rows[3].querySelectorAll('a')].find((a) => a.textContent === 'Consulte aqui');
    assert.equal(seeHere.parentElement.tagName, 'P', 'a plain link');
    assert.ok(!rows[3].textContent.includes('TAP FLY+'), 'www shows no extrainfo');
  });

  it('the homepage\'s H1 www\'s: the card list\'s title ("Planeie a sua viagem ao detalhe"), no hidden "TAP Air Portugal" (parity 85)', () => {
    const home = nd('homepage');
    home.props.pageProps.page.slider = { __typename: 'ComponentSliderHomepageModel', slides: [{ __typename: 'BannerSlideModel', title: 'Islândia', image: { _path: '/content/dam/tap/x.jpg' } }] };
    const d = dom(convertPage(home, ctx('https://www.flytap.com/pt-pt')).html);
    assert.deepEqual([...d.querySelectorAll('h1')].map((h) => h.textContent), ['Planeie a sua viagem ao detalhe']);
    assert.ok(!d.body.innerHTML.includes('hidden-heading'));
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

describe('tap-import aem.flytap.com pictures', () => {
  it('a rich text picture whose name has spaces or accents is found in the archive (two slashes, percent-encoded there)', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tap-aem-'));
    const rel = 'aem.flytap.com/content/dam/tap/x/AdegaMãe Exterior.png';
    fs.mkdirSync(path.join(tmp, path.dirname(rel)), { recursive: true });
    fs.writeFileSync(path.join(tmp, rel), 'x');
    fs.writeFileSync(path.join(tmp, 'manifest.json'), JSON.stringify([{
      path: rel, url: 'https://aem.flytap.com//content/dam/tap/x/AdegaM%C3%A3e%20Exterior.png', bytes: 1, contentType: 'image/png',
    }]));
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'tap-out-'));
    const media = mediaResolver(mediaIndex([tmp]), { out });
    const missing = new Set();
    // the rich text names it with one slash, unencoded (and the accent decomposed, as some do)
    const html = richText([{ nodeType: 'paragraph', content: [{ nodeType: 'reference', data: { path: '/content/dam/tap/x/AdegaMãe Exterior.png', mimetype: 'image/png' } }] }], { ...ctx(), media, missing });
    assert.match(html, /<img src="\/media-da\/tap\/[^"]+\.png"/);
    assert.equal(missing.size, 0);
  });
});

describe('tap-import alerts page and extra link strip', () => {
  const sectionsOf = (html) => [...dom(html).querySelectorAll('main > div')];

  it('the alerts page: the message-center block (irreg, tech-outage) in place of the static alerts, the page\'s other content kept', () => {
    const page = {
      props: {
        pageProps: {
          page: {
            template: 'alerts',
            title: 'Alertas e informações',
            sections: [{ __typename: 'ComponentHeadingModel', title: 'Alertas e informações' }],
            dynamicData: { alertList: { items: [{ title: 'Manutenção de sistemas', weight: 1, content: [{ nodeType: 'paragraph', content: [{ nodeType: 'text', value: 'Texto' }] }] }] } },
          },
        },
      },
    };
    const { html } = convertPage(page, { ...ctx('https://www.flytap.com/pt-pt/alertas-e-informacoes') });
    const d = dom(html);
    assert.equal(d.querySelector('h1').textContent, 'Alertas e informações');
    const mc = d.querySelector('.message-center');
    assert.ok(mc, 'message-center block');
    assert.deepEqual([...mc.querySelectorAll(':scope > div')].map((r) => [...r.children].map((x) => x.textContent)), [['Types', 'irreg, tech-outage']]);
    assert.ok(!d.querySelector('.accordion-columns'), 'no static accordion');
    assert.ok(!html.includes('Manutenção de sistemas'));
  });

  it('the alerts page without alerts in the capture: still the message-center block', () => {
    const page = { props: { pageProps: { page: { template: 'alerts', title: 'Alerts and information', sections: [] } } } };
    const d = dom(convertPage(page, { ...ctx('https://www.flytap.com/en-pt/alerts-and-informations'), lang: 'en', locale: 'en-pt' }).html);
    assert.ok(d.querySelector('.message-center'));
  });

  it('the homepage\'s extra link strip (extraAlert): a first section of style extra-alert, a columns block of the link and its pill', () => {
    const home = nd('homepage');
    home.props.pageProps.extraAlert = [{
      __typename: 'ComponentExtraAlertModel', messageCta: 'Intermediação de Crédito', messageCtaUrl: '/miles-and-go/acumular-milhas/cartoes-de-credito', extraAlertCtaLabel: 'Saiba mais', extraAlertCtaUrl: '/miles-and-go/acumular-milhas/cartoes-de-credito',
    }];
    const c = { ...ctx('https://www.flytap.com/pt-pt'), scope: new Set([...scope, '/pt-pt/miles-and-go/acumular-milhas/cartoes-de-credito']) };
    const s = sectionsOf(convertPage(home, c).html);
    assert.match(s[0].querySelector('.section-metadata').textContent, /extra-alert/);
    const cells = [...s[0].querySelectorAll('.columns > div > div')];
    assert.equal(cells.length, 2);
    assert.equal(cells[0].querySelector('a').getAttribute('href'), '/pt-pt/miles-and-go/acumular-milhas/cartoes-de-credito');
    assert.equal(cells[0].querySelector('a').textContent, 'Intermediação de Crédito');
    assert.ok(!cells[0].querySelector('strong, em'), 'the message a plain link');
    assert.equal(cells[1].querySelector('em > a').textContent, 'Saiba mais');
    // then the stage (no hidden H1: www's H1 is the card list's title, parity 85)
    assert.ok(s[1].querySelector('.hero-campaign') && !s[1].querySelector('h1'));
  });

  it('no extra strip without extraAlert, nor on other pages', () => {
    const home = nd('homepage');
    delete home.props.pageProps.extraAlert;
    assert.ok(!convertPage(home, ctx('https://www.flytap.com/pt-pt')).html.includes('extra-alert'));
    const help = nd('ajuda');
    help.props.pageProps.extraAlert = [{ messageCta: 'Intermediação de Crédito', messageCtaUrl: '/x' }];
    assert.ok(!convertPage(help, ctx()).html.includes('extra-alert'));
  });
});

describe('tap-import media archives from the deliveries index', () => {
  it('every tap-media archive the index lists, in its order; the ones not unpacked named', () => {
    const top = fs.mkdtempSync(path.join(os.tmpdir(), 'tap-arch-'));
    ['tap-media-001', 'tap-media-014', 'tap-media-019'].forEach((n) => fs.mkdirSync(path.join(top, n, 'x'), { recursive: true }));
    const index = path.join(top, 'tap-deliveries.json');
    fs.writeFileSync(index, JSON.stringify([
      { file: 'tap-snapshots-001.tar.gz', kind: 'pages' },
      { file: 'tap-media-001.tar.gz', kind: 'media' },
      { file: 'tap-media-014.tar.gz', kind: 'media', segment: 'aem-dam' },
      { file: 'tap-sitemaps-001.tar.gz', kind: 'media', segment: 'market-sitemaps' },
      { file: 'tap-media-018.tar.gz', kind: 'media', segment: 'market-images' },
      { file: 'tap-media-019.tar.gz', kind: 'media', segment: 'missing-pictures' },
    ]));
    const { dirs, missing } = deliveryMediaDirs(index, top);
    assert.deepEqual(dirs, ['tap-media-001', 'tap-media-014', 'tap-media-019'].map((n) => path.join(top, n, 'x')));
    assert.deepEqual(missing, ['tap-media-018']);
  });

  it('a picture by the URL the missing list named it (listedAs)', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tap-listed-'));
    const rel = 'pic.flytap.com/a/boarding.jpg';
    fs.mkdirSync(path.join(tmp, path.dirname(rel)), { recursive: true });
    fs.writeFileSync(path.join(tmp, rel), 'x');
    fs.writeFileSync(path.join(tmp, 'manifest.json'), JSON.stringify([{
      path: rel, url: 'https://pic.flytap.com/a/boarding.jpg?preferwebp=true&width=2560', listedAs: 'https://pic.flytap.com/a/boarding.jpg?preferwebp=true', contentType: 'image/jpeg',
    }]));
    const media = mediaResolver(mediaIndex([tmp]), { out: fs.mkdtempSync(path.join(os.tmpdir(), 'tap-out-')) });
    assert.match(media('https://pic.flytap.com/a/boarding.jpg?preferwebp=true').eds, /^\/media-da\/tap\/boarding-/);
  });
});

describe('tap-import language counterparts per root', () => {
  it('Alternate <ll-cc> for every root; Alternate <lang> only for the root the language switch has for that language', () => {
    const page = {
      props: {
        pageProps: {
          page: {
            title: 'Ajuda', sections: [{ __typename: 'ComponentHeadingModel', title: 'Ajuda' }], hrefLangs: [{ url: '/pt-br/ajuda' }, { url: '/en-pt/help' }, { url: '/en-br/help' }],
          },
        },
      },
    };
    const c = { ...ctx(), scope: new Set([...scope, '/pt-br/ajuda', '/en-pt/help']) };
    const meta = dom(convertPage(page, c).html).querySelector('.metadata');
    const rows = [...meta.querySelectorAll(':scope > div')].map((r) => [...r.children].map((x) => x.textContent)).filter(([k]) => /^Alternate/.test(k));
    assert.deepEqual(rows, [['Alternate pt-br', '/pt-br/ajuda'], ['Alternate en', '/en-pt/help'], ['Alternate en-pt', '/en-pt/help']]);
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

  it('the help centre\'s contacts (parity 40, 54): the hotline-finder on the version\'s sheet and www\'s picture, under the Contacts heading', () => {
    const picture = ['/media-da', 'tap', 'help-contact-center-tap-1.jpg'].join('/');
    const media = (k) => (/help[-_]contact[-_]center[-_]tap/.test(String(k)) ? picture : MEDIA[k] || null);
    const rowsOf = (html) => {
      const b = dom(html).querySelector('.hotline-finder');
      assert.ok(b, 'a hotline-finder block');
      return [b, Object.fromEntries([...b.querySelectorAll(':scope > div')].map((r) => [r.children[0].textContent, r.children[1]]))];
    };
    const { html } = convertPage(nd('ajuda'), { ...ctx(), media });
    const [block, rows] = rowsOf(html);
    assert.equal(rows.Sheet.textContent, '/pt-pt/help/contacts.json');
    assert.equal(rows.Image.querySelector('img').getAttribute('src'), picture);
    assert.equal(rows.Image.querySelector('img').getAttribute('alt'), '', 'www\'s alt: empty');
    assert.ok(!/flytap\.com<\/a>/.test(block.parentElement.innerHTML), 'no "Ver em flytap.com" in its place');
    // under the Contacts heading
    const heads = [...block.parentElement.querySelectorAll('h2')].map((h) => h.textContent);
    assert.ok(heads.some((h) => /Contactos/i.test(h)), heads.join(', '));
    // a market root's help page: its language version's sheet (the block picks the market)
    const [, root] = rowsOf(convertPage(nd('ajuda'), {
      ...ctx('https://www.flytap.com/pt-ch/ajuda'), locale: 'pt-ch', version: 'pt-pt', media,
    }).html);
    assert.equal(root.Sheet.textContent, '/pt-pt/help/contacts.json');
  });

  it('the help centre: H1 from the heading, cards, an accordion, links to the FAQ anchors', () => {
    const { html, report } = convertPage(nd('ajuda'), ctx());
    const d = dom(html);
    assert.equal(d.querySelector('h1').textContent, 'Central de ajuda');
    assert.equal(d.querySelectorAll('h1').length, 1);
    const faq = d.querySelector('.accordion-columns.faq');
    assert.ok(faq && faq.textContent.includes('Que reservas podem ser alteradas online?'));
    assert.ok(d.querySelector('a[href="/pt-pt/ajuda/perguntas-frequentes#antes-do-voo"]'));
    // the contacts by country: the hotline-finder now, no link to www (parity 40, 54)
    assert.ok(!report.linkedOut.some((x) => /ContactsByCountry/.test(x)));
    assert.ok(d.querySelector('.hotline-finder'));
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
    // the info box: ema-test's info-alert block (parity 63), one cell: its H4 (www's, 130 of 130)
    // and its text, in a section of its own; no lh-com highlight section
    const box = d.querySelector('.info-alert');
    assert.ok(box, 'an info-alert block');
    assert.equal(box.querySelectorAll(':scope > div').length, 1);
    assert.equal(box.querySelectorAll(':scope > div > div').length, 1, 'one cell');
    assert.equal(box.querySelector('h4').textContent.trim().toLowerCase(), 'informação importante');
    assert.ok(box.querySelector('li, p'), 'its text');
    assert.ok(!box.querySelector('h2, h3'));
    assert.ok(![...d.querySelectorAll('.section-metadata')].some((m) => /highlight/.test(m.textContent)));
    assert.equal(box.parentElement.children.length, 1, 'a section of its own');
    assert.ok(!box.classList.contains('static'), 'www\'s dismissable: a close button');
    // an alert www shows without its close button (dismissable false, 30 of 152): the option static
    const fixed = { props: { pageProps: { page: { title: 'Seguros', sections: [{ __typename: 'ComponentHeadingModel', title: 'Seguros' }, { __typename: 'ComponentInfoBlockModel', title: 'Informação importante', dismissable: false, message: { plaintext: 'Leia as condições.' } }] } } } };
    assert.ok(dom(convertPage(fixed, ctx('https://www.flytap.com/pt-pt/reservas/seguros')).html).querySelector('.info-alert.static'));
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

  it('fares (parity 99): ema-adobe\'s fare-comparison, a Group a route group, a Cabin a tab, its fares and services, its Caption and Notes (blocks/fare-comparison/README.md)', () => {
    const page = nd('tarifas-tap');
    page.props.pageProps._nextI18Next = { initialI18nStore: { pt: { common: { caption: 'Legenda', 'service-included': 'Serviço incluído', 'service-not-included': 'Serviço não incluído', notes: 'Notas' } } } };
    const { html, report } = convertPage(page, ctx('https://www.flytap.com/pt-pt/reservas/tarifas-tap'));
    const d = dom(html);
    const b = d.querySelector('.fare-comparison');
    assert.ok(b, 'a fare-comparison block');
    assert.ok(!d.querySelector('.accordion-columns.tabs, .table-striped'), 'no tabs or tables of their own');
    assert.ok(![...d.querySelectorAll('h2')].some((h) => /Voos para Europa|Voos intercontinentais|^Legenda$|^Notas$/.test(h.textContent)), 'the route groups\' H2s and the legend\'s come from the block');
    const rows = [...b.querySelectorAll(':scope > div')].map((r) => [...r.children]);
    const keys = rows.map((r) => r[0].textContent.trim());
    assert.deepEqual(keys.slice(0, 4), ['Caption label', 'Notes label', 'Group', 'Cabin']);
    assert.equal(rows[0][1].textContent, 'Legenda');
    assert.equal(rows[1][1].textContent, 'Notas');
    assert.deepEqual(rows.filter((r) => r[0].textContent === 'Group').map((r) => r[1].textContent), ['Voos para Europa e Norte de África', 'Voos intercontinentais']);
    assert.deepEqual(rows.filter((r) => r[0].textContent === 'Cabin').map((r) => r[1].textContent), ['Economy', 'Business', 'Economy', 'Economy Prime']);
    // after a Cabin its header row: the first cell empty, the fares
    const head = rows[keys.indexOf('Cabin') + 1];
    assert.deepEqual(head.map((c) => c.textContent), ['', 'Discount', 'Classic', 'Plus']);
    // a service row: its name with the note in italics, the fares' values (✓ / ✕, a value's note)
    const hand = rows.find((r) => r[0].textContent.startsWith('Bagagem de mão'));
    assert.ok(hand[0].querySelector('br + em'), 'the note in italics after a line break');
    assert.ok(rows.some((r) => r.slice(1).some((c) => c.textContent.startsWith('✓'))));
    // each cabin's Caption (www's legend) and Notes
    const caption = rows.find((r) => r[0].textContent === 'Caption');
    assert.deepEqual([...caption[1].querySelectorAll('li')].map((li) => li.textContent), ['✓ Serviço incluído', '✕ Serviço não incluído']);
    assert.ok(rows.find((r) => r[0].textContent === 'Notes')[1].querySelector('p'));
    assert.equal(keys.filter((k) => k === 'Caption').length, 4, 'a Caption a cabin');
    assert.ok(!/\[(yes|no)\]/.test(html));
    assert.deepEqual(report.generic, []);
  });

  it('a fare table\'s cells as www shows them (parity 95): [yes] ✓, [no] ✕, "value|note" the value and its note; www\'s legend and notes after it', () => {
    const tabs = nd('tarifas-tap').props.pageProps.page.sections[1];
    const table = structuredClone(tabs.tabs[0].tabsItems[0].sections.find((s) => s.__typename === 'ComponentTableModel'));
    table.columns[0].items.push('[no]');
    table.rowTitles = [...(table.rowTitles || []), 'Bagagem prioritária'];
    const store = { pt: { common: { caption: 'Legenda', 'service-included': 'Serviço incluído', 'service-not-included': 'Serviço não incluído', notes: 'Notas' } } };
    const page = { props: { pageProps: { _nextI18Next: { initialI18nStore: store }, page: { title: 'T', sections: [{ __typename: 'ComponentHeadingModel', title: 'T' }, { ...table, tableComplementaryNotes: { plaintext: 'As tarifas aqui apresentadas podem não estar disponíveis em todos os voos TAP.' } }] } } } };
    const html = convertPage(page, ctx('https://www.flytap.com/pt-pt/reservas/tarifas-tap')).html;
    assert.ok(!/\[(yes|no)\]/.test(html), 'no raw [yes] / [no]');
    assert.ok(!/50 lbs\|/.test(html), 'no raw "value|note"');
    const d = dom(html);
    const cells = [...d.querySelectorAll('.table-striped > div > div')].map((c) => c.textContent);
    assert.ok(cells.some((c) => c.startsWith('✓')) && cells.includes('✕'));
    const noted = [...d.querySelectorAll('.table-striped > div > div')].find((c) => c.querySelector('em') && c.textContent.startsWith('1 x 23 kg / 50 lbs'));
    assert.ok(noted && /^Em voos entre Portugal/.test(noted.querySelector('em').textContent), 'the note under its value');
    // www's legend and notes: H2s with its texts
    const after = [...d.querySelectorAll('h2')].map((h) => h.textContent);
    assert.deepEqual(after.filter((t) => /Legenda|Notas/.test(t)), ['Legenda', 'Notas']);
    assert.ok(d.body.textContent.includes('✓ Serviço incluído') && d.body.textContent.includes('✕ Serviço não incluído'));
  });

  it('a table column\'s description (the Club\'s price) and tooltip under its heading, as www (parity 96)', () => {
    const col = (heading, price, tooltip) => ({
      __typename: 'TableColumnModel', heading, tableColumnDescription: { plaintext: price }, tooltip, items: ['2.000', '[yes]'], ctaLabel: 'Aderir', ctaUrl: '/minha-conta/gestao-milhas/club',
    });
    const table = { __typename: 'ComponentTableModel', rowTitles: ['Milhas Bónus imediatas na adesão', 'Embarque Premium'], columns: [col('Club Basic', '109 EUR / ano'), col('Club Platinum+', '1 189 EUR / ano', 'Oferta limitada')] };
    const page = { props: { pageProps: { page: { title: 'Club', sections: [{ __typename: 'ComponentHeadingModel', title: 'Club' }, table] } } } };
    const d = dom(convertPage(page, ctx('https://www.flytap.com/pt-pt/miles-and-go/club')).html);
    const head = [...d.querySelector('.table-striped > div').children].map((c) => c.innerHTML);
    assert.deepEqual(head, ['', 'Club Basic<br>109 EUR / ano', 'Club Platinum+<br>1 189 EUR / ano<br><em>Oferta limitada</em>']);
  });

  it('a card\'s description without its sub- and superscript text, as www (parity 97: cards 126 of 126; rich text keeps it)', () => {
    const t = (value, ...v) => ({ nodeType: 'text', value, format: { variants: v } });
    const desc = { json: [{ nodeType: 'paragraph', content: [t('Envie mensagens com emojis incluídos '), t('(1)', 'subscript'), t('.')] }] };
    const page = {
      props: {
        pageProps: {
          page: {
            title: 'Wi-Fi',
            sections: [{ __typename: 'ComponentHeadingModel', title: 'Wi-Fi' },
              { __typename: 'ComponentGenericCardListModel', items: [{ __typename: 'GenericCard1Model', title: 'Free messaging', genericCard1Description: desc }] },
              { __typename: 'ComponentFeatureCardModel', title: 'Bagagem', featureCardDescription: { json: [{ nodeType: 'paragraph', content: [t('Compre online '), t('(1)', 'superscript'), t(', e poupe.')] }] } },
              { __typename: 'ComponentRichTextBlockModel', richTextContent: { json: [{ nodeType: 'paragraph', content: [t('(1) Renovação gratuita', 'subscript')] }] } }],
          },
        },
      },
    };
    const html = convertPage(page, ctx('https://www.flytap.com/pt-pt/a-bordo/wi-fi')).html;
    assert.ok(html.includes('Envie mensagens com emojis incluídos .'), 'the card: "(1)" left out, as www');
    assert.ok(html.includes('Compre online , e poupe.'), 'the feature card alike');
    assert.ok(html.includes('(1) Renovação gratuita'), 'a rich text keeps it (www shows it there)');
  });

  it('a card list of one a row (itemsPerRow 1, Wi-Fi\'s data packages): the option one-up (parity 98)', () => {
    const list = (type) => ({ __typename: 'ComponentGenericCardListModel', itemsPerRow: 1, desktopType: 'grid', items: [{ __typename: type, title: 'Light', description: { plaintext: '1 h.' }, genericCard1Description: { plaintext: '1 h.' } }] });
    const page = (type) => ({ props: { pageProps: { page: { title: 'Wi-Fi', sections: [{ __typename: 'ComponentHeadingModel', title: 'Wi-Fi' }, list(type)] } } } });
    assert.ok(dom(convertPage(page('GenericCard1Model'), ctx()).html).querySelector('.cards-teaser.one-up'));
    assert.ok(dom(convertPage(page('SimpleGenericCardModel'), ctx()).html).querySelector('.cards.one-up'));
  });

  it('the call-back card (CoreMedia\'s widget, parity 66): ema-test\'s click-to-call with every row of the captured card (site.clickToCall), none where www shows none, else the link to www', () => {
    const page = (type) => ({ props: { pageProps: { page: { title: 'Lugares', sections: [{ __typename: 'ComponentHeadingModel', title: 'Lugares' }, { __typename: 'ComponentCoreMediaModel', type }] } } } });
    const wide = 'https://bysa1.byside.com/files/B414516D6E/window/29964/bg_c2call_full_2.png';
    const narrow = 'https://sa1.byside.com/files/B414516D6E/window/29964/Image_container_mobile.png';
    const local = { [wide]: ['/media-da', 'tap', 'bg-c2call-full-2-1.png'].join('/'), [narrow]: ['/media-da', 'tap', 'image-container-mobile-1.png'].join('/') };
    const card = {
      title: 'Deixe-se abraçar pelos <br>benefícios do Club',
      text: 'Precisa de mais informações? Entraremos em <strong>contacto consigo gratuitamente</strong>.<script>x()</script>',
      schedule: '<strong>Horário:</strong> Seg a Sex – 9:00 às 24:00 (GMT Lisboa)',
      hours: 'Mon-Fri 09:00-24:00',
      button: 'Liguem-me',
      buttonOutside: 'Agendar Contacto',
      phone: 'Telemóvel',
      days: ['Hoje', 'Amanhã'],
      slots: '08:00-23:30',
      smallPrint: 'Uso exclusivo do Club TAP Miles&amp;Go. <a href="https://www.flytap.com/pt-pt/ajuda#contactos" onclick="x()">contacte-nos</a>. Consulte: <a href="https://www.flytap.com/privacy">Política de Privacidade</a>.',
      image: wide,
      mobileImage: narrow,
      alt: 'Operador',
      floating: ['Quero Club', 'Ligamos grátis'],
      pages: ['/pt-pt/gerir-reserva/extras/lugares'],
    };
    const clickToCall = {
      '2022-lugares-bordo-comfortseat': { 'pt-pt': card, 'de-de': { noCard: ['/de-de/verwalten-buchungen/extras/sitzplatze'] } },
    };
    const at = { ...ctx('https://www.flytap.com/pt-pt/gerir-reserva/extras/lugares'), media: (k) => local[k] || null, clickToCall };
    const d = dom(convertPage(page('2022-lugares-bordo-comfortseat'), at).html);
    const b = d.querySelector('.click-to-call');
    assert.ok(b, 'a click-to-call block');
    const rows = Object.fromEntries([...b.querySelectorAll(':scope > div')].map((r) => [r.children[0].textContent, r.children[1]]));
    assert.deepEqual(Object.keys(rows), ['Title', 'Text', 'Schedule', 'Hours', 'Button', 'Button outside hours', 'Phone', 'Days', 'Slots', 'Small print', 'Image', 'Mobile image', 'Floating button', 'Link'], 'the README\'s rows, in its order');
    assert.equal(rows.Title.innerHTML, 'Deixe-se abraçar pelos <br>benefícios do Club', 'www\'s line break');
    assert.equal(rows.Text.querySelector('p strong').textContent, 'contacto consigo gratuitamente', 'www\'s bold');
    assert.ok(!rows.Text.innerHTML.includes('script') && !rows.Text.textContent.includes('x()'), 'no script');
    assert.equal(rows.Schedule.querySelector('strong').textContent, 'Horário:');
    assert.equal(rows.Hours.textContent, 'Mon-Fri 09:00-24:00');
    assert.equal(rows.Button.textContent, 'Liguem-me');
    assert.equal(rows['Button outside hours'].textContent, 'Agendar Contacto');
    assert.equal(rows.Phone.textContent, 'Telemóvel');
    assert.equal(rows.Days.textContent, 'Hoje, Amanhã');
    assert.equal(rows.Slots.textContent, '08:00-23:30');
    const sp = [...rows['Small print'].querySelectorAll('a')];
    assert.deepEqual(sp.map((a) => a.getAttribute('href')), ['/pt-pt/ajuda#contactos', 'https://www.flytap.com/privacy'], 'a page in scope local, the others as www has them');
    assert.ok(!rows['Small print'].innerHTML.includes('onclick'));
    assert.ok(rows['Small print'].textContent.includes('Miles&Go'));
    assert.equal(rows.Image.querySelector('img').getAttribute('src'), local[wide]);
    assert.equal(rows['Mobile image'].querySelector('img').getAttribute('alt'), 'Operador');
    assert.deepEqual([...rows['Floating button'].querySelectorAll('p')].map((p) => p.textContent), ['Quero Club', 'Ligamos grátis']);
    assert.equal(rows.Link.querySelector('a').getAttribute('href'), 'https://www.flytap.com/pt-pt/gerir-reserva/extras/lugares', 'the same page on www');
    assert.ok(!d.body.textContent.includes('Ver em flytap.com'));
    // a page www shows no card on (the version's noCard, or a page outside the card's pages): nothing
    const de = convertPage(page('2022-lugares-bordo-comfortseat'), { ...at, url: 'https://www.flytap.com/de-de/verwalten-buchungen/extras/sitzplatze', locale: 'de-de', lang: 'de' }).html;
    assert.ok(!de.includes('click-to-call') && !de.includes('Auf flytap.com ansehen'), 'no card, no link');
    const other = convertPage(page('2022-lugares-bordo-comfortseat'), { ...at, url: 'https://www.flytap.com/pt-pt/gerir-reserva/extras/fast-track' }).html;
    assert.ok(!other.includes('click-to-call') && !other.includes('Ver em flytap.com'), 'a page outside the card\'s pages: nothing');
    // no captured card for the type or the version: the link to www, as before
    assert.ok(convertPage(page('2023-flight-extra'), at).html.includes('Ver em flytap.com'));
    assert.ok(convertPage(page('2022-lugares-bordo-comfortseat'), { ...at, url: 'https://www.flytap.com/fr-fr/gerer-reserves/extras/sieges', locale: 'fr-fr', lang: 'fr' }).html.includes('Voir sur flytap.com'));
    // a version's own card first (pt-br's, es-es's English), else the language's
    const br = { pt: { ...card, pages: undefined, title: 'Voe na área Comfort' }, 'pt-br': { ...card, pages: undefined, title: 'Voe na área Comfort (BR)' } };
    const brAt = { ...at, url: 'https://www.flytap.com/pt-br/gerenciar-reserva/extras/assentos', locale: 'pt-br', lang: 'pt', clickToCall: { '2022-lugares-bordo-comfortseat': br } };
    assert.ok(convertPage(page('2022-lugares-bordo-comfortseat'), brAt).html.includes('Voe na área Comfort (BR)'));
    delete br['pt-br'];
    assert.ok(convertPage(page('2022-lugares-bordo-comfortseat'), brAt).html.includes('Voe na área Comfort<'));
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
    assert.deepEqual(rows.filter(([k]) => /^Alternate/.test(k)), [['Alternate en', '/en-pt/help'], ['Alternate en-pt', '/en-pt/help']]);
  });

  it('the registration form page is out of scope (a form): skipped', () => {
    const r = convertPage(nd('registo'), ctx('https://www.flytap.com/pt-pt/registo'));
    assert.ok(r.skipped && /register/.test(r.skipped));
  });
});

describe('tap-click-to-call: the cards from the capture', () => {
  const entry = (version, type, extra = {}) => ({
    version,
    type,
    pages: [`/${version}/a`, `/${version}/b`],
    byside: { scheduleSetForLanguageList: 'time_ranges_pt' },
    buttonLabels: { inOpeningHours: 'Call me now', outsideOpeningHours: 'Schedule contact' },
    title: 'Embrace the benefits\nof the Club',
    titleHtml: 'Embrace the benefits <br>of the Club',
    textHtml: 'We will <strong>contact you free</strong> of charge.',
    scheduleHtml: '<strong>Schedule:</strong> Mon to Fri – 9:00am to 12:00am (GMT Lisbon)',
    form: { phonePlaceholder: 'Phone number', dayOptions: ['Today', 'Tomorrow'], timeSlots: { firstLast: ['08:00', '23:30'] } },
    smallPrintHtml: 'See <a href="https://www.flytap.com/privacy">Privacy Policy</a>.',
    pictures: { wide: 'pictures/bysa1.byside.com/w/29964/bg_c2call_full_2.png', mobile: 'pictures/sa1.byside.com/w/29964/Image_container_mobile.png', mobileNote: 'img alt="Operador", shown above the text on narrow screens only' },
    floatingAnchor: { text: 'I want Club', subText: 'Call me free', shownAtCapture: true },
    ...extra,
  });
  const capture = {
    entries: [entry('es-es', 'club'), { version: 'de-de', type: 'promo', pages: ['/de-de/angebote'] }, entry('de-de', 'extra')],
    pictures: [
      { file: 'pictures/bysa1.byside.com/w/29964/bg_c2call_full_2.png', url: 'https://bysa1.byside.com/w/29964/bg_c2call_full_2.png' },
      { file: 'pictures/sa1.byside.com/w/29964/Image_container_mobile.png', url: 'https://sa1.byside.com/w/29964/Image_container_mobile.png' },
    ],
    noCardRechecks: [{ page: 'https://www.flytap.com/de-de/b', type: 'extra', card: 'none served' }],
  };
  it('a card per type and version with the block\'s fields; noCard where www served none', () => {
    const cards = cardsOf(capture);
    assert.deepEqual(cards.club['es-es'], {
      title: 'Embrace the benefits <br>of the Club',
      text: 'We will <strong>contact you free</strong> of charge.',
      schedule: '<strong>Schedule:</strong> Mon to Fri – 9:00am to 12:00am (GMT Lisbon)',
      hours: 'Mon-Fri 09:00-24:00',
      button: 'Call me now',
      buttonOutside: 'Schedule contact',
      phone: 'Phone number',
      days: ['Today', 'Tomorrow'],
      slots: '08:00-23:30',
      smallPrint: 'See <a href="https://www.flytap.com/privacy">Privacy Policy</a>.',
      image: 'https://bysa1.byside.com/w/29964/bg_c2call_full_2.png',
      mobileImage: 'https://sa1.byside.com/w/29964/Image_container_mobile.png',
      alt: 'Operador',
      floating: ['I want Club', 'Call me free'],
      pages: ['/es-es/a', '/es-es/b'],
    });
    assert.deepEqual(cards.promo['de-de'], { noCard: ['/de-de/angebote'] }, 'a version www serves no card for');
    assert.deepEqual(cards.extra['de-de'].pages, ['/de-de/a'], 'a page www served none on is out of the pages');
    assert.deepEqual(cards.extra['de-de'].noCard, ['/de-de/b']);
  });
});
