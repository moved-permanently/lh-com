/* eslint-disable max-len */
/* Air Dolomiti's DescritionNews without a picture (the standing order of the night of 2026-11-10, item e; AD row 101;
   airdolomiti-parity-005 /destinations/london-eu and /reiseziele/basel-de at 390 and 1440): www's text alone in its
   50vw column at 19.44 / 33 px grey, its rich-text H2 ("Unmissable London attractions") at the text's size (weight 400,
   the strong inside bold) with a blank line (33 px) under it. Ours rendered it as the section's text (22 / 37.4, the
   destinations' TitleDescriptionTextCta) across the content width; the importer now writes it as a columns-media (news)
   of one cell (tools/importer/airdolomiti-import.mjs), and the theme gives an H2 in the lead's text the text's size.
   Run: node --test test/airdolomiti-news-text-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const SEL = 'body.brand-airdolomiti .columns-media.news .columns-media-text h2';

test('an H2 in the lead\'s text at the text\'s size, a blank line under it', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  const rule = css.slice(i, css.indexOf('}', i));
  ['margin: 0 0 33px;', 'color: #494949;', 'font-size: 19.44px;', 'font-weight: 400;', 'line-height: 33px;'].forEach((d) => assert.ok(rule.includes(d), d));
});
