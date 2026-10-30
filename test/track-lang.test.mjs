/* eslint-disable import/extensions -- the importer tooling is .mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trackLang } from '../scripts/track-lang.js';
import { withTracks } from '../tools/importer/discover-dam.mjs';

test('trackLang: the language a track file names, else the fallback', () => {
  assert.equal(trackLang('/content/dam/four_y/videos/ocean-blue-produktvideo-cc-en.vtt', 'de'), 'en');
  assert.equal(trackLang('/content/dam/four_y/videos/ocean_blue_produktvideo_ad_de.vtt', 'en'), 'de');
  assert.equal(trackLang('/content/dam/video/travel-briefing/chat-assistant-refund-lh/2025-lh-chat-assistant-refund-de-cc.vtt', 'en'), 'de');
  assert.equal(trackLang('https://lufthansa.turnsthe.page/content/dam/lh/documents/selfbagdrop-eng.vtt?x=1', 'de'), 'en');
  // the last language part counts ("fra" is a place, not a language here)
  assert.equal(trackLang('/v/200326-lh-emea-0038-partnership-ad-1hy-fra-01-cc-eng.vtt', 'de'), 'en');
  assert.equal(trackLang('/v/chicago-lhcom-sport-de.vtt', 'en'), 'de');
  // French (Discover's fr pages); "fra" stays a place (Frankfurt)
  assert.equal(trackLang('/content/dam/four_y/videos/checkinvideo_cc_fr.vtt', 'en'), 'fr');
  assert.equal(trackLang('/content/dam/four_y/videos/checkinvideo-ad-fr.vtt', 'de'), 'fr');
  assert.equal(trackLang('/v/route-fra-muc.vtt', 'de'), 'de');
  // no language in the name: the page's
  assert.equal(trackLang('/v/subtitles.vtt', 'de'), 'de');
  assert.equal(trackLang('/v/legend.vtt', 'en'), 'en');
  assert.equal(trackLang('', 'en'), 'en');
});

test('withTracks: labels in the track language', () => {
  const doc = '<p><a href="/content/dam/video/x/2025-chat-assistant-rebooking-de.mp4">Video</a> {controls}</p>';
  const tracks = {
    '/content/dam/video/x/2025-chat-assistant-rebooking-de.mp4': {
      cc: '/content/dam/video/x/2025-lh-chat-assistant-rebooking-de-cc.vtt',
      ad: '/content/dam/video/x/2025-lh-chat-assistant-rebooking-de-ad.vtt',
    },
  };
  assert.equal(
    withTracks(doc, tracks, 'en'),
    '<p><a href="/content/dam/video/x/2025-chat-assistant-rebooking-de.mp4">Video</a> <a href="/content/dam/video/x/2025-lh-chat-assistant-rebooking-de-cc.vtt">Untertitel</a> <a href="/content/dam/video/x/2025-lh-chat-assistant-rebooking-de-ad.vtt">Audiodeskription</a> {controls}</p>',
  );
  const en = '<p><a href="/v/ocean-blue-video-v06.mp4">Video</a></p>';
  assert.equal(
    withTracks(en, { '/v/ocean_blue_video_v06.mp4': { cc: '/v/ocean_blue_produktvideo_cc_en.vtt', ad: '/v/ocean_blue_produktvideo_ad_en.vtt' } }, 'en'),
    '<p><a href="/v/ocean-blue-video-v06.mp4">Video</a> <a href="/v/ocean-blue-produktvideo-cc-en.vtt">Subtitles</a> <a href="/v/ocean-blue-produktvideo-ad-en.vtt">Audio description</a></p>',
  );
  // French tracks (Discover's fr check-in page plays the English video with them)
  const fr = '<p><a href="/v/checkinvideo-en.mp4">Video</a></p>';
  assert.equal(
    withTracks(fr, { '/v/checkinvideo_en.mp4': { cc: '/v/checkinvideo_cc_fr.vtt', ad: '/v/checkinvideo_ad_fr.vtt' } }, 'fr'),
    '<p><a href="/v/checkinvideo-en.mp4">Video</a> <a href="/v/checkinvideo-cc-fr.vtt">Sous-titres</a> <a href="/v/checkinvideo-ad-fr.vtt">Audiodescription</a></p>',
  );
  // tracks already there stay
  const has = '<p><a href="/v/ocean-blue-video-v06.mp4">Video</a> <a href="/v/a.vtt">Subtitles</a></p>';
  assert.equal(withTracks(has, { '/v/ocean_blue_video_v06.mp4': { cc: '/v/b-cc-en.vtt', ad: '' } }, 'en'), has);
});
