/**
 * Videos and embeds inside blocks (columns-media, carousel-cards, accordion-columns, embed).
 *
 * Video: a poster picture plus a link to an .mp4 file, optionally followed in its paragraph by
 * links to its text tracks (.vtt: "Subtitles", "Audio description"; www's closedCaptionsSrc and
 * audioDescriptionSrc) and a settings marker ("{autoplay muted loop}",
 * "{controls round-play-button}").
 * Embed: a link alone in its paragraph to a YouTube video (shown as a youtube-nocookie.com
 * player, 16:9) or to a Lufthansa in-flight entertainment widget
 * (www.lufthansa-inflightentertainment.com/.../widgets/?id=…&type=…&lang=…, 520px high, at most
 * 1240px wide, as the Lufthansa iframe component). Both load lazily, as the page scrolls to them.
 * Loaded on click (a button first, the player after it; no consent layer of its own): a Matterport
 * tour (my.matterport.com/show/?m=…, 16:9; Lufthansa Cargo) and a Mynewsdesk newsroom
 * (<newsroom>.mynewsdesk.com or www.mynewsdesk.com/…, 800px high; Cargo's newsroom). Google Maps
 * links stay links.
 * The styles are in styles/media.css (loadMediaStyles()).
 */
import { loadCSS } from './aem.js';
import { cleanText } from './block-config.js';
import { getLocale } from './locale.js';
import { trackLang } from './track-lang.js';

/** Playback settings a video link can carry (marker after the link: "{autoplay muted loop}"). */
export const VIDEO_SETTINGS = ['autoplay', 'muted', 'loop', 'controls', 'round-play-button'];
const VIDEO_MARKER = new RegExp(`\\s*\\{((?:${VIDEO_SETTINGS.join('|')})(?: (?:${VIDEO_SETTINGS.join('|')}))*)\\}\\s*$`);
/** Matches every settings marker in a text (to ignore them as text). */
export const VIDEO_MARKERS = new RegExp(VIDEO_MARKER.source.slice(0, -1), 'g');

const LABELS = {
  en: {
    video: 'Play video', youtube: 'YouTube video', 'inflight-entertainment': 'In-flight entertainment', matterport: 'Start the virtual tour', mynewsdesk: 'Show the newsroom',
  },
  de: {
    video: 'Video abspielen', youtube: 'YouTube-Video', 'inflight-entertainment': 'Bordunterhaltung', matterport: 'Virtuelle Tour starten', mynewsdesk: 'Newsroom anzeigen',
  },
};

let mediaCount = 0;

function label(key) {
  return (LABELS[getLocale().lang] || LABELS.en)[key];
}

function toUrl(href) {
  try {
    return new URL(href, window.location.href);
  } catch (e) {
    return null;
  }
}

/** Whether a link points to an .mp4 video. */
export function isVideoLink(a) {
  const url = toUrl(a.href);
  return Boolean(url) && /\.mp4$/i.test(url.pathname);
}

/** Whether a link points to a .vtt text track (subtitles, audio description). */
export function isTrackLink(a) {
  const url = toUrl(a.href);
  return Boolean(url) && /\.vtt$/i.test(url.pathname);
}

/**
 * The text tracks authored next to a video link (in its paragraph): www's closed captions
 * (kind captions) and audio description (kind descriptions: a link text or file name with
 * "audio"/"AD"). The links are removed.
 */
function takeTracks(link) {
  const p = link.closest('p');
  if (!p) return [];
  return [...p.querySelectorAll('a[href]')].filter(isTrackLink).map((a) => {
    const text = cleanText(a);
    const file = toUrl(a.href).pathname.split('/').pop();
    const description = /audio|deskription|(^|[^a-z])ad([^a-z]|$)/i.test(`${text} ${file.replace(/\.vtt$/i, '')}`);
    a.remove();
    const bare = !text || /^(https?:)?\/\/|^\//i.test(text);
    return { src: a.href, label: bare ? '' : text, kind: description ? 'descriptions' : 'captions' };
  });
}

