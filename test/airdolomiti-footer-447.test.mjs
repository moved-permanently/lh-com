/* eslint-disable max-len */
/* Air Dolomiti's footer from 1025 px (styles/themes/airdolomiti.css), brief 447: as www's at 1440 in
   airdolomiti-parity-001 (its Footer_* rules, from 930 px; ours switches at 1025 px as the footer
   block does), measured on the archive rendered with its own stylesheets:
   - 85 px from the sides (Footer_footer_blue's padding);
   - the four pills across the columns' width (x 443 to 1355), 69 px high;
   - the company column a quarter of the width, a faint line (rgb 255 / 10 %) 40 px after it, the
     other columns 274 px wide 40 px apart, the first 50 px after the line;
   - the links underlined, 16 / 22 px with no gap between them; headings 14 / 18 px, 16 px above
     the links; an external link's icon (20 px) 10 px after it;
   - the address 30 px after the company links, the payment logos three to a row 20 px apart;
   - the social links white circles (50 px) with the glyph in the band's teal;
   - the company line 14 / 18 px on the light grey bar across the screen.
   Run: node --test test/airdolomiti-footer-447.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const media = (() => {
  const i = css.indexOf('body.brand-airdolomiti footer .footer { --footer-surface: #00798a;');
  return css.slice(css.lastIndexOf('@media (width >= 1025px)', i), css.indexOf('body.brand-airdolomiti .flight-search .flight-search-trip-tabs'));
})();
const has = (re, msg) => assert.ok(re.test(media), msg ? `${msg}: ${re}` : String(re));
const F = 'body\\.brand-airdolomiti footer \\.footer';

test('85 px from the sides; links 16 / 22 px with no gap, underlined', () => {
  assert.match(css, /@media \(width >= 1025px\) \{[^@]*body\.brand-airdolomiti footer \{[^}]*--footer-side-margin: 85px;/);
  has(new RegExp(`${F} \\{[^}]*--footer-link-gap: 0px;[^}]*--footer-link-line-height: 22px;`));
  has(new RegExp(`${F} \\.footer-column-links a \\{[^}]*text-decoration: underline;`));
  has(new RegExp(`${F} \\.footer-column-title \\{[^}]*display: block;[^}]*margin: 0;[^}]*padding: 0;[^}]*border: 0;[^}]*line-height: 18px;`), 'the heading 18 px, 16 px above the links (the block\'s title padding, line and margin off)');
});

test('the grid: the company quarter, a 10 px spacer, three columns; the pills across the columns', () => {
  has(new RegExp(`${F} \\.footer-inner\\.has-extras \\{[^}]*grid-template-columns: calc\\(25% - 40px\\) 10px repeat\\(3, minmax\\(0, 1fr\\)\\);[^}]*column-gap: 40px;`));
  // the columns span the company rows, a flexible row takes their extra height: the company side flows as www's
  has(new RegExp(`${F} \\.footer-inner\\.has-extras \\{[^}]*'co \\. c1 c2 c3' 'addr \\. c1 c2 c3' 'pay \\. c1 c2 c3' 'pay \\. c4 c5 \\.'[^}]*grid-template-rows: auto auto auto 1fr auto auto auto;`));
  has(new RegExp(`${F} \\.footer-badge-group:nth-child\\(1\\) \\{[^}]*grid-area: pills;[^}]*justify-self: stretch;[^}]*margin: 0 0 60px -10px;`));
  has(new RegExp(`${F} \\.footer-badge-group:nth-child\\(1\\) ul \\{[^}]*justify-content: space-between;`));
  has(new RegExp(`${F} \\.footer-badge-group:nth-child\\(1\\) a\\.footer-badge-text \\{[^}]*line-height: 27px;`));
});

test('the company side: the line after it, the address 30 px under the links, the logos three a row', () => {
  has(new RegExp(`${F} :is\\(\\.footer-column:nth-child\\(1\\), \\.footer-note p:first-child, \\.footer-badge-group:nth-child\\(3\\)\\) \\{[^}]*margin-right: -40px;[^}]*padding-right: 40px;[^}]*border-right: 1px solid rgb\\(255 255 255 / 10%\\);`));
  has(new RegExp(`${F} \\.footer-badge-group:nth-child\\(3\\) ul \\{[^}]*display: grid;[^}]*grid-template-columns: repeat\\(3, 36px\\);[^}]*gap: 20px 25px;`));
});

test('the band\'s logo: www\'s logo with "Member of LUFTHANSA GROUP", 309 x 20, the document\'s image kept for the link\'s name', () => {
  has(new RegExp(`${F} \\.footer-logos a \\{[^}]*width: 309px;[^}]*height: 20px;[^}]*background: url\\('/icons/airdolomiti-footer-logo\\.svg'\\)`));
  has(new RegExp(`${F} \\.footer-logos img \\{[^}]*opacity: 0;`));
  assert.ok(fs.existsSync(new URL('../icons/airdolomiti-footer-logo.svg', import.meta.url)));
});

test('the external links\' icon, the social circles, the company line', () => {
  has(new RegExp(`${F} \\.footer-column:not\\(:first-child\\) \\.footer-column-links :is\\(a\\[target="_blank"\\], a\\[href\\$="\\.pdf"\\]\\)::after \\{[^}]*width: 20px;[^}]*height: 20px;[^}]*margin-left: 10px;`), 'external links and PDFs (www opens both elsewhere)');
  has(new RegExp(`${F} \\.footer-note p:first-child \\{[^}]*margin: 0 -40px 0 0;`), 'the address\'s line in line with the others');
  has(new RegExp(`${F} \\.footer-badge-group:nth-child\\(2\\) a \\{[^}]*border: 0;[^}]*background-color: #fff;`));
  has(new RegExp(`${F} \\.footer-note p:last-child \\{[^}]*font-size: 14px;[^}]*line-height: 18px;`));
});
