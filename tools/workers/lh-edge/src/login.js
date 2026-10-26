/**
 * www's login link, GET /service/secured/api/core/authenticate/loginPageUrl?state=<page>
 * (README "Login link"): {"loginPageUrl": "<Travel ID authorize URL>"}, built only from public
 * parameters: client id, redirect URI and scopes from the vars TRAVELID_*, country and language
 * from the X-Portal-Site and X-Portal-Language headers, state from the query (default: the
 * market's homepage). Headers as www: cache-control private, no-cache, no-store,
 * must-revalidate; access-control-allow-origin *. Without the headers www answers 500 with an
 * HTML error page; here 400 {"error":"missing-headers"}.
 */
export const LOGIN_PATH = '/service/secured/api/core/authenticate/loginPageUrl';
export const NO_STORE = 'private, no-cache, no-store, must-revalidate';

// www's values (2026-10-25), used when the vars are not set
const DEFAULTS = {
  TRAVELID_AUTHORIZE_URL: 'https://api.travelid.lufthansa.com/oauth2/authorize',
  TRAVELID_CLIENT_ID: 'yA8iz2C5BnAIf2GKKdkAlgPPW9y6wjLO',
  TRAVELID_REDIRECT_URI: 'https://www.lufthansa.com',
  TRAVELID_SCOPE: 'AUTHENTICATED IDENTIFIED urn:milesandmore:tech:background:v1:active urn:milesandmore:oauth:multifactorauthentication',
};

const v = (env, name) => String((env && env[name]) || DEFAULTS[name]).trim();

// www writes the scope with %20 and the state with its slashes, the rest as it is
const encodeScope = (s) => s.split(/\s+/).map((part) => encodeURIComponent(part).replace(/%3A/gi, ':')).join('%20');
const encodeState = (s) => encodeURIComponent(s).replace(/%2F/gi, '/');

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': NO_STORE,
      'access-control-allow-origin': '*',
      'x-lh-edge-route': 'login-url',
    },
  });
}

/** The Travel ID authorize URL of a market, language and state. */
export function loginPageUrl(env, { country, lang, state }) {
  return `${v(env, 'TRAVELID_AUTHORIZE_URL')}?client_id=${encodeURIComponent(v(env, 'TRAVELID_CLIENT_ID'))}`
    + `&response_type=code&redirect_uri=${v(env, 'TRAVELID_REDIRECT_URI')}`
    + `&scope=${encodeScope(v(env, 'TRAVELID_SCOPE'))}&state=${encodeState(state)}`
    + `&principal_type=EMAIL&reduced_state=NONE&view=login&prompt=login&country=${country}&lang=${lang}`;
}

/** The route. */
export function loginUrl(request, env) {
  const url = new URL(request.url);
  const site = String(request.headers.get('x-portal-site') || '').trim().toUpperCase();
  const lang = String(request.headers.get('x-portal-language') || '').trim().toLowerCase();
  if (String(request.headers.get('x-portal') || '').toUpperCase() !== 'LH' || !/^[A-Z]{2}$/.test(site) || !/^[a-z]{2}$/.test(lang)) {
    return json({ error: 'missing-headers' }, 400);
  }
  const state = url.searchParams.get('state') || `/${site.toLowerCase()}/${lang}/homepage`;
  return json({ loginPageUrl: loginPageUrl(env, { country: site, lang, state }) }, 200);
}
