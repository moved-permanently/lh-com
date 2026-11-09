/* eslint-disable max-len */
/* Brief 506 item 5: the harness held /de/de/speisen-und-getraenke and both travel-classes pages because www's server
   HTML (the market-diff run's, no script run) has no Hero Banner panes: www's JavaScript builds them
   (.hero-container > .hero-item) from the component's data-dcep JSON, which the server HTML carries, and without them
   the cleanup drops the empty component before the hero-banner parser sees it. The hub transformer hub-dcep-render
   (onLoad, before the cleanup's beforeTransform) builds the panes from the JSON in www's rendered markup:
   overlaySubHeadline the tab label, overlayTitle the headline, overlayDescription the text, overlayButtonText /
   overlayButtonLinkTarget the button (secondary, as every rendered one), movingImage the picture (with the renditions'
   srcset www's script writes: the import takes its largest), transparentOverlay
   the overlay. Checked on the Bright Data captures (lh-bd-ema-004 / -005): JSON and rendered panes agree field for
   field, and an import of the capture with its panes removed equals the capture's import.
   Run: node --test test/hub-dcep-hero-banner-506.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { default: render } = await import('../tools/importer/transformers/hub-dcep-render.js');

const AEM = '/content/lh/markets/de/en/prepare-for-your-trip/travel-classes/';
const IMG = '/content/dam/lh/images/local_images/prepare-for-your-trip/travel-classes/travel_classes_main_page_accordeon_';
const json = JSON.stringify({
  id: 'x',
  transparentOverlay: '#6F625A',
  initialAnimationText: '',
  panes: [
    {
      movingImage: { imageUrl: `${IMG}01.jpg`, videoUrl: null, alt: null }, overlayTitle: 'Lufthansa First Class', overlayDescription: 'Maximum privacy – exclusive service.', overlayButtonText: 'Explore luxury', overlayButtonLinkTarget: `${AEM}first-class`, overlaySubHeadline: 'First Class',
    },
    {
      movingImage: { imageUrl: `${IMG}02.jpg`, videoUrl: null, alt: 'Seat' }, overlayTitle: 'Genussmomente', overlayDescription: null, overlayButtonText: 'Menüs entdecken', overlayButtonLinkTarget: `${AEM}business-class`, overlaySubHeadline: 'Business Class',
    },
  ],
}).replace(/"/g, '&quot;');

const page = (inner) => parseHTML(`<html><body><div class="herobanner section"><div class="dcep-hero-banner" data-dcep="${json}">${inner}</div></div></body></html>`).document;
const panes = (document) => [...document.querySelectorAll('.hero-item')].map((it) => ({
  label: it.querySelector('h2.hero-subheading > button.hero-accordion-header-button').textContent,
  img: it.querySelector('.moving-image img').getAttribute('src'),
  srcset: it.querySelector('.moving-image img').getAttribute('srcset'),
  alt: it.querySelector('.moving-image img').getAttribute('alt'),
  overlay: it.querySelector('.transparent-overlay').getAttribute('style'),
  headline: it.querySelector('.hero-items-contents > h3.hero-header').textContent,
  text: [...it.querySelectorAll('.hero-items-contents > p.hero-paragraph')].map((p) => p.textContent),
  button: [it.querySelector('maui-button-link.hero-button').getAttribute('href'), it.querySelector('maui-button-link.hero-button').getAttribute('label'), it.querySelector('maui-button-link.hero-button').getAttribute('type')],
}));

test('server HTML: the panes www\'s JavaScript renders, built from data-dcep in its markup', () => {
  const document = page('');
  render('onLoad', document.body, { document });
  assert.deepEqual(panes(document), [
    {
      label: 'First Class', img: `${IMG}01.jpg`, srcset: [2560, 1440, 720, 360].map((w) => `${IMG}01.jpg.transform/lh-dcep-transform-width-${w}/img.jpg ${w}w`).join(','), alt: '', overlay: '--transparent-overlay-color: #6F625A', headline: 'Lufthansa First Class', text: ['Maximum privacy – exclusive service.'], button: [`${AEM}first-class`, 'Explore luxury', 'secondary'],
    },
    {
      label: 'Business Class', img: `${IMG}02.jpg`, srcset: [2560, 1440, 720, 360].map((w) => `${IMG}02.jpg.transform/lh-dcep-transform-width-${w}/img.jpg ${w}w`).join(','), alt: 'Seat', overlay: '--transparent-overlay-color: #6F625A', headline: 'Genussmomente', text: [''], button: [`${AEM}business-class`, 'Menüs entdecken', 'secondary'],
    },
  ]);
});

test('a capture with rendered panes, a component without JSON, other hooks: left alone', () => {
  const rendered = page('<div class="hero-container"><div class="hero-item"><h2 class="hero-subheading"><button class="hero-accordion-header-button">Own</button></h2></div></div>');
  render('onLoad', rendered.body, { document: rendered });
  assert.equal(rendered.querySelectorAll('.hero-item').length, 1);
  const bare = parseHTML('<html><body><div class="herobanner"><div class="dcep-hero-banner"></div></div></body></html>').document;
  render('onLoad', bare.body, { document: bare });
  assert.equal(bare.querySelectorAll('.hero-item').length, 0);
  const later = page('');
  render('beforeTransform', later.body, { document: later });
  assert.equal(later.querySelectorAll('.hero-item').length, 0);
});

test('the hub template runs it (page-templates.json, import-hub.js)', async () => {
  const fs = await import('node:fs');
  const t = JSON.parse(fs.readFileSync('tools/importer/page-templates.json', 'utf8'));
  const hub = (t.templates || t).find((x) => x.name === 'hub');
  // before campaign-sections, whose onLoad converts the separators of the sections that aren't empty (the hero's AEM
  // section is until the panes are there: its 40px separator went, /de/de/speisen-und-getraenke)
  assert.ok(hub.transformers.indexOf('hub-dcep-render') === 0 && hub.transformers.includes('campaign-sections'));
  assert.ok(fs.readFileSync('tools/importer/import-hub.js', 'utf8').includes('const transformers = [lufthansaCleanupTransformer, lufthansaSectionsTransformer, hubDcepRenderTransformer, campaignSectionsTransformer,'));
  assert.ok(/import hubDcepRenderTransformer from '\.\/transformers\/hub-dcep-render\.js';/.test(fs.readFileSync('tools/importer/import-hub.js', 'utf8')));
});
