/* eslint-disable import/extensions */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { berlinToUtc } from '../tools/importer/cargo-notifications.mjs';

test('www\'s notification dates (Berlin time) as ISO UTC: summer and winter time, English and German', () => {
  assert.equal(berlinToUtc('16 Sep 26, 11:07'), '2026-09-16T09:07:00.000Z');
  assert.equal(berlinToUtc('16 Sep 26 | 11:07'), '2026-09-16T09:07:00.000Z');
  assert.equal(berlinToUtc('16 Jan 26, 11:07'), '2026-01-16T10:07:00.000Z');
  assert.equal(berlinToUtc('16 Sept. 26, 11:07'), '2026-09-16T09:07:00.000Z');
  assert.equal(berlinToUtc('3 Dez. 25, 08:00'), '2025-12-03T07:00:00.000Z');
  assert.equal(berlinToUtc('soon'), '');
});

// brief 422: the overview page as www's: its breadcrumb (Home > Notifications), the header picture
// where lh-cargo's DA has its copy (else left out: the harness's cargo-assets.mjs downloads it)
test('the overview page: www\'s breadcrumb above the H1 and the Notifications block; the header picture only with a copy in DA', async () => {
  const { parseHTML } = await import('linkedom');
  const { overviewPage } = await import('../tools/importer/cargo-notifications.mjs');
  const { Page } = await import('../tools/importer/cargo-import.mjs');
  const html = '<!DOCTYPE html><html><body><div id="main-content"><img src="/documents/20184/0/notifications-header-4000x1200-min.jpg/fe154888-d75d-f49c-a64c-3f06f4a34c93?t=1" alt=""><div class="portlet-boundary portlet-breadcrumb"><ul class="breadcrumb desktopBreadcrumb"><li><a href="/home">Home </a></li><li><span>Notifications</span></li></ul></div></div></body></html>';
  const { document } = parseHTML(html);
  const doc = overviewPage(document, new Page('/en/notification-overview', 'en', html), 'en');
  assert.match(doc, /^<div><div class="breadcrumb"><div><div><ul><li><a href="\/en\/home">Home<\/a><\/li><li>Notifications<\/li><\/ul><\/div><\/div><\/div><h1>Notifications<\/h1><div class="notifications">/, doc);
  assert.ok(!/notifications-header/.test(doc), 'no copy in DA here: no picture, no link to www');
});

// brief 492: www renamed the header picture (notification-banner.jpg, 1220 x 390, since 2026); the
// harness put its copy into lh-cargo's DA by hand under the importer's own name
// (/media-da/cargo/notification-banner-3196d762.jpg): the overview page finds the current name (and
// the old one) and keeps the picture
test('the overview page: www\'s current header picture (notification-banner) with its copy in DA', async () => {
  const { parseHTML } = await import('linkedom');
  const { overviewPage } = await import('../tools/importer/cargo-notifications.mjs');
  const { Page, useKnownDocs } = await import('../tools/importer/cargo-import.mjs');
  useKnownDocs(['<img src="https://content.da.live/moved-permanently/lh-cargo/media-da/cargo/notification-banner-3196d762.jpg">']);
  const html = '<!DOCTYPE html><html><body><div id="main-content"><img alt="" src="/documents/20184/0/notification-banner.jpg/28f24e01-fed5-631c-923e-91c7fb2f00d5?version=1.0&amp;t=1769526323579"><div class="portlet-boundary portlet-breadcrumb"><ul class="breadcrumb desktopBreadcrumb"><li><a href="/home">Home </a></li><li><span>Notifications</span></li></ul></div></div></body></html>';
  const { document } = parseHTML(html);
  const doc = overviewPage(document, new Page('/en/notification-overview', 'en', html), 'en');
  assert.match(doc, /^<div><p><picture><img src="[^"]*\/media-da\/cargo\/notification-banner-3196d762\.jpg"/, doc);
  useKnownDocs([]);
});
