/* eslint-disable */
/* global WebImporter */

/**
 * Parser for flight-status (Lufthansa AEM ".flightstatustimetable": dcep-flight-status widget
 * with maui-tab-control panels "flight number" / "route" / "airport").
 *
 * Output (blocks/flight-status README): 2 columns, label | value config rows, read from the DOM
 * (rows the capture does not carry are left to the block's EN/DE defaults):
 *   Tabs | panel names (comma separated) ; Active tab | the initially active panel
 *   Airline label | Airlines | Default airline       (airline maui-select)
 *   Flight number label | Flight number error         (maui-input label / errormessage)
 *   Date label | Date hint | Days before | Days after (date maui-select; the day counts come
 *                                                      from the position of the selected date)
 *   Submit label                                       (maui-button text)
 * Dates themselves are runtime data and are never authored. The widget's maui-headline (the
 * page H1) is default content and is emitted before the block table.
 */
export default function parse(element, { document, params } = {}) {
  // the source page's host (params.originalURL): Discover's pages get rows lufthansa.com's do not
  let sourceHost = '';
  try { sourceHost = new URL(params && params.originalURL).hostname; } catch (e) { sourceHost = ''; }
  const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
  const clean = (s) => (s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const c = node.cloneNode(true);
    c.querySelectorAll(SKIP).forEach((n) => n.remove());
    return clean(c.textContent);
  };
  const attr = (el, n) => clean(el && el.getAttribute(n));

  // --- page heading inside the widget -> default content before the block
  const before = [];
  const headline = element.querySelector('maui-headline, h1, h2');
  if (headline && visibleText(headline)) {
    const type = (attr(headline, 'type') || headline.tagName).toLowerCase();
    const h = document.createElement(/^h[1-6]$/.test(type) ? type : 'h1');
    h.textContent = visibleText(headline);
    before.push(h);
  }

  const cells = [];
  const panels = [...element.querySelectorAll('maui-tab-control-panel, maui-tab-control-panel-responsive, [role="tabpanel"]')]
    .filter((p) => !p.parentElement.closest('maui-tab-control-panel, maui-tab-control-panel-responsive, [role="tabpanel"]'));
  const names = panels.map((p) => attr(p, 'name') || attr(p, 'label')).filter(Boolean);
  if (names.length) cells.push(['Tabs', names.join(', ')]);
  const control = element.querySelector('maui-tab-control, maui-tab-control-responsive');
  const initial = parseInt(attr(control, 'initiallyactive'), 10);
  const activePanel = panels.find((p) => p.hasAttribute('active')) || (Number.isInteger(initial) ? panels[initial] : null);
  if (activePanel && (attr(activePanel, 'name') || attr(activePanel, 'label'))) {
    cells.push(['Active tab', attr(activePanel, 'name') || attr(activePanel, 'label')]);
  }

  const selects = [...element.querySelectorAll('maui-select, select')];
  const optionValues = (s) => [...s.querySelectorAll('maui-option, option')].map((o) => attr(o, 'optionvalue') || attr(o, 'value') || visibleText(o)).filter(Boolean);
  const isDateSelect = (s) => { const v = optionValues(s); return v.length > 0 && v.every((x) => /^\d{4}-\d{2}-\d{2}/.test(x)); };
  const airlineSelect = selects.find((s) => { const v = optionValues(s); return v.length > 0 && v.every((x) => /^[A-Z0-9]{2}$/.test(x)); });
  const dateSelect = selects.find(isDateSelect);

  if (airlineSelect) {
    if (attr(airlineSelect, 'buttontriggerlabel')) cells.push(['Airline label', attr(airlineSelect, 'buttontriggerlabel')]);
    cells.push(['Airlines', optionValues(airlineSelect).join(', ')]);
    const selectedOpt = airlineSelect.querySelector('maui-option[selected], option[selected]');
    const def = attr(airlineSelect, 'selected') || (selectedOpt && (attr(selectedOpt, 'optionvalue') || attr(selectedOpt, 'value')));
    if (def) cells.push(['Default airline', def]);
  }

  const numberInput = [...element.querySelectorAll('maui-input, input[type="text"], input:not([type])')]
    .find((i) => /flight-?number/i.test(`${i.getAttribute('id') || ''} ${i.getAttribute('name') || ''}`))
    || element.querySelector('.flightstatus-form-flightnumber maui-input, .flightstatus-form-flightnumber input');
  if (numberInput) {
    const label = attr(numberInput, 'label') || attr(numberInput, 'placeholder');
    if (label) cells.push(['Flight number label', label]);
    if (attr(numberInput, 'errormessage')) cells.push(['Flight number error', attr(numberInput, 'errormessage')]);
  }

  if (dateSelect) {
    if (attr(dateSelect, 'buttontriggerlabel')) cells.push(['Date label', attr(dateSelect, 'buttontriggerlabel')]);
    if (attr(dateSelect, 'hint')) cells.push(['Date hint', attr(dateSelect, 'hint')]);
    const values = optionValues(dateSelect);
    const selected = attr(dateSelect, 'selected')
      || attr(dateSelect.querySelector('maui-option[selected], option[selected]'), 'optionvalue');
    const idx = values.indexOf(selected);
    if (idx >= 0) {
      cells.push(['Days before', String(idx)]);
      cells.push(['Days after', String(values.length - 1 - idx)]);
    }
  }

  const submit = element.querySelector('maui-button[behavior="submit"], maui-button[type="primary"], button[type="submit"]');
  if (submit && visibleText(submit)) cells.push(['Submit label', visibleText(submit)]);
  // Discover (www.discover-airlines.com): the live page the search hands off to is the page itself
  if (sourceHost === 'www.discover-airlines.com') {
    const page = new URL(params.originalURL);
    const href = `${page.origin}${page.pathname}`;
    const link = document.createElement('a');
    link.setAttribute('href', href);
    link.textContent = href;
    cells.push(['Live page', link]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'flight-status', cells });
  element.replaceWith(...before, block);
}