/** Whether a link text is just its URL (DA writes bare links that way). */
export function isUrlText(a) {
  const text = cleanText(a);
  if (!text) return true;
  if (/^(https?:)?\/\//i.test(text) || text.startsWith('/')) return true;
  const url = toUrl(text);
  const target = toUrl(a.href);
  return Boolean(url && target) && url.href === target.href;
}

/** YouTube video id of a watch, share or embed URL. */
function youtubeId(url) {
  if (/(^|\.)youtu\.be$/.test(url.hostname)) return url.pathname.split('/')[1] || '';
  if (!/(^|\.)youtube(-nocookie)?\.com$/.test(url.hostname)) return '';
  const embed = url.pathname.match(/^\/(?:embed|shorts|v)\/([\w-]+)/);
  return embed ? embed[1] : (url.searchParams.get('v') || '');
}

/**
 * The embed a URL stands for: { type, src, title } or null.
 * @param {string} href
 */
export function embedFor(href) {
  const url = toUrl(href);
  if (!url || !/^https?:$/.test(url.protocol)) return null;
  const id = youtubeId(url);
  if (id) {
    const src = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
    const start = parseInt(url.searchParams.get('start') || url.searchParams.get('t') || '', 10);
    if (start > 0) src.searchParams.set('start', start);
    src.searchParams.set('color', 'white');
    src.searchParams.set('rel', '0');
    return { type: 'youtube', src: src.href };
  }
  if (url.hostname === 'www.lufthansa-inflightentertainment.com' && /\/widgets\/?$/.test(url.pathname)) {
    return { type: 'inflight-entertainment', src: url.href };
  }
  // a Matterport tour: the player starts at once after the click (play=1)
  const tour = url.hostname === 'my.matterport.com' && /^\/show\/?$/.test(url.pathname)
    && (url.searchParams.get('m') || '').match(/^[A-Za-z0-9]+$/);
  if (tour) {
    return { type: 'matterport', src: `https://my.matterport.com/show/?m=${tour[0]}&play=1`, onClick: true };
  }
  if (/(^|\.)mynewsdesk\.com$/.test(url.hostname) && url.protocol === 'https:') {
    return { type: 'mynewsdesk', src: url.href, onClick: true };
  }
  return null;
}

/** Whether a link alone in its paragraph is an embed (link text = URL or a title). */
export function isEmbedLink(a) {
  const p = a.closest('p');
  return Boolean(embedFor(a.href)) && (!p || cleanText(p) === cleanText(a));
}

/**
 * Builds the player for an embed link (a lazy iframe; Matterport and Mynewsdesk: on click).
 * @param {HTMLAnchorElement} link
 * @returns {HTMLElement|null}
 */
export function buildEmbed(link) {
  const embed = embedFor(link.href);
  if (!embed) return null;
  const wrapper = document.createElement('div');
  wrapper.className = `media-embed media-embed-${embed.type}`;
  const title = isUrlText(link) ? label(embed.type) : cleanText(link);
  const iframe = document.createElement('iframe');
  // the lazy embeds' attributes in their order of today (src, title, loading, ...)
  if (!embed.onClick) iframe.src = embed.src;
  iframe.title = title;
  if (!embed.onClick) iframe.loading = 'lazy';
  iframe.setAttribute('allowfullscreen', '');
  if (embed.type === 'youtube') {
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  }
  if (embed.type === 'matterport') iframe.allow = 'fullscreen; xr-spatial-tracking';
  if (!embed.onClick) {
    wrapper.append(iframe);
    return wrapper;
  }
  // loaded on click: a button with the link's text; the player replaces it and takes the focus
  wrapper.classList.add('media-embed-on-click');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'media-embed-load';
  button.textContent = title;
  button.addEventListener('click', () => {
    iframe.src = embed.src;
    button.replaceWith(iframe);
    wrapper.classList.add('media-embed-loaded');
    iframe.focus();
  }, { once: true });
  wrapper.append(button);
  return wrapper;
}

/**
 * Takes the settings marker that follows a video link in its paragraph; returns the settings
 * (empty: none authored).
 * @param {HTMLAnchorElement} link
 * @returns {Set<string>}
 */
function takeVideoSettings(link) {
  const p = link.closest('p') || link.parentElement;
  const nodes = p ? [...p.childNodes] : [];
  const last = nodes.filter((n) => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim()).pop();
  const match = last && nodes.indexOf(last) > nodes.findIndex((n) => n.contains(link))
    && last.nodeValue.match(VIDEO_MARKER);
  if (!match) return new Set();
  last.nodeValue = last.nodeValue.slice(0, match.index);
  return new Set(match[1].split(' '));
}

/**
 * Creates the video element for a video link.
 * @param {string} src
 * @param {HTMLImageElement} img poster
 * @param {Set<string>} settings authored settings (none: controls, loop)
 */
function createVideo(src, img, settings, tracks = []) {
  const authored = settings.size > 0;
  const video = document.createElement('video');
  // text tracks (same origin): captions and audio description in the language the file names,
  // else the page language
  tracks.forEach(({ src: trackSrc, label: trackLabel, kind }) => {
    const track = document.createElement('track');
    track.kind = kind;
    track.src = trackSrc;
    track.srclang = trackLang(trackSrc, getLocale().lang);
    if (trackLabel) track.label = trackLabel;
    video.append(track);
  });
  video.controls = !authored || settings.has('controls');
  video.loop = !authored || settings.has('loop');
  video.muted = settings.has('muted');
  if (video.muted) video.setAttribute('muted', '');
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.disablePictureInPicture = true;
  if (img) {
    video.poster = img.currentSrc || img.src;
    const w = Number(img.getAttribute('width'));
    const h = Number(img.getAttribute('height'));
    if (w && h) video.style.aspectRatio = `${w} / ${h}`;
    if (img.alt) video.setAttribute('aria-label', img.alt);
  }
  video.src = src;
  return video;
}

/** Starts a video; a refused play keeps the poster frame (and the controls, if any). */
function play(video) {
  const playing = video.play();
  if (playing && playing.catch) playing.catch(() => { /* autoplay refused */ });
}

/**
 * Turns a poster picture and an .mp4 link into a video. Settings (marker after the link):
 * "autoplay muted" without "controls" plays inline by itself, without controls, once the
 * video comes near the viewport (Lufthansa moving image; not with reduced motion: then a play
 * button); otherwise the poster shows a play button (square bottom left, "round-play-button":
 * round in the middle, video viewer) that starts the video in place. No settings: click to play
 * with controls, looping. The link (and its paragraph, when nothing else is left in it) is
 * removed; the caller places the returned element.
 * @param {HTMLAnchorElement} link video link
 * @param {Element} [picture] poster
 * @param {string} [playLabel] label of the play button when the link text is its URL
 * @returns {HTMLElement}
 */
export function buildVideo(link, picture, playLabel) {
  mediaCount += 1;
  const settings = takeVideoSettings(link);
  const tracks = takeTracks(link);
  const src = link.href;
  const buttonLabel = isUrlText(link) ? (playLabel || label('video')) : cleanText(link);
  const wrapper = document.createElement('div');
  wrapper.className = 'media-video';
  wrapper.id = `media-video-${mediaCount}`;
  if (picture) wrapper.append(picture);

  const p = link.closest('p');
  link.remove();
  if (p && !p.textContent.trim() && !p.querySelector('picture, img, a')) p.remove();

  const inline = settings.has('autoplay') && settings.has('muted') && !settings.has('controls')
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (inline) {
    wrapper.classList.add('media-video-inline');
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      const video = createVideo(src, wrapper.querySelector('img'), settings, tracks);
      video.autoplay = true;
      video.tabIndex = -1;
      video.setAttribute('aria-hidden', 'true');
      wrapper.replaceChildren(video);
      play(video);
    }, { rootMargin: '200px 0px' });
    observer.observe(wrapper);
    return wrapper;
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'media-video-play';
  if (settings.has('round-play-button')) wrapper.classList.add('media-video-round');
  button.setAttribute('aria-label', buttonLabel);
  button.setAttribute('aria-controls', wrapper.id);
  wrapper.append(button);

  button.addEventListener('click', () => {
    const video = createVideo(src, wrapper.querySelector('img'), settings, tracks);
    video.autoplay = true;
    if (!video.controls) video.addEventListener('click', () => (video.paused ? play(video) : video.pause()));
    wrapper.replaceChildren(video);
    wrapper.classList.add('media-video-playing');
    video.focus();
    play(video);
  });
  return wrapper;
}

