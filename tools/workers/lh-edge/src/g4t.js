/**
 * Good for Train kiosks (railway stations): POST /apps/dcep/deeplink/goodfortrain/stele with the
 * form fields Country, Language, Filekey, Ticketnumber, Lastname. The answer is a small HTML
 * page that posts itself on to the kiosk page in the app view,
 * /<cc>/<ll>/common/g4t-kiosk.solo_continue, with pnrfilekey (the file key) or, without one,
 * ticketnumber, and lastname. An unknown country is de, an unknown language the market's default
 * language. Booking data: nothing is logged, nothing cached. README "Small endpoints".
 */
/* eslint-disable import/no-relative-packages */
import { LOCALES } from '../../../../scripts/locale.js';
/* eslint-enable import/no-relative-packages */
import { MARKETS } from './entry.js';
import { NO_STORE } from './login.js';

export const G4T_PATH = '/apps/dcep/deeplink/goodfortrain/stele';

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

/** The kiosk page's locale for the posted country and language. */
export function kioskLocale(country, language) {
  let cc = String(country || '').trim().toLowerCase();
  if (!Object.keys(LOCALES).some((k) => k.startsWith(`${cc}/`))) cc = 'de';
  let ll = String(language || '').trim().toLowerCase();
  if (!LOCALES[`${cc}/${ll}`]) {
    const offered = (MARKETS[cc] || []).filter((l) => LOCALES[`${cc}/${l}`]);
    ll = offered[0] || Object.keys(LOCALES).find((k) => k.startsWith(`${cc}/`)).slice(3);
  }
  return `${cc}/${ll}`;
}

async function readForm(request) {
  try {
    const form = await request.formData();
    return (name) => String(form.get(name) || form.get(name.toLowerCase()) || '').trim();
  } catch (e) {
    return () => '';
  }
}

/** The route. */
export async function g4tKiosk(request) {
  const get = await readForm(request);
  const locale = kioskLocale(get('Country'), get('Language'));
  const fields = [];
  if (get('Filekey')) fields.push(['pnrfilekey', get('Filekey')]);
  else if (get('Ticketnumber')) fields.push(['ticketnumber', get('Ticketnumber')]);
  fields.push(['lastname', get('Lastname')]);
  const action = `/${locale}/common/g4t-kiosk.solo_continue`;
  const inputs = fields.map(([n, v]) => `<input type="hidden" name="${n}" value="${escapeHtml(v)}">`).join('');
  const html = `<!DOCTYPE html><html lang="${locale.slice(3)}"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Lufthansa</title></head>`
    + `<body><form id="g4t" method="post" action="${action}">${inputs}<noscript><button type="submit">Continue</button></noscript></form>`
    + '<script>document.getElementById("g4t").submit();</script></body></html>';
  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': NO_STORE,
      'x-lh-edge-route': 'g4t-kiosk',
    },
  });
}
