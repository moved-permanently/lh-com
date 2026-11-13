/* eslint-disable import/no-extraneous-dependencies, import/extensions, max-len -- tests */
/* TAP row 139: a heading with its description (ComponentHeadingSectionModel's headingSectionDescription) ends its
   section, style heading-section, so tap.css can give it www's 16 px to the description and 32 px to the next component
   wherever the heading sits in its wrapper (brief 388's rule covers one that opens it). A heading without a description
   is left as it is (www spaces a separate rich text 32 px under it). Auctions as the case: the page's H1 and its text,
   then "Leilões disponíveis" and its description, then a feature card.
   Run: node --max-old-space-size=256 --test test/tap-heading-section-139.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { convertPage } from '../tools/importer/tap-import.mjs';
import { sectionMarkets } from '../scripts/market-rules.js';

const para = (value) => ({ json: [{ nodeType: 'paragraph', content: [{ nodeType: 'text', value }] }] });
const page = (sections) => ({ props: { pageProps: { page: { title: 'Leilões de Upgrade', sections } } } });
const site = {
  url: 'https://www.flytap.com/pt-pt/gerir-reserva/extras/upgrades/leiloes', lang: 'pt', locale: 'pt-pt', scope: new Set(['/pt-pt/gerir-reserva/extras/upgrades/leiloes']), media: () => null, anchors: new Map(),
};
const heading = { __typename: 'ComponentHeadingModel', title: 'Leilões de Upgrade', description: para('Participe nos nossos leilões.') };
const card = { __typename: 'ComponentFeatureCardModel', size: 'large', title: 'Upgrade para Business', featureCardDescription: { plaintext: 'Descubra o prazer de viajar.' } };
// the document's top-level sections (each line one, as convertPage writes them)
const sections = (html) => html.split('\n').filter((s) => s.startsWith('<div>'));
const styleOf = (s) => (s.match(/<div><div>Style<\/div><div>([^<]*)<\/div><\/div>/) || [])[1] || null;

test('a heading with a description ends its section, style heading-section; the next component starts the next', () => {
  const html = convertPage(page([heading, { __typename: 'ComponentHeadingSectionModel', title: 'Leilões disponíveis', headingSectionDescription: para('Aproveite a oportunidade.') }, card]), site).html;
  const secs = sections(html);
  const i = secs.findIndex((s) => s.includes('Leilões disponíveis'));
  assert.ok(i >= 0);
  assert.equal(styleOf(secs[i]), 'heading-section');
  assert.match(secs[i], /Leilões disponíveis<\/h2><p>Aproveite a oportunidade\.<\/p><div class="section-metadata">/);
  assert.ok(secs[i + 1].includes('Upgrade para Business'));
  assert.equal(sectionMarkets(secs[i]), null);
});

test('a heading without a description, or an empty one: no style, no new section', () => {
  [undefined, { json: [] }].forEach((d) => {
    const html = convertPage(page([heading, { __typename: 'ComponentHeadingSectionModel', title: 'Como participar', headingSectionDescription: d }, card]), site).html;
    assert.ok(!html.includes('heading-section'));
    const secs = sections(html);
    assert.ok(secs.find((s) => s.includes('Como participar')).includes('Upgrade para Business'));
  });
});

test('tap.css: the heading-section rules, no nested :has', () => {
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  const part = css.slice(css.indexOf('/* TAP row 139'));
  const body = part.slice(part.indexOf('*/') + 2);
  assert.match(body, /main > \.section\.heading-section \{\s*margin-bottom: 32px;/);
  assert.match(body, /\.section\.heading-section > \.default-content-wrapper:last-child > h2:nth-last-child\(2\):has\(\+ p:last-child\) \{\s*margin-bottom: 16px;/);
  assert.match(body, /\.section\.heading-section \+ \.section > :first-child \{\s*margin-top: 0;/);
  [...body.matchAll(/^(body[^{]+)\{/gm)].forEach((m) => assert.doesNotMatch(m[1], /:has\([^)]*:has\(/));
});