/** Loads styles/media.css (once). */
export function loadMediaStyles() {
  return loadCSS(`${window.hlx.codeBasePath}/styles/media.css`);
}

/**
 * Running content (accordion panels): every paragraph with only a video link (and its settings
 * marker) becomes a video, the poster being the picture alone in the paragraph before it; every
 * embed link alone in its paragraph becomes the player.
 * @param {Element} root
 * @returns {Promise<void>} resolves when the media styles are loaded (at once without media)
 */
export function decorateMedia(root) {
  let found = false;
  [...root.querySelectorAll('p > a[href]')].forEach((link) => {
    const p = link.parentElement;
    if (isVideoLink(link)) {
      const clone = p.cloneNode(true);
      clone.querySelectorAll('a').forEach((a) => a.remove());
      const others = [...p.querySelectorAll('a')].filter((a) => a !== link && !isTrackLink(a));
      if (cleanText(clone).replace(VIDEO_MARKERS, '').trim() || others.length) return;
      const prev = p.previousElementSibling;
      const picture = p.querySelector('picture')
        || (prev && prev.tagName === 'P' && !cleanText(prev) && prev.children.length === 1 && prev.querySelector(':scope > picture'));
      const prevPara = picture && picture.parentElement !== p ? picture.parentElement : null;
      const anchor = document.createComment('');
      p.before(anchor);
      anchor.replaceWith(buildVideo(link, picture || null));
      if (prevPara && !prevPara.children.length) prevPara.remove();
      found = true;
    } else if (isEmbedLink(link)) {
      const embed = buildEmbed(link);
      p.replaceWith(embed);
      found = true;
    }
  });
  return found ? loadMediaStyles() : Promise.resolve();
}
