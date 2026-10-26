/**
 * www's bot check URL (AMS rest A6): POST /service/secured/api/captcha/verify with the form
 * field `token` (a Cloudflare Turnstile token; urlencoded or multipart). lh-forms checks it over
 * the service binding BOT_CHECK (entrypoint BotCheck, so the Turnstile secret stays in
 * lh-forms). Always 200 application/json {"success":true} or {"success":false}, never another
 * status: a missing token, another method, a body over 16 KB, no binding or a failed call are
 * {"success":false}. Access-Control-Allow-Origin: *. Tokens are never logged.
 */
/* eslint-disable no-console -- binding failures go to the Worker log (never the token) */
export const CAPTCHA_PATH = '/service/secured/api/captcha/verify';
const MAX_BODY = 16 * 1024;

const answer = (success) => new Response(JSON.stringify({ success }), {
  status: 200,
  headers: {
    'content-type': 'application/json',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'x-lh-edge-route': 'captcha-verify',
  },
});

/** The `token` field of a form body, or ''. */
async function tokenOf(request) {
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) return '';
  const type = (request.headers.get('content-type') || '').toLowerCase();
  try {
    if (type.includes('multipart/form-data')) {
      const value = (await request.formData()).get('token');
      return typeof value === 'string' ? value : '';
    }
    const text = await request.text();
    if (text.length > MAX_BODY) return '';
    return new URLSearchParams(text).get('token') || '';
  } catch (e) {
    return '';
  }
}

export async function captchaVerify(request, env) {
  if (request.method !== 'POST') return answer(false);
  const token = (await tokenOf(request)).trim();
  if (!token) return answer(false);
  if (!env.BOT_CHECK) {
    console.warn('captcha-verify: no BOT_CHECK binding');
    return answer(false);
  }
  try {
    const ok = await env.BOT_CHECK.verify(token, request.headers.get('CF-Connecting-IP') || '');
    return answer(ok === true);
  } catch (e) {
    console.warn(`captcha-verify: BotCheck failed (${e && e.name})`);
    return answer(false);
  }
}
