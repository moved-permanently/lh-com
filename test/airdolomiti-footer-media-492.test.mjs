/* Air Dolomiti's footer with www's own files (brief 492, brand-media-002): the section rows' arrow
   is www's arrow.4e982ebd.svg (two bars forming a ">", drawn in www's light teal #afd3d8 through it
   as a mask), not the theme's own shape (brief 474, when the file was not in the capture); the six
   social links are www's 500 x 500 discs (a white disc, the glyph in teal or cut out:
   Logo-<network>_footer.png on cms.airdolomiti.it), each by its link's host, instead of our icons
   recoloured on a white circle (their pictures stay for their names, unseen). The menu's arrow
   already carries www's path data (header-airdolomiti.js).
   Run: node --max-old-space-size=256 --test test/airdolomiti-footer-media-492.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const icon = (f) => new URL(`../icons/${f}`, import.meta.url);
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(icon(f))).digest('hex');
const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SOCIAL = [
  ['linkedin', 'linkedin.com', '27279d4c854ab2d053bb75b6d8f155257f894f1f957aceb2b2e7f8aefc76309c'],
  ['facebook', 'facebook.com', '6be215e3602c7330ef431bd74e9554391628558a7f358109624bdfe62d273c71'],
  ['instagram', 'instagram.com', '8bba2bc5d284c8d4ea808bb197ffe6bbca9e161feb0d7178fafa31b4076a2a6c'],
  ['youtube', 'youtube.com', 'f4f0e32d658461a9e2de05391cd83bef2026cfc7b45ca1f694091255428635db'],
  ['x', 'twitter.com', 'efd03da6cabe31d67bad438cf40a2cd128dc85195c7ba5e5649406d56e93e7c5'],
  ['tiktok', 'tiktok.com', '17fd045274f40e4f17ba7a8d5dc863862021df660abbcb2616d49a4c390f5ef9'],
];
const G = 'body.brand-airdolomiti footer .footer .footer-badge-group:nth-child(2)';

test('www\'s files, byte for byte: the arrow and the six discs', () => {
  assert.equal(sha('airdolomiti-arrow.svg'), '3876952284e772b37e6e257d59cdb4edb8e4b8a3a78fc085003514d45ce8167e');
  SOCIAL.forEach(([name, , hash]) => assert.equal(sha(`airdolomiti-social-${name}.png`), hash, name));
});

test('the section rows\' arrow: www\'s file as a mask in its light teal', () => {
  assert.match(css, /body\.brand-airdolomiti footer \.footer \.footer-column-toggle \.lh-icon \{ width: 25px; height: 25px; background: #afd3d8; mask: url\("\/icons\/airdolomiti-arrow\.svg"\) center \/ 25px no-repeat; transform: none; \}/);
  assert.ok(!/viewBox='0 0 21 25'/.test(css), 'the theme\'s own shape is gone');
});

test('each social link shows www\'s disc for its network, our icon kept unseen for its name', () => {
  SOCIAL.forEach(([name, host]) => {
    assert.match(css, new RegExp(`${esc(G)} a\\[href\\*="${esc(host)}"\\] \\{ background: url\\("/icons/airdolomiti-social-${name}\\.png"\\) center / 100% no-repeat; \\}`), name);
  });
  assert.match(css, new RegExp(`${esc(G)} a\\[href\\] img \\{ opacity: 0; \\}`));
});
