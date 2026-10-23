/* eslint-disable */
/* global WebImporter */

/**
 * Shared by parsers (not a block parser): the authored nodes of Lufthansa video viewers and
 * embeds, as blocks/columns-media, carousel-cards, accordion-columns and embed read them
 * (scripts/media.js).
 */

const ZW = /[​-‍﻿]/g;
const clean = (s) => (s || '').replace(ZW, '').replace(/\s+/g, ' ').trim();
const isBroken = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src);

/**
 * Paragraph with the link to the .mp4 and, after it, the source's playback settings as a
 * marker ("{autoplay muted loop}", "{controls round-play-button}").
 */
export function videoPara(document, src, label, settings) {
  const a = document.createElement('a');
  a.setAttribute('href', src);
  a.textContent = label || src;
  const p = document.createElement('p');
  p.append(a);
  if (settings.length) p.append(` {${settings.join(' ')}}`);
  return p;
}

/**
 * Video viewer (.videoViewer: video.js, poster, round play button in the middle, controls):
 * [poster img, p(link + settings)], or [] without a video. The video and poster come from the
 * data-dcep JSON (also when the snapshot caught the viewer before its player loaded).
 */
export function viewerNodes(comp, document) {
  const host = comp.matches('[data-dcep]') ? comp : comp.querySelector('[data-dcep]');
  let cfg = {};
  try { cfg = JSON.parse(host.getAttribute('data-dcep')); } catch (e) { cfg = {}; }
  const video = comp.querySelector('video[src], video source[src]');
  const src = clean(cfg.videoSrc || (video && video.getAttribute('src')));
  if (!src) return [];
  const out = [];
  const posterImg = comp.querySelector('.vjs-poster img[src]');
  const poster = clean(cfg.thumbnailSrc || (posterImg && posterImg.getAttribute('src')));
  if (poster && !isBroken(poster)) {
    const img = document.createElement('img');
    img.setAttribute('src', poster);
    img.setAttribute('alt', clean(cfg.alternativeText));
    out.push(img);
  }
  const settings = [];
  if (cfg.autoplay === true || cfg.autoplay === 'true') settings.push('autoplay', 'muted');
  settings.push('controls', 'round-play-button');
  out.push(videoPara(document, src, clean(cfg.alternativeText), settings));
  return out;
}

/**
 * The embed URL of a Lufthansa video (.video .video-player: YouTube iframe) or iframe
 * component (.iframe .iframe-wrapper: in-flight entertainment widget); '' for other iframes.
 * YouTube: https://www.youtube-nocookie.com/embed/{id} (start kept when not 0; the live player
 * parameters color/rel are the block's defaults, origin is the live site's). In-flight
 * entertainment: the widget URL as on live (id, type, lang).
 */
export function embedUrl(comp) {
  const iframe = comp.matches('iframe') ? comp : comp.querySelector('iframe[src]');
  if (!iframe) return '';
  let url;
  try { url = new URL(iframe.getAttribute('src'), 'https://www.lufthansa.com/'); } catch (e) { return ''; }
  if (/(^|\.)youtube(-nocookie)?\.com$/.test(url.hostname)) {
    const m = url.pathname.match(/^\/embed\/([\w-]+)/);
    if (!m) return '';
    const out = new URL(`https://www.youtube-nocookie.com/embed/${m[1]}`);
    const start = parseInt(url.searchParams.get('start') || '', 10);
    if (start > 0) out.searchParams.set('start', start);
    return out.href;
  }
  if (url.hostname === 'www.lufthansa-inflightentertainment.com' && /\/widgets\/?$/.test(url.pathname)) return url.href;
  return '';
}

/** [p(a)] for an embed component (link text = URL), [] when it is not one. */
export function embedNodes(comp, document) {
  const href = embedUrl(comp);
  if (!href) return [];
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.textContent = href;
  const p = document.createElement('p');
  p.append(a);
  return [p];
}
