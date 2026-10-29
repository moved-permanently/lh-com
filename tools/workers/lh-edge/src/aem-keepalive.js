/**
 * Keeps the AEM sandbox awake (it hibernates after 8 hours without requests; src/dam-aem.js reads
 * its publish tier): once an hour, in the poller's run of minute KEEPALIVE_MINUTE (lh-messages'
 * minute cron calls EventsRelay.poll in both accounts: two pings an hour), one GET per URL of the
 * var AEM_KEEPALIVE_URLS (comma list; empty: off) with ?keepalive=<epoch seconds>, so no CDN or
 * dispatcher cache answers it. In ctx.waitUntil; each answer is logged
 * (`aem-keepalive <url> <status> <content-type>`), errors are logged and never reach the relay.
 */
export const KEEPALIVE_MINUTE = 17;

const urlsOf = (v) => String(v || '').split(',').map((u) => u.trim()).filter(Boolean);

/** One keep-alive GET (logged), never throwing. */
async function ping(url, now) {
  const target = new URL(url);
  target.searchParams.set('keepalive', String(Math.floor(now / 1000)));
  try {
    const resp = await fetch(target.toString(), { cache: 'no-store', redirect: 'manual' });
    if (resp.body) await resp.body.cancel().catch(() => {});
    // eslint-disable-next-line no-console -- the Worker log is the record
    console.log(`aem-keepalive ${url} ${resp.status} ${resp.headers.get('content-type') || '-'}`);
    return resp.status;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`aem-keepalive ${url} error ${e.message}`);
    return null;
  }
}

/** The pings of this run (empty outside the minute or without URLs); the promise is waited for. */
export function aemKeepAlive(env, ctx, now = Date.now()) {
  const urls = urlsOf(env.AEM_KEEPALIVE_URLS);
  if (!urls.length || new Date(now).getUTCMinutes() !== KEEPALIVE_MINUTE) return null;
  const all = Promise.all(urls.map((u) => ping(u, now)));
  if (ctx && ctx.waitUntil) ctx.waitUntil(all);
  return all;
}
