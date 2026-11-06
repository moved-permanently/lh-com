/* eslint-disable max-len, import/extensions */
/* Lufthansa Cargo's importer (tools/importer/cargo-import.mjs), brief 442, item 1: the homepage's
   ULD teaser (www's .teaserULD, one <picture>: Teaser-ULD-Mobile@2x.jpg up to 767 px, the desktop
   picture from 768 px) as hero-card-overlay (plain) with both pictures in its picture cell, the
   desktop one first, the phone one second (hero-card-overlay takes a Cargo cell's second picture
   below 768 px: ema-adobe's 3c4c099, test/cargo-uld-phone.test.mjs). Before, the import wrote the
   desktop picture only and a re-import dropped the phone picture the documents carry.
   The markup is www's (cargo-parity-001 and the delivery snapshot of /en/home).
   Run: node --max-old-space-size=512 --test test/cargo-uld-import-442.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const MOBILE = '/documents/20184/0/Teaser-ULD-Mobile%402x.jpg/d2793e55-2c8f-ab6b-8276-eb6fcd0dd0c3';
const DESKTOP = '/documents/20184/0/Teaser-ULD-Desktop%402x.jpg/03ed095e-7ebc-23d8-a378-0474bcaede39';
const teaser = (sources) => `<div class="teaserULD"> <picture> ${sources} <img src="${DESKTOP}?t=1776617616197" loading="lazy" alt="Teaser ULD"> </picture> <div class="overlay whiteBgBox"> <h3 class="subtitle">The right ULDs for every cargo</h3> <h2>We carry more than 30 different types of ULDs on your behalf</h2> <a href="/en/fleet-ulds/ulds" class="lcagLink navigational hyperlinkIcon" tabindex="0">Find your perfect ULD</a> </div> </div>`;
const page = (body) => `<!DOCTYPE html><html><head><title>Lufthansa Cargo</title></head><body><div id="main-content"><div class="journal-content-article"><h1>Lufthansa Cargo</h1></div>${body}</div></body></html>`;
const cell = (html) => (html.match(/<div class="hero-card-overlay plain"><div><div>([\s\S]*?)<\/div><\/div>/) || [])[1] || '';

test('the ULD teaser: its picture cell holds the desktop picture, then www\'s phone picture (up to 767 px)', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const sources = `<source media="(max-width: 767px)" srcset="${MOBILE}?t=1776617638274"> <source media="(min-width: 768px)" srcset="${DESKTOP}?t=1776617616197">`;
  const { html } = convert(page(teaser(sources)), '/en/home', 'en');
  const pics = [...cell(html).matchAll(/<picture><img src="([^"]+)" alt="([^"]*)"><\/picture>/g)];
  assert.equal(pics.length, 2, html);
  assert.match(pics[0][1], /teaser-uld-desktop|Teaser-ULD-Desktop/i);
  assert.equal(pics[0][2], 'Teaser ULD');
  assert.match(pics[1][1], /teaser-uld-mobile|Teaser-ULD-Mobile/i);
  assert.equal(pics[1][2], '', 'the phone picture without alt text (the same picture)');
});

test('a teaser whose picture has no phone source keeps its one picture', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const { html } = convert(page(teaser(`<source media="(min-width: 768px)" srcset="${DESKTOP}">`)), '/en/home', 'en');
  assert.equal((cell(html).match(/<picture>/g) || []).length, 1, html);
});
