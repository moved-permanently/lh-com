/* eslint-disable max-len */
/* Air Dolomiti's cookie settings (the brief after 509, item 1; Air Dolomiti row 33): www's footer
   has "Modifica impostazioni cookie" / "Change Cookie Settings" / "Cookie-Einstellungen ändern" in
   its legal column (after the Cookie Policy), which reopens its consent banner (PrivacyLab; www's
   footer data writes it {{update-cookie-preferencies}}). The replica's consent takes a footer link
   #privacy-settings (blocks/footer: the consent.preferences event), but Air Dolomiti had no consent
   tool, so the link was left out and nothing could reopen. As Cargo (brief 422): the look-alike
   banner without OneTrust (consent: 'fallback'), with Air Dolomiti's own privacy and cookie pages
   per language; the footer builder writes the entry as the #privacy-settings link with www's label.
   Every other brand as before. Run: node --max-old-space-size=512 --test test/airdolomiti-consent-510.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { BRANDS, oneTrustId } from '../scripts/brand.js';
// eslint-disable-next-line import/extensions
import { footerColumns } from '../tools/importer/airdolomiti-nav.mjs';
import consentOn from './consent-page.js';

const meta = (values) => (name) => values[name] || '';

test('Air Dolomiti: the fallback consent (no OneTrust), its own privacy and cookie pages per language', () => {
  assert.equal(oneTrustId(meta({ brand: 'airdolomiti' })), '');
  assert.equal(BRANDS.airdolomiti.consent, 'fallback');
  assert.deepEqual(BRANDS.airdolomiti.consentLinks, {
    it: { privacy: '/informazioni-legali/privacy', cookies: 'https://www.privacylab.it/informativa.php?21671464204' },
    en: { privacy: '/en/legal-info/privacy-policy', cookies: 'https://www.privacylab.it/informativa.php?21671464204&lang=en' },
    de: { privacy: '/de/rechtliche-informationen/datenschutz', cookies: 'https://www.privacylab.it/informativa.php?21671464204&lang=de' },
  });
});

test('initConsent on Air Dolomiti: the look-alike banner without OneTrust; the footer\'s link reopens its preferences', async () => {
  const { stub, events, window } = await consentOn('airdolomiti', { hostname: 'airdolomiti.turnsthe.page' });
  assert.equal(stub, null, 'no OneTrust stub');
  assert.ok(window.document.documentElement.classList.contains('lh-consent-fallback'), 'the banner');
  assert.deepEqual(events.map((e) => [e.consented, e.groups.join()]), [[false, 'C0001']]);
  window.document.documentElement.classList.remove('lh-consent-fallback');
  window.dispatchEvent(new window.CustomEvent('consent.preferences'));
  assert.ok(window.document.documentElement.classList.contains('lh-consent-fallback'), 'the preferences again');
});

test('the footer builder: www\'s cookie-settings entry as the #privacy-settings link with www\'s label, other placeholders still left out', () => {
  const li = (url, text) => `<li><a href="${url}">${text}</a></li>`;
  const fd = {
    infoLegaliTitle: 'Info legali',
    infoLegaliLinks: [
      { url: '/informazioni-legali/privacy', text: 'Privacy Policy' },
      { url: 'https://www.privacylab.it/informativa.php?21671464204', text: 'Cookie Policy' },
      { url: '{{update-cookie-preferencies}}', text: 'Modifica impostazioni cookie' },
      { url: '{{something-else}}', text: 'Other' },
    ],
  };
  // the other columns have no links here, so only the legal column is written
  assert.equal(footerColumns(fd, li), '<h3>Info legali</h3><ul><li><a href="/informazioni-legali/privacy">Privacy Policy</a></li><li><a href="https://www.privacylab.it/informativa.php?21671464204">Cookie Policy</a></li><li><a href="#privacy-settings">Modifica impostazioni cookie</a></li></ul>');
});
