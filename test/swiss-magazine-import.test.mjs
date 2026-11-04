/* eslint-disable max-len, import/extensions, import/no-extraneous-dependencies -- dev tooling */
/* SWISS magazine's import (tools/importer/import-magazine.js, swiss-magazine-import.mjs,
   swiss-magazine-nav.mjs): www's AEM core component markup (www.swiss.com/magazine/<ll>) as lh-com's
   blocks: an article's header, body, quotes, carousels, videos, maps, buttons, credits (date and
   author as metadata), related stories; an overview's featured story, top stories and teaser
   containers (blog-overview over the magazine's index); the documents' paths and redirect rows;
   the links; the nav and footer documents. linkedom pages and a createBlock stand-in, no network.
   Run: node --max-old-space-size=512 --test test/swiss-magazine-import.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import {
  assetOf, isoDate, creditsOf, docName, commonParent, transformPage,
} from '../tools/importer/import-magazine.js';
import {
  magazineLinks, redirectRows, MAGAZINE_PATH, emptyOnWww, GONE_PICTURES, dropGonePictures, authorLinks,
  relinkDocument,
} from '../tools/importer/swiss-magazine-import.mjs';
import { subSiteLinks } from '../tools/importer/swiss-sub-import.mjs';
import { magazineMenuOf, magazineNavDocument, magazineFooterDocument } from '../tools/importer/swiss-magazine-nav.mjs';

globalThis.WebImporter = {
  Blocks: {
    createBlock(doc, { name, cells }) {
      const t = doc.createElement('table');
      t.setAttribute('data-name', name);
      cells.forEach((row) => {
        const tr = doc.createElement('tr');
        row.forEach((c) => {
          const td = doc.createElement('td');
          if (Array.isArray(c)) c.forEach((n) => td.append(n));
          else if (c && typeof c === 'object') td.append(c);
          else td.textContent = String(c ?? '');
          tr.append(td);
        });
        t.append(tr);
      });
      return t;
    },
  },
};

const REND = (asset, ext) => `${asset}.component.crop-16x9-L-1x.ts=1683714055985.${ext}/content/swiss-magazine/de/x/_jcr_content/root/hero-image.${ext}`;
const page = (body) => parseHTML(`<!DOCTYPE html><html><head><title>Kunst auf der Kuhwiese</title></head><body>${body}</body></html>`).document;
const blocks = (main) => [...main.querySelectorAll('table[data-name]')].map((t) => t.getAttribute('data-name'));
const meta = (main) => Object.fromEntries([...main.querySelectorAll('table[data-name="Metadata"] tr')].map((tr) => [tr.children[0].textContent, tr.children[1]]));

const ARTICLE = `
<div class="headercontainer"><header>
  <div class="header-component-wrapper"><div class="figure"><picture><img class="dynamic-image-img" src="${REND('/content/dam/swiss-magazine/images/travel/lifestyle/x/Hero%20Bild', 'jpg')}" alt="Kunst auf der Kuhwiese"></picture></div></div>
</header></div>
<div class="breadcrumb"><nav class="cmp-breadcrumb"><ol>
  <li><a class="cmp-breadcrumb__item-link" href="/magazine/de">SWISS Magazine</a></li>
  <li><a class="cmp-breadcrumb__item-link" href="/magazine/de/reisen">Reisen</a></li>
  <li><a class="cmp-breadcrumb__item-link" href="/magazine/de/reisen/lifestyle">Lifestyle</a></li>
</ol></nav></div>
<div class="main-container"><div class="articlecontentfragment">
  <div class="m-article-intro">
    <ul class="article-tags"><li><a href="/magazine/de/tags?tag=art">#Art</a></li><li><a href="/magazine/de/tags?tag=england">#England</a></li></ul>
    <h1>Kunst auf der Kuhwiese</h1>
    <div class="lead"><p>Ein Schweizer Kunstzentrum in Somerset.</p></div>
    <div id="div-inside-pos1"></div>
  </div>
  <div class="m-article-body component">
    <p><b>Wie Phönix aus der Asche<br>
 </b>Eine Woche nach dem Brand.</p>
    <p><b>Pascal, wie bist du zu HPI gekommen?<i><br>
 </i></b>Meine Begeisterung.</p>
    <p><b>Besteht eine Verbindung?<i><br>
</i><span> </span></b>Die Verbindung entstand.</p>
    <p class="intro">Am Anfang war das Feuer. <a href="hauserwirth.com" target="_blank" data-external="true">hauserwirth.com</a> <a href="ambientmedia@swiss.com">Mail</a></p>
    <p> </p>
    <div class="dynamic-image-component crop-3x2"><figure><img src="${REND('/content/dam/swiss-magazine/images/travel/lifestyle/x/farm', 'jpeg')}" alt="farm_01.jpeg"><div class="caption-wrapper"><span>Die Farm.</span></div><small class="dynamic-image-copyright">© Jason Ingram</small></figure></div>
    <div class="dynamic-image-component"><img src=".jpeg" alt=""></div>
    <div class="dynamic-image-component"><picture><source media="(min-width: 1200px)" srcset="${REND('/content/dam/swiss-magazine/images/the-crew’s-eyes/R53', 'jpg')} 1x, ${REND('/content/dam/swiss-magazine/images/the-crew’s-eyes/R53', 'jpg')} 2x"><img src=".jpg" alt="R53_3292.jpg"></picture></div>
    <p>Ein <a href="">leerer</a> und <a>kein</a> Link.</p>
    <p><a href="www.%20lelion.net">Le Lion</a> <a href="www.hygge%C2%ADhamburg.de">Hygge</a> <a href="zur%C3%BCckzudir.ch">Zurück</a> <a href="Gundari">Gundari</a></p>
    <p><a href="https://www.swiss.com/magazine/de/reisen/lifestyle/chezsarah.net">Chez Sarah</a> <a href="https://www.swiss.com/content/dam/a/guide.pdf">PDF</a></p>
    <div class="component"><div class="quote"><div class="quote-text"><h1>«Alles gehört zu einem grossen Ganzen.»</h1></div><div class="quote-source-author">Iwan Wirth</div><div class="quote-source-description">Hauser &amp; Wirth</div></div></div>
    <div class="carousel teasercarousel"><div class="swiper-wrapper">
      <div class="swiper-slide"><div class="dynamic-image-component"><img src="${REND('/content/dam/swiss-magazine/images/a', 'jpg')}" alt="A"><div class="caption-wrapper">Hofladen</div></div></div>
      <div class="swiper-slide"><div class="dynamic-image-component"><img src="${REND('/content/dam/swiss-magazine/images/b', 'jpg')}" alt="B"></div></div>
    </div></div>
    <div class="component video"><div class="js-video-component"><iframe src="https://www.youtube-nocookie.com/embed/T6me0uYzhk0?rel=0"></iframe></div><p class="video-caption">Der Film</p></div>
    <div class="component-wrapper"><div class="aem-Grid">
      <div class="component button-component"><a class="button button--primary" href="https://www.swiss.com/lhg/ch/en/o-d/cy-cy/zurich-bristol"><span>Book now</span></a></div>
      <div class="component credits"><div class="credits__wrapper"><p><b>Information<br></b>Bruton liegt in Somerset.</p></div></div>
      <div class="component credits"><div class="credits__wrapper"><p>Text und Bilder: Claudia von Känel<br>Veröffentlicht am 05.01.2024</p></div></div>
      <div class="component map js-map-component"><div class="container-map"><iframe src="https://www.google.com/maps/embed?pb=!1m18!2sBruton"></iframe></div><p class="map-caption">Bruton, Somerset</p></div>
      <div class="teasercontainer js-related-stories"><h2>Weitere Beiträge:</h2><div class="row">
        <article class="teaser"><a href="/magazine/de/reisen/lifestyle/flying-without-fear"><h3>Fliegen trotz Flugangst</h3></a></article>
      </div></div>
    </div></div>
  </div>
</div></div>`;

test('assetOf: www\'s rendition is its asset (decoded); a placeholder src none', () => {
  assert.equal(assetOf(REND('/content/dam/swiss-magazine/images/x/SWISS%20Bengaluru%20-%20Still-4', 'jpg')), '/content/dam/swiss-magazine/images/x/SWISS Bengaluru - Still-4.jpg');
  assert.equal(assetOf('https://www.swiss.com/content/dam/swiss-magazine/pdf/guide.pdf'), '/content/dam/swiss-magazine/pdf/guide.pdf');
  assert.equal(assetOf('.jpeg'), '');
});

test('isoDate and creditsOf: www\'s credits (a line a paragraph or line break) as date and author', () => {
  assert.equal(isoDate('Veröffentlicht am 05.01.2024'), '2024-01-05');
  assert.equal(isoDate('Publiziert am: 21. Februar 2026'), '2026-02-21');
  assert.equal(isoDate('Published on February 3, 2025'), '2025-02-03');
  assert.equal(isoDate('Fotos: Ana Lui'), '');
  // en's two-digit years ("Published: 01.06.23")
  assert.equal(isoDate('Published: 01.06.23'), '2023-06-01');
  const { document } = parseHTML('<div class="credits__wrapper"><p>Aktualisiert am 01.02.2025</p><p>Text: Sara Thenen Images: NAM Films</p></div><div class="credits__wrapper"><p>Selektion &amp; Text: Claus<br>Publiziert: 3. März 2024</p></div>');
  const c = creditsOf(document.querySelectorAll('.credits__wrapper'));
  // the publication date before the update's
  assert.equal(c.date, '2024-03-03');
  assert.equal(c.author, 'Sara Thenen');
  assert.equal(c.lines.length, 4);
});

test('docName: www\'s leading, trailing and double hyphens and underscores out; redirect rows where it differs', () => {
  assert.equal(docName('/magazine/de/reisen/reisegeschichten/in-full-color--bengaluru-with-nidhhi-agerwal-'), '/magazine/de/reisen/reisegeschichten/in-full-color-bengaluru-with-nidhhi-agerwal');
  assert.equal(docName('/magazine/de/reisen/destinationen/pozna_---a-city'), '/magazine/de/reisen/destinationen/pozna-a-city');
  assert.equal(docName('/magazine/de'), '/magazine/de');
  assert.deepEqual(redirectRows(new Set(['/magazine/de', '/magazine/de/x/crew_tipp_bologna'])), [['/magazine/de/x/crew_tipp_bologna', '/magazine/de/x/crew-tipp-bologna']]);
  assert.equal(MAGAZINE_PATH.test('/ch/de/sitemap'), false);
});

test('commonParent: the teasers\' common parent path', () => {
  assert.equal(commonParent(['/magazine/de/reisen/destinationen/a', '/magazine/de/reisen/lifestyle/b']), '/magazine/de/reisen');
  assert.equal(commonParent(['https://www.swiss.com/magazine/de/reisen/destinationen/a', '/magazine/de/reisen/destinationen/b?x=1']), '/magazine/de/reisen/destinationen');
  assert.equal(commonParent([]), '');
});

test('an article: article-header, the body in order with its blocks, the credits as lines and metadata, related-articles', () => {
  const main = transformPage(page(ARTICLE), '/magazine/de/reisen/lifestyle/art-in-the-cow-meadow');
  assert.deepEqual(blocks(main), ['article-header', 'quote', 'carousel-images', 'embed', 'embed', 'related-articles', 'Metadata']);
  const header = main.querySelector('table[data-name="article-header"]');
  assert.equal(header.querySelector('img').getAttribute('src'), 'https://www.swiss.com/content/dam/swiss-magazine/images/travel/lifestyle/x/Hero%20Bild.jpg');
  assert.equal(header.querySelector('h1').textContent, 'Kunst auf der Kuhwiese');
  const html = main.innerHTML;
  // a bold lead-in and its line break (also in an inline element within it): two paragraphs
  assert.equal(html.includes('<p><b>Wie Phönix aus der Asche</b></p><p>Eine Woche'), true);
  assert.equal(html.includes('<p><b>Pascal, wie bist du zu HPI gekommen?</b></p><p>Meine'), true);
  // (the importer's own pass writes the space after the break as <span> </span>)
  assert.equal(html.includes('<p><b>Besteht eine Verbindung?</b></p><p>Die Verbindung'), true);
  assert.equal(html.includes('href="https://hauserwirth.com"'), true);
  assert.equal(html.includes('href="mailto:ambientmedia@swiss.com"'), true);
  assert.equal(/data-external|target=|class="intro"/.test(html), false);
  // the picture and its caption with www's copyright; the placeholder image left out; an alt that is a file name none
  assert.equal(html.includes('<em>Die Farm. © Jason Ingram</em>'), true);
  assert.equal(main.querySelectorAll('img[src*=".jpeg"]').length === 1 && main.querySelector('img[src*="farm"]').getAttribute('alt') === '', true);
  // a lazy image (src=".jpg"): its picture's source names the rendition
  assert.equal(main.querySelector('img[src*="R53"]').getAttribute('src'), 'https://www.swiss.com/content/dam/swiss-magazine/images/the-crew%E2%80%99s-eyes/R53.jpg');
  assert.equal(html.includes('<p>Ein leerer und kein Link.</p>'), true);
  // www's addresses without a scheme, with spaces or soft hyphens: the site; a name: its text
  assert.equal(html.includes('<a href="https://www.lelion.net">Le Lion</a> <a href="https://www.hyggehamburg.de">Hygge</a> <a href="https://zurückzudir.ch">Zurück</a> Gundari'), true);
  // www's own link to an address below one of its pages (…/lifestyle/chezsarah.net): the site; files as they are
  assert.equal(html.includes('<a href="https://chezsarah.net">Chez Sarah</a> <a href="https://www.swiss.com/content/dam/a/guide.pdf">PDF</a>'), true);
  assert.equal(main.querySelector('table[data-name="quote"] tr').children[1].textContent, 'Iwan Wirth, Hauser & Wirth');
  assert.equal(main.querySelectorAll('table[data-name="carousel-images"] tr').length, 2);
  const embeds = [...main.querySelectorAll('table[data-name="embed"] a')].map((a) => a.getAttribute('href'));
  assert.deepEqual(embeds, ['https://www.youtube-nocookie.com/embed/T6me0uYzhk0', 'https://www.google.com/maps/embed?pb=!1m18!2sBruton']);
  assert.equal(html.includes('<strong><a href="https://www.swiss.com/lhg/ch/en/o-d/cy-cy/zurich-bristol">Book now</a></strong>'), true);
  // the button, the credits and the map in www's order, then the related stories
  const order = ['Book now', 'Bruton liegt in Somerset.', 'Text und Bilder: Claudia von Känel', 'Bruton, Somerset', 'Weitere Beiträge'].map((t) => html.indexOf(t));
  assert.equal(order.every((x, i) => x > 0 && (i === 0 || x > order[i - 1])), true);
  assert.equal(main.querySelector('h2').textContent, 'Weitere Beiträge');
  const m = meta(main);
  assert.equal(m['page-type'].textContent, 'article');
  assert.equal(m.category.textContent, 'Lifestyle');
  assert.equal(m.tags.textContent, 'Art, England');
  assert.equal(m['tag-ids'].textContent, 'art, england');
  assert.equal(m['publication-date'].textContent, '2024-01-05');
  assert.equal(m.author.textContent, 'Claudia von Känel');
  assert.equal(m.Description.textContent, 'Ein Schweizer Kunstzentrum in Somerset.');
  assert.equal(Boolean(m['card-image'].querySelector('img')), true);
  assert.equal(m.nav.textContent, '/magazine/de/nav');
  assert.equal(m.footer.textContent, '/magazine/de/footer');
});

const teaser = (href, title, label) => `<article class="teaser"><a href="${href}"><picture><img src="${REND('/content/dam/swiss-magazine/images/t', 'jpg')}" alt="${title}"></picture><h3>${title}</h3></a><span class="teaser-label">${label}</span></article>`;
const OVERVIEW = (containers) => `
<div class="headercontainer"><header>
  <h1 id="download-dialog-title">Download Stories</h1>
  <div class="header-component-wrapper"><div class="figure"><img src="${REND('/content/dam/swiss-magazine/images/boston', 'jpeg')}" alt="Boston"></div>
    <div class="head"><ul class="tags js-tags"><li class="tag"><a href="/magazine/de/reisen/destinationen/hello-boston"><span class="teaser-label">Destinationen</span></a></li></ul>
    <h1><a href="/magazine/de/reisen/destinationen/hello-boston"><span class="teaser-label">Alt trifft neu in Boston </span></a></h1></div></div>
</header></div>
<div class="root"><div class="carousel topstoriescarousel"><h2>Beliebte Beiträge</h2><div class="swiper-wrapper">
  <div class="swiper-slide">${teaser('/magazine/de/switzerland/discover-switzerland/flying-through-zug', 'Im Flug durch Zug', 'Schweiz entdecken')}</div>
</div></div>
<div class="main-container">${containers}</div></div>`;

test('an overview: the featured story (the page\'s h1), the top stories as carousel-cards, each teaser container a blog-overview of its teasers\' parent', () => {
  const main = transformPage(page(OVERVIEW(`
    <section class="teasercontainer"><h2>Destinationen</h2>${teaser('/magazine/de/reisen/destinationen/a', 'A', 'Destinationen')}${teaser('/magazine/de/reisen/destinationen/b', 'B', 'Destinationen')}</section>
    <section class="teasercontainer"><h2>Lifestyle</h2>${teaser('/magazine/de/reisen/lifestyle/c', 'C', 'Lifestyle')}</section>`)), '/magazine/de/reisen');
  assert.deepEqual(blocks(main), ['hero-card-overlay', 'carousel-cards', 'blog-overview (grid)', 'blog-overview (grid)', 'Metadata']);
  assert.equal(main.querySelectorAll('h1').length, 1);
  const h1 = main.querySelector('table[data-name="hero-card-overlay"] h1 a');
  assert.equal(h1.textContent === 'Alt trifft neu in Boston' && h1.getAttribute('href') === '/magazine/de/reisen/destinationen/hello-boston', true);
  assert.equal(main.querySelector('table[data-name="hero-card-overlay"]').textContent.includes('Destinationen'), true);
  assert.equal(main.querySelector('table[data-name="carousel-cards"] h3 a').textContent, 'Im Flug durch Zug');
  const rows = (t) => [...t.querySelectorAll('tr')].map((tr) => [...tr.children].map((c) => c.textContent));
  const [first, second] = [...main.querySelectorAll('table[data-name="blog-overview (grid)"]')].map(rows);
  assert.deepEqual(first, [['Path', '/magazine/de/reisen/destinationen'], ['Page size', '2'], ['Hide filter', 'true'], ['Load more', 'false']]);
  assert.equal(second[0][1], '/magazine/de/reisen/lifestyle');
  assert.equal([...main.querySelectorAll('h2 a')].map((a) => a.getAttribute('href')).join(' '), '/magazine/de/reisen/destinationen /magazine/de/reisen/lifestyle');
  assert.equal(meta(main)['page-type'].textContent, 'overview');
});

test('related stories without www\'s heading: the language\'s label', () => {
  const html = ARTICLE.replace('<h2>Weitere Beiträge:</h2>', '');
  assert.equal(transformPage(page(html), '/magazine/de/a/b/c').querySelector('h2').textContent, 'Weitere Beiträge');
  assert.equal(transformPage(page(html), '/magazine/en/a/b/c').querySelector('h2').textContent, 'More stories');
});

test('a category page: its one container without a heading lists the page\'s own path, twelve and Load more', () => {
  const main = transformPage(page(OVERVIEW(`<section class="teasercontainer">${teaser('/magazine/de/reisen/destinationen/a', 'A', 'Destinationen')}</section>`)), '/magazine/de/reisen/destinationen');
  const rows = [...main.querySelectorAll('table[data-name="blog-overview (grid)"] tr')].map((tr) => [...tr.children].map((c) => c.textContent));
  assert.deepEqual(rows, [['Path', '/magazine/de/reisen/destinationen'], ['Page size', '12'], ['Hide filter', 'true']]);
});

test('magazineLinks: a captured page relative under its document\'s path, the front page as it is, others on www', () => {
  const pages = new Set(['/magazine/de', '/magazine/de/reisen/reisegeschichten/in-full-color--bengaluru-']);
  const doc = '<p><a href="/magazine/de">Home</a> <a href="https://www.swiss.com/magazine/de/reisen/reisegeschichten/in-full-color--bengaluru-">B</a> <a href="/magazine/de/tags?tag=art">T</a></p>';
  const out = magazineLinks(doc, { pages, sitePaths: new Set() });
  assert.equal(out.includes('href="/magazine/de"'), true);
  assert.equal(out.includes('href="/magazine/de/reisen/reisegeschichten/in-full-color-bengaluru"'), true);
  assert.equal(out.includes('href="https://www.swiss.com/magazine/de/tags?tag=art"'), true);
  // a second pass (--relink after a later archive) leaves the links as they are
  assert.equal(magazineLinks(out, { pages, sitePaths: new Set() }), out);
  // the corporate site's /corporate/<ll> is its homepage document, as before
  assert.equal(subSiteLinks('<a href="/corporate/de">C</a>', { subPages: new Set(['/corporate/de/homepage']), sitePaths: new Set() }).includes('href="/corporate/de/homepage"'), true);
});

const HEADER = `<div class="headercontainer"><header><div class="navbar"><div class="navbar-top-bar navbar-padding"><a href="/magazine/de">Swiss Magazine</a>
  <div class="menu js-menu"><div class="nav-wrapper"><nav class="cmp-navigation"><ul><li><a href="/magazine/de/inside-swiss">Inside SWISS</a></li><li><a href="/magazine/de/reisen">Reisen</a></li></ul></nav></div>
  <button aria-label="Hauptmenü"></button></div></div></div>
  <div class="navbar navbar--off-canvas"><div class="navbar-top-bar"><button aria-label="Hauptmenü schließen"></button></div><div class="menu"><div><nav class="cmp-navigation"><ul>
    <li><button class="item js-accordion">Inside SWISS</button><ul><li><a href="/magazine/de/inside-swiss/behind-the-scenes">Hinter den Kulissen</a></li><li><a href="https://www.swissworldcargo.com/en/cargo-stories">Swiss WorldCargo</a></li></ul></li>
    <li><a href="/magazine/de/space-holder"> </a></li>
    <li><a href="/magazine/de/contact">Kontakt</a></li>
    <li><a href="https://www.swiss.com/ch/de/homepage">Flug buchen</a></li>
  </ul></nav></div></div></div>
</header></div>
<footer class="footer"><div class="row"><div class="col"><ul class="social-media">
  <li><a href="https://www.linkedin.com/company/swiss-international-air-lines/"><svg></svg><span>Besuchen Sie uns auf LinkedIn</span></a></li>
  <li><a href="https://www.tiktok.com/@flyswiss"><span>social.icon.tiktok</span></a></li>
</ul></div></div>
<div class="row legal"><div class="col-12 col-md-3"><a href="http://www.swiss.com">Swiss</a><p>© Swiss International Air Lines</p></div>
  <div class="col-12 col-md-6"><a href="https://www.swiss.com/ch/de/terms-conditions">Rechtliches</a><a href="#">Privatsphäre-Einstellungen ändern</a></div>
  <div class="col-12 col-md-3"><a href="https://www.staralliance.com/en/home">Star Alliance</a></div></div></footer>`;

test('the nav document: the logo to the front page, www\'s top links as quick links, the menu\'s sections and links (no space holder), the menu label', () => {
  const { document } = parseHTML(`<html><body>${HEADER}</body></html>`);
  assert.deepEqual(magazineMenuOf(document), [
    { label: 'Inside SWISS', links: [{ label: 'Hinter den Kulissen', href: '/magazine/de/inside-swiss/behind-the-scenes' }, { label: 'Swiss WorldCargo', href: 'https://www.swissworldcargo.com/en/cargo-stories' }] },
    { label: 'Kontakt', href: '/magazine/de/contact' },
    { label: 'Flug buchen', href: 'https://www.swiss.com/ch/de/homepage' },
  ]);
  const nav = parseHTML(`<html><body>${magazineNavDocument(document, 'de')}</body></html>`).document;
  const sections = [...nav.body.children];
  assert.equal(sections.length, 4);
  assert.equal(sections[0].querySelector('a').getAttribute('href') === '/magazine/de' && sections[0].querySelector('img').getAttribute('alt') === 'Swiss Magazine', true);
  assert.deepEqual([...sections[1].querySelectorAll('a')].map((a) => a.textContent), ['Inside SWISS', 'Reisen']);
  assert.equal(sections[2].querySelector(':scope > ul > li > p').textContent, 'Inside SWISS');
  assert.equal(sections[2].querySelectorAll(':scope > ul > li').length, 3);
  assert.equal(sections[3].querySelector('p').textContent, 'Hauptmenü');
});

test('the footer document: the social badges (lh-swiss\'s icons), the logos, the legal row (#privacy-settings), the © note', () => {
  const { document } = parseHTML(`<html><body>${HEADER}</body></html>`);
  const footer = parseHTML(`<html><body>${magazineFooterDocument(document)}</body></html>`).document;
  const sections = [...footer.body.children];
  assert.equal(sections.length, 4);
  const icons = [...sections[0].querySelectorAll('img')].map((i) => [i.getAttribute('src').split('/').pop(), i.getAttribute('alt')]);
  assert.deepEqual(icons, [['footer-linkedin.svg', 'Besuchen Sie uns auf LinkedIn'], ['footer-tiktok.svg', 'TikTok']]);
  assert.equal(sections[0].textContent.includes('badges'), true);
  assert.equal(sections[1].innerHTML.includes(':star-alliance:') && sections[1].querySelector('a').getAttribute('href') === 'https://www.swiss.com', true);
  assert.deepEqual([...sections[2].querySelectorAll('a')].map((a) => a.getAttribute('href')), ['https://www.swiss.com/ch/de/terms-conditions', '#privacy-settings']);
  assert.equal(sections[3].querySelector('p').textContent === '© Swiss International Air Lines' && sections[3].textContent.includes('note'), true);
});

test('emptyOnWww: a page whose main container www leaves empty (an empty article fragment) is held', () => {
  const shell = (main) => `<html><body><header><h1 id="download-dialog-title">Download stories</h1></header><div class="main-container aem-GridColumn"><div class="aem-Grid">${main}</div></div><div class="footercontainer"><footer>Swiss</footer></div></body></html>`;
  assert.equal(emptyOnWww(shell('<div class="component"> </div><div class="articlecontentfragment aem-GridColumn"> </div>')), true);
  assert.equal(emptyOnWww(shell('<div class="articlecontentfragment"><div class="m-article-intro"><h1>Title</h1></div></div>')), false);
  assert.equal(emptyOnWww(shell('<section class="teasercontainer"><article class="teaser"><a href="/magazine/de/a"><h3>A</h3></a></article></section>')), false);
});

test('magazineLinks: www.swiss.com.cn\'s links (pages the capture rendered for SWISS\'s China host) as www.swiss.com\'s, relative where the page is captured', () => {
  const pages = new Set(['/magazine/en/travel/lifestyle/family-care']);
  const doc = '<p><a href="https://www.swiss.com.cn/magazine/en/travel/lifestyle/family-care">a</a> <a href="https://www.swiss.com.cn/lhg/ch/en/dest/cy/boston">b</a> <a href="http://www.swiss.com.cn">c</a></p>';
  const out = magazineLinks(doc, { pages, sitePaths: new Set() });
  assert.equal(out.includes('href="/magazine/en/travel/lifestyle/family-care"'), true, out);
  assert.equal(out.includes('href="https://www.swiss.com/lhg/ch/en/dest/cy/boston"'), true, out);
  assert.equal(out.includes('swiss.com.cn'), false, out);
});

// the magazine's leftovers (brief 341): pictures www no longer has, www's own broken author links,
// links to pages the replica has
test('dropGonePictures: a carousel slide of a gone picture out (its caption with it), an article header keeps its text', () => {
  const carousel = '<div><div class="carousel-images"><div><div><picture><img src="https://content.da.live/x/230926_amman/3-auf-gehts-min.jpg" alt=""></picture></div><div>Los gehts!</div></div><div><div><picture><img src="https://content.da.live/x/230926_amman/3-checkflight-flight-radar.png" alt=""></picture></div><div>Der Checkflight findet im Raum Nikosia statt.</div></div></div></div>';
  const out = dropGonePictures(carousel);
  assert.ok(!out.includes('3-checkflight-flight-radar') && !out.includes('Nikosia'), out);
  assert.ok(out.includes('3-auf-gehts-min.jpg') && out.includes('Los gehts!'), out);
  const header = '<div><div class="article-header"><div><div><picture><img src="https://content.da.live/x/cargo/when-animals-go-on-a-journey/capture.png" alt="A sleeping dog"></picture></div></div><div><div><h1>When animals go on long journeys</h1><p>Whether pets or exotics</p></div></div></div></div>';
  const h = dropGonePictures(header);
  assert.ok(!h.includes('capture.png') && h.includes('<h1>When animals go on long journeys</h1>'), h);
  assert.equal(dropGonePictures('<div><p>no picture of the list</p></div>'), '<div><p>no picture of the list</p></div>');
  assert.equal(GONE_PICTURES.length, 4);
});

test('authorLinks: www\'s /content/swiss-magazine/ and /editor.html/ links the public page they mean, else plain text', () => {
  const docs = new Set(['/magazine/en/inside-swiss/swiss-experience/swiss-senses', '/magazine/en/inside-swiss/behind-the-scenes/swiss-wanderlust-not-painted-but-applied', '/magazine/de/inside-swiss/sustainability/aeroshark-how-we-further-reduce-our-carbon-emissions']);
  const doc = [
    '<p><a href="/content/swiss-magazine/en/inside-swiss/swiss-experience/swiss-senses">Senses</a></p>',
    '<p><a href="/content/swiss-magazine/en/inside-swiss/behind-the-scenes/-swiss-wanderlust----not-painted-but-applied">Wanderlust</a></p>',
    '<p><a href="https://www.swiss.com/content/swiss-magazine/de/inside-swiss/sustainability/aeroshark-how-we-further-reduce-our-carbon-emissions">aeroSHARK</a></p>',
    '<p>The <a href="/content/swiss-magazine/en/travel/destinations/Cum%20Pane">Cum Pane</a> bakery</p>',
    '<p><a href="/editor.html/content/dam/swiss-magazine/en/articles/travel/destination/lacma.org">Los Angeles County Museum of Art</a></p>',
  ].join('');
  const out = authorLinks(doc, { docs });
  assert.ok(out.includes('<a href="/magazine/en/inside-swiss/swiss-experience/swiss-senses">Senses</a>'), out);
  assert.ok(out.includes('<a href="/magazine/en/inside-swiss/behind-the-scenes/swiss-wanderlust-not-painted-but-applied">Wanderlust</a>'), out);
  assert.ok(out.includes('<a href="/magazine/de/inside-swiss/sustainability/aeroshark-how-we-further-reduce-our-carbon-emissions">aeroSHARK</a>'), out);
  assert.ok(out.includes('<p>The Cum Pane bakery</p>'), out);
  assert.ok(out.includes('<a href="https://lacma.org">Los Angeles County Museum of Art</a>'), out);
  assert.ok(!/\/content\/swiss-magazine\/|\/editor\.html\//.test(out), out);
});

test('relinkDocument: www links relative where the replica has the page (a magazine page by its document path, the sub-sites\' documents, the main site\'s allowlist), the rest on www', () => {
  const docs = new Set(['/magazine/en/inside-swiss/swiss-worldcargo/from-bern-to-sao-paulo-how-to-ship-a-masterpiece', '/corporate/de/careers/professional-fields/pilots']);
  const sitePaths = new Set(['/ch/en/prepare/baggage/hand-baggage']);
  const doc = [
    '<p><a href="https://www.swiss.com/magazine/en/inside-swiss/swiss-worldcargo/from-bern-to-sao-paulo--how-to-ship-a-masterpiece">masterpiece</a></p>',
    '<p><a href="https://www.swiss.com/corporate/de/careers/professional-fields/pilots">Pilots</a></p>',
    '<p><a href="https://www.swiss.com/lhg/ch/en/o-d/cy-cy/zurich-bristol">Bristol</a></p>',
    '<p><a href="https://www.swiss.com/ch/de/discover/carbon-offsetting">CO2</a></p>',
  ].join('');
  const out = relinkDocument(doc, { docs, sitePaths });
  assert.ok(out.includes('href="/magazine/en/inside-swiss/swiss-worldcargo/from-bern-to-sao-paulo-how-to-ship-a-masterpiece"'), out);
  assert.ok(out.includes('href="/corporate/de/careers/professional-fields/pilots"'), out);
  assert.ok(out.includes('href="https://www.swiss.com/lhg/ch/en/o-d/cy-cy/zurich-bristol"'), out);
  assert.ok(out.includes('href="https://www.swiss.com/ch/de/discover/carbon-offsetting"'), out);
});
