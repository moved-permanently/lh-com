/* eslint-disable max-len, import/extensions */
/* Lufthansa Cargo's importer (tools/importer/cargo-import.mjs), the parity sweep after brief 470
   (cargo-parity-001's eBooking page, rows 31 and 32 of tools/reports/cargo/parity.md):
   - a video fragment's own heading (h2.videoHeading, "Introduction video to our new eBooking")
     comes before its block;
   - www's text one third with a video instead of a picture (CF8, its div without the
     Text-Image class: "Boost your booking with Add-on Services") is one columns-media
     (wide-media), the video first as www's; on www's navy band (blue-background) in a section of
     style navy.
   Run: node --max-old-space-size=512 --test test/cargo-import-471.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const band = (cls, body) => `<div class="lfr-layout-structure-item-structure-type-1-fragment"><div class="Structure_type_1_fragment"><div class="fullWidthFragmentContainer ${cls}"><div class="fullWidthFragmentInnerContainer"><div class="fragmentWrapper"><div class="row"><div class="col col-lg-12">${body}</div></div></div></div></div></div></div>`;
const videoFragment = (heading, src) => `<div class="lfr-layout-structure-item-video---cf16"><div class="videoWrapper">${heading ? `<h2 class="videoHeading"><div> ${heading} </div></h2>` : ''}<div class="videoDropzone"><div class="video"><div class="video-container"><video controls="" preload="metadata"><source src="${src}"></video></div><div class="video-overlay" style="background-image: url(/documents/20184/1/cover.png/x)"><div class="video-button"></div></div></div></div></div></div>`;
const page = (body) => `<!DOCTYPE html><html><head><title>New eBooking - Lufthansa Cargo</title></head><body><div id="main-content"><div class="Introduction-CF1"><h1>New eBooking</h1></div>${body}</div></body></html>`;

test('row 31: a video fragment\'s heading (h2.videoHeading) as an h2 before its columns-media', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const { html } = convert(page(band('grey-background odd', videoFragment('Introduction video to our new eBooking', 'https://static.lufthansa-cargo.com/videos/intro.mp4'))), '/en/ebooking-info', 'en');
  const h = html.indexOf('<h2>Introduction video to our new eBooking</h2>');
  const v = html.indexOf('class="columns-media"');
  assert.ok(h > -1, `the heading kept: ${html.slice(0, 600)}`);
  assert.ok(v > h, 'before the video block');
  assert.ok((html.match(/Introduction video to our new eBooking/g) || []).length === 1, 'once');
});

test('row 32: www\'s CF8 text one third with a video, on the navy band: section navy, one columns-media (wide-media), the video first, the text beside it', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const cf8 = `<div class="lfr-layout-structure-item-text--one-third--right-image-left--horizontal----cf8"><div class="mobile-mt-20 marginTopMobile text-one-third"><div class="row"><div class="col-md-8 image-section"><div>${videoFragment('', 'https://static.lufthansa-cargo.com/videos/addon.mp4')}</div></div><div class="col-md-4 content-section"><h3><div> Boost your booking with Add-on Services </div></h3><div class="paragraph-div"><ul><li><p>Fully integrated into eBooking.</p></li></ul></div><div class="fragmentLink d-flex"><span class="lcagLink"><div><a href="/en/ebooking">Explore Add-on Services in eBooking</a></div></span></div></div></div></div></div>`;
  const { html } = convert(page(band('blue-background white-background even', cf8)), '/en/ebooking-info', 'en');
  const block = html.match(/<div class="columns-media wide-media">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/);
  assert.ok(block, `one columns-media (wide-media): ${html}`);
  const cells = block[0];
  assert.ok(cells.indexOf('addon.mp4') > -1 && cells.indexOf('Boost your booking') > cells.indexOf('addon.mp4'), 'the video first, the text in the same row');
  assert.ok(/Explore Add-on Services in eBooking/.test(cells), 'the link in the text cell');
  assert.ok(/<div class="section-metadata"><div><div>Style<\/div><div>navy<\/div><\/div><\/div>/.test(html), `the navy band as section style navy: ${html.slice(-400)}`);
});
