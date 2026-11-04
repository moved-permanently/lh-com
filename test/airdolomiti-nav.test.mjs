/* eslint-disable max-len, import/extensions -- dev tooling */
/* Air Dolomiti's nav documents (tools/importer/airdolomiti-nav.mjs) for its desktop menu
   (blocks/header/header-airdolomiti.js): a menu card (www's nav-bar-tab-*-card: its picture,
   title and button) as a column with its picture; the quick actions (nav-bar-tab-*-azioni-rapide)
   with www's icon before each link (outside it: Edge Delivery would split a link holding a picture into two); a titled column with its title linked where www links it; a
   list without a title (list-bold) with an empty title; the tools with the search page
   (:search:) after the assistance link.
   Run: node --max-old-space-size=512 --test test/airdolomiti-nav.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  navColumn, navTools, footerColumns, footerBadges,
} from '../tools/importer/airdolomiti-nav.mjs';

const ctx = {
  href: (u) => (u || '').replace(/^https:\/\/www\.airdolomiti\.it/, '') || null,
  img: ({ url, alt }) => `<picture><img src="${url}" alt="${alt}"></picture>`,
};

test('a menu card: its title, its picture and its button as one column', () => {
  const block = {
    name: 'lazyblock/nav-bar-tab-esplora-card',
    a: {
      text: 'Air Dolomiti Blog', textButton: 'Leggi di più', url: 'https://www.airdolomiti.it/articoli', image: { url: 'https://cms.airdolomiti.it/wp-content/uploads/2021/11/Blog.jpg' },
    },
  };
  assert.equal(navColumn(block, ctx), '<li><p>Air Dolomiti Blog</p><p><picture><img src="https://cms.airdolomiti.it/wp-content/uploads/2021/11/Blog.jpg" alt=""></picture></p><ul><li><a href="/articoli">Leggi di più</a></li></ul></li>');
  // a card without a picture: as before (title and button)
  assert.equal(navColumn({ ...block, a: { ...block.a, image: null } }, ctx), '<li><p>Air Dolomiti Blog</p><ul><li><a href="/articoli">Leggi di più</a></li></ul></li>');
});

test('the quick actions with their icons; columns with and without a title', () => {
  const quick = { name: 'lazyblock/nav-bar-tab-esplora-azioni-rapide', a: { tabTitle: 'Azioni Rapide', links: [{ text: 'Prenota un volo', url: '/prenotazioni', icon: { url: 'https://cms.airdolomiti.it/wp-content/uploads/2021/12/prenota-volo.png' } }, { text: 'Assistenza', url: 'https://www.airdolomiti.it/assistenza' }] } };
  assert.equal(navColumn(quick, ctx), '<li><p>Azioni Rapide</p><ul><li><picture><img src="https://cms.airdolomiti.it/wp-content/uploads/2021/12/prenota-volo.png" alt=""></picture> <a href="/prenotazioni">Prenota un volo</a></li><li><a href="/assistenza">Assistenza</a></li></ul></li>');
  const titled = {
    name: 'lazyblock/nav-bar-tab-esplora-destinazioni',
    a: {
      tabTitle: 'Destinazioni', tabTitleUrl: '/destinazioni', links: [{ text: 'Francoforte', url: '/destinazioni/francoforte' }], vediTutte: 'Vedi tutte', vediTutteLink: '/destinazioni',
    },
  };
  assert.equal(navColumn(titled, ctx), '<li><p><a href="/destinazioni">Destinazioni</a></p><ul><li><a href="/destinazioni/francoforte">Francoforte</a></li><li><a href="/destinazioni">Vedi tutte</a></li></ul></li>');
  const bold = { name: 'lazyblock/nav-bar-tab-esplora-list-bold', a: { tabTitle: 'tabtitle', links: [{ text: 'Flotta', url: '/flotta' }] } };
  assert.equal(navColumn(bold, ctx), '<li><p></p><ul><li><a href="/flotta">Flotta</a></li></ul></li>');
  assert.equal(navColumn({ name: 'lazyblock/nav-bar-tab-esplora-x', a: { tabTitle: 'Empty', links: [] } }, ctx), '', 'a column without links: none');
});

test('the footer\'s columns: company, contacts, news, routes, assistance and, as on www, the legal links as the last column ("Info legali"; www\'s cookie-settings button left out)', () => {
  const li = (url, text) => `<li><a href="${ctx.href(url)}">${text}</a></li>`;
  const fd = {
    corporateLinks: [{ url: '/azienda/chi-siamo', text: 'Chi siamo' }],
    contattiTitle: 'Contatti',
    contattiLinks: [{ url: '/sede', text: 'Sede' }],
    newsConsigliTitle: 'News e consigli',
    newsConsigliLinks: [],
    tratteTitle: 'Tratte',
    tratteLinks: [{ url: '/orario-voli', text: 'Orario voli' }],
    assistenzaTitle: 'Assistenza al viaggiatore',
    assistenzaLinks: [{ url: '/faq', text: 'FAQ' }],
    infoLegaliTitle: 'Info legali',
    infoLegaliLinks: [{ url: '/privacy-policy', text: 'Privacy Policy' }, { url: '{{cookie-settings}}', text: 'Modifica impostazioni cookie' }, { url: '/whistleblowing', text: 'Whistleblowing' }],
  };
  assert.equal(
    footerColumns(fd, li),
    '<h3>Air Dolomiti</h3><ul><li><a href="/azienda/chi-siamo">Chi siamo</a></li></ul><h3>Contatti</h3><ul><li><a href="/sede">Sede</a></li></ul><h3>Tratte</h3><ul><li><a href="/orario-voli">Orario voli</a></li></ul><h3>Assistenza al viaggiatore</h3><ul><li><a href="/faq">FAQ</a></li></ul><h3>Info legali</h3><ul><li><a href="/privacy-policy">Privacy Policy</a></li><li><a href="/whistleblowing">Whistleblowing</a></li></ul>',
  );
});

test('the tools: assistance, search, the other languages, the menu label', () => {
  assert.equal(
    navTools({ assist: ['Assistenza', '/assistenza'], search: ['Cerca', '/search'], menuLabel: 'Menu' }, [['English', '/en/'], ['Deutsch', '/de/']], ctx),
    '<div><ul><li>:wheelchair: <a href="/assistenza">Assistenza</a></li><li>:search: <a href="/search">Cerca</a></li><li><a href="/en/">English</a></li><li><a href="/de/">Deutsch</a></li></ul><p>Menu</p></div>',
  );
});

test('the footer\'s badges as three sections of the style badges: the main buttons (www\'s pills at the top), the social links (www\'s band at the bottom), the payment logos under their heading', () => {
  assert.deepEqual(footerBadges({
    buttons: '<li><a href="/x">Check in</a></li>', social: '<li><a href="https://www.linkedin.com/company/air-dolomiti">:linkedin:</a></li>', payments: '<li><img src="v.png" alt="Visa"></li>', heading: 'Metodi di pagamento',
  }), [
    ['<ul><li><a href="/x">Check in</a></li></ul>', 'badges'],
    ['<ul><li><a href="https://www.linkedin.com/company/air-dolomiti">:linkedin:</a></li></ul>', 'badges'],
    ['<h3>Metodi di pagamento</h3><ul><li><img src="v.png" alt="Visa"></li></ul>', 'badges'],
  ]);
  assert.deepEqual(footerBadges({ buttons: '', social: '', payments: '' }), [], 'nothing to show: no sections');
});
