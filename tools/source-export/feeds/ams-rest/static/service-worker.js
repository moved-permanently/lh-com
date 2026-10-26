importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js');
workbox.setConfig({
  debug: false,
});
const { NetworkOnly } = workbox.strategies;
const { registerRoute } = workbox.routing;

const CACHE_NAME = "csi-offline-cache";
const FALLBACK_HTML_URL = "/offline.html";
const networkOnly = new NetworkOnly();
const navigationHandler = async (params) => {
  try {
    if(navigator.onLine === false) {
      throw new Error("Offline");
    }
    return await networkOnly.handle(params);
  } catch (error) {
    const requestedUrl = params.url.href;
    const cached = await caches.match(requestedUrl, {
      cacheName: CACHE_NAME,
    });
    if (typeof cached !== "undefined") {
      return cached;
    } else {
      return caches.match(FALLBACK_HTML_URL, {
        cacheName: CACHE_NAME,
      });
    }
  }
};

registerRoute(({request}) => {
  return request !== undefined;
}, navigationHandler);
