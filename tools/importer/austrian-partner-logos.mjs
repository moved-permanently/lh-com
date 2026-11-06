/* eslint-disable max-len -- data */
/**
 * Austrian's Star Alliance partner page (lhg-staralliance-partner, every market): www gives some
 * airlines' logo links an alt text and others none, so those links had no name for a screen reader.
 * Each logo is named by its image file where the alt is empty (www's own alt texts stay); the 26
 * logos www shows: the 25 airlines and Lufthansa (whose logo links to www's /gc/fr/homepage).
 * Used by austrian-import.mjs; test/austrian-partner-logos.test.mjs.
 */
export const LOGO_NAMES = {
  'logo-aegean-airlines.jpg': 'Aegean Airlines',
  'air-canada.jpg': 'Air Canada',
  'logo-air-china.jpg': 'Air China',
  'logo-air-india.jpg': 'Air India',
  'logo-air-new-zealand.jpg': 'Air New Zealand',
  'logo-ana.jpg': 'ANA',
  'logo-asian-airlines.jpg': 'Asiana Airlines',
  'Austrian-1-4.jpg': 'Austrian Airlines',
  'lhg-avianca-logo.jpg': 'Avianca',
  'logo-brussels-airlines.jpg': 'Brussels Airlines',
  'logo-copa-airlines.jpg': 'Copa Airlines',
  'StarAlliance%20Logo%20Croatia.jpg': 'Croatia Airlines',
  'logo-egyptair.jpg': 'EgyptAir',
  'logo-ethiopian.jpg': 'Ethiopian Airlines',
  'logo-eva-air.jpg': 'EVA Air',
  'ITA%20Airways.jpg': 'ITA Airways',
  'lot-polish-airlines.jpg': 'LOT Polish Airlines',
  'logo-lufthansa-blue.jpg': 'Lufthansa',
  'logo-shenzhen-airlines.jpg': 'Shenzhen Airlines',
  'logo-singapore-airlines.jpg': 'Singapore Airlines',
  'logo-south-african-airways.jpg': 'South African Airways',
  'logo-swiss.jpg': 'SWISS',
  'logo-tap-air-portugal.jpg': 'TAP Air Portugal',
  'logo-thai.jpg': 'Thai Airways',
  'logo-turkish-airlines.jpg': 'Turkish Airlines',
  'logo-united.jpg': 'United Airlines',
};

const LOGO = /(<a href="[^"]*"><picture>(?:<source[^>]*>)*<img src="([^"]*)"[^>]*?alt=")(\s*)(")/g;

/** A document's (or snapshot's) linked logos with an empty alt get the airline's name. */
export const withPartnerLogoAlts = (html) => html.replace(LOGO, (m, head, src, alt, close) => {
  const file = src.split('.transform')[0].split('?')[0].split('/').pop();
  const name = LOGO_NAMES[file];
  return name ? `${head}${name}${close}` : m;
});
