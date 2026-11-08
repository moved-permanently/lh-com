/* eslint-disable max-len, import/extensions, import/no-relative-packages */
/* Style markers in the app JSON of web pages (the brief after 484, item A): the "{…}" markers the importer writes into
   content (scripts/style-markers.js, shared with the site) stay out of the text lh-edge sends; a paragraph of markers only
   is no text item, one with a picture an image (the parallax articles' images came back as text "{parallax}"). Data
   placeholders ({origin}, {COUNT}) and regex quantifiers ({1,3}) are content and stay.
   Fixtures: the documents of /de/en/traveltricks and /de/en/articles/explore-the-world/picture-perfect-austin
   (lufthansa.turnsthe.page's .plain.html of 2026-11-08). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webModel, renderWeb } from '../src/sdui-web.js';
import { stripStyleMarkers, stripStyleMarkersHtml, isOnlyStyleMarkers } from '../../../../scripts/style-markers.js';

const read = (name) => fs.readFileSync(new URL(`./fixtures/sdui-web/${name}`, import.meta.url), 'utf8');
const MARKER = /\{(?:heading-|copytext-|full-width|limited-width|column-|caption|parallax|narrow|indent-|spacer-|divider-|autoplay|muted|loop|controls|mobile|blank)[^}]*\}/;
const render = (html, page) => {
  const model = webModel(html, page);
  const json = renderWeb(model, {
    fullPath: `/content/lh/markets${page}`, page, version: 'v2', host: 'lh-edge.example', title: 't', lang: 'en',
  });
  return { model, json: JSON.stringify(json) };
};

test('the shared list: every kind the site reads, combinations included; placeholders stay', () => {
  assert.equal(stripStyleMarkers('within Europe now {full-width}'), 'within Europe now');
  assert.equal(stripStyleMarkers('Travel tricks {heading-large column-start-outer}'), 'Travel tricks');
  assert.equal(stripStyleMarkers('{column-end-outer}'), '');
  assert.equal(stripStyleMarkers('/content/dam/video.mp4 {autoplay muted loop}'), '/content/dam/video.mp4');
  assert.equal(stripStyleMarkers('{spacer-25}'), '');
  assert.equal(stripStyleMarkers('{divider-40 from-768}'), '');
  assert.equal(stripStyleMarkers('Fly {copytext-small full-width} {column-end}'), 'Fly');
  assert.equal(stripStyleMarkers('{mobile}'), '');
  assert.equal(stripStyleMarkers('{blank}'), '');
  assert.equal(stripStyleMarkers('From {origin} to {destination}'), 'From {origin} to {destination}');
  assert.equal(stripStyleMarkers('{COUNT} results'), '{COUNT} results');
  assert.equal(stripStyleMarkers('Page {lang}'), 'Page {lang}');
  assert.equal(stripStyleMarkers('^[0-9]{1,3}$'), '^[0-9]{1,3}$');
  assert.equal(stripStyleMarkers('{origin}'), '{origin}');
  assert.equal(stripStyleMarkersHtml('<a href="/x">More</a> now {full-width}'), '<a href="/x">More</a> now');
  assert.equal(stripStyleMarkersHtml('<li>Last {full-width}</li></ul>'), '<li>Last</li></ul>');
  assert.equal(stripStyleMarkersHtml('<sub>{blank}</sub>'), '<sub></sub>');
  assert.ok(isOnlyStyleMarkers(' {column-end-outer} '));
  assert.ok(!isOnlyStyleMarkers('{origin}'));
});

test('/de/en/traveltricks: no marker text, no text item of markers only', () => {
  const { model, json } = render(read('traveltricks.plain.html'), '/de/en/traveltricks');
  assert.ok(!MARKER.test(json), json.match(MARKER) && json.match(MARKER)[0]);
  const items = [...model.header, ...model.body];
  assert.ok(items.every((i) => i.kind !== 'text' || i.html.replace(/<[^>]+>/g, '').trim()), 'no empty text item');
  assert.ok(items.some((i) => i.kind === 'headline' && /Travel/i.test(i.html)), 'the headline is kept');
});

test('/de/en/articles/explore-the-world/picture-perfect-austin: the parallax pictures are images again', () => {
  const html = read('picture-perfect-austin.plain.html');
  const parallax = (html.match(/<\/picture>\s*\{parallax\}/g) || []).length;
  assert.ok(parallax >= 5, String(parallax));
  const { model, json } = render(html, '/de/en/articles/explore-the-world/picture-perfect-austin');
  assert.ok(!MARKER.test(json), json.match(MARKER) && json.match(MARKER)[0]);
  assert.ok(model.body.filter((i) => i.kind === 'image').length >= parallax, `${model.body.filter((i) => i.kind === 'image').length} images`);
});

test('a placeholder in text reaches the app as it is', () => {
  const { json } = render('<div><p>Flights from {origin} from {price} EUR {copytext-small}</p></div>', '/de/en/x');
  assert.match(json, /Flights from \{origin\} from \{price\} EUR/);
  assert.ok(!/copytext-small/.test(json));
});
