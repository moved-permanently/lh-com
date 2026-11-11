/* eslint-disable max-len, import/extensions */
/* TAP's inspiration pages' categories as tabs (the standing order of the night of 2026-11-10, item e; TAP row 134;
   tap-parity-004, tonight's recording of /en-pt/destinations/get-inspired: www shows the categories as chips over one
   category's content at a time, 5,582 px at 1440 and 4,957 at 390; ours every category one under the other, 39,550 /
   42,994). The importer writes each category of a CategoryAccordion as a section of its own with the section metadata
   Tab (its label) and Tabs (the set), so scripts/section-tabs.js makes them one tab set (chips from 768 px, an accordion
   below it, closed on TAP); the category's heading, its accordions or fragment blocks stay in its section.
   Run: node --max-old-space-size=512 --test test/tap-inspire-tabs-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { convertPage } from '../tools/importer/tap-import.mjs';

const t = (value) => ({ nodeType: 'text', value });
const para = (...content) => ({ nodeType: 'paragraph', content });
const item = (q) => ({ __typename: 'CategoryItemModel', question: q, answer: { json: [para(t(`${q}.`))] }, sections: [] });
const nd = (categories) => ({
  props: {
    pageProps: {
      page: {
        title: 'Get inspired',
        sections: [
          { __typename: 'ComponentHeadingModel', title: 'Get inspired' },
          { __typename: 'ComponentCategoryAccordionModel', title: 'Destinations and tips not to be missed', categories },
          { __typename: 'ComponentHeadingModel', title: 'Discover what we have on offer' },
        ],
      },
    },
  },
});
const CATS = [
  { label: 'Adventure', subCategories: [{ label: 'Germany', items: [item('Munich like a fairytale')] }] },
  { label: 'Shopping', subCategories: [{ label: 'Brazil', items: [item('The best markets')] }] },
];
const site = (fragments) => ({
  url: 'https://www.flytap.com/en-pt/destinations/get-inspired', scope: new Set(), media: () => null, fragments,
});
const sections = (html) => [...parseHTML(`<html><body><main>${html}</main></body></html>`).document.querySelectorAll('main > div')];
const meta = (sec) => Object.fromEntries([...sec.querySelectorAll(':scope > .section-metadata > div')].map((r) => [r.children[0].textContent.trim(), r.children[1].textContent.trim()]));

[false, true].forEach((fragments) => {
  test(`each category a Tab section of one set, its heading and content in it (${fragments ? 'fragment blocks' : 'accordions'})`, () => {
    const r = convertPage(nd(CATS), site(fragments));
    const secs = sections(r.html);
    const tabbed = secs.filter((s) => meta(s).Tab);
    assert.deepEqual(tabbed.map((s) => meta(s).Tab), ['Adventure', 'Shopping']);
    assert.equal(new Set(tabbed.map((s) => meta(s).Tabs)).size, 1, 'one set');
    tabbed.forEach((s, i) => {
      assert.equal(s.querySelector('h2').textContent.trim(), CATS[i].label, 'the category\'s heading in its panel');
      assert.ok(s.querySelector(fragments ? '.fragment' : '.accordion-columns'), 'its content in its panel');
    });
    // what comes after the categories is no panel
    const after = secs.find((s) => /Discover what we have on offer/.test(s.textContent));
    assert.ok(after && !meta(after).Tab, 'the next heading outside the set');
    const before = secs.find((s) => /Destinations and tips not to be missed/.test(s.textContent));
    assert.ok(!before || !meta(before).Tab, 'the component\'s title outside the set');
  });
});
