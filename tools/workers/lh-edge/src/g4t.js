/**
 * Good for Train kiosks (railway stations): POST /apps/dcep/deeplink/goodfortrain/stele with the
 * form fields Country, Language, Filekey, Ticketnumber, Lastname. The answer is www's: a small
 * HTML page that stores the booking pair in sessionStorage, key dcep-session-storage/<name>,
 * value the JSON string ("ABC123"): pnrfilekey and lastname, or without a file key ticketnumber
 * and lastname, nothing without a last name; then it sends the browser on to the kiosk page in
 * the app view, /<cc>/<ll>/common/g4t-kiosk.solo_continue (a plain GET, no parameters; www has
 * no such page today: the replica's 404, as www). An unknown country is de, an unknown language
 * the market's default language. Booking data: nothing is logged, nothing cached.
 */
/* eslint-disable import/no-relative-packages */
import { LOCALES } from '../../../../scripts/locale.js';
/* eslint-enable import/no-relative-packages */
import { MARKETS } from './entry.js';
import { NO_STORE } from './login.js';

export const G4T_PATH = '/apps/dcep/deeplink/goodfortrain/stele';

// a value inside the inline script: JSON, with <, > and & escaped so it cannot end the script
const scriptJson = (v) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

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

/** The sessionStorage entries www writes: [name, value] pairs (empty without a last name). */
export function kioskEntries(get) {
  const lastname = get('Lastname');
  if (!lastname) return [];
  if (get('Filekey')) return [['pnrfilekey', get('Filekey')], ['lastname', lastname]];
  if (get('Ticketnumber')) return [['ticketnumber', get('Ticketnumber')], ['lastname', lastname]];
  return [];
}

/** The route. */
export async function g4tKiosk(request) {
  const get = await readForm(request);
  const locale = kioskLocale(get('Country'), get('Language'));
  const target = `/${locale}/common/g4t-kiosk.solo_continue`;
  const store = kioskEntries(get)
    .map(([name, value]) => `sessionStorage.setItem(${scriptJson(`dcep-session-storage/${name}`)},${scriptJson(JSON.stringify(value))});`)
    .join('');
  const html = `<!DOCTYPE html><html lang="${locale.slice(3)}"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Lufthansa</title></head>`
    + `<body><script>try{${store}}catch(e){}window.location=${scriptJson(target)};</script></body></html>`;
  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': NO_STORE,
      'x-lh-edge-route': 'g4t-kiosk',
    },
  });
}
