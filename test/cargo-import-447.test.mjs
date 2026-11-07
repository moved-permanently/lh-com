/* eslint-disable max-len, import/extensions */
/* Lufthansa Cargo's importer (tools/importer/cargo-import.mjs), brief 447, item 2 (ema-adobe's brief
   440 notes): the homepage's Infrastructure band (www's .infraWrapper: the counters and the station
   map as a picture) without the "Show the map on www.lufthansa-cargo.com" link the documents had
   under the counters (68 px at 390, not on www: the band has no Google map); a page with www's
   Google map (googleMapsOverlayConsent) keeps its link to the page on www.
   The markup is www's (the delivery snapshot of /en/home).
   Run: node --max-old-space-size=512 --test test/cargo-import-447.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const SPRITE = '/documents/20184/0/sprite-infra-homepage+%281%29.svg/1ade10d7-3e31-dcbb-8bb5-ead15ed8c244';
const infra = `<div class="infraWrapper" aria-labelledby="infra-title"> <div class="whiteBgBox"> <div class="infraInner"> <h2 class="infraEyebrow">Infrastructure</h2> <h3 id="infra-title" class="infraTitle"> Hundreds of stations. Countless opportunities. </h3> <p class="infraText">We bring your cargo to more than 350 destinations.</p> <a class="lcagLink hyperlinkIcon navigational" href="/en/network/maps/stations" tabindex="0"> <span>Find out more</span> </a> </div> <div class="contentMapWrapper"> <div class="infraStatSection"> <div class="infraStatsMain" role="list"> <div class="infraStat" role="listitem"> <img src="${SPRITE}" class="infraStatIcon Earth_A" alt=""> <div class="infraStatText"> <h3 class="infraStatValue">350+</h3> <h3 class="infraStatLabel">Stations worldwide</h3> </div> </div> </div> <div class="infraRegions" role="list"> <div class="infraRow" role="list"> <div class="infraRegion" role="listitem"> <img src="${SPRITE}" class="infraRegionIcon Map_North_America" alt=""> <div class="infraRegionTop"> <h3 class="infraRegionValue">60+</h3> <div class="infraRegionLabel"> <span class="labelPrefix">Stations in</span> <span class="labelPrefix bold">North America</span> </div> </div> </div> </div> </div> </div> </div> </div> </div>`;
const page = (body) => `<!DOCTYPE html><html><head><title>Lufthansa Cargo</title></head><body><div id="main-content"><div class="journal-content-article"><h1>Lufthansa Cargo</h1></div>${body}</div></body></html>`;

test('the Infrastructure band: its counters and regions, no link to a map on www', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  [['en', 'Show the map on www.lufthansa-cargo.com'], ['de', 'Karte auf www.lufthansa-cargo.com anzeigen']].forEach(([lang, label]) => {
    const { html } = convert(page(infra), `/${lang}/home`, lang);
    assert.match(html, /<li><strong>350\+<\/strong> Stations worldwide<\/li>/, html);
    assert.match(html, /<li><strong>60\+<\/strong> Stations in<br>North America<\/li>/);
    assert.equal(html.includes(label), false, `no "${label}"`);
  });
});

test('a page with www\'s Google map keeps its link to the page on www', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const { html } = convert(page('<div class="googleMapsOverlayConsent"><p>Accept the cookies to see the map</p></div>'), '/en/network/maps/stations', 'en');
  assert.match(html, /<p><a href="https:\/\/www\.lufthansa-cargo\.com\/en\/network\/maps\/stations">Show the map on www\.lufthansa-cargo\.com<\/a><\/p>/, html);
});

// www's service widget, reduced: the four tabs, the open Booking tab (its create and update forms)
// and the Track tab's form; the footer's "Frequently used" link names the Track tab
const widget = (lang, create) => `<div class="service-widget rNavTabs"> <div class="service-widget-left-tab"> <ul class="nav nav-tabs" role="tablist"> <li class="nav-item tab active"><a href="#book" class="nav-link book active"><span>Booking</span></a></li> <li class="nav-item tab"><a href="#track" class="nav-link track"><span>Track</span></a></li> <li class="nav-item tab"><a href="#schedule" class="nav-link schedule"><span>Schedule</span></a></li> <li class="nav-item tab"><a href="#stations" class="nav-link stations"><span>Stations</span></a></li> </ul> <div id="content" class="tab-content"> <div id="book" class="card tab-pane fade show active"> <div class="bookTabContent"> <div class="createBookingDiv"> <form action="/${lang}/ebooking/booking/basic-information" name="create-booking-form" method="POST" class="row"> <input name="bookingOrigin" id="bookingOriginInputField"> <button class="btn btn-primary m-0" id="bookingSearchButton"> <img alt="" src="/o/x.svg"> ${create} </button> </form> </div> <div class="updateBookingDiv"> <form action="/${lang}/ebooking/booking/confirmation" name="update-booking-form" method="POST"> <button class="btn btn-secondary small m-0" id="updateBookingButton">Update booking</button> <a href="/my-dashboard" class="lcagLink hyperlinkIcon navigational medium" tabindex="0"> eBooking dashboard </a> </form> </div> </div> </div> <div id="track" class="card tab-pane fade show"> <form action="/${lang}/eservices/etracking/tracking/" name="etrk-tracking-form"> <input id="etrk_awbp" aria-label="AWB Prefix" value="020"> <label class="control-label">Air waybill number</label> <button id="etrk_awbsearch">Search</button> </form> </div> </div> </div> </div><div class="footerLinkSection"><a href="/${lang}/eservices/etracking">Track your shipment</a></div>`;

test('the service widget opens on www\'s Booking tab: its create button and dashboard link, then the Track tab\'s form', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  [['en', 'Create booking'], ['de', 'Buchung erstellen']].forEach(([lang, create]) => {
    const { html } = convert(page(widget(lang, create)), `/${lang}/home`, lang);
    // the form tab's panel (booking-lookup tracking shows it above the form, inside the card)
    const expected = `<div><div>Tab</div><div>Track your shipment</div></div><div><div>Panel</div><div><p><strong><a href="https://www.lufthansa-cargo.com/${lang}/ebooking/booking/basic-information">${create}</a></strong></p><p><a href="https://www.lufthansa-cargo.com/my-dashboard">eBooking dashboard</a></p></div></div>`;
    assert.ok(html.includes(expected), html);
    assert.ok(html.includes('<div><div>Default prefix</div><div>020</div></div>'), 'the tracking form as before');
  });
});

test('a widget without www\'s booking form keeps the tracking form alone', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const { html } = convert(page(widget('en', 'Create booking').replace(/<div class="bookTabContent">[\s\S]*?<\/div> <\/div> <\/div> <div id="track"/, '</div> <div id="track"')), '/en/home', 'en');
  assert.equal(html.includes('<div>Panel</div>'), false, html);
  assert.ok(html.includes('<div><div>Tab</div><div>Track your shipment</div></div>'));
});
