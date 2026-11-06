/* eslint-disable max-len, import/extensions */
/* Lufthansa Cargo's importer (tools/importer/cargo-import.mjs), brief 425 (cargo rows 10-12): the
   homepage's components as www's (cargo-parity-001; the delivery snapshot's markup, trimmed):
   - the stage slider (.rHomeSlider .owl-item): one hero-campaign (slider), a picture row and a text
     row per slide, the first headline the H1, the others H2; the section goes on to the widget;
   - the widget (.service-widget): cards-icon (widget) and the Track form in the stage's section,
     the next section after them;
   - Latest news (.latestNewsHome): the heading, news-feed with the pressroom list www's script
     reads, then "Read all news";
   - the bands: infrastructure columns-media (band, gradient, stats) (its text a row, then the
     counters beside the map), products (band, dark, features) (the heading and "Explore all" its
     first row), about (band, dark, facts).
   Runs without content-sites/ (links to pages may stay www's there). Run:
   node --max-old-space-size=512 --test test/cargo-import-425.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { convert } from '../tools/importer/cargo-import.mjs';

const FEED = 'https://www.mynewsdesk.com/services/pressroom/list/pDlKMlDl6sSs1cRgYqlHHw/?format=json&amp;type_of_media=pressrelease&amp;limit=6&amp;order=published';
const slide = (img, head, sub, href) => `<div class="owl-item"><div class="slideItem"><div class="slideBg" data-desktop="/documents/20184/24770/${img}/f731c294?t=1"></div><div class="fullWidthInnerWrapper"><div class="slideOverlay themeWhite"><div class="slideContent"><h1 class="slideHeadline"><p><strong>${head}</strong></p></h1><h3 class="slideSubline"><p>${sub}</p></h3><p><a class="more btn1" href="${href}">Explore more</a></p></div></div></div></div></div>`;
const tab = (cls, label) => `<li class="nav-item tab"><a href="#${cls}" class="nav-link ${cls}"><img alt="" src="/o/eportal-theme/images/sprites/sprite-sheets/sprite-homepage-tabs.svg"><span>${label}</span></a></li>`;
const HOME = `<!DOCTYPE html><html lang="en-US"><head><title>Your expert for air freight - Lufthansa Cargo</title></head><body><div id="content" class="container pagebody"><div class="columns-1 eportal-home-template">
<div class="portlet-layout homeSliderWrapper"><div class="journal-content-article"><div class="rHomeSlider"><div class="owl-carousel"><div class="owl-stage">
${slide('Emergency.webp', 'Boost your booking: Add-on Service Emergency.', 'Your absolute-priority with Money-back Guarantee.', '/en/emergency')}
${slide('eAWB.webp', 'eAWB Data Capture', 'Increase your efficiency with our revamped eService.', '/en/eservices/eawb')}
${slide('eBooking.jpg', 'New eBooking', 'Smart Offers. Intuitive bookings. Tailored for you.', '/en/ebooking-info')}
</div></div></div></div></div>
<div class="portlet-layout eportal-home-template-service-row"><div class="journal-content-article"><div class="whiteBgBox py-0"><div class="service-widget rNavTabs"><ul class="nav nav-tabs">${tab('book', 'Booking')}${tab('track', 'Track')}${tab('schedule', 'Schedule')}${tab('stations', 'Stations')}</ul>
<form name="etrk-tracking-form"><input id="etrk_awbp" aria-label="AWB Prefix" value="020"><label class="control-label">Air waybill number</label><button id="etrk_awbsearch">Search</button></form></div></div></div></div>
</div>
<div class="portlet-layout eportal-home-template-tile-row"><div class="journal-content-article"><div class="fullWidthInnerWrapper whiteBgBox"><div class="latestNewsHome"><h2 class="latestNewsTitle"> Latest news </h2><div class="newsCardsContainer" id="autoNewsroomHomeContainer"></div><div class="readAllWrapper"><a id="readAllNewsLink" class="readAllNews" href="/en/newsroom">Read all news</a></div></div></div>
<script>$(document).ready(function () { var apiUrl = "${FEED}"; var readMoreText = "Read more"; });</script></div>
<div class="journal-content-article"><div class="infraWrapper"><div class="whiteBgBox"><div class="infraInner"><h2 class="infraEyebrow">Infrastructure</h2><h3 class="infraTitle">Hundreds of stations. Countless opportunities.</h3><p class="infraText">Whether it's huge quantities or a single spare part.</p></div>
<div class="contentMapWrapper"><div class="infraStatSection"><div class="infraStatsMain"><div class="infraStat"><div class="infraStatText"><h3 class="infraStatValue">350+</h3><h3 class="infraStatLabel">Stations worldwide</h3></div></div></div>
<div class="infraRegions"><div class="infraRow"><div class="infraRegion"><div class="infraRegionTop"><h3 class="infraRegionValue">60+</h3><div class="infraRegionLabel"><span>Stations in</span> <span class="bold">North America</span></div></div></div></div></div></div>
<div class="infraCol infraColRight"><div class="infraMap"><img class="infraMapImg" src="/documents/20184/0/map.png/abc" alt="Global station network map"></div></div></div></div></div></div>
<div class="journal-content-article"><div class="ourProducts"><div class="whiteBgBox"><h2>Our Products, Speeds and Add-on Services offer</h2><a class="lcagLink" href="/en/portfolio"> Explore all </a>
<div class="productBlock"><div class="info"><h2>Products</h2><p>Your cargo - our expertise for every commodity</p><a href="/en/portfolio#Products">Explore Products</a></div><div class="features"><ul><li><a href="/en/general-cargo"><span class="icon iconCargo"></span><small>General Cargo</small></a></li></ul></div></div>
<div class="speedBlock"><div class="info"><h2>Speeds</h2><p>To your destination</p></div><div class="features"><ul><li><a href="/en/td-pro"><span class="icon iconTdPro"></span><small>td.Pro</small></a></li></ul></div></div></div></div></div>
<div class="journal-content-article"><div class="aboutWrapper whiteBgBox px-0"><div class="contentAbout"><div class="overlay whiteBgBox"><div class="contentWrapper"><div class="aboutHeroHeader"><h2 class="aboutHeroTitle">About Lufthansa Cargo</h2><p class="aboutHeroLead">Lufthansa Cargo is one of the world's leading cargo airlines.</p></div>
<div class="keyFacts"><h4 class="keyFactsTitle">Key Facts</h4><ul class="keyFactsList"><li class="keyFactsItem"><span class="keyFactsValue">4,322</span><span class="keyFactsLabel">employees</span></li></ul><a href="/en/ci/whats-up-now">Read more</a></div></div></div></div></div></div>
</div></div></body></html>`;

const { html } = convert(HOME, '/en/home', 'en');
const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${html.match(/<main>([\s\S]*)<\/main>/) ? html.match(/<main>([\s\S]*)<\/main>/)[1] : html}</main></body></html>`);
const sections = [...document.querySelector('main').children];
const text = (n) => (n ? n.textContent.replace(/\s+/g, ' ').trim() : '');
const rowsOf = (b) => [...b.children].map((r) => [...r.children]);

test('the stage: one hero-campaign (slider), a picture row and a text row per slide; the widget in its section', () => {
  const stage = sections[0];
  const slider = stage.querySelector(':scope > .hero-campaign.slider');
  assert.ok(slider, html.slice(0, 600));
  const rows = rowsOf(slider);
  assert.equal(rows.length, 6);
  [0, 2, 4].forEach((i) => assert.ok(rows[i][0].querySelector('picture img'), `slide ${i / 2 + 1}'s picture`));
  assert.equal(text(rows[1][0].querySelector('h1')), 'Boost your booking: Add-on Service Emergency.');
  assert.deepEqual([rows[3], rows[5]].map((r) => text(r[0].querySelector('h2'))), ['eAWB Data Capture', 'New eBooking']);
  assert.equal(document.querySelectorAll('h1').length, 1);
  assert.ok(!document.querySelector('.cards-teaser.overlay'), 'no slide as a card any more');
  const widget = stage.querySelector(':scope > .cards-icon.widget');
  assert.ok(widget, 'the widget in the stage\'s section');
  assert.deepEqual(rowsOf(widget).map((r) => text(r[1])), ['Booking', 'Track', 'Schedule', 'Stations']);
  assert.ok(widget.nextElementSibling.classList.contains('booking-lookup'), 'the Track form right after the tabs');
  assert.equal(stage.lastElementChild, widget.nextElementSibling, 'the section ends with the form');
});

test('Latest news: the heading, the feed www reads, "Read all news"', () => {
  const news = sections[1];
  const h2 = news.querySelector(':scope > h2');
  assert.equal(text(h2), 'Latest news');
  const feed = h2.nextElementSibling;
  assert.ok(feed.classList.contains('news-feed'));
  const [[key, value]] = rowsOf(feed);
  assert.equal(text(key), 'Feed');
  assert.equal(value.querySelector('a').getAttribute('href'), FEED.replace(/&amp;/g, '&'));
  assert.equal(text(feed.nextElementSibling), 'Read all news');
  assert.ok(!/mynewsdesk\.com"/.test(news.innerHTML.replace(/https:\/\/www\.mynewsdesk\.com\/services[^"]*"/g, '')), 'no newsroom stand-in link with the feed');
});

test('the bands: infrastructure, products and about as columns-media options, their headings inside', () => {
  const infra = document.querySelector('.columns-media.band.gradient.stats');
  assert.ok(infra);
  const [head, counters] = rowsOf(infra);
  assert.equal(head.length, 1);
  assert.equal(text(head[0].querySelector('h2')), 'Infrastructure');
  assert.equal(counters.length, 2);
  assert.match(text(counters[0]), /350\+ Stations worldwide.*60\+ Stations in North America/);
  assert.ok(counters[1].querySelector('img[alt="Global station network map"]'), 'the map beside the counters');
  const products = document.querySelector('.columns-media.band.dark.features');
  const prows = rowsOf(products);
  assert.equal(prows[0].length, 1);
  assert.equal(text(prows[0][0].querySelector('h2')), 'Our Products, Speeds and Add-on Services offer');
  assert.equal(text(prows[0][0].querySelector('a')), 'Explore all');
  assert.deepEqual(prows.slice(1).map((r) => text(r[0].querySelector('h2'))), ['Products', 'Speeds']);
  assert.ok(!products.previousElementSibling || text(products.previousElementSibling) !== 'Our Products, Speeds and Add-on Services offer', 'the heading not before the block any more');
  const about = document.querySelector('.columns-media.band.dark.facts');
  assert.ok(about);
  const [[lead, facts]] = rowsOf(about);
  assert.equal(text(lead.querySelector('h2')), 'About Lufthansa Cargo');
  assert.equal(text(facts.querySelector('li')), '4,322 employees');
});
