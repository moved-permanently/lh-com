/* eslint-disable max-len, import/extensions */
/* Discover's import (tools/importer/discover-import.mjs withLinkOuts), brief 209:
   - the security waiting times (.securitywaitingtime > .dcep-security-waiting-time, the same widget
     as lufthansa.com's) are no longer a link to the page on www: the info template's
     security-waiting-time parser makes the block (204: the empty block works for Discover's
     airports);
   - www's in-page search bar (.searchbar > .dcep-search-bar, the customer-service pages, after the
     FAQ) is dropped: the import wrote its label and placeholder as two "Enter search term" lines;
   - an iframe the embed block doesn't play is a link out as before.
   No network. Run: node --test test/discover-import-widgets.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const { withLinkOuts, LINK_OUT } = await import('../tools/importer/discover-import.mjs');

const SWT = '<div class="securitywaitingtime"><div class="dcep-security-waiting-time" data-dcep="{&quot;id&quot;: &quot;a3&quot;}" role="presentation"><div class="swt-tab-wrapper"><form novalidate><maui-select buttontriggerlabel="Select Airport"><maui-option>FRA</maui-option></maui-select></form></div></div></div>';
const SEARCHBAR = '<div class="searchbar"><div class="dcep-search-bar w-100" data-dcep="{}"><form class="w-100" role="search"><div class="selectable"><div class="input"><label for="s">Enter search term</label><input placeholder="Enter search term"></div></div></form></div></div>';

test('the security waiting times stay the widget (the parser makes the block), no link out', () => {
  const html = `<div class="container-content"><div class="text">Times</div>${SWT}</div>`;
  const out = withLinkOuts(html, '/de/en/book/travel-information/airport-info/security-check-time-slot');
  assert.equal(out, html);
  assert.ok(!out.includes(LINK_OUT));
});

test('www\'s in-page search bar is dropped, the content around it stays', () => {
  const out = withLinkOuts(`<div class="container-content"><div class="accordion">FAQ</div>${SEARCHBAR}<div class="text">After</div></div>`, '/de/en/my-bookings/manage/customer-service');
  assert.equal(out, '<div class="container-content"><div class="accordion">FAQ</div><div class="text">After</div></div>');
});

test('an iframe the embed block does not play: a link out as before', () => {
  const out = withLinkOuts('<h1>Timetable</h1><div class="iframe"><div class="iframe-wrapper"><iframe src="https://example.org/timetable" title="Timetable"></iframe></div></div>', '/de/en/x');
  assert.equal(out, `<h1>Timetable</h1><div class="iframe-link-out"><p><a href="https://${LINK_OUT}/de/en/x">Timetable</a></p></div>`);
});
