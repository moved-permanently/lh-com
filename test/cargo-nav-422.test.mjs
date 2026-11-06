/* eslint-disable max-len, import/extensions */
/* Lufthansa Cargo's nav and footer documents (tools/importer/cargo-nav.mjs), brief 422: www's
   portal links (lockedIcon) with a lock (:lock: in the link text, drawn by header-bar-menu.js and
   footer.js), the menu panels' access note as the menu section's paragraph, the social links as
   icon tokens (:facebook: …) and the logo row's Lufthansa Group and IATA Cargo iQ marks as icon
   tokens (footer.js draws /icons/<name>.svg).
   Run: node --max-old-space-size=512 --test test/cargo-nav-422.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import {
  nav, footer, LABELS, SEARCH,
} from '../tools/importer/cargo-nav.mjs';
import { Page } from '../tools/importer/cargo-import.mjs';

const HOME = `<!DOCTYPE html><html><body><header id="banner"><div class="headerComponents">
<div><a id="navigationItem2-main" class="headerItem">Book &amp; Track</a><div id="navigationSubItem2" class="hide"><div class="navMenuItems">
<div class="item"><h4>Book</h4><ul><li><a href="https://www.lufthansa-cargo.com/en/dgr-booking" class="lcagLink medium lockedIcon functional">DGR request <span></span></a></li><li><a href="https://www.lufthansa-cargo.com/en/eservices/rates-conditions" class="lcagLink medium ">Rates &amp; Conditions <span></span></a></li></ul></div>
</div><div class="smallText"><div class="infoIcon"></div><span>Some services may be limited based on your access. For assistance, see <a href="/support-and-contact" class="lcagLink textOnly medium">Support &amp; Contact</a></span></div></div></div>
<a href="/en/support-and-contact" class="headerItem">contact</a></div></header>
<footer id="footer"><div class="footerLinksRow"><div class="col"><h4>Frequently used</h4><ul><li><a href="https://www.lufthansa-cargo.com/en/eservices/etracking">Track your shipment</a></li><li><a href="https://www.lufthansa-cargo.com/en/basic-information" class="lockedIcon">Book directly</a></li></ul></div></div>
<div class="legalLinks"><a href="/en/footer/bottomnav/imprint">Imprint</a><a href="#">Cookie Settings</a></div>
<div class="socialIcons"><a class="facebook" href="https://www.facebook.com/lufthansacargoag"></a><a class="linkedin" href="https://www.linkedin.com/company/lufthansa-cargo"></a></div>
<a class="brandMember" href="https://www.lufthansagroup.com"></a><a class="partnerCargoiq" href="http://www.iata.org/whatwedo/cargo/cargoiq/Pages/index.aspx"></a></footer></body></html>`;

const build = (fn) => {
  const { document } = parseHTML(HOME);
  const page = new Page('/en/home', 'en', HOME);
  return fn(document, page, { ...LABELS.en, ...SEARCH.en });
};

test('nav: www\'s locked portal links with :lock: in their text, the others as before', () => {
  const doc = build(nav);
  assert.match(doc, /<a href="https:\/\/www\.lufthansa-cargo\.com\/en\/dgr-booking">DGR request :lock:<\/a>/);
  assert.match(doc, /<a href="https:\/\/www\.lufthansa-cargo\.com\/en\/eservices\/rates-conditions">Rates &amp; Conditions<\/a>/);
});

test('nav: the panels\' access note as the menu section\'s paragraph (after its list), its link the site\'s Support & Contact', () => {
  const doc = build(nav);
  const menu = doc.split('\n').find((l) => l.includes('Book &amp; Track'));
  assert.match(menu, /<\/ul><p>:lock: Some services may be limited based on your access\. For assistance, see <a href="\/en\/support-and-contact">Support &amp; Contact<\/a><\/p><\/div>$/);
});

test('footer: locked column links with :lock:; the social links as icon tokens; the logo row\'s marks as icon tokens', () => {
  const doc = build(footer);
  assert.match(doc, /<li><a href="https:\/\/www\.lufthansa-cargo\.com\/en\/basic-information">Book directly :lock:<\/a><\/li>/);
  assert.match(doc, /<li><a href="https:\/\/www\.lufthansa-cargo\.com\/en\/eservices\/etracking">Track your shipment<\/a><\/li>/);
  assert.match(doc, /<li><a href="https:\/\/www\.facebook\.com\/lufthansacargoag">:facebook:<\/a><\/li><li><a href="https:\/\/www\.linkedin\.com\/company\/lufthansa-cargo">:linkedin:<\/a><\/li>/);
  assert.match(doc, /<li><a href="https:\/\/www\.lufthansagroup\.com">:lufthansa-group:<\/a><\/li><li><a href="https:\/\/www\.iata\.org\/whatwedo\/cargo\/cargoiq\/Pages\/index\.aspx">:iata-cargo-iq:<\/a><\/li>/);
});
